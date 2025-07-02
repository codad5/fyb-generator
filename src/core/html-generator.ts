import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { StudentData, HtmlTemplateConfig } from '../types';
import { ImageUtils } from './image-utils';

export class HtmlGenerator {
  private browser: Browser | null = null;

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async generateImage(
    studentData: StudentData,
    template: HtmlTemplateConfig,
    outputPath: string
  ): Promise<void> {
    await this.init();
    
    const page = await this.browser!.newPage();
    
    try {
      // Set viewport
      if (template.puppeteerOptions?.viewport) {
        await page.setViewport(template.puppeteerOptions.viewport);
      }

      // Process student data for template
      const processedData = await this.processStudentDataForHtml(studentData);

      // Load and compile template
      const html = await this.compileTemplate(template, processedData);

      // Set content and wait for rendering
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Wait for any additional delay
      if (template.puppeteerOptions?.delay) {
        await new Promise(resolve => setTimeout(resolve, template.puppeteerOptions?.delay));
      }

      // Wait for specific selector if specified
      if (template.puppeteerOptions?.waitForSelector) {
        await page.waitForSelector(template.puppeteerOptions.waitForSelector);
      }

      // Take screenshot
      const screenshotOptions: any = {
        path: outputPath,
        type: template.puppeteerOptions?.format || 'png'
      };

      if (template.puppeteerOptions?.quality && screenshotOptions.type === 'jpeg') {
        screenshotOptions.quality = template.puppeteerOptions.quality;
      }

      if (template.puppeteerOptions?.clip) {
        screenshotOptions.clip = template.puppeteerOptions.clip;
      } else if (template.puppeteerOptions?.fullPage) {
        screenshotOptions.fullPage = true;
      }

      await page.screenshot(screenshotOptions);

    } finally {
      await page.close();
    }
  }

  private async processStudentDataForHtml(studentData: StudentData): Promise<StudentData> {
    const processed = { ...studentData };

    // Process photo - convert to base64 if needed
    const photoInput = studentData.photoPath || studentData.photoUrl || studentData.photoBase64;
    if (photoInput) {
      const processedPhoto = await ImageUtils.processImageInput(photoInput);
      if (processedPhoto) {
        if (processedPhoto.startsWith('data:')) {
          processed.photoBase64 = processedPhoto.split(',')[1];
        } else {
          processed.photoUrl = processedPhoto;
        }
      }
    }

    return processed;
  }

  private async compileTemplate(template: HtmlTemplateConfig, data: StudentData): Promise<string> {
    // Try to load template from various locations
    const possiblePaths = [
      template.templatePath,
      path.resolve(template.templatePath),
      path.join(process.cwd(), template.templatePath),
      path.join(process.cwd(), 'src', template.templatePath),
      path.join(__dirname, '..', template.templatePath)
    ];

    let templateContent = '';
    
    for (const templatePath of possiblePaths) {
      try {
        if (await fs.pathExists(templatePath)) {
          templateContent = await fs.readFile(templatePath, 'utf8');
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    if (!templateContent) {
      // Fallback to embedded template based on template name
      templateContent = this.getEmbeddedTemplate(template);
    }

    // Compile with Handlebars
    const compiledTemplate = Handlebars.compile(templateContent);
    return compiledTemplate(data);
  }

  private getEmbeddedTemplate(template: HtmlTemplateConfig): string {
    // Return embedded templates based on name
    const rootDir = process.cwd();
    const templateFullPath = path.join(rootDir, template.templatePath);

    if (fs.existsSync(templateFullPath)) {
      return fs.readFileSync(templateFullPath, 'utf8');
    }

    throw new Error(`Template not found at ${templateFullPath}`);
  }
}
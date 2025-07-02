import * as fs from 'fs-extra';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { StudentData, SvgTemplateConfig } from '../types';
import { ImageUtils } from './image-utils';

export class SvgGenerator {
  async generateImage(
    studentData: StudentData,
    template: SvgTemplateConfig,
    outputPath: string
  ): Promise<void> {
    try {
      // Load SVG template
      const svgContent = await this.loadTemplate(template);
      
      // Process student data
      const processedData = await this.processStudentDataForSvg(studentData);
      
      // Replace placeholders
      const finalSvg = await this.replacePlaceholders(svgContent, processedData, template);
      
      // Save SVG
      if (outputPath.endsWith('.svg')) {
        await fs.writeFile(outputPath, finalSvg);
      } else {
        // Convert SVG to PNG using Sharp
        const sharp = require('sharp');
        const pngBuffer = await sharp(Buffer.from(finalSvg))
          .png()
          .toBuffer();
        await fs.writeFile(outputPath, pngBuffer);
      }
    } catch (error) {
      console.error('Error generating SVG image:', error);
      throw error;
    }
  }

  private async loadTemplate(template: SvgTemplateConfig): Promise<string> {
    const possiblePaths = [
      template.templatePath,
      path.resolve(template.templatePath),
      path.join(process.cwd(), template.templatePath),
      path.join(process.cwd(), 'src', template.templatePath),
      path.join(__dirname, '..', template.templatePath)
    ];

    for (const templatePath of possiblePaths) {
      try {
        if (await fs.pathExists(templatePath)) {
          return await fs.readFile(templatePath, 'utf8');
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Return embedded template if file not found
    return this.getEmbeddedSvgTemplate(template);
  }

  private async processStudentDataForSvg(studentData: StudentData): Promise<StudentData> {
    const processed = { ...studentData };

    // Process photo for SVG embedding
    const photoInput = studentData.photoPath || studentData.photoUrl || studentData.photoBase64;
    if (photoInput) {
      const processedPhoto = await ImageUtils.processImageInput(photoInput);
      if (processedPhoto) {
        processed.photoUrl = processedPhoto;
      }
    }

    return processed;
  }

  private async replacePlaceholders(
    svgContent: string,
    studentData: StudentData,
    template: SvgTemplateConfig
  ): Promise<string> {
    const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
    const document = dom.window.document;

    for (const placeholder of template.placeholders) {
      const element = document.getElementById(placeholder.id);
      if (!element) continue;

      const value = studentData[placeholder.field];
      if (!value) continue;

      switch (placeholder.type) {
        case 'text':
          element.textContent = String(value);
          break;
        
        case 'image':
          if (element.tagName.toLowerCase() === 'image') {
            element.setAttribute('href', String(value));
            element.setAttribute('xlink:href', String(value)); // Fallback for older browsers
          }
          break;
        
        case 'attr':
          if (placeholder.attribute) {
            element.setAttribute(placeholder.attribute, String(value));
          }
          break;
      }
    }

    return dom.serialize();
  }

  private getEmbeddedSvgTemplate(template: SvgTemplateConfig): string {
    const rootDir = process.cwd();
    const templateFullPath = path.join(rootDir, template.templatePath);

    if (fs.existsSync(templateFullPath)) {
      return fs.readFileSync(templateFullPath, 'utf8');
    }

    throw new Error(`Template not found at ${templateFullPath}`);
  }
    
}

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
      templateContent = this.getEmbeddedTemplate(template.name);
    }

    // Compile with Handlebars
    const compiledTemplate = Handlebars.compile(templateContent);
    return compiledTemplate(data);
  }

  private getEmbeddedTemplate(templateName: string): string {
    // Return embedded templates based on name
    switch (templateName) {
      case 'glamour':
        return this.getGlamourTemplate();
      case 'minimal':
        return this.getMinimalTemplate();
      default:
        return this.getGlamourTemplate(); // Default fallback
    }
  }

  private getGlamourTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - FYB</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 800px; height: 1000px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif; color: white;
            position: relative; overflow: hidden;
        }
        .glamour-card {
            position: relative; width: 100%; height: 100%;
            padding: 60px 50px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);
        }
        .decorative-bg {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .header { text-align: center; margin-bottom: 40px; position: relative; z-index: 10; }
        .name {
            font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700;
            margin-bottom: 10px; background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .nickname { font-size: 18px; font-weight: 300; opacity: 0.8; font-style: italic; }
        .content {
            display: grid; grid-template-columns: 300px 1fr; gap: 40px;
            height: calc(100% - 140px); position: relative; z-index: 10;
        }
        .photo-section { display: flex; flex-direction: column; align-items: center; }
        .photo {
            width: 250px; height: 300px; border-radius: 20px; object-fit: cover;
            border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            margin-bottom: 20px;
        }
        .photo-placeholder {
            width: 250px; height: 300px; border-radius: 20px;
            background: rgba(255,255,255,0.1); border: 4px solid rgba(255,255,255,0.3);
            display: flex; align-items: center; justify-content: center;
            color: rgba(255,255,255,0.6); font-size: 16px; margin-bottom: 20px;
        }
        .basic-info { text-align: center; }
        .department { font-size: 16px; font-weight: 600; color: #ffd700; margin-bottom: 5px; }
        .state { font-size: 14px; opacity: 0.8; }
        .details { display: flex; flex-direction: column; gap: 25px; }
        .detail-item {
            background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px;
            border-left: 4px solid #ffd700;
        }
        .detail-label {
            font-size: 12px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 1px; color: #ffd700; margin-bottom: 8px;
        }
        .detail-value { font-size: 14px; line-height: 1.5; opacity: 0.9; }
        .highlight {
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;
        }
        .footer-accent {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 4px;
            background: linear-gradient(90deg, #ff6b6b, #ffd93d, #4ecdc4, #45b7d1);
        }
    </style>
</head>
<body>
    <div class="decorative-bg"></div>
    <div class="glamour-card">
        <div class="header">
            <div class="name">{{name}}</div>
            {{#if nickname}}<div class="nickname">"{{nickname}}"</div>{{/if}}
        </div>
        
        <div class="content">
            <div class="photo-section">
                {{#if photoUrl}}
                    <img src="{{photoUrl}}" alt="{{name}}" class="photo">
                {{else if photoBase64}}
                    <img src="data:image/jpeg;base64,{{photoBase64}}" alt="{{name}}" class="photo">
                {{else}}
                    <div class="photo-placeholder">No Photo</div>
                {{/if}}
                
                <div class="basic-info">
                    <div class="department">{{department}}</div>
                    <div class="state">{{stateOfOrigin}}</div>
                </div>
            </div>
            
            <div class="details">
                <div class="detail-item">
                    <div class="detail-label">Most Challenging Course</div>
                    <div class="detail-value highlight">{{mostChallengingCourse}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Favorite Course</div>
                    <div class="detail-value">{{favoriteCourse}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Best Level</div>
                    <div class="detail-value">{{bestLevel}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Hobbies</div>
                    <div class="detail-value">{{hobbies}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Best Moment</div>
                    <div class="detail-value">{{bestMoment}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Future Plans</div>
                    <div class="detail-value">{{afterSchool}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Relationship Status</div>
                    <div class="detail-value">{{relationshipStatus}}</div>
                </div>
            </div>
        </div>
        
        <div class="footer-accent"></div>
    </div>
</body>
</html>`;
  }

  private getMinimalTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - FYB</title>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Serif:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 600px; height: 800px; background: #fafafa;
            font-family: 'IBM Plex Sans', sans-serif; color: #2c3e50;
            padding: 60px 50px; position: relative;
        }
        .minimal-card {
            height: 100%; background: white; border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 50px 40px; position: relative;
        }
        .accent-line {
            position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #3498db;
        }
        .header {
            text-align: center; margin-bottom: 40px; padding-bottom: 30px;
            border-bottom: 1px solid #ecf0f1;
        }
        .name {
            font-family: 'IBM Plex Serif', serif; font-size: 32px; font-weight: 500;
            color: #2c3e50; margin-bottom: 8px;
        }
        .department-state { font-size: 16px; color: #7f8c8d; font-weight: 400; }
        .content {
            display: grid; grid-template-columns: 200px 1fr; gap: 40px;
            height: calc(100% - 120px);
        }
        .photo-section { display: flex; flex-direction: column; align-items: center; }
        .photo {
            width: 180px; height: 220px; border-radius: 4px; object-fit: cover;
            border: 1px solid #ecf0f1; margin-bottom: 20px;
        }
        .photo-placeholder {
            width: 180px; height: 220px; border-radius: 4px; background: #ecf0f1;
            border: 1px solid #bdc3c7; display: flex; align-items: center; justify-content: center;
            color: #95a5a6; font-size: 14px; margin-bottom: 20px;
        }
        .level-hobbies { text-align: center; font-size: 12px; color: #7f8c8d; }
        .details { display: flex; flex-direction: column; gap: 25px; }
        .detail-group { border-left: 3px solid #ecf0f1; padding-left: 20px; }
        .detail-label {
            font-size: 11px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.5px; color: #95a5a6; margin-bottom: 6px;
        }
        .detail-value { font-size: 14px; line-height: 1.5; color: #2c3e50; }
        .important { border-left-color: #3498db; }
        .important .detail-value { font-weight: 500; }
        .signature {
            position: absolute; bottom: 20px; right: 30px; font-size: 10px;
            color: #bdc3c7; font-style: italic;
        }
    </style>
</head>
<body>
    <div class="minimal-card">
        <div class="accent-line"></div>
        
        <div class="header">
            <div class="name">{{name}}</div>
            <div class="department-state">{{department}} • {{stateOfOrigin}}</div>
        </div>
        
        <div class="content">
            <div class="photo-section">
                {{#if photoUrl}}
                    <img src="{{photoUrl}}" alt="{{name}}" class="photo">
                {{else if photoBase64}}
                    <img src="data:image/jpeg;base64,{{photoBase64}}" alt="{{name}}" class="photo">
                {{else}}
                    <div class="photo-placeholder">No Photo</div>
                {{/if}}
                
                <div class="level-hobbies">
                    <div><strong>{{bestLevel}}</strong></div>
                    <div>{{hobbies}}</div>
                </div>
            </div>
            
            <div class="details">
                <div class="detail-group important">
                    <div class="detail-label">Best Memory</div>
                    <div class="detail-value">{{bestMoment}}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Favorite Course</div>
                    <div class="detail-value">{{favoriteCourse}}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Most Challenging</div>
                    <div class="detail-value">{{mostChallengingCourse}}</div>
                </div>
                <div class="detail-group important">
                    <div class="detail-label">Future Plans</div>
                    <div class="detail-value">{{afterSchool}}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Relationship Status</div>
                    <div class="detail-value">{{relationshipStatus}}</div>
                </div>
            </div>
        </div>
        
        <div class="signature">Class of 2024</div>
    </div>
</body>
</html>`;
  }
}
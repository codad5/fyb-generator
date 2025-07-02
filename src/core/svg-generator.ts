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
    return this.getEmbeddedSvgTemplate(template.name);
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

  private getEmbeddedSvgTemplate(templateName: string): string {
    // Return the badge template as default
    return `<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea"/>
          <stop offset="100%" style="stop-color:#764ba2"/>
        </linearGradient>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95"/>
          <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:0.95"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <dropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect width="400" height="500" fill="url(#bgGradient)"/>
      <rect x="30" y="40" width="340" height="420" rx="20" fill="url(#cardGradient)" filter="url(#shadow)"/>
      <rect x="30" y="40" width="340" height="8" rx="20" fill="#3498db"/>
      
      <circle cx="200" cy="140" r="50" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2"/>
      <image id="student-photo" x="150" y="90" width="100" height="100" clip-path="circle(50px at 50px 50px)" href=""/>
      
      <text id="student-name" x="200" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#2c3e50">Student Name</text>
      <text id="student-department" x="200" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#7f8c8d">Department</text>
      <text id="student-state" x="200" y="265" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#95a5a6">State</text>
      
      <line x1="60" y1="285" x2="340" y2="285" stroke="#ecf0f1" stroke-width="1"/>
      
      <text x="60" y="310" font-family="Arial, sans-serif" font-size="10" fill="#95a5a6">FAVORITE COURSE</text>
      <text id="best-course" x="60" y="325" font-family="Arial, sans-serif" font-size="12" fill="#2c3e50">Course Name</text>
      
      <text x="60" y="355" font-family="Arial, sans-serif" font-size="10" fill="#95a5a6">HOBBIES</text>
      <text id="hobbies-text" x="60" y="370" font-family="Arial, sans-serif" font-size="12" fill="#2c3e50">Hobbies</text>
      
      <circle cx="80" cy="420" r="15" fill="#3498db" opacity="0.3"/>
      <circle cx="320" cy="420" r="10" fill="#e74c3c" opacity="0.3"/>
      <circle cx="350" cy="400" r="8" fill="#f39c12" opacity="0.3"/>
      
      <text x="200" y="445" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#95a5a6" opacity="0.7">FINAL YEAR BRETHREN</text>
    </svg>`;
  }
}

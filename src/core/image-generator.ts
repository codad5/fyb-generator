import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs-extra';
import * as path from 'path';
import { StudentData, TemplateConfig, TemplateField, DecorativeElement, CanvasTemplateConfig } from '../types';

export class ImageGenerator {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  constructor(private template: CanvasTemplateConfig) {
    this.canvas = createCanvas(template.width, template.height);
    this.ctx = this.canvas.getContext('2d');
  }

  async generateImage(studentData: StudentData, outputPath: string): Promise<void> {
    // Clear canvas and set background
    this.ctx.fillStyle = this.template.backgroundColor;
    this.ctx.fillRect(0, 0, this.template.width, this.template.height);

    // Draw decorative elements
    this.drawDecorativeElements();

    // Draw photo if available
    await this.drawPhoto(studentData);

    // Draw all text fields
    this.drawTextFields(studentData);

    // Save the image
    await this.saveImage(outputPath);
  }

  private drawDecorativeElements(): void {
    if (!this.template.decorativeElements) return;

    this.template.decorativeElements.forEach(element => {
      this.ctx.fillStyle = element.color || '#000';
      
      switch (element.type) {
        case 'rectangle':
          this.ctx.fillRect(element.x, element.y, element.width || 100, element.height || 100);
          break;
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(element.x, element.y, element.radius || 50, 0, 2 * Math.PI);
          this.ctx.fill();
          break;
        case 'text':
          if (element.text) {
            this.ctx.font = `${element.fontSize || 16}px Arial`;
            this.ctx.fillText(element.text, element.x, element.y);
          }
          break;
      }
    });
  }

  private async drawPhoto(studentData: StudentData): Promise<void> {
    const photoPath = studentData.photoPath || studentData.photo;
    if (!photoPath || !fs.existsSync(photoPath)) {
      // Draw placeholder if no photo
      this.drawPhotoPlaceholder();
      return;
    }

    try {
      const image = await loadImage(photoPath);
      const config = this.template.photoConfig;
      
      // Draw photo with border radius
      this.ctx.save();
      this.createRoundedRect(config.x, config.y, config.width, config.height, config.borderRadius);
      this.ctx.clip();
      
      // Draw the image to fit within the bounds
      this.ctx.drawImage(image, config.x, config.y, config.width, config.height);
      
      this.ctx.restore();
      
      // Draw border
      if (config.borderWidth > 0) {
        this.ctx.strokeStyle = config.borderColor;
        this.ctx.lineWidth = config.borderWidth;
        this.createRoundedRect(config.x, config.y, config.width, config.height, config.borderRadius);
        this.ctx.stroke();
      }
    } catch (error) {
      console.warn(`Could not load photo: ${photoPath}`, error);
      this.drawPhotoPlaceholder();
    }
  }

  private drawPhotoPlaceholder(): void {
    const config = this.template.photoConfig;
    
    // Draw placeholder background
    this.ctx.fillStyle = '#ddd';
    this.createRoundedRect(config.x, config.y, config.width, config.height, config.borderRadius);
    this.ctx.fill();
    
    // Draw placeholder text
    this.ctx.fillStyle = '#999';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No Photo', config.x + config.width / 2, config.y + config.height / 2);
    
    // Draw border
    if (config.borderWidth > 0) {
      this.ctx.strokeStyle = config.borderColor;
      this.ctx.lineWidth = config.borderWidth;
      this.createRoundedRect(config.x, config.y, config.width, config.height, config.borderRadius);
      this.ctx.stroke();
    }
  }

  private createRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private drawTextFields(studentData: StudentData): void {
    this.template.fields.forEach(field => {
      const value = studentData[field.key];
      if (!value && field.required) {
        console.warn(`Required field '${field.key}' is missing for student: ${studentData.name}`);
        return;
      }

      if (value) {
        this.drawTextField(field, `${field.label}: ${value}`);
      }
    });
  }

  private drawTextField(field: TemplateField, text: string): void {
    this.ctx.fillStyle = field.color;
    this.ctx.font = `${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
    this.ctx.textAlign = field.textAlign;

    const lines = this.wrapText(text, field.width);
    const maxLines = field.maxLines || lines.length;
    const lineHeight = field.fontSize * 1.2;

    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      const y = field.y + (i * lineHeight);
      let x = field.x;
      
      if (field.textAlign === 'center') {
        x = field.x + field.width / 2;
      } else if (field.textAlign === 'right') {
        x = field.x + field.width;
      }

      this.ctx.fillText(lines[i], x, y);
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private async saveImage(outputPath: string): Promise<void> {
    const buffer = this.canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }
}

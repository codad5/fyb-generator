import * as path from 'path';
import * as fs from 'fs-extra';
import { CSVParser } from './csv-parser';
import { ImageGenerator } from './image-generator';
import { HtmlGenerator } from './html-generator';
import { SvgGenerator } from './svg-generator';
import { getTemplate } from '../templates';
import { GenerationConfig, StudentData, TemplateConfig } from '../types';

export class FYBGenerator {
  private htmlGenerator: HtmlGenerator;
  private svgGenerator: SvgGenerator;

  constructor() {
    this.htmlGenerator = new HtmlGenerator();
    this.svgGenerator = new SvgGenerator();
  }

  async generate(config: GenerationConfig): Promise<void> {
    console.log('Starting FYB generation...');
    
    // Ensure output directory exists
    await fs.ensureDir(config.outputDir);

    // Get template
    const template = getTemplate(config.templateName);
    console.log(`Using template: ${template.name} (${template.type})`);

    // Parse CSV
    console.log('Parsing CSV...');
    const studentData = await CSVParser.parseCSV(config.csvPath, config.columnMapping);
    console.log(`Found ${studentData.length} students`);

    // Generate images based on template type
    console.log('Generating images...');
    try {
      for (let i = 0; i < studentData.length; i++) {
        const student = studentData[i];
        const sanitizedName = this.sanitizeFileName(student.name || `student_${i + 1}`);
        
        // Determine output format and extension
        const outputFormat = this.getOutputFormat(template, config.outputFormat);
        const outputPath = path.join(config.outputDir, `${sanitizedName}.${outputFormat}`);

        try {
          await this.generateSingleImage(student, template, outputPath);
          console.log(`✓ Generated: ${outputPath}`);
        } catch (error) {
          console.error(`✗ Failed to generate image for ${student.name}:`, error);
        }
      }
    } finally {
      // Cleanup resources
      await this.htmlGenerator.destroy();
    }

    console.log('Generation complete!');
  }

  private async generateSingleImage(
    studentData: StudentData,
    template: TemplateConfig,
    outputPath: string
  ): Promise<void> {
    switch (template.type) {
      case 'canvas':
        const canvasGenerator = new ImageGenerator(template);
        await canvasGenerator.generateImage(studentData, outputPath);
        break;
      
      case 'html':
        await this.htmlGenerator.generateImage(
          studentData,
          template,
          outputPath
        );
        break;
      
      case 'svg':
        await this.svgGenerator.generateImage(
          studentData,
          template,
          outputPath
        );
        break;
      
      default:
        throw new Error(`Unsupported template type: ${(template as any).type}`);
    }
  }

  private getOutputFormat(template: TemplateConfig, configFormat?: string): string {
    if (configFormat) return configFormat;
    
    switch (template.type) {
      case 'svg':
        return 'svg';
      case 'html':
        return 'png';
      case 'canvas':
      default:
        return 'png';
    }
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  async getCSVHeaders(csvPath: string): Promise<string[]> {
    return CSVParser.getCSVHeaders(csvPath);
  }

  async destroy(): Promise<void> {
    await this.htmlGenerator.destroy();
  }
}

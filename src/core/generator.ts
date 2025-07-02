import * as path from 'path';
import * as fs from 'fs-extra';
import { CSVParser } from './csv-parser';
import { ImageGenerator } from './image-generator';
import { getTemplate } from '../templates';
import { GenerationConfig, StudentData } from '../types';

export class FYBGenerator {
  async generate(config: GenerationConfig): Promise<void> {
    console.log('Starting FYB generation...');
    
    // Ensure output directory exists
    await fs.ensureDir(config.outputDir);

    // Get template
    const template = getTemplate(config.templateName);
    console.log(`Using template: ${template.name}`);

    // Parse CSV
    console.log('Parsing CSV...');
    const studentData = await CSVParser.parseCSV(config.csvPath, config.columnMapping);
    console.log(`Found ${studentData.length} students`);

    // Generate images
    console.log('Generating images...');
    for (let i = 0; i < studentData.length; i++) {
      const student = studentData[i];
      const sanitizedName = this.sanitizeFileName(student.name || `student_${i + 1}`);
      const outputPath = path.join(config.outputDir, `${sanitizedName}.png`);

      try {
        const generator = new ImageGenerator(template);
        await generator.generateImage(student, outputPath);
        console.log(`✓ Generated: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Failed to generate image for ${student.name}:`, error);
      }
    }

    console.log('Generation complete!');
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  async getCSVHeaders(csvPath: string): Promise<string[]> {
    return CSVParser.getCSVHeaders(csvPath);
  }
}
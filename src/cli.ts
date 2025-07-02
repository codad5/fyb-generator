#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FYBGenerator } from './core/generator';
import { getTemplateNames, getTemplatesByType } from './templates';
import { ColumnMapping } from './types';
import * as dotenv from 'dotenv';
dotenv.config();

const program = new Command();

program
  .name('fyb')
  .description('Final Year Brethren image generator with Canvas, HTML, and SVG support')
  .version('2.0.0');

program
  .command('generate')
  .description('Generate FYB images from CSV data')
  .requiredOption('-i, --input <path>', 'Path to CSV file')
  .requiredOption('-o, --output <path>', 'Output directory')
  .option('-t, --template <name>', 'Template name', 'default')
  .option('-f, --format <format>', 'Output format (png, jpeg, webp, svg)', 'png')
  .option('-c, --config <path>', 'Path to column mapping config file')
  .option('--name-column <name>', 'CSV column name for student name', 'name')
  .option('--photo-column <name>', 'CSV column name for photo path/URL/base64', 'photoPath')
  .option('--department-column <name>', 'CSV column name for department', 'department')
  .option('--state-column <name>', 'CSV column name for state', 'stateOfOrigin')
  .action(async (options) => {
    const generator = new FYBGenerator();
    
    try {
      let columnMapping: ColumnMapping | undefined;

      // Load column mapping from config file if provided
      if (options.config) {
        const configPath = path.resolve(options.config);
        if (await fs.pathExists(configPath)) {
          columnMapping = await fs.readJson(configPath);
        } else {
          console.error(`Config file not found: ${configPath}`);
          process.exit(1);
        }
      } else {
        // Create mapping from CLI options
        columnMapping = {
          name: options.nameColumn,
          photoPath: options.photoColumn,
          department: options.departmentColumn,
          stateOfOrigin: options.stateColumn
        };
      }

      await generator.generate({
        csvPath: path.resolve(options.input),
        outputDir: path.resolve(options.output),
        templateName: options.template,
        columnMapping,
        outputFormat: options.format
      });
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await generator.destroy();
    }
  });

program
  .command('templates')
  .description('List available templates')
  .option('-t, --type <type>', 'Filter by template type (canvas, html, svg)')
  .action((options) => {
    if (options.type) {
      const templates = getTemplatesByType(options.type);
      console.log(`Available ${options.type} templates:`);
      templates.forEach(template => {
        console.log(`  - ${template.name}: ${template.description || 'No description'}`);
      });
    } else {
      console.log('Available templates:');
      getTemplateNames().forEach(name => {
        const template = require('./templates').getTemplate(name);
        console.log(`  - ${name} (${template.type}): ${template.description || 'No description'}`);
      });
    }
  });

program
  .command('headers')
  .description('Show CSV column headers')
  .requiredOption('-i, --input <path>', 'Path to CSV file')
  .action(async (options) => {
    const generator = new FYBGenerator();
    
    try {
      const headers = await generator.getCSVHeaders(path.resolve(options.input));
      console.log('CSV Headers:');
      headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header}`);
      });
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await generator.destroy();
    }
  });

program
  .command('init-config')
  .description('Create a sample column mapping config file')
  .option('-o, --output <path>', 'Output path for config file', 'column-mapping.json')
  .action(async (options) => {
    const sampleConfig: ColumnMapping = {
      name: 'Full Name',
      nickname: 'Nickname',
      department: 'Department',
      stateOfOrigin: 'State',
      mostChallengingCourse: 'Hardest Course',
      favoriteCourse: 'Best Course',
      bestLevel: 'Favorite Level',
      hobbies: 'Hobbies',
      bestMoment: 'Best Memory',
      worstExperience: 'Worst Experience',
      afterSchool: 'Future Plans',
      relationshipStatus: 'Relationship',
      photoPath: 'Photo Path',
      photoUrl: 'Photo URL',
      photoBase64: 'Photo Base64'
    };

    await fs.writeJson(options.output, sampleConfig, { spaces: 2 });
    console.log(`Sample config created: ${options.output}`);
    console.log('Edit this file to match your CSV column names.');
    console.log('Photo fields support: file paths, URLs, or base64 data.');
  });

program.parse()
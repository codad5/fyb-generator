export { FYBGenerator } from './core/generator';
export { CSVParser } from './core/csv-parser';
export { ImageGenerator } from './core/image-generator';
export { templates, getTemplate, getTemplateNames } from './templates';
export * from './types';
import * as dotenv from 'dotenv';
dotenv.config();
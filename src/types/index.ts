export interface StudentData {
  name: string;
  nickname?: string;
  department: string;
  stateOfOrigin: string;
  mostChallengingCourse: string;
  favoriteCourse: string;
  bestLevel: string;
  hobbies: string;
  bestMoment: string;
  worstExperience: string;
  afterSchool: string;
  relationshipStatus: string;
  photoPath?: string;
  photoBase64?: string; // New: Support for base64 images
  photoUrl?: string;    // New: Support for image URLs
  [key: string]: any; // Allow additional custom fields
}

export type TemplateType = 'canvas' | 'html' | 'svg';

export interface BaseTemplateConfig {
  name: string;
  type: TemplateType;
  width: number;
  height: number;
  description?: string;
}

export interface CanvasTemplateConfig extends BaseTemplateConfig {
  type: 'canvas';
  backgroundColor: string;
  fields: TemplateField[];
  photoConfig: PhotoConfig;
  decorativeElements?: DecorativeElement[];
}

export interface HtmlTemplateConfig extends BaseTemplateConfig {
  type: 'html';
  templatePath: string; // Path to HTML template file
  stylePath?: string;   // Optional CSS file path
  customCSS?: string;   // Inline CSS
  puppeteerOptions?: PuppeteerOptions;
}

export interface SvgTemplateConfig extends BaseTemplateConfig {
  type: 'svg';
  templatePath: string; // Path to SVG template file
  placeholders: SvgPlaceholder[];
}

export type TemplateConfig = CanvasTemplateConfig | HtmlTemplateConfig | SvgTemplateConfig;

export interface PuppeteerOptions {
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number; // For JPEG
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  waitForSelector?: string;
  delay?: number; // Wait time in ms before capturing
}

export interface SvgPlaceholder {
  id: string; // ID in SVG to replace
  type: 'text' | 'image' | 'attr';
  field: string; // Field from StudentData
  attribute?: string; // For attr type (e.g., 'href', 'fill')
}

export interface TemplateField {
  key: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  maxLines?: number;
  required: boolean;
}

export interface PhotoConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

export interface DecorativeElement {
  type: 'rectangle' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color?: string;
  text?: string;
  fontSize?: number;
  imagePath?: string;
}

export interface ColumnMapping {
  [templateKey: string]: string; // Maps template field keys to CSV column names
}

export interface GenerationConfig {
  csvPath: string;
  outputDir: string;
  templateName: string;
  columnMapping?: ColumnMapping;
  photoColumnName?: string;
  nameColumnName?: string;
  outputFormat?: 'png' | 'jpeg' | 'webp' | 'svg';
}

export interface ImageProcessingOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality?: number;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  };
}

export interface BaseTemplateConfig {
  name: string;
  type: TemplateType;
  width: number;
  height: number;
  description?: string;
}

export interface CanvasTemplateConfig extends BaseTemplateConfig {
  type: 'canvas';
  backgroundColor: string;
  fields: TemplateField[];
  photoConfig: PhotoConfig;
  decorativeElements?: DecorativeElement[];
}

export interface HtmlTemplateConfig extends BaseTemplateConfig {
  type: 'html';
  templatePath: string; // Path to HTML template file
  stylePath?: string;   // Optional CSS file path
  customCSS?: string;   // Inline CSS
  puppeteerOptions?: PuppeteerOptions;
}

export interface SvgTemplateConfig extends BaseTemplateConfig {
  type: 'svg';
  templatePath: string; // Path to SVG template file
  placeholders: SvgPlaceholder[];
}

export interface PuppeteerOptions {
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number; // For JPEG
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  waitForSelector?: string;
  delay?: number; // Wait time in ms before capturing
}

export interface SvgPlaceholder {
  id: string; // ID in SVG to replace
  type: 'text' | 'image' | 'attr';
  field: string; // Field from StudentData
  attribute?: string; // For attr type (e.g., 'href', 'fill')
}

export interface TemplateField {
  key: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  maxLines?: number;
  required: boolean;
}

export interface PhotoConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

export interface DecorativeElement {
  type: 'rectangle' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color?: string;
  text?: string;
  fontSize?: number;
  imagePath?: string;
}
export interface GenerationConfig {
  csvPath: string;
  outputDir: string;
  templateName: string;
  columnMapping?: ColumnMapping;
  photoColumnName?: string;
  nameColumnName?: string;
  outputFormat?: 'png' | 'jpeg' | 'webp' | 'svg';
}

export interface ImageProcessingOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality?: number;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  };
}

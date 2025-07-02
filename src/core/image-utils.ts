import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';

export class ImageUtils {
  static async processImageInput(input: string | undefined): Promise<string | null> {
    if (!input) return null;

    try {
      // Check if it's a base64 string
      if (input.startsWith('data:image/')) {
        return input;
      }

      // Check if it's a URL
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return await this.fetchImageAsBase64(input);
      }

      // Check if it's a local file path
      if (await fs.pathExists(input)) {
        return await this.fileToBase64(input);
      }

      console.warn(`Image not found or invalid: ${input}`);
      return null;
    } catch (error) {
      console.error(`Error processing image: ${input}`, error);
      return null;
    }
  }

  private static async fetchImageAsBase64(url: string): Promise<string | null> {
    try {
      // Use native fetch (Node 18+)
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error(`Failed to fetch image from URL: ${url}`, error);
      return null;
    }
  }

  private static async fileToBase64(filePath: string): Promise<string | null> {
    try {
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      let mimeType = 'image/jpeg';
      switch (ext) {
        case '.png': mimeType = 'image/png'; break;
        case '.gif': mimeType = 'image/gif'; break;
        case '.webp': mimeType = 'image/webp'; break;
      }
      
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error(`Failed to read image file: ${filePath}`, error);
      return null;
    }
  }

  static async optimizeImage(
    input: Buffer | string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'png' | 'jpeg' | 'webp';
    } = {}
  ): Promise<Buffer> {
    let processor = sharp(input);

    if (options.width || options.height) {
      processor = processor.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    switch (options.format) {
      case 'png':
        processor = processor.png({ quality: options.quality || 90 });
        break;
      case 'webp':
        processor = processor.webp({ quality: options.quality || 85 });
        break;
      default:
        processor = processor.jpeg({ quality: options.quality || 85 });
    }

    return processor.toBuffer();
  }
}
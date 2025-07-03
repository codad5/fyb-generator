import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FYBGenerator } from './core/generator';
import { getTemplateNames, getTemplate, getTemplatesByType } from './templates';
import { ColumnMapping } from './types';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const generator = new FYBGenerator();

app.use('/', express.static('public'));
app.use(express.json());

// API endpoint to get CSV headers
app.post('/api/csv/headers', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send('No CSV file uploaded');
      return;
    }

    const headers = await generator.getCSVHeaders(req.file.path);
    
    // Clean up uploaded file
    await fs.remove(req.file.path);
    
    res.json(headers);
  } catch (error) {
    console.error('Error getting CSV headers:', error);
    res.status(500).send('Error reading CSV headers');
  }
});

// Enhanced API endpoint for image generation with full CLI support
app.post('/api/generate', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send('No CSV file uploaded');
      return;
    }

    // Extract parameters from request
    const { 
      template = 'default', 
      columnMapping = '{}', 
      format = 'png',
      outputFormat // Alternative parameter name
    } = req.body;

    // Determine output format (support both 'format' and 'outputFormat' parameters)
    const finalFormat = outputFormat || format;

    // Validate output format
    const validFormats = ['png', 'jpeg', 'webp', 'svg'];
    if (!validFormats.includes(finalFormat)) {
      res.status(400).send(`Invalid output format. Supported formats: ${validFormats.join(', ')}`);
      return;
    }

    // Validate template exists
    const templateNames = getTemplateNames();
    if (!templateNames.includes(template)) {
      res.status(400).send(`Invalid template. Available templates: ${templateNames.join(', ')}`);
      return;
    }

    // Create unique output directory
    const outputDir = path.join('public', 'generated', Date.now().toString());
    await fs.ensureDir(outputDir);

    // Parse column mapping
    let parsedMapping: ColumnMapping | undefined;
    try {
      if (columnMapping && columnMapping !== '{}') {
        parsedMapping = JSON.parse(columnMapping);
        
        // Remove empty values
        if (parsedMapping) {
          Object.keys(parsedMapping).forEach(key => {
            if (!parsedMapping?.[key] || parsedMapping[key].trim() === '') {
              delete parsedMapping?.[key];
            }
          });
        }
        
        // If no valid mappings remain, set to undefined
        if (parsedMapping && Object.keys(parsedMapping).length === 0) {
          parsedMapping = undefined;
        }
      }
    } catch (error) {
      res.status(400).send('Invalid JSON in columnMapping parameter: ' + (error as Error).message);
      return;
    }

    console.log(`Starting generation with template: ${template}, format: ${finalFormat}`);
    console.log('Column mapping:', parsedMapping);

    // Generate images using the FYBGenerator with all CLI options
    await generator.generate({
      csvPath: req.file.path,
      outputDir,
      templateName: template,
      columnMapping: parsedMapping,
      outputFormat: finalFormat
    });

    // Clean up uploaded CSV
    await fs.remove(req.file.path);

    // Count generated images based on format
    const files = await fs.readdir(outputDir);
    const imageFiles = files.filter(f => f.endsWith(`.${finalFormat}`));

    console.log(`Generation complete. Created ${imageFiles.length} images.`);

    res.json({
      success: true,
      count: imageFiles.length,
      downloadPath: `/generated/${path.basename(outputDir)}`,
      format: finalFormat,
      template: template,
      files: imageFiles
    });
  } catch (error) {
    console.error('Error generating images:', error);
    
    // Clean up uploaded file on error
    if (req.file && await fs.pathExists(req.file.path)) {
      await fs.remove(req.file.path);
    }
    
    res.status(500).send('Error generating images: ' + (error as Error).message);
  }
});

// API endpoint to get all available templates with detailed information
app.get('/api/templates', (req, res) => {
  try {
    const { type } = req.query;
    
    let templates;
    if (type && ['canvas', 'html', 'svg'].includes(type as string)) {
      // Filter by template type if specified
      templates = getTemplatesByType(type as 'canvas' | 'html' | 'svg').map(template => ({
        name: template.name || 'unnamed',
        config: template
      }));
    } else {
      // Get all templates
      templates = getTemplateNames().map(name => ({
        name,
        config: getTemplate(name)
      }));
    }

    res.json(templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).send('Error retrieving templates');
  }
});

// API endpoint to get template details by name
app.get('/api/templates/:name', (req, res) => {
  try {
    const { name } = req.params;
    const templateNames = getTemplateNames();
    
    if (!templateNames.includes(name)) {
      res.status(404).send(`Template '${name}' not found. Available templates: ${templateNames.join(', ')}`);
      return;
    }

    const template = getTemplate(name);
    res.json({
      name,
      config: template
    });
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).send('Error retrieving template');
  }
});

// API endpoint to get default column mapping configuration
app.get('/api/config/default', (req, res) => {
  const defaultConfig = {
    "name": "Full Name",
    "nickname": "Nickname",
    "department": "Department",
    "stateOfOrigin": "State",
    "mostChallengingCourse": "Hardest Course",
    "favoriteCourse": "Best Course",
    "bestLevel": "Favorite Level",
    "hobbies": "Hobbies",
    "bestMoment": "Best Memory",
    "worstExperience": "Worst Experience",
    "afterSchool": "Future Plans",
    "relationshipStatus": "Relationship",
    "photoPath": "Photo Path",
    "photoUrl": "Photo URL",
    "photoBase64": "Photo Base64"
  };
  
  res.json(defaultConfig);
});

// API endpoint to validate column mapping configuration
app.post('/api/config/validate', express.json(), (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      res.status(400).json({ 
        valid: false, 
        error: 'No configuration provided' 
      });
      return;
    }

    // Basic validation
    const requiredFields = ['name'];
    const recommendedFields = ['department', 'photoPath'];
    
    const missing = requiredFields.filter(field => !config[field]);
    const missingRecommended = recommendedFields.filter(field => !config[field]);
    
    if (missing.length > 0) {
      res.json({
        valid: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        missingRequired: missing,
        missingRecommended
      });
      return;
    }

    res.json({
      valid: true,
      message: 'Configuration is valid',
      warnings: missingRecommended.length > 0 ? 
        `Missing recommended fields: ${missingRecommended.join(', ')}` : null,
      missingRecommended
    });
  } catch (error) {
    res.status(400).json({
      valid: false,
      error: 'Invalid JSON configuration: ' + (error as Error).message
    });
  }
});

// API endpoint to get supported output formats
app.get('/api/formats', (req, res) => {
  const formats = [
    { 
      name: 'png', 
      description: 'PNG - Lossless compression, supports transparency',
      extension: 'png'
    },
    { 
      name: 'jpeg', 
      description: 'JPEG - Lossy compression, smaller file sizes',
      extension: 'jpg'
    },
    { 
      name: 'webp', 
      description: 'WebP - Modern format with excellent compression',
      extension: 'webp'
    },
    { 
      name: 'svg', 
      description: 'SVG - Vector format (only for SVG templates)',
      extension: 'svg'
    }
  ];
  
  res.json(formats);
});

// Enhanced endpoint to serve generated files with better headers
app.use('/generated', express.static('public/generated', {
  setHeaders: (res, path) => {
    // Set appropriate headers for different file types
    if (path.endsWith('.zip')) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="fyb-images.zip"');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      templates: getTemplateNames().length,
      formats: ['png', 'jpeg', 'webp', 'svg'],
      columnMapping: true,
      csvHeaders: true
    }
  });
});

// Error handling middleware
// @ts-ignore
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: (error as Error).message
  });
});

// 404 handler for API routes
// app.use('/api/*', (req, res) => {
//   res.status(404).json({
//     error: 'API endpoint not found',
//     availableEndpoints: [
//       'GET /api/templates',
//       'GET /api/templates/:name',
//       'GET /api/config/default',
//       'POST /api/config/validate',
//       'GET /api/formats',
//       'POST /api/csv/headers',
//       'POST /api/generate',
//       'GET /api/health'
//     ]
//   });
// });

const PORT = process.env.WEB_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎓 FYB Generator web server running on http://localhost:${PORT}`);
  console.log(`Available templates: ${getTemplateNames().join(', ')}`);
  console.log(`Supported formats: png, jpeg, webp, svg`);
});
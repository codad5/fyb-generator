import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FYBGenerator } from './core/generator';
import { getTemplateNames, getTemplate } from './templates';
import { ColumnMapping } from './types';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const generator = new FYBGenerator();

app.use('/', express.static('public'));
app.use(express.json());

// API endpoints
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

app.post('/api/generate', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
        res.status(400).send('No CSV file uploaded');
        return;
    }

    const { template = 'default', columnMapping = '{}' } = req.body;
    const outputDir = path.join('public', 'generated', Date.now().toString());
    
    await fs.ensureDir(outputDir);

    let parsedMapping: ColumnMapping | undefined;
    try {
      parsedMapping = JSON.parse(columnMapping);
      if (parsedMapping && Object.keys(parsedMapping).length === 0) {
        parsedMapping = undefined;
      }
    } catch (e) {
      parsedMapping = undefined;
    }

    await generator.generate({
      csvPath: req.file.path,
      outputDir,
      templateName: template,
      columnMapping: parsedMapping
    });

    // Clean up uploaded CSV
    await fs.remove(req.file.path);

    // Count generated images
    const files = await fs.readdir(outputDir);
    const imageFiles = files.filter(f => f.endsWith('.png'));

    res.json({
      success: true,
      count: imageFiles.length,
      downloadPath: `/generated/${path.basename(outputDir)}`
    });
  } catch (error) {
    console.error('Error generating images:', error);
    res.status(500).send('Error generating images: ' + (error as Error).message);
  }
});

app.get('/api/templates', (req, res) => {
  const templates = getTemplateNames().map(name => ({
    name,
    config: getTemplate(name)
  }));
  res.json(templates);
});

// Serve generated files
app.use('/generated', express.static('public/generated'));

const PORT = process.env.WEB_PORT || 3000;
app.listen(PORT, () => {
  console.log(`FYB Generator web server running on http://localhost:${PORT}`);
});
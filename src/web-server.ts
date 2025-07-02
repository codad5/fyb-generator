import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FYBGenerator } from './core/generator';
import { getTemplateNames, getTemplate } from './templates';
import { ColumnMapping } from './types';

const app = express();
const upload = multer({ dest: 'uploads/' });
const generator = new FYBGenerator();

app.use(express.static('public'));
app.use(express.json());

// Serve the main web interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FYB Generator</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background: #f4f4f4; }
            .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
            input, select, textarea { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; }
            input:focus, select:focus, textarea:focus { border-color: #007bff; outline: none; }
            .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            .btn:hover { background: #0056b3; }
            .btn-secondary { background: #6c757d; }
            .btn-secondary:hover { background: #545b62; }
            .mapping-container { display: none; }
            .mapping-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
            .mapping-row input { flex: 1; }
            .progress { display: none; background: #e9ecef; border-radius: 5px; height: 20px; margin: 20px 0; }
            .progress-bar { background: #007bff; height: 100%; border-radius: 5px; transition: width 0.3s; }
            .results { display: none; }
            .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .success { color: #155724; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .template-preview { display: flex; gap: 20px; flex-wrap: wrap; }
            .template-card { border: 2px solid #ddd; border-radius: 8px; padding: 15px; cursor: pointer; text-align: center; min-width: 200px; }
            .template-card.selected { border-color: #007bff; background: #e7f3ff; }
            .template-card h3 { color: #333; margin-bottom: 10px; }
            .template-specs { font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 FYB Generator</h1>
                <p>Generate Final Year Brethren images from CSV data</p>
            </div>

            <div class="card">
                <h2>Upload CSV & Generate Images</h2>
                <form id="uploadForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="csvFile">CSV File:</label>
                        <input type="file" id="csvFile" name="csvFile" accept=".csv" required>
                        <small>Upload a CSV file containing student data</small>
                    </div>

                    <div class="form-group">
                        <label for="template">Template:</label>
                        <select id="template" name="template">
                            <option value="default">Default Template</option>
                            <option value="modern">Modern Template</option>
                        </select>
                    </div>

                    <div class="template-preview" id="templatePreview">
                        <div class="template-card selected" data-template="default">
                            <h3>Default</h3>
                            <div class="template-specs">800x1000px<br>Light theme<br>Comprehensive fields</div>
                        </div>
                        <div class="template-card" data-template="modern">
                            <h3>Modern</h3>
                            <div class="template-specs">600x800px<br>Dark theme<br>Minimal design</div>
                        </div>
                    </div>

                    <div class="form-group">
                        <button type="button" class="btn btn-secondary" onclick="showColumnMapping()">
                            📋 Configure Column Mapping
                        </button>
                        <small>Map your CSV columns to template fields</small>
                    </div>

                    <div class="mapping-container" id="mappingContainer">
                        <h3>Column Mapping</h3>
                        <p>Map your CSV column names to the template fields:</p>
                        <div id="mappingFields"></div>
                        <button type="button" class="btn btn-secondary" onclick="loadCSVHeaders()">
                            🔄 Load CSV Headers
                        </button>
                    </div>

                    <button type="submit" class="btn">🚀 Generate Images</button>
                </form>

                <div class="progress" id="progress">
                    <div class="progress-bar" id="progressBar"></div>
                </div>

                <div id="results" class="results"></div>
            </div>

            <div class="card">
                <h2>📝 Sample CSV Format</h2>
                <p>Your CSV should include these columns (or use column mapping):</p>
                <textarea readonly rows="10">name,nickname,department,stateOfOrigin,mostChallengingCourse,favoriteCourse,bestLevel,hobbies,bestMoment,worstExperience,afterSchool,relationshipStatus,photoPath
John Doe,Johnny,Computer Science,Lagos,Data Structures,Web Development,300 Level,Gaming and Coding,Graduating with First Class,Failed CSC 301 twice,Software Engineering,Single,/path/to/photo.jpg
Jane Smith,Janey,Electrical Engineering,Abuja,Circuit Analysis,Digital Electronics,400 Level,Reading and Dancing,Meeting my best friends,Lab equipment malfunction,Hardware Design,In a relationship,/path/to/jane.jpg</textarea>
                <small>Note: photoPath should contain the full path to student photos</small>
            </div>
        </div>

        <script>
            let csvHeaders = [];
            const templateFields = {
                default: ['name', 'nickname', 'department', 'stateOfOrigin', 'mostChallengingCourse', 'favoriteCourse', 'bestLevel', 'hobbies', 'bestMoment', 'worstExperience', 'afterSchool', 'relationshipStatus'],
                modern: ['name', 'department', 'stateOfOrigin', 'hobbies', 'bestMoment', 'afterSchool']
            };

            // Template selection
            document.querySelectorAll('.template-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    document.getElementById('template').value = card.dataset.template;
                    updateMappingFields();
                });
            });

            function showColumnMapping() {
                const container = document.getElementById('mappingContainer');
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
                if (container.style.display === 'block') {
                    updateMappingFields();
                }
            }

            function updateMappingFields() {
                const template = document.getElementById('template').value;
                const fields = templateFields[template] || templateFields.default;
                const container = document.getElementById('mappingFields');
                
                container.innerHTML = fields.map(field => 
                    '<div class="mapping-row">' +
                    '<label>' + field + ':</label>' +
                    '<input type="text" name="mapping_' + field + '" placeholder="CSV column name for ' + field + '" value="' + field + '">' +
                    '</div>'
                ).join('');
            }

            async function loadCSVHeaders() {
                const fileInput = document.getElementById('csvFile');
                if (!fileInput.files[0]) {
                    alert('Please select a CSV file first');
                    return;
                }

                const formData = new FormData();
                formData.append('csvFile', fileInput.files[0]);

                try {
                    const response = await fetch('/api/csv/headers', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        csvHeaders = await response.json();
                        populateColumnDropdowns();
                    } else {
                        throw new Error('Failed to load CSV headers');
                    }
                } catch (error) {
                    showError('Error loading CSV headers: ' + error.message);
                }
            }

            function populateColumnDropdowns() {
                const mappingInputs = document.querySelectorAll('[name^="mapping_"]');
                mappingInputs.forEach(input => {
                    const originalValue = input.value;
                    input.outerHTML = '<select name="' + input.name + '">' +
                        '<option value="">-- Select Column --</option>' +
                        csvHeaders.map(header => 
                            '<option value="' + header + '"' + (header === originalValue ? ' selected' : '') + '>' + header + '</option>'
                        ).join('') +
                        '</select>';
                });
            }

            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData();
                const fileInput = document.getElementById('csvFile');
                
                if (!fileInput.files[0]) {
                    showError('Please select a CSV file');
                    return;
                }

                formData.append('csvFile', fileInput.files[0]);
                formData.append('template', document.getElementById('template').value);

                // Add column mapping
                const mapping = {};
                document.querySelectorAll('[name^="mapping_"]').forEach(input => {
                    const field = input.name.replace('mapping_', '');
                    if (input.value) {
                        mapping[field] = input.value;
                    }
                });
                formData.append('columnMapping', JSON.stringify(mapping));

                showProgress();
                
                try {
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        showSuccess('Images generated successfully! Generated ' + result.count + ' images.');
                        showDownloadLink(result.downloadPath);
                    } else {
                        const error = await response.text();
                        throw new Error(error);
                    }
                } catch (error) {
                    showError('Error: ' + error.message);
                } finally {
                    hideProgress();
                }
            });

            function showProgress() {
                document.getElementById('progress').style.display = 'block';
                document.getElementById('progressBar').style.width = '100%';
            }

            function hideProgress() {
                document.getElementById('progress').style.display = 'none';
            }

            function showError(message) {
                const results = document.getElementById('results');
                results.innerHTML = '<div class="error">' + message + '</div>';
                results.style.display = 'block';
            }

            function showSuccess(message) {
                const results = document.getElementById('results');
                results.innerHTML = '<div class="success">' + message + '</div>';
                results.style.display = 'block';
            }

            function showDownloadLink(path) {
                const results = document.getElementById('results');
                results.innerHTML += '<div class="success"><a href="' + path + '" class="btn">📥 Download Generated Images</a></div>';
            }

            // Initialize
            updateMappingFields();
        </script>
    </body>
    </html>
  `);
});

// API endpoints
app.post('/api/csv/headers', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No CSV file uploaded');
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
      return res.status(400).send('No CSV file uploaded');
    }

    const { template = 'default', columnMapping = '{}' } = req.body;
    const outputDir = path.join('public', 'generated', Date.now().toString());
    
    await fs.ensureDir(outputDir);

    let parsedMapping: ColumnMapping | undefined;
    try {
      parsedMapping = JSON.parse(columnMapping);
      if (Object.keys(parsedMapping).length === 0) {
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
    res.status(500).send('Error generating images: ' + error.message);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FYB Generator web server running on http://localhost:${PORT}`);
});
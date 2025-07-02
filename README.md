# FYB Generator 🎓

A TypeScript-based Final Year Brethren image generator that creates personalized yearbook-style images from CSV data.

## Features

- 🚀 **CLI Interface**: Command-line tool for batch generation
- 🌐 **Web Interface**: User-friendly web app with drag-and-drop
- 🎨 **Multiple Templates**: Customizable design templates
- 📊 **CSV Integration**: Easy data import from spreadsheets
- 🔧 **Column Mapping**: Flexible field mapping system
- 📱 **Responsive Design**: Works on desktop and mobile
- 🖼️ **Photo Support**: Automatic photo integration
- ⚡ **TypeScript**: Full type safety and modern development

## Quick Start

### Installation

```bash
npm install fyb-generator
# or
git clone <repository>
cd fyb-generator
npm install
npm run build
```

### CLI Usage

```bash
# Basic usage
fyb generate -i students.csv -o ./output

# With custom template
fyb generate -i students.csv -o ./output -t modern

# With column mapping
fyb generate -i students.csv -o ./output -c column-mapping.json

# With individual column mapping
fyb generate -i students.csv -o ./output --name-column "Full Name" --department-column "Course"

# List available templates
fyb templates

# View CSV headers
fyb headers -i students.csv

# Create sample config file
fyb init-config -o my-mapping.json
```

### Web Interface

```bash
# Start web server
npm run web
# or
node dist/web-server.js

# Open http://localhost:3000
```

## CSV Format

Your CSV should include these columns (or use column mapping):

```csv
name,nickname,department,stateOfOrigin,mostChallengingCourse,favoriteCourse,bestLevel,hobbies,bestMoment,worstExperience,afterSchool,relationshipStatus,photoPath
John Doe,Johnny,Computer Science,Lagos,Data Structures,Web Development,300 Level,Gaming and Coding,Graduating with First Class,Failed CSC 301 twice,Software Engineering,Single,./photos/john.jpg
Jane Smith,Janey,Electrical Engineering,Abuja,Circuit Analysis,Digital Electronics,400 Level,Reading and Dancing,Meeting my best friends,Lab equipment malfunction,Hardware Design,In a relationship,./photos/jane.jpg
```

### Required vs Optional Fields

**Required Fields:**
- `name`: Student's full name
- `department`: Academic department
- `stateOfOrigin`: State of origin
- `mostChallengingCourse`: Most difficult course
- `favoriteCourse`: Favorite course
- `bestLevel`: Best academic level
- `hobbies`: Personal hobbies
- `bestMoment`: Best memory in school
- `worstExperience`: Worst experience
- `afterSchool`: Future plans
- `relationshipStatus`: Current relationship status

**Optional Fields:**
- `nickname`: Student nickname
- `photoPath`: Path to student photo

## Templates

### Default Template
- **Size**: 800x1000px
- **Style**: Light theme with comprehensive field layout
- **Best for**: Detailed student profiles

### Modern Template
- **Size**: 600x800px
- **Style**: Dark theme with minimal design
- **Best for**: Clean, contemporary look

## Column Mapping

### Using Config File

Create a `column-mapping.json` file:

```json
{
  "name": "Full Name",
  "nickname": "Nickname",
  "department": "Course of Study",
  "stateOfOrigin": "State",
  "mostChallengingCourse": "Hardest Course",
  "favoriteCourse": "Best Course",
  "bestLevel": "Favorite Level",
  "hobbies": "Personal Interests",
  "bestMoment": "Best Memory",
  "worstExperience": "Worst Experience",
  "afterSchool": "Future Plans",
  "relationshipStatus": "Relationship Status",
  "photoPath": "Photo File Path"
}
```

### Using CLI Flags

```bash
fyb generate -i data.csv -o output \
  --name-column "Full Name" \
  --department-column "Course" \
  --state-column "State" \
  --photo-column "Photo Path"
```

## Creating Custom Templates

```typescript
import { TemplateConfig } from 'fyb-generator';

const customTemplate: TemplateConfig = {
  name: 'custom',
  width: 800,
  height: 1000,
  backgroundColor: '#ffffff',
  photoConfig: {
    x: 50,
    y: 100,
    width: 200,
    height: 250,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#333333'
  },
  fields: [
    {
      key: 'name',
      label: 'Name',
      x: 50,
      y: 50,
      width: 700,
      height: 40,
      fontSize: 28,
      fontFamily: 'Arial',
      color: '#2c3e50',
      textAlign: 'left',
      fontWeight: 'bold',
      required: true
    }
    // Add more fields...
  ],
  decorativeElements: [
    {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 800,
      height: 10,
      color: '#3498db'
    }
  ]
};
```

## Photo Management

Photos should be:
- **Formats**: JPG, PNG, GIF
- **Size**: Any size (will be automatically resized)
- **Path**: Relative or absolute paths in CSV
- **Missing**: Automatic placeholder generation

Example photo paths in CSV:
```csv
photoPath
./photos/john_doe.jpg
/absolute/path/to/jane.jpg
../images/student_photos/mike.png
```

## API Reference

### Core Classes

#### FYBGenerator
```typescript
const generator = new FYBGenerator();

// Generate images
await generator.generate({
  csvPath: 'students.csv',
  outputDir: './output',
  templateName: 'default',
  columnMapping: { name: 'Full Name' }
});

// Get CSV headers
const headers = await generator.getCSVHeaders('students.csv');
```

#### ImageGenerator
```typescript
const template = getTemplate('default');
const generator = new ImageGenerator(template);
await generator.generateImage(studentData, 'output.png');
```

#### CSVParser
```typescript
const students = await CSVParser.parseCSV('data.csv', columnMapping);
const headers = await CSVParser.getCSVHeaders('data.csv');
```

## Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run development server
npm run dev

# Start web interface
npm run web

# Run CLI in development
npm run cli -- generate -i sample.csv -o output
```

## Troubleshooting

### Common Issues

1. **"Required field missing"**
   - Ensure all required fields are present in CSV
   - Check column mapping configuration

2. **"Photo not found"**
   - Verify photo paths in CSV are correct
   - Ensure photo files exist at specified locations

3. **"Canvas/Image errors"**
   - Install canvas dependencies: `npm install canvas`
   - On Ubuntu: `sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++`

4. **"Permission denied"**
   - Ensure output directory has write permissions
   - Check file paths are accessible

### Performance Tips

- Use compressed photos (< 2MB each)
- Limit CSV to reasonable batch sizes (< 1000 students)
- Use SSD storage for faster I/O operations

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Support

- 📧 Email: support@fyb-generator.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: README.md
- 💡 Feature Requests: GitHub Discussions

// Updated README.md - Extended Documentation
# FYB Generator 2.0 🎓

A comprehensive TypeScript-based Final Year Brethren image generator that creates personalized yearbook-style images from CSV data. Now supports **Canvas**, **HTML**, and **SVG** template engines!

## ✨ New Features in 2.0

- 🎨 **Multiple Template Engines**: Canvas (Node Canvas), HTML (Puppeteer), SVG (JSDOM)
- 🖼️ **Enhanced Photo Support**: File paths, URLs, and Base64 data
- 🌐 **Advanced HTML Templates**: Modern web fonts, CSS Grid, gradients, and animations
- 📐 **SVG Templates**: Scalable vector graphics with programmatic content replacement
- 🔧 **Improved CLI**: Better template management and format options
- 🚀 **Performance**: Optimized image processing with Sharp

## Template Types

### 🎭 Canvas Templates
- **Technology**: Node.js Canvas API
- **Best for**: Precise pixel control, custom graphics
- **Performance**: Fast rendering, low memory usage
- **Templates**: `default`, `modern`

### 🌐 HTML Templates  
- **Technology**: Puppeteer (Headless Chrome)
- **Best for**: Modern design, web fonts, complex layouts
- **Features**: CSS Grid, Flexbox, gradients, shadows, web fonts
- **Templates**: `glamour`, `minimal`

### 📐 SVG Templates
- **Technology**: JSDOM + Sharp
- **Best for**: Scalable graphics, print quality
- **Features**: Vector graphics, unlimited scaling, small file sizes
- **Templates**: `badge`

## Installation & Setup

```bash
# Clone and install
git clone <repository>
cd fyb-generator
npm install

# Build the project
npm run build

# Install global CLI (optional)
npm link
```

## Quick Start Examples

### CLI Usage

```bash
# Canvas template (classic)
fyb generate -i students.csv -o ./output -t default

# HTML template with modern design
fyb generate -i students.csv -o ./output -t glamour -f png

# SVG template for print quality
fyb generate -i students.csv -o ./output -t badge -f svg

# Custom column mapping
fyb generate -i data.csv -o ./output -t minimal \
  --name-column "Full Name" \
  --photo-column "Photo URL" \
  --department-column "Course"
```

### Web Interface

```bash
npm run web
# Open http://localhost:3000
```

The web interface now supports:
- Template preview with type indicators
- Real-time column mapping
- Photo format detection (file/URL/base64)
- Template-specific options

## Photo Support

The generator now supports multiple photo input formats:

### CSV Column Options
```csv
photoPath,photoUrl,photoBase64
./photos/john.jpg,https://example.com/jane.jpg,data:image/jpeg;base64,/9j/4AAQ...
```

### Supported Sources
- **Local Files**: `./photos/student.jpg`, `/absolute/path/image.png`
- **URLs**: `https://example.com/photo.jpg`
- **Base64**: `data:image/jpeg;base64,<data>` or just the base64 string

## Template Details

### Canvas Templates

#### Default Template
```typescript
// 800x1000px, comprehensive layout
{
  name: 'default',
  type: 'canvas',
  width: 800,
  height: 1000,
  // Supports all student fields with precise positioning
}
```

#### Modern Template  
```typescript
// 600x800px, dark theme, minimal fields
{
  name: 'modern', 
  type: 'canvas',
  width: 600,
  height: 800,
  backgroundColor: '#1a1a1a'
  // Focused on essential information
}
```

### HTML Templates

#### Glamour Template
```html
<!-- Luxury design with gradients and glassmorphism -->
<div class="glamour-card">
  <!-- Modern CSS with backdrop-filter, gradients -->
  <!-- Google Fonts: Playfair Display + Inter -->
  <!-- Responsive grid layout -->
</div>
```

#### Minimal Template
```html
<!-- Clean typography-focused design -->
<div class="minimal-card">
  <!-- IBM Plex fonts, minimal color palette -->
  <!-- Clean lines and professional layout -->
</div>
```

### SVG Templates

#### Badge Template
```svg
<!-- Scalable badge design -->
<svg width="400" height="500">
  <!-- Vector graphics with gradients -->
  <!-- Text and image placeholders -->
  <!-- Print-ready quality -->
</svg>
```

## Creating Custom Templates

### Canvas Template
```typescript
import { CanvasTemplateConfig } from 'fyb-generator';

const customCanvas: CanvasTemplateConfig = {
  name: 'custom-canvas',
  type: 'canvas',
  width: 800,
  height: 1000,
  backgroundColor: '#ffffff',
  photoConfig: {
    x: 50, y: 100,
    width: 200, height: 250,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#333'
  },
  fields: [
    {
      key: 'name',
      label: 'Name',
      x: 50, y: 50,
      width: 700, height: 40,
      fontSize: 28,
      fontFamily: 'Arial',
      color: '#2c3e50',
      textAlign: 'left',
      fontWeight: 'bold',
      required: true
    }
    // Add more fields...
  ]
};
```

### HTML Template
```typescript
const customHtml: HtmlTemplateConfig = {
  name: 'custom-html',
  type: 'html', 
  width: 800,
  height: 1000,
  templatePath: 'templates/custom.hbs',
  puppeteerOptions: {
    viewport: { width: 800, height: 1000, deviceScaleFactor: 2 },
    format: 'png',
    delay: 1000
  }
};
```

Create `templates/custom.hbs`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 800px; height: 1000px; /* styles */ }
  </style>
</head>
<body>
  <div class="card">
    <h1>{{name}}</h1>
    <p>{{department}}</p>
    {{#if photoUrl}}
      <img src="{{photoUrl}}" alt="{{name}}">
    {{/if}}
  </div>
</body>
</html>
```

### SVG Template
```typescript
const customSvg: SvgTemplateConfig = {
  name: 'custom-svg',
  type: 'svg',
  width: 400,
  height: 500,
  templatePath: 'templates/custom.svg',
  placeholders: [
    { id: 'student-name', type: 'text', field: 'name' },
    { id: 'student-photo', type: 'image', field: 'photoUrl' },
    { id: 'department-text', type: 'text', field: 'department' }
  ]
};
```

## Advanced CLI Usage

### Template Management
```bash
# List all templates
fyb templates

# List by type
fyb templates --type html
fyb templates --type canvas  
fyb templates --type svg

# Template info with descriptions
fyb templates
# Output:
# - default (canvas): Classic canvas-based template
# - glamour (html): Glamorous HTML template with gradients
# - badge (svg): Badge-style SVG template
```

### Column Mapping
```bash
# Create sample config
fyb init-config -o mapping.json

# Use config file
fyb generate -i data.csv -o output -c mapping.json

# Direct mapping
fyb generate -i data.csv -o output \
  --name-column "Student Name" \
  --photo-column "Image URL" \
  --department-column "Faculty"
```

### Output Formats
```bash
# PNG (default)
fyb generate -i data.csv -o output -f png

# JPEG (smaller file size)
fyb generate -i data.csv -o output -f jpeg

# WebP (modern format)
fyb generate -i data.csv -o output -f webp

# SVG (for SVG templates)
fyb generate -i data.csv -o output -t badge -f svg
```

## Performance & Optimization

### Batch Processing
```typescript
// Process large datasets efficiently
const generator = new FYBGenerator();

try {
  await generator.generate({
    csvPath: 'large-dataset.csv',
    outputDir: './output',
    templateName: 'glamour'
  });
} finally {
  // Always cleanup resources
  await generator.destroy();
}
```

### Photo Optimization
- Use compressed images (< 2MB)
- Optimal dimensions: 400x500px for portraits
- JPEG for photos, PNG for graphics
- WebP for modern browsers

### Template Performance
- **Canvas**: Fastest, lowest memory
- **SVG**: Fast, scalable output  
- **HTML**: Slower but most flexible

## API Reference

### Core Classes

```typescript
import { 
  FYBGenerator, 
  CanvasTemplateConfig,
  HtmlTemplateConfig, 
  SvgTemplateConfig 
} from 'fyb-generator';

// Main generator
const generator = new FYBGenerator();

// Generate from config
await generator.generate({
  csvPath: 'students.csv',
  outputDir: './output', 
  templateName: 'glamour',
  outputFormat: 'png'
});

// Cleanup
await generator.destroy();
```

### Utility Classes

```typescript
import { ImageUtils, CSVParser } from 'fyb-generator';

// Process images
const base64 = await ImageUtils.processImageInput('photo.jpg');

// Parse CSV
const students = await CSVParser.parseCSV('data.csv', mapping);
```

## Web Interface Features

### Template Selection
- Visual template cards with previews
- Type indicators (Canvas/HTML/SVG)  
- Dimension and feature information

### Column Mapping
- Load CSV headers automatically
- Interactive field mapping
- Dropdown selection for headers
- Real-time validation

### Photo Handling
- Detect photo format automatically
- Support all input types (file/URL/base64)
- Preview functionality
- Error handling with fallbacks

## Troubleshooting

### Common Issues

1. **Puppeteer Installation**
```bash
# Linux dependencies
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxss1

# Alternative: use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

2. **Canvas Dependencies**
```bash
# Ubuntu/Debian
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev

# macOS
brew install cairo pango jpeg
```

3. **Photo Loading Issues**
- Check file paths are correct
- Verify URL accessibility  
- Validate base64 format
- Check image format support

4. **Template Errors**
- Verify template file paths
- Check placeholder IDs in SVG
- Validate HTML syntax
- Ensure required fields exist

### Performance Tips

- Use appropriate template type for use case
- Compress photos before processing
- Batch process in smaller chunks for large datasets
- Use SSD storage for faster I/O
- Monitor memory usage with large batches

## Migration from 1.0

### Breaking Changes
- Template configs now include `type` field
- `TemplateConfig` split into type-specific interfaces
- New photo field options (`photoUrl`, `photoBase64`)

### Migration Steps
```typescript
// Old (1.0)
const template: TemplateConfig = {
  name: 'custom',
  width: 800,
  // ... canvas fields
};

// New (2.0)  
const template: CanvasTemplateConfig = {
  name: 'custom',
  type: 'canvas', // <- Add this
  width: 800,
  // ... canvas fields  
};
```

## Contributing

We welcome contributions! Areas of interest:
- New template designs
- Performance optimizations  
- Additional output formats
- Better error handling
- Documentation improvements

## License

MIT License - see LICENSE file for details.

---

**FYB Generator 2.0** - Now with the power of Canvas, HTML, and SVG! 🚀
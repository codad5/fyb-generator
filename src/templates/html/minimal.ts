import { HtmlTemplateConfig } from "../../types";

export const minimalTemplate: HtmlTemplateConfig = {
  name: 'minimal',
  type: 'html',
  width: 600,
  height: 800,
  description: 'Clean minimal HTML template with typography focus',
  templatePath: 'templates/html/minimal.hbs',
  puppeteerOptions: {
    viewport: {
      width: 600,
      height: 800,
      deviceScaleFactor: 2
    },
    format: 'png',
    fullPage: false,
    clip: {
      x: 0,
      y: 0,
      width: 600,
      height: 800
    },
    delay: 500
  }
};
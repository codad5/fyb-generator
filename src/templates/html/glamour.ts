import { HtmlTemplateConfig } from "../../types";

export const glamourTemplate: HtmlTemplateConfig = {
  name: 'glamour',
  type: 'html',
  width: 800,
  height: 1000,
  description: 'Glamorous HTML template with gradient backgrounds and modern typography',
  templatePath: 'templates/html/glamour.hbs',
  puppeteerOptions: {
    viewport: {
      width: 800,
      height: 1000,
      deviceScaleFactor: 2
    },
    format: 'png',
    fullPage: false,
    clip: {
      x: 0,
      y: 0,
      width: 800,
      height: 1000
    },
    delay: 1000
  }
};

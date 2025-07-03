import { HtmlTemplateConfig } from "../../types";

export const fybMechEngTemplate: HtmlTemplateConfig = {
  name: 'fyb-mech-eng-unn',
  type: 'html',
  width: 800,
  height: 1000,
  description: 'Classic FYB template for Mechanical Engineering UNN 2025 set with white background, blue primary color, and green accents',
  templatePath: 'templates/html/fyb-mech-eng-unn.hbs',
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
    delay: 1500, // Slightly longer delay for animations
  }
};
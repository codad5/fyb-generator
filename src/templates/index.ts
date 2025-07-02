import { TemplateConfig } from '../types';
import { defaultTemplate } from './default';
import { modernTemplate } from './modern';

export const templates: { [key: string]: TemplateConfig } = {
  default: defaultTemplate,
  modern: modernTemplate
};

export const getTemplate = (name: string): TemplateConfig => {
  return templates[name] || defaultTemplate;
};

export const getTemplateNames = (): string[] => {
  return Object.keys(templates);
};
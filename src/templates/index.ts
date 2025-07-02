import { TemplateConfig } from '../types';
import { defaultTemplate } from './default';
import { modernTemplate } from './modern';
import { glamourTemplate } from './html/glamour';
import { minimalTemplate } from './html/minimal';
import { badgeTemplate } from './svg/badge';

export const templates: { [key: string]: TemplateConfig } = {
  default: defaultTemplate,
  modern: modernTemplate,
  glamour: glamourTemplate,
  minimal: minimalTemplate,
  badge: badgeTemplate
};

export const getTemplate = (name: string): TemplateConfig => {
  return templates[name] || defaultTemplate;
};

export const getTemplateNames = (): string[] => {
  return Object.keys(templates);
};

export const getTemplatesByType = (type: 'canvas' | 'html' | 'svg'): TemplateConfig[] => {
  return Object.values(templates).filter(template => template.type === type);
};
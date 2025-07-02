import { SvgTemplateConfig } from "../../types";


export const badgeTemplate: SvgTemplateConfig = {
  name: 'badge',
  type: 'svg',
  width: 400,
  height: 500,
  description: 'Badge-style SVG template with clean geometry',
  templatePath: 'templates/svg/badge.svg',
  placeholders: [
    { id: 'student-name', type: 'text', field: 'name' },
    { id: 'student-department', type: 'text', field: 'department' },
    { id: 'student-state', type: 'text', field: 'stateOfOrigin' },
    { id: 'student-photo', type: 'image', field: 'photoUrl' },
    { id: 'best-course', type: 'text', field: 'favoriteCourse' },
    { id: 'hobbies-text', type: 'text', field: 'hobbies' }
  ]
}
import { CanvasTemplateConfig } from '../types';

export const modernTemplate: CanvasTemplateConfig = {
  name: 'modern',
  type: 'canvas',
  width: 600,
  height: 800,
  backgroundColor: '#1a1a1a',
  description: 'Dark themed canvas template with modern design',
  photoConfig: {
    x: 50,
    y: 80,
    width: 150,
    height: 200,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#ff6b6b'
  },
  fields: [
    {
      key: 'name',
      label: 'Name',
      x: 220,
      y: 100,
      width: 330,
      height: 35,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      textAlign: 'left',
      fontWeight: 'bold',
      required: true
    },
    {
      key: 'department',
      label: 'Department',
      x: 220,
      y: 140,
      width: 330,
      height: 25,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#ff6b6b',
      textAlign: 'left',
      fontWeight: 'normal',
      required: true
    },
    {
      key: 'stateOfOrigin',
      label: 'State',
      x: 220,
      y: 170,
      width: 330,
      height: 25,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#4ecdc4',
      textAlign: 'left',
      fontWeight: 'normal',
      required: true
    },
    {
      key: 'hobbies',
      label: 'Hobbies',
      x: 50,
      y: 320,
      width: 500,
      height: 50,
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#ffe66d',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 2,
      required: true
    },
    {
      key: 'bestMoment',
      label: 'Best Moment',
      x: 50,
      y: 390,
      width: 500,
      height: 70,
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#a8e6cf',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 3,
      required: true
    },
    {
      key: 'afterSchool',
      label: 'Future Plans',
      x: 50,
      y: 480,
      width: 500,
      height: 70,
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#ffd93d',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 3,
      required: true
    }
  ],
  decorativeElements: [
    {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 600,
      height: 5,
      color: '#ff6b6b'
    },
    {
      type: 'rectangle',
      x: 0,
      y: 795,
      width: 600,
      height: 5,
      color: '#ff6b6b'
    },
    {
      type: 'circle',
      x: 550,
      y: 50,
      radius: 30,
      color: '#4ecdc4'
    }
  ]
};
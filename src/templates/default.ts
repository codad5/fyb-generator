import { CanvasTemplateConfig } from '../types';

export const defaultTemplate: CanvasTemplateConfig = {
  name: 'default',
  type: 'canvas',
  width: 800,
  height: 1000,
  backgroundColor: '#f5f5f5',
  description: 'Classic canvas-based template with comprehensive fields',
  photoConfig: {
    x: 50,
    y: 100,
    width: 200,
    height: 250,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#333'
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
    },
    {
      key: 'nickname',
      label: 'Nickname',
      x: 270,
      y: 120,
      width: 480,
      height: 30,
      fontSize: 18,
      fontFamily: 'Arial',
      color: '#7f8c8d',
      textAlign: 'left',
      fontWeight: 'normal',
      required: false
    },
    {
      key: 'department',
      label: 'Department',
      x: 270,
      y: 160,
      width: 480,
      height: 30,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#34495e',
      textAlign: 'left',
      fontWeight: 'bold',
      required: true
    },
    {
      key: 'stateOfOrigin',
      label: 'State of Origin',
      x: 270,
      y: 200,
      width: 480,
      height: 30,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#34495e',
      textAlign: 'left',
      fontWeight: 'normal',
      required: true
    },
    {
      key: 'mostChallengingCourse',
      label: 'Most Challenging Course',
      x: 50,
      y: 380,
      width: 700,
      height: 60,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#e74c3c',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 2,
      required: true
    },
    {
      key: 'favoriteCourse',
      label: 'Favorite Course',
      x: 50,
      y: 460,
      width: 700,
      height: 60,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#27ae60',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 2,
      required: true
    },
    {
      key: 'bestLevel',
      label: 'Best Level',
      x: 50,
      y: 540,
      width: 340,
      height: 30,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#8e44ad',
      textAlign: 'left',
      fontWeight: 'normal',
      required: true
    },
    {
      key: 'hobbies',
      label: 'Hobbies',
      x: 410,
      y: 540,
      width: 340,
      height: 60,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#f39c12',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 2,
      required: true
    },
    {
      key: 'bestMoment',
      label: 'Best Moment in School',
      x: 50,
      y: 620,
      width: 700,
      height: 80,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#16a085',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 3,
      required: true
    },
    {
      key: 'worstExperience',
      label: 'Worst Experience',
      x: 50,
      y: 720,
      width: 700,
      height: 80,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#c0392b',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 3,
      required: true
    },
    {
      key: 'afterSchool',
      label: 'After School Plans',
      x: 50,
      y: 820,
      width: 700,
      height: 60,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#2980b9',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 2,
      required: true
    },
    {
      key: 'relationshipStatus',
      label: 'Relationship Status',
      x: 50,
      y: 900,
      width: 700,
      height: 60,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#e67e22',
      textAlign: 'left',
      fontWeight: 'normal',
      maxLines: 2,
      required: true
    }
  ],
  decorativeElements: [
    {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 800,
      height: 10,
      color: '#3498db'
    },
    {
      type: 'rectangle',
      x: 0,
      y: 990,
      width: 800,
      height: 10,
      color: '#3498db'
    }
  ]
};
export interface StudentData {
    name: string;
    nickname?: string;
    department: string;
    stateOfOrigin: string;
    mostChallengingCourse: string;
    favoriteCourse: string;
    bestLevel: string;
    hobbies: string;
    bestMoment: string;
    worstExperience: string;
    afterSchool: string;
    relationshipStatus: string;
    photoPath?: string;
    [key: string]: any; // Allow additional custom fields
  }
  
  export interface TemplateConfig {
    name: string;
    width: number;
    height: number;
    backgroundColor: string;
    fields: TemplateField[];
    photoConfig: PhotoConfig;
    decorativeElements?: DecorativeElement[];
  }
  
  export interface TemplateField {
    key: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    fontWeight: 'normal' | 'bold';
    maxLines?: number;
    required: boolean;
  }
  
  export interface PhotoConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
  }
  
  export interface DecorativeElement {
    type: 'rectangle' | 'circle' | 'text' | 'image';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    text?: string;
    fontSize?: number;
    imagePath?: string;
  }
  
  export interface ColumnMapping {
    [templateKey: string]: string; // Maps template field keys to CSV column names
  }
  
  export interface GenerationConfig {
    csvPath: string;
    outputDir: string;
    templateName: string;
    columnMapping?: ColumnMapping;
    photoColumnName?: string;
    nameColumnName?: string;
  }
  
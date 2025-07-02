import * as fs from 'fs';
import * as csv from 'csv-parser';
import { StudentData, ColumnMapping } from '../types';

export class CSVParser {
  static async parseCSV(filePath: string, columnMapping?: ColumnMapping): Promise<StudentData[]> {
    return new Promise((resolve, reject) => {
      const results: StudentData[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const mappedData = this.mapRowToStudentData(row, columnMapping);
          results.push(mappedData);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private static mapRowToStudentData(row: any, columnMapping?: ColumnMapping): StudentData {
    const studentData: StudentData = {
      name: '',
      department: '',
      stateOfOrigin: '',
      mostChallengingCourse: '',
      favoriteCourse: '',
      bestLevel: '',
      hobbies: '',
      bestMoment: '',
      worstExperience: '',
      afterSchool: '',
      relationshipStatus: ''
    };

    if (columnMapping) {
      // Use custom column mapping
      for (const [templateKey, csvColumn] of Object.entries(columnMapping)) {
        if (row[csvColumn] !== undefined) {
          studentData[templateKey] = row[csvColumn];
        }
      }
    } else {
      // Use default column names (exact match)
      Object.keys(studentData).forEach(key => {
        if (row[key] !== undefined) {
          studentData[key] = row[key];
        }
      });
    }

    // Add any additional columns that weren't mapped
    Object.keys(row).forEach(key => {
      if (!studentData.hasOwnProperty(key)) {
        studentData[key] = row[key];
      }
    });

    return studentData;
  }

  static getCSVHeaders(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let headers: string[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', () => {
          // We only need the first row to get headers
        })
        .on('end', () => {
          resolve(headers);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
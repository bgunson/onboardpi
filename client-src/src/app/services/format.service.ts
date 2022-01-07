import { Injectable } from '@angular/core';

const Units: {[key: string]: string} = {
  'percent': '%',
  'kph': 'km/h',
  'revolutions_per_minute': 'RPM',
  'volt': 'V',
  'degC': '°C',
  'degree': '°',
  'gps': 'g/s',
  'kilopascal': 'kPa'
}

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  constructor() { }

  unit(unit: string) {
    return Units[unit] || unit;
  }

  isNumeric(value: any) {
    return !isNaN(value);
  }

  round(value: number) {
    return Math.round(value);
  }

  bytesToString(bytes: number): string {
    if (bytes > 1000000) {  // To MB
      return Math.round(bytes / 1000000) + ' MB';
    } else if (bytes > 1000) {
      return Math.round(bytes / 1000) + ' KB';
    } else {
      return Math.round(bytes) + ' bytes';
    }
  }

}

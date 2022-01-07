import { Pipe, PipeTransform } from '@angular/core';


/**
 * Format a given number of bytes to its largest unit as string
 */
@Pipe({
  name: 'bytes'
})
export class BytesPipe implements PipeTransform {

  transform(bytes: number, ...args: unknown[]): string {
    if (bytes > 1000000000) { // To GB
      return Math.round(bytes / 1000000000) + ' GB';
    } else if (bytes > 1000000) {  // To MB
      return Math.round(bytes / 1000000) + ' MB';
    } else if (bytes > 1000) {
      return Math.round(bytes / 1000) + ' KB';
    } else {
      return Math.round(bytes) + ' bytes';
    }
  }
}


/**
 * Transform unit from python-OBD to prettier version
 */
@Pipe({
    name: 'prettyUnit'
})
export class PrettyUnitPipe implements PipeTransform {

    prettyUnits: {[key: string]: string} = {
      'percent': '%',
      'kph': 'km/h',
      'revolutions_per_minute': 'RPM',
      'volt': 'V',
      'degC': '°C',
      'degree': '°',
      'gps': 'g/s',
      'kilopascal': 'kPa'
    }
    
    transform(value: string, ...args: unknown[]): string {
      return this.prettyUnits[value] ? this.prettyUnits[value] : value;
    }
  
}
  

/**
 * Round number -> number
 */
@Pipe({
    name: 'round'
})
export class RoundPipe implements PipeTransform {
    
    transform(value: number, ...args: any[]): number {
        return Math.round(value);
    }

}
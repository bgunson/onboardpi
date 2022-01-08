import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'obdValue'
})
export class OBDValuePipe implements PipeTransform {

  constructor(private decimals: DecimalPipe) {

  }

  transform(value: any, args: string) {
    if (typeof value === 'number') {
      return this.decimals.transform(value, args)
    } else if (typeof value === 'string') {
      return value;
    } else {
      return 'NaN'
    }
  }
  
}

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
      return Math.round(bytes / 1000) + ' kB';
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
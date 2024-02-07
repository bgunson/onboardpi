import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'obdValue'
})
export class OBDValuePipe implements PipeTransform {

  constructor(private decimals: DecimalPipe) {

  }

  transform(value: any, digits?: string) {
    if (typeof value === 'number') {
      return this.decimals.transform(value, digits)
    } else if (typeof value === 'string') {
      return value;
    } else {
      return 'NaN'
    }
  }

}

@Pipe({
  name: 'elapsed'
})
export class ElapsedPipe implements PipeTransform {

  transform(numSec: number) {
    let hours: string = String(Math.floor(numSec / 3600)).padStart(2, '0');
    let minutes: string = String(Math.floor((numSec / 60) % 60)).padStart(2, '0');
    let seconds: string = String(Math.floor(numSec % 60)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

}

/**
 * Format a given number of bytes to its largest unit as string
 */
@Pipe({
  name: 'bytes'
})
export class BytesPipe implements PipeTransform {

  constructor(private decimals: DecimalPipe) { }

  transform(bytes: number, digits?: string): string {
    if (!digits) {
      digits = '1.0-0';
    }
    if (bytes > 1000000000) { // To GB
      return this.decimals.transform((bytes / 1000000000), digits) + ' GB';
    } else if (bytes > 1000000) {  // To MB
      return this.decimals.transform((bytes / 1000000), digits) + ' MB';
    } else if (bytes > 1000) {
      return this.decimals.transform((bytes / 1000), digits) + ' kB';
    } else {
      return this.decimals.transform((bytes), digits) + ' bytes';
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

  prettyUnits: { [key: string]: string } = {
    'percent': '%',
    'mile_per_hour': 'mph',
    'kilometer_per_hour': 'km/h',
    'kph': 'km/h',
    'revolutions_per_minute': 'RPM',
    'volt': 'V',
    'degree_Fahrenheit': '°F',
    'degree_Celsius': '°C',
    'degC': '°C',
    'degree': '°',
    'gps': 'g/s',
    'kilopascal': 'kPa',
    'pound / minute': 'lb/min',
    'pound_force_per_square_inch': 'psi'
  }

  transform(value: string, ...args: unknown[]): string {
    if (value.startsWith('<class')) {
      return "";
    }
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
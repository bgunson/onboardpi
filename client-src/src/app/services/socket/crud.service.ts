import { Injectable } from '@angular/core';
import { AppSocket } from 'src/app/app.module';

/**
 * Main CRUD service which uses the main application socket to perform API requests.
 * 
 * TODO: make and handle crud errors and show snack bar or similar to notify client
 */
@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private socket: AppSocket) { }

  create<T>(type: string, item: T) {
    this.socket.emit(`${type}:create`, item);
  }

  read<T>(type: string) {
    this.socket.emit(`${type}:read`);
  }

  update<T>(type: string, item: T) {
    this.socket.emit(`${type}:update`, item);
  }

  delete<T>(type: string, item: T) {
    this.socket.emit(`${type}:delete`, item);
  }

}

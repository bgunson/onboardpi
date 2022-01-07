import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

/**
 * When a module (route) is activated it can use the action service to spawn an icon button on the app sidenav with their own respective function.
 */
@Injectable({
  providedIn: 'root'
})
export class ActionService {

  actionClick: Subject<void> = new Subject<void>();

  icon: BehaviorSubject<string> = new BehaviorSubject<string>("");

  actions: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  /**
   * To emit a click event via the Subject<number>
   * @param index The particular index of the click, must be in range of the current 'actions' array.
   */
  click() {
    this.actionClick.next();
  }

  /**
   * Set the actions for a route
   * @param actions An array of material icon selectors as strings to be spawned as icon buttons on the app sidenav
   */
  setAction(icon: string) {
    this.icon.next(icon)
  }

  /**
   * Clear the current actions (if a module/page does not require any) 
   */
  clearAction() {
    this.icon.next("");
  }

}

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

type SidenavPosition = 'start' | 'end';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  palette: ThemePalette;  // this is 'primary' | 'accent' 

  showDemo: boolean = false;

  theme: string;
  defaultColor: string;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isPortrait$: Observable<boolean> = this.breakpointObserver.observe([
    '(orientation: portrait)',
    '(orientation: landscape)',
  ]).pipe(
    map(result => result.breakpoints['(orientation: portrait)']), 
    shareReplay()
  );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private overlay: OverlayContainer
  ) { }

  getSidenavPosition() : SidenavPosition | null {
    return <SidenavPosition>localStorage.getItem('sidenav');
  }

  toggleSidenavPosition() {
    let current = localStorage.getItem('sidenav');
    if (current === 'end') {
      current = 'start';
    } else {
      current = 'end';
    }
    localStorage.setItem('sidenav', current);
    // window.location.reload();
  }

  setTheme(theme: string) : void {
    this.overlay.getContainerElement().classList.remove('dark-theme');
    this.overlay.getContainerElement().classList.add(theme + '-theme');
    this.theme = theme;
    localStorage.setItem('theme', this.theme);

    if (this.theme === 'light') {
      this.defaultColor = '#00796b';
      this.palette = 'primary';
    } else {
      this.defaultColor = '#ffc107';
      this.palette = 'accent';
    }
  }

  checkTheme(): void {
    let existing = localStorage.getItem('theme');
    if (existing) {
      this.setTheme(existing);
    } else {
      this.setTheme('dark');
    }
  }
}

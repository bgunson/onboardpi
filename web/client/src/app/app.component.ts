import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DisplayService } from './shared/services/display.service';
import { ActionService } from './shared/services/action.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SettingsService } from './settings/settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'onboardpi-client';

  route$: Observable<string | undefined>;
  obdConnected: Promise<boolean>;

  constructor(
    public display: DisplayService, 
    public action: ActionService,
    private router: Router
  ) { }

  get route() {
    return this.router.url.slice(1);
  }

  refresh() {
    window.location.reload();
  }

  back() {
    let urlSeg: string[] = this.router.url.split('/');
    if (urlSeg.length === 0) {
      urlSeg = ['/']
    } else {
      urlSeg.pop();
    }
    this.router.navigateByUrl(urlSeg.join('/'));
  }

  ngAfterViewInit(): void {
      if (environment.demo && !sessionStorage.getItem('demo')) {
        this.router.navigateByUrl('demo');
      }
  }
  
  ngOnInit() {
    this.display.checkTheme();
  }

}

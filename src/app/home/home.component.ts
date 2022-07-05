import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {DOCUMENT} from '@angular/common';

import { ArticleListConfig, TagsService, UserService } from '../core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private tagsService: TagsService,
    private userService: UserService,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
  ) {}

  isAuthenticated: boolean;
  listConfig: ArticleListConfig = {
    type: 'all',
    filters: {}
  };
  tags: Array<string> = [];
  tagsLoaded = false;

  ngOnInit() {
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://staging.terracycle.com/en-US/sdk_v2.js';
    s.text = ` (function(f,a,d,g,e,b,c){f.TerraCycleObject=e;f[e]=f[e]||function(){
      (f[e].q=f[e].q||[]).push(arguments)};f[e].t=1*new Date();b=a.createElement(d);
      c=a.getElementsByTagName(d)[0];b.async=1;b.src=g;c.parentNode.insertBefore(b,c)
    })`;
    this.renderer2.appendChild(this._document.body, s);

    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;

        // set the article list accordingly
        if (authenticated) {
          this.setListTo('feed');
        } else {
          this.setListTo('all');
        }
      }
    );

    this.tagsService.getAll()
    .subscribe(tags => {
      this.tags = tags;
      this.tagsLoaded = true;
    });
  }

  setListTo(type: string = '', filters: Object = {}) {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === 'feed' && !this.isAuthenticated) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Otherwise, set the list object
    this.listConfig = {type: type, filters: filters};
  }
}

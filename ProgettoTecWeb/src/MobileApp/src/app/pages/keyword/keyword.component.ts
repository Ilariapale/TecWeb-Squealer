import { TimeService } from 'src/app/services/time.service';
import { Squeal } from 'src/app/models/squeal.interface';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { SquealsService } from 'src/app/services/api/squeals.service';

@Component({
  selector: 'app-keyword',
  templateUrl: './keyword.component.html',
  styleUrls: ['./keyword.component.css'],
})
export class KeywordComponent {
  identifier: string = '';
  loading: boolean = false;
  lastSquealLoaded: string = '';
  MAX_SQUEALS = 5;
  sort_order = 'desc';
  sort_by = 'date';
  squeals: Squeal[] = [];

  bannerClass = '';
  muted: boolean = false;
  isGuest: boolean = false;
  loadMore: boolean = true;

  constructor(
    private route: ActivatedRoute,
    public timeService: TimeService,
    private squealsService: SquealsService,
    public darkModeService: DarkModeService,
    private location: Location
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('Guest_Authorization')) this.isGuest = true;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.identifier = params.get('identifier') || '';

      if (this.identifier) {
        let query = {
          keywords: [this.identifier],
          pag_size: this.MAX_SQUEALS,
          sort_order: this.sort_order,
          sort_by: this.sort_by,
        };
        this.squealsService
          .getSqueals(query)
          .then((response: any) => {
            this.squeals = response;
            this.lastSquealLoaded = this.squeals[this.squeals.length - 1]._id || '';
            if (response.length < this.MAX_SQUEALS) this.loadMore = false;
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    });
  }

  loadMoreSqueals() {
    this.loading = true;
    let query = {
      keywords: [this.identifier],
      last_loaded: this.lastSquealLoaded,
      pag_size: this.MAX_SQUEALS,
      sort_order: this.sort_order,
      sort_by: this.sort_by,
    };
    this.squealsService
      .getSqueals(query)
      .then((response: any) => {
        this.squeals = this.squeals.concat(response);
        this.lastSquealLoaded = response[response.length - 1]._id || '';
        this.loading = false;
        if (response.length < this.MAX_SQUEALS) this.loadMore = false;
      })
      .catch((error: any) => {
        this.loadMore = false;
        console.log(error);
        this.loading = false;
      });
    this.loading = false;
  }

  goBack(): void {
    this.location.back();
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {SpeakTabNavService} from 'src/app/services/speak-tab-nav.service';
import {AlertManagerService} from 'src/app/services/alert-manager.service';
import {LoaderService} from 'src/app/services/loader.service';


@Component({
  selector: 'app-folder-list',
  templateUrl: './folder-list.page.html',
  styleUrls: ['./folder-list.page.scss'],
})

export class FolderListPage implements OnInit {

  public publisherId: string
  public folders: any
  publisherName: any;
  public isLoading = false;

  constructor(
    private navService : SpeakTabNavService,
    private route: ActivatedRoute,
    private alertManager: AlertManagerService,
    private loaderService: LoaderService) {

    this.loaderService.getIsLoading()
        .subscribe((isLoading) => this.isLoading = isLoading);
    this.publisherId = '';
  }

  ngOnInit() {
    this.publisherId = this.route.snapshot.paramMap.get('publisherId');
  }

  async ionViewWillEnter() {
    this.navService.getInfoForPublisher(this.publisherId)
        .subscribe(
            (data) => {
              this.publisherName = data['username'];
              this.folders = data['freedfolders'];
            },
            (err) => this.alertManager
                .showErrorAlert(err.status, err.statusText),
        );
  }

}

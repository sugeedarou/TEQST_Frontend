import { Component, OnInit } from '@angular/core';
import { NavParams, IonNav } from '@ionic/angular';
import { FolderStats } from 'src/app/interfaces/folder-stats';
import { SpeakerDetailPage } from '../speaker-detail/speaker-detail.page';


@Component({
  selector: 'app-speaker-list',
  templateUrl: './speaker-list.page.html',
  styleUrls: ['./speaker-list.page.scss'],
})
export class SpeakerListPage implements OnInit {

  public folderStats: FolderStats
  public navComponent: IonNav

  constructor(public navParams: NavParams) {
    this.folderStats = navParams.get('folderStats')
    this.navComponent = navParams.get('navComponent')
  }

  ngOnInit() {}

  showDetail(speaker) {
    //this.navComponent.push(SpeakerDetailPage, { speaker })
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, PopoverController, IonInput } from '@ionic/angular';
import { Constants } from '../../constants';
import { MenuLanguageSelectorComponent } from './menu-language-selector/menu-language-selector.component';
import { AuthenticationService } from 'src/app/services/authentication.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  SERVER_URL = Constants.SERVER_URL;
  public showPassword = false;

  constructor(
    public navCtrl: NavController,
    public authenticationService: AuthenticationService,
    public popoverController: PopoverController) { }

  ngOnInit() {}

  async presentMenuLanguages(ev: any) {
    const popover = await this.popoverController.create({
      component: MenuLanguageSelectorComponent,
      event: ev,
      translucent: true,
      showBackdrop: false
    });
    return await popover.present();
  }

  // gets Username and Password and calls with those login in UsermgmtService
  performLogin(form) {
    this.authenticationService.login(form.value);
  }

  redirect() {
    window.open(this.SERVER_URL + '/admin');
  }

}

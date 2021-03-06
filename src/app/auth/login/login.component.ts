import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/constants';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  SERVER_URL = Constants.SERVER_URL;
  public showPassword = false;

  constructor(
    public navCtrl: NavController,
    public authenticationService: AuthenticationService) {}

  ngOnInit() { }

  // gets Username and Password and calls with those login in UsermgmtService
  performLogin(form) {
    this.authenticationService.login(form.value);
  }
}

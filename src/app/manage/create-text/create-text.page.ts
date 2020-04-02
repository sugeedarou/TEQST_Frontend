import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonInput, IonSelect } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsermgmtService } from 'src/app/services/usermgmt.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-create-text',
  templateUrl: './create-text.page.html',
  styleUrls: ['./create-text.page.scss']
})
export class CreateTextPage implements OnInit {

  @ViewChild('titleInput', {  static: false })  titleInput: IonInput;
  @ViewChild('selectFileWrapper', {  static: false })  selectFileWrapper: object;

  public formValid: boolean;
  public titleValid: boolean;
  public fileSelected: boolean;
  public availableLanguages: any;
  public language: string;
  public languageNative: string;
  /* allow any characters except \,/,:,*,<,>,| and whitespaces
     but not filenames starting with the character . */
  private validatorPattern = new RegExp('^(?!\\.)[^\\\\\/:\\*"<>\\| ]+$');
  public createTextForm: FormGroup;
  private file: File;
  private existingTextNames: string[];

  constructor(private formBuilder: FormBuilder,
              private viewCtrl: ModalController,
              public usermgmtService: UsermgmtService,
              public languageService: LanguageService) {


    this.createTextForm = this.formBuilder.group({
      title: ['', control => { return this.textTitleValidator(control); } ],
      language: ['', Validators.required]
    });

    this.createTextForm.valueChanges.subscribe(() => { this.updateFormValidity(); });

    this.formValid = false;
    this.titleValid = false;
    this.fileSelected = false;
  }

  ngOnInit() {
    this.languageService.getLangs().subscribe((data: any) => {
      this.availableLanguages = data;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
        // setting the focus only works in most webbrowsers after a small timeout
        this.titleInput.setFocus();
    }, 100);
  }

  dismiss() {
    // close the modal without passing data
    this.viewCtrl.dismiss();
  }

  createText(formData) {
    // close the modal and pass its data back to the view
    this.viewCtrl.dismiss({
      title: formData.title,
      file: this.file,
      language: formData.language
    });
  }

  setFile(file) {
    this.file = file;
    this.fileSelected = true;
    this.updateFormValidity();
  }

  textTitleValidator(control: FormControl) {
    const title = control.value;
    this.titleValid = (this.validatorPattern.test(title) &&
                       title.trim() !== '' &&  // title not empty
                      !this.existingTextNames.includes(title));

    if (this.titleValid) {return null;
    } else {return { textTitle: true };
    }
  }

  updateFormValidity() {
    this.formValid = this.createTextForm.valid && this.titleValid && this.fileSelected;
  }
}

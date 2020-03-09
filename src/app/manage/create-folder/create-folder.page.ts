import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController, IonInput } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.page.html',
  styleUrls: ['./create-folder.page.scss'],
})
export class CreateFolderPage implements OnInit {

  @Input() parentId: any
  @ViewChild('folderName', {  static: false })  folderNameInput: IonInput

  public folderInfo : FormGroup;
  /* allow any characters except \,/,:,*,<,>,|
     but not filenames starting with white-spaces or the character . */
  private validatorPattern = '^(?!\\.|\\s)[^\\\\\/:\\*"<>\\|]+$'

  constructor(private formBuilder: FormBuilder,
              public viewCtrl: ModalController) {

    this.folderInfo = this.formBuilder.group({
      folderName: ['', Validators.pattern(this.validatorPattern)],
    })

  }

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
        // setting the focus only works in most webbrowsers after a small timeout
        this.folderNameInput.setFocus()
    }, 100)
  }

  submitForm(){
    let formData = this.folderInfo.value
    // close the modal passing its data
    this.viewCtrl.dismiss({
      folderName: formData.folderName
    })
  }

  dismissForm() {
    // close the modal without passing data
    this.viewCtrl.dismiss()
  }

}

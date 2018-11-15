import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public onRegisterForm: FormGroup;
  topics: string[];
  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    this.onRegisterForm = this.formBuilder.group({
      'fullName': [null, Validators.compose([
        Validators.required
      ])],
      'email': [null, Validators.compose([
        Validators.required
      ])],
      'password': [null, Validators.compose([
        Validators.required
      ])]
    });
  }
  generateTopics() {
    this.topics = [
      'Storage in Ionic 2',
      'Ionic 2 - calendar',
      'Creating a Android application using ionic framework.',
      'Identifying app resume event in ionic - android',
      'What is hybrid application and why.?',
      'Procedure to remove back button text',
      'How to reposition ionic tabs on top position.',
      'Override Hardware back button in cordova based application - Ionic',
      'Drupal 8: Enabling Facets for Restful web services',
      'Drupal 8: Get current user session',
      'Drupal 8: Programatically create Add another field - Example',  
    ];
  }
 
  getTopics(ev: any) {
    this.generateTopics();
    let serVal = ev.target.value;
    if (serVal && serVal.trim() != '') {
      this.topics = this.topics.filter((topic) => {
        return (topic.toLowerCase().indexOf(serVal.toLowerCase()) > -1);
      })
    }
  }
  itemSelected(item: string) {
   alert(item);
  }
  async signUp() {
    const loader = await this.loadingCtrl.create({
      duration: 2000
    });

    loader.present();
    loader.onWillDismiss().then(() => {
      this.navCtrl.navigateRoot('/home');
    });
  }

  // // //
  goToLogin() {
    this.navCtrl.navigateRoot('/login');
  }
}

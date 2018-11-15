import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { AuthenticationService } from '../../_services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public onLoginForm: FormGroup;
  email:string;
  password:string;
  returnUrl:string;
  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private translate: TranslateProvider,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {
    this.loginform();
   }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    document.querySelector('video').play();
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/home";
    this.onLoginForm = this.formBuilder.group({
      'email': [null, Validators.compose([
        Validators.required
      ])],
      'password': [null, Validators.compose([
        Validators.required
      ])]
    });
  }
  loginform()
  {
    this.onLoginForm = this.fb.group({

      email: ['', Validators.required],
      password: [''],
    });
  }
  async forgotPass() {
    const alert = await this.alertCtrl.create({
      header: this.translate.get('app.pages.login.label.forgot'),
      message: this.translate.get('app.pages.login.text.forgot'),
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: this.translate.get('app.label.email')
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: async () => {
            const loader = await this.loadingCtrl.create({
              duration: 2000
            });

            loader.present();
            loader.onWillDismiss().then(async l => {
              const toast = await this.toastCtrl.create({
                showCloseButton: true,
                message: this.translate.get('app.pages.login.text.sended'),
                duration: 3000,
                position: 'bottom'
              });

              toast.present();
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // // //
  goToRegister() {
    this.navCtrl.navigateRoot('/register');
  }

    login()
     {
        debugger;            
        this.email = this.onLoginForm.get('email').value;
        this.password = this.onLoginForm.get('password').value;
        this.authenticationService.login(this.email, this.password).then(data => {
          debugger;
         // this.spinner.hide();
          let localstorjval = localStorage.getItem("_uid");
          if (localstorjval && localstorjval !== "undefined")
          {
            this.router.navigate([this.returnUrl]);
          } 
          else 
          {
            // toastOptions.msg = 'Invalid username or password';
            // this.toastyService.error(toastOptions);
            alert("User email/Password invalid.");
            this.email = "";
            this.password = "";
          }
        });
      }

}

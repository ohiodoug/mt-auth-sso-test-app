import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import axios from 'axios';

import { Auth, CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { env } from 'process';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MT Authorization Test';

  jwtToken: any = null;
  accessToken: any = null;

  public constructor() {
    Auth.configure({
      region: 'us-east-2',
      userPoolId: environment.cognitoSettings.UserPoolId,
      userPoolWebClientId: environment.cognitoSettings.ClientId,
      authenticationFlowType: "USER_PASSWORD_AUTH",

      oauth: {
        domain: `${environment.cognitoSettings.UserPoolDomain}`,
        scope: [
          // "phone",
          "email",
          "profile",
          "openid",
          "aws.cognito.signin.user.admin",
        ],
        redirectSignIn: `${environment.APP_URL}/`,
        redirectSignOut: `${environment.APP_URL}/`,
        responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
      }
    });

    Auth.currentUserInfo().then(response => {
      if (null !== response) {
        Auth.currentSession().then(response => {
          this.accessToken = response.getAccessToken();
          this.jwtToken = this.accessToken.getJwtToken();
          console.log(this.jwtToken);

          // Get the profile from the API
          axios.get(`${environment.api.BaseUrl}/accounts`, {
            headers: {
              "Authorization": this.jwtToken
            }
          }).then(res => {
            console.log('Got user...');
            console.log(res.data.data.user);
          });
        })        
      }
    });

    // Auth.current


  }

  isLoggedIn() {
    return this.jwtToken !== null;
  }

  logout() {
    Auth.signOut().then(response => {
      this.accessToken = null;
      this.jwtToken = null;
    })
  }




  async signInWithFacebook() {
    Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Facebook,
    });
  }

  

  // async registerWithFacebook() {
  //   Auth.federatedSignIn({
  //     provider: CognitoHostedUIIdentityProvider.Facebook,
  //   });
  // }

}

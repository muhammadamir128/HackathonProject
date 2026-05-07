import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { Master } from '../../Service/master';

@Component({
  selector: 'register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  isLogin: boolean = true;
  showLoginPwd: boolean = false;
  showRegPwd: boolean = false;

  http = inject(HttpClient);
  router = inject(Router);
  masterService = inject(Master);

  registerObj: any = {
    fullName: "",
    email: "",
    password: "",
    collegeName: "",
    role: "student"
  };

  loginObj: any = {
    email: "",
    password: ""
  };

  toggleForm() {
    this.isLogin = !this.isLogin;
  }

  onRegister() {
    if (!this.registerObj.fullName || !this.registerObj.email || !this.registerObj.password) {
      this.showAlert("Please fill in all required fields.", "danger");
      return;
    }

    if (this.registerObj.password.length < 8) {
      this.showAlert("Password must be at least 8 characters.", "danger");
      return;
    }

    if (!this.validateEmail(this.registerObj.email)) {
      this.showAlert("Please enter a valid email address.", "danger");
      return;
    }

    this.http.post("https://api.freeprojectapi.com/api/ProjectCompetition/register", this.registerObj)
      .subscribe({
        next: () => {
          this.showAlert("Registration successful. Please log in.", "success");
          this.isLogin = true;
          this.loginObj.email = this.registerObj.email;
          this.loginObj.password = this.registerObj.password;
        },
        error: (error: any) => {
          this.showAlert(error.error || "Registration failed. Please try again.", "danger");
        }
      });
  }

  onLogin() {
    if (!this.loginObj.email || !this.loginObj.password) {
      this.showAlert("Please fill in all required fields.", "danger");
      return;
    }

    if (!this.validateEmail(this.loginObj.email)) {
      this.showAlert("Please enter a valid email address.", "danger");
      return;
    }

    this.http.post("https://api.freeprojectapi.com/api/ProjectCompetition/login", this.loginObj)
      .subscribe({
        next: (result: any) => {
          localStorage.setItem("Hackathon", JSON.stringify(result));
          this.router.navigateByUrl("/home");
          this.masterService.$loginDone.next(result);
          this.showAlert("Login successful.", "success");
        },
        error: (error: any) => {
          this.showAlert(error.error || "Login failed. Please check your credentials.", "danger");
        }
      });
  }

  onSocialLogin(provider: string) {
    this.showAlert(`${provider} login not implemented yet.`, "info");
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showAlert(message: string, type: 'success' | 'danger' | 'info' = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      const icon = type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle';
      alertContainer.innerHTML = `<div class="auth-alert ${type}"><i class="fa fa-${icon}"></i><span>${message}</span></div>`;
      setTimeout(() => { alertContainer.innerHTML = ''; }, 4500);
    }
  }
}

import { Component } from '@angular/core';
import {
  FormsModule,
  NgForm,
} from '@angular/forms';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class Contact {
  model: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitting = false;
  submitted = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      form.resetForm();
      this.model = { name: '', email: '', subject: '', message: '' };

      setTimeout(() => (this.submitted = false), 4000);
    }, 900);
  }
}

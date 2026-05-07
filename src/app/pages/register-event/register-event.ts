import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Master } from '../../Service/master';

@Component({
  selector: 'register-event',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register-event.html',
  styleUrls: ['./register-event.scss']
})
export class RegisterEvent {
  submissionForm: FormGroup = new FormGroup({
    submissionId: new FormControl(0),
    competitionId: new FormControl(0),
    userId: new FormControl(0),
    projectTitle: new FormControl(""),
    description: new FormControl(""),
    githubLink: new FormControl(""),
    submissionDate: new FormControl(new Date()),
    status: new FormControl(""),
    rank: new FormControl(0),
  });

  masterService = inject(Master);
  currentStep = 1;
  showPreview = false;
  alertMessage = '';
  alertType = '';
  showAlert = false;
  router: any;

  constructor(private activeRoute: ActivatedRoute) {
    this.activeRoute.params.subscribe((res: any) => {
      this.submissionForm.controls['competitionId'].setValue(res.id);
    });
    const localData = localStorage.getItem("Hackathon");
    if (localData != null) {
      const userData = JSON.parse(localData);
      this.submissionForm.controls['userId'].setValue(userData.userId);
    }
  }

  // Update progress based on current step
  updateProgress(step: number): void {
    this.currentStep = step;
  }

  // Update preview section
  updatePreview(): void {
    this.showPreview = true;
    this.updateProgress(3);
  }

  // Handle form submission
  onSubmit(): void {
    if (!this.submissionForm.value.projectTitle || !this.submissionForm.value.description || !this.submissionForm.value.githubLink) {
      this.showAlertMessage('danger', 'Please fill in all required fields.');
      return;
    }

    const formData = {
      ...this.submissionForm.value,
      status: 'submitted'
    };

    this.masterService.saveDraftProject(formData).subscribe({
      next: (res: any) => {
        this.showAlertMessage('success', 'Project submitted successfully!');
        setTimeout(() => {
          this.router.navigate(['/submission', this.submissionForm.value.competitionId]);
        }, 2000);
      },
      error: (error: any) => {
        this.showAlertMessage('danger', error.error || 'Failed to submit project.');
      }
    });
  }

  // Save as draft
  saveDraft(): void {
    const formValue = {
      ...this.submissionForm.value,
      status: 'draft'
    };
    
    this.masterService.saveDraftProject(formValue).subscribe({
      next: (res: any) => {
        this.showAlertMessage('info', 'Project saved as draft.');
      },
      error: (error: any) => {
        this.showAlertMessage('danger', error.error || 'Failed to save draft.');
      }
    });
  }

  // Show alert messages
  showAlertMessage(type: string, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  // Get progress bar width
  getProgressWidth(): string {
    return `${(this.currentStep / 3) * 100}%`;
  }

  // Check if step is active
  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  // Check if step is completed
  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }
}
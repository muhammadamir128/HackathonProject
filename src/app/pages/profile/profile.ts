import {
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { Master } from '../../Service/master';

interface ProfileData {
  fullName: string;
  email: string;
  role: string;
  collegeName: string;
  bio: string;
  location: string;
  joinedAt: Date;
  avatarUrl: string | null;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const AVATAR_KEY = 'HackathonAvatar';

type Tab = 'overview' | 'submissions' | 'activity' | 'settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  profile: ProfileData = {
    fullName: 'Guest User',
    email: '',
    role: 'student',
    collegeName: '',
    bio: 'Passionate developer, hackathon enthusiast, and lifelong learner. Love building products that solve real problems.',
    location: 'Innovation City, CA',
    joinedAt: new Date('2025-09-12'),
    avatarUrl: null
  };

  activeTab: Tab = 'overview';
  editing = false;
  editModel: ProfileData = { ...this.profile };

  uploading = false;
  uploadError = '';

  showPasswordForm = false;
  pwdSubmitting = false;
  pwdSuccess = false;
  pwdError = '';
  pwdModel = { current: '', next: '', confirm: '' };
  pwdVisible = { current: false, next: false, confirm: false };

  skills: string[] = ['Angular', 'TypeScript', 'Node.js', 'Python', 'UI/UX', 'Docker', 'AWS'];
  newSkill = '';

  stats = [
    { label: 'Competitions Joined', value: 12, icon: 'trophy', variant: 'blue' },
    { label: 'Projects Submitted', value: 8, icon: 'file-code-o', variant: 'purple' },
    { label: 'Wins & Awards', value: 3, icon: 'star', variant: 'orange' },
    { label: 'Global Rank', value: '#147', icon: 'line-chart', variant: 'green' }
  ];

  recentSubmissions = [
    { title: 'AI Code Reviewer', event: 'AI Innovation Challenge', status: 'Approved', date: 'Apr 12, 2026' },
    { title: 'EcoTrack Mobile App', event: 'Green Tech Hackathon', status: 'Winner', date: 'Mar 28, 2026' },
    { title: 'DevPortal Dashboard', event: 'Web Dev Sprint', status: 'Under Review', date: 'Feb 19, 2026' },
    { title: 'CryptoLens Analytics', event: 'Fintech Builders', status: 'Rejected', date: 'Jan 05, 2026' }
  ];

  activity = [
    { icon: 'trophy', variant: 'orange', title: 'Won 1st place in Green Tech Hackathon', time: '2 days ago' },
    { icon: 'check', variant: 'green', title: 'Project "AI Code Reviewer" approved', time: '1 week ago' },
    { icon: 'upload', variant: 'blue', title: 'Submitted DevPortal Dashboard', time: '2 weeks ago' },
    { icon: 'user-plus', variant: 'purple', title: 'Joined Fintech Builders competition', time: '1 month ago' }
  ];

  badges = [
    { name: 'First Win', icon: 'trophy', color: 'gold' },
    { name: 'Early Adopter', icon: 'rocket', color: 'blue' },
    { name: 'Team Player', icon: 'users', color: 'purple' },
    { name: 'Code Warrior', icon: 'code', color: 'green' }
  ];

  private masterService = inject(Master);

  constructor(private router: Router) {}

  private notifyProfileUpdate(): void {
    this.masterService.$profileUpdate.next({
      avatarUrl: this.profile.avatarUrl,
      fullName: this.profile.fullName,
      email: this.profile.email
    });
  }

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const raw = localStorage.getItem('Hackathon');
    if (!raw) {
      this.router.navigateByUrl('/register');
      return;
    }
    try {
      const data = JSON.parse(raw);
      this.profile = {
        ...this.profile,
        fullName: data.fullName || data.name || this.deriveNameFromEmail(data.email),
        email: data.email || '',
        role: data.role || 'student',
        collegeName: data.collegeName || 'Not specified',
        avatarUrl: localStorage.getItem(AVATAR_KEY)
      };
      this.editModel = { ...this.profile };
    } catch {
      // keep defaults
    }
  }

  onAvatarPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadError = '';

    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please choose an image file.';
      this.clearErrorLater();
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      this.uploadError = 'Image is too large (max 2 MB).';
      this.clearErrorLater();
      return;
    }

    this.uploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      this.profile.avatarUrl = dataUrl;
      this.editModel.avatarUrl = dataUrl;
      try {
        localStorage.setItem(AVATAR_KEY, dataUrl);
      } catch {
        this.uploadError = 'Storage is full. Try a smaller image.';
        this.clearErrorLater();
      }
      this.uploading = false;
      this.notifyProfileUpdate();
    };
    reader.onerror = () => {
      this.uploading = false;
      this.uploadError = 'Could not read the image file.';
      this.clearErrorLater();
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.profile.avatarUrl = null;
    this.editModel.avatarUrl = null;
    localStorage.removeItem(AVATAR_KEY);
    this.notifyProfileUpdate();
  }

  private clearErrorLater(): void {
    setTimeout(() => (this.uploadError = ''), 4000);
  }

  private deriveNameFromEmail(email?: string): string {
    if (!email) return 'User';
    const local = email.split('@')[0];
    return local
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ') || 'User';
  }

  get initials(): string {
    const name = this.profile.fullName || this.profile.email || 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  startEdit(): void {
    this.editModel = { ...this.profile };
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
  }

  saveEdit(): void {
    this.profile = { ...this.editModel };
    const raw = localStorage.getItem('Hackathon');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const merged = {
          ...data,
          fullName: this.profile.fullName,
          email: this.profile.email,
          role: this.profile.role,
          collegeName: this.profile.collegeName
        };
        localStorage.setItem('Hackathon', JSON.stringify(merged));
      } catch {
        // ignore
      }
    }
    this.editing = false;
    this.notifyProfileUpdate();
  }

  addSkill(): void {
    const s = this.newSkill.trim();
    if (!s) return;
    if (!this.skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      this.skills.push(s);
    }
    this.newSkill = '';
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter((s) => s !== skill);
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) this.resetPasswordForm();
  }

  togglePwdVisibility(field: 'current' | 'next' | 'confirm'): void {
    this.pwdVisible[field] = !this.pwdVisible[field];
  }

  get pwdStrength(): { label: string; level: number } {
    const p = this.pwdModel.next;
    if (!p) return { label: '', level: 0 };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
    return { label: labels[score], level: score };
  }

  submitPasswordChange(): void {
    this.pwdError = '';
    this.pwdSuccess = false;

    const { current, next, confirm } = this.pwdModel;
    if (!current || !next || !confirm) {
      this.pwdError = 'All fields are required.';
      return;
    }
    if (next.length < 8) {
      this.pwdError = 'New password must be at least 8 characters.';
      return;
    }
    if (next === current) {
      this.pwdError = 'New password must be different from the current one.';
      return;
    }
    if (next !== confirm) {
      this.pwdError = 'New password and confirmation do not match.';
      return;
    }

    const email = this.profile.email?.trim();
    if (!email) {
      this.pwdError = 'Unable to identify your account. Please log in again.';
      return;
    }

    this.pwdSubmitting = true;
    this.masterService
      .updatePassword({
        email,
        currentPassword: current,
        newPassword: next
      })
      .subscribe({
        next: (res: any) => {
          this.pwdSubmitting = false;
          this.pwdSuccess = true;
          this.resetPasswordForm();
          this.showPasswordForm = false;
          this.syncStoredPassword(next);
          setTimeout(() => (this.pwdSuccess = false), 4000);
        },
        error: (err) => {
          this.pwdSubmitting = false;
          this.pwdError = this.extractErrorMessage(err);
        }
      });
  }

  private syncStoredPassword(newPwd: string): void {
    const raw = localStorage.getItem('Hackathon');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object' && 'password' in data) {
        data.password = newPwd;
        localStorage.setItem('Hackathon', JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'Something went wrong. Please try again.';
    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (err.status === 0) return 'Network error. Please check your connection.';
    if (err.status === 401 || err.status === 403) return 'Current password is incorrect.';
    if (err.status === 404) return 'Password update is not available on the server.';
    if (err.message) return err.message;
    return 'Unable to update password. Please try again.';
  }

  private resetPasswordForm(): void {
    this.pwdModel = { current: '', next: '', confirm: '' };
    this.pwdVisible = { current: false, next: false, confirm: false };
    this.pwdError = '';
  }

  statusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'winner') return 'winner';
    if (s === 'rejected') return 'rejected';
    return 'review';
  }
}

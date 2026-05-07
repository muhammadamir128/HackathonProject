import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { filter } from 'rxjs';

import { Master } from './Service/master';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('HackathonProjectApp');
  loggedData: any = null;
  avatarUrl: string | null = null;
  masterService = inject(Master);
  router = inject(Router);

  showChrome = true;
  dropdownOpen = false;
  navOpen = false;
  showLogoutConfirm = false;
  loggingOut = false;
  private chromeHiddenRoutes = ['/register', '/login'];

  @ViewChild('userMenuEl') userMenuEl?: ElementRef<HTMLElement>;

  constructor() {
    this.readLocalData();
    this.avatarUrl = localStorage.getItem('HackathonAvatar');

    this.masterService.$loginDone.subscribe((res: any) => {
      if (res) {
        this.loggedData = res;
        this.avatarUrl = localStorage.getItem('HackathonAvatar');
      }
    });

    this.masterService.$profileUpdate.subscribe((update) => {
      this.avatarUrl = update.avatarUrl;
      if (this.loggedData) {
        if (update.fullName) this.loggedData.fullName = update.fullName;
        if (update.email) this.loggedData.email = update.email;
      }
    });

    this.updateChromeVisibility(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateChromeVisibility(event.urlAfterRedirects);
        this.dropdownOpen = false;
        this.navOpen = false;
      });
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownOpen) return;
    const target = event.target as Node;
    if (this.userMenuEl && !this.userMenuEl.nativeElement.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showLogoutConfirm && !this.loggingOut) {
      this.showLogoutConfirm = false;
      return;
    }
    if (this.dropdownOpen) this.dropdownOpen = false;
    if (this.navOpen) this.navOpen = false;
  }

  get userInitial(): string {
    const name = this.loggedData?.fullName || this.loggedData?.email || 'U';
    return name.charAt(0).toUpperCase();
  }

  private updateChromeVisibility(url: string): void {
    const path = (url.split('?')[0] || '').toLowerCase();
    this.showChrome = !this.chromeHiddenRoutes.some((r) => path === r || path.startsWith(r + '/'));
  }

  readLocalData() {
    const localData = localStorage.getItem("Hackathon");
    if (localData != null) {
      try {
        this.loggedData = JSON.parse(localData);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("Hackathon");
      }
    }
  }

  openLogoutConfirm(): void {
    this.closeDropdown();
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    if (this.loggingOut) return;
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    if (this.loggingOut) return;
    this.loggingOut = true;
    setTimeout(() => {
      localStorage.removeItem('Hackathon');
      localStorage.removeItem('HackathonAvatar');
      this.loggedData = null;
      this.avatarUrl = null;
      this.loggingOut = false;
      this.showLogoutConfirm = false;
      this.router.navigateByUrl('/register');
    }, 650);
  }

  onLogOff() {
    this.openLogoutConfirm();
  }
}

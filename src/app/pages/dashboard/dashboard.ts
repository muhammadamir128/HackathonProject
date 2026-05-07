import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import {
  Chart,
  registerables,
} from 'chart.js';

import { Master } from '../../Service/master';

Chart.register(...registerables);

interface ActivityItem {
  icon: string;
  variant: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  title: string;
  time: string;
}

interface CompetitionRow {
  title: string;
  date: string;
  participants: number;
  status: 'Active' | 'Upcoming' | 'Completed';
}

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  masterService = inject(Master);

  @ViewChild('competitionChart') competitionCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('submissionChart') submissionCanvas?: ElementRef<HTMLCanvasElement>;

  private competitionChartInstance?: Chart;
  private submissionChartInstance?: Chart;

  userName = 'Developer';
  currentDate = new Date();

  totalUsers = 0;
  totalCompetitions = 0;
  totalSubmissions = 0;
  winnersDeclared = 0;

  notification: { title: string; content: string; show: boolean } = {
    title: '',
    content: '',
    show: false
  };

  recentActivities: ActivityItem[] = [
    { icon: 'trophy', variant: 'orange', title: 'Winners declared for AI Innovation Challenge', time: '2 hours ago' },
    { icon: 'check', variant: 'green', title: '15 new project submissions approved', time: '5 hours ago' },
    { icon: 'plus', variant: 'purple', title: 'New competition "Web Dev Sprint" created', time: '1 day ago' },
    { icon: 'user-plus', variant: 'blue', title: '25 new users registered', time: '2 days ago' },
    { icon: 'flag', variant: 'red', title: 'Green Tech Hackathon completed successfully', time: '3 days ago' }
  ];

  recentCompetitions: CompetitionRow[] = [
    { title: 'AI Innovation Challenge', date: 'Apr 18, 2026', participants: 248, status: 'Active' },
    { title: 'Web Dev Sprint', date: 'May 02, 2026', participants: 132, status: 'Upcoming' },
    { title: 'Green Tech Hackathon', date: 'Mar 20, 2026', participants: 315, status: 'Completed' },
    { title: 'Cybersecurity CTF', date: 'May 10, 2026', participants: 87, status: 'Upcoming' },
    { title: 'Fintech Builders', date: 'Apr 05, 2026', participants: 192, status: 'Active' }
  ];

  ngOnInit(): void {
    this.masterService.getAllCompetition().subscribe({
      next: (competitions) => {
        this.totalCompetitions = competitions?.length ?? 0;
        this.totalUsers = 426;
        this.totalSubmissions = 70;
        this.winnersDeclared = 5;
        queueMicrotask(() => this.animateCounters());
      },
      error: () => {
        this.totalCompetitions = 135;
        this.totalUsers = 426;
        this.totalSubmissions = 70;
        this.winnersDeclared = 5;
        queueMicrotask(() => this.animateCounters());
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCharts(), 0);
  }

  ngOnDestroy(): void {
    this.competitionChartInstance?.destroy();
    this.submissionChartInstance?.destroy();
  }

  animateCounters(): void {
    const counters = document.querySelectorAll<HTMLElement>('[data-count]');
    counters.forEach((counter) => {
      const targetAttr = counter.getAttribute('data-count');
      if (!targetAttr) return;
      const target = Number(targetAttr);
      if (!target) { counter.textContent = '0'; return; }
      const increment = Math.max(1, target / 40);
      let current = 0;

      const step = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.ceil(current).toString();
          requestAnimationFrame(step);
        } else {
          counter.textContent = target.toString();
        }
      };
      step();
    });
  }

  private initCharts(): void {
    this.renderCompetitionChart();
    this.renderSubmissionChart();
  }

  private renderCompetitionChart(): void {
    const canvas = this.competitionCanvas?.nativeElement;
    if (!canvas) return;

    this.competitionChartInstance?.destroy();

    this.competitionChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Upcoming', 'Active', 'Completed'],
        datasets: [{
          data: [30, 45, 25],
          backgroundColor: ['#3498db', '#9b59b6', '#2ecc71'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              font: { size: 13, family: "'Segoe UI', sans-serif" },
              color: '#2c3e50'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 13, weight: 600 },
            bodyFont: { size: 12 }
          }
        }
      }
    });
  }

  private renderSubmissionChart(): void {
    const canvas = this.submissionCanvas?.nativeElement;
    if (!canvas) return;

    this.submissionChartInstance?.destroy();

    const ctx = canvas.getContext('2d');
    let fill: string | CanvasGradient = '#3498db';
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(52, 152, 219, 0.95)');
      gradient.addColorStop(1, 'rgba(155, 89, 182, 0.75)');
      fill = gradient;
    }

    this.submissionChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Submissions',
          data: [12, 19, 25, 18, 32, 28],
          backgroundColor: fill,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 44
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { color: '#7f8c8d', font: { size: 12 } },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#7f8c8d', font: { size: 12 } },
            border: { display: false }
          }
        }
      }
    });
  }

  showNotification(title: string, content: string): void {
    this.notification = { title, content, show: true };
    setTimeout(() => (this.notification.show = false), 4500);
  }

  hideNotification(): void {
    this.notification.show = false;
  }

  onQuickAction(action: string): void {
    const messages: Record<string, string> = {
      'create': 'Navigate to the competition creation form to launch a new hackathon.',
      'invite': 'Send invitations to potential participants via email or share link.',
      'export': 'Generate and download platform reports in CSV or PDF format.'
    };
    const titles: Record<string, string> = {
      'create': 'Create Competition',
      'invite': 'Invite Participants',
      'export': 'Export Report'
    };
    this.showNotification(titles[action] ?? 'Action', messages[action] ?? '');
  }

  showMetricDetails(metric: string, value: number): void {
    this.showNotification(`${metric} Details`, `Total ${metric}: ${value}`);
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }
}

import { SlicePipe } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Master } from '../../Service/master';
import { CompetationModel } from '../models/Competation';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'upcoming' | 'completed';

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [FormsModule, RouterLink, SlicePipe],
  templateUrl: './submissions.html',
  styleUrls: ['./submissions.scss']
})
export class Submissions implements OnInit {
  masterService = inject(Master);

  competitions: CompetationModel[] = [];
  loading = true;

  searchTerm = '';
  statusFilter: StatusFilter = 'all';
  viewMode: ViewMode = 'grid';

  pageSize = 9;
  currentPage = 1;

  ngOnInit(): void {
    this.masterService.getAllCompetition().subscribe({
      next: (data) => {
        this.competitions = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.competitions = [];
        this.loading = false;
      }
    });
  }

  get filtered(): CompetationModel[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.competitions.filter((c) => {
      const matchesSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      const matchesStatus =
        this.statusFilter === 'all' ||
        (c.status ?? '').toLowerCase() === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get paged(): CompetationModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalCount(): number { return this.competitions.length; }

  get activeCount(): number {
    return this.competitions.filter((c) => (c.status ?? '').toLowerCase() === 'active').length;
  }

  get upcomingCount(): number {
    return this.competitions.filter((c) => (c.status ?? '').toLowerCase() === 'upcoming').length;
  }

  get completedCount(): number {
    return this.competitions.filter((c) => (c.status ?? '').toLowerCase() === 'completed').length;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  setFilter(status: StatusFilter): void {
    this.statusFilter = status;
    this.currentPage = 1;
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  statusClass(status?: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'active') return 'active';
    if (s === 'upcoming') return 'upcoming';
    if (s === 'completed') return 'completed';
    return 'default';
  }

  mockSubmissionCount(id: number): number {
    return ((id * 7) % 40) + 12;
  }
}

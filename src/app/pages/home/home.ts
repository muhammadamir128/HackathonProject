import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Master } from '../../Service/master';
import { CompetationModel } from '../models/Competation';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  competitions: CompetationModel[] = [];
  masterService = inject(Master);

  pageSize = 9;
  currentPage = 1;

  ngOnInit(): void {
    this.masterService.getAllCompetition().subscribe({
      next: (data) => {
        this.competitions = data ?? [];
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.competitions.length / this.pageSize));
  }

  get pagedCompetitions(): CompetationModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.competitions.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    const section = document.getElementById('competitions');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }
}

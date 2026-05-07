import { CommonModule } from '@angular/common';
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
  selector: 'event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event.html',
  styleUrls: ['./event.scss']
})
export class Event implements OnInit {
  CompetationObj: CompetationModel = new CompetationModel();
  masterService = inject(Master);
  gridData: CompetationModel[] = [];
  isEditMode = false;
  currentEditId: number | null = null;

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData() {
    this.masterService.getAllCompetition().subscribe({
      next: (res: CompetationModel[]) => {
        this.gridData = res;
      },
      error: (error) => {
        console.error('Error while fetching competitions:', error);
        alert(error?.error || 'Failed to load competitions');
      },
    });
  }

  onSave() {
    if (this.isEditMode && this.currentEditId !== null) {
      // Update existing competition
      this.masterService.onUpdateCompetition(this.currentEditId, this.CompetationObj).subscribe({
        next: () => {
          alert('Competition Updated');
          this.resetForm();
          this.getAllData();
        },
        error: (error) => {
          console.error('Error while updating competition:', error);
          alert(error?.error || 'Failed to update competition');
        },
      });
    } else {
      // Create new competition
      this.masterService.onSaveCompetatation(this.CompetationObj).subscribe({
        next: () => {
          alert('Competition Created');
          this.resetForm();
          this.getAllData();
        },
        error: (error) => {
          console.error('Error while saving competition:', error);
          alert(error?.error || 'Failed to save competition');
        },
      });
    }
  }

  editCompetition(competition: CompetationModel) {
    this.CompetationObj = { ...competition };
    this.isEditMode = true;
    this.currentEditId = competition.competitionId;
    document.getElementById('form-title')!.textContent = 'Edit Competition';
  }

  deleteCompetition(id: number) {
    if (confirm('Are you sure you want to delete this competition?')) {
      this.masterService.deleteCompetition(id).subscribe({
        next: () => {
          alert('Competition Deleted');
          this.getAllData();
        },
        error: (error) => {
          console.error('Error while deleting competition:', error);
          alert(error?.error || 'Failed to delete competition');
        },
      });
    }
  }

  resetForm() {
    this.CompetationObj = new CompetationModel();
    this.isEditMode = false;
    this.currentEditId = null;
    document.getElementById('form-title')!.textContent = 'Add New Competition';
  }

  cancelForm() {
    this.resetForm();
  }
}
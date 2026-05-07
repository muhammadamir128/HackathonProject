import {
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { Master } from '../../Service/master';

@Component({
  selector: 'project-submission',
  imports:[BrowserModule, FormsModule],
  templateUrl: './project-submission.html',
  styleUrls: ['./project-submission.scss']
})
export class ProjectSubmission {
  currentCompetationId: number = 0;
  master = inject(Master);
  submissionList: any[] = [];
  filteredList: any[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';

  constructor(private activeRoute: ActivatedRoute) {
    this.activeRoute.params.subscribe((res: any) => {
      this.currentCompetationId = res.id;
      this.getAllSubmission();
    });
  }

  getAllSubmission() {
    this.master.getAllSubmissionByCompetationId(this.currentCompetationId).subscribe((Res: any) => {
      this.submissionList = Res;
      this.filterSubmissions();
    });
  }

  filterSubmissions() {
    this.filteredList = this.submissionList.filter(item => {
      const matchesSearch =
        item.projectTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.FullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'all' ||
        item.Status.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  onApprove(submissionId: number) {
    this.master.approvProject(submissionId).subscribe(
      (res: any) => {
        this.getAllSubmission();
      },
      error => {
        console.error('Error approving project:', error);
        alert('Failed to approve project');
      }
    );
  }

  onReject(submissionId: number) {
    if (confirm('Are you sure you want to reject this submission?')) {
      this.master.rejectProject(submissionId).subscribe(
        (res: any) => {
          this.getAllSubmission();
        },
        error => {
          console.error('Error rejecting project:', error);
          alert('Failed to reject project');
        }
      );
    }
  }

  // ✅ Stats getters (instead of using .filter in template)
  get totalSubmissions(): number {
    return this.submissionList?.length || 0;
  }

  get approvedCount(): number {
    return this.submissionList?.filter(
      s => s.Status?.toLowerCase() === 'approved'
    ).length || 0;
  }

  get underReviewCount(): number {
    return this.submissionList?.filter(
      s => s.Status?.toLowerCase() === 'under review'
    ).length || 0;
  }

  get rejectedCount(): number {
    return this.submissionList?.filter(
      s => s.Status?.toLowerCase() === 'rejected'
    ).length || 0;
  }
}

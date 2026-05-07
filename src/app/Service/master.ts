import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { CompetationModel } from '../pages/models/Competation';

@Injectable({
  providedIn: 'root'
})
export class Master {
  $loginDone: Subject<any> = new Subject<any>();
  $profileUpdate: Subject<{ avatarUrl: string | null; fullName?: string; email?: string }> = new Subject();
  apiUrl: string = "https://api.freeprojectapi.com/api/ProjectCompetition/";

  constructor(private http: HttpClient) { }

  onSaveCompetatation(data: CompetationModel) {
    return this.http.post(this.apiUrl + "Competition", data);
  }

  onUpdateCompetition(id: number, data: CompetationModel) {
    return this.http.put(`${this.apiUrl}Competition/${id}`, data);
  }

  deleteCompetition(id: number) {
    return this.http.delete(`${this.apiUrl}Competition/${id}`);
  }

  saveDraftProject(data: any) {
    return this.http.post(this.apiUrl + "project", data);
  }

  getAllCompetition() {
    return this.http.get<CompetationModel[]>(`${this.apiUrl}GetAllCompetition`);
  }

  getAllSubmissionByCompetationId(CompletitaionId: number) {
    return this.http.get<CompetationModel[]>(`${this.apiUrl}project/byCompetition/${CompletitaionId}`);
  }

  approvProject(projectSubId: number) {
    return this.http.put(`${this.apiUrl}project/approve/${projectSubId}`, {});
  }

  rejectProject(projectSubId: number) {
    return this.http.put(`${this.apiUrl}project/reject/${projectSubId}`, {});
  }

  updatePassword(payload: { email: string; currentPassword: string; newPassword: string }) {
    return this.http.put(`${this.apiUrl}UpdatePassword`, payload);
  }
}
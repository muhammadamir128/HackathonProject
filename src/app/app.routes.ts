import { Routes } from '@angular/router';

import { Contact } from './pages/contact/contact';
import { Dashboard } from './pages/dashboard/dashboard';
import { Event } from './pages/event/event';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';
import {
  ProjectSubmission,
} from './pages/project-submission/project-submission';
import { RegisterEvent } from './pages/register-event/register-event';
import { Register } from './pages/register/register';
import { Submissions } from './pages/submissions/submissions';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home',component: Home},
    {path:'register',component: Register},
    {path:'event',component: Event},
    {path:'dashboard',component: Dashboard},
    {path:'contact',component: Contact},
    {path:'profile',component: Profile},
    {path:'submission',component: Submissions},
    {path:'projectsubmit/:id',component: RegisterEvent},
    {path:'submission/:id',component: ProjectSubmission},
];

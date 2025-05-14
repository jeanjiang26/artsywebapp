import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { SearchComponent } from './search/search.component';
import { FavoritesComponent } from './favorites/favorites.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  //{ path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'favorites', component: FavoritesComponent },

  {
    path: 'search/:artistId',
    loadComponent: () => import('./search/search.component').then(m => m.SearchComponent)
  },

  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  


  { path: '', redirectTo: 'login', pathMatch: 'full' }


];



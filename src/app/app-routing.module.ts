import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule'
  },
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomePageModule'
  },
  {
    path: 'map',
    loadChildren: './pages/map/map.module#EsriMapModule'
  },
  { path: 'test', loadChildren: './pages/test/test.module#TestPageModule' },
  {
    path: 'resource',
    loadChildren:
      './pages/resource-gallery/resource-gallery.module#ResourceGalleryPageModule'
  },
  {
    path: 'my-approval',
    loadChildren: './pages/my-approval/my-approval.module#MyApprovalPageModule'
  },
  {
    path: 'my-request',
    loadChildren: './pages/my-request/my-request.module#MyRequestPageModule'
  },
  {
    path: 'app-config',
    loadChildren: './pages/app-config/app-config.module#AppConfigPageModule'
  },
  {
    path: 'my-profile',
    loadChildren: './pages/my-profile/my-profile.module#MyProfilePageModule'
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

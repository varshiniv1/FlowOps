import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <div class="layout">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="sidenavOpen = !sidenavOpen">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="brand">FlowOps</span>
        <span class="spacer"></span>
        <span class="user-info">{{ auth.user()?.fullName }}</span>
        <button mat-button (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav [opened]="sidenavOpen" mode="side" class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/products" routerLinkActive="active">
              <mat-icon matListItemIcon>inventory_2</mat-icon>
              <span matListItemTitle>Products</span>
            </a>
            <a mat-list-item routerLink="/orders" routerLinkActive="active">
              <mat-icon matListItemIcon>receipt_long</mat-icon>
              <span matListItemTitle>Orders</span>
            </a>
            <a mat-list-item routerLink="/inventory" routerLinkActive="active">
              <mat-icon matListItemIcon>warehouse</mat-icon>
              <span matListItemTitle>Inventory</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout { display: flex; flex-direction: column; height: 100vh; }
    .toolbar { position: sticky; top: 0; z-index: 1000; }
    .brand { margin-left: 8px; font-weight: 600; }
    .spacer { flex: 1; }
    .user-info { margin-right: 16px; font-size: 14px; }
    .sidenav-container { flex: 1; }
    .sidenav { width: 220px; }
    .content { padding: 24px; }
    .active { background: rgba(0, 0, 0, 0.04); }
  `]
})
export class LayoutComponent {
  sidenavOpen = true;

  constructor(public auth: AuthService) {}
}

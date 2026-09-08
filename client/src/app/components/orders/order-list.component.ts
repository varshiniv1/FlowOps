import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/api.models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatSelectModule, MatFormFieldModule, MatChipsModule],
  template: `
    <div class="page-header">
      <h2>Orders</h2>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filter by status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadOrders()">
            <mat-option value="">All</mat-option>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Fulfilled">Fulfilled</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" routerLink="/orders/new">
          <mat-icon>add</mat-icon> New Order
        </button>
      </div>
    </div>

    <mat-card>
      <table mat-table [dataSource]="orders" class="full-width">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>Order ID</th>
          <td mat-cell *matCellDef="let o">{{ o.id | slice:0:8 }}...</td>
        </ng-container>
        <ng-container matColumnDef="customer">
          <th mat-header-cell *matHeaderCellDef>Customer</th>
          <td mat-cell *matCellDef="let o">{{ o.customerName }}</td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let o">{{ o.total | currency }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let o">
            <span class="status-chip" [class]="'status-' + o.status.toLowerCase()">{{ o.status }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Created</th>
          <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'short' }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let o">
            <a mat-icon-button [routerLink]="['/orders', o.id]">
              <mat-icon>visibility</mat-icon>
            </a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .filter-field { width: 180px; }
    .full-width { width: 100%; }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-fulfilled { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  statusFilter = '';
  displayedColumns = ['id', 'customer', 'total', 'status', 'date', 'actions'];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAll(this.statusFilter || undefined).subscribe(data => this.orders = data);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/api.models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatDividerModule, MatSnackBarModule],
  template: `
    @if (order) {
      <div class="page-header">
        <h2>Order {{ order.id | slice:0:8 }}...</h2>
        <span class="status-chip" [class]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
      </div>

      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-grid">
            <div><strong>Customer:</strong> {{ order.customerName }}</div>
            <div><strong>Email:</strong> {{ order.customerEmail }}</div>
            <div><strong>Total:</strong> {{ order.total | currency }}</div>
            <div><strong>Created:</strong> {{ order.createdAt | date:'medium' }}</div>
          </div>
        </mat-card-content>
      </mat-card>

      <h3>Items</h3>
      <mat-card>
        <table mat-table [dataSource]="order.items" class="full-width">
          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
          </ng-container>
          <ng-container matColumnDef="unitPrice">
            <th mat-header-cell *matHeaderCellDef>Unit Price</th>
            <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency }}</td>
          </ng-container>
          <ng-container matColumnDef="subtotal">
            <th mat-header-cell *matHeaderCellDef>Subtotal</th>
            <td mat-cell *matCellDef="let item">{{ item.quantity * item.unitPrice | currency }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['product', 'quantity', 'unitPrice', 'subtotal']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['product', 'quantity', 'unitPrice', 'subtotal'];"></tr>
        </table>
      </mat-card>

      <div class="actions-bar">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Back to Orders
        </button>
        @if (order.status === 'Pending') {
          <div class="status-actions">
            <button mat-raised-button color="primary" (click)="updateStatus('Fulfilled')">Mark Fulfilled</button>
            <button mat-raised-button color="warn" (click)="updateStatus('Cancelled')">Cancel Order</button>
          </div>
        }
        @if (order.status === 'Fulfilled') {
          <button mat-raised-button color="warn" (click)="updateStatus('Cancelled')">Cancel Order</button>
        }
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .info-card { margin-bottom: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full-width { width: 100%; }
    .actions-bar { display: flex; justify-content: space-between; margin-top: 24px; }
    .status-actions { display: flex; gap: 8px; }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-fulfilled { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.orderService.getById(id).subscribe(data => this.order = data);
  }

  updateStatus(status: string) {
    this.orderService.updateStatus(this.order!.id, status).subscribe({
      next: () => {
        this.order!.status = status;
        this.snackBar.open(`Order ${status.toLowerCase()}`, 'Close', { duration: 2000 });
      },
      error: (err) => this.snackBar.open(err.error || 'Status update failed', 'Close', { duration: 3000 })
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}

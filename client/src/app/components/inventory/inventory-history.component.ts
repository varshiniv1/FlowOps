import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { InventoryAdjustment, Product } from '../../models/api.models';

@Component({
  selector: 'app-inventory-history',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h2>Inventory — {{ product?.name || 'Select a product' }}</h2>
    </div>

    @if (!productId) {
      <mat-card>
        <mat-card-content>
          <p>Select a product from the Products page to view its inventory history.</p>
        </mat-card-content>
      </mat-card>
    } @else {
      @if (auth.isAdmin()) {
        <mat-card class="adjust-card">
          <mat-card-header><mat-card-title>Adjust Stock</mat-card-title></mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="submitAdjustment()" class="adjust-form">
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="adjustForm.type" name="type" required>
                  <mat-option value="Restock">Restock</mat-option>
                  <mat-option value="ManualCorrection">Manual Correction</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Quantity Change</mat-label>
                <input matInput type="number" [(ngModel)]="adjustForm.quantityChange" name="quantityChange" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reason</mat-label>
                <input matInput [(ngModel)]="adjustForm.reason" name="reason">
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit">Submit</button>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <h3>History</h3>
      <mat-card>
        <table mat-table [dataSource]="adjustments" class="full-width">
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let a">{{ a.type }}</td>
          </ng-container>
          <ng-container matColumnDef="quantityChange">
            <th mat-header-cell *matHeaderCellDef>Qty Change</th>
            <td mat-cell *matCellDef="let a" [class.positive]="a.quantityChange > 0" [class.negative]="a.quantityChange < 0">
              {{ a.quantityChange > 0 ? '+' : '' }}{{ a.quantityChange }}
            </td>
          </ng-container>
          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Reason</th>
            <td mat-cell *matCellDef="let a">{{ a.reason || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let a">{{ a.createdAt | date:'short' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['type', 'quantityChange', 'reason', 'date']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['type', 'quantityChange', 'reason', 'date'];"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .adjust-card { margin-bottom: 24px; }
    .adjust-form { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .full-width { width: 100%; }
    .positive { color: #2e7d32; font-weight: 500; }
    .negative { color: #c62828; font-weight: 500; }
  `]
})
export class InventoryHistoryComponent implements OnInit {
  productId = '';
  product: Product | null = null;
  adjustments: InventoryAdjustment[] = [];
  adjustForm = { type: 'Restock', quantityChange: 0, reason: '' };

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private productService: ProductService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.params['productId'] || '';
    if (this.productId) {
      this.productService.getById(this.productId).subscribe(p => this.product = p);
      this.loadHistory();
    }
  }

  loadHistory() {
    this.inventoryService.getHistory(this.productId).subscribe(data => this.adjustments = data);
  }

  submitAdjustment() {
    this.inventoryService.adjust(this.productId, this.adjustForm).subscribe({
      next: () => {
        this.snackBar.open('Inventory adjusted', 'Close', { duration: 2000 });
        this.loadHistory();
        this.adjustForm = { type: 'Restock', quantityChange: 0, reason: '' };
      },
      error: (err) => this.snackBar.open(err.error || 'Adjustment failed', 'Close', { duration: 3000 })
    });
  }
}

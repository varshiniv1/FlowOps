import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { Product, CreateOrderRequest } from '../../models/api.models';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule],
  template: `
    <h2>Create Order</h2>
    <mat-card>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Customer Name</mat-label>
            <input matInput [(ngModel)]="customerName" name="customerName" required>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Customer Email</mat-label>
            <input matInput type="email" [(ngModel)]="customerEmail" name="customerEmail" required>
          </mat-form-field>

          <h3>Order Items</h3>
          @for (item of items; track $index) {
            <div class="item-row">
              <mat-form-field appearance="outline" class="product-select">
                <mat-label>Product</mat-label>
                <mat-select [(ngModel)]="item.productId" [name]="'product-' + $index" required>
                  @for (p of products; track p.id) {
                    <mat-option [value]="p.id">{{ p.name }} ({{ p.quantityOnHand }} in stock)</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="qty-field">
                <mat-label>Qty</mat-label>
                <input matInput type="number" [(ngModel)]="item.quantity" [name]="'qty-' + $index" required min="1">
              </mat-form-field>
              <button mat-icon-button type="button" color="warn" (click)="removeItem($index)" [disabled]="items.length === 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
          <button mat-stroked-button type="button" (click)="addItem()">
            <mat-icon>add</mat-icon> Add Item
          </button>

          <div class="form-actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-raised-button color="primary" type="submit">Place Order</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; max-width: 600px; gap: 4px; }
    .item-row { display: flex; gap: 12px; align-items: center; }
    .product-select { flex: 1; }
    .qty-field { width: 100px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class OrderCreateComponent implements OnInit {
  customerName = '';
  customerEmail = '';
  items = [{ productId: '', quantity: 1 }];
  products: Product[] = [];

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.productService.getAll().subscribe(data => this.products = data);
  }

  addItem() {
    this.items.push({ productId: '', quantity: 1 });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  onSubmit() {
    const request: CreateOrderRequest = {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      items: this.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
    };
    this.orderService.create(request).subscribe({
      next: (order) => {
        this.snackBar.open('Order created', 'Close', { duration: 2000 });
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => this.snackBar.open(err.error || 'Failed to create order', 'Close', { duration: 3000 })
    });
  }

  cancel() {
    this.router.navigate(['/orders']);
  }
}

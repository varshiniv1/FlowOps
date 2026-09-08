import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2>{{ isEdit ? 'Edit Product' : 'New Product' }}</h2>
    <mat-card>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()" class="form-grid">
          @if (!isEdit) {
            <mat-form-field appearance="outline">
              <mat-label>SKU</mat-label>
              <input matInput [(ngModel)]="form.sku" name="sku" required>
            </mat-form-field>
          }
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="form.name" name="name" required>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="form.description" name="description" rows="3"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Price</mat-label>
            <input matInput type="number" [(ngModel)]="form.price" name="price" required min="0" step="0.01">
          </mat-form-field>
          @if (!isEdit) {
            <mat-form-field appearance="outline">
              <mat-label>Initial Stock</mat-label>
              <input matInput type="number" [(ngModel)]="form.quantityOnHand" name="quantityOnHand" required min="0">
            </mat-form-field>
          }
          <div class="form-actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-raised-button color="primary" type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; max-width: 500px; gap: 4px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
  `]
})
export class ProductFormComponent implements OnInit {
  isEdit = false;
  productId = '';
  form = { sku: '', name: '', description: '', price: 0, quantityOnHand: 0 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.productId;
    if (this.isEdit) {
      this.productService.getById(this.productId).subscribe(p => {
        this.form = { sku: p.sku, name: p.name, description: p.description || '', price: p.price, quantityOnHand: p.quantityOnHand };
      });
    }
  }

  onSubmit() {
    if (this.isEdit) {
      this.productService.update(this.productId, { name: this.form.name, description: this.form.description, price: this.form.price }).subscribe({
        next: () => { this.snackBar.open('Product updated', 'Close', { duration: 2000 }); this.router.navigate(['/products']); },
        error: (err) => this.snackBar.open(err.error || 'Update failed', 'Close', { duration: 3000 })
      });
    } else {
      this.productService.create(this.form).subscribe({
        next: () => { this.snackBar.open('Product created', 'Close', { duration: 2000 }); this.router.navigate(['/products']); },
        error: (err) => this.snackBar.open(err.error || 'Create failed', 'Close', { duration: 3000 })
      });
    }
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}

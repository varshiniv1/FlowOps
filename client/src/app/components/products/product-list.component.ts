import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/api.models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="page-header">
      <h2>Products</h2>
      @if (auth.isAdmin()) {
        <button mat-raised-button color="primary" routerLink="/products/new">
          <mat-icon>add</mat-icon> Add Product
        </button>
      }
    </div>

    <mat-card>
      <table mat-table [dataSource]="products" class="full-width">
        <ng-container matColumnDef="image">
          <th mat-header-cell *matHeaderCellDef>Image</th>
          <td mat-cell *matCellDef="let p">
            @if (p.imageUrl) {
              <img [src]="p.imageUrl" alt="{{ p.name }}" class="product-thumb">
            } @else {
              <mat-icon class="no-image">image</mat-icon>
            }
          </td>
        </ng-container>
        <ng-container matColumnDef="sku">
          <th mat-header-cell *matHeaderCellDef>SKU</th>
          <td mat-cell *matCellDef="let p">{{ p.sku }}</td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let p">{{ p.name }}</td>
        </ng-container>
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let p">{{ p.price | currency }}</td>
        </ng-container>
        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Stock</th>
          <td mat-cell *matCellDef="let p">{{ p.quantityOnHand }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let p">
            <a mat-icon-button [routerLink]="['/products', p.id, 'edit']" *ngIf="auth.isAdmin()">
              <mat-icon>edit</mat-icon>
            </a>
            <a mat-icon-button [routerLink]="['/inventory', p.id]">
              <mat-icon>history</mat-icon>
            </a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .product-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .no-image { color: #ccc; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns = ['image', 'sku', 'name', 'price', 'quantity', 'actions'];

  constructor(private productService: ProductService, public auth: AuthService) {}

  ngOnInit() {
    this.productService.getAll().subscribe(data => this.products = data);
  }
}

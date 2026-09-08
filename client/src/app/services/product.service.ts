import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Product, CreateProductRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Product[]>(this.url);
  }

  getById(id: string) {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  create(product: CreateProductRequest) {
    return this.http.post<Product>(this.url, product);
  }

  update(id: string, product: { name: string; description?: string; price: number }) {
    return this.http.put<Product>(`${this.url}/${id}`, product);
  }

  uploadImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.url}/${id}/image`, formData);
  }

  deleteImage(id: string) {
    return this.http.delete(`${this.url}/${id}/image`);
  }
}

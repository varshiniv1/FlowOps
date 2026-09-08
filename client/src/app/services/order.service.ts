import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Order, CreateOrderRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly url = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAll(status?: string) {
    if (status) {
      return this.http.get<Order[]>(this.url, { params: { status } });
    }
    return this.http.get<Order[]>(this.url);
  }

  getById(id: string) {
    return this.http.get<Order>(`${this.url}/${id}`);
  }

  create(order: CreateOrderRequest) {
    return this.http.post<Order>(this.url, order);
  }

  updateStatus(id: string, status: string) {
    return this.http.put(`${this.url}/${id}/status`, { status });
  }
}

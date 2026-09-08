import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { InventoryAdjustment } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly url = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getHistory(productId: string) {
    return this.http.get<InventoryAdjustment[]>(`${this.url}/${productId}/history`);
  }

  adjust(productId: string, request: { type: string; quantityChange: number; reason?: string }) {
    return this.http.post<InventoryAdjustment>(`${this.url}/${productId}/adjust`, request);
  }
}

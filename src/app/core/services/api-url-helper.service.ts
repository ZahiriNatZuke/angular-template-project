import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiUrlHelperService {

  private readonly _apiUrl: string;

  constructor() {
    this._apiUrl = environment['URL_API'];
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  public getSortDit = (dir: 1 | -1): 'ASC' | 'DESC' => dir === 1 ? 'ASC' : 'DESC';
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestService {

  constructor(private httpClient: HttpClient) {
  }

  public get = (url: string): Observable<any> => {
    return this.httpClient.get(url);
  };

  public post = (url: string, data: any): Observable<any> => {
    return this.httpClient.post(url, data);
  };

  public patch = (url: string, data: any): Observable<any> => {
    return this.httpClient.patch(url, data);
  };

  public put = (url: string, data: any): Observable<any> => {
    return this.httpClient.put(url, data);
  };

  public delete = (url: string): Observable<any> => {
    return this.httpClient.delete(url);
  };
}

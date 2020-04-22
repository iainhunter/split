import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareServiceService {
  private messageSource = new BehaviorSubject('--time--');
  predTime = this.messageSource.asObservable();

  private messageSourceDist = new BehaviorSubject('--dist--');
  predDistance = this.messageSourceDist.asObservable();

  constructor() { }

  public setPredTime(predTime) {
    this.messageSource.next(predTime)
  }
  public setRaceDist(predDistance) {
    this.messageSourceDist.next(predDistance)
  }
}

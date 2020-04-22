import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplittabComponent } from './splittab.component';

describe('SplittabComponent', () => {
  let component: SplittabComponent;
  let fixture: ComponentFixture<SplittabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplittabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplittabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

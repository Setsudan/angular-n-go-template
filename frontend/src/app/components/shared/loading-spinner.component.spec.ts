import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size of medium', () => {
    expect(component.size).toBe('medium');
  });

  it('should set size to small', () => {
    component.size = 'small';
    fixture.detectChanges();

    const spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement.classList.contains('small')).toBe(true);
  });

  it('should set size to large', () => {
    component.size = 'large';
    fixture.detectChanges();

    const spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement.classList.contains('large')).toBe(true);
  });

  it('should render spinner element', () => {
    const spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement).toBeTruthy();
  });

  it('should render spinner-inner element', () => {
    const spinnerInnerElement = fixture.nativeElement.querySelector('.spinner-inner');
    expect(spinnerInnerElement).toBeTruthy();
  });

  it('should apply correct CSS classes for medium size', () => {
    component.size = 'medium';
    fixture.detectChanges();

    const spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement.classList.contains('small')).toBe(false);
    expect(spinnerElement.classList.contains('large')).toBe(false);
  });

  it('should update size dynamically', () => {
    // Start with small
    component.size = 'small';
    fixture.detectChanges();
    let spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement.classList.contains('small')).toBe(true);

    // Change to large
    component.size = 'large';
    fixture.detectChanges();
    spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement.classList.contains('small')).toBe(false);
    expect(spinnerElement.classList.contains('large')).toBe(true);

    // Change to medium
    component.size = 'medium';
    fixture.detectChanges();
    spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement.classList.contains('small')).toBe(false);
    expect(spinnerElement.classList.contains('large')).toBe(false);
  });

  it('should have proper HTML structure', () => {
    const compiled = fixture.nativeElement;
    const spinner = compiled.querySelector('.spinner');
    const spinnerInner = compiled.querySelector('.spinner-inner');

    expect(spinner).toBeTruthy();
    expect(spinnerInner).toBeTruthy();
    expect(spinner.contains(spinnerInner)).toBe(true);
  });

  it('should be standalone component', () => {
    expect(LoadingSpinnerComponent).toBeDefined();
    expect(component).toBeInstanceOf(LoadingSpinnerComponent);
  });
});

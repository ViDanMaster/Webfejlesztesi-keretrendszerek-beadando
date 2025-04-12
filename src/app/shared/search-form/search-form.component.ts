import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent {
  @Output() search = new EventEmitter<string>();
  
  searchForm = new FormGroup({
    searchTerm: new FormControl('')
  });
  
  constructor() {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.search.emit(value || '');
      });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';
    this.search.emit(searchTerm);
  }
}
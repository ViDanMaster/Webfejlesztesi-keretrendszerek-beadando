import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { SearchFormComponent } from '../search-form/search-form.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbar, SearchFormComponent, MatIcon, MatButtonModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() search = new EventEmitter<string>();
  
  onSearch(searchTerm: string): void {
    console.log('NavbarComponent forwarding search term:', searchTerm);
    this.search.emit(searchTerm);
  }
}

import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidevarComponent } from '../sidevar/sidevar.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [HeaderComponent,SidevarComponent,FooterComponent, RouterModule],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      sidebar.classList.remove('sidebar-open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

}

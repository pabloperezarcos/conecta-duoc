import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Conecta-DUOC';
  mostrarNavbar = true;
  mostrarFooter = true;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.getChild(this.route);
        const data: Data = currentRoute.snapshot.data;

        this.mostrarNavbar = data['showNavbar'] !== false;
        this.mostrarFooter = data['showFooter'] !== false;
      });
  }

  private getChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}

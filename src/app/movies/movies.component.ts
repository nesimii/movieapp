import { Component, OnInit } from '@angular/core';
import { Movie } from "./movie.model";
import { AlertifyService } from "../shared/alertify.service";
import { User } from "../auth/user.model";
import { MovieService } from "./movie.service";
import { CategoryService } from "../category/category.service";
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
  providers: [MovieService]
})
export class MoviesComponent implements OnInit {

  title = "Film Listesi";
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  userId: string;
  favMovieList: string[] = [];
  popularMovies: Movie[];
  filterText: string = "";
  error: any;
  loading: boolean = false;

  constructor(
    private alertify: AlertifyService,
    private movieService: MovieService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      if (user) {
        this.userId = user.id;

        this.activatedRoute.params.subscribe(params => {

          this.loading = true;

          this.movieService.getMovies(params['categoryId']).subscribe(data => {
            this.movies = data;
            this.filteredMovies = this.movies;

            this.movieService.getFavList(this.userId).subscribe(data => {
              this.favMovieList = data;
              console.log(this.favMovieList);
            });

            this.loading = false;
          }, error => {
            this.error = error;
            this.loading = false;
          });
        });
      }
    });
  }

  onInputChange() {
    this.filteredMovies = this.filterText ?
      this.movies.filter(m => m.title.indexOf(this.filterText) !== -1 ||
        m.description.indexOf(this.filterText) !== -1) : this.movies;
  }

  addToList($event: any, movie: Movie) {
    if ($event.target.classList.contains('btn-primary')) {
      $event.target.classList.remove('btn-primary');
      $event.target.classList.add('btn-danger');
      $event.target.innerText = "Remove from List";

      this.movieService
        .adToMyList({ userId: this.userId, movieId: movie.id })
        .subscribe(() => this.alertify.success(movie.title + ' added to list'));
    } else {
      $event.target.classList.add('btn-primary');
      $event.target.classList.remove('btn-danger');
      $event.target.innerText = "Add to List";

      this.movieService
        .removeFromMyList({ userId: this.userId, movieId: movie.id })
        .subscribe(() => this.alertify.error(movie.title + 'removed from list'));
    }

    console.log(movie.title);
    console.log($event.target.classList);
  }

  getButtonState(movie: Movie) {
    return this.favMovieList.findIndex(m => m === movie.id) > -1;
  }
}

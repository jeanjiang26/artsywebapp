import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewEncapsulation  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SearchComponent implements OnInit, OnDestroy {
  artistName: string = '';
  results: any[] = [];
  isLoading = false;
  error = '';

  isAuthenticated = false;
  private authSub!: Subscription;

  selectedArtistId: string | null = null;
  selectedArtist: any = null;
  isArtistLoading = false;

  isSearching: boolean = false;  


  similarArtists: any[] = [];
  isSimilarLoading = false;

  isUpdatingArtist = true

  favoriteArtists: any[] = [];

  activeTab: 'info' | 'artworks' = 'info';

  artworks: any[] = [];
  isArtworksLoading = false;
  artworksError = '';

  selectedArtwork: any = null;
  showCategoryModal = false;

  categories: any[] = [];
  isCategoryLoading = false;
  categoryError = '';

  searchAttempted = false;

  selectedCardId: string | null = null;

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  notifications: Array<{ id: string, message: string, type: 'success' | 'danger' }> = [];
  nextNotificationId = 0;

  triggeredFromSimilarArtist = false;

  constructor(private http: HttpClient, private authService: AuthService, private route: ActivatedRoute) {}

  

  ngOnInit(): void {
    console.log('SearchComponent ngOnInit called');
    this.authSub = this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  
    this.fetchFavorites();
  
    const artistId = this.route.snapshot.paramMap.get('artistId');
    if (artistId) {
      this.artistName = '';
      this.results = [];
      this.loadArtistDetails(artistId);
      console.log('Artist ID from route:', artistId);
    } else {
      console.log('No artist ID in route, checking session storage...');
      const lastViewedArtistId = sessionStorage.getItem('lastViewedArtistId');
      if (lastViewedArtistId) {
        this.loadArtistDetails(lastViewedArtistId);
      }

      // 🆕 If no artistId, clear search results and search input
      this.results = [];
      this.artistName = '';
    }
  }
  

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  @ViewChild('displayContainer') displayContainer!: ElementRef;


  onKeyDown(event: KeyboardEvent): void {
    if (!this.displayContainer) return;
  
    //clear previous key
    this.displayContainer.nativeElement.innerHTML = '';
  
    const keySymbol = document.createElement('div');
    keySymbol.classList.add('key-symbol');
  
    const keySymbols: { [key: string]: string } = {
      'Enter': '&#x21B5;',
      'Backspace': '&#x232B;',
      'Shift': '&#x21E7;',
      'Control': '&#x2303;',
      'Alt': '&#x2325;',
      'Meta': '&#x2318;',
      'CapsLock': '&#x21EA;',
      ' ': '&nbsp;'
    };
    
    if (keySymbols[event.key]) {
      keySymbol.innerHTML = keySymbols[event.key];
    } else if (event.key.length === 1) {
      keySymbol.textContent = event.key; 
    } else {
      keySymbol.textContent = event.key; 
    }
    
    
    this.displayContainer.nativeElement.appendChild(keySymbol);
    
    //keys fade out
    setTimeout(() => {
      keySymbol.classList.add('fade-out');
      setTimeout(() => {
        keySymbol.remove();
      }, 500); 
    }, 500);
    

  }
  
  

  fetchFavorites(): void {
    this.http.get('/api/favorites').subscribe(
      (response: any) => {
        this.favoriteArtists = response.favorites;
      },
      (error) => {
        console.error('Error fetching favorites:', error);
      }
    );
  }


  onSearch(): void {
    this.isUpdatingArtist = false;
    this.searchAttempted = true;

    // this.triggeredFromSimilarArtist = false;
  
    if (!this.artistName.trim()) return;
  
    this.isLoading = true;
    this.isSearching = true;
    this.error = '';
  
    const searchStartTime = Date.now(); // ✅
  
    this.http.get(`/api/search`, {
      params: { term: this.artistName }
    }).subscribe(
      (response: any) => {
        const favoriteIds = this.favoriteArtists.map(fav => fav.artistId);
  
        this.results = (response.artists || []).map((artist: any) => ({
          id: artist.artistId,
          ...artist,
          isFavorite: favoriteIds.includes(artist.artistId)
        }));
  
        this.selectedArtistId = null;
        this.selectedArtist = null;
  
        const elapsed = Date.now() - searchStartTime; 
        const remainingDelay = Math.max(300 - elapsed, 0); 
  
        setTimeout(() => {
          this.isLoading = false;
          this.isSearching = false;
        }, remainingDelay);
  
        console.log('Mapped artist:', this.results[0]);
      },
      (error) => {
        console.error('Error searching artists:', error);
        const elapsed = Date.now() - searchStartTime;
        const remainingDelay = Math.max(300 - elapsed, 0);
  
        setTimeout(() => {
          this.error = 'Search failed. Please try again.';
          this.isLoading = false;
          this.isSearching = false;
        }, remainingDelay);
      }
    );
  }
  
  
  

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/artsy_logo.svg';
  }
  
  

  onClear(): void {
    this.artistName = '';
    this.results = [];
    this.selectedArtistId = null;
    this.selectedArtist = null;
    this.similarArtists = [];
    this.artworks = [];
    this.artworksError = '';
    this.activeTab = 'info';
    this.error = '';
    this.isLoading = false;
    this.isArtistLoading = false;
    this.isArtworksLoading = false;
    this.isSimilarLoading = false;
    this.showCategoryModal = false;
    this.selectedArtwork = null;
    this.categories = [];
    this.categoryError = '';
    this.isCategoryLoading = false;
    this.searchAttempted = false;

    sessionStorage.removeItem('lastViewedArtistId');

  }

toggleFavorite(artist: any): void {
  if (!artist) return;

  const artistId = artist.artistId || artist.id;
  
  if (!artistId) {
    console.error('Missing artistId for artist:', artist);
    return;
  }
  
  const newFavoriteState = !artist.isFavorite;
  
  artist.isFavorite = newFavoriteState;
  
  // 1. update in results array
  const resultsArtist = this.results.find(a => (a.id === artistId) || (a.artistId === artistId));
  if (resultsArtist) {
    resultsArtist.isFavorite = newFavoriteState;
  }
  
  // 2. update in similarArtists array
  const similarArtist = this.similarArtists.find(a => (a.id === artistId) || (a.artistId === artistId));
  if (similarArtist) {
    similarArtist.isFavorite = newFavoriteState;
  }
  
  // 3. update selectedArtist if it matches
  if (this.selectedArtist && (this.selectedArtist.id === artistId || this.selectedArtist.artistId === artistId)) {
    this.selectedArtist.isFavorite = newFavoriteState;
  }
  
  console.log('Toggling favorite for artistId:', artistId, 'New state:', newFavoriteState);

  if (newFavoriteState) {
    this.http.post('/api/favorites', { artistId: artistId }).subscribe(
      () => {
        this.showAlert('Added to favorites', 'success');
        //refresh favorites list so UI is in sync w backend
        this.fetchFavorites();
      },
      (error) => {
        console.error('Error adding favorite:', error);
        this.showAlert('Failed to add favorite', 'danger');
        this.revertFavoriteState(artistId);
      }
    );
  } else {
    this.http.delete(`/api/favorites/${artistId}`).subscribe(
      () => {
        this.showAlert('Removed from favorites', 'danger');
        //refresh favorites list so UI is in sync w backend
        this.fetchFavorites();
      },
      (error) => {
        console.error('Error removing favorite:', error);
        this.showAlert('Failed to remove favorite', 'danger');
        this.revertFavoriteState(artistId);
      }
    );
  }
}


  
  //revert the favorite state if the server request fails
  private revertFavoriteState(artistId: string): void {
    //find all instances of this artist and toggle them back
    //check both id and artistId properties
    
    if (this.selectedArtist && (this.selectedArtist.id === artistId || this.selectedArtist.artistId === artistId)) {
      this.selectedArtist.isFavorite = !this.selectedArtist.isFavorite;
    }
    
    const resultsArtist = this.results.find(a => (a.id === artistId) || (a.artistId === artistId));
    if (resultsArtist) {
      resultsArtist.isFavorite = !resultsArtist.isFavorite;
    }
    
    const similarArtist = this.similarArtists.find(a => (a.id === artistId) || (a.artistId === artistId));
    if (similarArtist) {
      similarArtist.isFavorite = !similarArtist.isFavorite;
    }
  }


  showAlert(message: string, type: 'success' | 'danger') {
    const id = `notification-${this.nextNotificationId++}`;
    
    //new notification to the stack
    this.notifications.push({
      id,
      message,
      type
    });
    
    setTimeout(() => {
      this.dismissNotification(id);
    }, 3000);
  }


  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
  

  loadArtistDetails(id: string): void {
    this.selectedArtistId = id;

    this.selectedCardId = id;

    this.selectedArtist = null;
    this.isArtistLoading = true;

    // this.selectedCardId = artistId;
    console.log('Loading artist details for ID:', id);
    sessionStorage.setItem('lastViewedArtistId', id);

    this.http.get(`/api/artist/${id}`).subscribe(
      (response) => {
        const matched = this.results.find(a => a.id === id);
    
        this.selectedArtist = {
          ...response,
          isFavorite: matched?.isFavorite || false
        };
    
        this.isArtistLoading = false;
    
        this.loadSimilarArtists(id);
        this.loadArtworks(id);
      },
      (error) => {
        console.error('Error fetching artist details', error);
        this.isArtistLoading = false;
      }
    );
    
    
  }

  loadArtistDetailsNoLoading(id: string): void {
    this.selectedArtistId = id;
    // this.selectedCardId = id;
  
    this.isUpdatingArtist = true;

    this.triggeredFromSimilarArtist = true;


    sessionStorage.setItem('lastViewedArtistId', id);

    
  
    this.http.get(`/api/artist/${id}`).subscribe(
      (response) => {
        const matched = this.results.find(a => a.id === id);
  
        this.selectedArtist = {
          ...response,
          isFavorite: matched?.isFavorite || false
        };
  
        this.isUpdatingArtist = false; //stop spinner after update
  
        this.triggeredFromSimilarArtist = false;

        this.loadSimilarArtists(id);
        // this.loadArtworks(id);

        this.loadArtworks(id);
      },
      (error) => {
        console.error('Error fetching artist details', error);
        this.isUpdatingArtist = false;
      }
    );
  }
  
  

  loadSimilarArtists(id: string): void {
    this.isSimilarLoading = true;
    this.similarArtists = [];

   
  
    this.http.get(`/api/artist/similar/${id}`).subscribe(
      (res: any) => {
        const favoriteIds = this.favoriteArtists.map(fav => fav.artistId);
        this.similarArtists = res.map((artist: any) => ({
          id: artist.artistId,
          name: artist.name,
          imageUrl: artist.imageUrl,
          isFavorite: favoriteIds.includes(artist.artistId)
        }));
        this.isSimilarLoading = false;
      },
      (error) => {
        console.error('Error loading similar artists:', error);
        this.isSimilarLoading = false;
      }
    );
  }

  
  loadArtworks(id: string): void {
    this.isArtworksLoading = true;
    this.artworks = [];
    this.artworksError = '';
  
    this.http.get(`/api/artwork/${id}`).subscribe(
      (res: any) => {
        this.artworks = res.artworks;
        this.isArtworksLoading = false;
      },
      (error) => {
        console.error('Error fetching artworks:', error);
        this.artworks = [];
        this.artworksError = 'No artworks.';
        this.isArtworksLoading = false;
      }
    );
  }

  openCategoryModal(art: any): void {
    this.selectedArtwork = art;
    this.showCategoryModal = true;
    this.isCategoryLoading = true;
    this.categories = [];
    this.categoryError = '';
  
    this.http.get(`/api/artwork/genes/${art.id}`).subscribe(
      (res: any) => {
        this.categories = res.genes || [];
        this.isCategoryLoading = false;
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.categoryError = 'No categories.';
        this.isCategoryLoading = false;
      }
    );
  }
  
  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  
  
  
  
  


}

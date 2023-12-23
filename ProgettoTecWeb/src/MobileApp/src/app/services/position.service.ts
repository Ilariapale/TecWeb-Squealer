import { Injectable } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  /**
   * Current lon and lat of the user, updated every 5 seconds
   */
  private positionSubject = new Subject<[number, number]>();
  /**
   * Current lon and lat of the user, updated every 5 seconds
   */
  private positionObservable = this.positionSubject.asObservable();
  private socket: any;

  constructor() {
    // Avvia l'aggiornamento periodico della posizione ogni 5 secondi
    //this.startUpdatingPosition();
    const isSocketActive = sessionStorage.getItem('isSocketActive') === 'true';
    const user = sessionStorage.getItem('user');
    if (isSocketActive && user) {
      const userId = JSON.parse(user)._id;
      this.connectWebSocket(userId);
    }
  }

  // Restituisce un Observable contenente la posizione corrente
  getPosition(): Observable<[number, number]> {
    return this.positionObservable;
  }

  // Avvia l'aggiornamento periodico della posizione ogni 5 secondi
  public startUpdatingPosition() {
    interval(5000) // Aggiorna ogni 5 secondi
      .pipe(map(() => this.getCurrentPosition()))
      .subscribe(async (position) => {
        this.positionSubject.next(await position);
      });
  }

  setPosition(newPosition: [number, number]) {
    this.positionSubject.next(newPosition);
  }

  // Ottiene la posizione corrente
  private async getCurrentPosition(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lon = position.coords.longitude;
          const lat = position.coords.latitude;
          this.setPosition([lon, lat]);
          resolve([lon, lat]);
        },
        (error) => {
          console.log("Couldn't get user's position.");
          reject(error);
        }
      );
    });
  }

  public async connectWebSocket(user_id: String): Promise<void> {
    sessionStorage.setItem('isSocketActive', 'true');
    this.socket = io();
    this.socket.emit('authenticate', user_id);
    //console.log('socket connected -> ', user_id);
    this.socket.on('send_position_to_server', async () => {
      const position = await this.getCurrentPosition();
      //console.log('send_position_to_server -> ', position);
      this.socket.emit('sending_position_to_server', user_id, position);
    });

    this.socket.on('send_last_position_to_server', async () => {
      //console.log('send_last_position_to_server');
      const position = await this.getCurrentPosition();
      this.socket.emit('sending_last_position_to_server', user_id, position);
      this.disconnectWebSocket();
    });
  }

  public disconnectWebSocket(): void {
    this.socket.disconnect();
    sessionStorage.setItem('isSocketActive', 'false');
    //console.log('socket disconnected');
  }
}

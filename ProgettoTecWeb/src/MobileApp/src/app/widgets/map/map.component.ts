import { Component, AfterViewInit, Input } from '@angular/core';
import * as ol from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay.js';
import { defaults as defaultControls } from 'ol/control';
import Control from 'ol/control/Control';
import { PositionService } from 'src/app/services/position.service';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
//TODO quando c'è l'itinerario, inquadrare l'ultima posizione
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private updateIntervalId: any;
  map: ol.Map | undefined;
  userPosition: [number, number] = [0, 0]; // [lon, lat]
  RomePosition: [number, number] = [12.51133, 41.89193]; // [lon, lat]
  startPostion: [number, number] = [0, 0]; // [lon, lat]
  @Input() lat: number = 0;
  @Input() lng: number = 0;
  @Input() squeal_id: string = '';
  @Input() squeal_content: String = '';
  itinerary: [number, number][] = [];

  popup_my_position: Overlay | undefined;

  constructor(private positionService: PositionService) {}

  ngAfterViewInit(): void {
    this.convertCoordinates();
    if (this.lat != 0 && this.lng != 0) {
      this.startPostion = [this.lng, this.lat];
    } else if (this.itinerary.length > 0) {
      this.startPostion = this.itinerary[this.itinerary.length - 1];
    } else {
      this.startPostion = this.RomePosition;
    }
    this.map = new Map({
      target: 'map' + this.squeal_id,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(this.startPostion),
        zoom: 8,
      }),

      controls: defaultControls().extend([
        new Control({
          element: this.createLocateButton(),
        }),
      ]),
    });
    if ((this.lat != 0 && this.lng != 0) || this.itinerary.length > 0) {
      this.userPosition =
        this.lat != 0 && this.lng != 0 ? [this.lng, this.lat] : this.itinerary[this.itinerary.length - 1];
      this.map?.getView().animate({ center: fromLonLat(this.userPosition), zoom: 15 });
      const popup = new Overlay({
        element: this.createPositionMarker(),
      });
      popup.setPosition(fromLonLat(this.userPosition));
      this.map?.addOverlay(popup);
    }
    const itineraryLayer = new VectorLayer({
      source: new VectorSource({
        features: [new ol.Feature(new LineString(this.itinerary.map((coord) => fromLonLat(coord))))],
      }),
    });
    itineraryLayer.setStyle({
      'fill-color': 'yellow',
      'stroke-color': 'blue',
      'stroke-width': 4,
    });
    this.map.addLayer(itineraryLayer);
  }

  convertCoordinates(): void {
    if (this.squeal_content == '') return;
    const coordinatePairs = this.squeal_content.split(' , ');
    this.itinerary = coordinatePairs.map((pair) => {
      const [x, y] = pair.split(' ').map(Number);
      return [x, y];
    });
  }

  stopUpdatingPosition() {
    clearInterval(this.updateIntervalId);
  }

  createLocateButton() {
    const button = document.createElement('div');
    button.className = 'btn btn-light btn-outline-dark px-2 py-1';
    button.innerHTML = '<i class="bi bi-crosshair"></i>';
    button.title = 'Locate me';
    button.id = 'locate-' + this.squeal_id + '-button';

    button.addEventListener('click', this.handleLocate.bind(this), false);

    const element = document.createElement('div');
    element.className = 'ol-unselectable ol-control locate-control';
    element.style.position = 'absolute';
    element.style.top = '12px';
    element.style.right = '12px';
    element.appendChild(button);

    return element;
  }

  createPositionMarker() {
    const i_element = document.createElement('i');
    i_element.className = 'bi bi-geo-alt-fill text-danger';
    i_element.id = 'popup';
    return i_element;
  }

  handleLocate() {
    if (this.popup_my_position != undefined) {
      this.map?.removeOverlay(this.popup_my_position);
      this.popup_my_position.getElement()?.remove();
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.createPositionMarker();
        this.userPosition = [position.coords.longitude, position.coords.latitude];
        this.map?.getView().animate({ center: fromLonLat(this.userPosition), zoom: 15 });
        this.popup_my_position = new Overlay({
          element: this.createPositionMarker(),
        });
        this.popup_my_position.setPosition(fromLonLat(this.userPosition));
        this.map?.addOverlay(this.popup_my_position);
      },
      (error) => {
        alert('Error while getting the user position.');
      }
    );
  }

  updateUserPosition() {
    this.positionService.getPosition().subscribe((position) => {
      this.userPosition = position;
      this.map?.getView().animate({ center: fromLonLat(position), zoom: 15 });

      if (this.popup_my_position != undefined) {
        this.map?.removeOverlay(this.popup_my_position);
        this.popup_my_position.getElement()?.remove();
      }

      this.popup_my_position = new Overlay({
        element: this.createPositionMarker(),
      });
      this.popup_my_position.setPosition(fromLonLat(this.userPosition));
    });
    if (this.popup_my_position != undefined) {
      this.map?.addOverlay(this.popup_my_position);
    }
  }
}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as ol from 'ol';
import * as proj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map: ol.Map | undefined;

  constructor() {}
  ngOnInit() {}

  ngAfterViewInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([position.coords.longitude, position.coords.latitude]),
          zoom: 8,
          //extent: ol.proj.get('EPSG:3857')?.getExtent(), // Set desired extent
        }),
      });
    });
  }

  success(position: any) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
  }

  error(err: any) {
    console.log(`ERROR (${err.code}): ${err.message}`);
  }
}

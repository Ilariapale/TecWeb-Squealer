import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as ol from 'ol';
import * as proj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map';
import View from 'ol/View';
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
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new ol.View({
        center: proj.fromLonLat([12.496366, 41.902782]),
        zoom: 4,
        //extent: proj.get('EPSG:3857')?.getExtent(), // Imposta l'estensione desiderata
      }),
    });
  }
}

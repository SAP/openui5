sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapShape', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, GeomapShape, geomapProperty, GeomapLayerBase, GeomapElement, Cluster, GeomapInteger) { 'use strict';

  var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  const STEPS = 50;
  /**
   * @class
   *
    * ### Overview
   *
   * The `ui5-geomap-geocircle` defines the Geo Circle webcomponent.
   * GeomapGeocircle represents circles, defined in a real-world units (km, miles, etc.).
   * Rendered on the map as layers.
   *
   * ### ES6 Module Import
   *
   * `import "@ui5/webcomponents-geomap/dist/GeomapGeocircle.js";`
   *
   * @constructor
   * @extends GeomapShape
   * @experimental
   * @public
   */
  let GeomapGeocircle = class GeomapGeocircle extends GeomapShape {
      constructor() {
          super();
          /**
          * Describes the longitude of the center of the geo-circle.
          * @default 0
          * @public
          */
          this.lng = 0;
          /**
          * Describes the latitude of the center of the geo-circle.
          * @default 0
          * @public
          */
          this.lat = 0;
          /**
          * Describes the radius of the geo-circle.
          * @default 0
          * @public
          */
          this.radius = 0;
          /**
          * Describes the units in which the radius is measured.
          * @default "kilometers"
          * @public
          */
          this.units = "kilometers";
          /**
          * Describes the color of the fill of the geo-circle.
          * @default "black"
          * @public
          */
          this.fillColor = "black";
          /**
          * Describes the outline color of the geo-circle.
          * @default "black"
          * @public
          */
          this.outlineColor = "black";
          /**
          * Describes the opacity of the fill of the geo-circle.
          * @default 0.5
          * @public
          */
          this.opacity = 0.5;
          /**
           * Describes if the geocircle is draggable & editable.
           * @default false
           * @public
           */
          this.dragndrop = false;
          this._handleAddDraggable = this.handleAddDraggable.bind(this);
          this._finishDraggable = this.finishDraggable.bind(this);
          this._removeDrawer = this.removeDrawer.bind(this);
      }
      /**
      * @override
      */
      sourceUpdateNeeded(changeInfo) {
          if (changeInfo.type === "property") {
              const propName = changeInfo.name;
              return ["lng", "lat", "radius", "units"].includes(propName);
          }
          return false;
      }
      /**
      * @override
      */
      get sourceData() {
          return Geomap.GeomapGeometry.geomapCircle([this.lng, this.lat], this.radius, { steps: STEPS, units: this.units });
      }
      /**
      * @override
      */
      get layerType() {
          return "fill";
      }
      addDrawer() {
          const data = this.sourceData;
          data.properties = {
              mode: "circle",
              radiusKilometers: this.radius,
              "isExistingFeature": true,
          };
          const draw = this.draw;
          const coordinates = data.geometry.coordinates;
          const id = draw.getFeatureId();
          this._internalState.id = id;
          data.id = id;
          draw.start();
          draw.setMode("circle");
          draw.addFeatures([
              {
                  id,
                  "type": "Feature",
                  "geometry": {
                      "type": "Polygon",
                      "coordinates": coordinates,
                  },
                  "properties": {
                      "mode": "circle",
                      "radiusKilometers": this.radius,
                      "isExistingFeature": true,
                  },
              },
          ]);
          draw.setMode("select");
          draw.on("finish", this._finishDraggable);
      }
      finishDraggable(e) {
          const id = this._internalState.id;
          const draw = this.draw;
          if (e !== id) {
              return;
          }
          // update the points
          const snapshot = draw.getSnapshot();
          const selObj = snapshot.find(feature => feature.id === id);
          if (!selObj) {
              return;
          }
          const polygon = Geomap.GeomapGeometry.geomapPolygon([selObj.geometry.coordinates[0]]);
          const centroId = Geomap.GeomapGeometry.geomapCentroid(polygon);
          const p = selObj.geometry.coordinates[0][0];
          const radius = Geomap.GeomapGeometryUtil.pointDistance(centroId, p, { units: this.units });
          this.lng = centroId.geometry.coordinates[0];
          this.lat = centroId.geometry.coordinates[1];
          this.radius = radius;
          this.fireDecoratorEvent("geocircle-dragndrop-end", {
              centerLng: this.lng,
              centerLat: this.lat,
              radius: this.radius,
          });
      }
      handleAddDraggable() {
          this._internalState.dragging = true;
          this.addDrawer();
      }
      /**
       * @override
       */
      attachDragAndDrop() {
          if (this.dragndrop) {
              super.handleDraggable("fill-color", this.fillColor, this._handleAddDraggable);
          }
      }
      removeDrawer() {
          const draw = this.draw;
          if (!this._internalState.id) {
              return;
          }
          draw.removeFeatures([this._internalState.id]);
          this._internalState.dragging = false;
          // detach listeners
          draw.off("finish", this._finishDraggable);
      }
  };
  __decorate([
      webcomponentsBase.s({ type: Number })
  ], GeomapGeocircle.prototype, "lng", void 0);
  __decorate([
      webcomponentsBase.s({ type: Number })
  ], GeomapGeocircle.prototype, "lat", void 0);
  __decorate([
      webcomponentsBase.s({ type: Number })
  ], GeomapGeocircle.prototype, "radius", void 0);
  __decorate([
      webcomponentsBase.s({ type: String })
  ], GeomapGeocircle.prototype, "units", void 0);
  __decorate([
      geomapProperty.geomapProperty({ type: String, paint: "fill-color" })
  ], GeomapGeocircle.prototype, "fillColor", void 0);
  __decorate([
      geomapProperty.geomapProperty({ type: String, paint: "fill-outline-color" })
  ], GeomapGeocircle.prototype, "outlineColor", void 0);
  __decorate([
      geomapProperty.geomapProperty({ type: Number, paint: "fill-opacity" })
  ], GeomapGeocircle.prototype, "opacity", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], GeomapGeocircle.prototype, "dragndrop", void 0);
  GeomapGeocircle = __decorate([
      webcomponentsBase.m("ui5-geomap-geocircle")
      /**
       * Fired when the geocircle edit is finished.
       * @public
       * */
      ,
      Geomap.l("geocircle-dragndrop-end", {
          cancelable: true,
          bubbles: true,
      })
  ], GeomapGeocircle);
  GeomapGeocircle.define();
  var GeomapGeocircle_default = GeomapGeocircle;

  return GeomapGeocircle_default;

}));

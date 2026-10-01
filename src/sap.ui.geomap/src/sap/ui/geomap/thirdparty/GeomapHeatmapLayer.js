sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapLayer', 'sap/ui/geomap/thirdparty/GeomapFloat', 'sap/ui/geomap/thirdparty/GeomapInteger', 'sap/ui/geomap/thirdparty/GeomapString', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster'], (function (webcomponentsBase, Geomap, GeomapLayer, GeomapFloat, GeomapInteger, GeomapString, geomapProperty, GeomapLayerBase, GeomapElement, Cluster) { 'use strict';

  var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  /**
   * @class
   *
    * ### Overview
   *
   * The `ui5-geomap-heatmap-layer` defines the Heatmap Layer webcomponent.
   *
   * ### ES6 Module Import
   *
   * `import "@ui5/webcomponents-geomap/dist/GeomapHeatmapLayer.js";`
   *
   * @constructor
   * @extends GeomapLayer
   * @experimental
   * @public
   */
  let GeomapHeatmapLayer = class GeomapHeatmapLayer extends GeomapLayer {
      constructor() {
          super(...arguments);
          /**
          * Describes the color of the heatmap layer.
          * @default "black"
          * @public
          */
          this.color = "black";
          /**
          * Describes the intensity of the heatmap layer.
          * @default ""
          * @public
          */
          this.intensity = "";
          /**
          * Describes the weight of the heatmap layer.
          * @default 0
          * @public
          */
          this.weight = 0;
          /**
          * Describes the radius of the heatmap.
          * @default 0
          * @public
          */
          this.radius = 0;
          /**
          * Describes the radius of the heatmap.
          * @default ""
          * @public
          */
          this.opacity = "";
      }
      /**
      * @override
      */
      get layerType() {
          return "heatmap";
      }
  };
  __decorate([
      geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "heatmap-color" })
  ], GeomapHeatmapLayer.prototype, "color", void 0);
  __decorate([
      geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "heatmap-intensity" })
  ], GeomapHeatmapLayer.prototype, "intensity", void 0);
  __decorate([
      geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, paint: "heatmap-weight" })
  ], GeomapHeatmapLayer.prototype, "weight", void 0);
  __decorate([
      geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, paint: "heatmap-radius" })
  ], GeomapHeatmapLayer.prototype, "radius", void 0);
  __decorate([
      geomapProperty.geomapProperty({ converter: GeomapFloat.SAPGeomapFloat, type: Number, paint: "heatmap-opacity" })
  ], GeomapHeatmapLayer.prototype, "opacity", void 0);
  GeomapHeatmapLayer = __decorate([
      webcomponentsBase.m("ui5-geomap-heatmap-layer")
  ], GeomapHeatmapLayer);
  GeomapHeatmapLayer.define();
  var GeomapHeatmapLayer_default = GeomapHeatmapLayer;

  return GeomapHeatmapLayer_default;

}));

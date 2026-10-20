sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, geomapProperty, GeomapLayerBase, GeomapElement, Cluster, GeomapInteger) { 'use strict';

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
     * The `ui5-geomap-raster-tiles` defines the Raster tiles webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapRasterTiles.js";`
     *
     * @constructor
     * @extends GeomapLayerBase
     * @experimental
     * @public
     */
    let GeomapRasterTiles = class GeomapRasterTiles extends GeomapLayerBase {
        constructor() {
            super(...arguments);
            /**
            * URL string of the raster tiles source.
            * @default ""
            * @public
            */
            this.url = "";
            /**
            * Opacitiy of the layer.
            * @default 0.5
            * @public
            */
            this.opacity = 0.5;
        }
        /**
        * @override
        */
        get layerSource() {
            const mapSource = this.map?.getSource(this._id);
            if (!mapSource) {
                this.map?.addSource(this._id, {
                    type: "raster",
                    url: this.url,
                    tileSize: 256,
                });
            }
            return this._id;
        }
        async onAfterRendering() {
            await this.whenMapConnected();
            const mapLayer = this.map?.getLayer(this._id);
            if (!mapLayer) {
                return;
            }
            this.updateSource();
        }
        updateSource() {
        }
        connectToDraw(draw) {
            if (this.draw instanceof Geomap.to) {
                return;
            }
            this.draw = draw;
        }
        /**
        * @override
        */
        get layerType() {
            return "raster";
        }
    };
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapRasterTiles.prototype, "url", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "raster-opacity" })
    ], GeomapRasterTiles.prototype, "opacity", void 0);
    GeomapRasterTiles = __decorate([
        webcomponentsBase.m("ui5-geomap-raster-tiles")
    ], GeomapRasterTiles);
    GeomapRasterTiles.define();
    var GeomapRasterTiles_default = GeomapRasterTiles;

    return GeomapRasterTiles_default;

}));

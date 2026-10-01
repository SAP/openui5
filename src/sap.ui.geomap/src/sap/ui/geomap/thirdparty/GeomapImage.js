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
     * The `ui5-geomap-image` defines the Image webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapImage.js";`
     *
     * @constructor
     * @extends GeomapLayerBase
     * @experimental
     * @public
     */
    let GeomapImage = class GeomapImage extends GeomapLayerBase {
        constructor() {
            super(...arguments);
            /**
            * Url of the image to be displayed in the layer.
            * @default ""
            * @public
            */
            this.url = "";
            /**
            * Describes the opacity of the image layer.
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
                    type: "image",
                    "coordinates": this.coordinates,
                    "url": this.url,
                });
            }
            return this._id;
        }
        async onAfterRendering() {
            await this.whenMapConnected();
            this.updateSource();
        }
        updateSource() {
            const mapSource = this.map?.getSource(this._id);
            if (mapSource) {
                mapSource.setCoordinates(this.coordinates);
                mapSource.updateImage({
                    url: this.url,
                });
            }
        }
        /**
        * @override
        */
        get layerType() {
            return "raster";
        }
        get coordinates() {
            return this.points.map((point) => [point.lng, point.lat]);
        }
        /**
        * @override
        */
        get paintProperties() {
            return {
                "raster-opacity": this.opacity,
                "raster-fade-duration": 0, // avoid blinking when changing images
            };
        }
    };
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapImage.prototype, "url", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "raster-opacity" })
    ], GeomapImage.prototype, "opacity", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, invalidateOnChildChange: true, "default": true })
    ], GeomapImage.prototype, "points", void 0);
    GeomapImage = __decorate([
        webcomponentsBase.m("ui5-geomap-image")
    ], GeomapImage);
    GeomapImage.define();
    var GeomapImage_default = GeomapImage;

    return GeomapImage_default;

}));

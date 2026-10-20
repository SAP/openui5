sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapElement) { 'use strict';

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * Base class for all marker-based components (spot and container)
     *
     * <h3>Usage</h3>
     *
     * <h3>CSS Shadow Parts</h3>
     *
     * <h3>ES6 Module Import</h3>
     *
     * @constructor
     * @extends GeomapElement
     * @experimental
     * @public
     */
    class GeomapMarkerBase extends GeomapElement {
        constructor() {
            super();
            /**
            * Longitude of the marker.
            * @default 0
            * @public
            */
            this.lng = 0;
            /**
            * Latitude of the marker.
            * @default 0
            * @public
            */
            this.lat = 0;
            this._markerInstance = null;
            this.attachInvalidate(this.handleInvalidation.bind(this));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleInvalidation(_changeInfo) {
        }
        get markerInstance() {
            if (!this._markerInstance) {
                this._markerInstance = this.createMarkerInstance();
            }
            return this._markerInstance;
        }
        onBeforeRendering() {
            this.updateMarkerInstance(this.markerInstance);
        }
        async onEnterDOM() {
            await this.whenMapConnected();
            if (this.map) {
                this.markerInstance.addTo(this.map);
            }
        }
        onExitDOM() {
            if (this.map) {
                if (this._markerInstance) {
                    this._markerInstance.remove();
                    this._markerInstance = null;
                }
            }
            super.onExitDOM();
        }
        createMarkerInstance() {
            return null;
        }
        // get classes(): ClassMap {
        // 	return {};
        // }
        updateMarkerInstance(marker) {
            this.marker = marker;
        }
    }
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapMarkerBase.prototype, "lng", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapMarkerBase.prototype, "lat", void 0);

    return GeomapMarkerBase;

}));

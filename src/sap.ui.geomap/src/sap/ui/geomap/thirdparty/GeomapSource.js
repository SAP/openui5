sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapElement) { 'use strict';

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    const EMPTY_GEOJSON = {
        type: "FeatureCollection",
        features: [],
    };
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-geomap-source` defines the Source webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSource.js";`
     *
     * @constructor
     * @extends GeomapElement
     * @experimental
     * @public
     */
    let GeomapSource = class GeomapSource extends GeomapElement {
        constructor() {
            super();
            /**
            * GeoJSON as a source data.
            * @default {}
            * @public
            */
            this.geojson = {};
            /**
            * geojsonUrl - URL to GeoJSON file used as data
            * @default ""
            * @public
            */
            this.geojsonUrl = "";
            this.attachInvalidate(this.handleInvalidation.bind(this));
        }
        get effectiveId() {
            return this.id || this._id;
        }
        get effectiveData() {
            return this.geojsonUrl || this.effectiveGeojson;
        }
        get effectiveGeojson() {
            if (typeof this.geojson === "object" && this.geojson !== null && Object.keys(this.geojson).length > 0) {
                return this.geojson;
            }
            return EMPTY_GEOJSON;
        }
        async onEnterDOM() {
            await this.whenMapConnected();
            this.map?.addSource(this.effectiveId, {
                type: "geojson",
                data: this.effectiveData,
                ...this.createOptions,
            });
        }
        handleInvalidation(changeInfo) {
            if (!this.map || !this.map.getSource(this.effectiveId)) {
                return;
            }
            if (changeInfo.type === "property") {
                const propName = changeInfo.name;
                const mapSource = this.map.getSource(this.effectiveId);
                if (["geojson", "geojsonUrl"].includes(propName)) {
                    mapSource.setData(this.effectiveData);
                }
            }
        }
        get createOptions() {
            return {};
        }
        onExitDOM() {
            if (this.map) {
                this.map.removeSource(this.effectiveId);
            }
            super.onExitDOM();
        }
        /**
        * Sets feature state
        * @public
        * @param id
        * @param state
        */
        setState(id, state) {
            this.map?.setFeatureState({
                source: this.effectiveId,
                id,
            }, { "ui5-geomap-state": state });
        }
        get isGeomapSource() {
            return true;
        }
        /**
        * Returns the source object in maplibre
        */
        get source() {
            return this.map?.getSource(this.effectiveId);
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], GeomapSource.prototype, "geojson", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSource.prototype, "geojsonUrl", void 0);
    GeomapSource = __decorate([
        webcomponentsBase.m("ui5-geomap-source")
    ], GeomapSource);
    GeomapSource.define();
    var GeomapSource$1 = GeomapSource;

    return GeomapSource$1;

}));

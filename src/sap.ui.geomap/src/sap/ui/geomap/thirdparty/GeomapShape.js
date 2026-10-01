sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, GeomapLayerBase, GeomapElement, Cluster, geomapProperty, GeomapInteger) { 'use strict';

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * GeomapShape
     *
     * @constructor
     * @extends GeomapLayerBase
     * @experimental
     * @public
     */
    let GeomapShape = class GeomapShape extends GeomapLayerBase {
        /**
        * @override
        */
        get layerSource() {
            const mapSource = this.map?.getSource(this._id);
            if (!mapSource) {
                this.map?.addSource(this._id, {
                    type: "geojson",
                    data: this.sourceData,
                });
            }
            return this._id;
        }
        handleInvalidation(changeInfo) {
            if (!this.map || !this.map.getLayer(this._id)) {
                return;
            }
            if (this.sourceUpdateNeeded(changeInfo)) {
                this.updateSource();
                return;
            }
            super.handleInvalidation(changeInfo);
        }
        /**
        * @override
        */
        removeLayer() {
            super.removeLayer();
            if (this.map?.getSource(this._id)) {
                this.map.removeSource(this._id);
            }
        }
        /**
        * Override to optimize which properties exactly affect the source
        */
        sourceUpdateNeeded(changeInfo) {
            return !!changeInfo;
        }
        updateSource() {
            const mapSource = this.map?.getSource(this._id);
            if (mapSource) {
                mapSource.setData(this.sourceData);
            }
        }
    };
    GeomapShape = __decorate([
        webcomponentsBase.m("ui5-geomap-shape")
    ], GeomapShape);
    var GeomapShape$1 = GeomapShape;

    return GeomapShape$1;

}));

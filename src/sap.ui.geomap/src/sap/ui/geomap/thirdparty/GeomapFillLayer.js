sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapFloat', 'sap/ui/geomap/thirdparty/GeomapString', 'sap/ui/geomap/thirdparty/GeomapLayer', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, GeomapFloat, GeomapString, GeomapLayer, geomapProperty, GeomapLayerBase, GeomapElement, Cluster, GeomapInteger) { 'use strict';

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
     * The `ui5-geomap-fill-layer` defines the Fill Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapFillLayer.js";`
     *
     * @constructor
     * @extends GeomapLayer
     * @experimental
     * @public
     */
    let GeomapFillLayer = class GeomapFillLayer extends GeomapLayer {
        constructor() {
            super(...arguments);
            /**
            * Describes the fill color of the layer.
            * @default "black"
            * @public
            */
            this.fillColor = "black";
            /**
            * Describe the outline color of the layer.
            * @default "black"
            * @public
            */
            this.outlineColor = "black";
            /**
            * Describe the outline width of the layer.
            * @default ""
            * @public
            */
            this.opacity = "";
        }
        /**
        * @override
        */
        get layerType() {
            return "fill";
        }
    };
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "fill-color" })
    ], GeomapFillLayer.prototype, "fillColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "fill-outline-color" })
    ], GeomapFillLayer.prototype, "outlineColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapFloat.SAPGeomapFloat, type: Number, paint: "fill-opacity" })
    ], GeomapFillLayer.prototype, "opacity", void 0);
    GeomapFillLayer = __decorate([
        webcomponentsBase.m("ui5-geomap-fill-layer")
    ], GeomapFillLayer);
    GeomapFillLayer.define();
    var GeomapFillLayer_default = GeomapFillLayer;

    return GeomapFillLayer_default;

}));

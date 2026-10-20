sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapFloat', 'sap/ui/geomap/thirdparty/GeomapInteger', 'sap/ui/geomap/thirdparty/GeomapString', 'sap/ui/geomap/thirdparty/GeomapLayer', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster'], (function (webcomponentsBase, Geomap, GeomapFloat, GeomapInteger, GeomapString, GeomapLayer, geomapProperty, GeomapLayerBase, GeomapElement, Cluster) { 'use strict';

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
     * The `ui5-geomap-circle-layer` defines the Circle Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCircleLayer.js";`
     *
     * @constructor
     * @extends GeomapLayer
     * @experimental
     * @public
     */
    let GeomapCircleLayer = class GeomapCircleLayer extends GeomapLayer {
        constructor() {
            super(...arguments);
            /**
            * Describes the radius of the circle.
            * @default ""
            * @public
            */
            this.radius = "";
            /**
            * Describes the fill color of the circle.
            * @default "black"
            * @public
            */
            this.fillColor = "black";
            /**
            * Describes the outline color of the circle.
            * @default "black"
            * @public
            */
            this.outlineColor = "black";
            /**
            * Describes the width of the outline of the circle.
            * @default 0
            * @public
            */
            this.outlineWidth = 0;
            /**
            * Describes the opacity of the circle.
            * @default 0.5
            * @public
            */
            this.opacity = 0.5;
        }
        /**
        * @override
        */
        get layerType() {
            return "circle";
        }
    };
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapFloat.SAPGeomapFloat, type: Number, paint: "circle-radius" })
    ], GeomapCircleLayer.prototype, "radius", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "circle-color" })
    ], GeomapCircleLayer.prototype, "fillColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "circle-stroke-color" })
    ], GeomapCircleLayer.prototype, "outlineColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, paint: "circle-stroke-width" })
    ], GeomapCircleLayer.prototype, "outlineWidth", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapFloat.SAPGeomapFloat, type: Number, paint: "circle-opacity" })
    ], GeomapCircleLayer.prototype, "opacity", void 0);
    GeomapCircleLayer = __decorate([
        webcomponentsBase.m("ui5-geomap-circle-layer")
    ], GeomapCircleLayer);
    GeomapCircleLayer.define();
    var GeomapCircleLayer_default = GeomapCircleLayer;

    return GeomapCircleLayer_default;

}));

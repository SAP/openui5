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
     * The `ui5-geomap-line-layer` defines the Line Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapLineLayer.js";`
     *
     * @constructor
     * @extends GeomapLayer
     * @experimental
     * @public
     */
    let GeomapLineLayer = class GeomapLineLayer extends GeomapLayer {
        constructor() {
            super(...arguments);
            /**
            * Describes the color of the line layer.
            * @default "black"
            * @public
            */
            this.color = "black";
            /**
            * Describes the opacity of the line layer.
            * @default ""
            * @public
            */
            this.opacity = "";
        }
        /**
        * @override
        */
        get layerType() {
            return "line";
        }
    };
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "line-color" })
    ], GeomapLineLayer.prototype, "color", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapFloat.SAPGeomapFloat, type: Number, paint: "line-opacity" })
    ], GeomapLineLayer.prototype, "opacity", void 0);
    GeomapLineLayer = __decorate([
        webcomponentsBase.m("ui5-geomap-line-layer")
    ], GeomapLineLayer);
    GeomapLineLayer.define();
    var GeomapLineLayer_default = GeomapLineLayer;

    return GeomapLineLayer_default;

}));

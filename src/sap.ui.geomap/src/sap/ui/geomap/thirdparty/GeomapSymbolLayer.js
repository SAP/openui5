sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapInteger', 'sap/ui/geomap/thirdparty/GeomapString', 'sap/ui/geomap/thirdparty/GeomapLayer', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster'], (function (webcomponentsBase, Geomap, GeomapInteger, GeomapString, GeomapLayer, geomapProperty, GeomapLayerBase, GeomapElement, Cluster) { 'use strict';

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
     * The `ui5-geomap-symbol-layer` defines the Symbol Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSymbolLayer.js";`
     *
     * @constructor
     * @extends GeomapLayer
     * @experimental
     * @public
     */
    let GeomapSymbolLayer = class GeomapSymbolLayer extends GeomapLayer {
        constructor() {
            super(...arguments);
            /**
            * Text to be displayed in the layer.
            * @default ""
            * @public
            */
            this.text = "";
            /**
            * Size of the font that is displayed in the layer. Units in pixels. Requires text-field.
            * @default 0
            * @public
            */
            this.textSize = 0;
            /**
            * Color of the text that is displayed in the layer.
            * @default "black"
            * @public
            */
            this.textColor = "black";
            /**
            * Which part of the text is closest to the point: "center", "left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"
            * @default "center"
            * @public
            */
            this.textAnchor = "center";
            /**
            * Font stack to use for displaying text. Defaults to Open Sans Regular,Arial Unicode MS Regular. Requires text-field.
            * @default ["Arial Unicode MS Regular"]
            * @public
            */
            this.textFont = ["Arial Unicode MS Regular"];
        }
        /**
         * Returns the layer type.
        * @override
        */
        get layerType() {
            return "symbol";
        }
    };
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, layout: "text-field" })
    ], GeomapSymbolLayer.prototype, "text", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, layout: "text-size" })
    ], GeomapSymbolLayer.prototype, "textSize", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, paint: "text-color" })
    ], GeomapSymbolLayer.prototype, "textColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, layout: "text-anchor" })
    ], GeomapSymbolLayer.prototype, "textAnchor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapString.SAPGeomapString, layout: "text-font" })
    ], GeomapSymbolLayer.prototype, "textFont", void 0);
    GeomapSymbolLayer = __decorate([
        webcomponentsBase.m("ui5-geomap-symbol-layer")
    ], GeomapSymbolLayer);
    GeomapSymbolLayer.define();
    var GeomapSymbolLayer_default = GeomapSymbolLayer;

    return GeomapSymbolLayer_default;

}));

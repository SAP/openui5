sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/geomapProperty'], (function (webcomponentsBase, Geomap, geomapProperty) { 'use strict';

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
     * The `ui5-geomap-fill-layer-state` defines the Fill Layer State webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapFillLayerState.js";`
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    let GeomapFillLayerState = class GeomapFillLayerState extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
            * Describes the name of the layer.
            * @default ""
            * @public
            */
            this.name = "";
            /**
            * Describes the fill color of the layer.
            * @default "black"
            * @public
            */
            this.fillColor = "black";
            /**
            * Describes the outline color of the layer.
            * @default "black"
            * @public
            */
            this.outlineColor = "black";
            /**
            * Describes the opacity of the layer.
            * @default 0.5
            * @public
            */
            this.opacity = 0.5;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapFillLayerState.prototype, "name", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "fill-color" })
    ], GeomapFillLayerState.prototype, "fillColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "fill-outline-color" })
    ], GeomapFillLayerState.prototype, "outlineColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "fill-opacity" })
    ], GeomapFillLayerState.prototype, "opacity", void 0);
    GeomapFillLayerState = __decorate([
        webcomponentsBase.m("ui5-geomap-fill-layer-state")
    ], GeomapFillLayerState);
    GeomapFillLayerState.define();
    var GeomapFillLayerState_default = GeomapFillLayerState;

    return GeomapFillLayerState_default;

}));

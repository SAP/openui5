sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, geomapProperty, GeomapInteger) { 'use strict';

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
     * The `ui5-geomap-circle-layer-state` defines the Circle Layer State webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCircleLayerState.js";`
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    let GeomapCircleLayerState = class GeomapCircleLayerState extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
            * Describes the name of the cirle layer state.
            * @default ""
            * @public
            */
            this.name = "";
            /**
            * Describes the radius of the circle.
            * @default 0
            * @public
            */
            this.radius = 0;
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
            * Describes the outline width of the circle.
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
    };
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapCircleLayerState.prototype, "name", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "circle-radius" })
    ], GeomapCircleLayerState.prototype, "radius", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "circle-color" })
    ], GeomapCircleLayerState.prototype, "fillColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "circle-stroke-color" })
    ], GeomapCircleLayerState.prototype, "outlineColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, paint: "circle-stroke-width" })
    ], GeomapCircleLayerState.prototype, "outlineWidth", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "circle-opacity" })
    ], GeomapCircleLayerState.prototype, "opacity", void 0);
    GeomapCircleLayerState = __decorate([
        webcomponentsBase.m("ui5-geomap-circle-layer-state")
    ], GeomapCircleLayerState);
    GeomapCircleLayerState.define();
    var GeomapCircleLayerState_default = GeomapCircleLayerState;

    return GeomapCircleLayerState_default;

}));

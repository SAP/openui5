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
     * The `ui5-geomap-line-layer-state` defines the Line Layer State webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapLineLayerState.js";`
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    let GeomapLineLayerState = class GeomapLineLayerState extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
            * Describes the name of the layer.
            * @default ""
            * @public
            */
            this.name = "";
            /**
            * Describes the color of the layer.
            * @default "black"
            * @public
            */
            this.color = "black";
            /**
            * Describes the width of the layer.
            * @default 0
            * @public
            */
            this.width = 0;
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
    ], GeomapLineLayerState.prototype, "name", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "line-color" })
    ], GeomapLineLayerState.prototype, "color", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "line-width" })
    ], GeomapLineLayerState.prototype, "width", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "line-opacity" })
    ], GeomapLineLayerState.prototype, "opacity", void 0);
    GeomapLineLayerState = __decorate([
        webcomponentsBase.m("ui5-geomap-line-layer-state")
    ], GeomapLineLayerState);
    GeomapLineLayerState.define();
    var GeomapLineLayerState_default = GeomapLineLayerState;

    return GeomapLineLayerState_default;

}));

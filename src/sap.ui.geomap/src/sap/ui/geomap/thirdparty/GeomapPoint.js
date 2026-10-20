sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2'], (function (webcomponentsBase, Geomap) { 'use strict';

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
     * The `ui5-geomap-point` defines the Point webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapPoint.js";`
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    let GeomapPoint = class GeomapPoint extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
            * Longitute of the point.
            * @default 0
            * @public
            */
            this.lng = 0;
            /**
            * Latitude of the point.
            * @default 0
            * @public
            */
            this.lat = 0;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapPoint.prototype, "lng", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapPoint.prototype, "lat", void 0);
    GeomapPoint = __decorate([
        webcomponentsBase.m("ui5-geomap-point")
    ], GeomapPoint);
    GeomapPoint.define();
    var GeomapPoint_default = GeomapPoint;

    return GeomapPoint_default;

}));

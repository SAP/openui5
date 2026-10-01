sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapControlBase', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapControlBase, GeomapElement) { 'use strict';

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
     * The `ui5-geomap-scale-control` defines the Scale webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapScaleControl.js";`
     *
     * @constructor
     * @extends GeomapControlBase
     * @experimental
     * @public
     */
    let GeomapScaleControl = class GeomapScaleControl extends GeomapControlBase {
        constructor() {
            super(...arguments);
            /**
            * Units of the distance for the scale control. Possible values are "Imperial", "Metric" or "Nautical".
            * @default "Metric"
            * @public
            */
            this.units = "Metric";
        }
        async onEnterDOM() {
            this._instance = new Geomap.maplibreGlCspExports.ScaleControl({
                maxWidth: 100,
                unit: (this.effectiveUnits),
            });
            await super.onEnterDOM();
        }
        handleInvalidation(changeInfo) {
            super.handleInvalidation(changeInfo);
            if (!this._instance || !this.map) {
                return;
            }
            if (changeInfo.type === "property" && changeInfo.name === "units") {
                this._instance.setUnit(this.effectiveUnits);
            }
        }
        get effectiveUnits() {
            return this.units.toLowerCase();
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], GeomapScaleControl.prototype, "units", void 0);
    GeomapScaleControl = __decorate([
        webcomponentsBase.m("ui5-geomap-scale-control")
    ], GeomapScaleControl);
    GeomapScaleControl.define();
    var GeomapScaleControl_default = GeomapScaleControl;

    return GeomapScaleControl_default;

}));

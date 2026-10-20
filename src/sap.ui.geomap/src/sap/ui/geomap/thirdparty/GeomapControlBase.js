sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapElement) { 'use strict';

    function camelToKebabCase(input) {
        return webcomponentsBase.l(input);
    }

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * Base class for all controls
     *
     * @constructor
     * @extends GeomapElement
     * @experimental
     * @public
     */
    class GeomapControlBase extends GeomapElement {
        constructor() {
            super();
            /**
            * Position of the control on the map. Can be one of the following: "TopLeft", "TopRight", "BottomLeft", "BottomRight".
            * @public
            */
            this.position = "TopLeft";
            this.attachInvalidate(this.handleInvalidation.bind(this));
        }
        handleInvalidation(changeInfo) {
            if (!this._instance || !this.map) {
                return;
            }
            if (changeInfo.type === "property" && changeInfo.name === "position") {
                this.map.moveControl(this._instance, this.effectivePosition);
            }
        }
        get isGeoMapControl() {
            return true;
        }
        get effectivePosition() {
            return camelToKebabCase(this.position);
        }
        async onEnterDOM() {
            await this.whenMapConnected();
            this.map?.addControl(this._instance, this.effectivePosition);
        }
        onExitDOM() {
            if (this.map) {
                this.map.removeControl(this._instance);
            }
            this._instance = undefined;
            super.onExitDOM();
        }
    }
    __decorate([
        webcomponentsBase.s()
    ], GeomapControlBase.prototype, "position", void 0);

    return GeomapControlBase;

}));

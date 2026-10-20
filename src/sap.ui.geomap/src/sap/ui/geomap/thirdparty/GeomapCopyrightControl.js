sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapControlBase', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapControlBase, GeomapElement) { 'use strict';

    class GeomapCopyrightControlWrapper {
        constructor(options) {
            this._slot = document.createElement("slot");
            this._slot.name = options.slotName;
        }
        onAdd(map) {
            this._map = map;
            this._container = document.createElement("div");
            this._container.appendChild(this._slot);
            this._container.className = "maplibregl-ctrl";
            return this._container;
        }
        onRemove() {
            this._container.parentElement?.removeChild(this._container);
            this._map = undefined;
        }
        setSlotName(slotName) {
            this._slot.name = slotName;
        }
    }

    function GeomapCopyrightControlTemplate() {
        return Geomap.jsx("slot", {});
    }

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
     * The `ui5-geomap-copyright-control` defines the copyright webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCopyrightControl.js";`
     *
     * @constructor
     * @extends GeomapControlBase
     * @experimental
     * @public
     */
    let GeomapCopyrightControl = class GeomapCopyrightControl extends GeomapControlBase {
        async onEnterDOM() {
            this._instance = new GeomapCopyrightControlWrapper({
                slotName: this._individualSlot ?? "",
            });
            await super.onEnterDOM();
        }
        handleInvalidation(changeInfo) {
            super.handleInvalidation(changeInfo);
            if (!this._instance || !this.map) {
                return;
            }
            if (changeInfo.type === "slot" && this._individualSlot) {
                this._instance.setSlotName(this._individualSlot); // zTODO: check why this._individualSlot is 'any'
            }
        }
    };
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], GeomapCopyrightControl.prototype, "content", void 0);
    GeomapCopyrightControl = __decorate([
        webcomponentsBase.m({
            tag: "ui5-geomap-copyright-control",
            template: GeomapCopyrightControlTemplate,
            renderer: Geomap.y,
        })
    ], GeomapCopyrightControl);
    GeomapCopyrightControl.define();
    var GeomapCopyrightControl_default = GeomapCopyrightControl;

    return GeomapCopyrightControl_default;

}));

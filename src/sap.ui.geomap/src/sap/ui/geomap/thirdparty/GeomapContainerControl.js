sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapControlBase', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapControlBase, GeomapElement) { 'use strict';

    class GeomapContainerControlWrapper {
        constructor(options) {
            this._slot = document.createElement("slot");
            this._slot.name = options.slotName;
        }
        onAdd(map) {
            this._map = map;
            this._container = document.createElement("div");
            this._container.className = "maplibregl-ctrl";
            this._container.appendChild(this._slot);
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

    function GeomapContainerControlTemplate() {
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
     * The `ui5-geomap-container-control` defines a reusable container webcomponent that can hold custom HTML content
     * and be positioned on the sides of the map.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapContainerControl.js";`
     *
     * @constructor
     * @extends GeomapControlBase
     * @experimental
     * @public
     */
    let GeomapContainerControl = class GeomapContainerControl extends GeomapControlBase {
        async onEnterDOM() {
            this._instance = new GeomapContainerControlWrapper({
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
                this._instance.setSlotName(this._individualSlot);
            }
        }
    };
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], GeomapContainerControl.prototype, "content", void 0);
    GeomapContainerControl = __decorate([
        webcomponentsBase.m({
            tag: "ui5-geomap-container-control",
            template: GeomapContainerControlTemplate,
            renderer: Geomap.y,
        })
    ], GeomapContainerControl);
    GeomapContainerControl.define();
    var GeomapContainerControl$1 = GeomapContainerControl;

    return GeomapContainerControl$1;

}));

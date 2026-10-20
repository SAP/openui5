sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapMarkerBase', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapMarkerBase, GeomapElement) { 'use strict';

    function GeomapContainerTemplate() {
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
     * The `ui5-geomap-container` defines the Container webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapContainer.js";`
     *
     * @constructor
     * @extends GeomapMarkerBase
     * @experimental
     * @public
     */
    let GeomapContainer = class GeomapContainer extends GeomapMarkerBase {
        constructor() {
            super();
            /**
             * Anchor point of the container element relative to the geographic coordinate.
             * Determines which part of the container element is placed at the exact lng/lat position.
             * Use "bottom-left" (default) so the container content sits above and to the right of the pin point.
             * Accepted values: "center", "top", "bottom", "left", "right",
             * "top-left", "top-right", "bottom-left", "bottom-right".
             * @default "bottom-left"
             * @public
             */
            this.anchor = "bottom-left";
            this._individualSlot = "";
        }
        /**
        * @override
        */
        createMarkerInstance() {
            const wrapper = document.createElement("div");
            const slotElement = document.createElement("slot");
            slotElement.name = this._individualSlot ?? "";
            wrapper.appendChild(slotElement);
            const marker = new Geomap.maplibreGlCspExports.Marker({
                draggable: false,
                element: wrapper,
                anchor: this.anchor,
                subpixelPositioning: true,
            }).setLngLat(new Geomap.maplibreGlCspExports.LngLat(this.lng, this.lat));
            return marker;
        }
        /**
        * @override
        * @param marker
        */
        updateMarkerInstance(marker) {
            marker.setLngLat(new Geomap.maplibreGlCspExports.LngLat(this.lng, this.lat));
            marker.getElement().querySelector("slot").name = this._individualSlot ?? "";
        }
        handleInvalidation(changeInfo) {
            // anchor cannot be updated on an existing MapLibre Marker; recreate it.
            if (changeInfo.type === "property" && changeInfo.name === "anchor" && this._markerInstance) {
                const map = this.map;
                this._markerInstance.remove();
                this._markerInstance = null;
                if (map) {
                    this.markerInstance.addTo(map);
                }
            }
        }
        connectToMap(map) {
            super.connectToMap(map);
            const markerInstance = this._markerInstance?.getElement()?.querySelector("slot");
            if (markerInstance) {
                markerInstance.name = this._individualSlot ?? "";
            }
        }
        getFocusDomRef() {
            return this.markerInstance?.getElement();
        }
    };
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], GeomapContainer.prototype, "content", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapContainer.prototype, "anchor", void 0);
    GeomapContainer = __decorate([
        webcomponentsBase.m({
            tag: "ui5-geomap-container",
            template: GeomapContainerTemplate,
            renderer: Geomap.y,
        })
    ], GeomapContainer);
    GeomapContainer.define();
    var GeomapContainer_default = GeomapContainer;

    return GeomapContainer_default;

}));

sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapMarkerBase', 'sap/ui/geomap/thirdparty/Icon', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapMarkerBase, Icon, GeomapElement) { 'use strict';

    function GeomapSpotComponentTemplate() {
        return Geomap.jsx(Icon.Icon, { name: this.icon, style: {
                width: this.width, height: this.height, cursor: "pointer", opacity: this.opacity, color: this.color
            } });
    }

    const name$1 = "map";
    const pathData$1 = "M8.625.031a5.48 5.48 0 0 1 2.11.61c.656.343 1.229.78 1.718 1.312a5.75 5.75 0 0 1 1.14 1.844c.272.698.407 1.36.407 1.984 0 .438-.083.88-.25 1.328-.167.448-.39.933-.672 1.454-.281.52-.599 1.062-.953 1.624A61.7 61.7 0 0 1 11 11.907 90.076 90.076 0 0 1 8.062 16 63.64 63.64 0 0 1 5 11.844c-.354-.5-.714-1.037-1.078-1.61a24.107 24.107 0 0 1-.969-1.656c-.281-.531-.51-1.02-.687-1.469A3.67 3.67 0 0 1 2 5.75c0-.667.156-1.365.469-2.094A6.02 6.02 0 0 1 3.75 1.75 6.02 6.02 0 0 1 5.656.469 5.886 5.886 0 0 1 8 0h.343c.084 0 .178.01.282.031Zm-.563 14.313a105.46 105.46 0 0 0 1.829-2.578 49.242 49.242 0 0 0 1.578-2.438c.458-.76.828-1.432 1.11-2.015.28-.584.421-1.115.421-1.594 0-.459-.115-.974-.344-1.547a5.22 5.22 0 0 0-.937-1.531 5.061 5.061 0 0 0-1.406-1.11A4.664 4.664 0 0 0 8.53 1h-.56c-.688 0-1.328.13-1.922.39A5.122 5.122 0 0 0 3.39 4.064C3.13 4.667 3 5.218 3 5.718s.156 1.062.469 1.687c.312.625.713 1.323 1.203 2.094a70.72 70.72 0 0 0 1.625 2.438 55.737 55.737 0 0 0 1.766 2.406ZM8 3c.833 0 1.542.292 2.125.875S11 5.167 11 6s-.292 1.542-.875 2.125A2.893 2.893 0 0 1 8 9a2.893 2.893 0 0 1-2.125-.875A2.893 2.893 0 0 1 5 6c0-.833.292-1.542.875-2.125A2.893 2.893 0 0 1 8 3Zm0 5c.563 0 1.036-.198 1.422-.594C9.807 7.01 10 6.542 10 6c0-.563-.193-1.036-.578-1.422A1.933 1.933 0 0 0 8 4c-.542 0-1.01.193-1.406.578C6.198 4.964 6 5.438 6 6c0 .542.198 1.01.594 1.406A1.92 1.92 0 0 0 8 8Z";
    const ltr$1 = false;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "map";
    const pathData = "M8 0c3.68 0 6.5 2.987 6.5 6.625 0 2.477-1.565 4.813-3.009 6.45-.822.932-1.734 1.86-2.754 2.584-.249.177-.499.341-.737.341-.258 0-.555-.205-.737-.34-.546-.409-1.648-1.332-2.754-2.586C3.065 11.438 1.5 9.102 1.5 6.625 1.5 2.987 4.32 0 8 0Zm0 1.5c-2.81 0-5 2.273-5 5.125 0 1.898 1.238 3.875 2.634 5.457.682.773 1.37 1.417 1.895 1.865.18.154.34.282.471.385.131-.103.291-.231.47-.385a19.346 19.346 0 0 0 1.896-1.865C11.762 10.5 13 8.523 13 6.625 13 3.773 10.81 1.5 8 1.5Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z";
    const ltr = false;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name, { pathData, ltr, viewBox, collection, packageName });

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * <h3 class="comment-api-title">Overview</h3>
     *
     *
     * <h3>Usage</h3>
     *
     * <h3>CSS Shadow Parts</h3>
     *
     * <h3>ES6 Module Import</h3>
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    let GeomapSpotComponent = class GeomapSpotComponent extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Icon to be displayed as a spot.
             * @default "map"
             * @public
             */
            this.icon = "map";
            /**
             * Width of the spot displayed.
             * @default "2rem"
             * @public
             */
            this.width = "2rem";
            /**
             * Height of the spot displayed.
             * @default "2rem"
             * @public
             */
            this.height = "2rem";
            /**
             * Opacity of the spot displayed.
             * @default "1"
             * @public
             */
            this.opacity = "1";
            /**
             * Color of the spot displayed.
             * @default ""
             * @public
             */
            this.color = "";
            /**
             * Longitude of the spot displayed.
             * @default 0
             * @public
             */
            this.lng = 0;
            /**
             * Latitude of the spot displayed.
             * @default 0
             * @public
             */
            this.lat = 0;
        }
    };
    __decorate$1([
        webcomponentsBase.s({ type: String })
    ], GeomapSpotComponent.prototype, "icon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: String })
    ], GeomapSpotComponent.prototype, "width", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: String })
    ], GeomapSpotComponent.prototype, "height", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: String })
    ], GeomapSpotComponent.prototype, "opacity", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: String })
    ], GeomapSpotComponent.prototype, "color", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number })
    ], GeomapSpotComponent.prototype, "lng", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number })
    ], GeomapSpotComponent.prototype, "lat", void 0);
    GeomapSpotComponent = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-geomap-spot-component",
            renderer: Geomap.y,
            template: GeomapSpotComponentTemplate,
        })
    ], GeomapSpotComponent);
    GeomapSpotComponent.define();
    var GeomapSpotComponent$1 = GeomapSpotComponent;

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
     * The `ui5-geomap-spot` defines the Spot webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSpot.js";`
     *
     * @constructor
     * @extends GeomapMarkerBase
     * @experimental
     * @public
     */
    let GeomapSpot = class GeomapSpot extends GeomapMarkerBase {
        constructor() {
            super(...arguments);
            /**
             * Describes if the spot is draggable.
             * @default false
             * @public
             */
            this.draggable = false;
            /**
             * Icon of the spot displayed on the map.
             * @default "map"
             * @public
             */
            this.icon = "map";
            /**
             * Width of the spot displayed on the map.
             * @default "2rem"
             * @public
             */
            this.width = "2rem";
            /**
             * Height of the spot displayed on the map.
             * @default "2rem"
             * @public
             */
            this.height = "2rem";
            /**
             * Opacity of the spot displayed on the map.
             * @default "1"
             * @public
             */
            this.opacity = "1";
            /**
             * Color of the spot displayed on the map.
             * @default ""
             * @public
             */
            this.color = "";
            /**
             * Anchor point of the marker element relative to the geographic coordinate.
             * Determines which part of the marker element is placed at the exact lng/lat position.
             * Use "bottom" (default) so the tip of a pin icon points to the coordinate.
             * Accepted values: "center", "top", "bottom", "left", "right",
             * "top-left", "top-right", "bottom-left", "bottom-right".
             * @default "bottom"
             * @public
             */
            this.anchor = "bottom";
        }
        /**
         * @override
         */
        createMarkerInstance() {
            const options = {};
            options.draggable = this.draggable;
            options.anchor = this.anchor;
            options.subpixelPositioning = true;
            const spotComponent = new GeomapSpotComponent$1();
            spotComponent.icon = this.icon;
            spotComponent.width = this.width;
            spotComponent.height = this.height;
            spotComponent.opacity = this.opacity;
            spotComponent.color = this.color;
            spotComponent.lng = this.lng;
            spotComponent.lat = this.lat;
            // Set explicit dimensions so MapLibre can calculate the anchor offset before the shadow DOM renders.
            spotComponent.style.width = this.width;
            spotComponent.style.height = this.height;
            spotComponent.style.display = "block";
            options.element = spotComponent;
            spotComponent.addEventListener("click", e => {
                const prevented = !this.fireDecoratorEvent("click", e);
                if (prevented) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            spotComponent.addEventListener("contextmenu", e => {
                const prevented = !this.fireDecoratorEvent("right-click", e);
                if (prevented) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            const marker = new Geomap.maplibreGlCspExports.Marker(options)
                .setLngLat(new Geomap.maplibreGlCspExports.LngLat(this.lng, this.lat));
            this._updateAriaAttributes(marker.getElement());
            marker.on("dragend", () => {
                const center = marker.getLngLat();
                this.lng = center.lng;
                this.lat = center.lat;
            });
            return marker;
        }
        /**
         * @override
         * @param marker
         */
        updateMarkerInstance(marker) {
            marker.setLngLat(new Geomap.maplibreGlCspExports.LngLat(this.lng, this.lat)).setDraggable(this.draggable);
            // Sync visual properties on the spot component without recreating the marker.
            const spotComponent = marker.getElement();
            if (spotComponent) {
                spotComponent.icon = this.icon;
                spotComponent.width = this.width;
                spotComponent.height = this.height;
                spotComponent.opacity = this.opacity;
                spotComponent.color = this.color;
                spotComponent.style.width = this.width;
                spotComponent.style.height = this.height;
            }
        }
        handleInvalidation(changeInfo) {
            // anchor cannot be updated on an existing MapLibre Marker;
            if (changeInfo.type === "property" && changeInfo.name === "anchor" && this._markerInstance) {
                const map = this.map;
                this._markerInstance.remove();
                this._markerInstance = null;
                if (map) {
                    this.markerInstance.addTo(map);
                }
            }
        }
        _updateAriaAttributes(markerElement) {
            markerElement.setAttribute("aria-label", "Spot marker");
            markerElement.setAttribute("role", "img");
        }
        getFocusDomRef() {
            return this.markerInstance?.getElement();
        }
        /**
         * Triggers a pulsing circle animation around the spot for 5 seconds.
         * The animation shows a circle with border that expands and fades out.
         * @param direction Inside-Out or reverse
         */
        triggerPulseAnimation(direction = 1) {
            Geomap.PulseAnimationUtil.triggerPulseAnimation(this.map, {
                lng: this.lng,
                lat: this.lat,
                direction,
            });
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapSpot.prototype, "draggable", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSpot.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSpot.prototype, "width", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSpot.prototype, "height", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSpot.prototype, "opacity", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSpot.prototype, "color", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapSpot.prototype, "anchor", void 0);
    GeomapSpot = __decorate([
        webcomponentsBase.m({
            tag: "ui5-geomap-spot",
        })
        /**
         * Fired once the spot is clicked.
         * @public
         */
        ,
        Geomap.l("click", { cancelable: true })
        /**
         * Fired on double-click of the spot.
         * @public
         */
        ,
        Geomap.l("double-click")
        /**
         * Fired on right-click of the spot.
         * @public
         */
        ,
        Geomap.l("right-click", { cancelable: true })
        /**
         * Fired on mouseover of the spot.
         * @public
         */
        ,
        Geomap.l("mouseover")
        /**
         * Fired on mouseout of the spot.
         * @public
         */
        ,
        Geomap.l("mouseout")
    ], GeomapSpot);
    GeomapSpot.define();
    var GeomapSpot_default = GeomapSpot;

    return GeomapSpot_default;

}));

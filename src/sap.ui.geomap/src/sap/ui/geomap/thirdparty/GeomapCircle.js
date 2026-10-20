sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapShape', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapInteger', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster'], (function (webcomponentsBase, Geomap, GeomapShape, geomapProperty, GeomapInteger, GeomapLayerBase, GeomapElement, Cluster) { 'use strict';

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
     * The `ui5-geomap-circle` defines the Circle webcomponent.
     * GeomapCircle represent circles, defined in screen units (pixels).
     * Rendered on the map as layers.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCircle.js";`
     *
     * @constructor
     * @extends GeomapShape
     * @experimental
     * @public
     */
    let GeomapCircle = class GeomapCircle extends GeomapShape {
        constructor() {
            super();
            /**
            * Describes the longitude of the center of the circle.
            * @default 0
            * @public
            */
            this.lng = 0;
            /**
            * Describes the latitude of the center of the circle.
            * @default 0
            * @public
            */
            this.lat = 0;
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
            * Describes the width of the outline of the circle.
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
            /**
             * Describes if the circle is draggable & editable.
             * @default false
             * @public
             */
            this.dragndrop = false;
            this._handleAddDraggable = this.handleAddDraggable.bind(this);
            this._finishDraggable = this.finishDraggable.bind(this);
        }
        /**
        * @override
        */
        sourceUpdateNeeded(changeInfo) {
            if (changeInfo.type === "property") {
                const propName = changeInfo.name;
                return ["lng", "lat"].includes(propName);
            }
            return false;
        }
        /**
        * @override
        */
        get sourceData() {
            return Geomap.GeomapGeometry.geomapPoint([this.lng, this.lat]);
        }
        /**
        * @override
        */
        get layerType() {
            return "circle";
        }
        handleAddDraggable() {
            this._internalState.dragging = true;
            this.addDrawer();
        }
        /**
         * @override
         */
        attachDragAndDrop() {
            if (this.dragndrop) {
                super.handleDraggable("circle-color", this.fillColor, this._handleAddDraggable);
            }
        }
        removeDrawer() {
            const draw = this.draw;
            if (!this._internalState.id) {
                return;
            }
            draw.removeFeatures([this._internalState.id]);
            this._internalState.dragging = false;
            // detach listeners
            draw.off("finish", this._finishDraggable);
        }
        addDrawer() {
            const data = this.sourceData;
            data.properties = {
                mode: "point",
                "isExistingFeature": true,
            };
            const draw = this.draw;
            const oSelectionStyles = { ...Geomap.getSelectionStyles() };
            oSelectionStyles.width = this.radius;
            Geomap.setSelectionStyles(oSelectionStyles, this.tagName.toLowerCase());
            draw.start();
            draw.setModeStyles("select", oSelectionStyles); // reapply
            draw.setMode("point");
            const id = draw.getFeatureId();
            this._internalState.id = id;
            data.id = id;
            draw.addFeatures([
                {
                    id,
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [this.lng, this.lat],
                    },
                    "properties": {
                        "mode": "point",
                        "isExistingFeature": true,
                    },
                },
            ]);
            draw.setMode("select");
            draw.on("finish", this._finishDraggable);
        }
        finishDraggable(e) {
            const id = this._internalState.id;
            const draw = this.draw;
            if (e !== id) {
                return;
            }
            // update the points
            const snapshot = draw.getSnapshot();
            const selObj = snapshot.find(feature => feature.id === id);
            if (!selObj) {
                return;
            }
            this.lng = selObj.geometry.coordinates[0];
            this.lat = selObj.geometry.coordinates[1];
            this.fireDecoratorEvent("circle-dragndrop-end", {
                centerLng: this.lng,
                centerLat: this.lat,
                radius: this.radius,
            });
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapCircle.prototype, "lng", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapCircle.prototype, "lat", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "circle-radius" })
    ], GeomapCircle.prototype, "radius", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "circle-color" })
    ], GeomapCircle.prototype, "fillColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "circle-stroke-color" })
    ], GeomapCircle.prototype, "outlineColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, paint: "circle-stroke-width" })
    ], GeomapCircle.prototype, "outlineWidth", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "circle-opacity" })
    ], GeomapCircle.prototype, "opacity", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapCircle.prototype, "dragndrop", void 0);
    GeomapCircle = __decorate([
        webcomponentsBase.m("ui5-geomap-circle")
        /**
         * Fired when the circle edit is finished.
         * @public
         * */
        ,
        Geomap.l("circle-dragndrop-end", {
            cancelable: true,
            bubbles: true,
        })
    ], GeomapCircle);
    GeomapCircle.define();
    var GeomapCircle_default = GeomapCircle;

    return GeomapCircle_default;

}));

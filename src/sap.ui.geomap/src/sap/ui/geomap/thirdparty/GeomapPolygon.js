sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapShape', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, GeomapShape, geomapProperty, GeomapLayerBase, GeomapElement, Cluster, GeomapInteger) { 'use strict';

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
     * The `ui5-geomap-polygon` defines the Polygon webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapPolygon.js";`
     *
     * @constructor
     * @extends GeomapShape
     * @experimental
     * @public
     */
    let GeomapPolygon = class GeomapPolygon extends GeomapShape {
        constructor() {
            super();
            /**
            * Color of the fill of the layer of the polygon.
            * @default "black"
            * @public
            */
            this.fillColor = "black";
            /**
            * Outline color of the layer of the polygon.
            * @default "black"
            * @public
            */
            this.outlineColor = "black";
            /**
            * Opacity of the layer of the polygon.
            * @default 0.5
            * @public
            */
            this.opacity = 0.5;
            /**
             * Describes if the polygon is draggable & editable.
             * @default false
             * @public
             */
            this.dragndrop = false;
            this._handleAddDraggable = this.handleAddDraggable.bind(this);
            this._finishDraggable = this.finishDraggable.bind(this);
        }
        get pointsArr() {
            // eslint-disable-next-line
            const points = this.points.map((point) => [point.lng, point.lat]);
            if (points.length) {
                return [...points, points[0]]; // always end with the first point
            }
            return points;
        }
        /**
        * @override
        */
        sourceUpdateNeeded(changeInfo) {
            return changeInfo.type === "slot";
        }
        /**
        * @override
        */
        get sourceData() {
            if (this.points.length < 3) {
                return {
                    id: undefined,
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: [],
                    },
                };
            }
            return Geomap.GeomapGeometry.geomapPolygon([this.pointsArr]);
        }
        /**
        * @override
        */
        get layerType() {
            return "fill";
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
                super.handleDraggable("fill-color", this.fillColor, this._handleAddDraggable);
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
                mode: "polygon",
                "isExistingFeature": true,
            };
            const draw = this.draw;
            draw.start();
            draw.setMode("polygon");
            const id = draw.getFeatureId();
            this._internalState.id = id;
            data.id = id;
            draw.addFeatures([
                data,
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
            for (let i = 0; i < this.points.length; i++) {
                this.removeChild(this.points[i]);
            }
            for (let i = 0; i < selObj.geometry.coordinates[0].length; i++) {
                const pt = document.createElement("ui5-geomap-point");
                pt.lng = selObj.geometry.coordinates[0][i][0];
                pt.lat = selObj.geometry.coordinates[0][i][1];
                this.appendChild(pt);
            }
            this.fireDecoratorEvent("polygon-dragndrop-end", {
                polygon: selObj,
            });
        }
    };
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "fill-color" })
    ], GeomapPolygon.prototype, "fillColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "fill-outline-color" })
    ], GeomapPolygon.prototype, "outlineColor", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "fill-opacity" })
    ], GeomapPolygon.prototype, "opacity", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapPolygon.prototype, "dragndrop", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, invalidateOnChildChange: true, "default": true })
    ], GeomapPolygon.prototype, "points", void 0);
    GeomapPolygon = __decorate([
        webcomponentsBase.m("ui5-geomap-polygon")
        /**
         * Fired when the polygon edit is finished.
         * @public
         * */
        ,
        Geomap.l("polygon-dragndrop-end", {
            cancelable: true,
            bubbles: true,
        })
    ], GeomapPolygon);
    GeomapPolygon.define();
    var GeomapPolygon_default = GeomapPolygon;

    return GeomapPolygon_default;

}));

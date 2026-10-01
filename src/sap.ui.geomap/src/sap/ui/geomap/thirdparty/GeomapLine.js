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
     * The `ui5-geomap-line` defines the Line webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapLine.js";`
     *
     * @constructor
     * @extends GeomapShape
     * @experimental
     * @public
     */
    let GeomapLine = class GeomapLine extends GeomapShape {
        constructor() {
            super();
            /**
            * Describes the color of the line.
            * @default "black"
            * @public
            */
            this.color = "black";
            /**
            * Describes the width of the line.
            * @default 0
            * @public
            */
            this.width = 0;
            /**
            * Describes the opacity of the line.
            * @default 0.5
            * @public
            */
            this.opacity = 0.5;
            /**
             * Describes if the line is draggable & editable.
             * @default false
             * @public
             */
            this.dragndrop = false;
            this._handleAddDraggable = this.handleAddDraggable.bind(this);
            this._finishDraggable = this.finishDraggable.bind(this);
        }
        get pointsArr() {
            // eslint-disable-next-line
            return this.points.map((point) => [point.lng, point.lat]);
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
            if (this.points.length < 2) {
                return {
                    id: undefined,
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                };
            }
            return Geomap.GeomapGeometry.geomapLine(this.pointsArr);
        }
        /**
        * @override
        */
        get layerType() {
            return "line";
        }
        /**
        * @override
        */
        get layoutProperties() {
            return {
                ...super.layoutProperties,
                "line-join": "round",
            };
        }
        /**
        * @public
        */
        getPointAt(distance, units) {
            // const point = along(GeomapGeometry.geomapLine(this.pointsArr) as unknown as LineString, distance, { units });
            const point = Geomap.GeomapGeometry.geomapAlong(Geomap.GeomapGeometry.geomapLine(this.pointsArr), distance, { units });
            return {
                lng: point.geometry.coordinates[0],
                lat: point.geometry.coordinates[1],
            };
        }
        /**
        * @public
        */
        getDistance(units) {
            return Geomap.GeomapGeometry.geomapCalculateDistance(Geomap.GeomapGeometry.geomapLine(this.pointsArr), { units });
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
                super.handleDraggable("line-color", this.color, this._handleAddDraggable);
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
                mode: "linestring",
                "isExistingFeature": true,
            };
            const draw = this.draw;
            const oSelectionStyles = { ...Geomap.getSelectionStyles() };
            oSelectionStyles.width = this.width;
            oSelectionStyles.fillColor = this.color;
            Geomap.setSelectionStyles(oSelectionStyles, this.tagName.toLowerCase());
            const id = draw.getFeatureId();
            this._internalState.id = id;
            data.id = id;
            draw.start();
            draw.setModeStyles("select", oSelectionStyles); // reapply
            draw.setMode("linestring");
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
            for (let i = 0; i < selObj.geometry.coordinates.length; i++) {
                const pt = document.createElement("ui5-geomap-point");
                pt.lng = selObj.geometry.coordinates[i][0];
                pt.lat = selObj.geometry.coordinates[i][1];
                this.appendChild(pt);
            }
            this.fireDecoratorEvent("line-dragndrop-end", {
                points: this.pointsArr,
            });
        }
    };
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "line-color" })
    ], GeomapLine.prototype, "color", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "line-width" })
    ], GeomapLine.prototype, "width", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "line-opacity" })
    ], GeomapLine.prototype, "opacity", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapLine.prototype, "dragndrop", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, invalidateOnChildChange: true, "default": true })
    ], GeomapLine.prototype, "points", void 0);
    GeomapLine = __decorate([
        webcomponentsBase.m("ui5-geomap-line")
        /**
         * Fired when the polygon drag is finished.
         * @public
         * */
        ,
        Geomap.l("line-dragndrop-end", {
            cancelable: true,
            bubbles: true,
        })
    ], GeomapLine);
    GeomapLine.define();
    var GeomapLine_default = GeomapLine;

    return GeomapLine_default;

}));

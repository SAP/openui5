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
     * The `ui5-geomap-arc` defines the Arc webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapArc.js";`
     *
     * @constructor
     * @extends GeomapShape
     * @experimental
     * @public
     */
    let GeomapArc = class GeomapArc extends GeomapShape {
        constructor() {
            super(...arguments);
            /**
            * Describes the longitude of the center of the starting point.
            * @default 0
            * @public
            */
            this.beginLng = 0;
            /**
            * Describes the latitude of the center of the starting point.
            * @default 0
            * @public
            */
            this.beginLat = 0;
            /**
            * Describes the longitude of the center of the ending point.
            * @default 0
            * @public
            */
            this.endLng = 0;
            /**
            * Describes the latitude of the center of the ending point.
            * @default 0
            * @public
            */
            this.endLat = 0;
            /**
            * Describes the number of steps to use in the arc and animation, more steps means
            * a smoother arc and animation, but too many steps will result in a low frame rate.
            * @default 0
            * @public
            */
            this.steps = 0;
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
        }
        /**
        * @override
        */
        sourceUpdateNeeded(changeInfo) {
            if (changeInfo.type === "property") {
                const propName = changeInfo.name;
                return ["beginLng", "beginLat", "endLng", "endLat", "steps"].includes(propName);
            }
            return false;
        }
        get line() {
            const beginPoint = [this.beginLng, this.beginLat];
            const endPoint = [this.endLng, this.endLat];
            return Geomap.GeomapGeometry.geomapLine([beginPoint, endPoint]);
        }
        /**
        * @override
        */
        get sourceData() {
            const line = this.line;
            const distance = Geomap.GeomapGeometry.geomapCalculateDistance(line, { units: "kilometers" });
            const points = [];
            for (let i = 0; i < distance; i += distance / this.steps) {
                // const point = along(line.geometry as unknown as LineString, i, { units: "kilometers" });
                const point = Geomap.GeomapGeometry.geomapAlong(line.geometry, i, { units: "kilometers" });
                points.push(point.geometry.coordinates);
            }
            points.push([this.endLng, this.endLat]);
            return Geomap.GeomapGeometry.geomapLine(points);
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
            // const point = along(this.line.geometry as unknown as LineString, distance, units);
            const point = Geomap.GeomapGeometry.geomapAlong(this.line.geometry, distance, units);
            return {
                lng: point.geometry.coordinates[0],
                lat: point.geometry.coordinates[1],
            };
        }
        /**
        * @public
        */
        getDistance(units) {
            return Geomap.GeomapGeometry.geomapCalculateDistance(this.line, { units });
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapArc.prototype, "beginLng", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapArc.prototype, "beginLat", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapArc.prototype, "endLng", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapArc.prototype, "endLat", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapArc.prototype, "steps", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: String, paint: "line-color" })
    ], GeomapArc.prototype, "color", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "line-width" })
    ], GeomapArc.prototype, "width", void 0);
    __decorate([
        geomapProperty.geomapProperty({ type: Number, paint: "line-opacity" })
    ], GeomapArc.prototype, "opacity", void 0);
    GeomapArc = __decorate([
        webcomponentsBase.m("ui5-geomap-arc")
    ], GeomapArc);
    GeomapArc.define();
    var GeomapArc_default = GeomapArc;

    return GeomapArc_default;

}));

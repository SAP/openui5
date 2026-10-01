sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapSource', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapSource, Cluster, GeomapElement) { 'use strict';

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
     * The `ui5-geomap-cluster-source` defines the Cluster Source webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapClusterSource.js";`
     *
     * @constructor
     * @extends GeomapSource
     * @experimental
     * @public
     */
    let GeomapClusterSource = class GeomapClusterSource extends GeomapSource {
        constructor() {
            super();
            /**
            * Cluster properties
            * @default {}
            * @public
            */
            this.clusterProperties = {};
            /**
            * Cluster radius - the bigger, the sooner points will be clustered
            * @default 50
            * @public
            */
            this.clusterRadius = 50;
            /**
            * Cluster min points - minimum amount of points, required to form a cluster
            * @default 2
            * @public
            */
            this.clusterMinPoints = 2;
            /**
            * Cluster max zoom - when the zoom level is above this value, clustering is disabled
            * @default 0
            * @public
            */
            this.clusterMaxZoom = 0;
        }
        get createOptions() {
            const options = {
                cluster: true,
                clusterRadius: this.clusterRadius,
                clusterMinPoints: this.clusterMinPoints,
                clusterProperties: this.clusterProperties,
            };
            if (this.clusterMaxZoom) {
                options.clusterMaxZoom = this.clusterMaxZoom;
            }
            return options;
        }
        /**
        * Returns all clusters, currently visible on the screen.
        * @public
        */
        getClusters() {
            if (!this.map) {
                return [];
            }
            const features = this.map.querySourceFeatures(this.effectiveId);
            return features.filter(feature => { return Cluster.Cluster.isCluster(feature); }).map((feature) => new Cluster.Cluster(this.map, this.source, feature));
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], GeomapClusterSource.prototype, "clusterProperties", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapClusterSource.prototype, "clusterRadius", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapClusterSource.prototype, "clusterMinPoints", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapClusterSource.prototype, "clusterMaxZoom", void 0);
    GeomapClusterSource = __decorate([
        webcomponentsBase.m("ui5-geomap-cluster-source")
    ], GeomapClusterSource);
    GeomapClusterSource.define();
    var GeomapClusterSource_default = GeomapClusterSource;

    return GeomapClusterSource_default;

}));

sap.ui.define(['exports'], (function (exports) { 'use strict';

    /**
     * Class that represents a geojson feature
     *
     * @class
     * @public
     */
    class Feature {
        constructor(map, source, feature) {
            this.map = map;
            this.source = source;
            this.feature = feature;
        }
        get type() {
            return "Feature";
        }
        /**
        * Returns the id of the geojson feature, if set
        *
        * @default 0
        * @public
        */
        get id() {
            return this.feature.id;
        }
        /**
        * Returns the geometry of the geojson feature
        *
        * @default null
        * @public
        */
        get geometry() {
            return this.feature.geometry;
        }
        /**
        * Returns the properties of the geojson feature
        *
        * @default null
        * @public
        */
        get properties() {
            return this.feature.properties;
        }
        /**
        * Sets feature state
        * @public
        * @param state
        */
        setState(state) {
            this.map.setFeatureState({
                source: this.source.id,
                id: this.id,
            }, { "ui5-geomap-state": state });
        }
    }

    /**
     * Class that represents a geojson feature for a cluster
     *
     * @class
     * @public
     */
    class Cluster extends Feature {
        /**
         * Returns all  original points in a cluster
         * @public
         * @param limit How many items to return (useful for paging)
         * @param offset From what index to return items (useful for paging)
         */
        async getLeaves(limit, offset) {
            const leaves = await this.source.getClusterLeaves(this.properties.cluster_id, limit, offset);
            return leaves;
        }
        /**
         * Returns all children (other clusters) of a cluster
         * @public
         * @returns Promise
         */
        async getChildren() {
            const children = await this.source.getClusterChildren(this.properties.cluster_id);
            return children;
        }
        /**
         * Expands the cluster by zooming the map just beyond the level where the cluster forms
         * @public
         * @returns Promise
         */
        async expand() {
            const zoom = await this.source.getClusterExpansionZoom(this.properties.cluster_id);
            this.map.easeTo({
                center: this.geometry.coordinates,
                zoom,
            });
            return zoom;
        }
        /**
         * Determines if a geojson feature is a cluster
         *
         * @public
         * @param feature geojson feature
         * @returns true|false
         */
        static isCluster(feature) {
            return !!feature.properties.cluster;
        }
    }

    exports.Cluster = Cluster;
    exports.Feature = Feature;

}));

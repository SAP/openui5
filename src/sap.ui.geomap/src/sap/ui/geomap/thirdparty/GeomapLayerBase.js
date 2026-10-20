sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, GeomapElement, Cluster, geomapProperty, GeomapInteger) { 'use strict';

    /**
     * Different types of features display.
     * @public
     */
    var GeomapDisplayedFeatures;
    (function (GeomapDisplayedFeatures) {
        /**
        * All features are displayed
        * @public
        */
        GeomapDisplayedFeatures["All"] = "All";
        /**
        * Only not-clustered points are displayed
        * @public
        */
        GeomapDisplayedFeatures["NotClustered"] = "NotClustered";
        /**
        * Only clustered points are displayed
        * @public
        */
        GeomapDisplayedFeatures["Clustered"] = "Clustered";
    })(GeomapDisplayedFeatures || (GeomapDisplayedFeatures = {}));
    var GeomapDisplayedFeatures$1 = GeomapDisplayedFeatures;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * Layer clicked
     *
     * @public
     */
    let GeomapLayerBase = class GeomapLayerBase extends GeomapElement {
        constructor() {
            super();
            /**
            * When the map's zoom property is less than this value, the layer will be hidden.
            * Accepts values between 0 and 24.
            *
            * @default 0
            * @public
            */
            this.minZoom = 0;
            /**
            * When the map's zoom property is equal to, or greater than this value, the layer will be hidden
            * Accepts values between 0 and 24.
            *
            * @default 0
            * @public
            */
            this.maxZoom = 0;
            /**
            * When set, only features, matching the filter, will be displayed
            *
            * @default {}
            * @public
            */
            this.filter = {};
            /**
            * Determines which features the layer will display - All (default), only not-clustered, or only clustered
            * <b>Note:</b> This property is ignored if the <code>filter</code> property is set
            * <b>Note:</b> This property only makes sense when the layer is used for clustering (displays data from a <code>ui5-geomap-cluster-source</code> element)
            * @public
            */
            this.displayedFeatures = "All";
            /**
            * Determines if the layer is hidden.
            * @default false
            * @public
            */
            this.hidden = false;
            /**
            * Describes the zIndex of the layer. The layer with the highest zIndex will be on top.
            * @default 0
            * @public
            */
            this.zIndex = 0;
            /**
            * Describes the width of the layer.
            * @default undefined
            * @public
            */
            this.width = undefined;
            /**
             * Sort layers by the metadata zIndex property
             */
            this._fnSorter = (layer1, layer2) => {
                if (layer1.metadata.zIndex < layer2.metadata.zIndex) {
                    return -1;
                }
                if (layer1.metadata.zIndex > layer2.metadata.zIndex) {
                    return 1;
                }
                return 0;
            };
            this.attachInvalidate(this.handleInvalidation.bind(this));
            this._internalState = {
                dragging: false,
                id: null,
            };
        }
        async onEnterDOM() {
            await this.whenMapConnected();
            await this.whenMapLoaded();
            await this.whenDrawConnected();
            this.createLayer();
            this.updateLayerProperties();
            this.attachDragAndDrop && this.attachDragAndDrop(); // not ok in this hook
        }
        onExitDOM() {
            if (this.map) {
                this.removeLayer();
            }
            super.onExitDOM();
        }
        _getInsertBeforeLayerId() {
            // @ts-ignore
            const allLayers = this.map?.getStyle().layers.filter((layer) => layer.metadata && layer.metadata.zIndex !== undefined).sort(this._fnSorter);
            const firstLayerWithBiggerZIndex = allLayers?.find((layer) => layer.metadata.zIndex > this.zIndex);
            return firstLayerWithBiggerZIndex ? firstLayerWithBiggerZIndex.id : undefined;
        }
        _getEffectiveFilter() {
            if (Array.isArray(this.filter) && this.filter.length > 0) {
                return this.filter; // filter used,  highest priority
            }
            if (this.displayedFeatures === GeomapDisplayedFeatures$1.NotClustered) {
                return ["!", ["has", "point_count"]];
            }
            if (this.displayedFeatures === GeomapDisplayedFeatures$1.Clustered) {
                return ["has", "point_count"];
            }
        }
        createLayer() {
            const options = {
                "id": this._id,
                "source": this.layerSource,
                "type": this.layerType,
                "metadata": {
                    zIndex: this.zIndex,
                },
            };
            // Set minZoom, if set
            if (this.minZoom !== undefined) {
                options.minzoom = this.minZoom;
            }
            // Set maxZoom, if set
            if (this.maxZoom !== undefined) {
                options.maxzoom = this.maxZoom;
            }
            // Set filter/displayedFeatures, if set (filter takes precedence)
            const effectiveFilter = this._getEffectiveFilter();
            if (effectiveFilter !== undefined) {
                options.filter = effectiveFilter;
            }
            this.map?.addLayer(options, this._getInsertBeforeLayerId());
            // Bind for all needed events
            const events = ["click", "mouseenter", "mousemove", "mouseleave", "mousedown", "mouseup"];
            events.forEach(eventName => {
                this.map?.on(eventName, this._id, (e) => {
                    if (!this.map) {
                        return;
                    }
                    const marker = this.map.getHelperMarker(eventName === "click" ? "click" : "hover");
                    marker.setLngLat(e.lngLat);
                    const prevented = !this.fireDecoratorEvent(`layer-${eventName}`, {
                        lng: e.lngLat.lng,
                        lat: e.lngLat.lat,
                        x: e.point.x,
                        y: e.point.y,
                        dom: marker.getElement(),
                        features: e.features ? e.features.map((feature) => new Cluster.Feature(this.map, this.map?.getSource(this.layerSource), feature)) : undefined,
                        cluster: e.features && e.features[0] && Cluster.Cluster.isCluster(e.features[0]) ? new Cluster.Cluster(this.map, this.map.getSource(this.layerSource), e.features[0]) : undefined,
                    });
                    if (prevented) {
                        e.preventDefault();
                    }
                });
            });
            // Layers are lost upon style change
            this.map?.on("styledata", () => {
                if (this.map && !this.map.getLayer(this._id)) {
                    this.createLayer();
                    this.updateLayerProperties();
                }
            });
        }
        removeLayer() {
            this.map?.removeLayer(this._id);
        }
        updateLayerProperties() {
            for (const [prop, value] of Object.entries(this.paintProperties)) { // eslint-disable-line
                this.map?.setPaintProperty(this._id, prop, value === "" ? undefined : value); // "" is not accepted
            }
            for (const [prop, value] of Object.entries(this.layoutProperties)) { // eslint-disable-line
                this.map?.setLayoutProperty(this._id, prop, value === "" ? undefined : value);
            }
        }
        handleInvalidation(changeInfo) {
            if (!this.map || !this.map.getLayer(this._id)) {
                return;
            }
            if (changeInfo.type === "property") {
                const propName = changeInfo.name;
                const propData = this.constructor.getMetadata().getProperties()[propName];
                if (propName === "filter" || propName === "displayedFeatures") {
                    this.map.setFilter(this._id, this._getEffectiveFilter());
                }
                else if (propName === "minZoom" || propName === "maxZoom") {
                    this.map.setLayerZoomRange(this._id, this.minZoom, this.maxZoom);
                }
                else if (propName === "zIndex") {
                    this.map.moveLayer(this._id, this._getInsertBeforeLayerId());
                }
                else if (propData.paint) {
                    const value = this._getPropertyValue(propName, propData);
                    this.map.setPaintProperty(this._id, propData.paint, value === "" ? undefined : value); // "" is not accepted
                }
                else if (propData.layout) {
                    const value = this._getPropertyValue(propName, propData);
                    this.map.setLayoutProperty(this._id, propData.layout, value === "" ? undefined : value); // "" is not accepted
                }
            }
        }
        getFocusDomRef() {
            return this.map.getHelperMarker("click").getElement();
        }
        get layerSource() {
            return "";
        }
        get sourceData() {
            return { type: "Feature" };
        }
        /**
        * Layer type ("line", "fill", etc...)
        */
        get layerType() {
            return "";
        }
        get stateDragging() {
            return this._internalState.dragging;
        }
        _getPropertyValue(prop, propData) {
            if (propData.formatter) {
                return propData.formatter(this[prop]);
            }
            return this[prop];
        }
        _getPropertiesOfType(type) {
            const result = {};
            const props = this.constructor.getMetadata().getProperties();
            Object.keys(props).forEach(propName => {
                if (Object.prototype.hasOwnProperty.call(props, propName)) {
                    const propData = props[propName];
                    if (propData[type]) {
                        const value = this._getPropertyValue(propName, propData);
                        if (value !== undefined) {
                            result[propData[type]] = value;
                        }
                    }
                }
            });
            return result;
        }
        attachDragAndDrop() { }
        /**
         * Handles moving the figure over the map
         * @param sPaintProperty property name that is used to paint the figure(layer)
         * @param sColor
         * @param fnHandler callback executed mousedown/touchstart
         */
        handleDraggable(sPaintProperty, sColor, fnHandler) {
            if (!sPaintProperty || !sColor || !fnHandler) {
                return;
            }
            const shapeColor = sColor;
            const shapeColorHover = Geomap.getSelectionStyles().dragndropHover;
            const layer = this.__id;
            const canvas = this.map.getCanvasContainer();
            this.map.on("mouseenter", layer, () => {
                this.map.setPaintProperty(layer, sPaintProperty, `#${shapeColorHover}`);
                canvas.style.cursor = "move";
            });
            this.map.on("mouseleave", layer, () => {
                this.map.setPaintProperty(layer, sPaintProperty, shapeColor);
                canvas.style.cursor = "";
            });
            this.map.on("mousedown", layer, e => {
                // Prevent the default map drag behavior.
                e.preventDefault();
                if (this._internalState.dragging) {
                    // already dragging
                    return;
                }
                canvas.style.cursor = "grab";
                fnHandler();
            });
            this.map.on("touchstart", layer, e => {
                if (e.points.length !== 1) {
                    return;
                }
                // Prevent the default map drag behavior.
                e.preventDefault();
                fnHandler();
            });
        }
        get paintProperties() {
            return this._getPropertiesOfType("paint");
        }
        get layoutProperties() {
            return this._getPropertiesOfType("layout");
        }
        get isGeoMapLayer() {
            return true;
        }
        /**
        * Returns the layer object in maplibre
        * @default {}
        * @public
        */
        get layer() {
            return this.map?.getLayer(this._id);
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapLayerBase.prototype, "minZoom", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapLayerBase.prototype, "maxZoom", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], GeomapLayerBase.prototype, "filter", void 0);
    __decorate([
        webcomponentsBase.s()
    ], GeomapLayerBase.prototype, "displayedFeatures", void 0);
    __decorate([
        geomapProperty.geomapProperty({
            type: Boolean, layout: "visibility", noExpression: true, formatter: (value) => { return value ? "none" : "visible"; },
        })
    ], GeomapLayerBase.prototype, "hidden", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], GeomapLayerBase.prototype, "zIndex", void 0);
    __decorate([
        geomapProperty.geomapProperty({ converter: GeomapInteger.SAPGeomapInteger, type: Number, paint: "line-width" })
    ], GeomapLayerBase.prototype, "width", void 0);
    GeomapLayerBase = __decorate([
        Geomap.l("layer-click")
        /**
         * Mouse entered layer
         *
         * @public
         */
        ,
        Geomap.l("layer-mouseenter")
        /**
         * Mouse moved in the layer
         *
         * @public
         */
        ,
        Geomap.l("layer-mousemove")
        /**
         * Mouse left the layer
         *
         * @public
         */
        ,
        Geomap.l("layer-mouseleave")
        /**
         * Mouse button down on the layer
         *
         * @public
         */
        ,
        Geomap.l("layer-mousedown")
        /**
         * Mouse button up on the layer
         *
         * @public
         */
        ,
        Geomap.l("layer-mouseup")
        /**
         * GeomapLayerBase
         *
         * @constructor
         * @extends GeomapElement
         * @experimental
         * @public
         */
        ,
        webcomponentsBase.m("ui5-geomap-layer-base")
    ], GeomapLayerBase);
    var GeomapLayerBase$1 = GeomapLayerBase;

    return GeomapLayerBase$1;

}));

sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapLayerBase', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Cluster', 'sap/ui/geomap/thirdparty/geomapProperty', 'sap/ui/geomap/thirdparty/GeomapInteger'], (function (webcomponentsBase, Geomap, GeomapLayerBase, GeomapElement, Cluster, geomapProperty, GeomapInteger) { 'use strict';

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
     * The `ui5-geomap-layer` defines the Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapLayer.js";`
     * @constructor
     * @extends GeomapLayerBase
     * @experimental
     * @public
     */
    let GeomapLayer = class GeomapLayer extends GeomapLayerBase {
        constructor() {
            super(...arguments);
            /**
            * ID of a ui5-geomap-source element
            *
            * @default ""
            * @public
            */
            this.source = "";
        }
        /**
        * @override
        */
        get layerSource() {
            const sourceElement = this.parentElement.querySelector(`#${this.source}`);
            if (!sourceElement) {
                return "";
            }
            return sourceElement.effectiveId;
        }
        /**
        * Determines if a property is set, either directly on the layer, or via feature state
        * @param prop
        * @private
        */
        _isPropertyValueSet(prop) {
            if (this[prop] !== undefined) {
                return true; // property set directly on the layer
            }
            if (this.states.length === 0) {
                return false; // property not set directly on the layer, and no states exist, so property is not set
            }
            return this.states.some((state) => state[prop] !== undefined && state[prop] !== ""); // if at least one layer sets the property, it is set
        }
        /**
        * @override
        */
        _getPropertyValue(prop, propData) {
            const localValue = super._getPropertyValue(prop, propData); // value of the property on layer level
            if (propData.noExpression) {
                return localValue;
            }
            if (!this._isPropertyValueSet(prop)) {
                return undefined;
            }
            if (this.states.length === 0) {
                return localValue;
            }
            const expr = ["case"];
            this.states.forEach((state) => {
                let stateValue = state[prop]; // value of the property on state level
                if (propData.formatter) {
                    stateValue = propData.formatter(stateValue);
                }
                expr.push(["==", ["feature-state", "ui5-geomap-state"], state.name], stateValue !== undefined && stateValue !== "" ? stateValue : localValue);
            });
            expr.push(this[prop]);
            return expr;
        }
        /**
        * Returns this layer's features, found at a point
        * @public
        * @param point
        */
        getFeaturesAtPoint(point) {
            const features = this.map?.queryRenderedFeatures(point, {
                layers: [this._id],
            });
            return features;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapLayer.prototype, "source", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, invalidateOnChildChange: true, "default": true })
    ], GeomapLayer.prototype, "states", void 0);
    GeomapLayer = __decorate([
        webcomponentsBase.m("ui5-geomap-layer")
    ], GeomapLayer);
    var GeomapLayer$1 = GeomapLayer;

    return GeomapLayer$1;

}));

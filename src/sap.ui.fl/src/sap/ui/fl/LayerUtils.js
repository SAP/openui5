/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/hasher",
	"sap/ui/fl/Layer",
	"sap/ui/fl/initial/_internal/FlexInfoSession"
], function(
	UriParameters,
	hasher,
	Layer,
	FlexInfoSession
) {
	"use strict";

	// Stack of layers in the layered repository
	var aLayers = [
		Layer.BASE,
		Layer.VENDOR,
		Layer.PARTNER,
		Layer.CUSTOMER_BASE,
		Layer.CUSTOMER,
		Layer.PUBLIC,
		Layer.USER
	];

	// Precalculates index of layers
	var mLayersIndex = {};
	aLayers.forEach(function(sLayer, iIndex) {
		mLayersIndex[sLayer] = iIndex;
	});

	function getUrlParameter(sParameter) {
		return UriParameters.fromQuery(window.location.search).get(sParameter);
	}

	/**
	 * Provides utility functions for the SAPUI5 flexibility library
	 *
	 * @namespace sap.ui.fl.LayerUtils
	 * @author SAP SE
	 * @version ${version}
	 */
	var LayerUtils = {
		_mLayersIndex: mLayersIndex,
		_sTopLayer: aLayers[aLayers.length - 1],
		FL_MAX_LAYER_PARAM: "sap-ui-fl-max-layer",

		/**
		 * Indicates if the passed layer is valid.
		 *
		 * @param {string} sLayer layer name
		 * @returns {boolean} <code>true</code> if the layer is valid
		 * @public
		 */
		isValidLayer(sLayer) {
			return Object.keys(Layer).some(function(sExistingLayer) {
				return sExistingLayer === sLayer;
			});
		},

		/**
		 * Indicates if the VENDOR is selected.
		 *
		 * @returns {boolean} true if it's an application variant
		 * @public
		 */
		isVendorLayer() {
			return this.getCurrentLayer() === Layer.VENDOR;
		},

		/**
		 * Returns whether provided layer is a customer dependent layer.
		 *
		 * @param {string} sLayerName layer name
		 * @returns {boolean} true if provided layer is customer dependent layer else false
		 * @public
		 */
		isCustomerDependentLayer(sLayerName) {
			return ([Layer.PUBLIC, Layer.CUSTOMER, Layer.CUSTOMER_BASE].indexOf(sLayerName) > -1);
		},

		/**
		 * Returns whether provided layer is a developer layer.
		 *
		 * @param {string} sLayer layer name
		 * @returns {boolean} true if provided layer is customer dependent layer else false
		 * @public
		 */
		isDeveloperLayer(sLayer) {
			return LayerUtils.compareAgainstCurrentLayer(sLayer, Layer.CUSTOMER) === -1;
		},

		/**
		 * Checks if a shared newly created variant requires an ABAP package; this is relevant for the VENDOR, PARTNER and CUSTOMER_BASE layers,
		 * whereas variants in the CUSTOMER layer are client-dependent content and can either be transported or stored as local objects ($TMP);
		 * A variant in the CUSTOMER layer that will be transported must not be assigned to a package.
		 *
		 * @returns {boolean} Indicates whether a new variant needs an ABAP package
		 * @public
		 */
		doesCurrentLayerRequirePackage() {
			var sCurrentLayer = this.getCurrentLayer();
			return (sCurrentLayer === Layer.VENDOR) || (sCurrentLayer === Layer.PARTNER) || (sCurrentLayer === Layer.CUSTOMER_BASE);
		},

		/**
		 * Converts layer name into index.
		 *
		 * @param {string} sLayer layer name
		 * @returns {int} index of the layer
		 */
		getLayerIndex(sLayer) {
			return this._mLayersIndex[sLayer];
		},

		/**
		 * Determines if the first passed layer passed is higher than the second passed layer.
		 *
		 * @param {string} sObjectsLayer Layer name to be evaluated
		 * @param {string} sComparedLayer Layer name to be compared against the first one
		 * @returns {boolean} <code>true</code> if the first input layer is higher than the second input layer, otherwise <code>false</code>
		 * @public
		 */
		isOverLayer(sObjectsLayer, sComparedLayer) {
			return this.getLayerIndex(sObjectsLayer) > this.getLayerIndex(sComparedLayer);
		},

		/**
		 * Compares current layer with a provided layer
		 * -1: Lower layer, 0: Same layer, 1: Layer above.
		 *
		 * @param {string} sLayer Layer name to be evaluated
		 * @param {string} [sCurrentLayer] Current layer name to be evaluated, if not provided the layer is taken from URL parameter
		 * @returns {int} -1: Lower layer, 0: Same layer, 1: Layer above
		 * @public
		 */
		compareAgainstCurrentLayer(sLayer, sCurrentLayer) {
			var sCurrent = sCurrentLayer || LayerUtils.getCurrentLayer();
			// If sLayer is undefined, it is assumed it be on the lowest layer
			if ((this.getLayerIndex(sCurrent) > this.getLayerIndex(sLayer)) || !sLayer) {
				return -1;
			} else if (this.getLayerIndex(sCurrent) === this.getLayerIndex(sLayer)) {
				return 0;
			}
			return 1;
		},

		/**
		 * Determines if filtering of changes based on layer is required.
		 *
		 * @returns {boolean} <code>true</code> if the top layer is also the max layer, otherwise <code>false</code>
		 * @param {string} sReference - Reference of the application
		 * @public
		 */
		isLayerFilteringRequired(sReference) {
			var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			var sMaxLayer = oFlexInfoSession && oFlexInfoSession.maxLayer ? oFlexInfoSession.maxLayer : LayerUtils._sTopLayer;
			return this._sTopLayer !== sMaxLayer;
		},

		/**
		 * Determines if the sap-ui-layer parameter is set. This is required to avoid a circling
		 *
		 * @returns {boolean} <code>true</code> if the top layer is also the max layer, otherwise <code>false</code>
		 * @public
		 */
		isSapUiLayerParameterProvided() {
			return !!getUrlParameter("sap-ui-layer");
		},

		/**
		 * Returns the current layer as defined by the url parameter; if the end user flag is set, it always returns "USER".
		 *
		 * @returns {string} the current layer
		 * @public
		 */
		getCurrentLayer() {
			var sLayer = getUrlParameter("sap-ui-layer") || "";
			return sLayer.toUpperCase() || Layer.CUSTOMER;
		},

		/**
		 * Filters the passed Changes or change definitions and returns only the ones in the current layer
		 *
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject|object[]} aChanges Array of Changes or ChangeDefinitions
		 * @param {string} sCurrentLayer Current Layer
		 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject|object[]} Array of filtered Changes
		 */
		filterChangeOrChangeDefinitionsByCurrentLayer(aChanges, sCurrentLayer) {
			if (!sCurrentLayer) {
				return aChanges;
			}

			return aChanges.filter(function(oChangeOrChangeContent) {
				var sChangeLayer = oChangeOrChangeContent.getLayer && oChangeOrChangeContent.getLayer() || oChangeOrChangeContent.layer;
				return sCurrentLayer === sChangeLayer;
			});
		}
	};
	return LayerUtils;
});

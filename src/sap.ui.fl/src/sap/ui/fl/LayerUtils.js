/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/hasher"
],
function(
	UriParameters,
	hasher
) {
	"use strict";
	var LAYER = {
		BASE: "BASE",
		VENDOR: "VENDOR",
		PARTNER: "PARTNER",
		CUSTOMER_BASE: "CUSTOMER_BASE",
		CUSTOMER: "CUSTOMER",
		USER: "USER"
	};
	//Stack of layers in the layered repository
	var aLayers = [
		LAYER.BASE,
		LAYER.VENDOR,
		LAYER.PARTNER,
		LAYER.CUSTOMER_BASE,
		LAYER.CUSTOMER,
		LAYER.USER
	];
	//Precalculates index of layers
	var mLayersIndex = {};
	aLayers.forEach(function(sLayer, iIndex) {
		mLayersIndex[sLayer] = iIndex;
	});

	/**
	 * Provides utility functions for the SAPUI5 flexibility library
	 *
	 * @namespace sap.ui.fl.LayerUtils
	 * @author SAP SE
	 * @version ${version}
	 */
	var LayerUtils = {
		_mLayersIndex : mLayersIndex,
		_sTopLayer : aLayers[aLayers.length - 1],
		FL_MAX_LAYER_PARAM: "sap-ui-fl-max-layer",

		/**
		 * Indicates if the VENDOR is selected.
		 *
		 * @returns {boolean} true if it's an application variant
		 * @public
		 */
		isVendorLayer: function () {
			return this.getCurrentLayer(false) === LAYER.VENDOR;
		},

		/**
		 * Returns whether provided layer is a customer dependent layer.
		 *
		 * @param {string} sLayerName layer name
		 * @returns {boolean} true if provided layer is customer dependent layer else false
		 * @public
		 */
		isCustomerDependentLayer : function(sLayerName) {
			return ([LAYER.CUSTOMER, LAYER.CUSTOMER_BASE].indexOf(sLayerName) > -1);
		},

		/**
		 * Checks if a shared newly created variant requires an ABAP package; this is relevant for the VENDOR, PARTNER and CUSTOMER_BASE layers,
		 * whereas variants in the CUSTOMER layer are client-dependent content and can either be transported or stored as local objects ($TMP);
		 * A variant in the CUSTOMER layer that will be transported must not be assigned to a package.
		 *
		 * @returns {boolean} Indicates whether a new variant needs an ABAP package
		 * @public
		 */
		doesCurrentLayerRequirePackage: function () {
			var sCurrentLayer = this.getCurrentLayer(false);
			return (sCurrentLayer === LAYER.VENDOR) || (sCurrentLayer === LAYER.PARTNER) || (sCurrentLayer === LAYER.CUSTOMER_BASE);
		},

		/**
		 * Determine the <code>maxLayer</code> based on the url parameter <code>sap-ui-fl-max-layer</code> or if is not set by <code>topLayer</code>.
		 *
		 * @ui5-restricted sap.ui.fl.apply._internal.Connector
		 * @return {String} maxLayer
		 */
		getMaxLayer: function () {
			var sParseMaxLayer;
			var oUshellContainer = this.getUshellContainer();
			if (oUshellContainer) {
				var oParsedHash = oUshellContainer.getService("URLParsing").parseShellHash(hasher.getHash()) || {};
				if (oParsedHash.params && oParsedHash.params.hasOwnProperty(this.FL_MAX_LAYER_PARAM)) {
					sParseMaxLayer = oParsedHash.params[this.FL_MAX_LAYER_PARAM][0];
				}
			}
			return sParseMaxLayer || this.getUrlParameter(this.FL_MAX_LAYER_PARAM) || this._sTopLayer;
		},

		/**
		 * Converts layer name into index.
		 *
		 * @param {string} sLayer layer name
		 * @returns {int} index of the layer
		 */
		getLayerIndex: function(sLayer) {
			return this._mLayersIndex[sLayer];
		},

		/**
		 * Determines whether a layer is higher than the max layer.
		 *
		 * @param {string} sLayer Layer name to be evaluated
		 * @returns {boolean} <code>true</code> if input layer is higher than max layer, otherwise <code>false</code>
		 * @public
		 */
		isOverMaxLayer: function(sLayer) {
			return (this.getLayerIndex(sLayer) > this.getLayerIndex(this.getMaxLayer()));
		},

		/**
		 * Compares current layer with a provided layer
		 * -1: Lower layer, 0: Same layer, 1: Layer above.
		 *
		 * @param {String} sLayer Layer name to be evaluated
		 * @param {String} [sCurrentLayer] Current layer name to be evaluated, if not provided the layer is taken from URL parameter
		 * @returns {int} -1: Lower layer, 0: Same layer, 1: Layer above
		 * @public
		 */
		compareAgainstCurrentLayer: function(sLayer, sCurrentLayer) {
			var sCurrent = sCurrentLayer || LayerUtils.getCurrentLayer(false);
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
		 * @public
		 */
		isLayerFilteringRequired: function() {
			return !(this._sTopLayer === this.getMaxLayer());
		},

		/**
		 * Returns the current layer as defined by the url parameter; if the end user flag is set, it always returns "USER".
		 *
		 * @param {boolean} bIsEndUser the end user flag
		 * @returns {string} the current layer
		 * @public
		 */
		getCurrentLayer: function (bIsEndUser) {
			if (bIsEndUser) {
				return LAYER.USER;
			}

			var sLayer = this.getUrlParameter("sap-ui-layer") || "";
			sLayer = sLayer.toUpperCase();
			return sLayer || LAYER.CUSTOMER;
		},

		/**
		 * The function loops over the array and filteres the object if the layer property is over the current max layer
		 *
		 * @param {object[]} aChangeDefinitions - Array of change definitions
		 * @returns {object[]} Array of filtered change definitions
		 */
		filterChangeDefinitionsByMaxLayer: function(aChangeDefinitions) {
			return aChangeDefinitions.filter(function(oChangeDefinition) {
				if (oChangeDefinition.layer && LayerUtils.isOverMaxLayer(oChangeDefinition.layer)) {
					return false;
				}
				return true;
			});
		},

		/**
		 * Returns the value of the specified url parameter of the current url
		 *
		 * @param {String} sParameterName Name of the url parameter
		 * @returns {string} url parameter
		 * @private
		 * @ui5-restricted
		 */
		getUrlParameter: function (sParameterName) {
			return UriParameters.fromQuery(window.location.search).get(sParameterName);
		},

		/**
		 * Returns ushell container if available
		 *
		 * @returns {object|undefined} Returns ushell container object if available or undefined
		 */
		getUshellContainer: function() {
			return sap.ushell && sap.ushell.Container;
		}
	};
	return LayerUtils;
}, true);

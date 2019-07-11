/*
 * ! ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Base class for connectors.
	 *
	 * @namespace
	 * @name sap.ui.fl.apply.connectors.BaseConnector
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */
	var BaseConnector = {
		/**
		 * Default responses for not implemented functions / needed response on error handling.
		 *
	  	 * @restricted sap.ui.fl.apply.connectors
		 */
		_RESPONSES: {
			FLEX_DATA : {
				changes : [],
				variantSection : {}
			},
			FEATURES : {}
		},

		/**
		 * Interface called to get the flex data including changes and variants.
		 *
		 * @param {string} sFlexReference Reference of the application
		 * @param {string} sAppVersion Version of the application
		 * @returns {Promise<Object>} Resolving with an object containing a flex data response
		 */
		loadFlexData:function (/* sFlexReference , sAppVersion */) {
			return Promise.resolve(this._RESPONSES.FLEX_DATA);
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @returns {Promise<Object>} Resolving with an object containing a flex data response
		 */
		loadFeatures: function () {
			return Promise.resolve(this._RESPONSES.FEATURES);
		}
	};

	return BaseConnector;
}, true);

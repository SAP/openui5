/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], function (
	Element
) {
	"use strict";

	/**
	 * Constructor for a new <code>LoadingProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.LoadingProvider
	 */
	var LoadingProvider = Element.extend("sap.ui.integration.util.LoadingProvider", {
		metadata: {
			library: "sap.ui.integration",

			properties: {
				/**
				 * The current loading state.
				 */
				loading: { type: "boolean", defaultValue: false }
			}
		}
	});

	LoadingProvider.prototype.setLoading = function (bLoading) {
		if (this._bAwaitPagination && !bLoading) {
			return this;
		}

		return this.setProperty("loading", bLoading);
	};

	/**
	 * Set to <code>true</code> if the loading should wait for a pagination animation.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @param {boolean} bValue True if it should wait. False otherwise.
	 */
	LoadingProvider.prototype.setAwaitPagination = function (bValue) {
		this._bAwaitPagination = bValue;
	};

	/**
	 * Gets if the loading should wait for a pagination animation.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} bValue True if it should wait. False otherwise.
	 */
	LoadingProvider.prototype.getAwaitPagination = function () {
		return this._bAwaitPagination;
	};

	return LoadingProvider;
});
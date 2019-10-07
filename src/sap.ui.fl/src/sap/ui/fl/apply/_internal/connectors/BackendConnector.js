/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick",
	"sap/ui/dom/includeScript"
], function(
	merge,
	BaseConnector,
	ApplyUtils,
	_pick,
	includeScript
) {
	"use strict";

	/**
	 * Base connector for requesting flexibility data from a back end.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.BackendConnector
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.connectors, sap.ui.fl.write._internal.connectors
	 */
	var BackendConnector = merge({}, BaseConnector, { /** @lends sap.ui.fl.apply.api._internal.connectors.BackendConnector */

		xsrfToken: undefined,

		/**
		 * Loads the modules in a CSP-compliant way via the UI5 core scripting mechanism
		 * This function has been extracted from the function <code>loadFlexData</code>
		 * The purpose of this is to have a function that can be stubbed for testing.
		 *
		 * @param {string} sFlexModulesUri Uri to load flex modules
		 * @returns {Promise} Returns a Promise resolved empty after the script was included
		 * @private
		 */
		_loadModules: function (sFlexModulesUri) {
			return new Promise(function(resolve, reject) {
				includeScript(sFlexModulesUri, undefined, resolve, reject);
			});
		},

		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @param {string} [mPropertyBag.cacheKey] Cache buster token
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function(mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["appVersion"]);

			var sDataUrl = ApplyUtils.getUrl(this.ROUTES.DATA, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "GET", { xsrfToken: this.xsrfToken }).then(function (oResult) {
				var oResponse = oResult.response;
				if (oResult.xsrfToken) {
					this.xsrfToken = oResult.xsrfToken;
				}
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				if (!oResponse.loadModules) {
					return oResponse;
				}

				var sModulesUrl = ApplyUtils.getUrl(this.ROUTES.MODULES, mPropertyBag, mParameters);
				return this._loadModules(sModulesUrl).then(function () {
					return oResponse;
				});
			}.bind(this));
		}
	});

	return BackendConnector;
}, true);
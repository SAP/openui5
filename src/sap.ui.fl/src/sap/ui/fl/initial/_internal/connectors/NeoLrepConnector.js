/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils"
], function(
	merge,
	LrepConnector,
	Utils
) {
	"use strict";
	var ROUTES = {
		SETTINGS: "/flex/settings"
	};
	/**
	 * Connector for requesting data from a Neo LRep based back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.NeoLrepConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.81
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage
	 */
	return merge({}, LrepConnector, {
		loadFeatures(mPropertyBag) {
			if (this.settings) {
				return Promise.resolve(this.settings);
			}
			var mParameters = {};

			var sFeaturesUrl = Utils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return Utils.sendRequest(sFeaturesUrl, "GET", {initialConnector: this}).then(function(oResult) {
				oResult.response.isContextSharingEnabled = false;
				oResult.response.isAnnotationChangeEnabled = false;
				return oResult.response;
			});
		},
		loadVariantsAuthors() {
			return Promise.reject("loadVariantsAuthors is not implemented");
		}
	});
});

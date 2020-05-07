/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/base/util/LoaderExtensions"
], function(
	StorageUtils,
	LoaderExtensions
) {
	"use strict";

	var sJsonPath;

	/**
	 * Connector that retrieves data from a json loaded from a specified path;
	 * the path can be set via setJsonPath for compatibility reasons from the sap/ui/fl/FakeLrepConnector
	 * or set in the connector configuration.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.ObjectPathConnector
	 * @implements {sap.ui.fl.interfaces.BaseApplyConnector}
	 * @since 1.73
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage
	 */
	return {
		layers: [],

		setJsonPath: function (sInitialJsonPath) {
			sJsonPath = sInitialJsonPath;
		},

		loadFlexData: function (mPropertyBag) {
			var sPath = sJsonPath || mPropertyBag.path;
			if (sPath) {
				return LoaderExtensions.loadResource({
					dataType: "json",
					url: sPath,
					async: true
				}).then(function (oResponse) {
					return Object.assign(StorageUtils.getEmptyFlexDataResponse(), oResponse);
				});
			}
			return Promise.resolve();
		}
	};
});

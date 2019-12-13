/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/base/util/LoaderExtensions"
], function(
	merge,
	BaseConnector,
	ApplyUtils,
	LoaderExtensions
) {
	"use strict";

	/**
	 * Connector that retrieves data from a json loaded from a specified path;
	 * the path can be set via setJsonPath for compatibility reasons from the sap/ui/fl/FakeLrepConnector
	 * or set in the connector configuration.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.ObjectPathConnector
	 * @since 1.73
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage
	 */
	var ObjectPathConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.apply._internal.connectors.ObjectPathConnector */ {
		setJsonPath: function (sInitialJsonPath) {
			ObjectPathConnector.jsonPath = sInitialJsonPath;
		},

		loadFlexData: function (mPropertyBag) {
			var sPath = ObjectPathConnector.jsonPath || mPropertyBag.path;
			if (sPath) {
				return LoaderExtensions.loadResource({
					dataType: "json",
					url: sPath,
					async: true
				}).then(function (oResponse) {
					Object.assign(ApplyUtils.getEmptyFlexDataResponse(), oResponse);
				});
			}
			return Promise.resolve(ApplyUtils.getEmptyFlexDataResponse());
		}
	});

	return ObjectPathConnector;
}, true);

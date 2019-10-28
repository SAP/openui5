/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function(
	merge,
	BaseConnector,
	Utils
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
			return new Promise(function(resolve, reject) {
				var sPath = ObjectPathConnector.jsonPath || mPropertyBag.path;
				if (sPath) {
					jQuery.getJSON(ObjectPathConnector.jsonPath).done(function (oResponse) {
						oResponse.componentClassName = mPropertyBag.flexReference;
						resolve(oResponse);
					}).fail(reject);
				} else {
					resolve(Utils.getEmptyFlexDataResponse());
				}
			});
		}
	});

	return ObjectPathConnector;
}, true);

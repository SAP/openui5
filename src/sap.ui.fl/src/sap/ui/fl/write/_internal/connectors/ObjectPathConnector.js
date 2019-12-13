/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectPathConnector",
	"sap/base/util/LoaderExtensions"
], function(
	merge,
	BaseConnector,
	ApplyObjectPathConnector,
	LoaderExtensions
) {
	"use strict";

	/**
	 * Empty connector since we don't support writing to a file.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.ObjectPathConnector
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	return merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.ObjectPathConnector */ {
		layers: [],

		loadFeatures: function (mPropertyBag) {
			var sPath = ApplyObjectPathConnector.jsonPath || mPropertyBag.path;
			if (sPath) {
				return LoaderExtensions.loadResource({
					dataType: "json",
					url: sPath,
					async: true
				}).then(function (sFlexReference, oResponse) {
					oResponse.componentClassName = sFlexReference;
					return oResponse.settings || {};
				}.bind(null, mPropertyBag.flexReference));
			}
			return Promise.resolve({});
		}
	});
}, true);

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/base/util/LoaderExtensions"
], function(
	merge,
	BaseConnector,
	StorageUtils,
	LoaderExtensions
) {
	"use strict";

	var sJsonPath;

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
		setJsonPath(sInitialJsonPath) {
			sJsonPath = sInitialJsonPath;
		},

		loadFlexData(mPropertyBag) {
			const sPath = sJsonPath || mPropertyBag.path;
			if (sPath) {
				return LoaderExtensions.loadResource({
					dataType: "json",
					url: sPath,
					async: true
				}).then(function(oResponse) {
					return { ...StorageUtils.getEmptyFlexDataResponse(), ...oResponse };
				});
			}
			return Promise.resolve();
		},

		loadFeatures(mPropertyBag) {
			var sPath = sJsonPath || mPropertyBag.path;
			if (sPath) {
				return LoaderExtensions.loadResource({
					dataType: "json",
					url: sPath,
					async: true
				}).then(function(sFlexReference, oResponse) {
					oResponse.componentClassName = sFlexReference;
					return oResponse.settings || {};
				}.bind(null, mPropertyBag.flexReference));
			}
			return Promise.resolve({});
		},

		loadVariantsAuthors() {
			return Promise.reject("loadVariantsAuthors is not implemented");
		}
	});
});

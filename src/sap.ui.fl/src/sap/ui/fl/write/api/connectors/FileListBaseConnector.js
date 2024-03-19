/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/LoaderExtensions",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/write/connectors/BaseConnector"
], function(
	merge,
	LoaderExtensions,
	StorageUtils,
	BaseConnector
) {
	"use strict";

	/**
	 *
	 * @alias sap.ui.fl.write.api.connectors.FileListBaseConnector
	 * Abstract connector class loading a list of files and returning them in a format understood by <code>sap.ui.fl</code>.
	 * The inherited objects must implement the function <code>getFileList</code>.
	 * The <code>loadFlexData</code> already ensures that all <code>sap.ui.fl</code>-internals are handled accordingly.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, SAP Web IDE (Visual Editor), UX Tools
	 * @abstract
	 */
	return merge({}, BaseConnector, {
		/**
		 * @param {string} sReference - Application ID for which changes should be loaded
		 * @returns {Promise<string[]>} List of URLs that should be requested and will contain a JSON of a flex object like changes,
		 * i.e.: <code>["/some/url/id_12345_123_propertyChange.change", "/some/url/id_67890_456_.ctrl_variant", ...]</code>
		 */
		getFileList(/* sReference */) {
			return Promise.reject("not implemented");
		},
		layers: [],
		/**
		 * Loads a list of files and returns them in a format understood by <code>sap.ui.fl</code>.
		 *
		 * @param {object} mPropertyBag - Properties needed by the connectors
		 * @param {string} mPropertyBag.reference - Reference of the application
		 * @returns {Promise<Object>} Promise resolving with an object containing flex data
		 */
		loadFlexData(mPropertyBag) {
			return this.getFileList(mPropertyBag.reference)
			.then(function(aFileList) {
				return Promise.all(
					aFileList.map(function(sUrl) {
						return LoaderExtensions.loadResource({
							dataType: "json",
							url: sUrl,
							async: true
						});
					})
				).then(function(aFlexObjects) {
					var mGroupedFlexObjects = StorageUtils.getGroupedFlexObjects(aFlexObjects);
					return StorageUtils.filterAndSortResponses(mGroupedFlexObjects);
				});
			});
		}
	});
});
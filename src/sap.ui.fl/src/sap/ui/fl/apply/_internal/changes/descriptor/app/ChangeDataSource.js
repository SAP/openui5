
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_app_changeDataSource</code>.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.app.ChangeDataSouce
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var ChangeDataSouce = {

		/**
		 * Changes a property of a specific sap.app/dataSource.
		 * Only supports operation == "UPDATE" and entityPropertyChanges of type object.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change with type <code>appdescr_app_changeDataSource</code>
		 * @returns {object} Updated manifest with changed dataSource
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			if (oManifest["sap.app"].dataSources) {
				var oContent = oChange.getContent();
				var oDataSource = oManifest["sap.app"].dataSources[oContent.dataSourceId];
				if (oDataSource) {
					var oEntityProps = oContent.entityPropertyChange;
					if (Array.isArray(oEntityProps) || oEntityProps.operation !== "UPDATE") {
						throw new Error("Only operation == 'UPDATE' and entityPropertyChanges of type object are supported.");
					}
					var aPath = oEntityProps.propertyPath.split("/");
					ObjectPath.set(aPath, oEntityProps.propertyValue, oDataSource);
				}
			} else {
				throw Error("No sap.app/dataSource found in manifest.json");
			}
			return oManifest;
		}

	};

	return ChangeDataSouce;
}, true);
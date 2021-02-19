
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	function _processEntityProp(oEntityProp, oDataSource) {
		if (oEntityProp.operation !== "UPDATE" && oEntityProp.operation !== "UPSERT") {
			throw new Error("Only operation == 'UPDATE' and operation == 'UPSERT' are supported.");
		}
		var aPath = oEntityProp.propertyPath.split("/");
		ObjectPath.set(aPath, oEntityProp.propertyValue, oDataSource);
	}

	/**
	 * Descriptor change merger for change type <code>appdescr_app_changeDataSource</code>.
	 * Changes a property of a specific <code>sap.app/dataSource</code> node in the manifest.
	 * Only supports <code>operation == "UPDATE"</code> and <code>operation == "UPSERT"</code>.
	 *
	 * Only available during build time see {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.app.ChangeDataSouce
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var ChangeDataSouce = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.ChangeDataSouce */ {

		/**
		 * Method to apply the  <code>appdescr_app_changeDataSource</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {object} oChange - Change with type <code>appdescr_app_changeDataSource</code>
		 * @param {string} oChange.content.dataSourceId - ID of <code>sap.app/dataSource</code> that is being changed
		 * @param {object|array} oChange.content.entityPropertyChange - Entity property change or an array of multiple entity property changes
		 * @param {string} oChange.content.entityPropertyChange.propertyPath - Path to the property which should be changed (allowed values: <code>uri</code> and <code>settings/maxAge</code>)
		 * @param {string} oChange.content.entityPropertyChange.operation - Operation that is performed on property defined under propertyPath. Possible values: <code>UPDATE</code> and <code>UPSERT</code>
		 * @param {string} oChange.content.entityPropertyChange.propertyValue - New value of <code>dataSource</code> property defined under propertyPath
		 * @returns {object} Updated manifest with changed <code>sap.app/dataSource</code>
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
					if (Array.isArray(oEntityProps)) {
						oEntityProps.forEach(function(oEntityProp) {
							_processEntityProp(oEntityProp, oDataSource);
						});
					} else {
						_processEntityProp(oEntityProps, oDataSource);
					}
				}
			} else {
				throw Error("No sap.app/dataSource found in manifest.json");
			}
			return oManifest;
		}

	};

	return ChangeDataSouce;
}, true);
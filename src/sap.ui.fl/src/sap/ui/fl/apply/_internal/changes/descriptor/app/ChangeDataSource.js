
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/util/changePropertyValueByPath",
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	changePropertyValueByPath,
	DescriptorChangeCheck
) {
	"use strict";

	var SUPPORTED_OPERATIONS = ["UPDATE", "UPSERT"];
	var SUPPORTED_PROPERTIES = ["uri", "settings/maxAge"];

	/**
	 * Descriptor change merger for change type <code>appdescr_app_changeDataSource</code>.
	 * Changes a property of a specific <code>sap.app/dataSource</code> node in the manifest.
	 * Only supports <code>operation == "UPDATE"</code> and <code>operation == "UPSERT"</code>.
	 *
	 * Only available during build time see {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.app.ChangeDataSource
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var ChangeDataSource = {

		/**
		 * Method to apply the  <code>appdescr_app_changeDataSource</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_changeDataSource</code>
		 * @param {object} oChange.content - Details of the change
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
			var oDataSources = oManifest["sap.app"].dataSources;
			var oChangeContent = oChange.getContent();
			DescriptorChangeCheck.checkEntityPropertyChange(oChangeContent, SUPPORTED_PROPERTIES, SUPPORTED_OPERATIONS);
			if (oDataSources) {
				var oDataSource = oDataSources[oChangeContent.dataSourceId];
				if (oDataSource) {
					changePropertyValueByPath(oChangeContent.entityPropertyChange, oDataSource);
				} else {
					throw new Error("Nothing to update. DataSource with ID \"" + oChangeContent.dataSourceId + "\" does not exist.");
				}
			} else {
				throw Error("No sap.app/dataSource found in manifest.json");
			}
			return oManifest;
		}

	};

	return ChangeDataSource;
});
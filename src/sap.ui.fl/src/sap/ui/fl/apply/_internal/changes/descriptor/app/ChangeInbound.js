
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
	var SUPPORTED_PROPERTIES = ["title", "subTitle", "icon"];

	/**
     * Descriptor change merger for change type <code>appdescr_app_changeInbound</code>.
     * Sets the title of the app by changing the manifest value <code>sap.app/crossNavigation/inbounds</code>.
     *
     * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
     *
     * @namespace sap.ui.fl.apply._internal.changes.descriptor.app.ChangeInbound
     * @experimental
     * @version ${version}
     * @private
     * @ui5-restricted sap.ui.fl.apply._internal
     */
	var ChangeInbound = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.ChangeInbound */ {

		/**
		 * Method to apply the  <code>appdescr_app_changeInbound</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {object} oChange - Change with type <code>appdescr_app_changeInbound</code>
		 * @param {string} oChange.content.inboundId - ID of <code>sap.app/crossNavigation/inbounds/inbound</code> that is being changed
		 * @param {object|array} oChange.content.entityPropertyChange - Entity property change or an array of multiple entity property changes
		 * @param {string} oChange.content.entityPropertyChange.propertyPath - Path to the property which should be changed. Supported properties: <code>title</code>,<code>subTitle</code> and <code>icon</code>
		 * @param {string} oChange.content.entityPropertyChange.operation - Operation that is performed on property defined under propertyPath. Possible values: <code>UPDATE</code> and <code>UPSERT</code>
		 * @param {string} oChange.content.entityPropertyChange.propertyValue - New value of <code>inbound</code> property defined under propertyPath
		 * @returns {object} Updated manifest with changed <code>sap.app/crossNavigation/inbounds/inbound</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			var oCrossNavigation = oManifest["sap.app"].crossNavigation;
			var oChangeContent = oChange.getContent();
			DescriptorChangeCheck.checkEntityPropertyChange(oChangeContent, SUPPORTED_PROPERTIES, SUPPORTED_OPERATIONS);
			if (oCrossNavigation && oCrossNavigation.inbounds) {
				var oInbound = oCrossNavigation.inbounds[oChangeContent.inboundId];
				if (oInbound) {
					changePropertyValueByPath(oChangeContent.entityPropertyChange, oInbound);
				} else {
					throw new Error("Nothing to update. Inbound with ID \"" + oChangeContent.inboundId + "\" does not exist.");
				}
			} else {
				throw new Error("sap.app/crossNavigation or sap.app/crossNavigation/inbounds sections have not been found in manifest.json");
			}
			return oManifest;
		}
	};

	return ChangeInbound;
});
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils"
], function(
	OldFlexControllerFactory,
	ManifestUtils,
	FlexUtils
) {
	"use strict";



	/**
	 * Returns an object with 'name' and 'version' of the App Component where the App Descriptor changes are saved
	 *
	 * @param {sap.ui.base.ManagedObject} oControl control or app component for which the flex controller should be instantiated
	 * @returns {string} Returns name of Component for App Descriptor changes
	 */
	function getAppDescriptorComponentObjectForControl(oControl) {
		var oManifest = FlexUtils.getAppDescriptor(oControl);
		return ManifestUtils.getAppIdFromManifest(oManifest);
	}

	var ChangesController = {
		/**
		 * Returns the FlexController of the app component where the UI changes are saved
		 *
		 * @param {sap.ui.fl.Selector|string} vSelectorOrName - Selector object, managed object or component name to find the associated flex persistence
		 * @returns {sap.ui.fl.FlexController} Returns FlexController Instance of Component for changes
		 */
		getFlexControllerInstance: function(vSelectorOrName) {
			if (typeof vSelectorOrName === "string") {
				return OldFlexControllerFactory.create(vSelectorOrName);
			}
			var oManagedObject = vSelectorOrName.appComponent || vSelectorOrName;
			return OldFlexControllerFactory.createForControl(oManagedObject);
		},

		/**
		 * Returns the FlexController of the app component where the App Descriptor changes are saved
		 *
		 * @param {sap.ui.fl.Selector} vSelector - Selector object or app component for which the descriptor controller should be instantiated
		 * @returns {sap.ui.fl.FlexController} Returns FlexController Instance of Component for app descriptor changes
		 */
		getDescriptorFlexControllerInstance: function(vSelector) {
			if (typeof vSelector.appId === "string") {
				return OldFlexControllerFactory.create(vSelector.appId);
			}
			var oAppComponent = vSelector.appComponent || vSelector;
			var sAppId = getAppDescriptorComponentObjectForControl(oAppComponent);
			return OldFlexControllerFactory.create(sAppId);
		},

		/**
		 * Returns the app component from the passed selector.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - Selector object
		 * @returns {sap.ui.fl.FlexController} Returns the app component for the passed selector
		 */
		getAppComponentForSelector: function(vSelector) {
			if (typeof vSelector.appId === "string") {
				return vSelector;
			}
			return vSelector.appComponent || FlexUtils.getAppComponentForControl(vSelector);
		}

	};
	return ChangesController;
});
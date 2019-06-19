/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils"
], function(
	OldFlexControllerFactory,
	FlexUtils
) {
	"use strict";

	var ChangesController = {
		getFlexControllerInstance: function(vManagedObjectOrName) {
			return typeof vManagedObjectOrName === "string"
				? OldFlexControllerFactory.create(vManagedObjectOrName)
				: OldFlexControllerFactory.createForControl(vManagedObjectOrName);
		},

		/**
		 * Returns the FlexController of the App Component where the App Descriptor changes are saved
		 *
		 * @param {sap.ui.base.ManagedObject} oManagedObject - Managed Object for which the flex controller should be instantiated
		 * @returns {sap.ui.fl.FlexController} Returns FlexController Instance of Component for App Descriptor changes
		 */
		getDescriptorFlexControllerInstance: function(oManagedObject) {
			var oAppDescriptorComponent = FlexUtils.getAppDescriptorComponentObjectForControl(oManagedObject);
			return OldFlexControllerFactory.create(oAppDescriptorComponent.name, oAppDescriptorComponent.version);
		}
	};
	return ChangesController;
}, true);
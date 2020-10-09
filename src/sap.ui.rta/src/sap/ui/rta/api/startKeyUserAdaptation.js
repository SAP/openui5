/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/util/adaptationStarter",
	"sap/ui/fl/Layer"
], function(
	adaptationStarter,
	Layer
) {
	"use strict";

	/**
	 * Starts key user adaptation, initiated for an application at the passed root control instance.
	 * It subsequently extends to all valid child controls.
	 *
	 * @function
	 * @experimental since 1.71
	 * @since 1.71
	 * @alias module:sap/ui/rta/api/startKeyUserAdaptation
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.core.Element|sap.ui.core.UIComponent} mPropertyBag.rootControl - Control instance from where key user adaptation should be started
	 *
	 * @returns {Promise} Resolves when adaptation was successfully started
	 * @public
	 */
	function startKeyUserAdaptation(mPropertyBag) {
		var mOptions = {
			rootControl: mPropertyBag.rootControl,
			flexSettings: {
				developerMode: false,
				layer: Layer.CUSTOMER
			}
		};
		return adaptationStarter(mOptions);
	}

	return startKeyUserAdaptation;
});
/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/core/Element",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils",
	"sap/ui/core/UIComponent",
	"sap/base/Log"
], function(
	RuntimeAuthoring,
	Element,
	FeaturesAPI,
	FlexUtils,
	UIComponent,
	Log
) {
	"use strict";
	/**
	 * Starts key user adaptation, initiated for an application at the passed root control instance.
	 * It subsequently extends to all valid child controls.
	 *
	 * Example: If the whole application needs to be adapted,
	 * then this application's components container {@see sap.ui.core.ComponentContainer} should be passed as the root control to this function.
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
		if (!(mPropertyBag.rootControl instanceof Element) && !(mPropertyBag.rootControl instanceof UIComponent)) {
			return Promise.reject(new Error("An invalid root control was passed"));
		}
		return FeaturesAPI.isKeyUser()
			.then(function (bIsKeyUser) {
				if (!bIsKeyUser) {
					throw new Error("Key user rights have not been granted to the current user");
				}

				var oRta = new RuntimeAuthoring({
					rootControl: FlexUtils.getAppComponentForControl(mPropertyBag.rootControl),
					flexSettings: {
						developerMode: false,
						layer: "CUSTOMER"
					},
					validateAppVersion: true
				});

				oRta.attachEvent("stop", function () {
					oRta.destroy();
				});

				return oRta.start();
			})
			.catch(function(oError) {
				Log.error("UI Adaptation could not be started", oError.message);
				throw oError;
			});
	}
	return startKeyUserAdaptation;
});
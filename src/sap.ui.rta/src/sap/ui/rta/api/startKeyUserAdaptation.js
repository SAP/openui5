/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/base/Log"
], function(
	RuntimeAuthoring,
	ManagedObject,
	FeaturesAPI,
	Log
) {
	"use strict";
	/**
	 * Starts key user adaptation, initiated for an application at the passed root control instance.
	 * It subsequently extends to all valid child controls.
	 *
	 * Example: If the whole application needs to be adapted,
	 * then this application component's container {@see sap.ui.core.ComponentContainer} should be passed as the root control to this function.
	 *
	 * @function
	 * @experimental
	 * @since 1.71
	 * @public
	 * @alias module:sap/ui/rta/startKeyUserAdaptation
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.base.ManagedObject} mPropertyBag.rootControl - Root control instance from where key user adaptation should be started
	 *
	 * @returns {Promise} Resolves when adaptation was successfully started
	 */
	return function (mPropertyBag) {
		if (!(mPropertyBag.rootControl instanceof ManagedObject)) {
			return Promise.reject(new Error("An invalid root control was passed"));
		}
		return FeaturesAPI.isKeyUser()
			.then(function (bIsKeyUser) {
				if (!bIsKeyUser) {
					throw new Error("Key user rights are not available");
				}

				Object.assign(mPropertyBag,
					{
						flexSettings: {
							developerMode: false,
							layer: "CUSTOMER"
						},
						validateAppVersion: true
					});

				var oRta = new RuntimeAuthoring(mPropertyBag);
				oRta.attachEvent('stop', function () {
					oRta.destroy();
				});

				return oRta.start();
			})
			.catch(function(oError) {
				Log.error("UI Adaptation could not be started", oError.message);
				throw oError;
			});
	};
});
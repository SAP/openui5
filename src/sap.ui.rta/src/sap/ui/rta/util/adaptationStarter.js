/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/core/Element",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/core/UIComponent",
	"sap/base/Log"
], function(
	RuntimeAuthoring,
	Element,
	FlexUtils,
	Layer,
	FeaturesAPI,
	UIComponent,
	Log
) {
	"use strict";

	function checkKeyUser(sLayer) {
		if (Layer.CUSTOMER === sLayer) {
			return FeaturesAPI.isKeyUser()
				.then(function (bIsKeyUser) {
					if (!bIsKeyUser) {
						throw new Error("Key user rights have not been granted to the current user");
					}
				});
		}
		return Promise.resolve();
	}

	/**
	 * Starter util for UI adaptation.
	 * With this API you are also able to modify the UI adaptation plugins list and or add some event handler functions to be called on start, failed and stop events.
	 * @param {object} mOptions - Object with properties
	 * @param {sap.ui.core.Element|sap.ui.core.UIComponent} mOptions.rootControl - Control instance from where UI adaptation should be started
	 * @param {function} [loadPlugins] - Callback function that enables the modification of the default plugin list of UI adaptation. UI adaptation is passed to this function and it should return a promise
	 * @param {function} [onStart] - Event handler function called on start event
	 * @param {function} [onFailed] - Event handler function called on failed event
	 * @param {function} [onStop] - Event handler function called on stop event
	 * @returns {Promise} Resolves when UI adaptation was successfully started with adaptation instance.
	 * @private
	 */
	function adaptationStarter(mOptions, loadPlugins, onStart, onFailed, onStop) {
		if (!(mOptions.rootControl instanceof Element) && !(mOptions.rootControl instanceof UIComponent)) {
			return Promise.reject(new Error("An invalid root control was passed"));
		}

		var oRta;
		return checkKeyUser(mOptions.flexSettings.layer)
			.then(function () {
				mOptions.rootControl = FlexUtils.getAppComponentForControl(mOptions.rootControl);

				oRta = new RuntimeAuthoring(mOptions);

				if (onStart) {
					oRta.attachEvent("start", onStart);
				}
				if (onFailed) {
					oRta.attachEvent("failed", onFailed);
				}
				var fnOnStop = onStop || function () {
					oRta.destroy();
				};
				oRta.attachEvent("stop", fnOnStop);

				if (loadPlugins) {
					return loadPlugins(oRta);
				}
			})
			.then(function() {
				return oRta.start();
			})
			.then(function() {
				return oRta;
			})
			.catch(function(oError) {
				Log.error("UI Adaptation could not be started", oError.message);
				throw oError;
			});
	}
	return adaptationStarter;
});
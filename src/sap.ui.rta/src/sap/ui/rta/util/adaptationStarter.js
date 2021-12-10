/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/core/Control",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/core/UIComponent",
	"sap/base/Log",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/rta/util/showMessageBox"
], function(
	RuntimeAuthoring,
	Control,
	FlexUtils,
	Layer,
	FeaturesAPI,
	UIComponent,
	Log,
	PersistenceWriteAPI,
	showMessageBox
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
	 * @param {sap.ui.core.Control|sap.ui.core.UIComponent} mOptions.rootControl - Control instance to get the AppComponent. This then is used to start UI adaptation.
	 * @param {function} [loadPlugins] - Callback function that enables the modification of the default plugin list of UI adaptation. UI adaptation is passed to this function and it should return a promise
	 * @param {function} [onStart] - Event handler function called on start event
	 * @param {function} [onFailed] - Event handler function called on failed event
	 * @param {function} [onStop] - Event handler function called on stop event
	 * @returns {Promise} Resolves when UI adaptation was successfully started with adaptation instance.
	 * @private
	 */
	function adaptationStarter(mOptions, loadPlugins, onStart, onFailed, onStop) {
		if (!(mOptions.rootControl instanceof Control) && !(mOptions.rootControl instanceof UIComponent)) {
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
				if (mOptions.flexSettings.layer === "CUSTOMER") {
					var mPropertyBag = {
						oComponent: mOptions.rootControl,
						selector: mOptions.rootControl,
						invalidateCache: false,
						includeVariants: true,
						includeCtrlVariants: true,
						currentLayer: Layer.CUSTOMER
					};

					PersistenceWriteAPI.getChangesWarning(mPropertyBag)
						.then(function(oWarningMessage) {
							if (oWarningMessage.showWarning) {
								var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
								var oMessageProps = oWarningMessage.warningType === "mixedChangesWarning"
									? {
										text: "MSG_ADAPTATION_STARTER_MIXED_CHANGES_WARNING",
										title: "TIT_ADAPTATION_STARTER_MIXED_CHANGES_TITLE"
									}
									: {
										text: "MSG_ADAPTATION_STARTER_NO_CHANGES_IN_P_WARNING",
										title: "TIT_ADAPTATION_STARTER_NO_CHANGES_IN_P_TITLE"
									};

								showMessageBox(
									oRtaResourceBundle.getText(oMessageProps.text),
									{
										title: oRtaResourceBundle.getText(oMessageProps.title)
									},
									"warning"
								);
							}
						});
				}
				return oRta;
			})
			.catch(function(vError) {
				if (vError !== "Reload triggered") {
					Log.error("UI Adaptation could not be started", vError.message);
				}
				throw vError;
			});
	}
	return adaptationStarter;
});
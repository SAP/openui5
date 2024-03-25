/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/showMessageBox",
	"sap/ui/rta/RuntimeAuthoring"
], function(
	Log,
	Control,
	Lib,
	UIComponent,
	FeaturesAPI,
	PersistenceWriteAPI,
	Layer,
	FlexUtils,
	showMessageBox,
	RuntimeAuthoring
) {
	"use strict";

	function checkKeyUser(sLayer) {
		if (Layer.CUSTOMER === sLayer) {
			return FeaturesAPI.isKeyUser()
			.then(function(bIsKeyUser) {
				if (!bIsKeyUser) {
					var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					var oError = new Error(oRtaResourceBundle.getText("MSG_NO_KEY_USER_RIGHTS_ERROR_MESSAGE"));
					oError.reason = "isKeyUser";
					throw oError;
				}
			});
		}
		return Promise.resolve();
	}

	function checkFlexEnabled(oAppComponent) {
		// fiori tools is always a developer scenario where the flexEnabled flag should not be evaluated
		var sFioriToolsMode = new URLSearchParams(window.location.search).get("fiori-tools-rta-mode");
		if (!sFioriToolsMode || sFioriToolsMode === "false") {
			var oManifest = oAppComponent.getManifest() || {};
			var vFlexEnabled = oManifest["sap.ui5"] && oManifest["sap.ui5"].flexEnabled;

			if (vFlexEnabled === false) {
				var oError = Error("This app is not enabled for key user adaptation");
				oError.reason = "flexEnabled";
				throw oError;
			}
		}
	}

	/**
	 * Starter util for UI adaptation.
	 * With this API you are also able to modify the UI adaptation plugins list and or add some event handler functions to be called on start, failed and stop events.
	 * The function also checks for the Key User authorization and the <code>flexEnabled</code> flag in the manifest.
	 * If either check is not passed successfully the function returns a rejected Promise.
	 *
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
		var oRta;

		return Promise.resolve().then(function() {
			if (!(mOptions.rootControl instanceof Control) && !(mOptions.rootControl instanceof UIComponent)) {
				var oError = Error("An invalid root control was passed");
				oError.reason = "rootControl";
				throw oError;
			}
			mOptions.rootControl = FlexUtils.getAppComponentForControl(mOptions.rootControl);
		})
		.then(checkKeyUser.bind(undefined, mOptions.flexSettings.layer))
		.then(function() {
			return checkFlexEnabled(mOptions.rootControl);
		})
		.then(function() {
			oRta = new RuntimeAuthoring(mOptions);

			if (onStart) {
				oRta.attachEvent("start", onStart);
			}
			if (onFailed) {
				oRta.attachEvent("failed", onFailed);
			}
			var fnOnStop = onStop || function() {
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
					includeCtrlVariants: true,
					currentLayer: Layer.CUSTOMER
				};

				PersistenceWriteAPI.getChangesWarning(mPropertyBag)
				.then(function(oWarningMessage) {
					if (oWarningMessage.showWarning) {
						var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
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
			if (
				vError.message !== "Reload triggered"
				&& !(FlexUtils.getUshellContainer() && vError.reason === "flexEnabled") // FLP Plugin already handles this error
			) {
				var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
				showMessageBox(
					oRtaResourceBundle.getText("MSG_GENERIC_ERROR_MESSAGE", [vError.message]),
					{title: oRtaResourceBundle.getText("MSG_ADAPTATION_COULD_NOT_START")},
					"error"
				);
				Log.error("UI Adaptation could not be started", vError.message);
			}
			throw vError;
		});
	}
	return adaptationStarter;
});
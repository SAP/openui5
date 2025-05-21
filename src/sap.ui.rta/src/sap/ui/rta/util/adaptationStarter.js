/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/showMessageBox",
	"sap/ui/rta/RuntimeAuthoring"
], function(
	Log,
	Lib,
	InitialFlexAPI,
	PersistenceWriteAPI,
	Layer,
	FlexUtils,
	showMessageBox,
	RuntimeAuthoring
) {
	"use strict";

	async function checkKeyUser(sLayer) {
		if (Layer.CUSTOMER === sLayer) {
			const bIsKeyUser = await InitialFlexAPI.isKeyUser();
			if (!bIsKeyUser) {
				const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
				const oError = new Error(oRtaResourceBundle.getText("MSG_NO_KEY_USER_RIGHTS_ERROR_MESSAGE"));
				oError.reason = "isKeyUser";
				throw oError;
			}
		}
	}

	function checkFlexEnabled(oAppComponent) {
		// fiori tools is always a developer scenario where the flexEnabled flag should not be evaluated
		const sFioriToolsMode = new URLSearchParams(window.location.search).get("fiori-tools-rta-mode");
		if (!sFioriToolsMode || sFioriToolsMode === "false") {
			const oManifest = oAppComponent.getManifest() || {};
			const vFlexEnabled = oManifest["sap.ui5"] && oManifest["sap.ui5"].flexEnabled;

			if (vFlexEnabled === false) {
				const oError = Error("This app is not enabled for key user adaptation");
				oError.reason = "flexEnabled";
				throw oError;
			}
		}
	}

	function checkPseudoAppVariant(oAppComponent) {
		// pseudo app variants are not supported
		const oComponentData = oAppComponent.getComponentData?.();
		if (oComponentData?.startupParameters && Array.isArray(oComponentData.startupParameters["sap-app-id"])) {
			const sACHComponent = oAppComponent.getManifest()["sap.app"]?.ach;
			const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			const sErrorMessage = oRtaResourceBundle.getText("MSG_PSEUDO_APP_VARIANT_ERROR_MESSAGE", [sACHComponent]);
			const oError = Error(sErrorMessage);
			oError.reason = "pseudoAppVariant";
			throw oError;
		}
	}

	/**
	 * Starter util for UI adaptation.
	 * With this API you are also able to modify the UI adaptation plugins list and or add some event handler functions
	 * to be called on start, failed and stop events.
	 * The function also checks for the Key User authorization and the <code>flexEnabled</code> flag in the manifest.
	 * If either check is not passed successfully the function returns a rejected Promise.
	 *
	 * @param {object} mOptions - Object with properties
	 * @param {sap.ui.core.Control|sap.ui.core.UIComponent} mOptions.rootControl - Control instance to get the AppComponent. This then is used to start UI adaptation.
	 * @param {function} [fnLoadPlugins] - Callback function that enables the modification of the default plugin list of UI adaptation. UI adaptation is passed to this function and it should return a promise
	 * @param {function} [fnOnStart] - Event handler function called on start event
	 * @param {function} [fnOnFailed] - Event handler function called on failed event
	 * @param {function} [fnOnStop] - Event handler function called on stop event
	 * @returns {Promise} Resolves when UI adaptation was successfully started with adaptation instance.
	 * @private
	 */
	async function adaptationStarter(mOptions, fnLoadPlugins, fnOnStart, fnOnFailed, fnOnStop) {
		const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

		try {
			if (!(mOptions.rootControl?.isA("sap.ui.core.Control")) && !(mOptions.rootControl?.isA("sap.ui.core.UIComponent"))) {
				const oError = Error("An invalid root control was passed");
				oError.reason = "rootControl";
				throw oError;
			}
			mOptions.rootControl = FlexUtils.getAppComponentForControl(mOptions.rootControl);

			await checkKeyUser(mOptions.flexSettings.layer);
			checkFlexEnabled(mOptions.rootControl);
			checkPseudoAppVariant(mOptions.rootControl);

			const oRta = new RuntimeAuthoring(mOptions);
			if (fnOnStart) {
				oRta.attachEvent("start", fnOnStart);
			}
			if (fnOnFailed) {
				oRta.attachEvent("failed", fnOnFailed);
			}
			oRta.attachEvent("stop", fnOnStop || function() {
				oRta.destroy();
			});

			if (fnLoadPlugins) {
				await fnLoadPlugins(oRta);
			}
			await oRta.start();

			if (mOptions.flexSettings.layer === "CUSTOMER") {
				const mPropertyBag = {
					oComponent: mOptions.rootControl,
					selector: mOptions.rootControl,
					invalidateCache: false,
					includeCtrlVariants: true,
					currentLayer: Layer.CUSTOMER
				};

				const oWarningMessage = await PersistenceWriteAPI.getChangesWarning(mPropertyBag);
				if (oWarningMessage.showWarning) {
					const oMessageProps = oWarningMessage.warningType === "mixedChangesWarning"
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
			}
			return oRta;
		} catch (vError) {
			if (
				vError.message !== "Reload triggered"
				&& !(FlexUtils.getUshellContainer() && vError.reason === "flexEnabled") // FLP Plugin already handles this error
			) {
				if (vError.reason === "isKeyUser" || vError.reason === "pseudoAppVariant") {
					showMessageBox(
						vError.message,
						{title: oRtaResourceBundle.getText("MSG_ADAPTATION_COULD_NOT_START")},
						"error"
					);
				} else {
					showMessageBox(
						oRtaResourceBundle.getText("MSG_GENERIC_ERROR_MESSAGE", [vError.message]),
						{title: oRtaResourceBundle.getText("MSG_ADAPTATION_COULD_NOT_START")},
						"error"
					);
				}
				Log.error("UI Adaptation could not be started", vError.message);
			}
			throw vError;
		}
	}
	return adaptationStarter;
});
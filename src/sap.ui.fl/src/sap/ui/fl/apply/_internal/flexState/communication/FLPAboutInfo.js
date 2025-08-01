/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/Utils"
], function(
	Lib,
	FlexState,
	ManifestUtils,
	FlexRuntimeInfoAPI,
	FlexUtils
) {
	"use strict";

	let FLPAboutInfo = {};

	function setAppInfoCustomProperties(oAppLifeCycleService, sLabel, sValue, sApplicationInfoAttributeReference) {
		const oAppInfo = {
			info: {
				customProperties: {
					[sApplicationInfoAttributeReference]: {
						label: sLabel,
						value: sValue,
						showInAbout: true
					}
				}
			}
		};
		oAppLifeCycleService.setAppInfo(oAppInfo);
	}

	function isUI5Application(oCurrentApplication) {
		if (oCurrentApplication.homePage || oCurrentApplication.applicationType !== "UI5") {
			return false;
		}
		return true;
	}

	async function setFlexAdaptationInfoInAppInfo(oAppLifeCycleService, oCurrentApplication) {
		if (isUI5Application(oCurrentApplication)) {
			const oCurrentApplicationComponent = oCurrentApplication.componentInstance;
			const sReference = ManifestUtils.getFlexReference({
				componentData: oCurrentApplicationComponent.getComponentData(),
				manifest: oCurrentApplicationComponent.getManifest()
			});
			const mPropertyBag = {
				reference: sReference,
				componentId: oCurrentApplicationComponent.getId(),
				manifest: oCurrentApplicationComponent.getManifestObject(),
				componentData: oCurrentApplicationComponent.getComponentData(),
				asyncHints: oCurrentApplicationComponent._componentConfig.asyncHints
			};
			await FlexState.initialize(mPropertyBag);
			const sAdaptationId = FlexRuntimeInfoAPI.getContextBasedAdaptationId(mPropertyBag);
			/**
			 * In case the adaptationId is "DEFAULT" or undefined, which is the case, if
			 * 	1. no context based adaptation has been created yet or
			 * 	2. the end user contexts do not meet any of the contexts in the created context-based adaptations
			 * we must not show any ui5.flex.adaptation information in the about dialog.
			 */
			if (sAdaptationId === "DEFAULT" || !sAdaptationId) {
				return;
			}
			const sAdaptationTitle = FlexRuntimeInfoAPI.getContextBasedAdaptationTitle(mPropertyBag);
			const sLabel = Lib.getResourceBundleFor("sap.ui.fl").getText("CBA_ABOUT_INFO_DIALOG_LABEL");
			const sValue = `${sAdaptationTitle} (${sAdaptationId})`;
			setAppInfoCustomProperties(oAppLifeCycleService, sLabel, sValue, "ui5.flex.adaptation");
		}
	}

	async function attachAppLoadedListener() {
		const oAppLifeCycleService = await FlexUtils.getUShellService("AppLifeCycle");
		const oCurrentApplication = oAppLifeCycleService.getCurrentApplication();
		if (oCurrentApplication) {
			await setFlexAdaptationInfoInAppInfo(oAppLifeCycleService, oCurrentApplication);
		}
		oAppLifeCycleService.attachAppLoaded(oAppLifeCycleService, FLPAboutInfo.onAppLoadedListener);
	}

	function waitForUshellLibraryIsReady() {
		return new Promise((resolve) => {
			/**
			 * We need to dynamically require the BootstrapObserver, because we do not want to accidentially load the whole
			 * sap.ushell library. Further, we need hard require the module because we are the only once who are using
			 * it and no one is loading it before.
			 */
			sap.ui.require(["sap/ushell/api/BootstrapObserver"], async function(BootstrapObserver) {
				await BootstrapObserver.ready();
				resolve();
			});
		});
	}

	function waitForUshellLibraryIsLoaded() {
		return new Promise((resolve) => {
			Lib.attachLibraryChanged((oLibraryChangedEvent) => {
				if (oLibraryChangedEvent.getParameter("operation") === "add" &&
					oLibraryChangedEvent.getParameter("metadata").sName === "sap.ushell") {
					resolve();
				}
			});
		});
	}

	async function waitForUshellLibraryIsLoadedAndReady() {
		if (!Lib.isLoaded("sap.ushell")) {
			await waitForUshellLibraryIsLoaded();
		}
		await waitForUshellLibraryIsReady();
	}

	/**
	 * Provides methods to initialize and handle application loaded events to send custom ui.flex properties to the FLP About Dialog.
	 *
	 * @namespace
	 * @alias module:sap/ui/fl/apply/_internal/flexState/communication/FLPAboutInfo
	 * @since 1.132
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	FLPAboutInfo = /** @lends sap.ui.fl.apply._internal.flexState.communication.FLPAboutInfo */{
		async initialize() {
			await waitForUshellLibraryIsLoadedAndReady();
			await attachAppLoadedListener();
		},
		async onAppLoadedListener(oEvent, oAppLifeCycleService) {
			const oCurrentApplication = oEvent.getParameters();
			await setFlexAdaptationInfoInAppInfo(oAppLifeCycleService, oCurrentApplication);
		}
	};

	return FLPAboutInfo;
});
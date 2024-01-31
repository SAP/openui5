/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils"
], function(
	Log,
	ComponentRegistry,
	UIChangesState,
	ManifestUtils,
	Utils
) {
	"use strict";

	/**
	 * Returns an array with all UI Changes for the application.
	 *
	 * @namespace sap.ui.fl.support._internal.getAllUIChanges
	 * @since 1.121
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getAllUIChangesFromChangesState(oCurrentAppContainerObject) {
		const oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		return UIChangesState.getAllUIChanges(sReference);
	}

	return function() {
		return Utils.getUShellService("AppLifeCycle").then(function(oAppLifeCycleService) {
			if (oAppLifeCycleService) {
				const oCurrentApp = oAppLifeCycleService.getCurrentApplication();
				if (oCurrentApp.componentInstance) {
					return getAllUIChangesFromChangesState(oCurrentApp.componentInstance);
				}

				// potential cFLP scenario with the instance running in an iFrame where the top has no access to the componentInstance
				return oCurrentApp.getIntent().then(function(oIntent) {
					// The iFrame ID is not public API and may change in the future.
					// Until there is an API, this is the way how to get any hold on the app at all
					var iFrame = document.getElementById(`application-${oIntent.semanticObject}-${oIntent.action}`);
					if (!iFrame) {
						Log.error("the iFrame in the cFLP scenario could not be determined");
						return undefined;
					}

					// to use the iFrame scope, the code has to be called via eval
					return iFrame.contentWindow.eval("" +
"							new Promise(function (resolve) {" +
"								sap.ui.require([" +
'									"sap/ui/fl/apply/_internal/flexState/ManifestUtils",' +
'									"sap/ui/fl/Utils",' +
'									"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState"' +
"								], function (" +
"									ManifestUtils," +
"									Utils," +
"									UIChangesState" +
"								) {" +
'									Utils.getUShellService("AppLifeCycle").then(function (oAppLifeCycleService) {' +
"										return oAppLifeCycleService.getCurrentApplication().componentInstance;" +
"									}).then(function (oCurrentAppContainerObject) {" +
"										if (oCurrentAppContainerObject) {" +
"											const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);" +
"											resolve(return UIChangesState.getAllUIChanges(sReference));" +
"										};" +
"								});" +
"							});" +
"						});");
				});
			}

			// standalone case
			const aApplications = ComponentRegistry.filter(function(oComponent) {
				return oComponent.getManifestObject().getRawJson()["sap.app"].type === "application";
			});

			if (aApplications.length === 1) {
				return getAllUIChangesFromChangesState(aApplications[0]);
			}

			return undefined;
		});
	};
});

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	Log,
	ComponentRegistry,
	extractChangeDependencies,
	Utils
) {
	"use strict";

	/**
	 * Provides an object with the changes for the current application as well as
	 * further information. I.e. if the changes were applied and their dependencies.
	 *
	 * @namespace sap.ui.fl.support._internal.getChangeDependencies
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getChangeDependencies(oCurrentAppContainerObject) {
		if (oCurrentAppContainerObject) {
			var oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
			return extractChangeDependencies(oAppComponent);
		}
		return undefined;
	}

	return function() {
		return Utils.getUShellService("AppLifeCycle").then(function(oAppLifeCycleService) {
			if (oAppLifeCycleService) {
				var oCurrentApp = oAppLifeCycleService.getCurrentApplication();
				if (oCurrentApp.componentInstance) {
					return getChangeDependencies(oCurrentApp.componentInstance);
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
'									"sap/ui/fl/ChangePersistenceFactory",' +
'									"sap/ui/fl/Utils",' +
'									"sap/ui/fl/support/_internal/extractChangeDependencies"' +
"								], function (" +
"									ChangePersistenceFactory," +
"									Utils," +
"									extractChangeDependencies" +
"								) {" +
'									Utils.getUShellService("AppLifeCycle").then(function (oAppLifeCycleService) {' +
"										return oAppLifeCycleService.getCurrentApplication().componentInstance;" +
"									}).then(function (oCurrentAppContainerObject) {" +
"										if (oCurrentAppContainerObject) {" +
"											var oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();" +
"											resolve(extractChangeDependencies(oAppComponent));" +
"										};" +
"								});" +
"							});" +
"						});");
				});
			}

			// standalone case
			var aApplications = ComponentRegistry.filter(function(oComponent) {
				return oComponent.getManifestObject().getRawJson()["sap.app"].type === "application";
			});

			if (aApplications.length === 1) {
				return getChangeDependencies(aApplications[0]);
			}

			return undefined;
		});
	};
});

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/fl/support/_internal/getAllUIChanges",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/support/_internal/getChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	Log,
	ComponentRegistry,
	getAllUIChanges,
	getFlexSettings,
	getChangeDependencies,
	Utils
) {
	"use strict";

	async function findComponentAndCallFunction(fnFunction, sModulePath) {
		if (Utils.getUshellContainer()) {
			const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
			const oCurrentApp = oAppLifeCycleService.getCurrentApplication();
			if (oCurrentApp.componentInstance) {
				return fnFunction(oCurrentApp.componentInstance);
			}

			// potential cFLP scenario with the instance running in an iFrame where the top has no access to the componentInstance
			// in this case the module has to be required inside the iFrame and executed there
			const oIntent = await oCurrentApp.getIntent();
			// The iFrame ID is not public API and may change in the future.
			// Until there is an API, this is the way how to get any hold on the app at all
			var iFrame = document.getElementById(`application-${oIntent.semanticObject}-${oIntent.action}`);
			if (!iFrame) {
				const sError = "Possible cFLP scenario, but the iFrame can't be found";
				Log.error(sError);
				throw Error(sError);
			}

			return new Promise(function(resolve) {
				iFrame.contentWindow.sap.ui.require([sModulePath], function(fnModuleInsideIFrame) {
					fnModuleInsideIFrame().then(resolve);
				});
			});
		}

		// standalone case
		const aApplications = ComponentRegistry.filter(function(oComponent) {
			return oComponent.getManifestObject().getRawJson()["sap.app"].type === "application";
		});
		if (aApplications.length === 1) {
			return getAllUIChanges(aApplications[0]);
		}

		throw Error("No application component found");
	}

	/**
	 * Provides an API for support tools
	 *
	 * @namespace sap.ui.fl.support.api.SupportAPI
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted ui5 support tools
	 */
	var SupportAPI = /** @lends sap.ui.fl.support.api.SupportAPI */{
		getAllUIChanges() {
			return findComponentAndCallFunction(getAllUIChanges, "sap/ui/fl/support/_internal/getAllUIChanges");
		},
		getChangeDependencies,
		getFlexSettings
	};

	return SupportAPI;
});

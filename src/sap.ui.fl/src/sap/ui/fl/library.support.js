/*!
 * ${copyright}
 */
/**
 * Adds support rules of the <code>sap.ui.fl</code>
 * library to the support infrastructure.
 */
sap.ui.define([
	"sap/ui/support/library",
	"sap/ui/fl/Utils",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/util/validateStableIds",
	"sap/base/util/ObjectPath",
	"sap/m/InstanceManager"
], function(
	SupportLib,
	Utils,
	DesignTime,
	validateStableIds,
	ObjectPath,
	InstanceManager
) {
	"use strict";

	const {Categories, Audiences, Severity} = SupportLib;

	function findAppComponent(aElements) {
		var oAppComponent;

		aElements.some(function(oElement) {
			oAppComponent = Utils.getAppComponentForControl(oElement);
			return !!oAppComponent;
		});

		return oAppComponent;
	}

	function _isPopupAdaptable(oPopup) {
		return (!oPopup.isPopupAdaptationAllowed || oPopup.isPopupAdaptationAllowed())
		&& Utils.getAppComponentForControl(oPopup)
		&& (oPopup.isA("sap.m.Dialog") || oPopup.isA("sap.m.Popover"));
	}

	var oStableIdRule = {
		id: "stableId",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.28",
		title: "Stable control IDs are required for SAPUI5 flexibility services",
		description: "Checks whether the IDs of controls support SAPUI5 flexibility services",
		resolution: "Replace the generated control ID with a stable ID. We strongly recommend "
			+ "that you use stable IDs for all controls in your app.",
		resolutionurls: [{
			text: "Documentation: Stable IDs: All You Need to Know",
			href: "https://sdk.openui5.org/topic/f51dbb78e7d5448e838cdc04bdf65403"
		}],
		async: true,
		check(issueManager, oCoreFacade, oScope, resolve) {
			var oUshellContainer = ObjectPath.get("sap.ushell.Container");

			Promise.resolve()
			.then(function() {
				if (oUshellContainer) {
					return Utils.getUShellService("AppLifeCycle")
					.then(function(oAppLifeCycle) {
						var mRunningApp = oAppLifeCycle.getCurrentApplication();
						// Disable this rule for ushell home page (where tiles are located)
						if (!mRunningApp.homePage) {
							return mRunningApp.componentInstance;
						}
						return undefined;
					})
					.catch(function(vError) {
						throw new Error(`Error getting current application from Unified Shell AppLifeCycle service: ${vError}`);
					});
				}
				return findAppComponent(oScope.getElements());
			})
			.then(function(oAppComponent) {
				if (!oAppComponent) {
					return;
				}

				var aPopovers = InstanceManager.getOpenPopovers();
				var aDialogs = InstanceManager.getOpenDialogs();
				var aAdaptablePopups = aPopovers.concat(aDialogs).filter(_isPopupAdaptable);

				var oDesignTime = new DesignTime({
					rootElements: [oAppComponent].concat(aAdaptablePopups)
				});

				function fnOnSynced() {
					var aUnstableOverlays = validateStableIds(oDesignTime.getElementOverlays(), oAppComponent);

					aUnstableOverlays.forEach(function(oElementOverlay) {
						var oElement = oElementOverlay.getElement();
						var sElementId = oElement.getId();
						var bHasConcatenatedId = sElementId.includes("--");

						if (!bHasConcatenatedId) {
							issueManager.addIssue({
								severity: Severity.High,
								details: `The ID '${sElementId}' for the control was generated and flexibility features ` +
									`cannot support controls with generated IDs.`,
								context: {
									id: sElementId
								}
							});
						} else {
							issueManager.addIssue({
								severity: Severity.Low,
								details: `The ID '${sElementId}' for the control was concatenated and has a generated onset.
									To enable the control for flexibility features, you must specify an ID for the control providing ` +
									`the onset, which is marked as high issue.`,
								context: {
									id: sElementId
								}
							});
						}
					});
					oDesignTime.destroy();
					resolve();
				}

				oDesignTime.attachEventOnce("synced", fnOnSynced);
			});
		}
	};

	return {
		name: "sap.ui.fl",
		niceName: "UI5 Flexibility Library",
		ruleset: [
			oStableIdRule
		]
	};
}, true);

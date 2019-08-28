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
	"sap/ui/core/Component",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/rta/util/validateStableIds",
	"sap/base/util/ObjectPath"
], function (
	SupportLib,
	Utils,
	DesignTime,
	Component,
	ChangeRegistry,
	validateStableIds,
	ObjectPath
) {
	"use strict";

	var Categories = SupportLib.Categories;
	var Audiences = SupportLib.Audiences;
	var Severity = SupportLib.Severity;

	function findAppComponent(aElements) {
		var oAppComponent;

		aElements.some(function (oElement) {
			oAppComponent = Utils.getAppComponentForControl(oElement);
			return !!oAppComponent;
		});

		return oAppComponent;
	}

	var oStableIdRule = {
		id: "stableId",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.28",
		title: "Stable control IDs are required for SAPUI5 flexibility services",
		description: "Checks whether the IDs of controls support SAPUI5 flexibility services",
		resolution: "Replace the generated control ID with a stable ID. We strongly recommend that you use stable IDs for all controls in your app.",
		resolutionurls: [{
			text: "Documentation: Stable IDs: All You Need to Know",
			href: "https://sapui5.hana.ondemand.com/#topic/f51dbb78e7d5448e838cdc04bdf65403.html"
		}],
		async: true,
		check: function (issueManager, oCoreFacade, oScope, resolve) {
			var oAppComponent;
			var oUshellContainer = ObjectPath.get("sap.ushell.Container");

			if (oUshellContainer) {
				var mRunningApp = oUshellContainer.getService("AppLifeCycle").getCurrentApplication();

				// Disable this rule for ushell home page (where tiles are located)
				if (!mRunningApp.homePage) {
					oAppComponent = mRunningApp.componentInstance;
				}
			} else {
				oAppComponent = findAppComponent(oScope.getElements());
			}

			if (!oAppComponent) {
				return;
			}

			var oDesignTime = new DesignTime({
				rootElements: [oAppComponent]
			});

			oDesignTime.attachEventOnce("synced", function () {
				var aUnstableOverlays = validateStableIds(oDesignTime.getElementOverlays(), oAppComponent);

				aUnstableOverlays.forEach(function (oElementOverlay) {
					var oElement = oElementOverlay.getElement();
					var sElementId = oElement.getId();
					var bHasConcatenatedId = sElementId.includes("--");

					if (!bHasConcatenatedId) {
						issueManager.addIssue({
							severity: Severity.High,
							details: "The ID '" + sElementId + "' for the control was generated and flexibility features " +
							"cannot support controls with generated IDs.",
							context: {
								id: sElementId
							}
						});
					} else {
						issueManager.addIssue({
							severity: Severity.Low,
							details: "The ID '" + sElementId + "' for the control was concatenated and has a generated onset.\n" +
							"To enable the control for flexibility features, you must specify an ID for the control providing the onset, which is marked as high issue.",
							context: {
								id: sElementId
							}
						});
					}
				});
				oDesignTime.destroy();
				resolve();
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

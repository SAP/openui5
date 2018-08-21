/*!
 * ${copyright}
 */
/**
 * Adds support rules of the <code>sap.ui.fl</code>
 * library to the support infrastructure.
 */
sap.ui.define(["sap/ui/support/library", "sap/ui/fl/Utils", "sap/ui/dt/DesignTime", "sap/ui/core/Component"],
	function(SupportLib, Utils, DesignTime, Component) {
		"use strict";

		var Categories = SupportLib.Categories,
		Audiences = SupportLib.Audiences,
		Severity = SupportLib.Severity;

		function isClonedElementFromListBinding(oControl) {
			var sParentAggregationName = oControl.sParentAggregationName,
				oParent = oControl.getParent();
			if (oParent && sParentAggregationName) {
				var oBindingInfo = oParent.getBindingInfo(sParentAggregationName);
				if (oBindingInfo && oControl instanceof oBindingInfo.template.getMetadata().getClass()) {
					return true;
				} else {
					return isClonedElementFromListBinding(oParent);
				}
			}
			return false;
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
				href: "https://sapui5.hana.ondemand.com/#docs/guide/f51dbb78e7d5448e838cdc04bdf65403.html"
			}],
			async: true,
			check: function (issueManager, oCoreFacade, oScope, resolve) {

				var aElements = oScope.getElements(),
					oElement,
					oAppComponent;

				for (var i = 0; i < aElements.length; i++) {
					oElement = aElements[i];
					oAppComponent = Utils.getAppComponentForControl(oElement);

					if (oAppComponent) {
						break;
					}
				}

				if (!oAppComponent) {
					return;
				}

				var oDesignTime = new DesignTime({
					rootElements: [Utils.getAppComponentForControl(oAppComponent, true)] // root app component
				});

				oDesignTime.attachEventOnce("synced", function () {
					var aOverlays = oDesignTime.getElementOverlays();

					aOverlays.forEach(function (oOverlay) {
						var oElement = oOverlay.getElementInstance();
						var sControlId = oElement.getId();

						var sHasConcatenatedId = sControlId.indexOf("--") !== -1;
						if (!Utils.checkControlId(sControlId, oAppComponent, true) && !isClonedElementFromListBinding(oElement)) {
							if (!sHasConcatenatedId) {
								issueManager.addIssue({
									severity: Severity.High,
									details: "The ID '" + sControlId + "' for the control was generated and flexibility features " +
									"cannot support controls with generated IDs.",
									context: {
										id: sControlId
									}
								});
							} else {
								issueManager.addIssue({
									severity: Severity.Low,
									details: "The ID '" + sControlId + "' for the control was concatenated and has a generated onset.\n" +
									"To enable the control for flexibility features, you must specify an ID for the control providing the onset, which is marked as high issue.",
									context: {
										id: sControlId
									}
								});
							}
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

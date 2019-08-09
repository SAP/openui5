/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/m/MessageBox",
	"sap/base/util/ObjectPath",
	"sap/ui/rta/util/hasStableId",
	"sap/ui/rta/util/showMessageBox"
], function (
	FlUtils,
	MessageBox,
	ObjectPath,
	hasStableId,
	showMessageBox
) {
	"use strict";

	return function (oRta) {
		// Avoid check in tests
		if (
			"QUnit" in window
			|| (
				window.frameElement
				&& window.frameElement.getAttribute("id") === "OpaFrame"
			)
		) {
			return;
		}

		var oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());

		if (oComponent) {
			var oManifest = oComponent.getManifest();

			if (
				oManifest
				&& ObjectPath.get(["sap.app", "id"], oManifest) !== "sap.ui.documentation.sdk"
				&& !ObjectPath.get(["sap.ui.generic.app"], oManifest)
			) {
				var vFlexEnabled = ObjectPath.get(["sap.ui5", "flexEnabled"], oManifest);
				if (typeof vFlexEnabled !== "boolean") {
					showMessageBox(
						oRta._getTextResources().getText("MSG_NO_FLEX_ENABLED_FLAG"),
						{
							icon: MessageBox.Icon.WARNING,
							title: oRta._getTextResources().getText("HEADER_WARNING")
						}
					);
				} else {
					var bValid = true;
					oRta._oDesignTime.getElementOverlays()
						.filter(function (oElementOverlay) {
							return !oElementOverlay.getDesignTimeMetadata().markedAsNotAdaptable();
						})
						.forEach(function (oElementOverlay) {
							bValid = hasStableId(oElementOverlay, /* Suppress = */false, "error", /* Flush Cache = */ true) && bValid;
						});

					if (!bValid) {
						showMessageBox(
							oRta._getTextResources().getText("MSG_UNSTABLE_ID_FOUND"),
							{
								icon: MessageBox.Icon.ERROR,
								title: oRta._getTextResources().getText("HEADER_ERROR")
							}
						);
					}
				}
			}
		}
	};
});
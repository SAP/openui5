/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/m/MessageBox",
	"sap/base/util/ObjectPath",
	"sap/ui/rta/util/validateStableIds",
	"sap/ui/rta/util/showMessageBox",
	"sap/base/Log",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util"
], function(
	FlUtils,
	MessageBox,
	ObjectPath,
	validateStableIds,
	showMessageBox,
	Log,
	Utils,
	DtUtil
) {
	"use strict";

	return function(oRta) {
		const mMessageBoxShow = {};
		let aPendingOverlaysToValidate = [];
		const oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());

		function displayMessage(oRta, oComponent, sText, sIconType, sTitle) {
			const sComponentId = oComponent.getId();
			if (!mMessageBoxShow[sComponentId]) {
				showMessageBox(
					oRta._getTextResources().getText(sText),
					{
						icon: MessageBox.Icon[sIconType],
						title: oRta._getTextResources().getText(sTitle),
						styleClass: Utils.getRtaStyleClassName()
					},
					"show"
				);
				setMessageBoxShow(sComponentId, true);
			}
		}

		function setMessageBoxShow(sComponentId, bValue) {
			mMessageBoxShow[sComponentId] = bValue;
		}

		function isValidApp(oComponent) {
			const oManifest = oComponent.getManifest();

			return (
				ObjectPath.get(["sap.app", "id"], oManifest) !== "sap.ui.documentation.sdk"
				&& !(ObjectPath.get(["sap.app", "id"], oManifest) || "").startsWith("sap.ui.rta") // all rta test apps
				&& !ObjectPath.get(["sap.ovp"], oManifest)
			);
		}

		function isTestEnvironment() {
			return (
				"QUnit" in window
				|| (
					window.frameElement
					&& (window.frameElement.getAttribute("id") || "").toLowerCase() === "opaframe"
				)
			);
		}

		function isControlAvailable(oControl) {
			return oControl && !oControl._bIsBeingDestroyed;
		}

		function handleModeChanged(oEvent) {
			const sNewMode = oEvent.getParameters().mode;
			if (sNewMode === "adaptation") {
				const oRta = oEvent.getSource();
				const oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());
				aPendingOverlaysToValidate = aPendingOverlaysToValidate.filter(isControlAvailable);
				handleUnstableIds(oRta, oComponent, aPendingOverlaysToValidate);
				aPendingOverlaysToValidate = [];
			}
		}

		function validateCreatedOverlay(oEvent, oRta) {
			const oElementOverlayCreated = oEvent.getParameters().elementOverlay;
			if (oRta.getMode() === "adaptation") {
				const oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());
				DtUtil.waitForSynced(oRta._oDesignTime, function(oOverlay) {
					if (isControlAvailable(oOverlay)) {
						handleUnstableIds(oRta, oComponent, [oOverlay]);
					}
				})(oElementOverlayCreated);
			} else {
				aPendingOverlaysToValidate.push(oElementOverlayCreated);
			}
		}

		function handleUnstableIds(oRta, oComponent, aElementOverlays) {
			const aUnstableOverlays = validateStableIds(aElementOverlays, oComponent);

			if (aUnstableOverlays.length) {
				aUnstableOverlays.forEach(function(oElementOverlay) {
					Log.error("Control ID was generated dynamically by SAPUI5. To support SAPUI5 flexibility, a stable control ID is needed to assign the changes to.", oElementOverlay.getElement().getId());
				});
				displayMessage(oRta, oComponent, "MSG_UNSTABLE_ID_FOUND", "ERROR", "HEADER_ERROR");
			}
		}

		oRta.attachEventOnce("stop", function() {
			setMessageBoxShow(oComponent.getId(), false);
		});

		if (oComponent && isValidApp(oComponent)) {
			const oManifest = oComponent.getManifest();
			const vFlexEnabled = ObjectPath.get(["sap.ui5", "flexEnabled"], oManifest);

			if (typeof vFlexEnabled !== "boolean") {
				if (!isTestEnvironment()) {
					displayMessage(oRta, oComponent, "MSG_NO_FLEX_ENABLED_FLAG", "WARNING", "HEADER_WARNING");
				}
			} else { // flexEnabled === true
				oRta.attachEvent("modeChanged", handleModeChanged);
				oRta._oDesignTime.attachEvent("elementOverlayCreated", oRta, validateCreatedOverlay);
				handleUnstableIds(oRta, oComponent, oRta._oDesignTime.getElementOverlays());
			}
		}
	};
});
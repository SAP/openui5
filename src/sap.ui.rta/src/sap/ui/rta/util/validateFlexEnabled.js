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
], function (
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
	return function (oRta) {
		function _displayMessage(oRta, oComponent, sText, sIconType, sTitle) {
			var sComponentId = oComponent.getId();
			if (!mMessageBoxShow[sComponentId]) {
				showMessageBox(
					oRta._getTextResources().getText(sText),
					{
						icon: MessageBox.Icon[sIconType],
						title: oRta._getTextResources().getText(sTitle),
						styleClass: Utils.getRtaStyleClassName()
					}
				);
				_setMessageBoxShow(sComponentId, true);
			}
		}

		function _setMessageBoxShow(sComponentId, bValue) {
			mMessageBoxShow[sComponentId] = bValue;
		}

		function _isValidApp(oComponent) {
			var oManifest = oComponent.getManifest();

			return (
				ObjectPath.get(["sap.app", "id"], oManifest) !== "sap.ui.documentation.sdk"
				&& !(ObjectPath.get(["sap.app", "id"], oManifest) || "").startsWith("sap.ui.rta") // all rta test apps
				&& !ObjectPath.get(["sap.ovp"], oManifest)
			);
		}

		function _isTestEnvironment() {
			return (
				"QUnit" in window
				|| (
					window.frameElement
					&& (window.frameElement.getAttribute("id") || "").toLowerCase() === "opaframe"
				)
			);
		}

		function _isControlAvailable(oControl) {
			return oControl && !oControl._bIsBeingDestroyed;
		}

		function _handleModeChanged(oEvent) {
			var sNewMode = oEvent.getParameters().mode;
			if (sNewMode === "adaptation") {
				var oRta = oEvent.getSource();
				var oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());
				aPendingOverlaysToValidate = aPendingOverlaysToValidate.filter(_isControlAvailable);
				_handleUnstableIds(oRta, oComponent, aPendingOverlaysToValidate);
				aPendingOverlaysToValidate = [];
			}
		}

		function _validateCreatedOverlay(oEvent, oRta) {
			var oElementOverlayCreated = oEvent.getParameters().elementOverlay;
			if (oRta.getMode() === "adaptation") {
				var oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());
				DtUtil.waitForSynced(oRta._oDesignTime, function (oOverlay) {
					if (_isControlAvailable(oOverlay)) {
						_handleUnstableIds(oRta, oComponent, [oOverlay]);
					}
				})(oElementOverlayCreated);
			} else {
				aPendingOverlaysToValidate.push(oElementOverlayCreated);
			}
		}

		function _handleUnstableIds(oRta, oComponent, aElementOverlays) {
			var aUnstableOverlays = validateStableIds(aElementOverlays, oComponent);

			if (aUnstableOverlays.length) {
				aUnstableOverlays.forEach(function (oElementOverlay) {
					Log.error("Control ID was generated dynamically by SAPUI5. To support SAPUI5 flexibility, a stable control ID is needed to assign the changes to.", oElementOverlay.getElement().getId());
				});
				_displayMessage(oRta, oComponent, "MSG_UNSTABLE_ID_FOUND", "ERROR", "HEADER_ERROR");
			}
		}

		var mMessageBoxShow = {};
		var aPendingOverlaysToValidate = [];
		var oComponent = FlUtils.getAppComponentForControl(oRta.getRootControlInstance());

		oRta.attachEventOnce("stop", function () {
			_setMessageBoxShow(oComponent.getId(), false);
		});

		if (oComponent && _isValidApp(oComponent)) {
			var oManifest = oComponent.getManifest();
			var vFlexEnabled = ObjectPath.get(["sap.ui5", "flexEnabled"], oManifest);

			if (typeof vFlexEnabled !== "boolean") {
				if (!_isTestEnvironment()) {
					_displayMessage(oRta, oComponent, "MSG_NO_FLEX_ENABLED_FLAG", "WARNING", "HEADER_WARNING");
				}
			} else { // flexEnabled === true
				oRta.attachEvent("modeChanged", _handleModeChanged);
				oRta._oDesignTime.attachEvent("elementOverlayCreated", oRta, _validateCreatedOverlay);
				_handleUnstableIds(oRta, oComponent, oRta._oDesignTime.getElementOverlays());
			}
		}
	};
});
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/base/Object",
	'sap/ui/Device'
],
	function(Core, BaseObject, Device) {
	"use strict";

	var AccessKeysEnablement = BaseObject.extend("sap.ui.core.AccessKeysEnablement",  /** @lends sap.ui.core.AccessKeysEnablement.prototype */ {});

	AccessKeysEnablement.controlRegistry = new Set();

	AccessKeysEnablement.CSS_CLASS = "sapUiAccKeysHighlighDom";

	AccessKeysEnablement.bListenersAttached = false;

	var fnHighLightControls = function () {
		var fnHLStart = function(oControl) {
			var bDisabled = oControl.getEnabled && !oControl.getEnabled();

			// disabled controls should not be highlighted
			if (bDisabled) {
				return;
			}

			if (oControl) {
				oControl.setProperty("highlightAccKeysRef", true);
				oControl.onAccKeysHighlightStart && oControl.onAccKeysHighlightStart();
			}
		};

		AccessKeysEnablement.controlRegistry.forEach(function(oElement) {
			fnHLStart(oElement);
		});
	};

	var fnStopHighlight = function () {
		var fnHLEnd = function(oControl) {

			if (oControl) {
				oControl.setProperty("highlightAccKeysRef", false);
				oControl.onAccKeysHighlightStart && oControl.onAccKeysHighlightEnd();
			}
		};

		AccessKeysEnablement.controlRegistry.forEach(function (oElement) {
			fnHLEnd(oElement);
		});
	};

	AccessKeysEnablement.attachKeydownListeners = function () {
		document.addEventListener("keydown", function(initialKeydownEvent) {

			if (this.hasHighlightedElements()) {
				initialKeydownEvent.preventDefault();
			}

			this.handleHighlightStart(initialKeydownEvent);

			document.addEventListener("keydown", function(postKeydownEvent) {
				if (this.hasHighlightedElements()) {
					postKeydownEvent.preventDefault();
				}
			}.bind(this), { once: true });
		}.bind(this));

		document.addEventListener("keyup", function(event) {
			this.handleHighlightEnd(event);
		}.bind(this));

		window.addEventListener("blur", function() {
			this.handleHighlightEnd(true);
		}.bind(this));
	};

	AccessKeysEnablement.handleHighlightStart = function (oEvent) {
		var bTriggerHighlight = oEvent.altKey;
		var sCharFromKey = oEvent.key;

		if (bTriggerHighlight) {
			fnHighLightControls();

			if (this.hasHighlightedElements()) {
				var aElements = this.getElementToBeFocused(sCharFromKey);

				if (!aElements.length) {
					return;
				}

				var oFocusedElement = document.activeElement;
				var bBackNavigation = oEvent.shiftKey;
				var iCurrentFocusedItemIndex = aElements.indexOf(oFocusedElement);

				if (bBackNavigation) {
					var oPreviousFocusableElement = aElements[iCurrentFocusedItemIndex - 1];

					if (oPreviousFocusableElement) {
						oPreviousFocusableElement.focus();
					} else if (iCurrentFocusedItemIndex === 0) {
						aElements[aElements.length - 1].focus();
					}

				} else {
					var oNextFocusableElement = aElements[iCurrentFocusedItemIndex + 1];

					if (oNextFocusableElement) {
						oNextFocusableElement.focus();
					} else if (iCurrentFocusedItemIndex === (aElements.length - 1)) {
						aElements[0].focus();
					}
				}
			}
		}
	};

	AccessKeysEnablement.hasHighlightedElements = function () {
		return document.getElementsByClassName(AccessKeysEnablement.CSS_CLASS).length;
	};

	AccessKeysEnablement.handleHighlightEnd = function (oEvent, bWindowBlur) {
		if (!oEvent.altKey || bWindowBlur) {
			fnStopHighlight();
		}
	};

	AccessKeysEnablement.getElementToBeFocused = function (sText) {
		return [].filter.call(document.querySelectorAll("[data-ui5-accesskey='" + sText.toLowerCase() + "']"), function(oDom) {
			var oControl = sap.ui.getCore().byId(oDom.getAttribute("id"));
			var bEnabled = oControl.getEnabled ? oControl.getEnabled() : true;
			var bVisible = oControl.getVisible();

			return bEnabled && bVisible;
		}).map(function(oElement) {
			oElement = sap.ui.getCore().byId(oElement.getAttribute("id"));
			return oElement.getAccessKeysFocusTarget ? oElement.getAccessKeysFocusTarget() : oElement.getFocusDomRef();
		});
	};

	AccessKeysEnablement.registerControl = function (oControl) {
		var bEnableAccKeys = Core.getConfiguration().getAccKeys();

		/* Disable the feature for Mac OS due to depreacated KeyCode API */
		if (Device.os.macintosh) {
			return;
		}

		this.controlRegistry.add(oControl);

		if (bEnableAccKeys && !this.bListenersAttached) {
			this.attachKeydownListeners();
			AccessKeysEnablement.bListenersAttached = true;
		}

		var fnExit = oControl.exit;

		oControl.exit = function () {
			AccessKeysEnablement.controlRegistry.delete(oControl);
			fnExit && fnExit.call(oControl);
		};
	};

	AccessKeysEnablement.deregisterControl = function (oControl) {
		AccessKeysEnablement.registerControl.delete();
	};

	return AccessKeysEnablement;
});

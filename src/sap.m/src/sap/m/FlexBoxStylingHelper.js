/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './FlexBoxCssPropertyMap'],
	function(jQuery, FlexBoxCssPropertyMap) {
	"use strict";

	/**
	 * FlexBox styling helper
	 * @namespace
	 */
	var FlexBoxStylingHelper = {};

	/**
	 * Goes through applicable item styles and sets them on the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FlexItemData} oLayoutData an object representation of the layout data
	 */
	FlexBoxStylingHelper.setFlexItemStyles = function(oRm, oLayoutData, oControl) {
		oRm = oRm || null;
		oControl = oControl || null;

		var iOrder = oLayoutData.getOrder(),
			iGrowFactor = oLayoutData.getGrowFactor(),
			iShrinkFactor = oLayoutData.getShrinkFactor(),
			sBaseSize = oLayoutData.getBaseSize().toLowerCase(),
			sMinHeight = oLayoutData.getMinHeight(),
			sMaxHeight = oLayoutData.getMaxHeight(),
			sMinWidth = oLayoutData.getMinWidth(),
			sMaxWidth = oLayoutData.getMaxWidth();

		// Set values if different from default
		if (iOrder) {
			FlexBoxStylingHelper.setStyle(oRm, oControl, "order", iOrder);
		}

		if (iGrowFactor != undefined) {
			FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-grow", iGrowFactor);
		}

		if (jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {
			if (iShrinkFactor !== 1) {
				FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-shrink", iShrinkFactor);
			}

			if (sBaseSize != undefined) {
				FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-basis", sBaseSize);
			}
		}

		if (sMinHeight != undefined) {
			FlexBoxStylingHelper.setStyle(oRm, oControl, "min-height", sMinHeight);
		}
		if (sMaxHeight != undefined) {
			FlexBoxStylingHelper.setStyle(oRm, oControl, "max-height", sMaxHeight);
		}
		if (sMinWidth != undefined) {
			FlexBoxStylingHelper.setStyle(oRm, oControl, "min-width", sMinWidth);
		}
		if (sMaxWidth != undefined) {
			FlexBoxStylingHelper.setStyle(oRm, oControl, "max-width", sMaxWidth);
		}
	};

	/**
	 * Sets style (including fall-back styles) to the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param sProperty name of the property
	 * @param sValue value of the property
	 */
	FlexBoxStylingHelper.setStyle = function(oRm, oControl, sProperty, sValue) {
		if (typeof (sValue) === "string") {
			// Convert camel-case to lower-case and dashes
			sValue = sValue.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
		}

		if (jQuery.support.flexBoxPrefixed) {
			if (sap.ui.Device.browser.webkit) {
				this.sVendorPrefix = "-webkit-";
			} else if (sap.ui.Device.browser.mozilla) {
				this.sVendorPrefix = "-moz-";
			} else if (sap.ui.Device.browser.internet_explorer) {
				this.sVendorPrefix = "-ms-";
			}
		} else {
			this.sVendorPrefix = "";
		}

		// Choose flex box styling method
		if (jQuery.support.newFlexBoxLayout) {
			// New spec
			FlexBoxStylingHelper.writeStyle(oRm, oControl, sProperty, sValue);
		} else if (jQuery.support.flexBoxLayout || jQuery.support.ie10FlexBoxLayout) {
			// Old spec
			FlexBoxStylingHelper.setOldSpecStyle(oRm, oControl, sProperty, sValue);
		}
	};

	/**
	 * Sets style for the OLD or the IE10 flex box spec to the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param sProperty name of the property
	 * @param sValue value of the property
	 */
	FlexBoxStylingHelper.setOldSpecStyle = function(oRm, oControl, sProperty, sValue) {
		// Choose specification
		var sSpec = "";
		if (this.sVendorPrefix == "-ms-") {
			sSpec = "specie10"; // IE10 specification
		} else {
			sSpec = "spec0907";	// old specification
		}

		// Nothing to do if final standard is supported or property doesn't exist in this spec or is the same as standard
		// Else map to old property
		if (FlexBoxCssPropertyMap[sSpec][sProperty] !== null && FlexBoxCssPropertyMap[sSpec][sProperty] !== "<idem>") {
			// Prepare mapped properties and values
			var mLegacyMap = null;
			if (typeof (FlexBoxCssPropertyMap[sSpec][sProperty]) === "object") {
				if (FlexBoxCssPropertyMap[sSpec][sProperty]["<number>"]) {
					mLegacyMap = {};
					for (var key in FlexBoxCssPropertyMap[sSpec][sProperty]["<number>"]) {
						// Check if the target is also a number, otherwise assume it's a literal
						if (FlexBoxCssPropertyMap[sSpec][sProperty]["<number>"][key] === "<number>") {
							mLegacyMap[key] = sValue;
						} else {
							mLegacyMap[key] = FlexBoxCssPropertyMap[sSpec][sProperty]["<number>"][key];
						}
					}
				} else {
					mLegacyMap = FlexBoxCssPropertyMap[sSpec][sProperty][sValue];
				}
			} else {
				mLegacyMap = FlexBoxCssPropertyMap[sSpec][sProperty][sValue];
			}

			// Nothing to do if value doesn't exist or is the same as standard
			if (mLegacyMap !== null && mLegacyMap !== "<idem>") {
				if (typeof (mLegacyMap) === "object") {
					for (var sLegacyProperty in mLegacyMap) {
						// Write property/value to control
						FlexBoxStylingHelper.writeStyle(oRm, oControl, sLegacyProperty, mLegacyMap[sLegacyProperty]);
					}
				}
			}
		}
	};

	/**
	 * Writes the style to the given control, using the provided {@link sap.ui.core.RenderManager} or jQuery.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param sProperty name of the property
	 * @param sValue value of the property
	 */
	FlexBoxStylingHelper.writeStyle = function(oRm, oControl, sProperty, sValue) {
		var sPropertyPrefix = "";
		var sValuePrefix = "";

		// Set prefix to value for 'display' property
		// As 'display' is a long-standing standard property, the value is vendor-prefixed instead of the property name
		if (sProperty !== "display") {
			sPropertyPrefix = this.sVendorPrefix;
		} else {
			sValuePrefix = this.sVendorPrefix;
		}

		// IE 10-11 miscalculate the width of the flex items when box-sizing: border-box
		// Instead of using flex-basis, we use an explicit width

		if (sap.ui.Device.browser.internet_explorer && sProperty === "flex-basis") {
			sProperty = "width";
		}

		// Finally, write property value to control using either the renderer or element directly
		if (oRm) {
			oRm.addStyle(sPropertyPrefix + sProperty, sValuePrefix + sValue);
		} else {
			oControl.$().css(sPropertyPrefix + sProperty, sValuePrefix + sValue);
		}
	};

	return FlexBoxStylingHelper;

}, /* bExport= */ true);

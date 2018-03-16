/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './FlexBoxCssPropertyMap', 'sap/ui/Device'],
	function(jQuery, FlexBoxCssPropertyMap, Device) {
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
	FlexBoxStylingHelper.setFlexItemStyles = function(oRm, oLayoutData) {
		oRm = oRm || null;

		var sOrder = '' + oLayoutData.getOrder(),
			sGrowFactor = '' + oLayoutData.getGrowFactor(),
			sShrinkFactor = '' + oLayoutData.getShrinkFactor(),
			sBaseSize = oLayoutData.getBaseSize().toLowerCase(),
			sMinHeight = oLayoutData.getMinHeight(),
			sMaxHeight = oLayoutData.getMaxHeight(),
			sMinWidth = oLayoutData.getMinWidth(),
			sMaxWidth = oLayoutData.getMaxWidth();

		// Set values if different from default
		if (typeof sOrder !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "order", sOrder);
		}

		if (typeof sGrowFactor !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "flex-grow", sGrowFactor);
		}

		if (jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {
			if (typeof sShrinkFactor !== 'undefined') {
				FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "flex-shrink", sShrinkFactor);
			}

			if (typeof sBaseSize !== 'undefined') {
				FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "flex-basis", sBaseSize);
			}
		}

		if (typeof sMinHeight !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "min-height", sMinHeight);
		}
		if (typeof sMaxHeight !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "max-height", sMaxHeight);
		}
		if (typeof sMinWidth !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "min-width", sMinWidth);
		}
		if (typeof sMaxWidth !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "max-width", sMaxWidth);
		}
	};

	/**
	 * Sets style (including fall-back styles) to the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FlexItemData} oLayoutData an object representation of the layout data
	 * @param {string} sProperty name of the property
	 * @param {string} sValue value of the property
	 */
	FlexBoxStylingHelper.setStyle = function(oRm, oLayoutData, sProperty, sValue) {
		if (typeof (sValue) === "string") {
			// Convert camel-case to lower-case and dashes
			sValue = sValue.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
		}

		if (jQuery.support.flexBoxPrefixed) {
			if (Device.browser.webkit) {
				this.sVendorPrefix = "-webkit-";
			} else if (Device.browser.mozilla) {
				this.sVendorPrefix = "-moz-";
			} else if (Device.browser.internet_explorer) {
				this.sVendorPrefix = "-ms-";
			}
		} else {
			this.sVendorPrefix = "";
		}

		// Choose flex box styling method
		if (jQuery.support.newFlexBoxLayout || ["min-height", "max-height", "min-width", "max-width"].indexOf(sProperty) !== -1) {
			// New spec
			FlexBoxStylingHelper.writeStyle(oRm, oLayoutData, sProperty, sValue);
		} else if (jQuery.support.flexBoxLayout || jQuery.support.ie10FlexBoxLayout) {
			// Old spec
			FlexBoxStylingHelper.setOldSpecStyle(oRm, oLayoutData, sProperty, sValue);
		}
	};

	/**
	 * Sets style for the OLD or the IE10 flex box spec to the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FlexItemData} oLayoutData an object representation of the layout data
	 * @param {string} sProperty name of the property
	 * @param {string} sValue value of the property
	 */
	FlexBoxStylingHelper.setOldSpecStyle = function(oRm, oLayoutData, sProperty, sValue) {
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
						FlexBoxStylingHelper.writeStyle(oRm, oLayoutData, sLegacyProperty, mLegacyMap[sLegacyProperty]);
					}
				}
			}
		}
	};

	/**
	 * Writes the style to the given control, using the provided {@link sap.ui.core.RenderManager} or jQuery.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FlexItemData} oLayoutData an object representation of the layout data
	 * @param {string} sProperty name of the property
	 * @param {string} sValue value of the property
	 */
	FlexBoxStylingHelper.writeStyle = function(oRm, oLayoutData, sProperty, sValue) {
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
		// Instead of using flex-basis, we use an explicit width/height
		// @see https://github.com/philipwalton/flexbugs#7-flex-basis-doesnt-account-for-box-sizingborder-box
		if (Device.browser.internet_explorer && (sProperty === "flex-basis" || sProperty === "flex-preferred-size")) {
			sPropertyPrefix = "";
			if (oLayoutData.getParent()) {
				if (oLayoutData.getParent().getParent().getDirection().indexOf("Row") > -1) {
					sProperty = "width";
				} else {
					sProperty = "height";
				}
			}
		}

		// Finally, write property value to control using either the render manager or the element directly
		if (oRm) {
			if (sValue === "0" || sValue) {
				oRm.addStyle(sPropertyPrefix + sProperty, sValuePrefix + sValue);
			}
		} else {
			// Set the property on the wrapper or the control root itself
			if (oLayoutData.$().length) {	// Does the layout data have a DOM representation?
				// jQuery removes 'null' styles
				if (sValue !== "0" && !sValue) {
					oLayoutData.$().css(sPropertyPrefix + sProperty, null);
				} else {
					oLayoutData.$().css(sPropertyPrefix + sProperty, sValuePrefix + sValue);
				}
			} else {
				// Get control root for bare item
				if (oLayoutData.getParent()) {
					// jQuery removes 'null' styles
					if (sValue !== "0" && !sValue) {
						oLayoutData.getParent().$().css(sPropertyPrefix + sProperty, null);
					} else {
						oLayoutData.getParent().$().css(sPropertyPrefix + sProperty, sValuePrefix + sValue);
					}
				}
			}
		}
	};

	return FlexBoxStylingHelper;

}, /* bExport= */ true);

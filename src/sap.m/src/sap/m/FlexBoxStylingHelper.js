/*!
 * ${copyright}
 */
sap.ui.define(['./FlexBoxCssPropertyMap', 'sap/ui/Device'],
	function(FlexBoxCssPropertyMap, Device) {
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

		if (typeof sShrinkFactor !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "flex-shrink", sShrinkFactor);
		}

		if (typeof sBaseSize !== 'undefined') {
			FlexBoxStylingHelper.setStyle(oRm, oLayoutData, "flex-basis", sBaseSize);
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

		FlexBoxStylingHelper.writeStyle(oRm, oLayoutData, sProperty, sValue);
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
		// IE 10-11 miscalculate the width of the flex items when box-sizing: border-box // TODO remove after the end of support for Internet Explorer
		// Instead of using flex-basis, we use an explicit width/height
		// @see https://github.com/philipwalton/flexbugs#7-flex-basis-doesnt-account-for-box-sizingborder-box
		if (Device.browser.internet_explorer && (sProperty === "flex-basis" || sProperty === "flex-preferred-size")) {
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
				oRm.style(sProperty, sValue);
			}
		} else {
			// Set the property on the wrapper or the control root itself
			if (oLayoutData.$().length) {	// Does the layout data have a DOM representation?
				// jQuery removes 'null' styles
				if (sValue !== "0" && !sValue) {
					oLayoutData.$().css(sProperty, null);
				} else {
					oLayoutData.$().css(sProperty, sValue);
				}
			} else {
				// Get control root for bare item
				if (oLayoutData.getParent()) {
					// jQuery removes 'null' styles
					if (sValue !== "0" && !sValue) {
						oLayoutData.getParent().$().css(sProperty, null);
					} else {
						oLayoutData.getParent().$().css(sProperty, sValue);
					}
				}
			}
		}
	};

	return FlexBoxStylingHelper;

}, /* bExport= */ true);
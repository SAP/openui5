/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.require("sap.m.FlexBoxCssPropertyMap");
jQuery.sap.declare("sap.m.FlexBoxStylingHelper");

/**
 * @class FlexBox styling helper
 * @static
 */
sap.m.FlexBoxStylingHelper = {};

/**
 * Goes through applicable styles and calls function to sets them on the given control.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.FlexBoxStylingHelper.setFlexBoxStyles = function(oRm, oControl) {
	var sDisplay;

	// Prepare values by converting camel-case to dash and lower-casing
	var bInline = oControl.getDisplayInline();
	var sDirection = oControl.getDirection().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
	var bFitContainer = oControl.getFitContainer();
	var sJustifyContent = oControl.getJustifyContent().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
	var sAlignItems = oControl.getAlignItems().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();

	if(bInline) {
		sDisplay = "inline-flex";
	} else {
		sDisplay = "flex";
	}

	// Set width and height for outermost FlexBox only if FitContainer is set
	if(bFitContainer && !(oControl.getParent() instanceof sap.m.FlexBox)) {
		oRm.addStyle("width", "auto");
		oRm.addStyle("height", "100%");
	}

	// Add flex prefix to start and end values
	if(sJustifyContent === "start" || sJustifyContent === "end") {
		sJustifyContent = "flex-" + sJustifyContent;
	}

	if(sAlignItems === "start" || sAlignItems === "end") {
		sAlignItems = "flex-" + sAlignItems;
	}

	// Set values (if different from default)
	sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "display", sDisplay);
	if(sDirection !== "row") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-direction", sDirection);
	}

	if(sJustifyContent !== "flex-start") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "justify-content", sJustifyContent);
	}
	if(sAlignItems !== "stretch") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "align-items", sAlignItems);
	}
//	if(jQuery.support.newFlexBoxLayout) {
//		var sWrap = oControl.getWrap().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
//		var sAlignContent = oControl.getAlignContent().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
//
//		if(sWrap !== "nowrap") {
//			sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-wrap", sWrap);
//		}
//		if(sAlignContent === "start" || sAlignContent === "end") {
//			sAlignContent = "flex-" + sAlignContent;
//		}
//		if(sAlignContent !== "stretch") {
//			sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "align-content", sAlignContent);
//		}
//	}
};

/**
 * Goes through applicable item styles and sets them on the given control.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.FlexItemData} oLayoutData an object representation of the layout data
 */
sap.m.FlexBoxStylingHelper.setFlexItemStyles = function(oRm, oLayoutData) {
	var order = "";
	var growFactor = "";
	var alignSelf = "";

	// Set values if different from default
	order = oLayoutData.getOrder();
	if(order) {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "order", order);
	}

	growFactor = oLayoutData.getGrowFactor();
	if(growFactor) {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "flex-grow", growFactor);
	}

	alignSelf = oLayoutData.getAlignSelf().toLowerCase();

	// Add flex prefix to start and end values to create CSS value
	if(alignSelf === "start" || alignSelf === "end") {
		alignSelf = "flex-" + alignSelf;
	}

	if(alignSelf && alignSelf !== "flex-start") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "align-self", alignSelf);
	}

//	if(jQuery.support.newFlexBoxLayout) {
//		var shrinkFactor = "";
//		var baseSize = "";
//
//		shrinkFactor = oLayoutData.getShrinkFactor();
//		if(shrinkFactor != 1) {
//			sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "flex-shrink", shrinkFactor);
//		}
//
//		baseSize = oLayoutData.getBaseSize().toLowerCase();
//		if(baseSize) {
//			sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "flex-basis", baseSize);
//		}
//	}
};

/**
 * Sets style (including fall-back styles) to the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 * @param sProperty name of the property
 * @param sValue value of the property
 */
sap.m.FlexBoxStylingHelper.setStyle = function(oRm, oControl, sProperty, sValue) {
	if(typeof(sValue) === "string") {
		sValue = sValue.toLowerCase();
	}
	var sVendorPrefix = "";
	if(jQuery.browser.webkit) {
		sVendorPrefix = "-webkit-";
	} else if(jQuery.browser.mozilla) {
		sVendorPrefix = "-moz-";
	} else if(jQuery.browser.msie) {
		sVendorPrefix = "-ms-";
	}

	// Nothing to do if final standard is supported or property doesn't exist in this spec or is the same as standard
	var sSpec = "spec0907";	// old specification
	if(!jQuery.support.newFlexBoxLayout && sap.m.FlexBoxCssPropertyMap[sSpec][sProperty] !== null && sap.m.FlexBoxCssPropertyMap[sSpec][sProperty] !== "<idem>") {		// Prepare mapped properties and values
		var mLegacyMap = null;
		if(typeof(sap.m.FlexBoxCssPropertyMap[sSpec][sProperty]) === "object") {
			if(sap.m.FlexBoxCssPropertyMap[sSpec][sProperty]["<number>"]) {
				mLegacyMap = sap.m.FlexBoxCssPropertyMap[sSpec][sProperty]["<number>"];
				for(var key in mLegacyMap) {
					mLegacyMap[key] = sValue;
				}
			} else {
				mLegacyMap = sap.m.FlexBoxCssPropertyMap[sSpec][sProperty][sValue];
			}
		} else {
			mLegacyMap = sap.m.FlexBoxCssPropertyMap[sSpec][sProperty][sValue];
		}

		// Nothing to do if value doesn't exist or is the same as standard
		if(mLegacyMap !== null && mLegacyMap !== "<idem>") {
			if(typeof(mLegacyMap) === "object") {
				for(var sLegacyProperty in mLegacyMap) {
					// As display is a long-standing standard property the values are vendor-prefixed instead of the property name
					if(sLegacyProperty === "display") {
						if(oRm) {
							oRm.addStyle(sLegacyProperty, sVendorPrefix + mLegacyMap[sLegacyProperty]);
						} else {
							jQuery(oControl).css(sLegacyProperty, sVendorPrefix + mLegacyMap[sLegacyProperty]);
						}
					} else {
						if(oRm) {
							oRm.addStyle(sVendorPrefix + sLegacyProperty, mLegacyMap[sLegacyProperty]);
						} else {
							jQuery(oControl).css(sVendorPrefix + sLegacyProperty, mLegacyMap[sLegacyProperty]);
						}
					}
				}
			}
		}
	}

	// Final standard
	if(jQuery.support.newFlexBoxLayout) {
		// With vendor prefix
		if(sProperty !== "display") {
			if(oRm) {
				oRm.addStyle(sVendorPrefix + sProperty, sValue);
			} else {
				jQuery(oControl).css(sVendorPrefix + sProperty, sValue);
			}
		} else {
			if(oRm) {
				oRm.addStyle(sProperty, sVendorPrefix + sValue);
			} else {
				jQuery(oControl).css(sProperty, sVendorPrefix + sValue);
			}
		}

		// Pure standard
		if(oRm) {
			oRm.addStyle(sProperty, sValue);
		} else {
			jQuery(oControl).css(sProperty, sValue);
		}
	}
};
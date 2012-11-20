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
	// TODO Activate wrapping when browsers support it
	//var sWrap = oControl.getWrap().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
	var sJustifyContent = oControl.getJustifyContent().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
	var sAlignItems = oControl.getAlignItems().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
	// TODO Enable alignContent when any browser supports it
	//var sAlignContent = oControl.getAlignContent().replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();

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

	// TODO Enable alignContent when any browser supports it
	/* if(sAlignContent === "start" || sAlignContent === "end") {
		sAlignContent = "flex-" + sAlignContent;
	}*/

	// Set values (if different from default)
	sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "display", sDisplay);
	if(sDirection !== "row") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-direction", sDirection);
	}
	// TODO Enable wrapping when any browser supports it
	/* if(sWrap !== "nowrap") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "flex-wrap", sWrap);
	}*/
	if(sJustifyContent !== "flex-start") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "justify-content", sJustifyContent);
	}
	if(sAlignItems !== "stretch") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "align-items", sAlignItems);
	}
	// TODO Enable alignContent when any browser supports it
	/* if(sAlignContent !== "stretch") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, oControl, "align-content", sAlignContent);
	}*/
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
	// TODO Activate shrinkFactor when browsers support it
	//var shrinkFactor = "";
	// TODO Activate baseSize when browsers support it
	//var baseSize = "";
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
	/* TODO Activate shrinkFactor when browsers support it
	shrinkFactor = oLayoutData.getShrinkFactor();
	if(shrinkFactor != 1) {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "flex-shrink", shrinkFactor);
	}
	*/
	/* TODO Activate baseSize when browsers support it
	baseSize = oLayoutData.getBaseSize().toLowerCase();
	if(baseSize) {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "flex-basis", baseSize);
	}
	*/

	alignSelf = oLayoutData.getAlignSelf().toLowerCase();

	// Add flex prefix to start and end values to create CSS value
	if(alignSelf === "start" || alignSelf === "end") {
		alignSelf = "flex-" + alignSelf;
	}

	if(alignSelf && alignSelf !== "flex-start") {
		sap.m.FlexBoxStylingHelper.setStyle(oRm, null, "align-self", alignSelf);
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
sap.m.FlexBoxStylingHelper.setStyle = function(oRm, oControl, sProperty, sValue) {
	if(typeof(sValue) === "string") {
		sValue = sValue.toLowerCase();
	}
	var aVendorPrefixes = [];
	if(jQuery.browser.webkit) {
		aVendorPrefixes = ["-webkit-"];
	} else if(jQuery.browser.mozilla) {
		aVendorPrefixes = ["-moz-"];
	}

	//var aSpecKeys = ["spec0907", "spec1203"];
	var aSpecKeys = ["spec0907"];

	for(var i = 0; i < aSpecKeys.length; ++i) {
		var sSpec = aSpecKeys[i];

		// Nothing to do if property doesn't exist in this spec or is the same as standard
		if(sap.m.FlexBoxCssPropertyMap[sSpec][sProperty] === null || sap.m.FlexBoxCssPropertyMap[sSpec][sProperty] === "<idem>") {
			continue;
		}

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
		if(mLegacyMap === null || mLegacyMap === "<idem>") {
			continue;
		} else if(typeof(mLegacyMap) === "object") {
			for(var sLegacyProperty in mLegacyMap) {
				// As display is a long-standing standard property the values are vendor-prefixed instead of the property name
				if(sLegacyProperty === "display") {
					// Vendor-specific styles
					for(var key in aVendorPrefixes) {
						if(aVendorPrefixes[key] + mLegacyMap[sLegacyProperty] === "-webkit-flexbox" || aVendorPrefixes[key] + mLegacyMap[sLegacyProperty] === "-webkit-inline-flexbox") continue; // Skipping display:-webkit-(inline-)flexbox to get the correct spec version in Chrome
						if(oRm) {
							oRm.addStyle(sLegacyProperty, aVendorPrefixes[key] + mLegacyMap[sLegacyProperty]);
						} else {
							jQuery(oControl).css(sLegacyProperty, aVendorPrefixes[key] + mLegacyMap[sLegacyProperty]);
						}
					}

					// Standard style
					// TODO Uncomment when non-prefixed properties are supported by any browser
					/*
					if(oRm) {
						oRm.addStyle(sLegacyProperty, mLegacyMap[sLegacyProperty]);
					} else {
						jQuery(oControl).css(sLegacyProperty, mLegacyMap[sLegacyProperty]);
					}*/
				} else {
					// Vendor-specific styles
					for(var key in aVendorPrefixes) { 
						if(oRm) {
							oRm.addStyle(aVendorPrefixes[key] + sLegacyProperty, mLegacyMap[sLegacyProperty]);
						} else {
							jQuery(oControl).css(aVendorPrefixes[key] + sLegacyProperty, mLegacyMap[sLegacyProperty]);
						}
					}

					// Standard style
					// TODO Uncomment when non-prefixed properties are supported by any browser
					/*
					if(oRm) {
						//oRm.addStyle(sLegacyProperty, mLegacyMap[sLegacyProperty]);
					} else {
						jQuery(oControl).css(sLegacyProperty, mLegacyMap[sLegacyProperty]);
					}*/
				}
			}
		}
	}

	// Current standard
	// TODO Uncomment when current standard is supported by any browser
	/*if(sProperty != "display"){
		for(var key in aVendorPrefixes) {
			if(oRm) {
				oRm.addStyle(aVendorPrefixes[key] + sProperty, sValue);
			} else {
				jQuery(oControl).css(aVendorPrefixes[key] + sProperty, sValue);
			}
		}
	}*/

	// Standard style
	// TODO Uncomment when non-prefixed properties are supported by any browser
	/*if(oRm) {
		oRm.addStyle(sProperty, sValue);
	} else {
		jQuery(oControl).css(sProperty, sValue);
	}*/
};
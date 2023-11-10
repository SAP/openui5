/*global QUnit */
sap.ui.define([
	"sap/m/FeedContent",
	"sap/ui/core/TooltipBase",
	"sap/m/library",
	"sap/ui/core/Core"
], function(FeedContent, TooltipBase, library, oCore) {
	"use strict";

	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;

	// shortcut for sap.m.Size
	var Size = library.Size;

	/* --- Helpers --- */

	function fnHoverHandler() {
	}

	function fnPressHandler() {
	}

	function hasAttribute(sAttribute, oCurrentObject) {
		var sAttributeValue = oCurrentObject.$().attr(sAttribute);
		if (typeof sAttributeValue !== typeof undefined && sAttributeValue !== false) {
			return true;
		} else {
			return false;
		}
	}
});
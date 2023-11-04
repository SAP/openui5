/*global QUnit */
sap.ui.define([
	"sap/m/library"
], function(library) {
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
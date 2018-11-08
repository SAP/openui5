/*
 * Helper script that either loads QUnit 1.x or QUnit 2.x depending on the existence and value of a URL parameter sap-ui-qunitversion.
 */
(function() {
	"use strict";

	var param = /(?:\?|&)sap-ui-qunitversion=(\d+)(?:&|$)/.exec(window.location.search);
	var version = param && parseInt( param[1]) || 1;
	switch ( version ) {
	case 1:
		jQuery.sap.require("sap.ui.thirdparty.qunit");
		jQuery.sap.require("sap.ui.qunit.qunit-css");
		break;
	case 2:
		jQuery.sap.require("sap.ui.thirdparty.qunit-2");
		jQuery.sap.require("sap.ui.qunit.qunit-2-css");
		if ( document.title ) {
			document.title = document.title + " (QUnit 2)";
		}
		break;
	default:
		throw new Error("unsupported qunit version " + version);
	}
}());
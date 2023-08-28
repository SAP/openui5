/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/thirdparty/jquery",
		"sap/ui/support/supportRules/Main",
		"sap/ui/support/supportRules/RuleSetLoader"],
	function (jQuery,
			  Main,
			  RuleSetLoader) {
		"use strict";

		jQuery.sap = jQuery.sap || {};

		return jQuery.sap.support;
	});
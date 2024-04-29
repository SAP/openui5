/*!
 * ${copyright}
 */

/**
 * Helper to determine qunit test execution ability
 *
 * @private
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	let isSapUI5 = false;

	jQuery.ajax({
		type: "HEAD",
		url: sap.ui.require.toUrl("sap/chart/Chart.js"),
		async: false,
		success: function() {
			isSapUI5 = true;
		}
	});

	return {
		isSapUI5: isSapUI5,
		isOpenUI5: !isSapUI5,
		skipOpenUI5: !isSapUI5 ? "skip" : "test",
		skipSapUI5: isSapUI5 ? "skip" : "test"
	};

});

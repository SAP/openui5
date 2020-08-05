/*!
 * ${copyright}
 */

sap.ui.define([
	"./waitForValueHelpDialog"
], function(
	waitForValueHelpDialog
) {
	"use strict";

	return {

		iShouldSeeTheValueHelpDialog: function(sTitle) {
			return waitForValueHelpDialog.call(this, {
				properties: {
					title: sTitle
				}
			});
		}
	};
});


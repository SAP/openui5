/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate"
], function(
	BaseValueHelpDelegate
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.showTypeahead = function (oPayload, oContent, oConfig) {
		//return true;
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(true);
			}, 1000);
		});
	};

	return ValueHelpDelegate;
});

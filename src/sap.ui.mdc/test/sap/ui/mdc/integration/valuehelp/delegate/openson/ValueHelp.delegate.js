/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate"
], function(
	BaseValueHelpDelegate
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		const vShouldOpenOnClick = oValueHelp.getPayload()?.shouldOpenOnClick;
		if (typeof vShouldOpenOnClick === "boolean" && oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			return vShouldOpenOnClick;
		} else {
			return BaseValueHelpDelegate.shouldOpenOnFocus.apply(this, arguments);
		}
	};

	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		const vShouldOpenOnFocus = oValueHelp.getPayload()?.shouldOpenOnFocus;
		if (typeof vShouldOpenOnFocus === "boolean" && oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			return vShouldOpenOnFocus;
		} else {
			return BaseValueHelpDelegate.shouldOpenOnFocus.apply(this, arguments);
		}
	};


	ValueHelpDelegate.showTypeahead = function (oValueHelp, oContent) {
		//return true;
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(true);
			}, 1000);
		});
	};

	return ValueHelpDelegate;
});

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

	ValueHelpDelegate.showTypeahead = function (oPayload, oContent, oConfig) {
		const sShowTypeahead = oContent.getModel("settings").getData().showTypeahead;
		let fnShowTypeahead;

		// eslint-disable-next-line no-eval
		eval("fnShowTypeahead = " + sShowTypeahead);

		return fnShowTypeahead ? fnShowTypeahead.apply(this, arguments) : BaseValueHelpDelegate.showTypeahead.apply(this, arguments);
	};

	return ValueHelpDelegate;
});

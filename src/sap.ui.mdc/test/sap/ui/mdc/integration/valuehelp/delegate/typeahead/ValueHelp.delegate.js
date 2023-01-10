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
		var sShowTypeahead = oContent.getModel("settings").getData().showTypeahead;
		var fnShowTypeahead;

		// eslint-disable-next-line no-eval
		eval("fnShowTypeahead = " + sShowTypeahead);

		return fnShowTypeahead ? fnShowTypeahead.apply(this, arguments) : BaseValueHelpDelegate.showTypeahead.apply(this, arguments);
	};

	return ValueHelpDelegate;
});

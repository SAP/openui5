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

		/*eslint-disable-next-line no-new-func*/
		const fnShowTypeahead = new Function('oValueHelp', 'oContent',`return (${sShowTypeahead})(oValueHelp, oContent)`);

		return fnShowTypeahead ? fnShowTypeahead.apply(this, arguments) : BaseValueHelpDelegate.showTypeahead.apply(this, arguments);
	};

	return ValueHelpDelegate;
});

/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate",
	'sap/ui/Device'
], function(
	BaseValueHelpDelegate,
	Device
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		const sShouldOpenOnFocus = oContainer.getModel("runtimeState").getData().typeahead.shouldOpenOnFocus;

		/*eslint-disable-next-line no-new-func*/
		const fnShouldOpenOnFocus = new Function('oValueHelp', 'oContainer', 'Device', `return (${sShouldOpenOnFocus})(oValueHelp, oContainer);`);
		return fnShouldOpenOnFocus ? fnShouldOpenOnFocus.apply(this, [oValueHelp, oContainer, Device]) : BaseValueHelpDelegate.sShouldOpenOnFocus.apply(this, arguments);
	};

	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		const sShouldOpenOnClick = oContainer.getModel("runtimeState").getData().typeahead.shouldOpenOnClick;

		/*eslint-disable-next-line no-new-func*/
		const fnShouldOpenOnClick = new Function('oValueHelp', 'oContainer', 'Device', `return (${sShouldOpenOnClick})(oValueHelp, oContainer);`);
		return fnShouldOpenOnClick ? fnShouldOpenOnClick.apply(this, [oValueHelp, oContainer, Device]) : BaseValueHelpDelegate.shouldOpenOnClick.apply(this, arguments);
	};

	ValueHelpDelegate.showTypeahead = function (oValueHelp, oContent) {
		const sShowTypeahead = oContent.getModel("runtimeState").getData().typeahead.showTypeahead;

		/*eslint-disable-next-line no-new-func*/
		const fnShowTypeahead = new Function('oValueHelp', 'oContent', 'Device', `return (${sShowTypeahead})(oValueHelp, oContent);`);
		return fnShowTypeahead ? fnShowTypeahead.apply(this, [oValueHelp, oContent, Device]) : BaseValueHelpDelegate.showTypeahead.apply(this, arguments);
	};

	return ValueHelpDelegate;
});

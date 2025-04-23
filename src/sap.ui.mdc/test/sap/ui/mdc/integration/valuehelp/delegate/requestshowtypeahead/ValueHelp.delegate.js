/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate",
	'sap/ui/mdc/enums/RequestShowContainerReason',
	"sap/ui/events/KeyCodes"
], function(
	BaseValueHelpDelegate,
	RequestShowContainerReason,
	KeyCodes
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.getFirstMatch = function (oValueHelp, oContent, oConfig) {
		try {
			return BaseValueHelpDelegate.getFirstMatch.apply(this, arguments);
		} catch (error) {
			return undefined;
		}
	};


	ValueHelpDelegate.requestShowContainer = function (oValueHelp, oContainer, sRequestShowContainerReason) {
		const sShouldShowContainer = oValueHelp.getModel("runtimeState").getData().typeahead.requestShowContainer;

		/*eslint-disable-next-line no-new-func*/
		const fnShouldShowContainer = new Function('oValueHelp', 'oContainer', 'sRequestShowContainerReason', 'BaseValueHelpDelegate', 'RequestShowContainerReason', 'KeyCodes', `return (${sShouldShowContainer})(oValueHelp, oContainer, sRequestShowContainerReason, BaseValueHelpDelegate, RequestShowContainerReason, KeyCodes);`);
		return fnShouldShowContainer ? fnShouldShowContainer.apply(this, [oValueHelp, oContainer, sRequestShowContainerReason, BaseValueHelpDelegate, RequestShowContainerReason, KeyCodes]) : BaseValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	ValueHelpDelegate._requestShowContainerDefault = function (oValueHelp, oContainer, sRequestShowContainerReason) {

		// Ensure the value help popover opens for tap events and tab navigation, even without a filter value
		if ([RequestShowContainerReason.Tab, RequestShowContainerReason.Tap, RequestShowContainerReason.Filter].includes(sRequestShowContainerReason)) {
			return oContainer.isA("sap.ui.mdc.valuehelp.Popover");
		}

		/* //One could also enforce opening on focus events instead, which would include programmatic focus:
		if ([RequestShowContainerReason.Focus, RequestShowContainerReason.Filter].includes(sRequestShowContainerReason)) {
			return oContainer.isA("sap.ui.mdc.valuehelp.Popover");
		} */

		return BaseValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	return ValueHelpDelegate;
});

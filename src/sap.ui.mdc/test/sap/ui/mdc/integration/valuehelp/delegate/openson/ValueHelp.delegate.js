/*!
 * ${copyright}
 */

/* eslint-disable valid-jsdoc */

sap.ui.define([
	"../ValueHelp.delegate",
	'sap/ui/mdc/enums/RequestShowContainerReason'
], function(
	BaseValueHelpDelegate,
	RequestShowContainerReason
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.requestShowContainer = function (oValueHelp, oContainer, sRequestShowContainerReason) {
		const {shouldOpenOnClick} = oValueHelp.getPayload();

		if (shouldOpenOnClick && sRequestShowContainerReason === RequestShowContainerReason.Tap) {
			return true;
		} else if (sRequestShowContainerReason === RequestShowContainerReason.Filter) {
			return new Promise((resolve) => {setTimeout(() => resolve(true), 1000);	});
		}

		return BaseValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		return oValueHelp.getPayload()?.shouldOpenOnClick;
	};

	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		return oValueHelp.getPayload()?.shouldOpenOnFocus;
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

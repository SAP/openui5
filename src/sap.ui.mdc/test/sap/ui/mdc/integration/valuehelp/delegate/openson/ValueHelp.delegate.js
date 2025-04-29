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

	return ValueHelpDelegate;
});

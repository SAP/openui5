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

		if ([shouldOpenOnClick && RequestShowContainerReason.Tap, RequestShowContainerReason.Filter].includes(sRequestShowContainerReason)) {
			return true;
		}



		return BaseValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	/**
	 * @deprecated As of version 1.137
	 */
	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		return oValueHelp.getPayload()?.shouldOpenOnClick;
	};

	/**
	 * @deprecated As of version 1.137
	 */
	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		return oValueHelp.getPayload()?.shouldOpenOnFocus;
	};


	/**
	 * @deprecated As of version 1.137
	 */
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

/*!
 * ${copyright}
 */



sap.ui.define([
	"../ValueHelp.delegate",
	'sap/ui/mdc/enums/RequestShowContainerReason'
], function(
	BaseValueHelpDelegate,
	RequestShowContainerReason
) {
	"use strict";

	/**
	 *  @deprecated since 1.121.0
	 */
	const bLegacyEnabled = new URLSearchParams(window.location.search).get("legacy") === "true"	|| false;

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
		/**
		 *  @deprecated since 1.121.0
		 */
		if (bLegacyEnabled) {
			return oContainer.getOpensOnClick();
		}
		return oValueHelp.getPayload()?.shouldOpenOnClick;
	};

	/**
	 * @deprecated As of version 1.137
	 */
	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		/**
		 *  @deprecated since 1.121.0
		 */
		if (bLegacyEnabled) {
			return oContainer.getOpensOnFocus();
		}
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

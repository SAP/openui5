/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate"
], function(
	BaseValueHelpDelegate
) {
	"use strict";

	/**
	 *  @deprecated since 1.121.0
	 */
	const bLegacyEnabled = new URLSearchParams(window.location.search).get("legacy") === "true"	|| false;

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		/**
		 *  @deprecated since 1.121.0
		 */
		if (bLegacyEnabled) {
			return oContainer.getOpensOnClick();
		}
		return oValueHelp.getPayload()?.shouldOpenOnClick;
	};

	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		/**
		 *  @deprecated since 1.121.0
		 */
		if (bLegacyEnabled) {
			return oContainer.getOpensOnFocus();
		}
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

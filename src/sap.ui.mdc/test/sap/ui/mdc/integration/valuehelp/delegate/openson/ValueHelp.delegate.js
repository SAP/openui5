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

	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		/**
		 *  @deprecated since 1.121.0
		 */
		if (oContainer.getMetadata().hasProperty("opensOnClick")) {
			return oContainer.getOpensOnClick();
		}

		return oValueHelp.getPayload()?.shouldOpenOnClick;
	};

	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		/**
		 *  @deprecated since 1.121.0
		 */
		if (oContainer.getMetadata().hasProperty("opensOnFocus")) {
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

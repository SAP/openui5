/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Base functionality for all change handler which provides some reuse methods
	 * @alias sap.ui.fl.changeHandler.Base
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 *
	 */
	var Base = {};

	/**
	 * Sets a text in a change.
	 *
	 * @param {object} oChange - change object
	 * @param {string} sKey - text key
	 * @param {string} sText - text value
	 * @param {string} sType - translation text type e.g. XBUT, XTIT, XTOL, XFLD
	 *
	 * @public
	 */
	Base.setTextInChange = function(oChange, sKey, sText, sType) {
		if (!oChange.texts) {
			oChange.texts = {};
		}
		if (!oChange.texts[sKey]) {
			oChange.texts[sKey] = {};
		}
		oChange.texts[sKey].value = sText;
		oChange.texts[sKey].type = sType;
	};

	/**
	 * Creates a return object. Should be called in case the change is not applicable.
	 * @param {string} sNotApplicableCauseMessage - Indicates reason why the change is not applicable
	 * @param {boolean} bAsync - Determines whether a not-applicable object should be thrown (synchronous) or an asynchronous promise reject with the same object should be returned
	 * @returns {promise} Returns rejected promise with not-applicable message inside
	 */
	Base.markAsNotApplicable = function(sNotApplicableCauseMessage, bAsync) {
		var oReturn = { message: sNotApplicableCauseMessage };
		if (!bAsync) {
			throw oReturn;
		}
		return Promise.reject(oReturn);
	};

	return Base;
}, /* bExport= */true);

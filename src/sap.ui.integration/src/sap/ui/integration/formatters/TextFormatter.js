/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/strings/formatMessage"
], function (
	formatMessage
) {
	"use strict";

	/**
	 * Contains functions that can format text
	 *
	 * @namespace
	 * @private
	 */
	var oTextFormatters = {

		/**
		 * @param {string} sPattern A pattern string
		 * @param {any[]} aValues The values to be used instead of the placeholders
		 * @returns {string} The formatted text
		 */
		text: function (sPattern, aValues) {
			return formatMessage(sPattern, aValues);
		}

	};

	return oTextFormatters;
});
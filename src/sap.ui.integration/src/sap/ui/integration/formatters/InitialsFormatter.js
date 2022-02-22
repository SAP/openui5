/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * Contains functions that create initials from a name
	 *
	 * @namespace
	 * @private
	 */
	var oInitialsFormatters = {

		/**
		 * @param {string} sValue A string
		 * @param {number} iLength how many characters will be visualized
		 * @returns {string} The initials from the provided string, if iLength is 2 it will return the first and last character
		 */
		initials: function (sValue, iLength) {
			var aValue = sValue.split(' '),
				iLength = !iLength ? 2 : iLength,
				sInitials = '';

			aValue.forEach(function(element) {
				sInitials += element.substring(0,1);
			});

			sInitials = iLength === 2 ? sInitials.charAt(0) + sInitials.charAt(sInitials.length - 1) : sInitials.substring(0,iLength);
			return sInitials.toUpperCase();
		}

	};

	return oInitialsFormatters;
});
sap.ui.define(
	[],
	function () {

	"use strict";

	return {

		/**
		 * Converts the timestamp back to date
		 * @public
		 * @param {string} sDateTimeUTC a date in UTC string format
		 * @returns {object} new date object created from sDateTimeUTC string
		 */
		utcToLocalDateTime : function (sDateTimeUTC) {

			if (!sDateTimeUTC) {
				return null;
			}

			return new Date(sDateTimeUTC);
		},

		/**
		 * Adds proper path prefix to the image URL (in the model the images are
		 * stored with their relative path to the application); if the image is
		 * an icon, the formatting is skipped
		 * @public
		 * @param {string} sImage an image URL
		 * @returns {string} prefixed image URL (if necessary)
		 */
		fixImagePath : function (sImage) {
			if (sImage && sImage.substr(0, 11) !== "sap-icon://") {
				sImage = this.imagePath + sImage;

			}
			return sImage;
		}
	};

});
/*!
 * ${copyright}
 */

// Provides type sap.ui.core.format.DateFormatTimezoneDisplay.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Configuration options for the <code>showTimezone</code> format option
	 * of <code>DateFormat#getDateTimeWithTimezoneInstance</code>.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.99.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 * @alias sap.ui.core.format.DateFormatTimezoneDisplay
	 */
	var DateFormatTimezoneDisplay = {

		/**
		 * Add the IANA timezone ID to the format output.
		 * @public
		 */
		Show : "Show",

		/**
		 * Do not add the IANA timezone ID to the format output.
		 * @public
		 */
		Hide : "Hide",

		/**
		 * Only output the IANA timezone ID.
		 * @public
		 */
		Only : "Only"
	};

	return DateFormatTimezoneDisplay;

}, /* bExport= */ true);

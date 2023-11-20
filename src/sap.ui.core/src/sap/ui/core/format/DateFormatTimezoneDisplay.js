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
	 * @alias sap.ui.core.format.DateFormatTimezoneDisplay
	 * @deprecated As of version 1.101, replaced by
	 *   <code>DateFormat#getDateTimeWithTimezoneInstance</code> with the <code>showDate</code>,
	 *   <code>showTime</code> and <code>showTimezone</code> format options.
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

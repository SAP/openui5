/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.DateRange.
sap.ui.define(['sap/ui/core/Element', './library', 'sap/ui/unified/calendar/CalendarUtils'],
	function(Element, library, CalendarUtils) {
	"use strict";



	/**
	 * Constructor for a new DateRange.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Date range for use in DatePicker
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.ui.unified.DateRange
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateRange = Element.extend("sap.ui.unified.DateRange", /** @lends sap.ui.unified.DateRange.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Start date for a date range. This must be a JavaScript date object.
			 */
			startDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * End date for a date range. If empty only a single date is presented by this DateRange element. This must be a JavaScript date object.
			 */
			endDate : {type : "object", group : "Misc", defaultValue : null}
		}
	}});

	///**
	// * This file defines behavior for the control,
	// */

	DateRange.prototype.setStartDate = function(oDate){

		if (oDate) {
			CalendarUtils._checkJSDateObject(oDate);

			var iYear = oDate.getFullYear();
			CalendarUtils._checkYearInValidRange(iYear);
		}

		this.setProperty("startDate", oDate);

		return this;

	};

	DateRange.prototype.setEndDate = function(oDate){

		if (oDate) {
			CalendarUtils._checkJSDateObject(oDate);

			var iYear = oDate.getFullYear();
			CalendarUtils._checkYearInValidRange(iYear);
		}

		this.setProperty("endDate", oDate);

		return this;

	};

	return DateRange;

});

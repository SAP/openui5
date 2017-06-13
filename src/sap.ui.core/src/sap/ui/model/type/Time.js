/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['./Date', 'sap/ui/core/format/DateFormat'],
	function(Date, DateFormat) {
	"use strict";


	/**
	 * Constructor for a Time type.
	 *
	 * @class
	 * This class represents time simple types.
	 *
	 * @extends sap.ui.model.type.Date
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.DateFormat.getTimeInstance DateFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of options used to create a second <code>DateFormat</code> object for conversions between
	 *           string values in the data source (e.g. model) and <code>Date</code>. This second format object is used to convert from a model <code>string</code> to <code>Date</code> before
	 *           converting the <code>Date</code> to <code>string</code> with the primary format object. Vice versa, this 'source' format is also used to format an already parsed
	 *           external value (e.g. user input) into the string format that is expected by the data source.
	 *           For a list of all available options, see {@link sap.ui.core.format.DateFormat.getTimeInstance DateFormat}.
	 *           In case an empty object is given, the default is the ISO date notation (yyyy-MM-dd).
	 * @param {object} [oConstraints] Value constraints. Supports the same kind of constraints as its base type Date, but note the different format options (Date vs. Time).
	 * @alias sap.ui.model.type.Time
	 */
	var Time = Date.extend("sap.ui.model.type.Time", /** @lends sap.ui.model.type.Time.prototype */ {

		constructor : function () {
			Date.apply(this, arguments);
			this.sName = "Time";
		}

	});

	/**
	 * Create formats used by this type
	 * @private
	 */
	Time.prototype._createFormats = function() {
		this.oOutputFormat = DateFormat.getTimeInstance(this.oFormatOptions);
		if (this.oFormatOptions.source) {
			this.oInputFormat = DateFormat.getTimeInstance(this.oFormatOptions.source);
		}
	};

	return Time;

});

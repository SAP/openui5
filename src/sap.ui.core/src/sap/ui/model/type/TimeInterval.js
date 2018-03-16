/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['./DateInterval', 'sap/ui/core/format/DateFormat'],
	function(DateInterval, DateFormat) {
	"use strict";


	/**
	 * Constructor for a Time interval type.
	 *
	 * @class
	 * This class represents the Time interval composite type.
	 *
	 * @extends sap.ui.model.type.DateInterval
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.DateFormat.getTimeInstance DateFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of options used to create a second <code>DateFormat</code> object for conversions between string values
	 *           in the data source (e.g. model) and <code>Date</code>. This second format object is used to convert both of the interval parts from a model
	 *           <code>string</code> to <code>Date</code> before converting both of the <code>Date</code>(s) to <code>string</code> with the primary format object.
	 *           Vice versa, this 'source' format is also used to format the already parsed external value (e.g. user input) into the string format that is expected
	 *           by the data source.
	 *           For a list of all available options, see {@link sap.ui.core.format.DateFormat.getTimeInstance DateFormat}.
	 * @param {object} [oConstraints] Value constraints
	 * @param {Date|String} [oConstraints.minimum] Smallest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @param {Date|String} [oConstraints.maximum] Largest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @alias sap.ui.model.type.TimeInterval
	 */
	var TimeInterval = DateInterval.extend("sap.ui.model.type.TimeInterval", /** @lends sap.ui.model.type.DateTimeInterval.prototype */ {

		constructor : function () {
			DateInterval.apply(this, arguments);
			this.sName = "TimeInterval";
		}

	});

	/**
	 * Creates formats used by this type
	 * @private
	 */
	TimeInterval.prototype._createFormats = function() {
		// mark the 'interval' flag
		this.oFormatOptions.interval = true;
		this.oOutputFormat = DateFormat.getTimeInstance(this.oFormatOptions);
		if (this.oFormatOptions.source) {
			this.oInputFormat = DateFormat.getTimeInstance(this.oFormatOptions.source);
		}
	};


	return TimeInterval;

});

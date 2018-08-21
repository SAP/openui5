/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/type/DateTimeBase"
], function (Log, DateTimeBase) {
	"use strict";

	/**
	 * Adjusts the constraints for DateTimeBase.
	 *
	 * @param {sap.ui.model.odata.type.DateTime} oType
	 *   the type
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 * @returns {object}
	 *   the constraints adjusted for DateTimeBase
	 */
	function adjustConstraints(oType, oConstraints) {
		var oAdjustedConstraints = {};

		if (oConstraints) {
			switch (oConstraints.displayFormat) {
			case "Date":
				oAdjustedConstraints.isDateOnly = true;
				break;
			case undefined:
				break;
			default:
				Log.warning("Illegal displayFormat: " + oConstraints.displayFormat,
					null, oType.getName());
			}
			oAdjustedConstraints.nullable = oConstraints.nullable;
		}
		return oAdjustedConstraints;
	}

	/**
	 * Constructor for a primitive type <code>Edm.DateTime</code>.
	 *
	 * @class This class represents the OData V2 primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.DateTime</code></a>.
	 *
	 * If you want to display a date and a time, prefer {@link
	 * sap.ui.model.odata.type.DateTimeOffset}, specifically designed for this purpose.
	 *
	 * Use <code>DateTime</code> with the SAP-specific annotation <code>display-format=Date</code>
	 * (resp. the constraint <code>displayFormat: "Date"</code>) to display only a date.
	 *
	 * In {@link sap.ui.model.odata.v2.ODataModel} this type is represented as a
	 * <code>Date</code>. With the constraint <code>displayFormat: "Date"</code>, the time zone is
	 * UTC and the time part is ignored, otherwise it is a date/time value in local time.
	 *
	 * @extends sap.ui.model.odata.type.DateTimeBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.DateTime
	 * @param {object} [oFormatOptions]
	 *   format options as defined in {@link sap.ui.core.format.DateFormat}
	 * @param {object} [oConstraints]
	 *   constraints; {@link sap.ui.model.odata.type.DateTimeBase#validateValue validateValue}
	 *   throws an error if any constraint is violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted
	 * @param {string} [oConstraints.displayFormat=undefined]
	 *   may be "Date", in this case only the date part is used, the time part is always 00:00:00
	 *   and the time zone is UTC to avoid time-zone-related problems
	 * @public
	 * @since 1.27.0
	 */
	var DateTime = DateTimeBase.extend("sap.ui.model.odata.type.DateTime", {
				constructor : function (oFormatOptions, oConstraints) {
					DateTimeBase.call(this, oFormatOptions, adjustConstraints(this, oConstraints));
				}
			}
		);

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	DateTime.prototype.getName = function () {
		return "sap.ui.model.odata.type.DateTime";
	};

	return DateTime;
});
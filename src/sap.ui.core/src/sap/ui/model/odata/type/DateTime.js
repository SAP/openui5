/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/odata/type/DateTimeBase"
], function (Log, UI5Date, DateTimeBase) {
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
	 * UTC, and all time related parts (hours, minutes, etc.) are set to zero;
	 * otherwise it is a date/time value in local time.
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

	// @override
	// @see sap.ui.model.SimpleType#getConstraints
	DateTime.prototype.getConstraints = function () {
		var oConstraints = DateTimeBase.prototype.getConstraints.call(this);

		if (oConstraints.isDateOnly) {
			oConstraints.displayFormat = "Date";
			delete oConstraints.isDateOnly;
		}

		return oConstraints;
	};

	/**
	 * Returns the ISO string for the given model value.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oModelValue
	 *   The model value, as returned by {@link #getModelValue}
	 * @returns {string|null}
	 *   A timestamp or date string according to ISO 8601 if the <code>displayFormat: "Date"</code>
	 *   constraint is set, or <code>null</code> if the given model value is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	DateTime.prototype.getISOStringFromModelValue = function (oModelValue) {
		if (!oModelValue) {
			return null;
		}

		var sISOString = oModelValue.toISOString();
		return this.oConstraints && this.oConstraints.isDateOnly ? sISOString.split("T")[0] : sISOString;
	};

	/**
	 * Gets the model value according to this type's constraints and format options for the given
	 * date object which represents a timestamp in the configured time zone. Validates the resulting
	 * value against the constraints of this type instance.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oDate
	 *   The date object considering the configured time zone. Must be created via
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance}
	 * @returns {Date|module:sap/ui/core/date/UI5Date|null}
	 *   The model representation for the given Date
	 * @throws {Error}
	 *   If the given date object is not valid or does not consider the configured time zone
	 * @throws {sap.ui.model.ValidateException}
	 *   If the constraints of this type instance are violated
	 *
	 * @public
	 * @see {@link sap.ui.core.Configuration#getTimezone}
	 * @since 1.111.0
	 */
	DateTime.prototype.getModelValue = function (oDate) {
		var oResult = this._getModelValue(oDate);

		this.validateValue(oResult);

		return oResult;
	};

	/**
	 * Returns the model value for the given ISO string.
	 *
	 * @param {string|null} sISOString
	 *   A string according to ISO 8601, as returned by {@link #getISOStringFromModelValue}
	 * @returns {Date|module:sap/ui/core/date/UI5Date|null}
	 *   The model representation for the given ISO string for this type,
	 *   or <code>null</code> if the given ISO string is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	DateTime.prototype.getModelValueFromISOString = function (sISOString) {
		if (!sISOString) {
			return null;
		}

		return UI5Date.getInstance(sISOString);
	};

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
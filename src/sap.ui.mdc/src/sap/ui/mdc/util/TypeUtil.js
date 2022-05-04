/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/mdc/enum/BaseType',
		'sap/base/util/ObjectPath',
		'sap/ui/model/SimpleType',
		'sap/ui/mdc/util/DateUtil'
], function(BaseType, ObjectPath, SimpleType, DateUtil) {
	"use strict";

	var sDateTimePattern = "yyyy-MM-ddTHH:mm:ssZ"; // milliseconds missing
	var sDatePattern = "yyyy-MM-dd";
	var sTimePattern = "HH:mm:ss";

	/**
	 * Provides mapping functionality for model dependent data types to base types. Extend this object in your project to customize behaviour depending on model usage.
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.79
	 * @since 1.79.0
	 * @alias sap.ui.mdc.util.TypeUtil
	 */
	var TypeUtil = {

		/**
		* Maps type names to real type names
		*
		* If a real type has already been defined, this type is returned.
		*
		* @param {string} sType Given model specific type
		* @returns {string} Data type name
		*/
		getDataTypeClassName: function(sType) {

			var mTypes = {
				"Boolean": "sap.ui.model.type.Boolean",
				"Currency": "sap.ui.model.type.Currency",
				"Date": "sap.ui.model.type.Date",
				"DateTime": "sap.ui.model.type.DateTime",
				"Float": "sap.ui.model.type.Float",
				"Integer": "sap.ui.model.type.Integer",
				"String": "sap.ui.model.type.String",
				"Time": "sap.ui.model.type.Time",
				"Unit": "sap.ui.model.type.Unit"
			};

			if (mTypes[sType]) {
				sType = mTypes[sType];
			}

			return sType;
		},

		/**
		 * To know what control is rendered the <code>Field</code> or </code>FilterField</code>
		 * needs to know if the type represents a date, a number or something else in a normalized way.
		 *
		 * As default <code>string</code> is returned.
		 *
		 * @param {string} sType Given type string or sap.ui.model.SimpleType
		 * @param {object} oFormatOptions Used <code>FormatOptions</code>
		 * @param {object} oConstraints Used <code>Constraints</code>
		 * @returns {sap.ui.mdc.enum.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getBaseType: function(sType, oFormatOptions, oConstraints) {

			switch (sType) {
				case "sap.ui.model.type.Date":
					return BaseType.Date;

				case "sap.ui.model.type.DateTime":
					return BaseType.DateTime;

				case "sap.ui.model.type.Time":
					return BaseType.Time;

				case "sap.ui.model.type.Boolean":
					return BaseType.Boolean;

				case "sap.ui.model.type.Unit":
				case "sap.ui.model.type.Currency":
					if (!oFormatOptions || ((!oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) && (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber))) {
						return BaseType.Unit;
					} else if (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber) {
						return BaseType.Numeric; // only number to show
					} else {
						return BaseType.String; // only unit to show
					}

				case "sap.ui.model.type.Integer":
				case "sap.ui.model.type.Float":
					return BaseType.Numeric;

				default:
					return BaseType.String;
			}
		},

		/* Convenience method to retrieve baseType for given SimpleType
		 *
		 * @param {sap.ui.model.SimpleType} oType Given type string or sap.ui.model.SimpleType
		 * @returns {string} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
		 * @public
		 */
		getBaseTypeForType: function(oType) {
			return this.getBaseType(oType.getMetadata && oType.getMetadata().getName(), oType.getFormatOptions(), oType.getConstraints());
		},

		/**
		 * Returns a dataType class based on given object path, formatoptions and constraints
		 *
		 * @param {string} sDataType Class path as string where each name is separated by '.'
		 * @returns {sap.ui.model.SimpleType} creates returns a dataType class
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getDataTypeClass: function(sDataType) {
			var TypeClass = ObjectPath.get(this.getDataTypeClassName(sDataType) || "");
			if (!TypeClass) {
				throw new Error("DataType '" + sDataType + "' cannot be determined");
			}

			return TypeClass;
		},

		/**
		 * Returns a dataType instance based on given object path, formatoptions and constraints
		 *
		 * @param {string} sDataType Class path as string where each name is separated by '.'
  		 * @param {object} [oFormatOptions] formatoptions for the dataType
 		 * @param {object} [oConstraints] constraints for the dataType
		 * @returns {sap.ui.model.SimpleType} creates returns an instance of the resolved dataType
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getDataTypeInstance: function(sDataType, oFormatOptions, oConstraints) {
			var TypeClass = this.getDataTypeClass(sDataType);
			return new TypeClass(oFormatOptions, oConstraints);
		},

		/**
		 * returns a type mapping configuration object for a given type string or simpleType
		 *
		 * @param {string|sap.ui.model.SimpleType} vType Given dataType as string or type
		 * @param {object} [oFormatOptions] formatoptions for the given dataType
 		 * @param {object} [oConstraints] constraints for the given dataType
		 * @returns {sap.ui.mdc.TypeConfig} output returns typeConfig object
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getTypeConfig: function (vType, oFormatOptions, oConstraints) {

			var oType = this._normalizeType(vType, oFormatOptions, oConstraints);

			return {
				className: oType.getMetadata().getName(),
				typeInstance: oType,
				baseType: this.getBaseTypeForType(oType)
			};
		},

		/**
		 * converts a string into a type-based value
		 *
		 * The value is not checked for validity. The used values must fit to the used basic type.
		 *
		 * <b>Note:</b> Number types are not converted, the number conversion is done by the Flex handling.
		 *
		 * @param {string} sValue stringified value
		 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
		 * @param {object} [oFormatOptions] formatoptions for the dataType
 		 * @param {object} [oConstraints] constraints for the dataType
		 * @returns {object} converted value
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.103.0
		 */
		internalizeValue: function (sValue, vType, oFormatOptions, oConstraints) {
			var oTypeInstance = this._normalizeType(vType, oFormatOptions, oConstraints);
			var sBaseType = this.getBaseTypeForType(oTypeInstance);
			switch (sBaseType) {
				case BaseType.DateTime:
					return DateUtil.stringToType(sValue, oTypeInstance, sDateTimePattern);

				case BaseType.Date:
					return DateUtil.stringToType(sValue, oTypeInstance, sDatePattern);

				case BaseType.Time:
					return DateUtil.stringToType(sValue, oTypeInstance, sTimePattern);

				case BaseType.Boolean:
					return sValue;

				case BaseType.Numeric:
					return sValue;

				default:
					// just use type to convert
					return oTypeInstance.parseValue(sValue, "string");
			}
		},

		/**
		 * converts a value into a string using a designated type
		 *
		 * The value is not checked for validity. The used values must fit to the used basic type.
		 *
		 * <b>Note:</b> Number types are not converted, the number conversion is done by the Flex handling.
		 *
		 * @param {object} vValue typed value
		 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
		 * @param {object} [oFormatOptions] formatoptions for the dataType
 		 * @param {object} [oConstraints] constraints for the dataType
		 * @returns {string} converted value
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.103.0
		 */
		externalizeValue: function (vValue, vType, oFormatOptions, oConstraints) {
			var oTypeInstance = this._normalizeType(vType, oFormatOptions, oConstraints);
			var sBaseType = this.getBaseTypeForType(oTypeInstance);
			switch (sBaseType) {
				case BaseType.DateTime:
					return DateUtil.typeToString(vValue, oTypeInstance, sDateTimePattern);

				case BaseType.Date:
					return DateUtil.typeToString(vValue, oTypeInstance, sDatePattern);

				case BaseType.Time:
					return DateUtil.typeToString(vValue, oTypeInstance, sTimePattern);

				case BaseType.Boolean:
					return vValue;

				case BaseType.Numeric:
					return vValue;

				default:
					// just use type to convert
					return oTypeInstance.formatValue(vValue, "string");
			}
		},

		_normalizeType: function (vType, oFormatOptions, oConstraints) {
			if (vType instanceof SimpleType) { // simpletype
				return vType;
			}
			return this.getDataTypeInstance(vType, oFormatOptions, oConstraints); // string
		}
	};

	return TypeUtil;

});

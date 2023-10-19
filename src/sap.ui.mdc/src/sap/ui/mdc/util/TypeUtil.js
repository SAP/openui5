/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/mdc/enums/BaseType',
		'sap/base/util/ObjectPath',
		'sap/base/util/isEmptyObject',
		'sap/base/util/merge',
		'sap/ui/model/SimpleType',
		'sap/ui/mdc/util/DateUtil'
], function(BaseType, ObjectPath, isEmptyObject, merge, SimpleType, DateUtil) {
	"use strict";

	// var sDateTimePattern = "yyyy-MM-ddTHH:mm:ssZ"; // milliseconds missing
	const sDatePattern = "yyyy-MM-dd";
	const sTimePattern = "HH:mm:ss";

	/**
	 * Provides mapping functionality for model dependent data types to base types. Extend this object in your project to customize behaviour depending on model usage.
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 * @experimental As of version 1.79
	 * @since 1.79.0
	 * @deprecated since 1.115.0 - please see {@link module:sap/ui/mdc/BaseDelegate.getTypeMap}
	 * @alias sap.ui.mdc.util.TypeUtil
	 */
	const TypeUtil = {

		/**
		* Maps type names to real type names
		*
		* If a real type has already been defined, this type is returned.
		*
		* @param {string} sType Given model specific type
		* @returns {string} Data type name
		*/
		getDataTypeClassName: function(sType) {

			const mTypes = {
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
		 * @returns {sap.ui.mdc.enums.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
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
		 * <b>Note:</b> The module of the data type needs to be loaded before.
		 *
		 * @param {string} sDataType Class path as string where each name is separated by '.'
		 * @returns {function(new: sap.ui.model.SimpleType)} Returns a dataType class
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getDataTypeClass: function(sDataType) {
			const sTypeName = this.getDataTypeClassName(sDataType);
			const TypeClass = sTypeName
				? sap.ui.require(sTypeName.replace(/\./g, "/")) || ObjectPath.get(sTypeName)
				: undefined;
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
			const TypeClass = this.getDataTypeClass(sDataType);
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

			const oType = this._normalizeType(vType, oFormatOptions, oConstraints);

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
			const oTypeInstance = this._normalizeType(vType, oFormatOptions, oConstraints);
			const sBaseType = this.getBaseTypeForType(oTypeInstance);
			switch (sBaseType) {
				case BaseType.DateTime:
					return DateUtil.ISOToType(sValue, oTypeInstance, sBaseType);

				case BaseType.Date:
					if (sValue.indexOf("T") >= 0) { // old variant with DateTime for DateValues
						sValue = sValue.substr(0, sValue.indexOf("T")); // just take the date part
					}
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
			const oTypeInstance = this._normalizeType(vType, oFormatOptions, oConstraints);
			const sBaseType = this.getBaseTypeForType(oTypeInstance);
			switch (sBaseType) {
				case BaseType.DateTime:
					return DateUtil.typeToISO(vValue, oTypeInstance, sBaseType);

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
		},

		/**
		 * Returns a instance of a unit or currency type based on an existing type.
		 *
		 * This type is used fur the number and unit part of a field if the field itself is using a unit or currency type.
		 *
		 * @param {sap.ui.model.CompositeType} oOriginalType Original data type used by field
  		 * @param {boolean} [bShowNumber] number should be shown
 		 * @param {boolean} [bShowMeasure] unit should be shown
		 * @returns {sap.ui.model.CompositeType} creates returns an instance of the resolved dataType
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		 getUnitTypeInstance: function(oOriginalType, bShowNumber, bShowMeasure) {
			const TypeClass = oOriginalType.getMetadata().getClass();
			const oFormatOptions = merge({}, oOriginalType.getFormatOptions()); // for Unit/Currency always set - do not manipulate original object
			const oConstraints = isEmptyObject(oOriginalType.getConstraints()) ? undefined : merge({}, oOriginalType.getConstraints()); // do not manipulate original object

			this._adjustUnitFormatOptions(oFormatOptions, bShowNumber, bShowMeasure);

			return new TypeClass(oFormatOptions, oConstraints);
		},

		_adjustUnitFormatOptions: function (oFormatOptions, bShowNumber, bShowMeasure) {
			oFormatOptions.showNumber = bShowNumber;
			oFormatOptions.showMeasure = bShowMeasure;
			oFormatOptions.strictParsing = true; // do not allow to enter unit in number field
		},

		/**
		 * If the <code>Field</code> control is used, the used data type comes from the binding.
		 * Some data types (like Currency or Unit) might need some initialization. To initialize
		 * To initialize the internal ("cloned") Type later on, the result of this function
		 * is provided to <code>initializeInternalType</code>.
		 *
		 * @param {sap.ui.model.SimpleType} oType Type from binding
		 * @param {any} vValue Given value
		 * @returns {null|object} Information needed to initialize internal type
		 * @private
		 * @ui5-restricted sap.ui.mdc.field.FieldBase
		 * @since 1.115.0
		 */
		initializeTypeFromValue: function(oType, vValue) {

			return {}; // to mark initialization as finished as not needed for normal types

		},

		/**
		 * This function initializes the internal ("cloned") Type.
		 *
		 * @param {sap.ui.model.SimpleType} oType original Type (e.g. from Binding)
		 * @param {object} oTypeInitialization Information needed to initialize internal type (created in <code>initializeTypeFromValue</code>)
		 * @private
		 * @ui5-restricted sap.ui.mdc.field.FieldBase
		 * @since 1.115.0
		 */
		initializeInternalType: function(oType, oTypeInitialization) {

		}
	};

	return TypeUtil;

});

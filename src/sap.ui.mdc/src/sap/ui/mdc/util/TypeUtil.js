/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/mdc/enum/BaseType',
		'sap/base/util/ObjectPath'
	], function(BaseType, ObjectPath) {
	"use strict";

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
		 * @param {string} vType Given type string or sap.ui.model.SimpleType
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
					if (!oFormatOptions || !oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) {
						return BaseType.Unit;
					} else {
						return BaseType.Numeric;
					}
					break;

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
  		 * @param {object} formatOptions formatOptions for the dataType
 		 * @param {object} constraints constraints for the dataType
		 * @returns {sap.ui.model.SimpleType} creates returns an instance of the resolved dataType
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getDataTypeInstance: function(sDataType, formatOptions, constraints) {
			var TypeClass = this.getDataTypeClass(sDataType);
			return new TypeClass(formatOptions, constraints);
		},

		/**
		 * returns a type mapping configuration object for a given type string or simpleType
		 *
		 * @param {string|sap.ui.model.SimpleType} vType Given dataType as string or type
		 * @returns {sap.ui.mdc.TypeConfig} output returns typeConfig object
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getTypeConfig: function (vType, formatOptions, constraints) {

			var oType, sDataType;

			if (vType instanceof sap.ui.model.SimpleType) {
				oType = vType;
			} else {
				var sDataTypeClass = this.getDataTypeClassName(vType);
				sDataType = sDataTypeClass ? vType : undefined;
				oType = this.getDataTypeInstance(sDataTypeClass || vType, formatOptions, constraints);
			}

			return {
				className: sDataType,
				typeInstance: oType,
				baseType: this.getBaseTypeForType(oType)
			};
		}
	};

	return TypeUtil;

}, /* bExport= */ true);

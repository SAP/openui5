/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/field/FieldBaseDelegate',
	'sap/ui/model/type/String'
	], (
	BaseType,
	FieldDisplay,
	FilterOperatorUtil,
	FieldBaseDelegate,
	StringType
) => {
	"use strict";

	/**
	 * Helper functions for {@link sap.ui.mdc.field.ConditionType ConditionType} and {@link sap.ui.mdc.field.ConditionsType ConditionsType}.
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.121.0
	 * @alias sap.ui.mdc.field.ConditionTypeUtils
	 *
	 * @private
	 */
	return function() {

		this._sDefaultBaseType = BaseType.String;

		this._getValueType = function() {

			let oType = this.oFormatOptions.valueType;
			if (!oType) {
				if (this._sDefaultBaseType === BaseType.String) {
					// no type provided -> use string type as default
					oType = this._getDefaultType();
				} else {
					throw new Error("Type missing"); // DynamicDateRangeConditionsType
				}
			}

			return oType;

		};

		this._getAdditionalValueType = function() {

			let oType = this.oFormatOptions.additionalValueType;
			if (!oType) {
				// no type provided -> use string type as default
				oType = this._getDefaultType();
			}

			return oType;

		};

		this._getOriginalType = function() {

			return this.oFormatOptions.originalDateType;

		};

		this._getAdditionalType = function() {

			return this.oFormatOptions.additionalType;

		};

		this._getDefaultType = function() {

			if (!this._oDefaultType) {
				this._oDefaultType = new StringType();
			}

			return this._oDefaultType;

		};

		this._getBaseType = function(oType) {

			const sType = oType.getMetadata().getName();
			const oFormatOptions = oType.getFormatOptions();
			const oConstraints = oType.getConstraints();

			return this._getBaseTypeForValueType({ name: sType, formatOptions: oFormatOptions, constraints: oConstraints });

		};

		this._getBaseTypeForValueType = function(oValueType) {

			const oDelegate = this._getDelegate();
			const oField = this.oFormatOptions.control;
			let sBaseType = oDelegate.getTypeMap(oField).getBaseType(oValueType.name, oValueType.formatOptions, oValueType.constraints);

			if (sBaseType === BaseType.Unit) {
				sBaseType = BaseType.Numeric;
			}

			return sBaseType;

		};

		this._getMaxConditions = function() {

			let iMaxConditions = 1;

			if (this.oFormatOptions.hasOwnProperty("maxConditions")) {
				iMaxConditions = this.oFormatOptions.maxConditions;
			}

			return iMaxConditions;

		};

		this._getMultipleLines = function() {


			if (this.oFormatOptions.hasOwnProperty("multipleLines")) {
				return this.oFormatOptions.multipleLines;
			}

			return false;

		};

		this._getDisplay = function() {

			let sDisplay = this.oFormatOptions.display;
			if (!sDisplay) {
				sDisplay = FieldDisplay.Value;
			}

			return sDisplay;

		};

		this._getKeepValue = function() {


			if (this.oFormatOptions.hasOwnProperty("keepValue")) {
				return this.oFormatOptions.keepValue;
			}

			return null;

		};

		this._getNoFormatting = function() {

			let bNoFormatting = false;

			if (this.oFormatOptions.hasOwnProperty("noFormatting")) {
				bNoFormatting = this.oFormatOptions.noFormatting;
			}

			return bNoFormatting;

		};

		this._isUnit = function(oType) {

			if (this._isCompositeType(oType)) {
				const oFormatOptions = oType.getFormatOptions();
				const bShowMeasure = !oFormatOptions || !oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure;
				const bShowNumber = !oFormatOptions || !oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber;
				const bShowTimezone = !oFormatOptions || !oFormatOptions.hasOwnProperty("showTimezone") || oFormatOptions.showTimezone; // handle timezone as unit
				const bShowDate = !oFormatOptions || !oFormatOptions.hasOwnProperty("showDate") || oFormatOptions.showDate;
				const bShowTime = !oFormatOptions || !oFormatOptions.hasOwnProperty("showTime") || oFormatOptions.showTime;
				if ((bShowMeasure && !bShowNumber) || (bShowTimezone && !bShowDate && !bShowTime)) {
					return true;
				}
			}

			return false;

		};

		this._isCompositeType = function(oType) {

			return oType && oType.isA("sap.ui.model.CompositeType");

		};

		this._getCompositeTypes = function() {

			return this.oFormatOptions.compositeTypes;

		};

		this._getAdditionalCompositeTypes = function() {

			return this.oFormatOptions.ASdditionalCompositeTypes;

		};

		this._getOperators = function() {

			let aOperators = this.oFormatOptions.operators;
			if (!aOperators || aOperators.length === 0) {
				aOperators = FilterOperatorUtil.getOperatorsForType(this._getBaseType(this._getValueType()));
			}

			return aOperators;

		};

		this._getDefaultOperator = function(aOperators, oType) {

			const sDefaultOperatorName = this.oFormatOptions.defaultOperatorName;
			let oOperator;
			if (sDefaultOperatorName) {
				oOperator = FilterOperatorUtil.getOperator(sDefaultOperatorName);
			} else {
				oOperator = FilterOperatorUtil.getDefaultOperator(this._getBaseType(oType));
			}

			if (oOperator && aOperators.indexOf(oOperator.name) < 0) {
				// default operator not valid -> cannot use -> use first include-operator
				for (let i = 0; i < aOperators.length; i++) {
					oOperator = FilterOperatorUtil.getOperator(aOperators[i]);
					if (oOperator.exclude || !oOperator.hasRequiredValues()) {
						oOperator = undefined;
					} else {
						break;
					}
				}
			}

			return oOperator;

		};

		this._getHideOperator = function() {


			if (this.oFormatOptions.hasOwnProperty("hideOperator")) {
				return this.oFormatOptions.hideOperator;
			} else {
				const aOperators = this._getOperators();
				if (aOperators.length === 1) {
					const oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
					return !oOperator || oOperator.isSingleValue();
				} else {
					return false;
				}
			}

		};

		this._fnReturnPromise = function(oPromise) {

			if (oPromise instanceof Promise && this.oFormatOptions.asyncParsing) {
				this.oFormatOptions.asyncParsing(oPromise);
			}

			return oPromise;

		};

		this._getDelegate = function() {

			let oDelegate = this.oFormatOptions.delegate;

			if (!oDelegate) {
				oDelegate = FieldBaseDelegate;
			}

			return oDelegate;

		};

	};

});
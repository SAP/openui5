/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/field/content/DefaultContent',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/enums/OperatorName',
	'sap/ui/mdc/util/DateUtil',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/core/library',
	'sap/ui/model/Filter'
], (
	DefaultContent,
	BaseType,
	OperatorValueType,
	OperatorName,
	DateUtil,
	FilterOperatorUtil,
	coreLibrary,
	Filter) => {
	"use strict";

	const { CalendarType } = coreLibrary;
	let StandardDynamicDateRangeKeys;
	let DynamicDateFormat;

	/**
	 * Object-based definition of the date content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.DateContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 */
	const DateContent = Object.assign({}, DefaultContent, {
		getEditMultiLine: function() {
			return [null];
		},
		getEdit: function() {
			return ["sap/m/DynamicDateRange",
				"sap/ui/mdc/condition/OperatorDynamicDateOption",
				"sap/ui/mdc/field/DynamicDateRangeConditionsType",
				"sap/m/library",
				"sap/m/DynamicDateFormat"
			];
		},
		getEditOperator: function() {
			return {
				[OperatorName.EQ]: { name: "sap/m/DatePicker", create: this._createDatePickerControl }, // TODO: how to check custom operators
				[OperatorName.BT]: { name: "sap/m/DateRangeSelection", create: this._createDateRangePickerControl }
			};
		},
		getEditForHelp: function() {
			return DefaultContent.getEdit.apply(this, arguments);
		},
		getUseDefaultValueHelp: function() {
			return { name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: true, single: false, multi: true };
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.DateContent - createEditMultiLine not defined!");
		},
		_createDatePickerControl: function(oContentFactory, aControlClasses, sId) {
			const DatePicker = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			oContentFactory.setHideOperator(true);

			this._adjustDataTypeForDate(oContentFactory);

			const oDatePicker = new DatePicker(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				displayFormat: oContentFactory.getDisplayFormat(),
				valueFormat: oContentFactory.getValueFormat(),
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}", // TODO: own ValueState handling?
				valueStateText: "{$field>/valueStateText}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				liveChange: oContentFactory.getHandleContentLiveChange(),
				change: oContentFactory.getHandleContentChange()
			});

			if (oDatePicker.setDisplayFormatType) {
				// TimePicker has no displayFormatType
				oDatePicker.setDisplayFormatType(oContentFactory.getCalendarType());
			}

			if (oDatePicker.setSecondaryCalendarType) {
				oDatePicker.setSecondaryCalendarType(oContentFactory.getSecondaryCalendarType());
			}

			oDatePicker.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oDatePicker);

			return [oDatePicker];
		},
		_createDateRangePickerControl: function(oContentFactory, aControlClasses, sId) {
			const DateRangeSelection = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForDate(oContentFactory);

			const oDateRangeSelection = new DateRangeSelection(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				displayFormat: oContentFactory.getDisplayFormat(),
				valueFormat: oContentFactory.getValueFormat(),
				delimiter: "...",
				displayFormatType: oContentFactory.getCalendarType(),
				secondaryCalendarType: oContentFactory.getSecondaryCalendarType(),
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}", // TODO: own ValueState handling?
				valueStateText: "{$field>/valueStateText}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				liveChange: oContentFactory.getHandleContentLiveChange(),
				change: oContentFactory.getHandleContentChange()
			});

			oDateRangeSelection.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oDateRangeSelection);

			return [oDateRangeSelection];
		},
		_adjustDataTypeForDate: function(oContentFactory) {
			const oType = oContentFactory.retrieveDataType();
			const oFormatOptions = oType.getFormatOptions();

			// if type is used from binding (Field) or format options are not set correctly -> create new type
			this._getDatePattern(oContentFactory, oFormatOptions); // to determine pattern
			if (!oFormatOptions || oFormatOptions.style ||
				!oFormatOptions.pattern || oFormatOptions.pattern !== oContentFactory.getValueFormat() ||
				!oFormatOptions.calendarType || oFormatOptions.calendarType !== CalendarType.Gregorian) {
				oContentFactory.setDateOriginalType(oContentFactory.getDataType());
				oContentFactory.setDataType(DateUtil.createInternalType(oType, oContentFactory.getValueFormat()));
				oContentFactory.updateConditionType();
			}
		},
		/*
		 * To avoid data loss for DatePicker (e.g. in short Year number foe 1918) use ISO format as ValueFormat in DatePickers
		 */
		_getDatePattern: function(oContentFactory, oFormatOptions) {
			const sBaseType = oContentFactory.getField().getBaseType();

			switch (sBaseType) {
				case BaseType.Date:
					oContentFactory.setValueFormat("yyyy-MM-dd");
					break;

				case BaseType.DateTime:
					oContentFactory.setValueFormat("yyyy-MM-dd'T'HH:mm:ss");
					break;

				case BaseType.Time:
					oContentFactory.setValueFormat("HH:mm:ss");
					break;

				default:
					return;
			}

			// TODO: move this logic to delegate???
			oContentFactory.setDisplayFormat("medium");
			if (oFormatOptions) {
				if (oFormatOptions.style) {
					oContentFactory.setDisplayFormat(oFormatOptions.style);
				} else if (oFormatOptions.pattern) {
					oContentFactory.setDisplayFormat(oFormatOptions.pattern);
				}
				if (oFormatOptions.calendarType) {
					oContentFactory.setCalendarType(oFormatOptions.calendarType);
				}
				if (oFormatOptions.secondaryCalendarType) {
					oContentFactory.setSecondaryCalendarType(oFormatOptions.secondaryCalendarType);
				}
			}
		},
		createEdit: function(oContentFactory, aControlClasses, sId) {

			const DynamicDateRange = aControlClasses[0];
			const OperatorDynamicDateOption = aControlClasses[1];
			const DynamicDateRangeConditionsType = aControlClasses[2];
			const mLibrary = aControlClasses[3];

			if (!StandardDynamicDateRangeKeys || !DynamicDateFormat) {
				StandardDynamicDateRangeKeys = mLibrary.StandardDynamicDateRangeKeys;
				DynamicDateFormat = aControlClasses[4];
			}

			const oConditionsType = oContentFactory.getConditionsType(false, DynamicDateRangeConditionsType);
			const fnGetDateRangeStandardOptions = function(aOperators) {
				return this._getDateRangeStandardOptions(aOperators, oContentFactory);
			}.bind(this);
			const oCustomOperatorFilter = new Filter({
				path: "/",
				test: function(sOperator) {
					const sBaseType = oContentFactory.getField().getBaseType();
					return !this._getDateRangeStandardOption(sOperator, sBaseType);
				}.bind(this)
			});
			const fnCreateDateRangeCustomOptions = function(sAggegationId, oBindingContext) {
				const sBaseType = oContentFactory.getField().getBaseType();
				const sOperator = oBindingContext.getObject();
				return this._createOperatorDynamicDateOption(sOperator, oContentFactory, OperatorDynamicDateOption, sBaseType, sId);
			}.bind(this);

			const oDynamicDateRange = new DynamicDateRange(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				formatter: this._getDateRangeFormatter(oContentFactory),
				placeholder: "{$field>/placeholder}",
				//				textAlign: "{$field>/textAlign}",	// this is currently not supported by the DynamicDateRange
				//				textDirection: "{$field>/textDirection}", // this is currently not supported by the DynamicDateRange
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				// enableGroupHeaders: false,	// disable the grouping of the options
				standardOptions: { path: "$field>/_operators", formatter: fnGetDateRangeStandardOptions },
				customOptions: { path: "$field>/_operators", filters: oCustomOperatorFilter, factory: fnCreateDateRangeCustomOptions },
				// liveChange: oContentFactory.getHandleContentLiveChange(), this event does not exist for DynamicDateRange
				change: oContentFactory.getHandleContentChange()
			});

			oContentFactory.setAriaLabelledBy(DynamicDateRange);

			return [oDynamicDateRange];

		},
		createEditForHelp: function(oContentFactory, aControlClasses, sId) {
			if (oContentFactory.getDataType() && oContentFactory.getDataType().isA("sap.ui.model.CompositeType")) {
				oContentFactory.setIsMeasure(true); // handle DateTimeWithTimezone like Unit
			}
			return DefaultContent.createEdit.apply(this, arguments);
		},

		_getDateRangeStandardOptions: function(aOperators, oContentFactory) {
			if (!aOperators || aOperators.length === 0) {
				aOperators = oContentFactory.getField().getSupportedOperators(); // to use default operators if none given
			}
			const aOptions = [];
			const sBaseType = oContentFactory.getField().getBaseType();

			for (const sOperator of aOperators) {
				const sOption = this._getDateRangeStandardOption(sOperator, sBaseType);
				if (sOption) {
					aOptions.push(sOption);
				}
			}

			return aOptions;
		},

		_getDateRangeStandardOption: function(sOperator, sBaseType) {
			const oOperator = FilterOperatorUtil.getOperator(sOperator);
			return FilterOperatorUtil.getDynamicDateOptionForOperator(oOperator, StandardDynamicDateRangeKeys, sBaseType);
		},

		_createOperatorDynamicDateOption: function(sOperator, oContentFactory, OperatorDynamicDateOption, sBaseType, sId) {
			const oOperator = FilterOperatorUtil.getOperator(sOperator);
			let oOption;

			if (oOperator) {
				const sOption = FilterOperatorUtil.getCustomDynamicDateOptionForOperator(oOperator, sBaseType);
				const oType = oContentFactory.retrieveDataType(); // TODO: do we need to create data type right now?
				const aValueTypes = [];

				for (let i = 0; i < oOperator.valueTypes.length; i++) {
					if (oOperator.valueTypes[i] && oOperator.valueTypes[i] !== OperatorValueType.Static) {
						aValueTypes.push("custom"); // provide value as it is to use type to format and parse // TODO: only if custom control?
					}
				}

				oOption = new OperatorDynamicDateOption(sId + "--" + sOption, { key: sOption, operator: oOperator, type: oType, baseType: sBaseType, valueTypes: aValueTypes });
			}
			return oOption;
		},

		_getDateRangeFormatter: function(oContentFactory) {
			const oType = oContentFactory.retrieveDataType(); // TODO: do we need to create data type right now?
			const sBaseType = oContentFactory.getField().getBaseType();
			const oFormatOptions = oType.getFormatOptions();
			const oUsedFormatOptions = {};
			const oDateRangeFormatOptions = {};

			if (oFormatOptions.style) {
				oUsedFormatOptions.style = oFormatOptions.style;
			} else if (oFormatOptions.pattern) {
				oUsedFormatOptions.pattern = oFormatOptions.pattern;
			}

			if (sBaseType === BaseType.DateTime) {
				oDateRangeFormatOptions.datetime = oUsedFormatOptions;
			}

			// use Date FormatOptions anyhow for Operations supporting only dates
			oDateRangeFormatOptions.date = oUsedFormatOptions;

			return DynamicDateFormat.getInstance(oDateRangeFormatOptions);
		}
	});

	return DateContent;
});
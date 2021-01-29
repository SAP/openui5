/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/mdc/util/DateUtil",
	"sap/ui/core/library"
], function(DefaultContent, BaseType, DateUtil, coreLibrary) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;

	/**
	 * Object-based definition of the date content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.DateContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var DateContent = Object.assign({}, DefaultContent, {
		getEditMultiLine: function() {
			return [null];
		},
		getEditOperator: function() {
			return {
				"EQ": { name: "sap/m/DatePicker", create: this._createDatePickerControl }, // TODO: how to check custom operators
				"BT": { name: "sap/m/DateRangeSelection", create: this._createDateRangePickerControl }
			};
		},
		getUseDefaultFieldHelp: function() {
			return { name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: true };
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.DateContent - createEditMultiLine not defined!");
		},
		_createDatePickerControl: function(oContentFactory, aControlClasses, sId) {
			var DatePicker = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			oContentFactory.setHideOperator(true);

			this._adjustDataTypeForDate(oContentFactory);

			var oDatePicker = new DatePicker(sId, {
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
				change: oContentFactory.getHandleContentChange()
			});

			if (oDatePicker.setDisplayFormatType) {
				// TimePicker has no displayFormatType
				oDatePicker.setDisplayFormatType(oContentFactory.getCalendarType());
			}

			oDatePicker._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oDatePicker);
			oContentFactory.setBoundProperty("value");

			return [oDatePicker];
		},
		_createDateRangePickerControl: function(oContentFactory, aControlClasses, sId) {
			var DateRangeSelection = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForDate(oContentFactory);

			var oDateRangeSelection = new DateRangeSelection(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				displayFormat: oContentFactory.getDisplayFormat(),
				valueFormat: oContentFactory.getValueFormat(),
				delimiter: "...",
				displayFormatType: oContentFactory.getCalendarType(),
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
				change: oContentFactory.getHandleContentChange()
			});

			oDateRangeSelection._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oDateRangeSelection);
			oContentFactory.setBoundProperty("value");

			return [oDateRangeSelection];
		},
		_adjustDataTypeForDate: function(oContentFactory) {
			var oType = oContentFactory.retrieveDataType();
			var oFormatOptions = oType.getFormatOptions();

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
			var sBaseType = oContentFactory.getField().getBaseType();

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
			}
		}
	});

	return DateContent;
});
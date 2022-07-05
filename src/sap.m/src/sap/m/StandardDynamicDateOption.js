/*!
 * ${copyright}
 */

// Provides control sap.m.StandardDynamicDateOption.
sap.ui.define([
		'sap/ui/core/library',
		'sap/ui/core/Element',
		'./DynamicDateOption',
		'./Label',
		'./StepInput',
		'./RadioButton',
		'./RadioButtonGroup',
		'sap/ui/unified/Calendar',
		'sap/ui/unified/calendar/MonthPicker',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/date/UniversalDateUtils',
		'sap/ui/core/date/UniversalDate',
		'sap/m/DynamicDateValueHelpUIType',
		'./library'],
	function(
		coreLibrary,
		Element,
		DynamicDateOption,
		Label,
		StepInput,
		RadioButton,
		RadioButtonGroup,
		Calendar,
		MonthPicker,
		DateFormat,
		UniversalDateUtils,
		UniversalDate,
		DynamicDateValueHelpUIType,
		library) {
		"use strict";

		// shortcut for sap.ui.core.VerticalAlign
		var VerticalAlign = coreLibrary.VerticalAlign;

		/**
		 * Constructor for a new StandardDynamicDateOption.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @param {string} [mSettings.key] One of the predefined keys identifying the standard dynamic date options
		 *
		 * @class
		 * A control base type.
		 * @extends sap.m.DynamicDateOption
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 * @alias sap.m.StandardDynamicDateOption
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 */
		var StandardDynamicDateOption = DynamicDateOption.extend("sap.m.StandardDynamicDateOption", /** @lends sap.m.StandardDynamicDateOption.prototype */ {
			metadata: {
				library: "sap.m"
			}
		});

		var MIN_VALUE_HELP_INTEGER = 1;
		var MAX_VALUE_HELP_INTEGER = 6000;

		var Keys = {
			"DATE": "DATE",
			"DATETIME": "DATETIME",
			"DATERANGE": "DATERANGE",
			"DATETIMERANGE": "DATETIMERANGE",
			"TODAY": "TODAY",
			"YESTERDAY": "YESTERDAY",
			"TOMORROW": "TOMORROW",
			"SPECIFICMONTH": "SPECIFICMONTH",
			"SPECIFICMONTHINYEAR": "SPECIFICMONTHINYEAR",
			"FIRSTDAYWEEK": "FIRSTDAYWEEK",
			"LASTDAYWEEK": "LASTDAYWEEK",
			"FIRSTDAYMONTH":"FIRSTDAYMONTH",
			"LASTDAYMONTH":"LASTDAYMONTH",
			"FIRSTDAYQUARTER":"FIRSTDAYQUARTER",
			"LASTDAYQUARTER":"LASTDAYQUARTER",
			"FIRSTDAYYEAR":"FIRSTDAYYEAR",
			"LASTDAYYEAR":"LASTDAYYEAR",
			"THISWEEK": "THISWEEK",
			"THISMONTH": "THISMONTH",
			"THISQUARTER": "THISQUARTER",
			"THISYEAR": "THISYEAR",
			"LASTWEEK": "LASTWEEK",
			"LASTMONTH": "LASTMONTH",
			"LASTQUARTER": "LASTQUARTER",
			"LASTYEAR": "LASTYEAR",
			"NEXTWEEK": "NEXTWEEK",
			"NEXTMONTH": "NEXTMONTH",
			"NEXTQUARTER": "NEXTQUARTER",
			"NEXTYEAR": "NEXTYEAR",
			"LASTDAYS": "LASTDAYS",
			"LASTWEEKS": "LASTWEEKS",
			"LASTMONTHS": "LASTMONTHS",
			"LASTQUARTERS": "LASTQUARTERS",
			"LASTYEARS": "LASTYEARS",
			"NEXTDAYS": "NEXTDAYS",
			"NEXTWEEKS": "NEXTWEEKS",
			"NEXTMONTHS": "NEXTMONTHS",
			"NEXTQUARTERS": "NEXTQUARTERS",
			"NEXTYEARS": "NEXTYEARS",
			"FROM": "FROM",
			"TO": "TO",
			"FROMDATETIME": "FROMDATETIME",
			"TODATETIME": "TODATETIME",
			"YEARTODATE": "YEARTODATE",
			"DATETOYEAR":"DATETOYEAR",
			"TODAYFROMTO": "TODAYFROMTO",
			"QUARTER1": "QUARTER1",
			"QUARTER2": "QUARTER2",
			"QUARTER3": "QUARTER3",
			"QUARTER4": "QUARTER4"
		};

		var _Groups = {
			"SingleDates": 1,
			"DateRanges": 2,
			"Weeks": 3,
			"Months": 4,
			"Quarters": 5,
			"Years": 6
		};

		var _OptionsGroup = {
			"DATE": _Groups.SingleDates,
			"DATETIME": _Groups.SingleDates,
			"DATERANGE": _Groups.DateRanges,
			"DATETIMERANGE": _Groups.DateRanges,
			"TODAY": _Groups.SingleDates,
			"YESTERDAY": _Groups.SingleDates,
			"TOMORROW": _Groups.SingleDates,
			"SPECIFICMONTH": _Groups.Months,
			"SPECIFICMONTHINYEAR": _Groups.Months,
			"FIRSTDAYWEEK": _Groups.SingleDates,
			"LASTDAYWEEK": _Groups.SingleDates,
			"FIRSTDAYMONTH":_Groups.SingleDates,
			"LASTDAYMONTH":_Groups.SingleDates,
			"FIRSTDAYQUARTER":_Groups.SingleDates,
			"LASTDAYQUARTER":_Groups.SingleDates,
			"FIRSTDAYYEAR":_Groups.SingleDates,
			"LASTDAYYEAR":_Groups.SingleDates,
			"THISWEEK": _Groups.Weeks,
			"THISMONTH": _Groups.Months,
			"THISQUARTER": _Groups.Quarters,
			"THISYEAR": _Groups.Years,
			"LASTWEEK": _Groups.Weeks,
			"LASTMONTH": _Groups.Months,
			"LASTQUARTER": _Groups.Quarters,
			"LASTYEAR": _Groups.Years,
			"NEXTWEEK": _Groups.Weeks,
			"NEXTMONTH": _Groups.Months,
			"NEXTQUARTER": _Groups.Quarters,
			"NEXTYEAR": _Groups.Years,
			"LASTDAYS": _Groups.DateRanges,
			"LASTWEEKS": _Groups.DateRanges,
			"LASTMONTHS": _Groups.DateRanges,
			"LASTQUARTERS": _Groups.DateRanges,
			"LASTYEARS": _Groups.DateRanges,
			"NEXTDAYS": _Groups.DateRanges,
			"NEXTWEEKS": _Groups.DateRanges,
			"NEXTMONTHS": _Groups.DateRanges,
			"NEXTQUARTERS": _Groups.DateRanges,
			"NEXTYEARS": _Groups.DateRanges,
			"FROM": _Groups.DateRanges,
			"TO": _Groups.DateRanges,
			"FROMDATETIME": _Groups.DateRanges,
			"TODATETIME": _Groups.DateRanges,
			"YEARTODATE": _Groups.DateRanges,
			"DATETOYEAR": _Groups.DateRanges,
			"TODAYFROMTO": _Groups.DateRanges,
			"QUARTER1": _Groups.Quarters,
			"QUARTER2": _Groups.Quarters,
			"QUARTER3": _Groups.Quarters,
			"QUARTER4": _Groups.Quarters
		};

		var aLastOptions = ["LASTDAYS", "LASTWEEKS", "LASTMONTHS", "LASTQUARTERS", "LASTYEARS"];
		var aNextOptions = ["NEXTDAYS", "NEXTWEEKS", "NEXTMONTHS", "NEXTQUARTERS", "NEXTYEARS"];

		StandardDynamicDateOption.LastXKeys = aLastOptions;
		StandardDynamicDateOption.NextXKeys = aNextOptions;

		var _resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		StandardDynamicDateOption.Keys = Keys;

		StandardDynamicDateOption.prototype.exit = function() {
			if (this.aValueHelpUITypes) {
				while (this.aValueHelpUITypes.length) {
					this.aValueHelpUITypes.pop().destroy();
				}

				delete this.aValueHelpUITypes;
			}
		};

		StandardDynamicDateOption.prototype.getText = function(oControl) {
			var sKey = this.getKey();
			var oOptions = oControl._getOptions();

			var aParams = this.getValueHelpUITypes(oControl);
			var oLastOptionParam = this._getOptionParams(aLastOptions, oOptions);
			var oNextOptionParam = this._getOptionParams(aNextOptions, oOptions);

			if (oLastOptionParam) {
				aParams.push(oLastOptionParam);
			}

			if (oNextOptionParam) {
				aParams.push(oNextOptionParam);
			}

			switch (sKey) {
				case Keys.LASTDAYS:
				case Keys.LASTWEEKS:
				case Keys.LASTMONTHS:
				case Keys.LASTQUARTERS:
				case Keys.LASTYEARS:
				case Keys.NEXTDAYS:
				case Keys.NEXTWEEKS:
				case Keys.NEXTMONTHS:
				case Keys.NEXTQUARTERS:
				case Keys.NEXTYEARS:
					return this._getXPeriodTitle(aParams[1].getOptions());
				case Keys.FROMDATETIME:
				case Keys.TODATETIME:
				case Keys.DATETIMERANGE:
					return oControl._findOption(sKey)._bAdditionalTimeText ?
						_resourceBundle.getText("DYNAMIC_DATE_" + sKey + "_TITLE") + " (" + _resourceBundle.getText("DYNAMIC_DATE_DATETIME_TITLE") + ")" :
						_resourceBundle.getText("DYNAMIC_DATE_" + sKey + "_TITLE");
				default:
					return _resourceBundle.getText("DYNAMIC_DATE_" + sKey + "_TITLE");
			}
		};

		StandardDynamicDateOption.prototype.getValueHelpUITypes = function(oControl) {
			var sKey = this.getKey();

			if (!this.aValueHelpUITypes) { //the empty array is still an initialized value and can be reused
				switch (sKey) {
					case Keys.TODAY:
					case Keys.YESTERDAY:
					case Keys.TOMORROW:
					case Keys.FIRSTDAYWEEK:
					case Keys.LASTDAYWEEK:
					case Keys.FIRSTDAYMONTH:
					case Keys.LASTDAYMONTH:
					case Keys.FIRSTDAYQUARTER:
					case Keys.LASTDAYQUARTER:
					case Keys.FIRSTDAYYEAR:
					case Keys.LASTDAYYEAR:
					case Keys.THISWEEK:
					case Keys.THISMONTH:
					case Keys.THISQUARTER:
					case Keys.THISYEAR:
					case Keys.LASTWEEK:
					case Keys.LASTMONTH:
					case Keys.LASTQUARTER:
					case Keys.LASTYEAR:
					case Keys.NEXTWEEK:
					case Keys.NEXTMONTH:
					case Keys.NEXTQUARTER:
					case Keys.NEXTYEAR:
					case Keys.YEARTODATE:
					case Keys.DATETOYEAR:
					case Keys.QUARTER1:
					case Keys.QUARTER2:
					case Keys.QUARTER3:
					case Keys.QUARTER4:
						this.aValueHelpUITypes = [];
						break;
					case Keys.DATETIME:
					case Keys.FROMDATETIME:
					case Keys.TODATETIME:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								type: "datetime"
							})];
						break;
					case Keys.DATE:
					case Keys.FROM:
					case Keys.TO:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								type: "date"
							})];
						break;
					case Keys.DATERANGE:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								type: "daterange"
							})];
						break;
					case Keys.SPECIFICMONTH:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								type: "month"
							})];
						break;
					case Keys.SPECIFICMONTHINYEAR:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								type: "custommonth"
							})];
						break;
					case Keys.LASTDAYS:
					case Keys.LASTWEEKS:
					case Keys.LASTMONTHS:
					case Keys.LASTQUARTERS:
					case Keys.LASTYEARS:
					case Keys.NEXTDAYS:
					case Keys.NEXTWEEKS:
					case Keys.NEXTMONTHS:
					case Keys.NEXTQUARTERS:
					case Keys.NEXTYEARS:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								text: _resourceBundle.getText("DDR_LASTNEXTX_LABEL"),
								type: "int"
							})];
						break;
					case Keys.TODAYFROMTO:
						this.aValueHelpUITypes = [
							new DynamicDateValueHelpUIType({
								text: _resourceBundle.getText("DDR_TODAYFROMTO_FROM_LABEL"),
								type: "int",
								additionalText: _resourceBundle.getText("DDR_TODAYFROMTO_TO_ADDITIONAL_LABEL")
							}),
							new DynamicDateValueHelpUIType({
								text: _resourceBundle.getText("DDR_TODAYFROMTO_TO_LABEL"),
								type: "int",
								additionalText: _resourceBundle.getText("DDR_TODAYFROMTO_TO_ADDITIONAL_LABEL")
							})];
						break;
					case Keys.DATETIMERANGE:
							this.aValueHelpUITypes = [
								new DynamicDateValueHelpUIType({
									text: _resourceBundle.getText("DDR_DATETIMERANGE_FROM_LABEL"),
									type: "datetime"
								}),
								new DynamicDateValueHelpUIType({
									text: _resourceBundle.getText("DDR_DATETIMERANGE_TO_LABEL"),
									type: "datetime"
								})];
							break;
				}
			}

			return this.aValueHelpUITypes.slice(0);
		};

		/**
		 * Creates a UI for this DynamicDateOption.
		 * @param {sap.m.DynamicDateRange} Control to create the UI for
		 * @param {function} fnControlsUpdated A callback invoked when any of the created controls updates its value
		 *
		 * @return {sap.ui.core.Control[]} Returns an array of controls which is mapped to the parameters of this DynamicDateOption.
		 */
		StandardDynamicDateOption.prototype.createValueHelpUI = function(oControl, fnControlsUpdated) {
			var oOptions = oControl._getOptions(),
				oValue = oControl.getValue() && Object.assign({}, oControl.getValue()),
				aParams = this.getValueHelpUITypes(oControl),
				aControls = [],
				oCurrentLabel;

			if (!oControl.aControlsByParameters) {
				oControl.aControlsByParameters = {};
			}
			oControl.aControlsByParameters[this.getKey()] = [];

			var oLastOptionParam = this._getOptionParams(aLastOptions, oOptions),
				oNextOptionParam = this._getOptionParams(aNextOptions, oOptions);

			if (oLastOptionParam) {
				aParams.push(oLastOptionParam);
			}

			if (oNextOptionParam) {
				aParams.push(oNextOptionParam);
			}

			if (oValue && oValue.values) {
				oValue.values = oValue.values.map(function(val) {
					if (val instanceof Date) {
						return oControl._reverseConvertDate(val);
					}

					return val;
				});
			}

			for (var iIndex = 0; iIndex < aParams.length; iIndex++) {
				oCurrentLabel = null;
				if (aParams[iIndex].getOptions() && aParams[iIndex].getOptions().length <= 1) {
					break;
				} else if (aParams[ iIndex ].getText()) {
					oCurrentLabel = new Label({
						text: aParams[ iIndex ].getText(),
						width: "100%"
					});
					aControls.push(oCurrentLabel);
				}

				var oInputControl;
				var bUTC = false;
				if (oControl && oValue) {
					bUTC = oControl._checkFormatterUTCTimezone(oValue.operator);
				}

				switch (aParams[iIndex].getType()) {
					case "int":
						oInputControl = this._createIntegerControl(oValue, iIndex, fnControlsUpdated);

						if (oValue && aParams[1] && aParams[1].getOptions()
								&& aParams[1].getOptions().indexOf(oValue.operator.slice(4).toLowerCase()) !== -1) {
							oInputControl.setValue(oValue.values[iIndex]);
						}
						break;
					case "date":
						oInputControl = this._createDateControl(oValue, iIndex, fnControlsUpdated, bUTC);
						break;
					case "datetime":
						if (aParams.length === 1) {
							// creates "single" DateTime option (embedded in the DynamicDateRange popup)
							oInputControl = this._createDateTimeInnerControl(oValue, iIndex, fnControlsUpdated, bUTC);
						} else if (aParams.length === 2) {
							oInputControl = this._createDateTimeControl(oValue, iIndex, fnControlsUpdated, bUTC);
						}
						break;
					case "daterange":
						oInputControl = this._createDateRangeControl(oValue, iIndex, fnControlsUpdated, bUTC);
					break;
					case "month":
						oInputControl = this._createMonthControl(oValue, iIndex, fnControlsUpdated);
						break;
					case "custommonth":
						oInputControl = this._createCustomMonthControl(oValue, iIndex, fnControlsUpdated);
						break;
					case "options":
						oInputControl = this._createOptionsControl(oValue, iIndex, fnControlsUpdated, aParams);
						break;
					default:
						break;
				}

				aControls.push(oInputControl);
				oCurrentLabel && oCurrentLabel.setLabelFor(oInputControl);

				if (aParams[iIndex].getAdditionalText()) {
					aControls.push(
						new Label({
							vAlign: VerticalAlign.Bottom,
							text: aParams[iIndex].getAdditionalText()
						}).addStyleClass("sapMDDRAdditionalLabel")
					);
				}
				oControl.aControlsByParameters[this.getKey()].push(oInputControl);
			}

			return aControls;
		};

		StandardDynamicDateOption.prototype._createIntegerControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = DynamicDateOption.prototype._createIntegerControl.call(this, oValue, iIndex, fnControlsUpdated);
			var iMin = this.getKey() === "TODAYFROMTO" ? -MAX_VALUE_HELP_INTEGER : MIN_VALUE_HELP_INTEGER;
			var bUseDefaultValue = !oValue || this.getKey() !== oValue.operator;

			if (bUseDefaultValue) {
				oControl.setValue(1);
			}

			oControl.setMin(iMin);
			oControl.setMax(MAX_VALUE_HELP_INTEGER);

			return oControl;
		};

		StandardDynamicDateOption.prototype._createOptionsControl = function(oValue, iIndex, fnControlsUpdated, aParameters) {
			var oControl = new RadioButtonGroup({
				buttons: [
					aParameters[iIndex].getOptions().map(makeRadioButton)
				]
			});
			if (oValue) {
				var iOptionIndex = aParameters[iIndex].getOptions().indexOf(oValue.operator.slice(4).toLowerCase());

				if (iOptionIndex !== -1) {
					oControl.setSelectedIndex(iOptionIndex);
				}
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		StandardDynamicDateOption.prototype._getOptionParams = function(aGroupOptions, oOptions){
			if (aGroupOptions.indexOf(this.getKey()) !== -1) {
				return new DynamicDateValueHelpUIType({
					text: _resourceBundle.getText("DDR_LASTNEXTX_TIME_PERIODS_LABEL"),
					type: "options",
					options: oOptions ? oOptions.filter(function(option) {
						return aGroupOptions.indexOf(option.getKey()) !== -1;
					}).map(function(option) {
						return option.getKey().slice(4).toLowerCase();
					}) : []
				});
			}

			return undefined;
		};

		/**
		 * Validates all input controls in the value help UI related to the current option.
		 * If one of the input controls contains invalid value, then validation will return <code>false</code>.
		 * If all input controls contain valid value, then the validation will return <code>true</code>.
		 *
		 * @public
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @returns {boolean} value help UI validity indicator
		 */
		StandardDynamicDateOption.prototype.validateValueHelpUI = function(oControl) {
			var aParams = this.getValueHelpUITypes();

			for (var i = 0; i < aParams.length; i++) {
				var oInputControl = oControl.aControlsByParameters[this.getKey()][i];

				switch (aParams[i].getType()) {
					case "int":
						if (oInputControl._isLessThanMin(oInputControl.getValue()) ||
							oInputControl._isMoreThanMax(oInputControl.getValue())) {
							return false;
						}
						break;
					case "month":
					case "custommonth":
					case "date":
					case "daterange":
						if (!oInputControl.getSelectedDates() || oInputControl.getSelectedDates().length == 0) {
							return false;
						}
						break;
					case "datetime":
						if (aParams.length === 1) {
							// validates "single" DateTime option (embedded in the DynamicDateRange popup)
							if (!oInputControl.getCalendar().getSelectedDates() || oInputControl.getCalendar().getSelectedDates().length == 0) {
								return false;
							}
						} else if (!oInputControl.getDateValue() && aParams.length === 2) {
							return false;
						}
						break;
					case "options":
						if (oInputControl.getSelectedIndex() < 0) {
							return false;
						}
						break;
					default:
						break;
				}
			}

			return true;
		};

		// Gets the output for each input parameter.
		// Returns an object { operator: "KEY", values: [] (mapped positionally to each input control) }.
		StandardDynamicDateOption.prototype.getValueHelpOutput = function(oControl) {
			var oOptions = oControl._getOptions();
			var aParams = this.getValueHelpUITypes(oControl),
				aResult = {},
				vOutput;

			if (aLastOptions.indexOf(this.getKey()) !== -1 && oControl.aControlsByParameters[this.getKey()].length > 1) {
				aResult.operator = oOptions.filter(function(option) {
					return aLastOptions.indexOf(option.getKey()) !== -1;
				})[oControl.aControlsByParameters[this.getKey()][1].getSelectedIndex()].getKey();
			} else if (aNextOptions.indexOf(this.getKey()) !== -1 && oControl.aControlsByParameters[this.getKey()].length > 1) {
				aResult.operator = oOptions.filter(function(option) {
					return aNextOptions.indexOf(option.getKey()) !== -1;
				})[oControl.aControlsByParameters[this.getKey()][1].getSelectedIndex()].getKey();
			} else {
				aResult.operator = this.getKey();
			}

			aResult.values = [];

			for (var i = 0; i < aParams.length; i++) {
				var oInputControl = oControl.aControlsByParameters[this.getKey()][i];

				switch (aParams[i].getType()) {
					case "int":
						vOutput = oInputControl.getValue();
						break;
					case "month":
						if (!oInputControl.getSelectedDates() || !oInputControl.getSelectedDates().length) {
							return null;
						}

						vOutput = oInputControl.getSelectedDates()[0].getStartDate().getMonth();
						break;
					case "custommonth":
						if (!oInputControl.getSelectedDates() || !oInputControl.getSelectedDates().length) {
							return null;
						}

						vOutput = [oInputControl.getSelectedDates()[0].getStartDate().getMonth(), oInputControl.getSelectedDates()[0].getStartDate().getFullYear()];
						break;
					case "date":
						if (!oInputControl.getSelectedDates().length) {
							return null;
						}

						vOutput = oInputControl.getSelectedDates()[0].getStartDate();
						break;
					case "datetime":
						if (aParams.length === 1) {
							// "single" DateTime picker (embedded in the DynamicDateRange popup)
							var oDate,
								oTimeDate,
								oCalendar,
								oClocks;

							oCalendar = oInputControl.getCalendar();
							oClocks = oInputControl.getClocks();
							if (!oCalendar.getSelectedDates().length) {
								return null;
							}
							oDate = oCalendar.getSelectedDates()[0].getStartDate();
							oTimeDate = oClocks.getTimeValues();
							oDate.setHours(oTimeDate.getHours(), oTimeDate.getMinutes(), oTimeDate.getSeconds());
							vOutput = oDate;
						} else if (aParams.length === 2) {
							if (!oInputControl.getDateValue()) {
								return null;
							}

							vOutput = oInputControl.getDateValue();
						}
						break;
					case "daterange":
						if (!oInputControl.getSelectedDates().length) {
							return null;
						}

						var oEndDate = oInputControl.getSelectedDates()[0].getEndDate() || oInputControl.getSelectedDates()[0].getStartDate();
						vOutput = [oInputControl.getSelectedDates()[0].getStartDate(), oEndDate];
						break;
					default:
						break;
				}

				if (Array.isArray(vOutput)) {
					aResult.values = Array.prototype.concat.apply(aResult.values, vOutput);
				} else {
					vOutput !== null && vOutput !== undefined && aResult.values.push(vOutput);
				}
			}

			return aResult;
		};

		StandardDynamicDateOption.prototype.getGroup = function() {
			return _OptionsGroup[this.getKey()];
		};

		StandardDynamicDateOption.prototype.getGroupHeader = function() {
			return _resourceBundle.getText("DDR_OPTIONS_GROUP_" + _OptionsGroup[this.getKey()]);
		};

		StandardDynamicDateOption.prototype.format = function(oObj, oFormatter) {
			return oFormatter.format(oObj, true);
		};

		StandardDynamicDateOption.prototype.parse = function(sValue, oFormatter) {
			return oFormatter.parse(sValue, this.getKey());
		};

		StandardDynamicDateOption.prototype.toDates = function(oValue) {
			if (!oValue) {
				return null;
			}

			var sKey = oValue.operator;
			var iParamLastNext = oValue.values[0] || 0;

			switch (sKey) {
				case "SPECIFICMONTH":
					var oDate = new UniversalDate();
					oDate.setMonth(oValue.values[0]);
					oDate = UniversalDateUtils.getMonthStartDate(oDate);
					return UniversalDateUtils.getRange(0, "MONTH", oDate);
				case "SPECIFICMONTHINYEAR":
					var oDate = new UniversalDate();
					oDate.setMonth(oValue.values[0]);
					oDate.setYear(oValue.values[1]);
					oDate = UniversalDateUtils.getMonthStartDate(oDate);
					return UniversalDateUtils.getRange(0, "MONTH", oDate);
				case "DATE":
					return UniversalDateUtils.getRange(0, "DAY", UniversalDate.getInstance(oValue.values[0]));
				case "DATETIME":
					var oDateTime = new UniversalDate.getInstance(oValue.values[0]);
					return [oDateTime, oDateTime];
				case "DATERANGE":
					var oStart = UniversalDate.getInstance(oValue.values[0]);
					var oEnd = UniversalDate.getInstance(oValue.values[1]);

					return [UniversalDateUtils.resetStartTime(oStart), UniversalDateUtils.resetEndTime(oEnd)];
				case "DATETIMERANGE":
					var oStart = UniversalDate.getInstance(oValue.values[0]);
					var oEnd = UniversalDate.getInstance(oValue.values[1]);

					oStart.setMilliseconds(0);
					oEnd.setMilliseconds(999);

					return [oStart, oEnd];
				case "TODAY":
					return UniversalDateUtils.ranges.today();
				case "YESTERDAY":
					return UniversalDateUtils.ranges.yesterday();
				case "TOMORROW":
					return UniversalDateUtils.ranges.tomorrow();
				case "FIRSTDAYWEEK":
					return UniversalDateUtils.ranges.firstDayOfWeek();
				case "LASTDAYWEEK":
					return UniversalDateUtils.ranges.lastDayOfWeek();
				case "FIRSTDAYMONTH":
					return UniversalDateUtils.ranges.firstDayOfMonth();
				case "LASTDAYMONTH":
					return UniversalDateUtils.ranges.lastDayOfMonth();
				case "FIRSTDAYQUARTER":
					return UniversalDateUtils.ranges.firstDayOfQuarter();
				case "LASTDAYQUARTER":
					return UniversalDateUtils.ranges.lastDayOfQuarter();
				case "FIRSTDAYYEAR":
					return UniversalDateUtils.ranges.firstDayOfYear();
				case "LASTDAYYEAR":
					return UniversalDateUtils.ranges.lastDayOfYear();
				case "THISWEEK":
					return UniversalDateUtils.ranges.currentWeek();
				case "THISMONTH":
					return UniversalDateUtils.ranges.currentMonth();
				case "THISQUARTER":
					return UniversalDateUtils.ranges.currentQuarter();
				case "THISYEAR":
					return UniversalDateUtils.ranges.currentYear();
				case "LASTWEEK":
					return UniversalDateUtils.ranges.lastWeek();
				case "LASTMONTH":
					return UniversalDateUtils.ranges.lastMonth();
				case "LASTQUARTER":
					return UniversalDateUtils.ranges.lastQuarter();
				case "LASTYEAR":
					return UniversalDateUtils.ranges.lastYear();
				case "NEXTWEEK":
					return UniversalDateUtils.ranges.nextWeek();
				case "NEXTMONTH":
					return UniversalDateUtils.ranges.nextMonth();
				case "NEXTQUARTER":
					return UniversalDateUtils.ranges.nextQuarter();
				case "NEXTYEAR":
					return UniversalDateUtils.ranges.nextYear();
				case "LASTDAYS":
					return UniversalDateUtils.ranges.lastDays(iParamLastNext);
				case "LASTWEEKS":
					return UniversalDateUtils.ranges.lastWeeks(iParamLastNext);
				case "LASTMONTHS":
					return UniversalDateUtils.ranges.lastMonths(iParamLastNext);
				case "LASTQUARTERS":
					return UniversalDateUtils.ranges.lastQuarters(iParamLastNext);
				case "LASTYEARS":
					return UniversalDateUtils.ranges.lastYears(iParamLastNext);
				case "NEXTDAYS":
					return UniversalDateUtils.ranges.nextDays(iParamLastNext);
				case "NEXTWEEKS":
					return UniversalDateUtils.ranges.nextWeeks(iParamLastNext);
				case "NEXTMONTHS":
					return UniversalDateUtils.ranges.nextMonths(iParamLastNext);
				case "NEXTQUARTERS":
					return UniversalDateUtils.ranges.nextQuarters(iParamLastNext);
				case "NEXTYEARS":
					return UniversalDateUtils.ranges.nextYears(iParamLastNext);
				case "FROM":
					return [UniversalDate.getInstance(oValue.values[0])];
				case "TO":
					return [UniversalDate.getInstance(oValue.values[0])];
				case "FROMDATETIME":
					var oDate = UniversalDate.getInstance(oValue.values[0]);

					oDate.setMilliseconds(0);

					return [oDate];
				case "TODATETIME":
					var oDate = UniversalDate.getInstance(oValue.values[0]);

					oDate.setMilliseconds(999);

					return [oDate];
				case "YEARTODATE":
					return UniversalDateUtils.ranges.yearToDate();
				case "DATETOYEAR":
					return UniversalDateUtils.ranges.dateToYear();
				case "TODAYFROMTO":
					if (oValue.values.length !== 2) {
						return [];
					}
					var xDays = oValue.values[0];
					var yDays = oValue.values[1];

					var oStart = xDays >= 0 ? UniversalDateUtils.ranges.lastDays(xDays)[0] : UniversalDateUtils.ranges.nextDays(-xDays)[1];
					var oEnd = yDays >= 0 ? UniversalDateUtils.ranges.nextDays(yDays)[1] : UniversalDateUtils.ranges.lastDays(-yDays)[0];

					if (oStart.oDate.getTime() > oEnd.oDate.getTime()) {
						oEnd = [oStart, oStart = oEnd][0];
					}

					return [UniversalDateUtils.resetStartTime(oStart), UniversalDateUtils.resetEndTime(oEnd)];
				case "QUARTER1":
					return UniversalDateUtils.ranges.quarter(1);
				case "QUARTER2":
					return UniversalDateUtils.ranges.quarter(2);
				case "QUARTER3":
					return UniversalDateUtils.ranges.quarter(3);
				case "QUARTER4":
					return UniversalDateUtils.ranges.quarter(4);
				default:
					return [];
			}
		};

		StandardDynamicDateOption.prototype.enhanceFormattedValue = function() {
			switch (this.getKey()) {
				case "TODAY":
				case "YESTERDAY":
				case "TOMORROW":
				case "FIRSTDAYWEEK":
				case "LASTDAYWEEK":
				case "FIRSTDAYMONTH":
				case "LASTDAYMONTH":
				case "FIRSTDAYQUARTER":
				case "LASTDAYQUARTER":
				case "FIRSTDAYYEAR":
				case "LASTDAYYEAR":
				case "THISWEEK":
				case "THISMONTH":
				case "THISQUARTER":
				case "THISYEAR":
				case "LASTWEEK":
				case "LASTMONTH":
				case "LASTQUARTER":
				case "LASTYEAR":
				case "NEXTWEEK":
				case "NEXTMONTH":
				case "NEXTQUARTER":
				case "NEXTYEAR":
				case "YEARTODATE":
				case "DATETOYEAR":
				case "QUARTER1":
				case "QUARTER2":
				case "QUARTER3":
				case "QUARTER4":
					return true;
				default:
					return false;
			}
		};

		/**
		 * Gets a combined option title for the last x or the next x option.
		 *
		 * @param {*} aOptions A combination of the following string values: days, weeks, months, quarters, years
		 * @returns {string} A combined option title
		 * @private
		 */
		StandardDynamicDateOption.prototype._getXPeriodTitle = function(aOptions) {
			var sCombinedOptions,
				sKey = this.getKey();

			if (aOptions.length === 1) {
				return _resourceBundle.getText("DYNAMIC_DATE_" + sKey + "_TITLE");
			}

			sCombinedOptions = aOptions.map(function(sOption) {
				return _resourceBundle.getText("DYNAMIC_DATE_" + sOption.toUpperCase());
			}).join(" / ");

			if (sKey.indexOf("LAST") === 0) {
				return _resourceBundle.getText("DYNAMIC_DATE_LASTX_TITLE", sCombinedOptions);
			}

			if (sKey.indexOf("NEXT") === 0) {
				return _resourceBundle.getText("DYNAMIC_DATE_NEXTX_TITLE", sCombinedOptions);
			}
		};

		function makeRadioButton(sOptionName) {
			return new RadioButton({ text: _resourceBundle.getText("DYNAMIC_DATE_" + sOptionName.toUpperCase()) });
		}

		return StandardDynamicDateOption;
	});

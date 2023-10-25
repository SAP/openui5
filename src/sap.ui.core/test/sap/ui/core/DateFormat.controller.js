sap.ui.define([
	"./FormatHelper",
	"sap/base/i18n/Formatting",
	"sap/base/util/deepEqual",
	"sap/base/util/JSTokenizer",
	"sap/ui/core/Locale",
	"sap/ui/core/date/CalendarWeekNumbering",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (FormatHelper, Formatting, deepEqual, JSTokenizer, Locale, CalendarWeekNumbering,
		UI5Date, DateFormat, Controller, JSONModel
) {
	"use strict";

	return Controller.extend("DateFormat", {
		onInit: function() {
			var aSamples = [
					{key: "custom", text: "Custom", type: "Date", sample: {} },
					{key: "timezone", text: "Timezone", type: "DateTimeWithTimezone", sample: {} },
					{key: "shortdate", text: "Short date", type: "Date", sample: {style: "short"} },
					{key: "longdate", text: "Long date", type: "Date", sample: {style: "long"} },
					{key: "shorttime", text: "Short time", type: "Time", sample: {style: "short"} },
					{key: "mediumshort", text: "Medium/short datetime", type: "DateTime", sample: {style: "medium/short"} },
					{key: "relativedate", text: "Relative date", type: "Date", sample: {relative: true} },
					{key: "relativedatetime", text: "Relative datetime", type: "DateTime", sample: {relative: true} },
					{key: "relativetime", text: "Relative time", type: "Time", sample: {relative: true} },
					{key: "intervaldate", text: "Date interval", type: "Date", sample: {format: "yMMMd", interval: true} },
					{key: "intervaldatetime", text: "Datetime interval", type: "DateTime", sample: {format: "yMdjms", interval: true} },
					{key: "intervaltime", text: "Time interval", type: "Time", sample: {format: "jm", interval: true} }
				],
				aHashParams = [
					{name: "formatOptions", "default": {}},
					{name: "type", "default": "Date"},
					{name: "date", "default": UI5Date.getInstance()},
					{name: "todate", "default": UI5Date.getInstance()}
				],
				oSupportedOptions = {
					format: {
						type: "string",
						regex: /^G*(y*|Y*)(q*|Q*)(M*|L*)(w*|W*)(E*|e*|c*)(d*|D*)(h*|H*|k*|K*|j*|J*)m*s*(z*|Z*|v*|V*|O*|X*|x*)$/,
						help: "A skeleton pattern which may only contain symbols of this list in canonical order: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w/W), Day-Of-Week (E/e/c), Day (d/D), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)"
					},
					pattern: {
						type: "string"
					},
					style: {
						type: "string",
						regex: /^(short|medium|long|full)$|^((short|medium|long|full)\/(short|medium|long|full))$/,
						help: "Allowed values are \"short\", \"medium\", \"long\" and \"full\", as well as combined styles for DateTime, separated with a slash, like \"medium/short\"."
					},
					strictParsing: {
						type: "boolean",
						help: "To enable strict parsing, set to \"true\""
					},
					relative: {
						type: "boolean",
						help: "To enable relative formatting set to \"true\""
					},
					relativeRange: {
						type: "array",
						help: "The range where relative formatting should be used as an array from start to end, e.g. [-6, 6]"
					},
					relativeScale: {
						type: "enum",
						values: ["auto", "year", "quarter", "month", "week", "day", "hour", "minute", "second"],
						help: "Allowed values are \"auto\", \"year\", \"quarter\", \"month\", \"week\", \"day\", \"hour\", \"minute\" and \"second\", where \"auto\" automatically choses the best matching scale"
					},
					relativeStyle: {
						type: "enum",
						values: ["wide", "short", "narrow"],
						help: "Allowed values are \"wide\", \"short\" and \"narrow\""
					},
					showDate: {
						type: "boolean",
						help: "Show Date part"
					},
					showTime: {
						type: "boolean",
						help: "Show Time part"
					},
					showTimezone: {
						type: "boolean",
						help: "Show Timezone part"
					},
					calendarWeekNumbering: {
						type: "enum",
						values: Object.values(CalendarWeekNumbering),
						help: "Allowed values are \"Default\", \"ISO_8601\", \"MiddleEastern\" and \"WesternTraditional\""
					},
					firstDayOfWeek: {
						type: "int",
						help: "first day of week, 0=Sunday"
					},
					minimalDaysInFirstWeek: {
						type: "int",
						help: "Minimal days of first week"
					},
					interval: {
						type: "boolean",
						help: "To enable interval formatting set to \"true\""
					},
					intervalDelimiter: {
						type: "string",
						regex: /.+/,
						help: "The delimiter symbol between the dates"
					},
					singleIntervalValue: {
						type: "boolean",
						help: "To enable interval formatting set to \"true\""
					},
					UTC: {
						type: "boolean",
						help: "To format as UTC time instead of local time, set to \"true\""
					},
					calendarType: {
						type: "enum",
						values: ["Gregorian", "Japanese", "Islamic", "Persian", "Buddhist"],
						help: "Allowed values are \"Gregprian\", \"Japanese\", \"Islamic\", \"Persian\" and \"Buddhist\""
					}
				};

			var oCurrentLocale = new Locale(Formatting.getLanguageTag());
			var sLocale = oCurrentLocale.getLanguage();
			if (oCurrentLocale.getRegion()) {
				sLocale += "-" + oCurrentLocale.getRegion();
			}

			var oModel = new JSONModel({
				date: UI5Date.getInstance(),
				todate: UI5Date.getInstance(),
				formatOptions: {},
				type: "Date",
				locales: FormatHelper.locales,
				localesSuggestions: FormatHelper.locales.map(function(sLocale) {
					return {name: sLocale};
				}),
				locale: sLocale,
				samples: aSamples,
				sample: "custom",
				timezone: "Europe/Berlin",
				timezonesSuggestions: [
					{name: "Africa/Cairo", diff: "+02:00"},
					{name: "America/Indiana/Tell_City", diff: "-06:00"},
					{name: "America/Jamaica", diff: "-05:00"},
					{name: "America/New_York", diff: "-05:00"},
					{name: "America/St_Johns", diff: "-03:30"},
					{name: "Asia/Kabul", diff: "+04:30"},
					{name: "Asia/Kathmandu", diff: "+05:45"},
					{name: "Asia/Tokyo", diff: "+09:00"},
					{name: "Australia/Eucla", diff: "+08:45"},
					{name: "Australia/Sydney", diff: "+10:00"},
					{name: "Europe/Berlin", diff: "+01:00"},
					{name: "Europe/Copenhagen", diff: "+01:00"},
					{name: "Europe/London", diff: "+00:00"},
					{name: "Indian/Christmas", diff: "+07:00"},
					{name: "Pacific/Port_Moresby", diff: "+10:00"},
					{name: "Pacific/Honolulu", diff: "-10:00"}
				]
			});

			FormatHelper.bindHash(oModel, aHashParams, oSupportedOptions);

			// format options must be bound programmatically as the 'Options' type can't be configured in XML view
			this.byId("formatOptions").bindValue({
				path: "/formatOptions",
				type: new FormatHelper.Options(oSupportedOptions)
			});

			this.getView().setModel(oModel);
		},

		genericFormat: function(oDate, oToDate, sType, oFormatOptions, sLocale, sTimezone) {
			var oLocale = new Locale(sLocale);
			var sFunctionName = "get" + sType + "Instance",
				oDateFormat = DateFormat[sFunctionName](oFormatOptions, oLocale);

			if (sType !== "DateTimeWithTimezone") {
				sTimezone = undefined;
			}
			if (oFormatOptions.interval) {
				return oDateFormat.format([oDate, oToDate], sTimezone);
			} else {
				return oDateFormat.format(oDate, sTimezone);
			}
		},

		genericParse: function(oEvent) {
			var oModel = this.getView().getModel();
			var sValue = oEvent.getParameter("value");
			var oFormatOptions = oModel.getProperty("/formatOptions");
			var sType = oModel.getProperty("/type");
			var sTimezone = oModel.getProperty("/timezone");
			var sLocale = oModel.getProperty("/locale");
			var sFunctionName = "get" + sType + "Instance";
			var oOptions = Object.assign({}, oFormatOptions);
			var oLocale = new Locale(sLocale);
			var oDateFormat = DateFormat[sFunctionName](oOptions, oLocale);
			if (sType !== "DateTimeWithTimezone") {
				sTimezone = undefined;
			}
			var aParsed = oDateFormat.parse(sValue, sTimezone);
			if (Array.isArray(aParsed) && sType === "DateTimeWithTimezone") {
				if (aParsed[0] != null) {
					oModel.setProperty("/date", aParsed[0]);
				}
				if (aParsed[1] != null) {
					oModel.setProperty("/timezone", aParsed[1]);
				}
			} else if (Array.isArray(aParsed)) {
				if (aParsed[0] != null) {
					oModel.setProperty("/date", aParsed[0]);
				}
				if (aParsed[1] != null) {
					oModel.setProperty("/todate", aParsed[1]);
				}
			} else if (aParsed) {
				oModel.setProperty("/date", aParsed);
			}
		},

		onFormatOptionChange: function (oEvent) {
			var oSource = oEvent.getSource(),
				sValue = oSource.getValue(),
				oValue;
			this.getView().getModel().setProperty("/sample", "custom");
			try {
				oValue = JSTokenizer.parseJS(sValue);
			} catch (e) {
				oSource.onChange(oEvent);
				return;
			}
			if (oSource.getValueState() === "Error" || !deepEqual(oValue, oSource.getBinding("value").getValue())) {
				oSource.onChange(oEvent);
			}
		},

		onTypeChange: function() {
			this.getView().getModel().setProperty("/sample", "custom");
		},

		onSampleChange: function(oEvent) {
			var oSource = oEvent.getSource(),
				oContext = oSource.getSelectedItem().getBindingContext(),
				oModel = this.getView().getModel();
			oModel.setProperty("/formatOptions", {});
			oModel.setProperty("/type", oContext.getProperty("type"));
			oModel.setProperty("/formatOptions", oContext.getProperty("sample"));
		},

		formatLocaleText: function(oDate, oToDate, oFormatOptions, sType, sLocale, sTimezone) {
			var oLocale = new Locale(sLocale),
				sFunctionName = "get" + sType + "Instance",
				oDateFormat = DateFormat[sFunctionName](oFormatOptions, oLocale);
			if (sType !== "DateTimeWithTimezone") {
				sTimezone = undefined;
			}
			if (oFormatOptions.interval) {
				return oDateFormat.format([oDate, oToDate], sTimezone);
			} else {
				return oDateFormat.format(oDate, sTimezone);
			}
		},

		formatLocaleIcon: function(sLocale) {
			return "flags/" + sLocale.substr(3) + ".png";
		},

		onLocaleChange: function() {
			this.getView().getModel().setProperty("/sample", "custom");
		}
	});
});

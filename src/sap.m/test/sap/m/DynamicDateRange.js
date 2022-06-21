sap.ui.define([
	"sap/m/DynamicDateOption",
	"sap/ui/core/format/DateFormat",
	"sap/m/DynamicDate",
	"sap/m/DynamicDateFormat",
	"sap/m/DynamicDateUtil",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/m/CustomDynamicDateOption",
	"sap/m/Label",
	"sap/m/Slider",
	"sap/m/DynamicDateRange",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/TextArea",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"
], function(
	DynamicDateOption,
	DateFormat,
	DynamicDate,
	DynamicDateFormat,
	DynamicDateUtil,
	DynamicDateValueHelpUIType,
	CustomDynamicDateOption,
	Label,
	Slider,
	DynamicDateRange,
	App,
	Page,
	TextArea,
	Device,
	JSONModel
) {
	"use strict";

	var oCustomOnOption = (function() {
		var dateFormatter = DateFormat.getInstance();

		return new CustomDynamicDateOption({
			key: "On",
			valueTypes: ["date"],
			getValueHelpUITypes: function(oControl) {
				return [new DynamicDateValueHelpUIType({ type: "date" })];
			},
			format: function(oValue) {
				return "On " + dateFormatter.format(oValue.values[0]);
			},
			parse: function(sValue) {
				var oResult;
				if (sValue.indexOf("On ") === 0) {
					oResult = {};
					oResult.operator = "On";
					oResult.values = [dateFormatter.parse(sValue.slice(3))];
				}

				return oResult;
			},
			toDates: function(oValue) {
				return [oValue.values[0], oValue.values[0]];
			},
			getGroup: function() {
				return 1;
			},
			getGroupHeader: function() {
				return "group header not needed";
			}
		});
	})();

	var oCustomBeforeFullMoonsOption = (function() {
		return new CustomDynamicDateOption({
			key: "Before full moons",
			valueTypes: ["int"],
			getValueHelpUITypes: function(oControl) {
				return [new DynamicDateValueHelpUIType({ type: "int" })];
			},
			createValueHelpUI: function(oControl, fnControlsUpdated) {
				var oLabel = new Label({
					text: this.getKey(),
					width: "100%"
				});
				var oSlider = new Slider({
					max: 10,
					enableTickmarks: true
				}).addStyleClass("sapUiSmallMarginTop");

				oControl.aControlsByParameters = {};
				oControl.aControlsByParameters[this.getKey()] = [];

				if (fnControlsUpdated instanceof Function) {
					oSlider.attachLiveChange(function() {
						fnControlsUpdated(this);
					}, this);
				}

				oControl.aControlsByParameters[this.getKey()].push(oSlider);

				return [oLabel, oSlider];
			},
			format: function(oValue) {
				return "Before " + oValue.values[0] + " full moons";
			},
			parse: function(sValue) {
				var oResult,
					sVal = sValue,
					iNumberEnd;
				if (sValue.indexOf("full moons") > -1) {
					oResult = {};
					oResult.operator = "BeforeFullMoons";

					sVal = sVal.slice(7);
					iNumberEnd = sVal.indexOf(" ");

					oResult.values = [parseInt(sVal.slice(0, iNumberEnd))];
				}

				return oResult;
			},
			validateValueHelpUI: function(oControl) {
				var oSlider = oControl.aInputControls[1];

				return oSlider.getValue() >= (oSlider.getMax() / 4)  &&
					oSlider.getValue() <= (oSlider.getMax() / 2);
			},
			toDates: function(oValue) {
				var now = new Date();
				return [now, now];
			}
		});
	})();

	DynamicDateUtil.addOption(oCustomOnOption);
	DynamicDateUtil.addOption(oCustomBeforeFullMoonsOption);

	function handleValueChange(oEvent) {
		var sDDRValue = JSON.stringify(oEvent.getParameter("value"), null, 2);
		var oTextArea = sap.ui.getCore().byId("txt1");
		var oDDR = oEvent.getSource();

		oTextArea.setValue(sDDRValue + "\n" + oTextArea.getValue());

		if (oEvent.getParameter("valid")) {
			oDDR.setValueState("None");
			oDDR.setValueStateText("");
		} else {
			oDDR.setValueState("Error");
			oDDR.setValueStateText("Parse error!");
		}
	}

	var oToday = new Date();
	var oBefore5Days = new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate() - 5);
	var oAfter5Days = new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate() + 6);

	var iWidth = Device.system.phone ? '100%' : '350px';

	var oDDR1 = new DynamicDateRange({
			width: iWidth,
			value: {
				path: '/val1',
				type: new DynamicDate(null, {
					"minimum": oBefore5Days.getTime(),
					"maximum": oAfter5Days.getTime()
				})
			},
			change: handleValueChange
		}),
		oDDR2 = new DynamicDateRange({
			width: iWidth,
			options: ["DATE", "TODAY", "LASTDAYS", "LASTQUARTERS", "TODAYFROMTO", "On", "Before full moons"],
			value: {
				path: '/val2',
				type: new DynamicDate()
			},
			change: handleValueChange
		}),
		oDDR3 = new DynamicDateRange({
			width: iWidth,
			options: ["DATE", "TODAY", "LASTDAYS","DATETOYEAR", "LASTQUARTERS", "TODAYFROMTO", "SPECIFICMONTH", "SPECIFICMONTHINYEAR","FIRSTDAYWEEK",
				"LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR","LASTDAYYEAR"
				],
			value: {
				path: '/val3',
				type: new DynamicDate({
					date: {
						style: "short"
					},
					month: {
						pattern: "MMM"
					},
					"int": {
						minIntegerDigits: 2
					}
				})
			},
			change: handleValueChange
		}),
		oDDR4 = new DynamicDateRange({
			width: iWidth,
			enableGroupHeaders: false,
			value: {
				path: '/val4',
				type: new DynamicDate()
			},
			change: handleValueChange
		}),
		oApp = new App("myApp", {
			initialPage:"myPage1"
		}),
		oPage1 = new Page("myPage1", {
			title: "DynamicDateRange Control",
			content: [
				new Label({ labelFor: oDDR1, text: "All keys & message handling"}),
				oDDR1,
				new Label({ labelFor: oDDR2, text: "Custom options"}),
				oDDR2,
				new Label({ labelFor: oDDR3, text: "Different format"}),
				oDDR3,
				new Label({ labelFor: oDDR4, text: "No group headers"}),
				oDDR4,
				new TextArea("txt1", { width: iWidth, height: "300px"})
			]
		});

	var oMessageManager = sap.ui.getCore().getMessageManager();
	oMessageManager.registerObject(oDDR1, true);

	var oModel = new JSONModel({
			val1: {
				operator: "DATE",
				values: [1602277200000]
			},
			val2: {
				operator: "DATE",
				values: [1602277200000]
			},
			val3: {
				operator: "DATE",
				values: [1602277200000]
			},
			val4: {
				operator: "DATE",
				values: [1602277200000]
			}
		});

	oApp.addPage(oPage1);
	oApp.setModel(oModel);

	oApp.placeAt("body");
});

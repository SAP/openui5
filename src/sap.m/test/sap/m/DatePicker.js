sap.ui.define([
  "sap/base/i18n/Localization",
  "sap/ui/core/Element",
  "sap/m/App",
  "sap/m/Bar",
  "sap/m/Button",
  "sap/ui/core/library",
  "sap/ui/unified/CalendarLegend",
  "sap/ui/unified/CalendarLegendItem",
  "sap/ui/unified/library",
  "sap/ui/unified/DateTypeRange",
  "sap/ui/model/json/JSONModel",
  "sap/m/Page",
  "sap/m/Label",
  "sap/m/DatePicker",
  "sap/m/ToggleButton",
  "sap/ui/model/type/Date",
  "sap/m/Input",
  "sap/m/MessageToast"
], function(
  Localization,
  Element,
  App,
  Bar,
  Button,
  coreLibrary,
  CalendarLegend,
  CalendarLegendItem,
  unifiedLibrary,
  DateTypeRange,
  JSONModel,
  Page,
  Label,
  DatePicker,
  ToggleButton,
  TypeDate,
  Input,
  MessageToast
) {
  "use strict";

  // shortcut for sap.ui.unified.CalendarDayType
  const CalendarDayType = unifiedLibrary.CalendarDayType;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // Note: the HTML page 'DatePicker.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");
  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");


  function createFooter(){
	  return new Bar({
		  contentMiddle: [new Button({
			  text: "DatePicker",
			  press: function(){
				  app.to("page1");
			  }
		  })]
	  });
  }

  var iEvent = 0;

  function handleChange(oEvent){
	  var oDP = oEvent.oSource;
	  var oInput = Element.getElementById("I2");
	  var sValue = oEvent.getParameter("value");
	  var bValid = oEvent.getParameter("valid");
	  iEvent++;
	  oInput.setValue("Change - Event " + iEvent + ": DatePicker " + oDP.getId() + ":" + sValue + " ;valid: " + bValid);
	  if (bValid) {
		  oDP.setValueState(ValueState.None);
	  } else {
		  oDP.setValueState(ValueState.Error);
	  }
  }

  app.attachParseError(
		  function(oEvent) {
			  var oElement = oEvent.getParameter("element");
			  oEvent.getParameter('property');
			  var oValue = oEvent.getParameter('newValue');
			  oEvent.getParameter('type');
			  oEvent.getParameter('oldValue');

			  var oInput = Element.getElementById("I2");
			  oInput.setValue( "ParseError: Entered value: "+oValue);

			  if (oElement.setValueState) {
				  oElement.setValueState(ValueState.Error);
			  }
		  });

  app.attachValidationSuccess(
		  function(oEvent) {
			  var oElement = oEvent.getParameter("element");
			  oEvent.getParameter('property');
			  var oValue = oEvent.getParameter('newValue');
			  oEvent.getParameter('type');
			  oEvent.getParameter('oldValue');

			  var oInput = Element.getElementById("I2");
			  oInput.setValue( "ValidationSuccess: Entered value: "+oValue);

			  if (oElement.setValueState) {
				  oElement.setValueState(ValueState.None);
			  }
		  });

  var handleFieldGroupValidation = function (oEvent) {
	  var oDP = oEvent.oSource;
	  var oInput = Element.getElementById("I2");
	  oInput.setValue("ValidateFieldGroup - Event: DatePicker " + oDP.getId());
  };

  var oLegend;

  function toggleSpecialDates(oEvent) {
	  var bPressed = oEvent.getParameter("pressed");
	  var oDP = Element.getElementById("DP2");
	  if (!oLegend) {
		  oLegend = new CalendarLegend("Legend1", {
			  items: [
					  new CalendarLegendItem("T1", {type: CalendarDayType.Type01, text: "Typ 1"}),
					  new CalendarLegendItem("T2", {type: CalendarDayType.Type02, text: "Typ 2"}),
					  new CalendarLegendItem("T3", {type: CalendarDayType.Type03, text: "Typ 3"}),
					  new CalendarLegendItem("T4", {type: CalendarDayType.Type04, text: "Typ 4"}),
					  new CalendarLegendItem("T5", {type: CalendarDayType.Type05, text: "Typ 5"}),
					  new CalendarLegendItem("T6", {type: CalendarDayType.Type06, text: "Typ 6"}),
					  new CalendarLegendItem("T7", {type: CalendarDayType.Type07, text: "Typ 7"}),
					  new CalendarLegendItem("T8", {type: CalendarDayType.Type08, text: "Typ 8"}),
					  new CalendarLegendItem("T9", {type: CalendarDayType.Type09, text: "Typ 9"}),
					  new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "Typ 10"}),
					  ]
		  });
		  oDP.setLegend(oLegend);
	  }
	  if (bPressed) {
		  for (var i = 0; i < 10; i++) {
			  var oDate = UI5Date.getInstance(oDP.getDateValue());
			  oDate.setDate(oDate.getDate() + i);
			  var sType = "Type" + (i < 9 ? "0" + (i + 1) : "10");
			  var oSpecialDate = new DateTypeRange({startDate: oDate, type: sType});
			  oDP.addSpecialDate(oSpecialDate);
		  }
	  }else {
		  oDP.destroySpecialDates();
	  }
  }

  var oModel = new JSONModel();
  oModel.setData({
	  dateValue: UI5Date.getInstance()
  });
  app.setModel(oModel);

  var page1 = new Page("page1", {
	  title:"Mobile DatePicker",
	  content : [
		  new Label({text: "Japanese DatePicker", labelFor: "DP1"}),
		  new DatePicker("DP1", { fieldGroupIds: ["group1"], change: handleChange, validateFieldGroup: handleFieldGroupValidation, displayFormatType: "Japanese", showFooter: false }),
		  new Label({text: "initial DatePicker, initialFocusedDate UI5Date.getInstance(2017, 5, 13)", labelFor: "DP1_v0"}),
		  new DatePicker("DP1_v0", { fieldGroupIds: ["group1"], change: handleChange, validateFieldGroup: handleFieldGroupValidation, initialFocusedDateValue: UI5Date.getInstance(2017, 5, 13), showFooter: true }),
		  new Label({text: "DatePicker with given Value and Formatter", labelFor: "DP2"}),
		  new DatePicker("DP2", { value: "2014-03-26", valueFormat: "yyyy-MM-dd", displayFormat: "long", fieldGroupIds: ["group1"], change: handleChange, validateFieldGroup: handleFieldGroupValidation }),
		  new ToggleButton("TB1", { text: "specialDates", press: toggleSpecialDates}),
		  new Label({text: "DatePicker with given DateValue, Formatter, and with a shortcut for current date", labelFor: "DP3", width: "100%"}),
		  new DatePicker("DP3", { dateValue: UI5Date.getInstance("2014", "02", "26"), displayFormat: "short", showCurrentDateButton: true, change: handleChange }),
		  new Label({text: "DatePicker for month and year in compact mode:", labelFor: "DP14"}),
		  new DatePicker("DP14", {
			  dateValue: UI5Date.getInstance("2014", "02", "26"),
			  displayFormat: "yyyy+++++MM",
			  change: handleChange
		  }).addStyleClass("sapUiSizeCompact"),
		  new Label({text: "readonly DatePicker with given DateValue and Formatter", labelFor: "DP4"}),
		  new DatePicker("DP4", { dateValue: UI5Date.getInstance("2014", "02", "26"), displayFormat: "yyyy-MM-dd", editable: false, change: handleChange }),
		  new Label({text: "disabled DatePicker with given DateValue and Formatter", labelFor: "DP5"}),
		  new DatePicker("DP5", { dateValue: UI5Date.getInstance("2014", "02", "26"), displayFormat: "yyyy-MM-dd", enabled: false, change: handleChange }),
		  new Label({text: "DatePicker using DataBinding", labelFor: "DP6"}),
		  new DatePicker("DP6", {
			  value: {
				  path: "/dateValue",
				  type: new TypeDate({style: "medium", strictParsing: true})}/*,
			  change: handleChange*/ }),
		  new Input("I1", {
			  value: {
				  path: "/dateValue",
				  type: new TypeDate({style: "long"})},
			  editable: false}),
		  new Label({text: "islamic DatePicker with secondary gregorianic", labelFor: "DP7"}),
		  new DatePicker("DP7", { displayFormatType: "Islamic", secondaryCalendarType: "Gregorian", change: handleChange }),
		  new Label({text: "DatePicker with minDate=2016-01-01 and maxDate=2016-12-31", labelFor: "DP10"}),
		  new DatePicker("DP10", { minDate: UI5Date.getInstance("2016", "0", "01"), maxDate: UI5Date.getInstance("2016", "11", "31"), change: handleChange }),
		  new Input("I2", {value: "Content of events DatePicker", editable: false}),
		  new Label({text: "Warnig DatePicker:", labelFor: "DP8"}),
		  new DatePicker("DP8", { valueState: "Warning", valueStateText: "Warning Message" }),
		  new Label({text: "Error DatePicker:", labelFor: "DP9"}),
		  new DatePicker("DP9", { valueState: "Error", valueStateText: "Error Message" }),
		  new Label({text: "Lazy loading of special dates DatePicker:", labelFor: "DP11"}),
		  new DatePicker("DP11", {
			  navigate: function (oEvent) {
				  var oRange = oEvent.getParameter("dateRange"),
					  bAfterPopupOpened = oEvent.getParameter("afterPopupOpened"),
					  oStartDate = oRange.getStartDate(),
					  oEndDate = oRange.getEndDate(),
					  sFeedback = "Navigate event fired and new special dates marked";

				  // Generate some random dates within range
				  oStartDate.setDate(oStartDate.getDate() + Math.floor(Math.random() * 15));
				  oEndDate.setDate(oEndDate.getDate() - Math.floor(Math.random() * 15));

				  // Clear existing aggregations
				  this.removeAllAggregation("specialDates");

				  // Add the first date as a special date with a random type
				  this.addSpecialDate(
					  new DateTypeRange({
						  startDate: oStartDate,
						  type: "Type0" + (Math.floor(Math.random() * 8) + 1)
					  })
				  );

				  // Add the second date as a special date with a random type
				  this.addSpecialDate(
					  new DateTypeRange({
						  startDate: oEndDate,
						  type: "Type0" + (Math.floor(Math.random() * 8) + 1)
					  })
				  );


				  // Indicate if the navigate event was fired, due to popup being opened
				  if (bAfterPopupOpened) {
					  sFeedback = "Popup opened - " + sFeedback;
				  }

				  // Give feedback
				  MessageToast.show(sFeedback);
			  }
		  }),
		  new Label({text: "DatePicker with Formatter for month and year:", labelFor: "DP12"}),
		  new DatePicker("DP12", {
			  dateValue: UI5Date.getInstance("2014", "02", "26"),
			  displayFormat: "yyyy+++++MM",
			  change: handleChange
		  }),
		  new Label({text: "DatePicker with Formatter for year:", labelFor: "DP13"}),
		  new DatePicker("DP13", {
			  dateValue: UI5Date.getInstance("2014", "02", "26"),
			  displayFormat: "----------------yyyyyyyyyy------------",
			  change: handleChange
		  }),
		  new Label({text: "DatePicker maximum year in Gregorian calendar:", labelFor: "DP15"}),
		  new DatePicker("DP15", {
			  dateValue: UI5Date.getInstance("9999", "02", "26"),
			  change: handleChange
		  }),
		  new DatePicker("DP16"),
		  new Button("btnEtcGMT-12", {
			  text: "Etc/GMT-12",
			  press: handleTimezoneButtonPress
		  }),
		  new Button("btnUTC", {
			  text: "UTC",
			  press: handleTimezoneButtonPress
		  }),
		  new Button("btnEtcGMT12", {
			  text: "Etc/GMT+12",
			  press: handleTimezoneButtonPress
		  })
	  ],
	  footer: createFooter()
  });

  app.addPage(page1);

  app.placeAt("body");

  function handleTimezoneButtonPress(e) {
	  Localization.setTimezone(e.getSource().getText());
	  Element.getElementById("DP16").setValue("");
  }
});
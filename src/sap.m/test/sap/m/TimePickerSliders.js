sap.ui.define([
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/layout/BlockLayoutCell",
  "sap/ui/model/type/Time",
  "sap/m/TimePickerSliders",
  "sap/m/Text",
  "sap/m/MessageToast",
  "sap/ui/layout/BlockLayoutRow",
  "sap/ui/layout/BlockLayout",
  "sap/ui/model/json/JSONModel"
], function(
  HTML,
  IconPool,
  App,
  Page,
  BlockLayoutCell,
  Time,
  TimePickerSliders,
  Text,
  MessageToast,
  BlockLayoutRow,
  BlockLayout,
  JSONModel
) {
  "use strict";
  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");

  var oApp = new App("myApp"),
	  oPage = new Page();

  function fnCreateCell(width, title, content) {
	  return new BlockLayoutCell({
		  content: content,
		  width: width,
		  title: title
	  });
  }

  var options = [
	  {
		  valueFormat: "mm:ss",
		  value: "13:15",
		  displayFormat: "mm:ss",
		  minutesStep: 15,
		  secondsStep: 15
	  },
	  {
		  support2400: true,
		  valueFormat: "HH:mm:ss",
		  displayFormat: "HH:mm:ss",
		  value: "24:00:00"
	  },
	  {
		  displayFormat: "hh:mm a"
	  },
	  {
		  localeId: "de_DE",
		  displayFormat: "hh:mm a"
	  },
	  {
		  displayFormat: "HH:mm:ss"
	  },
	  {
		  value: "9:12:13"
	  },
	  {
		  value: "09:59"
	  },
	  {
		  value: "21:37",
		  valueFormat: "HH:mm"
	  },
	  {
		  value: {
			  path: "/timeValue",
			  type: new Time({style: "medium", strictParsing: true})
		  }
	  },
	  {
		  localeId: "zh_CN",
		  displayFormat: "ah:mm:ss",
		  valueFormat: "HH:mm:ss",
		  value: "13:22:52"
	  }
  ];

  function returnIfDefined(oConfig, sKey) {
	  var sValue = oConfig[sKey];

	  if (sValue) {
		  return sKey + ": " + sValue + " ";
	  }

	  return "";
  }

  function generateTimePickers() {
	  var i,
			  aCells = [],
			  sInfo,
			  oCell,
			  oTp;

	  for (i = 0; i < options.length; i++) {
		  options[i].change = handleChange;
		  options[i].height = "300px";
		  sInfo =  returnIfDefined(options[i], "value") + returnIfDefined(options[i], "valueFormat") + returnIfDefined(options[i], "displayFormat")
		  if (options[i].value && options[i].value.path) { //data binding
			  oCell = fnCreateCell(1, sInfo, [
					  new TimePickerSliders(options[i]),
					  new Text({
						  text: {
							  path: "/timeValue",
							  type: new Time({style: "medium", strictParsing: true})
						  }
					  })
				  ]);
		  } else {
			  oTp = new TimePickerSliders(options[i]);
			  oCell = fnCreateCell(1, sInfo, oTp);
		  }

		  aCells.push(oCell);
	  }

	  return aCells;
  }

  function handleChange(oEvent) {
	  MessageToast.show("Value is: " + oEvent.getParameter("value"));
  }

  function generateRows(aCells) {
	  var aRows = [];

	  for (var i = 0; i <= aCells.length - 1; i +=2) {
		  var oRow = new BlockLayoutRow();

		  aCells[i] && oRow.addContent(aCells[i]);
		  aCells[i + 1] && oRow.addContent(aCells[i + 1]);

		  aRows.push(oRow);
	  }

	  return aRows;
  }

  oPage.addContent(new BlockLayout({
	  id: "layout",
	  content: [
		  generateRows(generateTimePickers())
	  ]
  }));

  var oModel = new JSONModel();
  oModel.setData({
	  timeValue: UI5Date.getInstance()
  });
  oApp.setModel(oModel);

  oApp.addPage(oPage);
  oApp.placeAt("body");
});
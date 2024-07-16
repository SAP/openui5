sap.ui.define([
  "sap/base/i18n/Localization",
  "sap/ui/core/Element",
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/App",
  "sap/ui/model/type/Time",
  "sap/m/Toolbar",
  "sap/m/TimePicker",
  "sap/m/Text",
  "sap/ui/model/json/JSONModel",
  "sap/m/Page",
  "sap/m/HBox",
  "sap/m/library",
  "sap/m/Switch",
  "sap/ui/Device",
  "sap/m/Button",
  "sap/ui/thirdparty/jquery"
], function(
  Localization,
  Element,
  HTML,
  IconPool,
  App,
  Time,
  Toolbar,
  TimePicker,
  Text,
  JSONModel,
  Page,
  HBox,
  mobileLibrary,
  Switch,
  Device,
  Button,
  jQuery
) {
  "use strict";

  // shortcut for sap.m.TimePickerMaskMode
  const TimePickerMaskMode = mobileLibrary.TimePickerMaskMode;

  // shortcut for sap.m.FlexAlignItems
  const FlexAlignItems = mobileLibrary.FlexAlignItems;

  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");

  var app = new App("myApp", {
	  initialPage:"page1"
  });
  app.placeAt("body");

  // TODO: do the resize listening only when ScrollContainer becomes visible and unbind when getting visible

  var options = [
	  {
		  id: "TP1",
		  valueFormat: "mm:ss",
		  value: "13:15",
		  displayFormat: "mm:ss",
		  minutesStep: 15,
		  secondsStep: 15,
		  showCurrentTimeButton: true
	  },
	  {
		  id: "TP2",
		  displayFormat: "hh:mm a",
		  enabled: false
	  },
	  {
		  id: "TP3",
		  localeId: "de_DE",
		  displayFormat: "hh:mm a"
	  },
	  {
		  id: "TP4",
		  displayFormat: "HH:mm:ss"
	  },
	  {
		  id: "TP5",
		  value: "09:15:16 PM",
		  localeId: "en_US",
		  title: "Departure time"
	  },
	  {
		  id: "TP6",
		  value: "9:12:13"
	  },
	  {
		  id: "TP7",
		  value: "09:59"
	  },
	  {
		  id: "TP8",
		  value: "21:37",
		  valueFormat: "HH:mm" //needed
	  },
	  {
		  id: "TP9",
		  value: "21+-44-+01",
		  valueFormat: "HH+-mm-+ss" //needed
	  },
	  {
		  id: "TP10",
		  value: "21 March 2013 5:21 PM",
		  localeId: "en_US",
		  valueFormat: "dd MMMM yyyy h:mm a"
	  },
	  {
		  id: "TP11",
		  value: "04:33 PM 17 May",
		  localeId: "en_US",
		  valueFormat: "hh:mm a dd MMMM"
	  },
	  {
		  id: "TP12",
		  value: "12/02/99 17:00",
		  valueFormat: "dd/MM/yy HH:mm"
	  },
	  {
		  id: "TP13",
		  value: "09:17:16 PM",
		  localeId: "en_US",
		  displayFormat: "mm",
		  minutesStep: 20
	  }
	  ,
	  {
		  id: "TP14",
		  value: "09:15:16 PM",
		  localeId: "en_US",
		  displayFormat: "HH:mm"
	  },
	  {
		  id: "TP15",
		  valueState: "Error",
		  valueStateText: "Error Message"
	  },
	  {
		  id: "TP16",
		  value: {
			  path: "/timeValue",
			  type: new Time({style: "medium", strictParsing: true})
		  }
	  }, {
		  id: "TP17",
		  localeId: "zh_CN",
		  displayFormat: "ah:mm:ss",
		  valueFormat: "HH:mm:ss",
		  value: "13:22:52"
	  },
	  {
		  id: "TP18",
		  value: "22:33",
		  initialFocusedDateValue: UI5Date.getInstance(2017, 8, 9, 10, 11, 12)
	  },
	  {
		  id: "TP19",
		  initialFocusedDateValue: UI5Date.getInstance(2017, 8, 9, 10, 11, 12)
	  },
	  {
		  id: "TP20",
		  valueFormat: "HH:mm:ss",
		  displayFormat: "HH:mm:ss",
		  support2400: true,
		  value: "24:00:00"
	  },
	  {
		  id: "TP21",
		  displayFormat: "HHmmss",
	  },
	  {
		  id: "TP22",
		  displayFormat: "h 'hr' mm 'min' ss 'sec'",
	  },
	  {
		  id: "TP23",
		  displayFormat: "'time' h 'hr' mm 'min' ss 'sec'",
	  },
	  {
		  id: "TP24",
		  displayFormat: "'time' hmmss 'now'",
	  }
  ];

  var generateTimePickers = function() {
	  var i,
		  aControls = [],
		  sInfo,
		  oBar,
		  oTp;

	  for (i = 0; i < options.length; i++) {
		  options[i].change = handleChange;
		  if (options[i].value && options[i].value.path) { //data binding
			  oBar = new Toolbar(options[i].id + "-toolbar", {
				  content: [
					  new TimePicker(options[i]),
					  new Text({
						  text: {
							  path: "/timeValue",
							  type: new Time({style: "medium", strictParsing: true})
						  }
					  })
				  ]
			  });
		  } else {
			  oTp = new TimePicker(options[i]);
			  sInfo =  JSON.stringify(options[i]).split("\"").join("").replace("{", "").replace(",", " ").replace("}", "") + ", id: " + oTp.getId();
			  oBar = new Toolbar(options[i].id + "-toolbar", {
				  content: [
					  oTp,
					  new Text({ text: sInfo })
				  ]
			  });
		  }

		  aControls.push(oBar);
	  }

	  return aControls;
  };


  var oModel = new JSONModel();
  oModel.setData({
	  timeValue: UI5Date.getInstance()
  });
  app.setModel(oModel);

  var page = new Page("page1", {
	  title: "TimePicker",
	  content : [
		  new HBox({
			  alignItems: FlexAlignItems.Center,
			  items: [
				  new Text({ text: "MaskInput is:" }),
				  new Switch({
					  state: true,
					  change: function (oEvent) {
						  var sMaskMode = oEvent.getParameter("state") ? TimePickerMaskMode.On : TimePickerMaskMode.Off;

						  for (i = 0; i < options.length; i++) {
							  var sId = options[i].id;

							  Element.getElementById(sId).setMaskMode(sMaskMode);
						  }

					  }
				  }),
				  new Text({ text: "Mobile simulation is:" }),
				  new Switch("toggleMobile", {
					  state: false,
					  change: function(oEvent) {
						  var bState = oEvent.getParameter("state");
						  Device.system.desktop = !bState;
						  Device.system.phone = bState;
					  }
				  })
			  ]
		  }),
		  generateTimePickers(),
		  new TimePicker("TPTZ"),
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
		  }),
		  new HTML({
			  id: "eventsDiv",
			  content: "<div style='float:right;'>Some Events:</div>"
		  })
	  ]
  });

  var iEvent = 0;

  function handleChange(oEvent) {
	  var oTP = oEvent.oSource;
	  var oInput = jQuery("#eventsDiv");
	  var sValue = oEvent.getParameter("value");
	  var bValid = oEvent.getParameter("valid");
	  iEvent++;
	  oInput.html("Change - Event " + iEvent + "<br>TimePicker " + oTP.getId() + ":<br>" + sValue + "<br>valid: " + bValid);
  }

  function handleTimezoneButtonPress(e) {
	  Localization.setTimezone(e.getSource().getText());
	  Element.getElementById("TPTZ").setValue("");
  }

  app.addPage(page);
});
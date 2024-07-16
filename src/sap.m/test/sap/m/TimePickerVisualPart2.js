sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/App",
  "sap/m/Toolbar",
  "sap/m/TimePicker",
  "sap/m/Text",
  "sap/ui/model/type/Time",
  "sap/ui/model/json/JSONModel",
  "sap/m/Page",
  "sap/m/HBox",
  "sap/m/library",
  "sap/m/Switch",
  "sap/ui/Device",
  "sap/ui/thirdparty/jquery"
], function(
  Element,
  HTML,
  IconPool,
  App,
  Toolbar,
  TimePicker,
  Text,
  Time,
  JSONModel,
  Page,
  HBox,
  mobileLibrary,
  Switch,
  Device,
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

  var options = [
	  {
		  id: "TP12",
		  value: "09:15:16 PM",
		  localeId: "en_US",
		  title: "Departure time"
	  },
	  {
		  id: "TP24",
		  value: "09:15:16 PM",
		  localeId: "en_US",
		  displayFormat: "HH:mm"
	  },
	  {
		  id: "TP25",
		  value: "09:15:16 PM",
		  localeId: "en_US",
		  displayFormat: "B HH:mm"
	  },
	  {
		  id: "TP26",
		  value: "09:15:16 PM",
		  localeId: "en_US",
		  displayFormat: "B hh:mm"
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

  app.addPage(page);
});
sap.ui.define([
  "sap/ui/qunit/utils/nextUIUpdate",
  "sap/base/i18n/Localization",
  "sap/ui/core/Element",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/VBox",
  "sap/m/DateTimePicker",
  "sap/m/Slider",
  "sap/m/Button",
  "sap/ui/core/Core"
], function(nextUIUpdate, Localization, Element, App, Page, VBox, DateTimePicker, Slider, Button, Core) {
  "use strict";
  // Note: the HTML page 'DateTimePickerWithTimezone.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");
  var UI5Date = sap.ui.require("sap/ui/core/date/UI5Date");

  var page1 = new Page("page1", {
	  title:"DateTimePicker with Timezone",
	  content : [
		  new VBox("VBOX1", {
			  width: "40%",
			  items: [
				  new DateTimePicker("DTP1", {
					  displayFormat: "medium",
					  width: "100%",
					  dateValue: UI5Date.getInstance(Date.UTC(2000, 10, 20, 8, 10, 10)),
					  showTimezone: true,
					  timezone: "America/Argentina/Buenos_Aires"
				  }),
				  new DateTimePicker("DTP2", {
					  displayFormat: "medium",
					  width: "100%",
					  dateValue: UI5Date.getInstance(Date.UTC(2000, 10, 20, 8, 10, 10)),
					  timezone: "America/Argentina/Buenos_Aires"
				  }),
				  new DateTimePicker("DTP3", {
					  displayFormat: "medium",
					  width: "100%",
					  dateValue: UI5Date.getInstance(Date.UTC(2021, 2, 24, 22, 30)),
					  showTimezone: true
				  })
			  ]
		  }),
		  new Slider("SLD1", {
			  value: 40,
			  step: 1,
			  min: 1,
			  max: 100,
			  change: function(oEvent) {
				  Element.getElementById("VBOX1").setWidth(this.getValue() + "%");
			  }
		  }),
		  new Button("BTN20", {
			  text: "20%",
			  press: function() {
				  Element.getElementById("SLD1").setValue(20);
				  Element.getElementById("VBOX1").setWidth("20%");
			  }
		  }),
		  new Button("BTN40", {
			  text: "40%",
			  press: function() {
				  Element.getElementById("SLD1").setValue(40);
				  Element.getElementById("VBOX1").setWidth("40%");
			  }
		  }),
		  new Button("BTNBA", {
			  text: "America/Argentina/Buenos_Aires",
			  press: function() {
				  Element.getElementById("DTP1").setTimezone(this.getText());
				  Element.getElementById("DTP2").setTimezone(this.getText());
			  }
		  }),
		  new Button("BTNNY", {
			  text: "America/New_York",
			  press: function() {
				  Element.getElementById("DTP1").setTimezone(this.getText());
				  Element.getElementById("DTP2").setTimezone(this.getText());
			  }
		  }),
		  new Button("BTNS", {
			  text: "Europe/Sofia",
			  press: function() {
				  Element.getElementById("DTP1").setTimezone(this.getText());
				  Element.getElementById("DTP2").setTimezone(this.getText());
			  }
		  }),
		  new Button("BTNLASTTIME", {
			  text: "Etc/GMT+12",
			  press: function() {
				  Element.getElementById("DTP1").setTimezone(this.getText());
				  Element.getElementById("DTP2").setTimezone(this.getText());
			  }
		  }),
		  new Button("BTNCHANGEAPPTIMEZONE", {
			  text: "change app timezone",
			  press: function() {
				  var sTZ1 = "Europe/Sofia",
					  sTZ2 = "Europe/Berlin",
					  sCurrentTimezone = Localization.getTimezone();

				  sap.ui.getCore();

				  Localization.setTimezone(sCurrentTimezone === sTZ1 ? sTZ2 : sTZ1);
				  nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;

				  Element.getElementById("DTP1").invalidate();
				  Element.getElementById("DTP2").invalidate();
				  Element.getElementById("DTP3").invalidate();
			  }
		  })
	  ],
  });

  app.addPage(page1);
  app.placeAt("body");
});
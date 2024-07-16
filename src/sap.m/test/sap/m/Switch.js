sap.ui.define([
  "sap/m/Switch",
  "sap/m/Label",
  "sap/m/library",
  "sap/ui/layout/VerticalLayout",
  "sap/ui/core/HTML",
  "sap/m/VBox",
  "sap/m/App",
  "sap/m/Page",
  "sap/base/Log"
], function(Switch, Label, mobileLibrary, VerticalLayout, HTML, VBox, App, Page, Log) {
  "use strict";

  // shortcut for sap.m.SwitchType
  const SwitchType = mobileLibrary.SwitchType;

  // Note: the HTML page 'Switch.html' loads this module via data-sap-ui-on-init

  var oSwitch = new Switch({
	  id: "switch_regular",
	  change: function(oControlEvent) {
		  Log.info("Event fired: 'change' state property " + this.getState() + " on", this);
	  }
  });

  var oLabel = new Label({
	  text: "Airplane Mode",
	  labelFor: oSwitch
  }).addStyleClass("customLabel");

  var oSwitchDisabled = new Switch({
	  id: "switch_disabled",
	  enabled: false
  });

  var oSwitchNoText = new Switch({
	  id: "switch_notext",
	  customTextOn: " ",
	  customTextOff: " ",
  });

  var oSwitchAcceptReject = new Switch({
	  id: "switch_semantic",
	  state: true,
	  type: SwitchType.AcceptReject
  });

  var oSwitchAcceptRejectLabelled = new Switch({
	  state: false,
	  type: SwitchType.AcceptReject
  });

  var oLabelAcceptReject = new Label({
	  text: "You agree, that we may use cookies",
	  labelFor: oSwitchAcceptRejectLabelled
  }).addStyleClass("customLabel");

  var oVLayout = new VerticalLayout("switch_page", {
	  content: [
		  new HTML({ content: "<h3>Default</h3>" }),
		  oLabel,
		  oSwitch,
		  new HTML({ content: "<hr>" }),

		  new HTML({ content: "<h3>Disabled</h3>" }),
		  oSwitchDisabled,
		  new HTML({ content: "<hr>" }),

		  new HTML({ content: "<h3>No text</h3>" }),
		  oSwitchNoText,
		  new HTML({ content: "<hr>" }),

		  new HTML({ content: "<h3>Semantic</h3>" }),
		  oSwitchAcceptReject,
		  new HTML({ content: "<hr>" }),

		  new HTML({ content: "<h3>Semantic with label</h3>" }),
		  oLabelAcceptReject,
		  oSwitchAcceptRejectLabelled,
		  new HTML({ content: "<hr>" })
	  ]
  });

  var oVLayout2 = new VBox("switch_page2", {
	  renderType: "Bare",
	  items:[
		  new HTML({ content: "<h3>In VBox with renderType Bare </h3>" }),
		  new Switch({
			  id: "switch_vbox",
			  change: function(oControlEvent) {
				  Log.info("Event fired: 'change' state property " + this.getState() + " on", this);
			  }
		  }),
		  new HTML({ content: "<hr>" })
	  ]
  });

  new App().addPage(new Page({
	  title: "sap.m.Switch",
	  content: [
		  oVLayout,
		  oVLayout2
	  ]
  }).addStyleClass("sapUiContentPadding")).placeAt("body");
});
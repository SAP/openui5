sap.ui.define([
  "sap/m/App",
  "sap/m/Input",
  "sap/m/CheckBox",
  "sap/m/TextArea",
  "sap/m/Button",
  "sap/m/MessageToast",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/List",
  "sap/m/InputListItem",
  "sap/m/Page"
], function(App, Input, CheckBox, TextArea, Button, MessageToast, Select, Item, List, InputListItem, Page) {
  "use strict";
  // Note: the HTML page 'MessageToast.html' loads this module via data-sap-ui-on-init

  // app
  var oApp = new App("myApp", {
	  initialPage: "page1"
  }),

  // duration
  oInput0 = new Input({
	  value: 10000,
	  type: "Number",
	  placeholder: "Duration"
  }),

  // width
  oInput1 = new Input({
	  value: "15em",
	  type: "Text",
	  placeholder: "Width"
  }),

  // offset
  oInput2 = new Input({
	  value: "0 0",
	  type: "Text",
	  placeholder: "Offset"
  }),

  // auto close
  oCheckBox0 = new CheckBox({
	  selected: true
  }),

  // message
  oTextArea0 = new TextArea({
	  value: "The message to be displayed",
	  width: "100%"
  }),

  // button to show the message toast notification
  oButton0 = new Button("show-button", {
	  text: "Show",
	  press: function() {
		  var sKey;

		  // message toast
		  MessageToast.show(oTextArea0.getValue(), {
			  duration: Number(oInput0.getValue()),
			  width: oInput1.getValue(),
			  my: sKey = oSelect0.getSelectedItem().getKey(),
			  at: sKey,
			  offset: oInput2.getValue(),
			  autoClose: oCheckBox0.getSelected(),
			  onClose: function() {
				  MessageToast.show("The onClose callback function was called", {
					  width: "100%",
					  my: "CenterBottom",
					  at: "CenterBottom"
				  });
			  }
		  });
	  }
  }),

  oButton1 = new Button("show-button-2", {
	  text: "Open MessageToast",
	  press: function() {
		  var sKey;

		  // message toast
		  MessageToast.show(oTextArea0.getValue(), {
			  duration: Number(oInput0.getValue()),
			  width: oInput1.getValue(),
			  my: sKey = oSelect0.getSelectedItem().getKey(),
			  at: sKey,
			  offset: oInput2.getValue(),
			  autoClose: oCheckBox0.getSelected()

		  });
	  }
  }),

  // select
  oSelect0 = new Select("select-list", {
	  items: [
		  new Item("begin-bottom" ,{
			  key: "begin bottom",
			  text: "begin bottom"
		  }),

		  new Item("begin-center" ,{
			  key: "BeginCenter",
			  text: "BeginCenter"
		  }),

		  new Item("begin-top" ,{
			  key: "BeginTop",
			  text: "BeginTop"
		  }),

		  new Item("center-bottom" ,{
			  key: "CenterBottom",
			  text: "CenterBottom"
		  }),

		  new Item("center-center" ,{
			  key: "CenterCenter",
			  text: "CenterCenter"
		  }),

		  new Item("center-top" ,{
			  key: "CenterTop",
			  text: "CenterTop"
		  }),

		  new Item("end-bottom" ,{
			  key: "EndBottom",
			  text: "EndBottom"
		  }),

		  new Item("end-center" ,{
			  key: "EndCenter",
			  text: "EndCenter"
		  }),

		  new Item("end-top" ,{
			  key: "EndTop",
			  text: "EndTop"
		  }),

		  new Item("left-bottom" ,{
			  key: "LeftBottom",
			  text: "LeftBottom"
		  }),

		  new Item("left-center" ,{
			  key: "LeftCenter",
			  text: "LeftCenter"
		  }),

		  new Item("left-top" ,{
			  key: "LeftTop",
			  text: "LeftTop"
		  }),

		  new Item("right-bottom" ,{
			  key: "RightBottom",
			  text: "RightBottom"
		  }),

		  new Item("right-center" ,{
			  key: "RightCenter",
			  text: "RightCenter"
		  }),

		  new Item("right-top" ,{
			  key: "RightTop",
			  text: "RightTop"
		  })
	  ],

	  selectedItemId: "center-center"
  }),

  // list
  oList = new List({
	  inset : false,
	  width : "100%",
	  items : [
				  new InputListItem({
					  label : "Position",
					  content : oSelect0
				  }),

				  new InputListItem({
					  label : "Duration",
					  content : oInput0
				  }),

				  new InputListItem({
					  label : "Width",
					  content : oInput1
				  }),

				  new InputListItem({
					  label : "Offset",
					  content : oInput2
				  }),

				  new InputListItem({
					  label : "Auto close",
					  content : oCheckBox0
				  })
	  ]
  }),

  // page
  oPage1 = new Page("page1", {
	  title: "Mobile MessageToast control",
	  enableScrolling : true,
	  content : [ oList, oTextArea0, oButton0, oButton1 ]
  });

  oApp.addPage(oPage1);
  oApp.placeAt("body");
});
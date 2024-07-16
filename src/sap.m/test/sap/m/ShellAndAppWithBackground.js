sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/Shell",
  "sap/m/SplitApp",
  "sap/m/Page",
  "sap/ui/core/HTML",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Switch",
  "sap/m/Slider",
  "sap/m/Select",
  "sap/ui/core/Item"
], function(Element, Shell, SplitApp, Page, HTML, Button, Label, Switch, Slider, Select, Item) {
  "use strict";
  // Note: the HTML page 'ShellAndAppWithBackground.html' loads this module via data-sap-ui-on-init

  var oShell = new Shell("myShell", {
	  title: "Shell AND App with Backgrounds",
	  logo: "images/SAPUI5.png",
	  headerRightText: "Avid Themer"
  });

  var oApp = new SplitApp("myApp", {
	  masterPages: new Page("page1", {
		  title: "Some Master"
	  }),
	  detailPages: new Page("page2", {
		  title:"Page 1",
		  content : [
			  new HTML({content:"<div><br><h3>Shell Settings</h3>"}),

			  // background image switches
			  new Button({
				  text : "Stretched Cheetah",
				  press : function() {
					  oShell.setBackgroundImage("images/demo/nature/huntingLeopard.jpg");
					  oShell.setBackgroundColor("");
					  oShell.setBackgroundOpacity(1);
					  Element.getElementById("opacitySlider").setValue(1);
					  oShell.setBackgroundRepeat(false);
					  Element.getElementById("repeatSwitch").setState(false);
				  }
			  }),

			  new Button({
				  text : "Repeating translucent red Cheetah",
				  press : function() {
					  oShell.setBackgroundImage("images/demo/nature/huntingLeopard.jpg");
					  oShell.setBackgroundColor("#f00");
					  oShell.setBackgroundOpacity(0.6);
					  Element.getElementById("opacitySlider").setValue(0.6);
					  oShell.setBackgroundRepeat(true);
					  Element.getElementById("repeatSwitch").setState(true);
				  }
			  }),

			  new Button({
				  text : "Clear Background",
				  press : function() {
					  oShell.setBackgroundImage("");
					  oShell.setBackgroundColor("");
					  oShell.setBackgroundOpacity(1);
					  Element.getElementById("opacitySlider").setValue(1);
					  oShell.setBackgroundRepeat(false);
					  Element.getElementById("repeatSwitch").setState(false);
				  }
			  }),

			  new Label({
				  text: "Repeat background:"
			  }),

			  new Switch("repeatSwitch", {
				  change: function(oEvent){
					  var bRepeatState = oEvent.getParameter("state");
					  oShell.setBackgroundRepeat(bRepeatState);
				  }
			  }),

			  new HTML({content:"<br>"}),

			  new Slider("opacitySlider", {
				  width: "50%",
				  value: 1,
				  min: 0,
				  max: 1,
				  step: 0.01,
				  liveChange: function(oEvent){
					  var value = oEvent.getParameter("value");
					  oShell.setBackgroundOpacity(value);
				  }
			  }),


			  new HTML({content:"<div><br><h3>App Settings</h3>"}),

			  // app background image switches
			  new Button({
				  text : "Stretched Cheetah",
				  press : function() {
					  oApp.setBackgroundImage("images/demo/nature/huntingLeopard.jpg");
					  oApp.setBackgroundColor("");
					  oApp.setBackgroundOpacity(1);
					  Element.getElementById("appOopacitySlider").setValue(1);
					  oApp.setBackgroundRepeat(false);
					  Element.getElementById("appRepeatSelect").setSelectedKey("stretch");
				  }
			  }),

			  new Button({
				  text : "Repeating translucent red Cheetah",
				  press : function() {
					  oApp.setBackgroundImage("images/demo/nature/huntingLeopard.jpg");
					  oApp.setBackgroundColor("#f00");
					  oApp.setBackgroundOpacity(0.6);
					  Element.getElementById("appOopacitySlider").setValue(0.6);
					  oApp.setBackgroundRepeat(true);
					  Element.getElementById("appRepeatSelect").setSelectedKey("repeat");
				  }
			  }),

			  new Button({
				  text : "Clear Background",
				  press : function() {
					  oApp.setBackgroundImage("");
					  oApp.setBackgroundColor("");
					  oApp.setBackgroundOpacity(1);
					  Element.getElementById("appOopacitySlider").setValue(1);
					  oApp.setBackgroundRepeat(false);
					  Element.getElementById("appRepeatSelect").setSelectedKey("stretch");
				  }
			  }),

			  new Select("appRepeatSelect", {items:[
					  new Item({text:"Stretch background",key:"stretch"}),
					  new Item({text:"Repeat background",key:"tile"})
				  ],
				  change: function(oEvent){
					  var selectedItem = oEvent.getParameter("selectedItem");
					  oApp.setBackgroundRepeat(selectedItem.getKey() === "stretch" ? false : true);
				  }
			  }),

			  new Slider("appOopacitySlider", {
				  width: "50%",
				  min: 0,
				  max: 1,
				  step: 0.01,
				  liveChange: function(oEvent){
					  var value = oEvent.getParameter("value");
					  oApp.setBackgroundOpacity(value);
				  }
			  })
		  ]

	  })
  });

  oShell.setApp(oApp).placeAt("body");
});
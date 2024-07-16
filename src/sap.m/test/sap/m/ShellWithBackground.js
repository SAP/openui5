sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/Shell",
  "sap/m/SplitApp",
  "sap/m/Page",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Switch",
  "sap/ui/core/HTML",
  "sap/m/Slider"
], function(Element, Shell, SplitApp, Page, Button, Label, Switch, HTML, Slider) {
  "use strict";
  // Note: the HTML page 'ShellWithBackground.html' loads this module via data-sap-ui-on-init

  var oShell = new Shell("myShell", {
	  title: "Shell with Backgrounds",
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
			  })
		  ]

	  })
  });

  oShell.setApp(oApp).placeAt("body");
});
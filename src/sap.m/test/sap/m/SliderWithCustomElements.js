sap.ui.define([
  "sap/ui/core/IconPool",
  "sap/m/SliderTooltipBase",
  "sap/m/Page",
  "sap/m/App",
  "sap/ui/core/Element",
  "sap/m/Slider",
  "sap/m/SliderTooltipBaseRenderer",
  "sap/base/Log",
  "sap/ui/thirdparty/jquery"
], function(IconPool, SliderTooltipBase, Page, App, Element, Slider, SliderTooltipBaseRenderer, Log, jQuery) {
  "use strict";
  // Note: the HTML page 'SliderWithCustomElements.html' loads this module via data-sap-ui-on-init

  var oPage1 = new Page("page1", {
			  title: "Mobile Slider Control"
		  });


  new App("myApp", {initialPage: "page1", pages: [oPage1]}).placeAt("body");


  var CustomScale = Element.extend("sap.xx.custom.CustomScale",{
			  metadata: {
				  interfaces: [
					  "sap.m.IScale"
				  ],
				  library: "sap.xx.custom",
			  }
		  });

  CustomScale.prototype.getTickmarksBetweenLabels = function () {
	  return 2;
  };
  CustomScale.prototype.calcNumberOfTickmarks = function() {
	  return 31;
  };
  CustomScale.prototype.getLabel = function (fValue) {
	  return fValue + " May";
  };

  IconPool.insertFontFaceStyle();

  var oSlider14 = new Slider({
	  min: 1,
	  max: 31,
	  value: 1,
	  step: 1,
	  enableTickmarks: true,
	  scale: new CustomScale(),
	  progress : true,
	  visible: true,
	  enabled: true,
	  liveChange: function(oControlEvent) {
		  Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
	  },
	  change : function(oControlEvent) {
		  Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
	  }
  });

  var CustomTooltip = SliderTooltipBase.extend("sap.xx.custom.CustomTooltip", {
	  library: "sap.xx.custom",
	  metadata: {
		  properties: {
			  showButtons: { type: "boolean", defaultValue: true },
			  dateValue: { type: "float", defaultValue: 0 }
		  }
	  },
	  renderer: function (oRm, oControl) {
		  // its a recommendation to you the base renderer as it has some special responsive behavior
		  SliderTooltipBaseRenderer.render.apply({
			  renderTooltipContent: function (oRm, oControl) {
				  // you can write any DOM here - render controls or anything you want
				  // (inline elements are not recommended as you need to style them on your own)
				  oRm.write("<div");
				  oRm.addClass("sapCustomSliderTooltip");

				  if (!oControl.getShowButtons()) {
					  oRm.addClass("sapCustomTooltipWitouthButtons");
				  }
				  oRm.write(">");

				  // keep the value of each tooltip as a property
				  var fValue = oControl.getValue();

				  // you can write some value from a property here
				  oRm.write("<div");
				  oRm.addClass("sapCustomTooltipValue");
				  oRm.write(">");

				  // display the value
				  oRm.write(oControl.aDays[fValue % 7] + " " + fValue + " May");
				  oRm.write("</div>");

				  if (oControl.getShowButtons()) {
					  oRm.write("<div");
					  oRm.addClass("sapCustomTooltipButtons");
					  oRm.write(">");

					  oRm.write("<span class='sapCustomTooltipButton sapCustomTooltipButtonUp'></span>");
					  oRm.write("<span class='sapCustomTooltipButton sapCustomTooltipButtonDown'></span>");

					  oRm.write("</div>");
				  }
				  oRm.write("</div>");
			  }
		  }, arguments);
	  }
  });

  CustomTooltip.prototype.init = function () {
	  this.aDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  };

  CustomTooltip.prototype.sliderValueChanged = function (fValue) {
	  this.setDateValue(fValue);
  };

  CustomTooltip.prototype.getLabel = function (fValue) {
	  return this.aDays[fValue % 7] + " " + fValue + " May";
  };

  CustomTooltip.prototype.ontap = function (oEvent) {
	  var bButtonPressed = jQuery(oEvent.target).hasClass("sapCustomTooltipButton"),
			  bUp = jQuery(oEvent.target).hasClass("sapCustomTooltipButtonUp"),
			  bDown = jQuery(oEvent.target).hasClass("sapCustomTooltipButtonDown");

	  if (bButtonPressed) {
		  var iValue = parseInt(this.getDomRef("value").innerHTML.split(" ")[1]),
				  iFinalValue;

		  if (bUp) {
			  this.getParent().updateTooltipsPositionAndState(this, iValue + 1);
			  iFinalValue = iValue + 1;
		  } else if (bDown) {
			  this.getParent().updateTooltipsPositionAndState(this, iValue - 1);
			  iFinalValue = iValue - 1;
		  }
	  }
	  this.getParent().setValue(iFinalValue);
  };

  var oSlider15 = new Slider({
			  min: 1,
			  max: 31,
			  value: 1,
			  step: 1,
			  showAdvancedTooltip: true,
			  customTooltips: [new CustomTooltip()],
			  enableTickmarks: true,
			  progress : true,
			  visible: true,
			  enabled: true,
			  liveChange: function(oControlEvent) {
				  Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			  },
			  change : function(oControlEvent) {
				  Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			  }
		  }).addStyleClass("slider-margin"),

		  oSlider16 = new Slider({
			  min: 1,
			  max: 31,
			  value: 2,
			  step: 1,
			  scale: new CustomScale(),
			  showAdvancedTooltip: true,
			  customTooltips: [new CustomTooltip()],
			  enableTickmarks: true,
			  progress : true,
			  visible: true,
			  enabled: true,
			  liveChange: function(oControlEvent) {
				  Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			  },
			  change : function(oControlEvent) {
				  Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			  }
		  }).addStyleClass("slider-margin");

  // Wait for a tick, so the Page would be rendered and the Sliders could be resized properly on any browser
  setTimeout(function () {
	  [oSlider14, oSlider15, oSlider16].forEach(oPage1.addContent, oPage1);
  });
});
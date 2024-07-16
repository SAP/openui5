sap.ui.define([
  "sap/m/SliderTooltipBase",
  "sap/ui/core/IconPool",
  "sap/ui/core/Element",
  "sap/m/RangeSlider",
  "sap/m/SliderTooltipBaseRenderer",
  "sap/base/Log",
  "sap/ui/thirdparty/jquery"
], function(SliderTooltipBase, IconPool, Element, RangeSlider, SliderTooltipBaseRenderer, Log, jQuery) {
  "use strict";
  // Note: the HTML page 'RangeSliderWithCustomElements.html' loads this module via data-sap-ui-on-init

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

  new RangeSlider("RangeSlider15",{
	  min: 1,
	  max: 31,
	  value: 2,
	  value2: 15,
	  enableTickmarks: true,
	  scale: new CustomScale(),
	  progress : true,
	  visible: true,
	  enabled: true,
	  liveChange: function (oControlEvent) {
		  Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
	  },
	  change: function (oControlEvent) {
		  Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
	  }
  }).placeAt("content7");

  IconPool.insertFontFaceStyle();

  var CustomTooltip = SliderTooltipBase.extend("sap.xx.custom.CustomTooltip", {
	  library: "sap.xx.custom",
	  metadata: {
		  properties: {
			  showButtons: { type: "boolean", defaultValue: false },
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
				  oRm.write("</div>")

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
  };

  new RangeSlider("RangeSlider16",{
	  min: 1,
	  max: 31,
	  value: 4,
	  value2: 20,
	  enableTickmarks: true,
	  showAdvancedTooltip: true,
	  customTooltips: [new CustomTooltip({showButtons: true}), new CustomTooltip({showButtons:true})],
	  progress : true,
	  visible: true,
	  enabled: true,
	  liveChange: function (oControlEvent) {
		  Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
	  },
	  change: function (oControlEvent) {
		  Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
	  }
  }).placeAt("content8").addStyleClass("rangeSlider-margin");

  new RangeSlider("RangeSlider17",{
	  min: 1,
	  max: 31,
	  value: 6,
	  value2: 26,
	  enableTickmarks: true,
	  scale: new CustomScale(),
	  showAdvancedTooltip: true,
	  customTooltips: [new CustomTooltip(), new CustomTooltip()],
	  progress : true,
	  visible: true,
	  enabled: true,
	  liveChange: function (oControlEvent) {
		  Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
	  },
	  change: function (oControlEvent) {
		  Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
	  }
  }).placeAt("content9").addStyleClass("rangeSlider-margin");
});
sap.ui.define([
  "sap/ui/core/IconPool",
  "sap/m/SliderTooltipBase",
  "sap/m/App",
  "sap/m/Label",
  "sap/m/RangeSlider",
  "sap/m/Slider",
  "sap/ui/core/Element",
  "sap/m/SliderTooltipBaseRenderer",
  "sap/m/Page",
  "sap/ui/thirdparty/jquery"
], function(IconPool, SliderTooltipBase, App, Label, RangeSlider, Slider, Element, SliderTooltipBaseRenderer, Page, jQuery) {
  "use strict";
  // Note: the HTML page 'SliderCustomization.html' loads this module via data-sap-ui-on-init

  var oApp = new App("myApp", { initialPage: "page1" });

  var createExampleDescriptionLabel = function (sText) {
	  return new Label({ text: sText }).addStyleClass("label-margin");
  };

  var createSlider = function (bRangeSlider, aTooltips, oScale, fValue, fValue2, bShowTickMarks) {
	  const SliderClass = bRangeSlider ? RangeSlider : Slider;
	  const settings = {
		  min: 1,
		  max: 31,
		  value: fValue || 15,
		  width: "80%",
		  enableTickmarks: bShowTickMarks,
		  showAdvancedTooltip: true,
		  scale: oScale,
		  customTooltips: aTooltips
	  };
	  if ( bRangeSlider ) {
		  settings.value2 = fValue2 || 24;
	  }
	  return new SliderClass(settings).addStyleClass("slider-margin");
  }

  IconPool.insertFontFaceStyle();

  var CustomScale = Element.extend("sap.xx.custom.CustomScale", {
	  metadata: {
		  interfaces: [
			  "sap.m.IScale"
		  ],
		  library: "sap.xx.custom"
	  }
  });

  // returns how much tickmarks should be placed between labels
  CustomScale.prototype.getTickmarksBetweenLabels = function () {
	  return 2;
  };

  // returns the total number of tickmarks - 1
  CustomScale.prototype.calcNumberOfTickmarks = function () {
	  return 31;
  };

  // should be implemented if you need special responsive behavior
  CustomScale.prototype.handleResize = function () {
	  var fPixelRatio = (window.outerWidth - 8) / window.innerWidth;
	  jQuery(".sapMSliderLabel").each(function(iIndex, oSliderLabel) {
		  if(fPixelRatio > 1.09) {
			  oSliderLabel.classList.add("sapMSliderLabelZoomed");
		  }
		  else {
			  oSliderLabel.classList.remove("sapMSliderLabelZoomed");
		  }
	  });
  };

  // adds some acc adjustments to the scale (optional)
  CustomScale.prototype.getLabel = function (fValue, oSlider) {
	  return parseFloat(fValue) + " May";
  };

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

					  oRm.write("<span title= 'button up' class='sapCustomTooltipButton sapCustomTooltipButtonUp'></span>");
					  oRm.write("<span title= 'button down' class='sapCustomTooltipButton sapCustomTooltipButtonDown'></span>");

					  oRm.write("</div>");
				  }

				  oRm.write("</div>");
			  }
		  }, arguments);
	  }
  });

  CustomTooltip.prototype.init = function () {
	  this.aDays = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
  }

  // this method is called if the value of the slider has been updated
  CustomTooltip.prototype.sliderValueChanged = function (fValue) {
	  this.setDateValue(fValue);
  };

  CustomTooltip.prototype.getLabel = function (fValue) {
	  return this.aDays[fValue % 7] + " " + parseFloat(fValue) + " May";
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

	  if (this.getParent().getMetadata().getName() === "sap.m.Slider") {
		  this.getParent().setValue(iFinalValue);
	  }
  };
  var oPage1 = new Page("page1", {
	  title: "Mobile Slider Control",
	  content: [
		  createExampleDescriptionLabel("Custom Tooltip (read-only): "),
		  createSlider(false, [new CustomTooltip()], null, 15, 0, false),
		  createSlider(true, [new CustomTooltip(), new CustomTooltip()], null, 7, false),
		  createExampleDescriptionLabel("Custom Tooltip (interactive): "),
		  createSlider(false, [new CustomTooltip({ showButtons: true })], null, 15, null, true),
		  createSlider(true, [new CustomTooltip({ showButtons: true }), new CustomTooltip({ showButtons: true })], null, 15, null, true),
		  createExampleDescriptionLabel("Custom scale: "),
		  createSlider(false, [], new CustomScale(), 15, 0, true),
		  createSlider(true, [], new CustomScale(), 7, 24, true),
		  createExampleDescriptionLabel("Custom Tooltip (read-only) + Custom scale: "),
		  createSlider(false, [new CustomTooltip()], new CustomScale(), 15, null, true),
		  createSlider(true, [new CustomTooltip(), new CustomTooltip()], new CustomScale(), 7, 24, true),]
  });

  oApp.addPage(oPage1);
  oApp.placeAt("body");
});
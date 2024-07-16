sap.ui.define([
  "sap/ui/core/Item",
  "sap/m/WheelSlider",
  "sap/m/WheelSliderContainer"
], function(Item, WheelSlider, WheelSliderContainer) {
  "use strict";
  // Note: the HTML page 'WheelSlider.html' loads this module via data-sap-ui-on-init

  function generatePickerListValues(from, to, step) {
	  var aValues = [];

	  for (var iIndex = from; iIndex <= to; iIndex += 1) {
		  if (iIndex % step === 0) {
			  aValues.push(new Item({
				  key: iIndex.toString(),
				  text: iIndex.toString()
			  }));
		  }
	  }

	  return aValues;
  }

  new WheelSlider("slider1", {
	  selectedKey: "65",
	  items: generatePickerListValues(0, 150, 1),
	  isCyclic: false,
	  label: "Years"
  }).placeAt("container1");

  new WheelSliderContainer("slidercontainer1", {
	  sliders: [
		  new WheelSlider("slidercontainer1-listYears", {
			  items: generatePickerListValues(0, 150, 1),
			  label: "Periods",
			  selectedKey: "65",
			  isCyclic: false
		  }),
		  new WheelSlider("slidercontainer1-listMins", {
			  items: generatePickerListValues(0, 59, 5),
			  label: "Minutes",
			  isCyclic: true
		  }),
		  new WheelSlider("slidercontainer1-listSecs", {
			  items: generatePickerListValues(0, 59, 5),
			  label: "Seconds",
			  isCyclic: true
		  }),
		  new WheelSlider("slidercontainer1-format", {
			  items: [
				  new Item({ key: "am", text: "AM" }),
				  new Item({ key: "pm", text: "PM" })
			  ],
			  label: "Format",
			  isCyclic: false
		  })
	  ]
  }).placeAt("content");
});
sap.ui.define([
  "sap/ui/integration/controls/ListContentItem",
  "sap/suite/ui/microchart/BulletMicroChart",
  "sap/suite/ui/microchart/BulletMicroChartData",
  "sap/suite/ui/microchart/StackedBarMicroChart",
  "sap/suite/ui/microchart/StackedBarMicroChartBar"
], function(ListContentItem, BulletMicroChart, BulletMicroChartData, StackedBarMicroChart, StackedBarMicroChartBar) {
  "use strict";
  // Note: the HTML page 'ListContentItem.html' loads this module via data-sap-ui-on-init

  var oLCI1 = new ListContentItem({
	  title: "BulletMicroChart",
	  description: "Description",
	  chartDisplayValue: "This is the value of the chart",
	  chart: new BulletMicroChart({
		  size: "Responsive",
		  targetValue: 90,
		  minValue: 0,
		  maxValue: 100,
		  scaleColor: "Light",
		  actual: new BulletMicroChartData({
			  value: 55,
			  color: "Good"
		  })
	  })
  });

  var oLCI2 = new ListContentItem({
	  title: "StackedBarMicroChart",
	  description: "Description",
	  chartDisplayValue: "This is the value of the chart",
	  chart: new StackedBarMicroChart({
		  size: "Responsive",
		  maxValue: 100,
		  bars: [
			  new StackedBarMicroChartBar({
				  value: 55,
				  color: "Good",
				  label: "First bar label, custom"
			  }),
			  new StackedBarMicroChartBar({
				  value: 300,
				  color: "Good",
				  label: "Second bar label, custom"
			  })
		  ]
	  })
  });

  oLCI1.placeAt("preview");
  oLCI2.placeAt("preview");
});
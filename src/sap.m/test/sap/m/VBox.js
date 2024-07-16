sap.ui.define([
  "sap/m/App",
  "sap/m/Image",
  "sap/m/FlexItemData",
  "sap/m/VBox",
  "sap/m/Page",
  "sap/ui/core/HTML"
], function(App, Image, FlexItemData, VBox, Page, HTML) {
  "use strict";
  // Note: the HTML page 'VBox.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp", {initialPage:"page1"});

  // Create items
  var oItem1 = new Image({
	  src: "images/mark1.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 1})
  });

  var oItem2 = new Image({
	  src: "images/mark2.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 2})
  });

  var oItem3 = new Image({
	  src: "images/mark3.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 3})
  });

  // Create a vertical flexbox with items
  var oVBox1 = new VBox("vbox1", {
	  items:[
		  oItem1,
		  oItem2,
		  oItem3
	  ]
  });


  // Create items
  var oItem4 = new Image({
	  src: "images/mark1.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 1})
  });

  var oItem5 =new Image({
	  src: "images/mark2.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 2})
  });

  var oItem6 = new Image({
	  src: "images/mark3.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 3})
  });

  // Create a vertical flexbox with items
  var oVBox2 = new VBox("vbox2", {
	  items:[
		  oItem4,
		  oItem5,
		  oItem6
	  ]
  });
  oVBox2.setDirection('ColumnReverse');


  var page1 = new Page("page1", {
	  title:"Mobile VBox Control",
	  content:[
		  new HTML({content:"<h2>Vertical layout</h2>"}),
		  oVBox1,
		  new HTML({content:"<h2>Reverse vertical layout</h2>"}),
		  oVBox2
	  ]
  });

  app.addPage(page1).placeAt("body");
});
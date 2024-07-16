sap.ui.define([
  "sap/m/App",
  "sap/m/Image",
  "sap/m/FlexItemData",
  "sap/m/HBox",
  "sap/m/Page",
  "sap/ui/core/HTML"
], function(App, Image, FlexItemData, HBox, Page, HTML) {
  "use strict";
  // Note: the HTML page 'HBox.html' loads this module via data-sap-ui-on-init

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

  // Create a horizontal flexbox with items
  var oHBox1 = new HBox("hbox1", {
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

  // Create a horizontal flexbox with items
  var oHBox2 = new HBox("hbox2", {
	  items:[
		  oItem4,
		  oItem5,
		  oItem6
	  ]
  });
  oHBox2.setDirection('RowReverse');


  var page1 = new Page("page1", {
	  title:"Mobile HBox Control",
	  content:[
		  new HTML({content:"<h2>Horizontal layout</h2>"}),
		  oHBox1,
		  new HTML({content:"<h2>Reverse horizontal layout</h2>"}),
		  oHBox2
	  ]
  });

  app.addPage(page1).placeAt("body");
});
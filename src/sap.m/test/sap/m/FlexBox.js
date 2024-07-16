sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/Button",
  "sap/m/Image",
  "sap/m/FlexItemData",
  "sap/m/FlexBox",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Input",
  "sap/m/Page",
  "sap/m/App"
], function(Element, Button, Image, FlexItemData, FlexBox, VerticalLayout, Input, Page, App) {
  "use strict";
  // Note: the HTML page 'FlexBox.html' loads this module via data-sap-ui-on-init

  var oButton1 = new Button({
	  text: "Change Visibility",
	  press: function(){
		  var bIsVisible = Element.getElementById("__image1-__clone1").getVisible();
		  bIsVisible = !bIsVisible;
		  Element.getElementById("__image1-__clone1").setVisible(bIsVisible);
	  }
  });

  // Create items
  var oImage1 = new Image({
	  src: "images/mark1.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 1, shrinkFactor: 1})
  });

  var oImage2 = new Image({
	  src: "images/mark2.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 1, shrinkFactor: 1})
  });

  var oImage3 = new Image({
	  src: "images/mark3.png",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 1, shrinkFactor: 1})
  });

  // Create a vertical flexbox with items
  var oFlexBox1 = new FlexBox("flexbox1", {
	  fitContainer: true,
	  wrap: "Wrap",
	  alignContent: "Stretch",
	  justifyContent: "Start",
	  items: [
		  oImage1.clone(),
		  oImage2.clone(),
		  oImage3.clone(),
		  oImage1.clone(),
		  oImage2.clone(),
		  oImage3.clone(),
		  oImage1.clone(),
		  oImage2.clone(),
		  oImage3.clone()
	  ]
  });

  var oLayout1 = new VerticalLayout("layout", {
	  content: [
				  oButton1,
				  oFlexBox1
			  ]
  });

  var oImage4 = new Image({
	  src: "images/action.png",
	  height: "44px",
	  alt: "test image",
	  decorative: false,
	  densityAware: false,
	  layoutData: new FlexItemData({growFactor: 1, shrinkFactor: 1, baseSize: "0%"})
  });

  var oInput1 = new Input({
	  placeholder: "Some input",
	  width: "auto",
	  layoutData: new FlexItemData({growFactor: 1, shrinkFactor: 1, baseSize: "0%"})
  });

  var oButton2 = new Button({
	  text: "Button",
	  layoutData: new FlexItemData({growFactor: 1, shrinkFactor: 1, baseSize: "0%"})
  });

  // Create a flexbox with wrapped items
  var oFlexBox2 = new FlexBox("flexbox2", {
	  renderType: "Div",
	  width: "100%",
	  items: [
		  oImage4.clone(),
		  oInput1.clone(),
		  oButton2.clone()
	  ]
  });

  // Create a flexbox with bare items
  var oFlexBox3 = new FlexBox("flexbox3", {
	  renderType: "Bare",
	  width: "100%",
	  items: [
		  oImage4.clone(),
		  oInput1.clone(),
		  oButton2.clone()
	  ]
  });

  const oButton3 = new Button({
	  width: "200px",
	  type: "Emphasized",
	  layoutData: new FlexItemData({
		  shrinkFactor: 1
	  })
  });

  const oButton4 = new Button({
	  width: "200px",
	  type: "Emphasized",
	  layoutData: new FlexItemData({
		  shrinkFactor: 0,
		  growFactor: 3
	  })
  });

  var oFlexBox4 = new FlexBox({
	  renderType: "Bare",
	  alignItems: "Center",
	  justifyContent: "Center",
	  items: [
				  oButton3.clone().setText("1").addStyleClass("sapUiSmallMarginEnd"),
				  oButton3.clone().setText("2").addStyleClass("sapUiSmallMarginEnd"),
				  oButton3.clone().setText("3").addStyleClass("sapUiSmallMarginEnd"),
				  oButton4.clone().setText("4").addStyleClass("sapUiSmallMarginEnd"),
				  oButton3.clone().setText("5")
	  ]
  });

  var page1 = new Page("page1", {
	  title:"FlexBox Test Page",
	  content:[
		  oLayout1,
		  oFlexBox2,
		  oFlexBox3,
		  oFlexBox4
	  ]
  });

  var app = new App("myApp", {initialPage:"page1"});
  app.addPage(page1).placeAt("body");
});
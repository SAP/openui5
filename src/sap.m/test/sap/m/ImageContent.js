sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/ImageContent",
  "sap/m/FlexBox",
  "sap/m/Label",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Switch",
  "sap/ui/layout/form/SimpleForm",
  "sap/ui/core/Title",
  "sap/m/Page",
  "sap/m/App",
  "sap/ui/util/Mobile"
], function(MessageToast, ImageContent, FlexBox, Label, Select, Item, Switch, SimpleForm, Title, Page, App, Mobile) {
  "use strict";
  // Note: the HTML page 'ImageContent.html' loads this module via data-sap-ui-on-init

  Mobile.init();

  var fnPress = function(oEvent) {
	  MessageToast.show("The image content is pressed.");
  };

  var oImageContent = new ImageContent({
	  src: "images/headerImg1.png",
	  description: "image description",
	  press : fnPress
  });
  oImageContent.addStyleClass("sapUiSmallMargin");

  var oFlexBox = new FlexBox("flexbox", {
	  items : [oImageContent],
	  alignItems: "Start",
	  justifyContent: "SpaceAround"
  });
  var oPictureLbl = new Label({
	  text : "Header Image",
	  labelFor : "picture-change"
  });

  var oPictureSlct = new Select("picture-value", {
	  change : function(oE) {
		  var selectedItem = oE.getParameter("selectedItem");
		  oImageContent.setSrc(selectedItem.getKey());
	  },
	  items : [new Item("picture-item-1", {
		  key : "",
		  text : "No picture"
	  }),  new Item("picture-item-2", {
		  key : "images/headerImg1.png",
		  text : "Image1"
	  }), new Item("picture-item-3", {
		  key : "images/headerImg2.jpg",
		  text : "Image2"
	  }), new Item("picture-item-5", {
		  key : "sap-icon://travel-expense",
		  text : "Icon1"
	  }), new Item("picture-item-4", {
		  key : "images/SAPLogo.jpg",
		  text : "SAPLogo"
	  })],
	  selectedItem : "picture-item-2"
  });

  var oPressLbl = new Label({
	  text : "Press Action",
	  labelFor : "press-action"
  });

  var oPressSwtch = new Switch({
	  id : "press-action",
	  state : true,
	  change : function(oE) {
		  var bState = oE.getParameter("state");

		  if (bState) {
			  oImageContent.attachPress(fnPress);
		  } else {
			  oImageContent.detachPress(fnPress);
		  }
	  }
  });

  var editableSimpleForm = new SimpleForm("controls", {
	  maxContainerCols : 2,
	  editable : true,
	  content : [
		  new Title ({
			  text : "Modify Image Content"
		  }),
		  oPictureLbl,
		  oPictureSlct,
		  oPressLbl,
		  oPressSwtch
	  ]
  });

  var oPage = new Page({
	  content : [oFlexBox, editableSimpleForm]
  });

  new App("myApp", {
	  pages : [oPage]
  }).placeAt("content");
});
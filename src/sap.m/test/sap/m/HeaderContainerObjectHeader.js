sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/type/Integer",
  "sap/ui/layout/VerticalLayout",
  "sap/m/NumericContent",
  "sap/m/Label",
  "sap/m/HeaderContainer",
  "sap/m/Button",
  "sap/m/HBox",
  "sap/m/library",
  "sap/m/Input",
  "sap/m/ObjectHeader",
  "sap/m/ObjectAttribute",
  "sap/m/ObjectStatus",
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Page",
  "sap/m/App",
  "sap/ui/util/Mobile"
], function(
  JSONModel,
  Integer,
  VerticalLayout,
  NumericContent,
  Label,
  HeaderContainer,
  Button,
  HBox,
  mobileLibrary,
  Input,
  ObjectHeader,
  ObjectAttribute,
  ObjectStatus,
  SimpleForm,
  Page,
  App,
  Mobile
) {
  "use strict";

  // shortcut for sap.m.FlexAlignItems
  const FlexAlignItems = mobileLibrary.FlexAlignItems;

  // Note: the HTML page 'HeaderContainerObjectHeader.html' loads this module via data-sap-ui-on-init

  Mobile.init();

  var oData = {
	  "scrollStep" : 200,
	  "scrollTime" : 500,
	  "items" : [{
		  "content" : [{
			  "type" : "numeric",
			  "value" : 125,
			  "scale" : "M",
			  "unit" : "EUR",
			  "size" : "M",
			  "valueColor" : "Error",
			  "indicator" : "Up",
			  "isFormatterValue" : false,
			  "truncateValueTo" : 4
		  }, {
			  "value" : "USD, Current"
		  }]
	  }, {
		  "content" : [{
			  "type" : "numeric",
			  "value" : 1115,
			  "scale" : "M",
			  "unit" : "USD",
			  "size" : "M",
			  "valueColor" : "Critical",
			  "indicator" : "Up",
			  "isFormatterValue" : false,
			  "truncateValueTo" : 4
		  }, {
			  "value" : "USD, Current"
		  }]
	  }]
  };

  var oModel = new JSONModel(oData);

  var fnContentFactory = function(sId, oContext) {
	  var aContent = oContext.getProperty("content");
	  var oLayout = new VerticalLayout();
	  for (var i = 0; i < aContent.length; i++) {
		  if (aContent[i].type === "numeric") {
			  var oNumericContent = new NumericContent({
				  value : "{" + oContext.sPath + "/content/" + i + "/value}",
				  scale : "{" + oContext.sPath + "/content/" + i + "/scale}",
				  indicator : "{" + oContext.sPath + "/content/" + i + "/indicator}",
				  formatterValue : "{" + oContext.sPath + "/content/" + i + "/isFormatterValue}",
				  truncateValueTo : "{" + oContext.sPath + "/content/" + i + "/truncateValueTo}",
				  state : "Loaded",
				  valueColor : "{" + oContext.sPath + "/content/" + i + "/valueColor}"
			  });
			  oLayout.addContent(oNumericContent);
		  } else if (!aContent[i].type) {
			  var oLabel = new Label({
				  text : "{" + oContext.sPath + "/content/" + i + "/value}"
			  });
			  oLayout.insertContent(oLabel, 0);
		  }
	  }
	  return oLayout;
  };

  var oHeaderContainer = new HeaderContainer("headerContainer", {
	  scrollStep: "{/scrollStep}",
	  scrollTime: "{/scrollTime}",
	  content: {
		  path: "/items",
		  factory: fnContentFactory
	  }
  });

  var oAddButton = new Button("add-button", {
	  width : "10rem",
	  enabled : true,
	  text : "Add content",
	  press : function(oEvent) {
		  oData.items.push({
			  content : [{
				  type : "numeric",
				  value : 125,
				  scale : "M",
				  unit : "EUR",
				  size : "M",
				  valueColor : "Good",
				  indicator : "Up",
				  isFormatterValue : false,
				  truncateValueTo : 4
			  }, {
				  value : "USD, Current"
			  }]
		  });
		  oRemoveButton.setEnabled(true);
		  oModel.checkUpdate();
	  }
  });

  var oRemoveButton = new Button("remove-button", {
	  width : "10rem",
	  text : "Remove last content",
	  press : function(oEvent) {
		  oData.items.pop();
		  if (oData.items.length === 0) {
			  oRemoveButton.setEnabled(false);
		  }
		  oModel.checkUpdate();
	  }
  });

  var oScrollStepInput =  new HBox({
	  alignItems : FlexAlignItems.Center,
	  items : [
		  new Label({
			  text : "Scroll Step",
			  labelFor : "scroll-step-input"
		  }), new Input("scroll-step-input", {
			  width : "4rem",
			  placeholder : "Enter value ...",
			  value : {
				  path : "/scrollStep",
				  type : new Integer()
			  },
			  liveChange : function(oEvt) {
				  if (oEvt.getParameter("newValue") === "") {
					  oData[scrollStep] = undefined;
					  oModel.checkUpdate();
				  }
			  }
		  })
	  ]
  });

  var oScrollTimeInput =  new HBox({
	  alignItems : FlexAlignItems.Center,
	  items : [
		  new Label({
			  text : "Scroll Time",
			  labelFor : "scroll-time-input"
		  }), new Input("scroll-time-input", {
			  width : "4rem",
			  placeholder : "Enter value ...",
			  value : {
				  path : "/scrollTime",
				  type : new Integer()
			  },
			  liveChange : function(oEvt) {
				  if (oEvt.getParameter("newValue") === "") {
					  oData[scrollTime] = undefined;
					  oModel.checkUpdate();
				  }
			  }
		  })
	  ]
  });

  /*use case 10 object header + header container as XML fragment */
  var oh10 = new ObjectHeader("oh10", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "HeaderContainer inside sap.m.ObjectHeader",
	  icon: "sap-icon://nutrition-activity",
	  number: "1.684,00",
	  numberUnit: "Euro",
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: "Success",
	  attributes: [
		  new ObjectAttribute({
			  title: "Manufacturer",
			  text: "ACME Corp"
		  })
	  ],
	  statuses: [
		  new ObjectStatus({
			  title: "Approval",
			  text: "Pending",
			  icon: "sap-icon://inbox",
			  state: "Warning"
		  })
	  ]
  });

  var oAdjustForm = new SimpleForm({
	  maxContainerCols: 2,
	  editable: true,
	  content: [
		  oAddButton,
		  oRemoveButton,
		  oScrollStepInput,
		  oScrollTimeInput
	  ]
  });

  var oPage = new Page("initial-page", {
	  showHeader: false,
	  content: [oh10, oAdjustForm]
  });

  oh10.setHeaderContainer(oHeaderContainer);

  new App("myApp", {
	  pages : [oPage]
  }).placeAt("content").setModel(oModel);
});
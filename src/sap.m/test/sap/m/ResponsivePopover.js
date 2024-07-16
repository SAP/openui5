sap.ui.define([
  "sap/m/App",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/ui/model/json/JSONModel",
  "sap/m/Button",
  "sap/m/library",
  "sap/ui/core/InvisibleText",
  "sap/m/ResponsivePopover",
  "sap/m/Bar",
  "sap/m/NavContainer",
  "sap/m/Page",
  "sap/m/Label",
  "sap/base/Log"
], function(
  App,
  List,
  StandardListItem,
  JSONModel,
  Button,
  mobileLibrary,
  InvisibleText,
  ResponsivePopover,
  Bar,
  NavContainer,
  Page,
  Label,
  Log
) {
  "use strict";

  // shortcut for sap.m.PlacementType
  const PlacementType = mobileLibrary.PlacementType;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  // Note: the HTML page 'ResponsivePopover.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp", {initialPage:"page1"});

  //create the list
  var oList = new List({
  });

  var data = {
	  navigation : [ {
		  title : "Travel Expend",
		  description : "Access the travel expend workflow",
		  icon : "images/travel_expend.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel and expense report",
		  description : "Access travel and expense reports",
		  icon : "images/travel_expense_report.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel Request",
		  description : "Access the travel request workflow",
		  icon : "images/travel_request.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Work Accidents",
		  description : "Report your work accidents",
		  icon : "images/wounds_doc.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel Settings",
		  description : "Change your travel worflow settings",
		  icon : "images/settings.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel Expend",
		  description : "Access the travel expend workflow",
		  icon : "images/travel_expend.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel and expense report",
		  description : "Access travel and expense reports",
		  icon : "images/travel_expense_report.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel Request",
		  description : "Access the travel request workflow",
		  icon : "images/travel_request.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Work Accidents",
		  description : "Report your work accidents",
		  icon : "images/wounds_doc.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  }, {
		  title : "Travel Settings",
		  description : "Change your travel worflow settings",
		  icon : "images/settings.png",
		  iconInset : false,
		  type : "Navigation",
		  press : 'detailPage'
	  } ]
  };

  var oItemTemplate1 = new StandardListItem({
	  title : "{title}",
	  description : "{description}",
	  icon : "{icon}",
	  iconInset : "{iconInset}",
	  type : "{type}"
  });

  function bindListData(data, itemTemplate, list)
  {
	  var oModel = new JSONModel();
	  // set the data for the model
	  oModel.setData(data);
	  // set the model to the list
	  list.setModel(oModel);

	  // bind Aggregation
	  list.bindAggregation("items", "/navigation", itemTemplate);
  }

  bindListData(data, oItemTemplate1, oList)
  //end of the list creation

  var oBeginButton = new Button("actionButton1",{
	  text: "Action1",
	  type: ButtonType.Reject,
	  press: function(){
		  oResponsivePopover.setShowCloseButton(true);
	  }
  });

  var oEndButton = new Button({
	  text: "Action2",
	  type: ButtonType.Accept,
	  press: function(){
		  oResponsivePopover.setShowCloseButton(false);
	  }
  });

  var oInvisibleText = new InvisibleText({text: "I have a hidden label"});

  var oResponsivePopover = new ResponsivePopover("popoverBottom", {
	  placement: PlacementType.Bottom,
	  title: "I'm Responsive now",
	  showHeader: true,
	  beginButton: oBeginButton,
	  endButton: oEndButton,
	  horizontalScrolling: false,
	  beforeOpen: function(oEvent){
		  Log.info("before popover opens!!!");
	  },
	  afterOpen: function(oEvent){
		  Log.info("popover is opened finally!!!");
	  },
	  beforeClose: function(oEvent){
		  Log.info("before popover closes!!!");
	  },
	  afterClose: function(oEvent){
		  Log.info("popover is closed properly!!!");
	  },
	  content: [
		  oList
	  ],
	  ariaLabelledBy: oInvisibleText.getId()
  });

  var oButton = new Button("btnPopoverBottom", {
	  text : "Popover Bottom",
	  press : function() {
		  oResponsivePopover.openBy(this);
	  }
  });


  /* Second ResponsivePopover with NavContainer as content*/

  /*************************************************************************/
  /*     Create NavContainer with two pages inside and the first page      */
  /*     contains a footer, there's no footer on the popover.              */
  /*=======================================================================*/

  //create the list
  var oList1 = new List("listInPopover", {
  });

  var oItemTemplate2 = new StandardListItem({
	  title : "{title}",
	  description : "{description}",
	  icon : "{icon}",
	  iconInset : "{iconInset}",
	  type : "{type}",
	  press: handlePress
  });

  bindListData(data, oItemTemplate2, oList1);

  function handlePress(e) {
	  oNavContainer.to("detailPage");
  }


  var footer = new Bar({
	  contentLeft: [],
	  contentMiddle: [
		  new Button({icon: "sap-icon://globe", tooltip: "Global Action 1"}),
		  new Button({icon: "sap-icon://globe", tooltip: "Global Action 2"}),
		  new Button({icon: "sap-icon://globe", tooltip: "Global Action 3"})
	  ],
	  contentRight: []
  });

  //begin: creating navContainer
  var oNavContainer = new NavContainer({
	  initialPage: "listPage"
  });

  var oPage1 = new Page("listPage", {
	  title: "Click on the list (with footer)",
	  showNavButton: false,
	  footer: footer,
	  content: [
		  oList1
	  ]
  });

  var oPage2 = new Page("detailPage", {
	  title: "Detail Page",
	  showNavButton: true,
	  showHeader: true,
	  navButtonText: "listPage",
	  navButtonPress: function(){ oNavContainer.back(); },
	  content: [
		  new Button("closeButton1", {
			  text: "Close",
			  press: function(){
				  oResponsivePopover1.close();
			  }
		  })
	  ]
  });

  oNavContainer.addPage(oPage1).addPage(oPage2);

  var oButton1 = new Button("btnPopoverWithNavContainer", {
	  text: "NavContainer as Content",
	  press: function(){
		  oResponsivePopover1.openBy(this);
	  }
  });

  var oResponsivePopover1 = new ResponsivePopover("popoverWithNavContainer", {
	  placement: PlacementType.Bottom,
	  title: "I'm adaptive now",
	  showHeader: false,
	  contentWidth: "320px",
	  contentHeight: "400px",
	  beforeOpen: function(oEvent){
		  Log.info("before popover opens!!!");
	  },
	  afterOpen: function(oEvent){
		  Log.info("popover is opened finally!!!");
	  },
	  beforeClose: function(oEvent){
		  Log.info("before popover closes!!!");
	  },
	  afterClose: function(oEvent){
		  Log.info("popover is closed properly!!!");
	  },
	  content: [
		  oNavContainer
	  ],
	  ariaLabelledBy: oInvisibleText.getId()
  });

  /*
	  Third ResponsivePopover with NavContainer as content, but the header is
	  resposivepopover not in the pages of navcontainer.

	  The close button should be added to the header in responsivepopover not
	  to the navcontainer.
  */

  var oButton2 = new Button("btnPopoverHeader", {
	  text: "Header in Popover",
	  press: function(){
		  oResponsivePopover2.openBy(this);
	  }
  });

  var oPage3 = new Page("listPage1", {
	  title: "Click on the list",
	  showNavButton: false,
	  showHeader: false,
	  content: [
		  new Button("btnNextPage", {
			  text: "Next Page",
			  press: function(){
				  oNavContainer1.to("detailPage1");
			  }
		  })
	  ]
  });

  var oPage4 = new Page("detailPage1", {
	  title: "Detail Page",
	  showHeader: false,
	  content: [
		  new Button({
			  text: "Navigate Back",
			  press: function(){
				  oNavContainer1.back();
			  }
		  }),
		  new Button("closeButton2", {
			  text: "Close",
			  press: function(){
				  oResponsivePopover2.close();
			  }
		  })
	  ]
  });

  var oNavContainer1 = new NavContainer({
	  initialPage: "listPage1",
	  pages: [oPage3, oPage4]
  });

  var oResponsivePopover2 = new ResponsivePopover("popoverHeader", {
	  placement: PlacementType.Bottom,
	  customHeader: new Bar({
		  contentMiddle: new Label({
			  text: "Shared title in Pages"
		  })
	  }),
	  contentWidth: "320px",
	  contentHeight: "400px",
	  content: oNavContainer1,
	  ariaLabelledBy: oInvisibleText.getId()
  });

  var page = new Page("page1", {
	  title:"Page 1",
	  content: [
		  oButton, oButton1, oButton2, oInvisibleText
	  ]
  });

  app.addPage(page);
  app.placeAt("body");
});
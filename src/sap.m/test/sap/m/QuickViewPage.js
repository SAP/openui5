sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/m/library",
  "sap/m/App",
  "sap/m/QuickViewPage",
  "sap/m/QuickViewGroup",
  "sap/m/QuickViewGroupElement",
  "sap/m/Panel",
  "sap/m/Page"
], function(JSONModel, mobileLibrary, App, QuickViewPage, QuickViewGroup, QuickViewGroupElement, Panel, Page) {
  "use strict";

  // shortcut for sap.m.QuickViewGroupElementType
  const QuickViewGroupElementType = mobileLibrary.QuickViewGroupElementType;

  // Note: the HTML page 'QuickViewPage.html' loads this module via data-sap-ui-on-init

  //		create JSON model instance
  var oModel = new JSONModel();

  // JSON sample data
  var mData = {
	  pageId	: "customPageId",
	  title	: "John Doe",
	  description: "Department Manager1",
	  groups: [
		  {
			  visible : false,
			  heading: "Job",
			  elements: [
				  {
					  label: "Company address",
					  value: "Sofia, Boris III, 136A Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis aliquam nibh, et vulputate risus efficitur id."
				  },
				  {
					  label: "Company",
					  value: "SAP AG",
					  url: "http://sap.com",
					  elementType: QuickViewGroupElementType.pageLink,
					  pageLinkId: "customPageId4"
				  }
			  ]
		  },
		  {
			  heading: "Other",
			  elements: [
				  {
					  label: "Best Friend",
					  value: "Michael Muller",
					  elementType: QuickViewGroupElementType.pageLink,
					  pageLinkId: "customPageId2"
				  },
				  {
					  label: "Favorite Player",
					  value: "Ivaylo Ivanov",
					  elementType: QuickViewGroupElementType.pageLink,
					  pageLinkId: "customPageId3"
				  },
				  {
					  label: "Favorite Food",
					  value: "",
					  elementType: QuickViewGroupElementType.text
				  }
			  ]
		  }

	  ]
  };

  // set the data for the model
  oModel.setData(mData);

  // create and add app
  var app = new App("myApp", {initialPage:"quickViewPage"});
  app.setModel(oModel);
  app.placeAt("body");

  var oQuickViewPage = new QuickViewPage({
	  pageId : "{/pageId}",
	  title: "{/title}",
	  description: "{/description}",
	  groups : {
		  path : '/groups',
		  templateShareable : true,
		  template : new QuickViewGroup({
			  heading : '{heading}',
			  elements : {
				  path : 'elements',
				  templateShareable : true,
				  template : new QuickViewGroupElement({
					  label: "{label}",
					  value: "{value}",
					  url: "{url}",
					  type: "{elementType}",
					  pageLinkId: "{pageLinkId}"
				  })
			  }
		  })
	  }
  });

  var oQuickViewPage1 = new QuickViewPage({
	  pageId : "{/pageId}",
	  title: "Link as title - ONE line",
	  titleUrl: "https://www.sap.com",
	  groups : {
		  path : '/groups',
		  templateShareable : true,
		  template : new QuickViewGroup({
			  heading : '{heading}',
			  elements : {
				  path : 'elements',
				  templateShareable : true,
				  template : new QuickViewGroupElement({
					  label: "{label}",
					  value: "{value}",
					  url: "{url}",
					  type: "{elementType}",
					  pageLinkId: "{pageLinkId}"
				  })
			  }
		  })
	  }
  });

  var oQuickViewPage2 = new QuickViewPage({
	  pageId : "{/pageId}",
	  title: "Link as title - TWO lines - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis aliquam nibh, et vulputate risus efficitur id.",
	  titleUrl: "https://www.sap.com",
	  groups : {
		  path : '/groups',
		  templateShareable : true,
		  template : new QuickViewGroup({
			  heading : '{heading}',
			  elements : {
				  path : 'elements',
				  templateShareable : true,
				  template : new QuickViewGroupElement({
					  label: "{label}",
					  value: "{value}",
					  url: "{url}",
					  type: "{elementType}",
					  pageLinkId: "{pageLinkId}"
				  })
			  }
		  })
	  }
  });

  var oPanel = new Panel('quickViewPagePanel', {
	  width : '320px',
	  content : [
		  oQuickViewPage
	  ]
  });

  var oPanel1 = new Panel({
	  width : '320px',
	  content : [
		  oQuickViewPage1
	  ]
  });

  var oPanel2 = new Panel({
	  width : '320px',
	  content : [
		  oQuickViewPage2
	  ]
  });


  // create and add a page
  var page = new Page("quickViewPage", {
	  title : "Quick View Page",
	  content : [
		  oPanel,
		  oPanel1,
		  oPanel2
	  ]
  });
  app.addPage(page);
});
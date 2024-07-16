sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/Device",
  "sap/ui/table/Table",
  "sap/ui/table/Column",
  "sap/m/Label",
  "sap/m/Text",
  "sap/m/RatingIndicator",
  "sap/ui/core/Control",
  "sap/m/Link",
  "sap/m/Image",
  "sap/ui/layout/form/Form",
  "sap/ui/layout/form/GridLayout",
  "sap/ui/layout/form/FormContainer",
  "sap/ui/layout/form/FormElement",
  "sap/ui/layout/form/GridElementData",
  "sap/m/Input",
  "sap/ui/ux3/DataSetSimpleView",
  "sap/ui/ux3/DataSet",
  "sap/ui/ux3/DataSetItem",
  "sap/m/List",
  "sap/m/library",
  "sap/m/StandardListItem",
  "sap/m/SearchField",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Bar",
  "sap/ui/ux3/Shell",
  "sap/ui/ux3/NavigationItem",
  "sap/ui/thirdparty/jquery"
], function(
  JSONModel,
  Filter,
  FilterOperator,
  Device,
  Table,
  Column,
  Label,
  Text,
  RatingIndicator,
  Control,
  Link,
  Image,
  Form,
  GridLayout,
  FormContainer,
  FormElement,
  GridElementData,
  Input,
  DataSetSimpleView,
  DataSet,
  DataSetItem,
  List,
  mobileLibrary,
  StandardListItem,
  SearchField,
  App,
  Page,
  Bar,
  Shell,
  NavigationItem,
  jQuery
) {
  "use strict";

  // shortcut for sap.m.ListMode
  const ListMode = mobileLibrary.ListMode;

  // Note: the HTML page 'ResponsiveDemo.html' loads this module via data-sap-ui-on-init

  //Initialize the Model
  var data = {selectionIdx: -1, filter: "", products:[]};
  var aTitles = ["Notebook Basic", "UMTS PDA", "Easy Hand", "Deskjet Super Highspeed",
				 "Copperberry Cellphone", "Notebook LCD Display", "PC Power Station",
				 "Gaming Monster Pro", "ITelO FlexTop I4000", "ITelO FlexTop I6300c",
				 "Goldberry Cellphone", "ITelO FlexTop I9100", "Notebook Professional",
				 "Smart Office", "Deskjet Super Highspeed", "Notebook Basic XS"];
  for (var i = 0; i < aTitles.length; i++){
	  var sTitle = aTitles[i];
	  var oProduct = {
			  id: "" + i,
			  price: Math.floor(Math.random() * 1000) + 1 + " $",
			  category: "PC",
			  title: sTitle,
			  rating: Math.floor(Math.random() * 5) + 1,
			  selected: false
		  };
	  if (sTitle.indexOf("Notebook") >= 0){
		  oProduct.category = "Notebook";
	  } else if (sTitle.indexOf("Cellphone") >= 0 || sTitle.indexOf("PDA") >= 0) {
		  oProduct.category = "Mobile";
	  }
	  oProduct.image = "../images/" + oProduct.category + ".png";
	  data.products.push(oProduct);
  }

  var oModel = new JSONModel();
  oModel.setData(data);

  //Some helper functions
  function select(idx){
	  for (var i = 0; i < data.products.length; i++){
		  data.products[i].selected = false;
	  }
	  data.selectionIdx = -1;

	  if (idx >= 0 && idx < data.products.length) {
		  data.products[idx].selected = true;
		  data.selectionIdx = idx;
	  }

	  oModel.setData(data);
  }

  function doFilter(oEvent){
	  var sQuery = oEvent.getParameter("query");
	  currentFilter = !sQuery ? [] : [new Filter("title", FilterOperator.Contains, sQuery)];
	  select(-1);
	  currentControl.__refresh();
  }

  //Attach Media-Handler
  Device.media.attachHandler(function(mParams){
	  initialize(mParams.from);
  }, null, 'myPoints');


  //Initialization Code
  var oTable, oDataSet, oApp, oShell;

  var currentFilter = [];
  var currentControl;
  var currentMobile = null;

  var aPoints = [420, 750, 1130];

  function initialize(from) {
	  var aInfo;
	  if (from >= aPoints[2]) {
		  aInfo = initializeTable();
	  } else if (from >= aPoints[1]) {
		  aInfo = initializeDataset(false);
	  } else if (from >= aPoints[0]) {
		  aInfo = initializeDataset(true);
	  } else {
		  aInfo = initializeList();
	  }

	  var mobile = aInfo[1];

	  function init() {
		  currentControl = aInfo[0];
		  var ctrl;
		  if (!currentMobile) {
			  ctrl = initializeShell();
			  ctrl.removeAllContent();
			  ctrl.addContent(currentControl);
		  } else {
			  ctrl = oApp;
		  }

		  var uiArea = null;
		  if (!uiArea || uiArea.getContent()[0] != ctrl) {
			  ctrl.placeAt("root", "only");
		  }
	  }

	  if (currentMobile === null || currentMobile != mobile) {
		  sap.ui.require(["sap/ui/core/Theming"], function(Theming) {
			  if (!currentMobile && oShell) {
				  oShell._getSearchTool().close();
			  }

			  currentMobile = mobile;
			  jQuery("#root").html("");
			  Theming.setTheme(mobile ? "sap_belize" : "sap_bluecrystal");
			  function initOnThemeApplied() {
				  Theming.detachApplied(initOnThemeApplied);
				  init();
			  }
			  Theming.attachApplied(initOnThemeApplied);
		  });
	  } else {
		  init();
	  }
  }


  function initializeTable() {
	  if (oTable) {
		  oTable.__refresh();
		  return [oTable, false];
	  }

	  oTable = new Table({
		  selectionMode: "Single",
		  rowSelectionChange: function(oEvent) {
			  if (!oTable.__ignoreSelectionChange) {
				  select(oEvent.getParameter("rowIndex"));
			  }
		  },
		  columns: [
			  new Column({
				  label: new Label({text: "Product Name"}),
				  template: new Text().bindProperty("text", "title")
			  }),
			  new Column({
				  label: new Label({text: "Category"}),
				  template: new Text().bindProperty("text", "category")
			  }),
			  new Column({
				  label: new Label({text: "Price"}),
				  template: new Text().bindProperty("text", "price")
			  }),
			  new Column({
				  label: new Label({text: "Rating"}),
				  template: new RatingIndicator({editable: false}).bindProperty("value", "rating")
			  })
		  ],
		  rows: {path: "/products"}
	  });
	  oTable.setModel(oModel);

	  oTable.__refresh = function(){
		  oTable.__ignoreSelectionChange = true;
		  this.getBinding("rows").filter(currentFilter);
		  oTable.__ignoreSelectionChange = false;
		  this.setSelectedIndex(data.selectionIdx);
	  };

	  oTable.__refresh();

	  return [oTable, false];
  }


  function initializeDataset(bSingleRow) {
	  if (oDataSet) {
		  oDataSet.__refresh(true, bSingleRow);
		  return [oDataSet, false];
	  }

	  const ItemLayout = Control.extend("ItemLayout", {
		  metadata : {
			  aggregations : {
				  "link" : {type : "sap.m.Link", multiple : false},
				  "image" : {type : "sap.m.Image", multiple : false},
				  "form" : {type : "sap.ui.layout.form.Form", multiple : false}
			  }
		  },

		  renderer: {
			  apiVersion: 2,
			  render: function(rm, ctrl){
				  rm.openStart("div", ctrl);
				  rm.class("CustomItemLayout");
				  rm.openEnd();
					  rm.openStart("div");
					  rm.class("CustomItemLayoutInner");
					  rm.openEnd();
						  rm.openStart("div");
						  rm.class("CustomItemLayoutTitle");
						  rm.openEnd();
							  rm.renderControl(ctrl.getImage());
							  rm.openStart("div").openEnd();
								  rm.renderControl(ctrl.getLink());
							  rm.close("div");
						  rm.close("div");
						  rm.openStart("div");
						  rm.class("CustomItemLayoutCntnt");
						  rm.openEnd();
							  rm.renderControl(ctrl.getForm());
						  rm.close("div");
					  rm.close("div");
				  rm.close("div");
			  }
		  },

		  onBeforeRendering : function(){
			  if (this.resizeTimer) {
				  clearTimeout(this.resizeTimer);
				  this.resizeTimer = null;
			  }
		  },

		  onAfterRendering : function(){
			  var $This = this.$();
			  if ($This.parent().parent().hasClass("sapUiUx3DSSVSingleRow")) {
				  this._resize();
			  } else {
				  $This.addClass("CustomItemLayoutSmall");
			  }
		  },

		  _resize: function(){
			  if (!this.getDomRef()) {
				  return;
			  }
			  var $This = this.$();
			  if ($This.outerWidth() >= 440) {
				  $This.removeClass("CustomItemLayoutSmall").addClass("CustomItemLayoutLarge");
			  } else {
				  $This.removeClass("CustomItemLayoutLarge").addClass("CustomItemLayoutSmall");
			  }
			  setTimeout(this._resize.bind(this), 300);
		  }
	  });

	  function createTemplate(){
		  return new ItemLayout({
			  link: new Link({text: "{title}"}),
			  image: new Image({src: "{image}"}),
			  form: new Form({
				  width: "100%",
				  layout: new GridLayout(),
				  formContainers: [
					  new FormContainer({
						  formElements: [
							  new FormElement({
								  label: new Label({text: "Category", layoutData: new GridElementData({hCells: "5"})}),
								  fields: [new Input({value: "{category}", editable: false})]
							  }),
							  new FormElement({
								  label: new Label({text: "Price", layoutData: new GridElementData({hCells: "5"})}),
								  fields: [new Input({value: "{price}", editable: false})]
							  }),
							  new FormElement({
								  label: new Label({text: "Rating", layoutData: new GridElementData({hCells: "5"})}),
								  fields: [new RatingIndicator({value: "{rating}", editable: false})]
							  })
						  ]
					  })
				  ]
			  })
		  });
	  }

	  var oResponsiveView = new DataSetSimpleView({
		  floating: true,
		  responsive: true,
		  itemMinWidth: 200,
		  template: createTemplate()
	  });
	  var oRowView = new DataSetSimpleView({
		  floating: false,
		  responsive: false,
		  itemMinWidth: 0,
		  template: createTemplate()
	  });

	  oDataSet = new DataSet({
		  items: {
			  path: "/products",
			  template: new DataSetItem({
				  title : "{title}",
				  iconSrc : "{image}"
			  })
		  },
		  views: [oResponsiveView, oRowView],
		  showToolbar: false,
		  selectionChanged: function(oEvent){
			  select(oEvent.getParameter("newLeadSelectedIndex"));
		  }
	  });
	  oDataSet.setModel(oModel);

	  oDataSet.__refresh = function(bChangeCurrentView, bSingleRow){
		  if (bChangeCurrentView) {
			  this.setSelectedView(bSingleRow ? oDataSet.getViews()[1] : oDataSet.getViews()[0]);
		  }
		  this.getBinding("items").filter(currentFilter);
		  this.setLeadSelection(data.selectionIdx);
	  };

	  oDataSet.__refresh(true, bSingleRow);

	  return [oDataSet, false];
  }


  function initializeList() {
	  if (oApp) {
		  oApp.__refresh();
		  return [oApp, true];
	  }

	  var oList = new List({
		  inset : true,
		  showUnread: false,
		  mode: ListMode.SingleSelect,
		  items: {
			  path: "/products",
			  template: new StandardListItem({
				  type : "Active",
				  title : "{title}",
				  icon : "{image}",
				  selected : "{selected}"
			  })
		  },
		  selectionChange: function(oEvent){
			  select(oList.indexOfItem(oEvent.getParameter("listItem")));
		  }
	  });

	  oList.setModel(oModel);

	  var oSearchField = new SearchField({
		  value: "{/filter}",
		  search: doFilter
	  });

	  oSearchField.setModel(oModel);

	  oApp = new App({
		  pages: [new Page({
			  title : "Products",
			  content : [oList],
			  footer: new Bar({
				  contentRight: [oSearchField]
			  })
		  })]
	  });

	  oApp.__refresh = function(){
		  var oList = oApp.getPages()[0].getContent()[0];
		  oList.getBinding("items").filter(currentFilter);
	  };

	  oApp.__refresh();

	  return [oApp, true];
  }


  function initializeShell() {
	  if (oShell) {
		  return oShell;
	  }

	  oShell = new Shell({
		  appTitle: "Products",
		  showFeederTool: false,
		  fullHeightContent: true,
		  worksetItems: [new NavigationItem({
			  text: "Products"
		  })]
	  });

	  var oSearchField = oShell.getSearchField();
	  oSearchField.setModel(oModel);
	  oSearchField.setEnableListSuggest(false);
	  oSearchField.setEnableClear(true);
	  oSearchField.setEnableFilterMode(true);
	  oSearchField.bindProperty("value", "/filter");
	  oSearchField.attachSearch(function(oEvent){
		  doFilter(oEvent);
		  oShell._getSearchTool().close();
	  });

	  return oShell;
  }

  Device.media.initRangeSet('myPoints', aPoints);
});
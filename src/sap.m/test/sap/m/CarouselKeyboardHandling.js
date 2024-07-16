sap.ui.define([
  "sap/m/ImageRenderer",
  "sap/ui/core/mvc/XMLView",
  "sap/ui/core/Element",
  "sap/m/List",
  "sap/m/MessageToast",
  "sap/m/StandardListItem",
  "sap/ui/model/json/JSONModel",
  "sap/m/Dialog",
  "sap/ui/core/HTML",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/ScrollContainer",
  "sap/m/Bar",
  "sap/m/Popover",
  "sap/m/Text",
  "sap/m/HBox",
  "sap/m/Label",
  "sap/m/Switch",
  "sap/m/RadioButton",
  "sap/m/SearchField",
  "sap/m/Page",
  "sap/m/VBox",
  "sap/m/SegmentedButton",
  "sap/m/SegmentedButtonItem",
  "sap/m/Image",
  "sap/ui/Device",
  "sap/m/Carousel",
  "sap/m/App",
  "sap/base/Log",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/Controller"
], async function(
  ImageRenderer,
  XMLView,
  Element,
  List,
  MessageToast,
  StandardListItem,
  JSONModel,
  Dialog,
  HTML,
  Button,
  mobileLibrary,
  ScrollContainer,
  Bar,
  Popover,
  Text,
  HBox,
  Label,
  Switch,
  RadioButton,
  SearchField,
  Page,
  VBox,
  SegmentedButton,
  SegmentedButtonItem,
  Image,
  Device,
  Carousel,
  App,
  Log,
  jQuery
) {
  "use strict";

  // shortcut for sap.m.PlacementType
  const PlacementType = mobileLibrary.PlacementType;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  // Note: the HTML page 'CarouselKeyboardHandling.html' loads this module via data-sap-ui-on-init

  //Create demo page for mobile controls
  function createAList(inset, id) {
	  var oList = new List(id, {
		  inset : inset
	  });

	  var fnOnListItemPress = function() {
		  MessageToast.show("ListItem pressed");
	  };

	  var data = {
		  navigation : [ {
			  title : "Travel Expend",
			  description : "Access the travel expend workflow",
			  icon : "images/travel_expend.png",
			  iconInset : false,
			  type : "Navigation",
			  press : function() {
				  MessageToast.show(title + " pressed");
			  }
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
		  type : "{type}",
		  press : [fnOnListItemPress]
	  });

	  function bindListData(data, itemTemplate, list) {
		  var oModel = new JSONModel();
		  // set the data for the model
		  oModel.setData(data);
		  // set the model to the list
		  list.setModel(oModel);

		  // bind Aggregation
		  list.bindAggregation("items", "/navigation", itemTemplate);
	  }

	  bindListData(data, oItemTemplate1, oList);


	  return oList;
  }

  var oDialog1;
  function openDialog() {
	  oDialog1 = oDialog1 || new Dialog("dialog1", {
		  title : "World Domination",
		  content : [ new HTML({
			  content : "<p>Do you want to start a new world domination campaign?</p>"
		  }) ],
		  beginButton : new Button({
			  text : "Reject",
			  type : ButtonType.Reject,
			  press : function() {
				  oDialog1.close();
			  }
		  }),
		  endButton : new Button({
			  text : "Accept",
			  type : ButtonType.Accept,
			  press : function() {
				  oDialog1.close();
			  }
		  })
	  });

	  oDialog1.open();
  }

  var oPopover;
  function openPopover() {
	  if (!oPopover) {
		  var oList = createAList(true, "l1");

		  var oScrollContainer = new ScrollContainer({
			  horizontal : false,
			  vertical : true,
			  content : oList
		  });

		  var footer = new Bar({
			  contentMiddle : [ new Button({
				  icon : "images/SAPUI5.png"
			  }), new Button({
				  icon : "images/SAPUI5.png"
			  }), new Button({
				  icon : "images/SAPUI5.png"
			  }) ]
		  });

		  oPopover = new Popover({
			  placement : PlacementType.Bottom,
			  title : "Popover",
			  showHeader : true,
			  leftButton : new Button({
				  text : "Left"
			  }),
			  rightButton : new Button({
				  text : "Right"
			  }),
			  footer : footer,
			  content : [ oScrollContainer ]
		  });
	  }
	  oPopover.openBy(Element.getElementById("pob"));
  }

  function getAllControls() {
	  var aControls = [ new Text({
		  text : "This page features (almost) all UI5 Mobile Controls with visible UI parts at one glance. (This is a sap.m.Text control.)"
	  }),

	  new Button("pob", {
		  text : "This is a Button. Press to OPEN POPOVER",
		  press : openPopover
	  }),

	  new HBox({
		  items : [ new Label({
			  text : "This is a Switch:"
		  }), new Switch({
			  state : true
		  }) ]
	  }),

	  new HBox({
		  items : [ new Label({
			  text : "This is a Label, describing RadioButtons:"
		  }), new RadioButton({
			  selected : true
		  }), new RadioButton({
			  selected : false
		  }), new RadioButton({
			  selected : false
		  }) ]
	  }),

	  new SearchField({
		  placeholder : "Search for...",
		  showSearchButton : true
	  }),

	  createAList(true, "lins").setHeaderText("This is an inset List").setFooterText("This was an inset List") ];
	  return aControls;
  }

  var demoPage = new Page("page1", {
	  title : "All Controls",
	  enableScrolling: true,

	  headerContent : new Button({
		  text : "Open Dialog",
		  press : openDialog
	  }),

	  content : new VBox("vbox", {
		  items : getAllControls()
	  }),

	  footer : new Bar({
		  contentMiddle : new SegmentedButton('SegmentedBar', {
			  items : [ new SegmentedButtonItem("sb1", {
				  text : "Seg-"
			  }), new SegmentedButtonItem({
				  text : "-men-"
			  }), new SegmentedButtonItem({
				  text : "-ted"
			  }) ],
			  selectedItem : "sb1"
		  })
	  })
  });

  //Example of usage for 'BeforeShow' and 'AfterHide' events
  demoPage.addEventDelegate({
	  onBeforeShow: function(evt) {
		  Log.info("sap.m.Page: demo page is going to be shown");
	  },
	  onBeforeFirstShow: function(evt) {
		  Log.info("sap.m.Page: first time, demo page is going to be shown");
	  },
	  onAfterHide: function(evt) {
		  Log.info("sap.m.Page: demo page has been hidden");
		  //Remove content of 'demoPage' when it is discarded from the carousel
		  /* if(demoPage.getContent().length > 0) {
			  //Make sure you do not trigger re-rendering!
			  var i, ithCont;
			  for(i=0; i<demoPage.getContent().length; i++) {
				  ithCont = demoPage.getContent()[i];
				  demoPage.removeAggregation("content", ithCont, true);
				  ithCont.destroy();
			  }
		  } */
	  }
  });


  // Create Test View and Controller

  sap.ui.controller("carousel.qunit.controller", {

	  onInit: function(oEvent) {

	  }

  });

  var oView = await XMLView.create({ definition: jQuery('#mainView').html() });
  oView.setModel(new JSONModel({
	  items: [
			  { name: "Michelle", color: "orange", number: 3.14 },
			  { name: "Joseph", color: "blue", number: 1.618 },
			  { name: "David", color: "green", number: 0 }
	  ]
  }));


  /* poll control start */
  Image.extend("Lightbox", {
	  metadata: {
		  properties: {
			  large: "sap.ui.core.URI"
		  }
	  },
	  // set up the inner controls
	  init: function () {
		  var that = this;
		  this.attachTap(function () {
			  that._open();
		  });
	  },
	  // helper function to update the meta text
	  _open: function () {
		  var fnClose = function () {
			  oDialog.destroy();
			  oDialog = null;
		  };

		  oDialog = new Dialog({
			  stretch: Device.system.phone,
			  customHeader: new Bar({
				  contentLeft: new Label({
					  text: this.getAlt()
				  }),
				  contentRight: new Button({
					  icon: "sap-icon://decline",
					  press: function () {
						  oDialog.close();
					  }
				  })
			  }),
			  verticalScrolling: false,
			  horizontalScrolling: false,
			  afterClose: fnClose,
			  content: [
				  new Image({
					  src: this.getLarge()
				  }).attachPress(fnClose)
			  ]
		  }).addStyleClass("lightboxDialog");
		  oDialog.open();
	  },
	  // render control with the image renderer
	  renderer: ImageRenderer.render
  });


  // Create Images
  var imgDesert = new Image("desert", {
	  src: "images/demo/nature/desert.jpg",
	  alt: "Majestic Desert",
	  densityAware: false,
	  decorative: false
  });

  imgDesert.attachPress(function (e) {});

  var imgElephant = new Text("elephant", {
	  text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the" +
	  " industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and " +
	  "scrambled it to make a type specimen book"
  });

  var imgFishImg = new Text("fish", {
	  text: 'It is a long established fact that a reader will be distracted by the readable content of a page ' +
	  'when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution ' +
	  'of letters, as opposed to using "Content here, content here", making it look like readable English. '
  });


  var imgForest =  new Image("forest", {
	  src: "images/demo/nature/forest.jpg",
	  alt: "Forest in Fall",
	  densityAware: false,
	  decorative: false
  });

  var scrollForest = new ScrollContainer({
	  horizontal: false,
	  vertical: true,
	  content:[imgForest],
	  width:'100%',
	  height:'100%'
  });


  new Image("huntingLeopard", {
	  src: "images/demo/nature/huntingLeopard.jpg",
	  alt: "Hunting Leopard, Full Speed",
	  densityAware: false,
	  decorative: false
  });

  var imgPrairie = new Image("prairie", {
	  src: "images/demo/nature/prairie.jpg",
	  alt: "Prairie in Dawn",
	  densityAware: false,
	  decorative: false
  });

  var imgWaterfall = new Image("waterfall", {
	  src: "images/demo/nature/waterfall.jpg",
	  alt: "Waterfall in the Jungle",
	  densityAware: false,
	  decorative: false
  });


  var imgLeopard = new Image("leopard", {
	  src: "images/demo/nature/huntingLeopard.jpg",
	  alt: "Hunting Leopard, Full Speed",
	  densityAware: false,
	  decorative: false
  });

  var imgWaterfall2 = new Image("waterfall2", {
	  src: "images/demo/nature/waterfall.jpg",
	  alt: "Waterfall in the Jungle",
	  densityAware: false,
	  decorative: false
  });

  var imgLeopard2 = new Image("leopard2", {
	  src: "images/demo/nature/huntingLeopard.jpg",
	  alt: "Hunting Leopard, Full Speed",
	  densityAware: false,
	  decorative: false
  });

  var imgWaterfall3 = new Image("waterfall3", {
	  src: "images/demo/nature/waterfall.jpg",
	  alt: "Waterfall in the Jungle",
	  densityAware: false,
	  decorative: false
  });

  //Please uncomment any of the following lines to test the corresponding
  //carousel attribute
  var carousel = new Carousel("myCarousel", {
	  //pageIndicatorPlacement: sap.m.PlacementType.Top,
	  //pageIndicatorPlacement: sap.m.PlacementType.Bottom,
	  activePage: imgElephant,
	  //width: "50%",
	  height: "80%",
	  //showPageIndicator: false,
	  loop: true,
	  //showBusyIndicator: false,
	  pages: [imgDesert, oView, imgElephant, imgFishImg, demoPage, imgPrairie, scrollForest, imgWaterfall, imgLeopard, imgWaterfall2, imgLeopard2, imgWaterfall3]
	  //pages: [imgDesert, imgElephant, imgFishImg]
  });


  //Listen to 'pageChanged' events
  carousel.attachPageChanged(function(oControlEvent) {
	  Log.info("sap.m.Carousel: page changed: old: " + oControlEvent.getParameters().oldActivePageId );
	  Log.info("                              new: " + oControlEvent.getParameters().newActivePageId );
  });



  var appCarousel = new App("myApp", {initialPage:"carouselPage"});

  var carouselPage = new Page("carouselPage",
	  {title: "Carousel Test Page",
	  enableScrolling: false }
  );

  var oSegmentedButton1 = new SegmentedButton({
	  items:[new SegmentedButtonItem({text:'Label'}), new SegmentedButtonItem({text:'Label'}), new SegmentedButtonItem({text:'Label'})]
  });

  var oSegmentedButton2 = new SegmentedButton({
	  items:[new SegmentedButtonItem({text:'Label'}), new SegmentedButtonItem({text:'Label'}), new SegmentedButtonItem({text:'Label'})]
  });

  carouselPage.addContent(oSegmentedButton1);
  carouselPage.addContent(carousel);
  carouselPage.addContent(oSegmentedButton2);
  appCarousel.addPage(carouselPage);
  appCarousel.placeAt("body");
});
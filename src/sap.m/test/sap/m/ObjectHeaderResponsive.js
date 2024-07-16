sap.ui.define([
  "sap/ui/core/Lib",
  "sap/ui/core/format/NumberFormat",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel",
  "sap/m/SplitApp",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/ObjectHeader",
  "sap/ui/core/library",
  "sap/m/ObjectAttribute",
  "sap/m/ObjectStatus",
  "sap/m/IconTabBar",
  "sap/m/IconTabFilter",
  "sap/m/Input",
  "sap/m/Link",
  "sap/m/RatingIndicator",
  "sap/m/Text",
  "sap/m/Popover",
  "sap/m/library",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/ActionListItem",
  "sap/m/ProgressIndicator",
  "sap/m/HeaderContainer",
  "sap/m/Page",
  "sap/ui/Device"
], function(
  Library,
  NumberFormat,
  MessageBox,
  JSONModel,
  SplitApp,
  Button,
  Label,
  ObjectHeader,
  coreLibrary,
  ObjectAttribute,
  ObjectStatus,
  IconTabBar,
  IconTabFilter,
  Input,
  Link,
  RatingIndicator,
  Text,
  Popover,
  mobileLibrary,
  List,
  StandardListItem,
  ActionListItem,
  ProgressIndicator,
  HeaderContainer,
  Page,
  Device
) {
  "use strict";

  // shortcut for sap.ui.core.TextAlign
  const TextAlign = coreLibrary.TextAlign;

  // shortcut for sap.m.PlacementType
  const PlacementType = mobileLibrary.PlacementType;

  // shortcut for sap.ui.core.IconColor
  const IconColor = coreLibrary.IconColor;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2});

  // create model
  var model = new JSONModel({
	  items: [
		  {id: 5163, name:"Lorem Ipsum", amount: 1, price: 23.45, status: "Open"},
		  {id: 6342, name:"Dolor Sit Amet", amount: 1, price: 233.22, status: "In Process"},
		  {id: 1634, name:"Consectetur Adipisicing", amount: 1, price: 23.45, status: "Shipped"},
		  {id: 7856, name:"Elit Sed Do", amount: 3, price: 23.45, status: "Shipped"},
		  {id: 7245, name:"Eiusmod Tempor", amount: 1, price: 23.45, status: "Shipped"},
		  {id: 8342, name:"Incididunt Ut", amount: 1, price: 23.45, status: "Open"},
		  {id: 3462, name:"Labore Et Dolore", amount: 1, price: 23.45, status: "In Process"},
		  {id: 4572, name:"Magna Aliqua", amount: 5, price: 23.45, status: "Open"}
	  ]
  });

  // create and add app
  var app = new SplitApp("myApp");
  app.setModel(model);
  app.placeAt("body");

  var toDetailBtn = new Button({
	  text: "Go to Detail page",
	  press: function(oEv) {
		  app.toDetail("detail");
	  }
  });

  var label1 = new Label({
	  text: "ObjectHeader in fullScreenOptimized mode with states (2), no markers"
  }).addStyleClass("label");

  var label1Small = new Label({
	  text: "ObjectHeader in Master / Detail mode (fullScreenOptimized = false) with states (2), no markers"
  }).addStyleClass("label");

  var label2 = new Label({
	  text: "ObjectHeader with no states and very long title which should be truncated to 80 chars on all devices except on phone portrait where it is truncated to 50 chars"
  }).addStyleClass("label");

  var label3 = new Label({
	  text: "ObjectHeader with markers and arrow"
  }).addStyleClass("label");

  var label3a = new Label({
	  text: "ObjectHeader with arrow and no markers"
  }).addStyleClass("label");

  var label4 = new Label({
	  text: "ObjectHeader in fullScreenOptimized mode container with active title with 8 states (progressBar)."
  }).addStyleClass("label");

  var label4Small = new Label({
	  text: "ObjectHeader in Master / Detail mode container with active title with 8 states (progressBar)."
  }).addStyleClass("label");


  var label7 = new Label({
	  text: "ObjectHeader with short title with markers, states (3), no tabs"
  }).addStyleClass("label");

  var label9 = new Label({
	  text: "Full Blown ObjectHeader with suite.ui.commons HeaderContainer (will only be displayed if library can be loaded)"
  }).addStyleClass("label");

  var label10 = new Label({
	  text: "Full Blown ObjectHeader with suite.ui.commons HeaderContainer as XML Fragment (will only be displayed if library can be loaded)"
  }).addStyleClass("label");

  var label11 = new Label({
	  text: "ObjectHeader, 2 states and NO number/unit"
  }).addStyleClass("label");

  new Label({
	  text: "ObjectHeader, 2 states and NO number/unit (no markers)"
  }).addStyleClass("label");

  var label12 = new Label({
	  text: "ObjectHeader with NO TITLE will through warning in the console"
  }).addStyleClass("label");
  var label13 = new Label({
	  text: "ObjectHeader with title and 2 attribute and more than 7 tabs"
  }).addStyleClass("label");
  var label14 = new Label({
	  text: "ObjectHeader with markers, no tabs, and states"
  }).addStyleClass("label");
  var label15 = new Label({
	  text: "ObjectHeader with no markers, no tabs, and states"
  }).addStyleClass("label");

  var oh1 = new ObjectHeader("oh1", {
	  responsive: true,
	  backgroundDesign: "Solid",
	  intro: "Type XS",
	  introActive: true,
	  introPress: function(){ alert('you click the title');},
	  title: "1234 Example 1 Large container",
	  titleActive: true,
	  titlePress: function(){ alert('you click the title');},
	  titleHref:'http://google.com',
	  number: "624,00",
	  numberUnit: "Euro",
	  numberTextDirection: TextDirection.LTR,
	  fullScreenOptimized: true,
	  showMarkers: false,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
	  attributes: [
		  new ObjectAttribute({
			  title: "Manufacturer",
			  text: "ACME Corp",
			  active: true
		  })
	  ],
	  statuses: [
		  new ObjectStatus({
			  title: "Approval",
			  text: "Pending",
			  state: ValueState.Success
		  })
	  ]
  });

  var itb1 = new IconTabBar("itb1", {
	  selectedKey: "key3",
	  upperCase: true,
	  items: [
		  new IconTabFilter({
			  text: "Info",
			  iconColor: IconColor.Default,
			  key: "key1",
			  content: [
				  new Label({
					  text: "Here goes the info content..."
				  })
			  ]
		  }),
		  new IconTabFilter({
			  text: "Notes",
			  iconColor: IconColor.Default,
			  count: "2",
			  key: "key2",
			  content: [
				  new Label({
					  text: "Notes go here..."
				  })
			  ]
		  }),

		  new IconTabFilter({
			  text: "Attachments",
			  key: "key4",
			  count: "3",
			  content: [
				  new Label({
					  text:'Attachments go here...'
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh1.setHeaderContainer(itb1);
  oh1.addStyleClass("sapUiResponsivePadding--header");

  var oh1Small = new ObjectHeader("oh1Small", {
	  responsive: true,
	  backgroundDesign: "Translucent",
	  intro: "Type XS",
	  title: "Example 2 Small container",
	  number: "624,00",
	  numberUnit: "Euro",
	  fullScreenOptimized: false,
	  showMarkers: false,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
	  attributes: [
		  new ObjectAttribute({
			  title: "Manufacturer",
			  text: "ACME Corp",
			  active: true
		  })
	  ],
	  statuses: [
		  new ObjectStatus({
			  title: "Approval",
			  text: "Pending",
			  state: ValueState.Warning

		  })
	  ]
  });

  var itb1Small = new IconTabBar("itb1Small", {
	  selectedKey: "key3",
	  upperCase: true,
	  items: [
		  new IconTabFilter({
			  text: "Info",
			  iconColor: IconColor.Default,
			  key: "key1",
			  content: [
				  new Label({
					  text: "Here goes the info content..."
				  })
			  ]
		  }),
		  new IconTabFilter({
			  text: "Notes",
			  iconColor: IconColor.Default,
			  count: "2",
			  key: "key2",
			  content: [
				  new Label({
					  text: "Notes go here..."
				  })
			  ]
		  }),

		  new IconTabFilter({
			  text: "Attachments",
			  key: "key4",
			  count: "3",
			  content: [
				  new Label({
					  text:'Attachments go here...'
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh1Small.setHeaderContainer(itb1Small);


  var oh2 = new ObjectHeader("oh2", {
	  responsive: true,
	  title: "עִבְרִית היא שפה שמית, ממשפחת השפות האפרו-אסיאתיות, הידועה כשפתם של היהודים ושל השומרונים, אשר ניב מודרני שלה משמש כשפה הרשמית והעיקרית של מדינת ישראל",
	  titleTextDirection: TextDirection.RTL,
	  intro: "אשר ניב מודרני שלה משמש",
	  icon: "sap-icon://nutrition-activity",
	  iconActive: true,
	  number: "33233333.624,00",
	  numberUnit: "שֶׁקֶל חָדָשׁ",
	  numberTextDirection : TextDirection.RTL,
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success
  });

  var itb2 = new IconTabBar("itb2", {
	  selectedKey: "key13",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://attachment",
			  iconColor: IconColor.Default,
			  key: "key3",
			  content: [
				  new Link({
					  text:'hallo',
					  press: function () {
						  MessageBox.alert("Link was clicked!");
					  }
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key4",
			  count: "537733",
			  content: [
				  new Link({
					  text:'hallo',
					  target: "_blank",
					  href: "http://www.sap.com/"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://alert",
			  key: "key5",
			  count: "193",
			  content: [
				  new Label({
				  text: "alert alert alert"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3333",
			  key: "key6",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "34",
			  key: "key7",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://attachment",
			  iconColor: IconColor.Default,
			  key: "key8",
			  content: [
				  new RatingIndicator({
					  value: 3
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key9",
			  count: "5555",
			  content: [
				  new Text({
					  text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://alert",
			  key: "key10",
			  count: "1955",
			  content: [
				  new Label({
				  text: "alert alert alert"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "53",
			  key: "key11",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "355",
			  key: "key12",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://attachment",
			  iconColor: IconColor.Default,
			  key: "key13",
			  content: [
				  new RatingIndicator({
					  value: 3
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key14",
			  count: "577",
			  content: [
				  new Text({
					  text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://alert",
			  key: "key15",
			  count: "1977",
			  content: [
				  new Label({
				  text: "alert alert alert"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh2.setHeaderContainer(itb2);
  oh2.addStyleClass("sapUiResponsivePadding--header");
  //test popover title
  var domRef = null;
  var titleSelectorEventHandler = function(oEvent) {
	  domRef = oEvent.getParameters().domRef;
	  var popover = new Popover({
			  placement: PlacementType.Bottom,
			  showHeader: true,
			  content: new List({
				   mode: "SingleSelectMaster",
				   includeItemInSelection : true,
				   selectionChange : function (evt) {
						  header.setTitle(evt.getParameter("listItem").getTitle());
						  popover.close();
				   },
				   items: [
						  new StandardListItem({
								title : "Lorem ipsum dolor",
								selected : true
						  }),
						  new StandardListItem({
								title : "Lorem ipsum"
						  }),
						  new StandardListItem({
								title : "Lorem ipsum dolor sit amet et sineat"
						  }),
						  new StandardListItem({
								title : "Lorem ipsum"
						  }),
						  new ActionListItem({
								text : "Lorem ipsum"
						  }),
						  new ActionListItem({
								text : "Lorem ipsum"
						  })
				   ] //end of item
		  }) // end of content
	  }); //end of popover
	  popover.openBy(domRef);
  }


  var oh3 = new ObjectHeader("oh3", {
	  responsive: true,
	  title: "An apple a day keeps the doctor away An apple a day keeps the doctor away",
	  titleTextDirection: TextDirection.LTR,
	  icon: "sap-icon://nutrition-activity",
	  number: "3.624.123.456.789.111.222.333,00",
	  numberUnit: "here we have a long currency Euro",
	  showTitleSelector : true,
	  titleSelectorPress : titleSelectorEventHandler,
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success
  });
  oh3.addStyleClass("sapUiResponsivePadding--header");

  var itb3 = new IconTabBar("itb3", {
	  selectedKey: "key13",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh3.setHeaderContainer(itb3);

  var oh3a = new ObjectHeader("oh3a", {
	  responsive: true,
	  title: "An apple a day keeps the doctor away An apple a day keeps the doctor away An apple a day keeps the doctor away An apple a day keeps the doctor away An apple a day keeps the doctor away",
	  icon: "sap-icon://nutrition-activity",
	  number: "3.624,00",
	  numberUnit: "here we have a long currency Euro",
	  showTitleSelector : true,
	  titleSelectorPress : titleSelectorEventHandler,
	  numberState: ValueState.Success,
	  titleTextDirection: TextDirection.LTR
  });

  var itb3a = new IconTabBar("itb3a", {
	  selectedKey: "key13",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh3a.setHeaderContainer(itb3a);

  var oh4 = new ObjectHeader("oh4", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "An apple a day keeps the doctor away",
	  titleTextDirection: TextDirection.LTR,
	  icon: "sap-icon://nutrition-activity",
	  number: "3.624,00",
	  numberUnit: "Euro",
	  showTitleSelector: true,
	  titleSelectorPress : titleSelectorEventHandler,
	  introActive: true,
	  titleActive: true,
	  titleHref: "http://www.google.com",
	  titleTarget: "_blank",
	  introHref: "http://www.google.com",
	  introTarget: "_blank",
	  fullScreenOptimized: true,
	  showMarkers: true,
	  markFlagged: true,
	  numberState: ValueState.Success,
	  statuses : [ new ObjectStatus({
		  text : "Order Shipping slow"
	  }), new ProgressIndicator("oh18-pi", {
		  visible : true,
		  enabled : true,
		  state : ValueState.NEUTRAL,
		  //displayValue : '56%',
		  percentValue : 56,
		  showValue : false,
		  height : '1rem'
	  }), new ObjectStatus({
		  title: "Productivity",
		  text : "High"
	  }), new ProgressIndicator("oh18-pi2", {
		  visible : true,
		  enabled : true,
		  state : ValueState.NEUTRAL,
		  //displayValue : '90%',
		  percentValue : 90,
		  showValue : false,
		  height : '1rem'
	  }), new ObjectStatus({
		  title: "Quality ",
		  text: "Good"
	  }) ],
	  attributes : [ new ObjectAttribute({
		  title: "Order Shipping",
		  text: "Ñagçyfox"
	  }), new ObjectAttribute({
		  title: "Order Shipping",
		  text: "Order Shipping Speed"
	  }), new ObjectAttribute({
		  title: "Order Shipping",
		  text: "Order Shipping Progress Indicator"
	  }), new ObjectAttribute({
		  title: "Check this",
		  text: "Ñagçyfox"
	  }), new ObjectAttribute({
		  title: "Productivity",
		  text: "Progress Indicator"
	  })]
  });
  oh4.addStyleClass("sapUiResponsivePadding--header");

  var itb4 = new IconTabBar("itb4", {
	  selectedKey: "key13",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh4.setHeaderContainer(itb4);

  var oh4Small = new ObjectHeader("oh4Small", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "An apple a day keeps the doctor away",
	  icon: "sap-icon://nutrition-activity",
	  number: "335.624,00",
	  numberUnit: "EURO",
	  showTitleSelector: true,
	  titleSelectorPress : titleSelectorEventHandler,
	  introActive: true,
	  titleActive: true,
	  titlePress: function(){ alert('you click the title');},
	  fullScreenOptimized: false,
	  showMarkers: true,
	  markFlagged: true,
	  numberState: ValueState.Success,
	  statuses : [ new ObjectStatus({
		  text : "Order Shipping slow"
	  }), new ProgressIndicator("oh18-piSmall", {
		  visible : true,
		  enabled : true,
		  state : ValueState.NEUTRAL,
		  //displayValue : '56%',
		  percentValue : 56,
		  showValue : false,
		  height : '1rem'
	  }), new ObjectStatus({
		  title: "Productivity",
		  text : "High"
	  }), new ProgressIndicator("oh18-pi2Small", {
		  visible : true,
		  enabled : true,
		  state : ValueState.NEUTRAL,
		  //displayValue : '90%',
		  percentValue : 90,
		  showValue : false,
		  height : '1rem'
	  }), new ObjectStatus({
		  title: "Quality ",
		  text: "Good"
	  }) ],
	  attributes : [ new ObjectAttribute({
		  title: "Order Shipping",
		  text: "Order Shipping Flag"
	  }), new ObjectAttribute({
		  title: "Order Shipping",
		  text: "Order Shipping Speed"
	  }), new ObjectAttribute({
		  title: "Order Shipping",
		  text: "Order Shipping Progress Indicator"
	  }), new ObjectAttribute({
		  title: "Check this",
		  text: "Productivity"
	  }), new ObjectAttribute({
		  title: "Productivity",
		  text: "Progress Indicator"
	  })]
  });

  var itb4Small = new IconTabBar("itb4Small", {
	  selectedKey: "key13",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh4Small.setHeaderContainer(itb4Small);

  var oh7 = new ObjectHeader("oh7", {
	  responsive: true,
	  backgroundDesign: "Translucent",
	  title: "Short title",
	  number: "331,00",
	  numberUnit: "Dollar",
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
	  attributes: [
		  new ObjectAttribute({
			  text: "Object Attribute"
		  }),
		  new ObjectAttribute({
			  text: "Object Attribute"
		  }),
		  new ObjectAttribute({
			  text: "Object Attribute"
		  })
	  ]
  });
  oh7.addStyleClass("sapUiResponsivePadding--header");

  var itb7 = new IconTabBar("itb7", {
	  selectedKey: "key3",
	  items: [
		  new IconTabFilter({
			  count: "32",
			  key: "key1",
			  text: "Info",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  count: "2",
			  key: "key2",
			  text: "In Process",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  key: "key3",
			  text: "Shipped",
			  count: "17",
			  content: [
				  new Link({
					  text:'hallo',
					  press: function () {
						  MessageBox.alert("Link was clicked!");
					  }
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh7.setHeaderContainer(itb7);

  var oh9 = new ObjectHeader("oh9", {
	  responsive: true,
	  //intro: "On behalf of John Smith Ñagçyfox",
	  title: "This is a title",
	  //icon: "sap-icon://nutrition-activity",
	  number: "1.684,00",
	  numberUnit: "Euro",
	  backgroundDesign: "Translucent",
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
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
			  state: ValueState.Warning
		  })
	  ]
  });
  oh9.addStyleClass("sapUiResponsivePadding--header");

  /*use case 10 object header + header container as XML fragment */
  var oh10 = new ObjectHeader("oh10", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "This is a title",
	  icon: "sap-icon://nutrition-activity",
	  number: "1.684,00",
	  numberUnit: "Euro",
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
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
			  state: ValueState.Warning
		  })
	  ]
  });
  oh10.addStyleClass("sapUiResponsivePadding--header");

  Library.load("sap.suite.ui.commons").then(() => {
	  sap.ui.require([
		  "sap/ui/core/Fragment",
		  "sap/suite/ui/commons/HeaderContainer",
		  "sap/suite/ui/commons/HeaderCell",
		  "sap/suite/ui/commons/HeaderCellItem",
		  "sap/suite/ui/commons/ComparisonChart",
		  "sap/suite/ui/commons/ComparisonData"
	  ], function(Fragment, HeaderContainer, HeaderCell, HeaderCellItem, ComparisonChart, ComparisonData) {

		  var hc9 = new HeaderContainer({
			  scrollStep: 200,
			  scrollTime: 500,
			  items: [
				  new HeaderCell({
					  north: new HeaderCellItem({
						  height: "90%",
						  content: new ComparisonChart({
							  size: "S",
							  scale: "M",
							  data: [
								  new ComparisonData({
									  title: "Americas",
									  value: 234,
									  color: "Good"
								  }),
								  new ComparisonData({
									  title: "EMEA",
									  value: 97,
									  color: "Error"
								  }),
								  new ComparisonData({
									  title: "APAC",
									  value: 197,
									  color: "Critical"
								  })
							  ]
						  })
					  }),
					  south: new HeaderCellItem({
						  height: "10%",
						  content: new Label({
							  text: "EUR, Compare across regions"
						  })
					  })
				  })
			  ]
		  });

		  // connect HeaderContainer and ObjectHeader
		  oh9.setHeaderContainer(hc9);

		  var xml = '' +
		  '<HeaderContainer xmlns="sap.suite.ui.commons" xmlns:m="sap.m" scrollStep="200" scrollTime="500">' +
		  '	<items>' +
		  '		<HeaderCell>' +
		  '			<north>' +
		  '				<HeaderCellItem height="90%">' +
		  '					<content>' +
		  '						<ComparisonChart size="S" scale="M">' +
		  '					        <data>' +
		  '					        	<ComparisonData	title="Americas" value="234" color="Good"/>' +
		  '					        	<ComparisonData	title="EMEA" value="97" color="Error"/>' +
		  '					        	<ComparisonData	title="APAC" value="197" color="Critical"/>' +
		  '					        </data>' +
		  '				        </ComparisonChart>' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</north>' +
		  '			<south>' +
		  '				<HeaderCellItem height="10%">' +
		  '					<content>' +
		  '						<m:Label text="EUR, Compare across regions" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</south>' +
		  '		</HeaderCell>' +
		  '		<HeaderCell>' +
		  '			<north>' +
		  '				<HeaderCellItem height="90%">' +
		  '					<content>' +
		  '						<NumericContent size="S" scale="M" value="1.96" valueColor="Error" indicator="Up"/>' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</north>' +
		  '			<south>' +
		  '				<HeaderCellItem height="10%">' +
		  '					<content>' +
		  '						<m:Label text="EUR, Current Quarter" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</south>' +
		  '		</HeaderCell>' +
		  '		<HeaderCell>' +
		  '			<north>' +
		  '				<HeaderCellItem height="90%">' +
		  '					<content>' +
		  '						<BulletChart size="S" scale="M" targetValue="75" targetValueLabel="75c" minValue="0" maxValue="150">' +
		  '							<actual>' +
		  '								<BulletChartData value="125" color="Error"/>' +
		  '							</actual>' +
		  '							<thresholds>' +
		  '								<BulletChartData value="35" color="Critical"/>' +
		  '								<BulletChartData value="115" color="Error"/>' +
		  '							</thresholds>' +
		  '						</BulletChart> ' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</north>' +
		  '			<south>' +
		  '				<HeaderCellItem height="10%">' +
		  '					<content>' +
		  '						<m:Label text="EUR, Current and Target" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</south>' +
		  '		</HeaderCell>' +
		  '		<HeaderCell>' +
		  '			<north>' +
		  '				<HeaderCellItem height="90%">' +
		  '					<content>' +
		  '						<NumericContent size="S" value="3" icon="sap-icon://travel-expense" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</north>' +
		  '			<south>' +
		  '				<HeaderCellItem height="10%">' +
		  '					<content>' +
		  '						<m:Label text="Leave Requests" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</south>' +
		  '		</HeaderCell>' +
		  '		<HeaderCell>' +
		  '			<north>' +
		  '				<HeaderCellItem height="90%">' +
		  '					<content>' +
		  '						<NumericContent size="S" value="9" icon="sap-icon://locked" /> ' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</north>' +
		  '			<south>' +
		  '				<HeaderCellItem height="10%">' +
		  '					<content>' +
		  '						<m:Label text="Hours since last Activity" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</south>' +
		  '		</HeaderCell>' +
		  '		<HeaderCell>' +
		  '			<north>' +
		  '				<HeaderCellItem height="90%">' +
		  '					<content>' +
		  '						<NumericContent size="S" scale="M" value="1.25" valueColor="Good" indicator="Up"/>' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</north>' +
		  '			<south>' +
		  '				<HeaderCellItem height="10%">' +
		  '					<content>' +
		  '						<m:Label text="EUR, Current Quarter" />' +
		  '					</content>' +
		  '				</HeaderCellItem>' +
		  '			</south>' +
		  '		</HeaderCell>' +
		  '	</items>'+
		  '</HeaderContainer>';

		  Fragment.load({
			  definition: xml
		  }).then(function(oHeaderContainer){
			  // connect HeaderContainer and ObjectHeader
			  oh10.setHeaderContainer(oHeaderContainer);
		  });
	  });
  }, function(err) {
	  console.info("This test page requires the library 'sap.suite.ui.commons' to display the HeaderContainer control inside the ObjectHeader which is not available.");
	  oh9.setHeaderContainer(
		  new HeaderContainer({
			  content: [
				  new Text({
					  textAlign: TextAlign.Center,
					  text: "sap.suite.ui.commons library is missing"
				  }).addStyleClass("missingControl sapThemeBrand-asBorderColor")
			  ]
		  })
	  );
	  oh10.setHeaderContainer(
		  new HeaderContainer({
			  content: [
				  new Text({
					  textAlign: TextAlign.Center,
					  text: "sap.suite.ui.commons library is missing"
				  }).addStyleClass("missingControl sapThemeBrand-asBorderColor")
			  ]
		  })
	  );
  });

  var oh11 = new ObjectHeader("oh11", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "11 This is a title",
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
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
			  state: ValueState.Warning
		  })
	  ]
  });
  oh11.addStyleClass("sapUiResponsivePadding--header");

  var itb11 = new IconTabBar("itb11", {
	  selectedKey: "key1",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key4",
			  count: "537733",
			  content: [
				  new Link({
					  text:'hallo',
					  target: "_blank",
					  href: "http://www.sap.com/"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh11.setHeaderContainer(itb11);

  var oh11a = new ObjectHeader("oh11a", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "This is a title",
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
			  state: ValueState.Warning
		  })
	  ]
  });

  var itb11a = new IconTabBar("itb11a", {
	  selectedKey: "key1",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key4",
			  count: "537733",
			  content: [
				  new Link({
					  text:'hallo',
					  target: "_blank",
					  href: "http://www.sap.com/"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh11a.setHeaderContainer(itb11a);

  var oh12 = new ObjectHeader("oh12", {
	  responsive: true,
	  number: "1.684,00",
	  numberUnit: "Euro",
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
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
			  state: ValueState.Warning
		  })
	  ]
  });
  oh12.addStyleClass("sapUiResponsivePadding--header");

  var itb12 = new IconTabBar("itb12", {
	  selectedKey: "key1",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key4",
			  count: "537733",
			  content: [
				  new Link({
					  text:'hallo',
					  target: "_blank",
					  href: "http://www.sap.com/"
				  })
			  ]
		  })
	  ]
  });

  // connect IconTabBar and ObjectHeader
  oh12.setHeaderContainer(itb12);

  var itb13 = new IconTabBar("itb13", {
	  selectedKey: "key1",
	  items: [
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key1",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key2",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://collaborate",
			  key: "key3",
			  count: "537733",
			  content: [
				  new Link({
					  text:'hallo',
					  target: "_blank",
					  href: "http://www.sap.com/"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key4",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key5",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key6",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key7",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://hint",
			  iconColor: IconColor.Default,
			  count: "3222",
			  key: "key8",
			  content: [
				  new Label({
					  text: "info info info"
				  })
			  ]
		  }),
		  new IconTabFilter({
			  icon: "sap-icon://activity-items",
			  iconColor: IconColor.Default,
			  count: "322",
			  key: "key9",
			  content: [
				  new Input({
					  placeholder: "input placeholder"
				  })
			  ]
		  })
	  ]
  });

  var oh13 = oh2.clone();
  oh13.addAttribute(new ObjectAttribute({text: "Attribute1"}));
  oh13.addAttribute(new ObjectAttribute({text: "Attribute2"}));
  oh13.setHeaderContainer(itb13);

  /* special case: responsive with markers, but not states, attributes, and tabs */
  var oh14 = new ObjectHeader("oh14", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "This is a title This is a title a very long title test if it will be truncated to 80 chars",
	  number: "1.684,00",
	  numberUnit: "Euro",
	  showTitleSelector : true,
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success
  });
  oh14.addStyleClass("sapUiResponsivePadding--header");

  /* special case: responsive with no markers, but not states, attributes, and tabs */
  var oh15 = new ObjectHeader("oh15", {
	  responsive: true,
	  intro: "On behalf of John Smith Ñagçyfox",
	  title: "This is a title",
	  number: "1.684,00",
	  numberUnit: "Euro",
	  numberState: ValueState.Success
  });
  oh15.addStyleClass("sapUiResponsivePadding--header");

  var oLongTitleOH = new ObjectHeader({
	  title : "TitleThatDoesNotHaveAnySpaceAsItIsOneVeryLongWordWithoutNarrowClassSet",
	  showTitleSelector: true,
	  titleActive: true,
	  responsive:true
  });

  var oLongTitleOH1 = new ObjectHeader({
	  title : "TitleThatDoesNotHaveAnySpaceAsItIsOneVeryLongWordWithNarrowClassSet",
	  showTitleSelector: true,
	  responsive:true
  }).addStyleClass("sapUiContainer-Narrow");

  var oLongTitleOH2 = new ObjectHeader({
	  title : "TitleThatDoesNotHaveAnySpaceAsItIsOneVeryLongWordWithNarrowClassSet",
	  showTitleSelector: true,
	  titleActive: true,
	  responsive:true
  }).addStyleClass("sapUiContainer-Narrow");

  var ohEmptyAttribute = new ObjectHeader("ohEA", {
	  responsive: true,
	  title: "ObjectHeader with empty attribute",
	  intro: "The only Status should be shift to the left",
	  attributes: [
		  new ObjectAttribute({
			  title: "",
			  text: ""
		   })
	  ],
	  statuses: [
		  new ObjectStatus({
			  title: "Approval",
			  text: "Pending",
			  icon: "sap-icon://inbox",
			  state: ValueState.Warning
		  })
	  ]
  });
  var page1 = new Page("page1", {
	  title:"ObjectHeader (Responsive)",
	  content : [
		  oLongTitleOH2,
		  toDetailBtn
	  ]
  });
  // create and add a page with icon tab bar
  var detail = new Page("detail", {
	  title:"ObjectHeader (Responsive)",
	  showNavButton: Device.system.phone,
	  navButtonPress: function() {
		  app.backMaster();
	  },
	  content : [
		  oLongTitleOH,
		  oLongTitleOH1,
		  label1,
		  oh1,
		  label1Small,
		  oh1Small,
		  label2,
		  oh2,
		  label3,
		  oh3,
		  label3a,
		  oh3a,
		  label4,
		  oh4,
		  label4Small,
		  oh4Small,
		  label7,
		  oh7,
		  label11,
		  oh11,
		  label12,
		  oh12,
		  label13,
		  oh13,
		  label14,
		  oh14,
		  label15,
		  oh15,
		  label9,
		  oh9,
		  label10,
		  oh10,
		  ohEmptyAttribute,
		  new Label({text: "THE END!"}) // placeholder to see content below
	  ]
  });
  app.addMasterPage(page1);
  app.addDetailPage(detail);
});
sap.ui.define([
  "sap/m/Page",
  "sap/ui/Device",
  "sap/m/Bar",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/Label",
  "sap/m/Image",
  "sap/m/Text",
  "sap/m/SearchField",
  "sap/m/SegmentedButton",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/ui/core/IconPool",
  "sap/ui/util/Mobile"
], function(
  Page,
  Device,
  Bar,
  Button,
  mobileLibrary,
  Label,
  Image,
  Text,
  SearchField,
  SegmentedButton,
  Select,
  Item,
  IconPool,
  Mobile
) {
  "use strict";

  // shortcut for sap.m.BarDesign
  const BarDesign = mobileLibrary.BarDesign;

  // shortcut for sap.m.SelectType
  const SelectType = mobileLibrary.SelectType;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  // Note: the HTML page 'Bar.html' loads this module via data-sap-ui-on-init

  Mobile.init();

  var page = new Page("page");

  if (Device.os.ios){
	  var Bar = new Bar({
		  contentLeft: [new Button('Button', {text: "Back", type:ButtonType.Back})],
		  contentMiddle: [new Label("myLabel2", {text: "this is the title of header with a very very very very very very very very long text to test the ellipsis effect in the middle"})],
		  contentRight: [new Button('Button1', {text: "Edit"})]
	  });
	  page.setCustomHeader(Bar);
  } else {
	  var Bar1 = new Bar({
		  contentLeft: [new Button('ButtonDefault', {icon:"images/favorite@2x.png", type:ButtonType.Up})],
		  contentMiddle: [new Label("myLabelDefault", {text: "this is the title of header with a very long text to test the ellipsis effect"})],
		  contentRight: [new Label({text:"123"}), new Button('headerButtonDefault', {text: "Edit"})]
	  });
	  page.setCustomHeader(Bar1);
  }

  var oSubheaderBar = new Bar({
	  contentLeft: [new Button({icon:"images/favorite@2x.png", type:ButtonType.Up}),
					  new Image({src: "images/favorite_grey_24.png"}),
					  new Label({text: "left content area"})],
	  contentMiddle: [new Label({text: "mid content area"})],
	  contentRight: [new Label({text: "right content area"})]
  });
  page.setSubHeader(oSubheaderBar);

  var Bar2 = new Bar({
	  contentLeft: [new Image('myAppIcon', {src: "images/favorite_grey_24.png"}),
					new Label("leftContentLabel", {text: "left content area with a very very very  very very very very very very long text to test the ellipsis effect"})],
	  contentMiddle: [],
	  contentRight: []
  });
  page.addContent(Bar2);

  var Bar3 = new Bar({
	  contentLeft: [],
	  contentMiddle: [new Text("middleContentText", {text: "middle content area with a very very very  very very very very very very long text to test the ellipsis effect"})],
	  contentRight: []
  });
  page.addContent(Bar3);

  var Bar4 = new Bar({
	  contentLeft: [],
	  contentMiddle: [],
	  contentRight: [new Label("rightContentLabel", {text: "right content area with a very very very  very very very very very very long text to test the ellipsis effect"})]
  });
  page.addContent(Bar4);

  var Bar5 = new Bar({
	  contentLeft: [new Label({text: "label with a long text"})],
	  contentMiddle: [new Label({text: "label with a long text"})],
	  contentRight: [new Label({text: "label with a long text"})]
  });
  page.addContent(Bar5);

  var Bar6 = new Bar({
	  contentLeft: [new Button({icon: "images/favorite_grey_24.png"})],
	  contentMiddle: [new SearchField("SFB1", {placeholder: "search for..."})],
	  contentRight: [new Button({icon: "images/favorite_grey_24.png"})]
  });
  page.addContent(Bar6);

  var button1 = new Button('button1', {
	  type: ButtonType.Default,
	  text: "Label",
	  enabled: true
  });
  var button2 = new Button('button2', {
	  type: ButtonType.Default,
	  text: "Label",
	  enabled: true
  });
  var button3 = new Button('button3', {
	  type: ButtonType.Default,
	  text: "Label",
	  enabled: true
  });
  var button4 = new Button('button4', {
	  type: ButtonType.Default,
	  text: "Label",
	  enabled: true,
  });
  var button5 = new Button('button5', {
	  type: ButtonType.Default,
	  text: "Label",
	  enabled: true,
  });
  var button6 = new Button('button6', {
	  type: ButtonType.Default,
	  text: "Label",
	  enabled: true,
  });

  var Bar7 = new Bar({
	  contentLeft: [new Button({icon: "images/favorite_grey_24.png"})],
	  contentMiddle: [button1, button2],
	  contentRight: [new Button({icon: "images/favorite_grey_24.png"})]
  });
  page.addContent(Bar7);

  Bar7.addContentMiddle(button3);

  var Bar8 = new Bar({
	  contentLeft: [new Button({icon: "images/favorite_grey_24.png"})],
	  contentMiddle: [new SegmentedButton('SegmentedBar', {
						  buttons: [button4, button5, button6],
						  selectedButton: button5
					  })],
	  contentRight: [new Button({icon: "images/favorite_grey_24.png"})]
  });
  page.addContent(Bar8);

  var Bar9 = new Bar({
	  contentLeft: new Label({text: "left content area with a very very very  very very very very very very long text to test the ellipsis effect"}),
	  contentRight: new Label({text: "right content area with a very very very  very very very very very very long text to test the ellipsis effect"})
  });
  page.addContent(Bar9);

  var Bar10 = new Bar({
	  contentMiddle: new Label({text: "Middle should be pushed"}),
	  contentRight: new Label({text: "right content area with a very very very  very very very very very very long text to test the ellipsis effect"})
  });
  page.addContent(Bar10);

  var Bar11 = new Bar({
	  contentLeft: new Label({text: "left content area with a very very very  very very very very very very long text to test the ellipsis effect"}),
	  contentMiddle: new Label({text: "Middle should be pushed"})
  });
  page.addContent(Bar11);

  var Bar12 = new Bar({
	  contentLeft: new Label({text: "left content area with a very very very  very very very very very very long text to test the ellipsis effect"}),
	  contentMiddle: new Label({text: "Middle should be pushed"}),
	  contentRight: new Label({text: "Smaller right"})
  });
  page.addContent(Bar12);

  var Bar12 = new Bar({
	  contentLeft: new Label({text: "smaller Left"}),
	  contentMiddle: new Label({text: "Middle should be pushed"}),
	  contentRight: new Label({text: "right content area with a very very very  very very very very very very long text to test the ellipsis effect"})
  });
  page.addContent(Bar12);

  var Bar13 = new Bar({
	  contentLeft: [new Button({icon: "images/favorite_grey_24.png"})],
	  contentMiddle: [new Label({text: "smaller Text"}), new Button({ text : "And a button"})],
	  contentRight: [new Label({text: "mix buttons and text freely"})]
  });
  page.addContent(Bar13);

  var Bar14 = new Bar({
	  contentLeft: [new SearchField({placeholder: "search..."})],
	  contentRight: [new Label({text: "Some text to see what will happen"})]
  });
  page.addContent(Bar14);

  var Bar15 = new Bar({
	  contentMiddle: [new SearchField({placeholder: "search..."})],
	  contentRight: [new Label({text: "Some text to see what will happen"})]
  });
  page.addContent(Bar15);

  function getTestContent () {
	  return [
		  new SearchField({placeholder: "search...", width: "100px"}),
		  new Button({ text : "Border" }),
		  new Select({ items : [
			  new Item({
				  key: "0",
				  text: "item 0",
			  }),new Item({
				  key: "0",
				  text: "loooooooooooooong item",
			  })]}),
		  new Button({ text : "Test" }),
		  new SearchField({placeholder: "search...", width : "200px"}),
		  new Button({
			  icon: "sap-icon://drop-down-list"
		  }),
		  new Select({
			  type: SelectType.IconOnly,
			  icon: IconPool.getIconURI("filter"),
			  autoAdjustWidth: true,
			  items : [
					  new Item({
						  key: "0",
						  text: "item 0",
					  }),new Item({
						  key: "0",
						  text: "loooooooooooooong item",
			  })]}),
		  new Button({
			  icon: "sap-icon://person-placeholder"
		  })
	  ];
  }

  var Bar16 = new Bar({
	  design : BarDesign.Header,
	  contentLeft: getTestContent(),
	  contentRight : new Label({text : "some Text"})
  });
  page.addContent(Bar16);

  var Bar17 = new Bar({
	  design : BarDesign.Footer,
	  contentLeft: getTestContent()
  });
  page.addContent(Bar17);

  var Bar18 = new Bar({
	  design : BarDesign.SubHeader,
	  contentLeft: getTestContent()
  });
  page.addContent(Bar18);

  var Bar19 = new Bar({
	  design : BarDesign.SubHeader,
	  contentMiddle:[
					  new Button({
						  text : "Test for a regression in IE9 and FF",
						  width : "50%",
					  }),
					  new Button({
						  text: "this button got hidden when it overflows due to the margins",
						  width : "50%"
					  })
				  ]
  });
  page.addContent(Bar19);

  var pageInPage = new Page({
	  customHeader : new Bar({
		  design : "SubHeader",
		  contentMiddle : [new Label({ text : "Page in page: This is a Header with SubHeader design"})]
	  }),
	  subHeader : new Bar({
		  design : "Footer",
		  contentMiddle : [new Label({ text : "This is a SubHeader with footer design"})]
	  }),
	  footer : new Bar({
		  design : "Header",
		  contentMiddle : [new Label({ text : "This is a footer with header design"})]
	  })
  }).addStyleClass("pageInPage");

  page.addContent(pageInPage);

  var footer = new Bar({
	  contentLeft: [new SearchField({placeholder: "search..."})],
	  contentMiddle: [new Button({icon: "images/feed@2x.png"}),
					  new Button({icon: "images/favorite@2x.png"}),
					  new Button({icon: "images/flag@2x.png"})],
	  contentRight: [new Label({ text : "footie"})]
  });

  page.setFooter(footer);
  page.placeAt("body");
});
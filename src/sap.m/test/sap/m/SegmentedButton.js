sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/SplitApp",
  "sap/m/Page",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/Bar",
  "sap/m/SegmentedButton",
  "sap/m/Label",
  "sap/m/VBox",
  "sap/m/SegmentedButtonItem",
  "sap/m/Dialog",
  "sap/m/Panel",
  "sap/m/Toolbar",
  "sap/ui/core/mvc/ViewType",
  "sap/m/ViewSettingsDialog",
  "sap/m/ViewSettingsItem",
  "sap/m/ViewSettingsFilterItem",
  "sap/m/ViewSettingsCustomItem",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageItem",
  "sap/m/MessagePopover",
  "sap/ui/core/library",
  "sap/m/MessageToast",
  "sap/m/List",
  "sap/m/InputListItem",
  "sap/ui/thirdparty/jquery",
  "sap/base/Log",
  "sap/ui/core/mvc/View"
], function(
  Element,
  HTML,
  IconPool,
  SplitApp,
  Page,
  Button,
  mobileLibrary,
  Bar,
  SegmentedButton,
  Label,
  VBox,
  SegmentedButtonItem,
  Dialog,
  Panel,
  Toolbar,
  ViewType,
  ViewSettingsDialog,
  ViewSettingsItem,
  ViewSettingsFilterItem,
  ViewSettingsCustomItem,
  JSONModel,
  MessageItem,
  MessagePopover,
  coreLibrary,
  MessageToast,
  List,
  InputListItem,
  jQuery,
  Log
) {
  "use strict";

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  // shortcut for sap.m.LabelDesign
  const LabelDesign = mobileLibrary.LabelDesign;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  // Note: the HTML page 'SegmentedButton.html' loads this module via data-sap-ui-on-init

  (function() {
	  "use strict";

	  // Transform page to size compact
	  const sCompact = new URLSearchParams(window.location.search).get("compact");
	  if(sCompact) {
		  jQuery(document).ready(function() {
			  jQuery("#content").addClass("sapUiSizeCompact");
		  });
	  }

	  var sAddIconURI = IconPool.getIconURI("add");
	  var app = new SplitApp();
	  app.placeAt("content");

	  var page = new Page("myFirstPage", {
		  backgroundDesign: "Standard",
		  title : "Test",
		  enableScrolling : false
	  });

	  var page2 = new Page("mySecondPage", {
		  backgroundDesign: "Standard",
		  title : "Test",
		  showNavButton: true,
		  enableScrolling : true,
		  navButtonTap: function() {
			  app.to(page);
		  }
	  });

	  var button1 = new Button('button1', {
		  type: ButtonType.Default,
		  text: "to Page 2",
		  enabled: true,
		  press: function(oEvent) {
			  Log.info('press event button: ' + oEvent.getParameter('id'));
			  app.to(page2);
		  }
	  });
	  var button2 = new Button('button2', {
		  type: ButtonType.Default,
		  icon: sAddIconURI,
		  enabled: true,
		  press: function(oEvent) {
			  Log.info('press event button: ' + oEvent.getParameter('id'));
		  }
	  });
	  var button3 = new Button('button3', {
		  type: ButtonType.Default,
		  icon: "images/favorite_grey_24.png",
		  enabled: true,
		  tooltip: "Favorite"
	  });
	  var button4 = new Button('button4', {
		  type: ButtonType.Default,
		  icon: sAddIconURI,
		  enabled: true
	  });
	  var button5 = new Button('button5', {
		  type: ButtonType.Default,
		  text: "test",
		  enabled: true
	  });
	  var button6 = new Button('button6', {
		  type: ButtonType.Default,
		  enabled: true,
		  text: "test"
	  });

	  new Button('button7', {
		  type: ButtonType.Default,
		  text: "LabelBar",
		  enabled: true
	  });

	  new Button('button8', {
		  type: ButtonType.Default,
		  text: "Label Bar",
		  enabled: true
	  });

	  new Button('button9', {
		  type: ButtonType.Default,
		  text: "Label Bar",
		  enabled: true
	  });

	  new Button('button10', {
		  type: ButtonType.Default,
		  icon: sAddIconURI,
		  enabled: true
	  });

	  new Button('button11', {
		  type: ButtonType.Default,
		  text: "Label Header",
		  enabled: true
	  });

	  new Button('button12', {
		  type: ButtonType.Default,
		  text: "Label Header",
		  enabled: true
	  });

	  var button13 = new Button('button13', {
		  type: ButtonType.Default,
		  text: "Label Footer",
		  enabled: true
	  });
	  var button14 = new Button('button14', {
		  type: ButtonType.Default,
		  icon: sAddIconURI,
		  enabled: true
	  });
	  var button15 = new Button('button15', {
		  type: ButtonType.Default,
		  text: "Label Footer",
		  enabled: true
	  });

	  var Bar = new Bar({
		  contentLeft: [new Button('Button', {text: "Back", type:ButtonType.Back})],
		  contentMiddle: [ new SegmentedButton('SegmentedBar1', {
			  buttons: [button1, button2, button3],
			  selectedButton: button2,
			  visible: true,
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  })],
		  contentRight: [new Button('Button1', {text: "Edit"})]
	  });
	  page.setCustomHeader(Bar);

	  //---CONTENT---
	  var oSegmented2 = new SegmentedButton('SegmentedCnt1', {
		  selectionChange: function(oEvent) {
			  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
		  },
		  width: '100%'
	  });
	  oSegmented2.addButton(button4);
	  oSegmented2.setSelectedButton(button4);
	  oSegmented2.createButton('100% Width', null, true);
	  oSegmented2.createButton('This is a Very Very Very Long Text', null, true);
	  page.addContent(oSegmented2);

	  var oSegmented3 = new SegmentedButton('SegmentedCnt2', {
		  buttons: [button5, button6],
		  selectedButton: button5,
		  selectionChange: function(oEvent) {
			  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
		  }
	  });
	  page.addContent(oSegmented3);

	  var oSegmentedIcons = new SegmentedButton('SegmentedIcons', {
		  buttons: [
			  new Button('buttonIcon1', {
				  type: ButtonType.Default,
				  icon: sAddIconURI,
				  enabled: true
			  }),
			  new Button('buttonIcon2', {
				  type: ButtonType.Default,
				  icon: sAddIconURI,
				  enabled: true
			  }),
			  new Button('buttonIcon3', {
				  type: ButtonType.Default,
				  icon: sAddIconURI,
				  enabled: true
			  }),
			  new Button('buttonIcon4', {
				  type: ButtonType.Default,
				  icon: sAddIconURI,
				  enabled: true
			  })
		  ],
		  selectionChange: function(oEvent) {
			  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
		  }
	  });
	  page.addContent(oSegmentedIcons);

	  var oButton1 = new Button("segbtn1", {text:"first button"}),
			  oButton2 = new Button("segbtn2", {text:"disabled button"}),
			  oButton3 = new Button("segbtn3", {text:"third button"}),
			  Segmented5 = new SegmentedButton();

	  page.addContent(Segmented5);
	  Segmented5.addButton(oButton1);
	  Segmented5.addButton(oButton2);
	  Segmented5.addButton(oButton3);

	  window.setTimeout(function(){
		  oButton2.setEnabled(false);
	  },1000);

	  var Segmented4 = new SegmentedButton('SegmentedFooter', {
		  buttons: [button13, button14,button15],
		  selectedButton: button14,
		  selectionChange: function(oEvent) {
			  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
		  }
	  });
	  var footer = new Bar({
		  contentLeft: [],
		  contentMiddle: [Segmented4],
		  contentRight: []
	  });

	  page.setFooter(footer);

	  /****************************************
	   * Page 2                               *
	   ****************************************/

	  // immediate function to not mess with other scope
	  (function () {

		  function createLabel(sText) {
			  return new Label({text: sText, design: LabelDesign.Bold});
		  }
		  // Helper functions end

		  /* Container for the new controls */
		  var vBox = new VBox();

		  /****************************************
		   * API test Start                       *
		   ****************************************/
		  var oSegmentedButtonApiTest = new SegmentedButton('oSegmentedButtonApiTest', {
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  },
			  width: '100%'
		  });
		  oSegmentedButtonApiTest.createButton('Some Text', null, true);
		  oSegmentedButtonApiTest.createButton('100% Width', null, true);
		  oSegmentedButtonApiTest.createButton('This xis a Very Very Very Long Text', null, true);
		  vBox.addItem(oSegmentedButtonApiTest);

		  // new test case for CSN# 1143859/2014
		  vBox.addItem(new Button({
			  text : "Rotate selected button by API for \"oSegmentedButtonApiTest\"",
			  press : function() {
				  var oSelectedButton = Element.getElementById(oSegmentedButtonApiTest.getSelectedButton()),
						  oButtons = oSegmentedButtonApiTest.getButtons(),
						  i = 0;

				  for (; i < oButtons.length; i++) {
					  if (oButtons[i] === oSelectedButton) {
						  // calc next i
						  i +=1;
						  break;
					  }
				  }
				  if (i >= oButtons.length) {
					  i = 0;
				  }
				  oSegmentedButtonApiTest.setSelectedButton(oSegmentedButtonApiTest.getButtons()[i]);
			  }
		  }));

		  /****************************************
		   * API test End                         *
		   ****************************************/

		  /****************************************
		   * Fixed widths Start                   *
		   ****************************************/

		  var oSegmentedSecondFixedWidths = new SegmentedButton('oSegmentedSecondFixedWidths', {
			  buttons: [
				  new Button({text: "100px", width: "100px"}),
				  new Button({text: "no width -> segmentedButton: 400px"})
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  },
			  width: "400px"
		  });
		  vBox.addItem(oSegmentedSecondFixedWidths);

		  /****************************************
		   * Fixed widths End                     *
		   ****************************************/

		  /****************************************
		   * Images and state Start               *
		   ****************************************/

		  // segmented button with images
		  var oSegmentedButtonImage = new SegmentedButton({
			  buttons: [
				  new Button({
					  type: ButtonType.Default,
					  icon: "images/candy_v_46x46.png",
					  enabled: true,
					  tooltip: "Accept"
				  }),
				  new Button({
					  type: ButtonType.Default,
					  icon: "images/candy_x_46x46.png",
					  enabled: true,
					  tooltip: "Reject"
				  }),
				  new Button({
					  type: ButtonType.Default,
					  icon: "images/candy_star_46x46.png",
					  enabled: false,
					  tooltip: "Star"
				  })
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  });
		  vBox.addItem(oSegmentedButtonImage);

		  // segmented button with images 2
		  var oSegmentedButtonImage2 = new SegmentedButton({
			  buttons: [
				  new Button({
					  type: ButtonType.Default,
					  icon: "sap-icon://factory",
					  enabled: false
				  }),
				  new Button({
					  type: ButtonType.Default,
					  icon: "sap-icon://flag",
					  enabled: true
				  }),
				  new Button({
					  type: ButtonType.Default,
					  icon: "sap-icon://flight",
					  enabled: true
				  })
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  });
		  vBox.addItem(oSegmentedButtonImage2);

		  var oSegmentedImageAndText = new SegmentedButton('SegmentedImageAndText', {
			  buttons: [
				  new Button({
					  icon: "images/candy_v_46x46.png",
					  text: "one",
					  enabled: true
				  }),
				  new Button({
					  icon: "images/candy_x_46x46.png",
					  text: "two",
					  enabled: true
				  }),
				  new Button({
					  icon: "images/candy_star_46x46.png",
					  text: "three",
					  enabled: false
				  })
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  });
		  vBox.addItem(oSegmentedImageAndText);

		  var oSegmentedIconAndText = new SegmentedButton('SegmentedIconAndText', {
			  buttons: [
				  new Button({
					  icon: IconPool.getIconURI("add"),
					  text: "one",
					  enabled: true
				  }),
				  new Button({
					  icon: IconPool.getIconURI("attachment"),
					  text: "two",
					  enabled: true
				  }),
				  new Button({
					  icon: IconPool.getIconURI("paper-plane"),
					  text: "three",
					  enabled: false
				  }),
				  new Button({
					  icon: IconPool.getIconURI("synchronize"),
					  text: "four",
					  enabled: true
				  })
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  });
		  vBox.addItem(oSegmentedIconAndText);

		  var oSegmentedLastNotVisible = new SegmentedButton('SegmentedLastNotVisible', {
			  buttons: [
				  new Button({
					  text: "one: last one not visible",
					  enabled: true
				  }),
				  new Button({
					  text: "two: last one not visible",
					  enabled: true
				  }),
				  new Button({
					  text: "three: last one not visible",
					  enabled: true,
					  visible: false
				  })
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  });
		  vBox.addItem(oSegmentedLastNotVisible);

		  var oSegmentedLastNotVisibleDis = new SegmentedButton('SegmentedLastNotVisibleDis', {
			  buttons: [
				  new Button({
					  text: "one: last one not visible",
					  enabled: true
				  }),
				  new Button({
					  text: "two: last one not visible",
					  enabled: false
				  }),
				  new Button({
					  text: "three: last one not visible",
					  enabled: true,
					  visible: false
				  })
			  ],
			  selectionChange: function(oEvent) {
				  Log.info('press event segmented: ' + oEvent.getSource().getSelectedButton());
			  }
		  });
		  vBox.addItem(oSegmentedLastNotVisibleDis);

		  /****************************************
		   * Images and state End                 *
		   ****************************************/

		  vBox.addItem(new SegmentedButton({
			  items : [
				  new SegmentedButtonItem({text: "Some loooong text"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("drill-down")}),
				  new SegmentedButtonItem({text: "Some loooong text"})
			  ]
		  }));

		  vBox.addItem(new SegmentedButton({
			  items : [
				  new SegmentedButtonItem({text: "Some loooong text"}),
				  new SegmentedButtonItem({width: "60%", icon: IconPool.getIconURI("drill-down")}),
				  new SegmentedButtonItem({text: "Some loooong text"})
			  ]
		  }));

		  vBox.addItem(new SegmentedButton({
			  items : [
				  new SegmentedButtonItem({text: "Some loooong text"}),
				  new SegmentedButtonItem({width: "200px", icon: IconPool.getIconURI("drill-down")}),
				  new SegmentedButtonItem({text: "Some loooong text"})
			  ]
		  }));

		  /****************************************
		   * sap.m.Dialog Start                   *
		   ****************************************/

		  var oDialog = new Dialog({
			  subHeader : new Bar({
				  contentMiddle : [
					  new SegmentedButton({
						  width : "100%",
						  buttons : [
							  new Button({text: "Approved  1111111111"}),
							  new Button({text: "Rejected 2222222222"}),
							  new Button({text: "Lookup 3333333333"})
						  ]
					  })]
			  }),
			  beginButton: new Button({text: "Close  1111111111", press: function() {oDialog.close();}})
		  });

		  var oDialog11 = new Dialog({
			  content : [
				  new Bar({
					  contentMiddle : [
						  new SegmentedButton({
							  width : "100%",
							  buttons : [
								  new Button({text: "Approved  1111111111"}),
								  new Button({text: "Button2"}),
								  new Button({text: "Button3"})
							  ]
						  })]
			  })],
			  beginButton: new Button({text: "Close  very long text", press: function() {oDialog11.close();}})
		  });

		  var oDialog12 = new Dialog({
			  content : [
				  new SegmentedButton({
				  width : "100%",
				  buttons : [
					  new Button({text: "Approved  long text1"}),
					  new Button({text: "Rejected long text2"}),
					  new Button({text: "Lookup long text3"})
				  ]
			  })],
			  beginButton: new Button({text: "Close  1111111111", press: function() {oDialog12.close();}})
		  });

		  var oDialog2 = new Dialog({
			  subHeader : new Bar({
				  contentMiddle : [
					  new SegmentedButton({
						  width : "100%",
						  items : [
							  new SegmentedButtonItem({text: "All"}),
							  new SegmentedButtonItem({text: "Drill", icon: IconPool.getIconURI("drill-down")}),
							  new SegmentedButtonItem({text: "Text", icon: IconPool.getIconURI("e-care")})
						  ]
					  })
				  ]
			  }),
			  content : [
				  new Button({
					  text : "Close",
					  press: function () {
						  oDialog2.close();
					  }
				  })
			  ]
		  });

		  var oDialog3 = new Dialog({
			  subHeader : new Bar({
				  contentMiddle : [
					  new SegmentedButton({
						  width : "100%",
						  items : [
							  new SegmentedButtonItem({icon: IconPool.getIconURI("edit")}),
							  new SegmentedButtonItem({icon: IconPool.getIconURI("education")}),
							  new SegmentedButtonItem({icon: IconPool.getIconURI("email-read")}),
							  new SegmentedButtonItem({icon: IconPool.getIconURI("excel-attachment")})
						  ]
					  })
				  ]
			  }),
			  content : [
				  new Button({
					  text : "Close",
					  press: function () {
						  oDialog3.close();
					  }
				  })
			  ]
		  });

		  vBox.addItem(createLabel("sap.m.Dialog:"));

		  var oPanel1 = new Panel();

		  oPanel1.addContent(new Button({
			  text: "SB(w.100%)->Bar(middle)->Dialog(subHeader)",
			  press: function () {
				  oDialog.open();
			  }
		  }));

		  oPanel1.addContent(new Button({
			  text: "SB(w.100%)->Bar(middle)->Dialog(content)",
			  press: function () {
				  oDialog11.open();
			  }
		  }));

		  oPanel1.addContent(new Button({
			  text: "SB(w.100%)->Dialog(content)",
			  press: function () {
				  oDialog12.open();
			  }
		  }));
		  oPanel1.addContent(new Button({
			  text: "SB(w.100%)->Bar(middle)->Dialog(subHeader)-mixed content",
			  press: function() {
				  oDialog2.open();
			  }
		  }));

		  oPanel1.addContent(new Button({
			  text: "SB(w.100%)->Bar(middle)->Dialog(subHeader)-icons",
			  press: function() {
				  oDialog3.open();
			  }
		  }));

		  vBox.addItem(oPanel1);

		  /****************************************
		   * sap.m.Dialog End                     *
		   ****************************************/

		  /****************************************
		   * sap.m.ToolBar Start                  *
		   ****************************************/

		  var testPanel = new Panel({
			  width: "700px"
		  });

		  var testBar = new Bar({
			  contentMiddle : [
				  new SegmentedButton({
					  width: "100%",
					  items : [
						  new SegmentedButtonItem({text: "All"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("synchronize"), text: "Button1"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("add-equipment"), text: "Button2"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("alert"), text: "Button3"})
					  ]
				  })
			  ]
		  });

		  var testBar2 = new Bar({
			  contentMiddle : [
				  new Button({text: "Before SB", type: ButtonType.Emphasized}),
				  new SegmentedButton({
					  items : [
						  new SegmentedButtonItem({text: "All"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("attachment-video"), text: "Button1"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("business-objects-experience"), text: "Button2"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("cart-5"), text: "Button3"})
					  ]
				  }),
				  new Button({text: "After SB", type: ButtonType.Emphasized}),
			  ]
		  });

		  var testBar3 = new Bar({
			  contentMiddle : [
				  new SegmentedButton({
					  items : [
						  new SegmentedButtonItem({text: "All"}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("chart-axis")}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("citizen-connect")}),
						  new SegmentedButtonItem({icon: IconPool.getIconURI("collision")})
					  ]
				  })
			  ]
		  });

		  testPanel.addContent(testBar);
		  testPanel.addContent(testBar2);
		  testPanel.addContent(testBar3);

		  var oSBInToolBar1 = new SegmentedButton({
			  items: [
				  new SegmentedButtonItem({icon: "sap-icon://home"}),
				  new SegmentedButtonItem({icon: "sap-icon://attachment"})
			  ]
		  });

		  var oSBInToolBar2 = new SegmentedButton({
			  items : [
				  new SegmentedButtonItem({text: "All"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("comment"), text: "Button1"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("create-leave-request"), text: "Button2"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("database"), text: "Button3"})
			  ]
		  });

		  var oSBInToolBar3 = new SegmentedButton({
			  items : [
				  new SegmentedButtonItem({text: "All"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("comment"), text: "Button1"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("create-leave-request"), text: "Button2"}),
				  new SegmentedButtonItem({icon: IconPool.getIconURI("database"), text: "Button3"})
			  ]
		  });

		  // We add the class .sapMSegmentedButtonNoAutoWidth which is forcing the control to skip all width calculations
		  // and make every button take the width it actually needs rather equalizing all button widths.
		  oSBInToolBar3.addStyleClass("sapMSegmentedButtonNoAutoWidth");

		  var oToolbar2 = new Toolbar({
			  content: [
				  oSBInToolBar1,
				  oSBInToolBar2,
				  oSBInToolBar3
			  ]
		  });

		  vBox.addItem(createLabel("Mixed content buttons in sap.m.ToolBar:"));
		  vBox.addItem(oToolbar2);

		  vBox.addItem(createLabel("Mixed content buttons in sap.m.Bar:"));
		  vBox.addItem(testPanel);

		  /****************************************
		   * sap.m.ToolBar End                    *
		   ****************************************/

		  /****************************************
		   * sap.ui.SimpleForm                    *
		   ****************************************/


		  var oSimpleFormView = sap.ui.view({
			  viewContent: jQuery('#simpleFormExample').html(),
			  type: ViewType.XML
		  });

		  vBox.addItem(createLabel("SegmentedButton in sap.ui.SimpleForm:"));
		  vBox.addItem(oSimpleFormView);

		  /****************************************
		   * sap.ui.SimpleForm                    *
		   ****************************************/

		  /****************************************
		   * sap.m.ViewSettingsDialog Start       *
		   ****************************************/
		  vBox.addItem(createLabel("sap.m.ViewSettingsDialog:"));

		  var vsd = new ViewSettingsDialog("vsd");
		  vsd.addSortItem(new ViewSettingsItem({
			  key: "myNameSorter",
			  text: "Name",
			  selected: true
		  }));
		  vsd.addSortItem(new ViewSettingsItem({
			  key: "myStatusSorter",
			  text: "Status"
		  }));
		  vsd.addSortItem(new ViewSettingsItem({
			  key: "myValueSorter",
			  text: "Value"
		  }));
		  vsd.addSortItem(new ViewSettingsItem({
			  key: "myPriceSorter",
			  text: "Price"
		  }));

		  // init grouping (some simple sorters with default grouping and some with a custom grouping)
		  vsd.addGroupItem(new ViewSettingsItem({
			  key: "myNameGrouper",
			  text: "Name"
		  }));
		  vsd.addGroupItem(new ViewSettingsItem({
			  key: "myStatusGrouper",
			  text: "Status",
			  selected: true
		  }));
		  vsd.addGroupItem(new ViewSettingsItem({
			  key: "myValueGrouper",
			  text: "Value"
		  }));
		  vsd.addGroupItem(new ViewSettingsItem({
			  key: "myPriceGrouper",
			  text: "Price"
		  }));

		  vsd.addFilterItem(new ViewSettingsFilterItem({
			  key: "myNameFilter",
			  text: "Name",
			  items: [
				  new ViewSettingsItem({
					  key: "name1",
					  text: "Headphone",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "name2",
					  text: "Mousepad",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "name3",
					  text: "Monitor"
				  }),
				  new ViewSettingsItem({
					  key: "name4",
					  text: "Backpack"
				  }),
				  new ViewSettingsItem({
					  key: "name5",
					  text: "Printer",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "name6",
					  text: "Optic Mouse",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "name7",
					  text: "Dock Station"
				  })
			  ]
		  }));

		  vsd.addFilterItem(new ViewSettingsFilterItem({
			  key: "myStatusFilter",
			  text: "Status",
			  items: [
				  new ViewSettingsItem({
					  key: "status1",
					  text: "Approved",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "status2",
					  text: "Open",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "status3",
					  text: "Denied",
					  selected: true
				  })
			  ]
		  }));

		  vsd.addFilterItem(new ViewSettingsFilterItem({
			  key: "myValueFilter",
			  text: "Value",
			  items: [
				  new ViewSettingsItem({
					  key: "value1",
					  text: "< 10 EUR"
				  }),
				  new ViewSettingsItem({
					  key: "value2",
					  text: "10 - 30 EUR",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "value3",
					  text: "30 - 50 EUR",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "value4",
					  text: "50 - 70 EUR",
					  selected: true
				  }),
				  new ViewSettingsItem({
					  key: "value5",
					  text: "> 70 EUR"
				  })
			  ]
		  }));

		  // custom price control filter
		  vsd.addFilterItem(new ViewSettingsCustomItem({
			  key: "myPriceFilter",
			  text: "Price"
		  }));

		  vBox.addItem(new Button({
			  icon: "sap-icon://drop-down-list",
			  tooltip: "Dropdown list",
			  press: function() {
				  vsd.open();
			  }
		  }));
		  /****************************************
		   * sap.m.ViewSettingsDialog End         *
		   ****************************************/

		  /****************************************
		   * sap.m.MessagePopover Start           *
		   ****************************************/

		  vBox.addItem(createLabel("sap.m.MessagePopover:"));

		  var aMockMessages = {
			  count: 5,
			  messages: [{
				  type: "Error",
				  title: "Error message",
				  description: "First Error message description"
			  }, {
				  type: "Warning",
				  title: "Warning without description",
				  description: ""
			  }, {
				  type: "Success",
				  title: "Success message",
				  description: "First Success message description"
			  }, {
				  type: "Error",
				  title: "Error",
				  description: "Second Error message description"
			  }, {
				  type: "Information",
				  title: "Information message (Long)",
				  description: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
			  }]};

		  var oMockModel = new JSONModel();
		  oMockModel.setData(aMockMessages);

		  var oMessageTemplate = new MessageItem({
			  type: "{type}",
			  title: "{title}",
			  description: "{description}"
		  });

		  //list.bindAggregation("items", "/", oMessageTemplate);
		  var oMessagePopover = new MessagePopover({
			  items: {
				  path: "/messages",
				  template: oMessageTemplate
			  }
		  });

		  oMessagePopover.setModel(oMockModel);

		  var oMessagePopoverButton = new Button({
			  icon: IconPool.getIconURI("message-warning"),
			  text: "{/count}",
			  type: "Accept",
			  press: function () {
				  oMessagePopover.toggle(this);
			  }
		  });

		  vBox.addItem(oMessagePopoverButton);

		  /****************************************
		   * sap.m.MessagePopover End             *
		   ****************************************/

		  /****************************************
		   * Items aggregation api Start          *
		   ****************************************/

		  vBox.addItem(createLabel("New aggregation 'items' and 'selectedKey' property:"));

		  var oSBItems = new SegmentedButton({
			  selectedKey: "{/selectedKey}",
			  items: {
				  path : "/items",
				  template : new SegmentedButtonItem({
					  key: "{key}",
					  text: "{text}",
					  icon: "{icon}",
					  enabled: "{enabled}",
					  textDirection: "{textDirection}"
				  })
			  }
		  });

		  var oItems = {
			  selectedKey: "b2",
			  items: [
				  {key: "b1", text: "Btn 1"},
				  {key: "b2", text: "Btn 2"},
				  {key: "b3", text: "Btn 3"}
			  ]
		  };

		  var oItems2 = {
			  selectedKey: "b5",
			  items: [
				  {key: "b1", text: "btn 1", icon: "sap-icon://attachment"},
				  {key: "b2", text: "btn 2", enabled: false},
				  {key: "b3", text: "111 222 333", textDirection: TextDirection.RTL},
				  {key: "b4", text: "btn 4", icon: "sap-icon://home"},
				  {key: "b5", text: "btn 4", icon: "images/candy_x_46x46.png"},
				  {key: "b6", text: "btn 4"},
				  {key: "b7", text: "btn 4", icon: "images/candy_star_46x46.png"},
				  {key: "b8", text: "btn 4"}
			  ]
		  };

		  var oSBItemsModel = new JSONModel();
		  oSBItemsModel.setData(oItems);
		  oSBItems.setModel(oSBItemsModel);

		  vBox.addItem(oSBItems);

		  var oPanel2 = new Panel();

		  oPanel2.addContent(new Button({
			  text: "getSelectedKey()",
			  press: function() {
				  MessageToast.show(oSBItems.getSelectedKey());
			  }
		  }));
		  oPanel2.addContent(new Button({
			  text: "setSelectedKey('b3')",
			  press: function() {
				  oSBItems.setSelectedKey("b3");
			  }
		  }));
		  oPanel2.addContent(new Button({
			  text: "Model 1",
			  press: function() {
				  oSBItemsModel.setData(oItems);
			  }
		  }));
		  oPanel2.addContent(new Button({
			  text: "Model 2",
			  press: function() {
				  oSBItemsModel.setData(oItems2);
			  }
		  }));

		  vBox.addItem(oPanel2);

		  /****************************************
		   * Items aggregation api End            *
		   ****************************************/

		  /****************************************
		   * sap.m.InputLiistItem Start           *
		   ****************************************/

		  vBox.addItem(createLabel("sap.m.InputListItem:"));

		  var oList = new List({
			  items: [
				  new InputListItem({
					  label: "Outside volume",
					  content: new SegmentedButton({
						  selectedKey: "b2",
						  items: [
							  new SegmentedButtonItem({key: "b1", text: "High"}),
							  new SegmentedButtonItem({key: "b2", text: "Low"}),
							  new SegmentedButtonItem({key: "b3", text: "Mute"})
						  ]
					  })
				  }),
				  new InputListItem({
					  label: "Inside volume",
					  content: new SegmentedButton({
						  selectedKey: "b3",
						  items: [
							  new SegmentedButtonItem({key: "b1", text: "High"}),
							  new SegmentedButtonItem({key: "b2", text: "Low"}),
							  new SegmentedButtonItem({key: "b3", text: "Mute"})
						  ]
					  })
				  })
			  ]
		  });

		  vBox.addItem(oList);

		  /****************************************
		   * sap.m.InputLiistItem End             *
		   ****************************************/

		  /****************************************
		   * TextDirection Start                  *
		   ****************************************/

		  vBox.addItem(createLabel("TextDirection with telephone number:"));

		  var oRtlSb = new SegmentedButton({
			  items: [
				  new SegmentedButtonItem({text: "(+359) 111 222 333", textDirection: TextDirection.RTL}),
				  new SegmentedButtonItem({text: "(+359) 111 222 333", textDirection: TextDirection.LTR})
			  ]

		  });

		  vBox.addItem(oRtlSb);

		  /****************************************
		   * TextDirection End                    *
		   ****************************************/

		  /****************************************
		   * View                                 *
		   ****************************************/

		  page2.addContent(vBox);
		  app.addPage(page, true).addPage(page2, false);

	  }) ();
  })();
});
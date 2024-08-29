sap.ui.define([
  "sap/m/Menu",
  "sap/m/MessageToast",
  "sap/m/MenuItem",
  "sap/m/Label",
  "sap/m/MenuButton",
  "sap/m/library",
  "sap/m/Button",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/List",
  "sap/m/CustomListItem",
  "sap/m/Text",
  "sap/m/OverflowToolbar",
  "sap/m/ToolbarSpacer",
  "sap/m/ToggleButton",
  "sap/m/Page",
  "sap/m/Toolbar",
  "sap/m/Bar",
  "sap/m/App",
  "sap/ui/core/Core"
], function(
  Menu,
  MessageToast,
  MenuItem,
  Label,
  MenuButton,
  mobileLibrary,
  Button,
  Select,
  Item,
  VBox,
  HBox,
  List,
  CustomListItem,
  Text,
  OverflowToolbar,
  ToolbarSpacer,
  ToggleButton,
  Page,
  Toolbar,
  Bar,
  App,
  Core
) {
  "use strict";

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  // shortcut for sap.m.MenuButtonMode
  const MenuButtonMode = mobileLibrary.MenuButtonMode;

  // Note: the HTML page 'MenuButton.html' loads this module via data-sap-ui-on-init

  var oMenu = new Menu({
	  title: "random 2",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "fridge",
			  icon: "sap-icon://fridge",
			  items: [
				  new MenuItem({
					  text: "accidental leave",
					  icon: "sap-icon://accidental-leave",
					  items: [
						  new MenuItem({
							  icon: "sap-icon://factory",
							  text: "factory",
						  }),
						  new MenuItem({
							  icon: "sap-icon://flag",
							  text: "flag"
						  }),
						  new MenuItem({
							  icon: "sap-icon://flight",
							  text: "flight"
						  })
					  ]
				  }),
				  new MenuItem({
					  text: "iphone",
					  icon: "sap-icon://iphone",
					  items: [
						  new MenuItem({
							  icon: "sap-icon://video",
							  text: "video"
						  }),
						  new MenuItem({
							  icon: "sap-icon://loan",
							  text: "loan"
						  }),
						  new MenuItem({
							  icon: "sap-icon://commission-check",
							  text: "commission check"
						  }),
						  new MenuItem({
							  icon: "sap-icon://doctor",
							  text: "doctor"
						  })
					  ]
				  })
			  ]
		  }),
		  new MenuItem({
			  text: "globe",
			  icon: "sap-icon://globe",
			  items: [
				  new MenuItem({
					  text: "e-care",
					  icon: "sap-icon://e-care"
				  })
			  ]
		  })
	  ]
  });

  var oLabel = new Label({
	  text: "This one has a default action and uses only the default action, when in Split mode"
  });
  var oMenuButton = new MenuButton({
	  text: "Random Stuff",
	  buttonMode: MenuButtonMode.Split,
	  menu: oMenu,
	  useDefaultActionOnly: true,
	  defaultAction: function () {
		  MessageToast.show("Default action is always the same");
	  }
  });

  var oLabelSplit = new Label({
	  text: "Split button with icon"
  });
  var oMenuButtonSplit = new MenuButton({
	  tooltip: "Press for more information",
	  buttonMode: MenuButtonMode.Split,
	  icon: "sap-icon://information"
  });


  //second menu button



  var oMenu2 = new Menu({
	  title: "random 2",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "fridge",
			  icon: "sap-icon://fridge",
			  items: [
				  new MenuItem({
					  text: "accidental leave",
					  icon: "sap-icon://accidental-leave",
					  items: [
						  new MenuItem({
							  icon: "sap-icon://factory",
							  text: "factory"
						  }),
						  new MenuItem({
							  icon: "sap-icon://flag",
							  text: "flag"
						  }),
						  new MenuItem({
							  icon: "sap-icon://flight",
							  text: "flight"
						  })
					  ]
				  }),
				  new MenuItem({
					  text: "iphone",
					  icon: "sap-icon://iphone",
					  items: [
						  new MenuItem({
							  icon: "sap-icon://video",
							  text: "video"
						  }),
						  new MenuItem({
							  icon: "sap-icon://loan",
							  text: "loan"
						  }),
						  new MenuItem({
							  icon: "sap-icon://commission-check",
							  text: "commission check"
						  }),
						  new MenuItem({
							  icon: "sap-icon://doctor",
							  text: "doctor"
						  })
					  ]
				  })
			  ]
		  }),
		  new MenuItem({
			  text: "globe",
			  icon: "sap-icon://globe",
			  items: [
				  new MenuItem({
					  text: "e-care",
					  icon: "sap-icon://e-care"
				  })
			  ]
		  })
	  ]
  });

  var oMenu22 = new Menu({
	  title: "random 2",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "fridge",
			  icon: "sap-icon://fridge",
			  items: [
				  new MenuItem({
					  text: "accidental leave",
					  icon: "sap-icon://accidental-leave",
					  items: [
						  new MenuItem({
							  icon: "sap-icon://factory",
							  text: "factory"
						  }),
						  new MenuItem({
							  icon: "sap-icon://flag",
							  text: "flag"
						  }),
						  new MenuItem({
							  icon: "sap-icon://flight",
							  text: "flight"
						  })
					  ]
				  }),
				  new MenuItem({
					  text: "iphone",
					  icon: "sap-icon://iphone",
					  items: [
						  new MenuItem({
							  icon: "sap-icon://video",
							  text: "video"
						  }),
						  new MenuItem({
							  icon: "sap-icon://loan",
							  text: "loan"
						  }),
						  new MenuItem({
							  icon: "sap-icon://commission-check",
							  text: "commission check"
						  }),
						  new MenuItem({
							  icon: "sap-icon://doctor",
							  text: "doctor"
						  })
					  ]
				  })
			  ]
		  }),
		  new MenuItem({
			  text: "globe",
			  icon: "sap-icon://globe",
			  items: [
				  new MenuItem({
					  text: "e-care",
					  icon: "sap-icon://e-care"
				  })
			  ]
		  })
	  ]
  });

  var oLabel2 = new Label({
	  text: "This one has a default action, but uses the default action, when in Split mode, until a leaf item from the menu is selected"
  });
  var oMenuButton2 = new MenuButton({
	  text: "Random Stuff",
	  buttonMode: MenuButtonMode.Split,
	  type: ButtonType.Transparent,
	  icon: "sap-icon://e-care",
	  menu: oMenu2,
	  defaultAction: function () {
		  MessageToast.show("Default action is used until a menu item is selected");
	  }
  });

  var oMenu3 = new Menu({
	  title: "random 3",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "Send the response now",
			  icon: "sap-icon://accept",
			  enabled: false
		  }),
		  new MenuItem({
			  text: "Edit the response before sending",
			  icon: "sap-icon://accept",
			  enabled: false
		  }),
		  new MenuItem({
			  text: "Do not send a response",
			  icon: "sap-icon://accept",
			  enabled: false
		  })
	  ]
  });

  var oLabel3 = new Label({
	  text: "This one has a type Accept and no default action"
  });
  var oMenuButton3 = new MenuButton('mb3', {
	  tooltip: "press to accept",
	  text: "Accept",
	  buttonMode: MenuButtonMode.Split,
	  type: ButtonType.Accept,
	  useDefaultActionOnly: true,
	  menu: oMenu3,
	  defaultAction: function () {
		  MessageToast.show("Accepted");
	  }
  });

  var oMenuButton3Disabled = new MenuButton('mb3-disabled', {
	  text: "Disabled menu button",
	  enabled: false
  });

  var oMenuButton4 = new MenuButton('mb4', {
	  text: "Accept",
	  buttonMode: MenuButtonMode.Regular,
	  type: ButtonType.Accept,
	  useDefaultActionOnly: true,
	  menu: oMenu3,
	  defaultAction: function() {
		  oMenuButton3.setType(ButtonType.Reject);
		  MessageToast.show("Accepted");
	  }
  });

  var oMenuButtonLong1 = new MenuButton('mblong1', {
	  text: "Menu Button in Regular mode with long text",
	  buttonMode: MenuButtonMode.Regular
  });

  var oMenuButtonLong2 = new MenuButton('mblong2', {
	  text: "Menu Button in Split mode with long text",
	  buttonMode: MenuButtonMode.Split
  });

  var oMenu6 = new Menu({
	  title: "random 6",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "Send the response now",
			  icon: "sap-icon://accept"
		  }),
		  new MenuItem({
			  text: "Edit the response before sending",
			  icon: "sap-icon://accept"
		  }),
		  new MenuItem({
			  text: "Do not send a response",
			  icon: "sap-icon://accept"
		  })
	  ]
  });

  var oLabel6 = new Label({
	  text: "width: 100%"
  });
  var oMenuButton6 = new MenuButton({
	  text: "Accept",
	  width: "100%",
	  buttonMode: MenuButtonMode.Split,
	  useDefaultActionOnly: true,
	  menu: oMenu6,
	  defaultAction: function () {
		  MessageToast.show("Accepted");
	  }
  });

  var oMenu7 = new Menu({
	  title: "random 7",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "Send the response now",
			  icon: "sap-icon://accept"
		  }),
		  new MenuItem({
			  text: "Edit the response before sending",
			  icon: "sap-icon://accept"
		  }),
		  new MenuItem({
			  text: "Do not send a response",
			  icon: "sap-icon://accept"
		  })
	  ]
  });

  var oLabel7 = new Label({
	  text: "width: 15rem"
  });
  var oMenuButton7 = new MenuButton({
	  width: "15rem",
	  text: "Emphasized",
	  buttonMode: MenuButtonMode.Split,
	  type: ButtonType.Emphasized,
	  useDefaultActionOnly: true,
	  menu: oMenu7,
	  defaultAction: function () {
		  MessageToast.show("Emphasized");
	  }
  });

  var oMenu8 = new Menu({
	  title: "random 8",
	  itemSelected: function (oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sItemPath = "";
		  while (oItem instanceof MenuItem) {
			  sItemPath = oItem.getText() + " > " + sItemPath;
			  oItem = oItem.getParent();
		  }

		  sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

		  MessageToast.show("itemSelected: " + sItemPath);
	  },
	  items: [
		  new MenuItem({
			  text: "Send the response now",
			  icon: "sap-icon://accept",
			  tooltip: "be quick"
		  }),
		  new MenuItem({
			  text: "Edit the response before sending",
			  icon: "sap-icon://accept",
			  tooltip: "think it over"
		  }),
		  new MenuItem({
			  text: "Do not send a response",
			  icon: "sap-icon://accept",
			  tooltip: "ignore this spam"
		  })
	  ]
  });

  var oLabel8 = new Label({
	  text: "width: 250px"
  });
  var oMenuButton8 = new MenuButton("mb-toolbar", {
	  width: "250px",
	  text: "Accept",
	  buttonMode: MenuButtonMode.Regular,
	  useDefaultActionOnly: true,
	  menu: oMenu8,
	  defaultAction: function () {
		  MessageToast.show("Accepted");
	  }
  });

  var oButton = new Button({
	  text: "Change Mode",
	  press: function () {
		  oVBox.getItems().forEach(function (oItem) {
			  var otherMode;

			  if (oItem.setButtonMode) {
				  otherMode = oItem.getButtonMode() === MenuButtonMode.Regular ? MenuButtonMode.Split : MenuButtonMode.Regular;
				  oItem.setButtonMode(otherMode);
			  }
		  })
	  }
  });

  var oTestButton1 = new MenuButton({
	  width: "250px",
	  text: "Test"
  });

  var oTestButton11 = new MenuButton({
	  width: "250px",
	  icon: "sap-icon://doctor"
  });

  var oTestButton111 = new MenuButton({
	  width: "250px",
	  icon: "sap-icon://doctor",
	  text: "Test"
  });

  var oTestButton2 = new MenuButton({
	  text: "Test"
  });

  var oTestButton22 = new MenuButton({
	  icon: "sap-icon://doctor",
	  tooltip: "Surgeon",
	  menu: oMenu22
  });

  var oTestButton222 = new MenuButton({
	  icon: "sap-icon://doctor",
	  text: "Test"
  });

  var oMenuButton15 = new MenuButton({
	  text: "Deny",
	  buttonMode: MenuButtonMode.Split,
	  type: ButtonType.Reject,
	  tooltip: "Meainingful tooltip"
  });

  var bToggleTruncation = false;
  var oButtonShowTruncation = new Button({
	  text: "Show/Hide Truncation",
	  press: function () {
		  if (!bToggleTruncation) {
			  oTestButton1.setText("Lorem ipsum dolor sit amet, ad pro quando fierent, quem op");
			  oTestButton111.setText("Lorem ipsum dolor sit amet, ad pro quando fierent, quem op");
			  bToggleTruncation = true;
		  } else {
			  oTestButton1.setText("Test");
			  oTestButton111.setText("Test");
			  bToggleTruncation = false;
		  }
	  }
  });

  var oDensitySelect = new Select("density_select", {
	  items: [
		  new Item("item_cozy", {text: "Cozy"}),
		  new Item("item_compact", {text: "Compact"})
	  ],
	  change: function (oEvent) {
		  var bCompactMode = oEvent.getParameter("selectedItem").getText() === "Compact";

		  oPage.toggleStyleClass("sapUiSizeCompact", bCompactMode);
		  oPage.invalidate();
	  }
  });

  var oVBox = new VBox({

	  items: [
		  oLabelSplit,
		  oMenuButtonSplit,

		  oLabel3,
		  oMenuButton3,
		  oMenuButton4,
		  oMenuButtonLong1,
		  oMenuButtonLong2,

		  oLabel6,
		  oMenuButton6,

		  oLabel7,
		  oMenuButton7,

		  oTestButton1,
		  oTestButton11,
		  oTestButton111,
		  oTestButton2,
		  oTestButton22,
		  oTestButton222,

		  oMenuButton15,

		  oButton,
		  oButtonShowTruncation,
		  oDensitySelect
	  ]
  });

  var oHBox = new HBox({
	  items: [
		  new MenuButton('mbneg', {
			  text: "Negative",
			  buttonMode: MenuButtonMode.Split,
			  type: ButtonType.Negative,
			  useDefaultActionOnly: true,
			  defaultAction: function () {
				  MessageToast.show("Negative");
			  }
		  }).addStyleClass("sapUiSmallMargin"),
		  new MenuButton('mbattention', {
			  text: "Attention",
			  buttonMode: MenuButtonMode.Split,
			  type: ButtonType.Attention,
			  useDefaultActionOnly: true,
			  defaultAction: function () {
				  MessageToast.show("Attention");
			  }
		  }).addStyleClass("sapUiSmallMargin"),
		  new MenuButton('mbtrans', {
			  text: "Transparent",
			  buttonMode: MenuButtonMode.Split,
			  type: ButtonType.Transparent,
			  useDefaultActionOnly: true,
			  defaultAction: function () {
				  MessageToast.show("Transparent");
			  }
		  }).addStyleClass("sapUiSmallMargin")
	  ]
  });

  var oList = new List({
	  headerText: "Dynamic Button",
	  items: [
		  new CustomListItem({
			  id: "customListItem1",
			  type: "Active",
			  content: [
				  new Text({id: "textInListItem1", text: "MenuButtons in List"}),
				  new OverflowToolbar({
					  id: "overflowToolbarInListItem1",
					  design: "Solid",
					  content: [
						  new ToolbarSpacer(),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  type: "Reject"
						  }),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  buttonMode: "Split",
							  type: "Accept"
						  }),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  type: "Reject"
						  }),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  buttonMode: "Split",
							  type: "Reject"
						  }),
						  new ToggleButton({
							  icon: "sap-icon://thumb-up",
							  text: "ToggleButton",
							  type: "Accept"
						  }),
						  new ToggleButton({
							  icon: "sap-icon://thumb-up",
							  text: "ToggleButton",
							  type: "Reject"
						  }),
						  new Button({
							  icon: "sap-icon://thumb-up",
							  text: "Button",
							  type: "Accept"
						  }),
						  new Button({
							  icon: "sap-icon://thumb-up",
							  text: "Button",
							  type: "Reject"
						  }),
						  new Button({
							  icon: "sap-icon://thumb-up",
							  text: "Button",
							  type: "Transparent"
						  }),
						  new MenuButton({
							  icon: "sap-icon://thumb-up",
							  text: "MenuButton but the text is too long",
							  type: "Transparent"
						  })
					  ]
				  })
			  ]
		  }),
		  new CustomListItem({
			  id: "customListItem2",
			  type: "Active",
			  content: [
				  new Text({id: "textInListItem2", text: "MenuButtons in List"}),
				  new OverflowToolbar({
					  id: "overflowToolbarInListItem2",
					  design: "Solid",
					  content: [
						  new ToolbarSpacer(),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  type: "Reject"
						  }),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  buttonMode: "Split",
							  type: "Accept"
						  }),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  type: "Reject"
						  }),
						  new MenuButton({
							  text: "MenuButton",
							  icon: "sap-icon://thumb-up",
							  buttonMode: "Split",
							  type: "Reject"
						  }),
						  new ToggleButton({
							  icon: "sap-icon://thumb-up",
							  text: "ToggleButton",
							  type: "Accept"
						  }),
						  new ToggleButton({
							  icon: "sap-icon://thumb-up",
							  text: "ToggleButton",
							  type: "Reject"
						  }),
						  new Button({
							  icon: "sap-icon://thumb-up",
							  text: "Button",
							  type: "Accept"
						  }),
						  new Button({
							  icon: "sap-icon://thumb-up",
							  text: "Button",
							  type: "Reject"
						  }),
						  new Button({
							  icon: "sap-icon://thumb-up",
							  text: "Button",
							  type: "Transparent"
						  }),
						  new MenuButton({
							  icon: "sap-icon://thumb-up",
							  text: "MenuButton but the text is too long",
							  type: "Transparent"
						  })
					  ]
				  }).addStyleClass("sapContrast")
			  ]
		  }),
		  new CustomListItem({
			  id: "customListItem3",
			  content: [
				  new Text({id: "textInListItem3", text: "MenuButtons in Overflowed List"}),
				  new OverflowToolbar({
					  id: "overflowToolbarInListItem3",
					  width: "50px",
					  content: [
						  new MenuButton({
							  id: "menuButtonInOverflow",
							  icon: "sap-icon://thumb-up",
							  text: "MenuButton but the text is too long",
							  type: "Transparent"
						  }),
						  new MenuButton({
							  id: "menuButtonInOverflow2",
							  icon: "sap-icon://thumb-up",
							  text: "Split MenuButton but the text is too long",
							  buttonMode: "Split",
							  type: "Reject"
						  })
					  ]
				  })
			  ]
		  })
	  ]
  });

  var oPage = new Page("page0", {
	  customHeader: new Toolbar({
		  content: [
			  oLabel8,
			  oMenuButton8,
			  oMenuButton3Disabled
		  ]
	  }),
	  subHeader: new Toolbar({
		  content: [
			  oLabel,
			  oMenuButton
		  ]
	  }),
	  content: [
		  oVBox,
		  oHBox,
		  oList,
		  new Button({
			  text: "test",
			  type: "Transparent"
		  }),
		  new MenuButton({
			  text: "Test",
			  type: "Transparent",
			  buttonMode: "Regular"
		  }),
	  ],
	  footer: new Bar({
		  contentMiddle: [
			  oLabel2,
			  oMenuButton2,
			  new MenuButton({
				  text: "Test"
			  }),
			  new MenuButton({
				  icon: "sap-icon://thumb-up",
				  buttonMode: "Split",
				  type: "Accept"
			  }),
			  new MenuButton({
				  icon: "sap-icon://share",
				  buttonMode: "Split",
				  type: "Reject"
			  })
		  ]
	  })
  });

  var oApp = new App({
	  initialPage: "page0",
	  pages: [
		  oPage
	  ]
  });

  oApp.placeAt("body");
});
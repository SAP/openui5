sap.ui.define([
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/library",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Bar",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/AdditionalTextButton"
], function(HTML, IconPool, mobileLibrary, App, Page, Bar, Button, Label, AdditionalTextButton) {
  "use strict";

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  var sAddIconURI = IconPool.getIconURI("add");
  var sDeleteIconURI = IconPool.getIconURI("delete");
  var sChangeIconURI = IconPool.getIconURI("cause");
  var sSrcIconURI = IconPool.getIconURI("employee");
  var sSrcActiveIconURI = IconPool.getIconURI("employee-lookup");
  var sStoreIconURI = IconPool.getIconURI("retail-store");
  var sStoreActiveIconURI = IconPool.getIconURI("cart-full");
  var sNotesIconURI = IconPool.getIconURI("notes");

  var oHelper = {
	  alert : function(sMsg) {
		  //alert(sMsg);
	  },
	  typeDefault : function(oButton) {
		  oButton.setText("Test Button To Show Changes");
		  oButton.setType(ButtonType.Default);
	  },
	  typeUnstyled : function(oButton) {
		  oButton.setText("Unstyled Button");
		  oButton.setType(ButtonType.Unstyled);
	  },
	  typeAccept : function(oButton) {
		  oButton.setText("Accept Button");
		  oButton.setType(ButtonType.Accept);
	  },
	  typeReject : function(oButton) {
		  oButton.setText("Reject Button");
		  oButton.setType(ButtonType.Reject);
	  },
	  typeTransparent : function(oButton) {
		  oButton.setText("Transparent Button");
		  oButton.setType(ButtonType.Transparent);
	  },
	  typeGhost : function(oButton) {
		  oButton.setText("Ghost Button");
		  oButton.setType(ButtonType.Ghost);
	  },
	  typeBack : function(oButton) {
		  oButton.setText("Back Button");
		  oButton.setType(ButtonType.Back);
	  },
	  typeUp : function(oButton) {
		  oButton.setText("Up Button");
		  oButton.setType(ButtonType.Up);
	  },
	  typeEmphasized : function(oButton) {
		  oButton.setText("Emphasized Button");
		  oButton.setType(ButtonType.Emphasized);
	  },
	  setEnabled : function(oButton) {
		  oButton.setEnabled( !oButton.getEnabled() );
	  },
	  width100Pixel : function(oButton) {
		  oButton.setWidth("120px");
	  },
	  width300Pixel : function(oButton) {
		  oButton.setWidth("300px");
	  },
	  width100Percent : function(oButton) {
		  oButton.setWidth("100%");
	  },
	  width50Percent : function(oButton) {
		  oButton.setWidth("50%");
	  },
	  widthReset : function(oButton) {
		  oButton.setWidth("");
	  },
	  addImage : function(oButton) {
		  oButton.setIcon("./images/travel_expend.png");
		  oButton.setActiveIcon("./images/travel_request.png");
	  },
	  removeImage : function(oButton) {
		  oButton.setIcon(null);
		  oButton.setActiveIcon(null);
	  },
	  alignImage : function(oButton) {
		  if (oButton.getIconFirst()) {
			  oButton.setIconFirst(false);
		  } else {
			  oButton.setIconFirst(true);
		  }
	  },
	  addIcon : function(oButton) {
		  oButton.setIcon(sSrcIconURI);
		  oButton.setActiveIcon(sSrcActiveIconURI);
	  },
	  removeIcon : function(oButton) {
		  oButton.setIcon(null);
		  oButton.setActiveIcon(null);
	  },
	  alignIcon : function(oButton) {
		  if (oButton.getIconFirst()) {
			  oButton.setIconFirst(false);
		  } else {
			  oButton.setIconFirst(true);
		  }
	  },
	  changeIcon : function(oButton) {
		  oButton.setIcon(sStoreIconURI);
		  oButton.setActiveIcon(sStoreActiveIconURI);
	  },
	  hide : function(oButton) {
		  oButton.setVisible(false);
	  },
	  show : function(oButton) {
		  oButton.setVisible(true);
	  },
	  removeText : function(oButton) {
		  oButton.setText("");
	  },
	  changeText : function(oButton) {
		  oButton.setText("Another Button Text");
	  },
	  resetText : function(oButton) {
		  oButton.setText("Test Button To Show Changes");
	  },
	  toggleTextDirection: function(oButton) {
		  var sTextDir = oButton.getTextDirection();
		  oButton.setTextDirection(sTextDir === "RTL" ? "LTR" : "RTL");
	  }
  };

  var oApp = new App("myApp", {initialPage:"myPage1"});

  var oButtonBarButtonSample = null;

  var oPage1 = new Page("myPage1", {
	  title: "Mobile Button Control",
	  customHeader : new Bar({
		  contentLeft: [ oButtonBarButtonSample = new Button('myBarButtonSample', {text:"Test Button To Show Changes", tooltip:"Tooltip Test", type:ButtonType.Default, press: function() {oHelper.alert("event: 'press' on " + oButtonBarButtonSample)} }) ],
		  contentMiddle: [ new Label("myBarLabel", {text: "Button Testpage"}) ],
		  contentRight: [ oButtonBarButtonIcon1 = new Button('myBarButtonIcon1', {icon: sStoreIconURI}),
						  oButtonBarButtonIcon2 = new Button('myBarButtonIcon2', {icon: sNotesIconURI, enabled: false}) ]
	  }),
	  subHeader: new Bar({
		  contentLeft: [ new Button({text:"Default", type:ButtonType.Default}) ],
		  contentMiddle:[ new Button({text:"Back", type:ButtonType.Back}),
						  new Button({text:"Up", type:ButtonType.Up}),
						  new Button({text:"Yes", type:ButtonType.Accept}),
						  new Button({text:"No", type:ButtonType.Reject}),
						  new Button({text:"Trans", type:ButtonType.Transparent}) ],
		  contentRight: [ new Button({icon: sStoreIconURI}),
						  new Button({text:"", type:ButtonType.Default, icon: sNotesIconURI, enabled: false}) ]
	  }),
	  footer : new Bar({
		  contentLeft: [ new Button({text:"Default", type:ButtonType.Default, icon: sStoreIconURI}),
						  new Button({text:"Emphasized", type:ButtonType.Emphasized}) ],
		  contentMiddle:[ new Button({text:"Back", type:ButtonType.Back}),
						  new Button({text:"Up", type:ButtonType.Up}),
						  new Button({text:"Yes", type:ButtonType.Accept}),
						  new Button({text:"No", type:ButtonType.Reject, icon: "./images/action.png", enabled:false}),
						  new Button({text:"Trans", type:ButtonType.Transparent}),
						  new Button({text:"Off", type:ButtonType.Default,  icon: "sap-icon://favorite", enabled:false}) ],
		  contentRight: [	new Button({icon: sStoreIconURI}),
						  new Button({text:"", type:ButtonType.Default, icon: sNotesIconURI, enabled: false}) ]
	  })
  });

  var oBar2 = new Bar({
	  contentLeft: [ new Button({text:"Default", type:ButtonType.Default, enabled:false}) ],
	  contentMiddle:[ new Button({text:"Back", type:ButtonType.Back, enabled:false}),
					  new Button({text:"Up", type:ButtonType.Up, enabled:false}),
					  new Button({text:"Yes", type:ButtonType.Accept, enabled:false}),
					  new Button({text:"No", type:ButtonType.Reject, enabled:false}),
					  new Button({text:"Trans", type:ButtonType.Transparent, enabled:false}) ],
	  contentRight: [ new Button({icon: sStoreIconURI}),
					  new Button({text:"", type:ButtonType.Default, icon: sNotesIconURI, enabled: false}) ]
  });

  var oButtonBarDefault = new Button("myButtonBarDefault", {
	  type: ButtonType.Default,
	  text: "Button Type Default",
	  enabled: true,
	  press : function() {
		  oHelper.typeDefault(oButtonBarButtonSample)
	  }
  });

  var oButtonBarUnstyled = new Button("myButtonBarUnstyled", {
	  type: ButtonType.Default,
	  text: "Button Type Unstyled",
	  enabled: true,
	  press : function() {
		  oHelper.typeUnstyled(oButtonBarButtonSample)
	  }
  });

  var oButtonBarAccept = new Button("myButtonBarAccept", {
	  type: ButtonType.Default,
	  text: "Button Type Accept",
	  enabled: true,
	  press : function() {
		  oHelper.typeAccept(oButtonBarButtonSample)
	  }
  });

  var oButtonBarReject = new Button("myButtonBarReject", {
	  type: ButtonType.Default,
	  text: "Button Type Reject",
	  enabled: true,
	  press : function() {
		  oHelper.typeReject(oButtonBarButtonSample)
	  }
  });

  var oButtonBarTransparent = new Button("myButtonBarTransparent", {
	  type: ButtonType.Default,
	  text: "Button Type Transparent",
	  enabled: true,
	  press : function() {
		  oHelper.typeTransparent(oButtonBarButtonSample)
	  }
  });

  var oButtonBarGhost = new Button("myButtonBarGhost", {
	  type: ButtonType.Default,
	  text: "Button Type Ghost",
	  enabled: true,
	  press : function() {
		  oHelper.typeGhost(oButtonBarButtonSample)
	  }
  });

  var oButtonBarBack = new Button("myButtonBarBack", {
	  type: ButtonType.Default,
	  text: "Button Type Back",
	  enabled: true,
	  press : function() {
		  oHelper.typeBack(oButtonBarButtonSample)
	  }
  });

  var oButtonBarUp = new Button("myButtonBarUp", {
	  type: ButtonType.Default,
	  text: "Button Type Up",
	  enabled: true,
	  press : function() {
		  oHelper.typeUp(oButtonBarButtonSample)
	  }
  });

  var oButtonBarEmphasized = new Button("myButtonBarEmphasized", {
	  type: ButtonType.Default,
	  text: "Button Type Emphasized",
	  enabled: true,
	  press : function() {
		  oHelper.typeEmphasized(oButtonBarButtonSample)
	  }
  });

  var oButtonBarEnabled = new Button("myButtonBarEnabled", {
	  type: ButtonType.Default,
	  text: "Disable/Enable Button",
	  enabled: true,
	  press : function() {
		  oHelper.setEnabled(oButtonBarButtonSample)
	  }
  });

  var oButtonBarWidth100Pixel = new Button("myButtonBarWidth100Pixel", {
	  type: ButtonType.Default,
	  text: "Set width 120px",
	  enabled: true,
	  press : function() {
		  oHelper.width100Pixel(oButtonBarButtonSample)
	  }
  });

  var oButtonBarWidth100Percent = new Button("myButtonBarWidth100Percent", {
	  type: ButtonType.Default,
	  text: "Set width 100%",
	  enabled: true,
	  press : function() {
		  oHelper.width100Percent(oButtonBarButtonSample)
	  }
  });

  var oButtonBarWidth300Pixel = new Button("myButtonBarWidth300Pixel", {
	  type: ButtonType.Default,
	  text: "Set width 300px",
	  enabled: true,
	  press : function() {
		  oHelper.width300Pixel(oButtonBarButtonSample)
	  }
  });

  var oButtonBarWidthReset = new Button("myButtonBarWidthReset", {
	  type: ButtonType.Default,
	  text: "Reset width",
	  enabled: true,
	  press : function() {
		  oHelper.widthReset(oButtonBarButtonSample)
	  }
  });

  var oButtonBarAddImage = new Button("myButtonBarAddImage", {
	  type: ButtonType.Default,
	  text: "Add Image",
	  icon: "./images/action_pressed.png",
	  enabled: true,
	  press : function() {
		  oHelper.addImage(oButtonBarButtonSample)
	  }
  });

  var oButtonBarRemoveImage = new Button("myButtonBarRemoveImage", {
	  type: ButtonType.Default,
	  text: "Remove Image",
	  icon: "./images/action.png",
	  enabled: true,
	  press : function() {
		  oHelper.removeImage(oButtonBarButtonSample)
	  }
  });

  var oButtonBarAlignImage = new Button("myButtonBarAlignImage", {
	  type: ButtonType.Default,
	  text: "Button Image (left/right)",
	  enabled: true,
	  press : function() {
		  oHelper.alignImage(oButtonBarButtonSample)
	  }
  });

  var oButtonBarAddIcon = new Button("myButtonBarAddIcon", {
	  type: ButtonType.Default,
	  text: "Add Icon",
	  icon: sAddIconURI,
	  activeIcon: sChangeIconURI,
	  enabled: true,
	  press : function() {
		  oHelper.addIcon(oButtonBarButtonSample)
	  }
  });

  var oButtonBarChangeIcon = new Button("myButtonBarChangeIcon", {
	  type: ButtonType.Default,
	  text: "Change Icon",
	  icon: sChangeIconURI,
	  enabled: true,
	  press : function() {
		  oHelper.changeIcon(oButtonBarButtonSample)
	  }
  });

  var oButtonBarRemoveIcon = new Button("myButtonBarRemoveIcon", {
	  type: ButtonType.Default,
	  text: "Remove Icon",
	  icon: sDeleteIconURI,
	  enabled: true,
	  press : function() {
		  oHelper.removeIcon(oButtonBarButtonSample)
	  }
  });

  var oButtonBarAlignIcon = new Button("myButtonBarAlignIcon", {
	  type: ButtonType.Default,
	  text: "Button Icon (left/right)",
	  enabled: true,
	  press : function() {
		  oHelper.alignIcon(oButtonBarButtonSample)
	  }
  });

  var oButtonBarHide = new Button("myButtonBarHide", {
	  type: ButtonType.Default,
	  text: "Hide Button",
	  enabled: true,
	  press : function() {
		  oHelper.hide(oButtonBarButtonSample)
	  }
  });

  var oButtonBarShow = new Button("myButtonBarShow", {
	  type: ButtonType.Default,
	  text: "Show Button",
	  enabled: true,
	  press : function() {
		  oHelper.show(oButtonBarButtonSample)
	  }
  });

  var oButtonBarRemoveText = new Button("myButtonBarRemoveText", {
	  type: ButtonType.Default,
	  text: "Remove Text",
	  enabled: true,
	  press : function() {
		  oHelper.removeText(oButtonBarButtonSample)
	  }
  });

  var oButtonBarChangeText = new Button("myButtonBarChangeText", {
	  type: ButtonType.Default,
	  text: "Change Text",
	  enabled: true,
	  press : function() {
		  oHelper.changeText(oButtonBarButtonSample)
	  }
  });

  var oButtonBarResetText = new Button("myButtonBarResetText", {
	  type: ButtonType.Default,
	  text: "Reset Text",
	  enabled: true,
	  press : function() {
		  oHelper.resetText(oButtonBarButtonSample)
	  }
  });

  var oButtonBarToggleTextDirection = new Button("myButtonBarToggleTextDirection", {
	  type: ButtonType.Default,
	  text: "Toggle TextDirection",
	  enabled: true,
	  press: function() {
		  oHelper.toggleTextDirection(oButtonBarButtonSample);
	  }
  });

  var oButtonBarLinkRole = new Button("myButtonBarLinkRole", {
	  type: ButtonType.Default,
	  text: "Link role",
	  enabled: true,
	  accessibleRole: "Link"
  });

  /* ---------------------------------------- */

  var oButtonSample = new Button("myButtonSample", {
	  type: ButtonType.Default,
	  text: "Test Button To Show Changes",
	  enabled: true,
	  tooltip: "tooltip",
	  press : function() {
		  oHelper.alert("event: 'press' on " + oButtonSample)
	  }
  });

  var oButtonDefault = new Button("myButtonDefault", {
	  type: ButtonType.Default,
	  text: "Button Type Default",
	  enabled: true,
	  press : function() {
		  oHelper.typeDefault(oButtonSample)
	  }
  });

  var oButtonUnstyled = new Button("myButtonUnstyled", {
	  type: ButtonType.Default,
	  text: "Button Type Unstyled",
	  enabled: true,
	  press : function() {
		  oHelper.typeUnstyled(oButtonSample)
	  }
  });

  var oButtonAccept = new Button("myButtonAccept", {
	  type: ButtonType.Default,
	  text: "Button Type Accept",
	  enabled: true,
	  press : function() {
		  oHelper.typeAccept(oButtonSample)
	  }
  });

  var oButtonReject = new Button("myButtonReject", {
	  type: ButtonType.Default,
	  text: "Button Type Reject",
	  enabled: true,
	  press : function() {
		  oHelper.typeReject(oButtonSample)
	  }
  });

  var oButtonTransparent = new Button("myButtonTransparent", {
	  type: ButtonType.Default,
	  text: "Button Type Transparent",
	  enabled: true,
	  press : function() {
		  oHelper.typeTransparent(oButtonSample)
	  }
  });

  var oButtonBack = new Button("myButtonBack", {
	  type: ButtonType.Default,
	  text: "Button Type Back",
	  enabled: true,
	  press : function() {
		  oHelper.typeBack(oButtonSample)
	  }
  });

  var oButtonUp = new Button("myButtonUp", {
	  type: ButtonType.Default,
	  text: "Button Type Up",
	  enabled: true,
	  press : function() {
		  oHelper.typeUp(oButtonSample)
	  }
  });

  var oButtonEmphasized = new Button("myButtonEmphasized", {
	  type: ButtonType.Default,
	  text: "Button Type Emphasized",
	  enabled: true,
	  press : function() {
		  oHelper.typeEmphasized(oButtonSample)
	  }
  });

  var oButtonEnabled = new Button("myButtonEnabled", {
	  type: ButtonType.Default,
	  text: "Disable/Enable Button",
	  enabled: true,
	  press : function() {
		  oHelper.setEnabled(oButtonSample)
	  }
  });

  var oButtonWidth100Pixel = new Button("myButtonWidth100Pixel", {
	  type: ButtonType.Default,
	  text: "Set width 120px",
	  enabled: true,
	  press : function() {
		  oHelper.width100Pixel(oButtonSample)
	  }
  });

  var oButtonWidth100Percent = new Button("myButtonWidth100Percent", {
	  type: ButtonType.Default,
	  text: "Set width 100%",
	  enabled: true,
	  press : function() {
		  oHelper.width100Percent(oButtonSample)
	  }
  });

  var oButtonWidth50Percent = new Button("myButtonWidth50Percent", {
	  type: ButtonType.Default,
	  text: "Set width 50%",
	  enabled: true,
	  press : function() {
		  oHelper.width50Percent(oButtonSample)
	  }
  });

  var oButtonWidthReset = new Button("myButtonWidthReset", {
	  type: ButtonType.Default,
	  text: "Reset width",
	  enabled: true,
	  press : function() {
		  oHelper.widthReset(oButtonSample)
	  }
  });

  var oButtonAddImage = new Button("myButtonAddImage", {
	  type: ButtonType.Default,
	  text: "Add Image",
	  icon: "./images/action_pressed.png",
	  enabled: true,
	  press : function() {
		  oHelper.addImage(oButtonSample)
	  }
  });

  var oButtonRemoveImage = new Button("myButtonRemoveImage", {
	  type: ButtonType.Default,
	  text: "Remove Image",
	  icon: "./images/action.png",
	  enabled: true,
	  press : function() {
		  oHelper.removeImage(oButtonSample)
	  }
  });

  var oButtonAlignImage = new Button("myButtonAlignImage", {
	  type: ButtonType.Default,
	  text: "Button Image (left/right)",
	  enabled: true,
	  press : function() {
		  oHelper.alignImage(oButtonSample)
	  }
  });

  var oButtonAddIcon = new Button("myButtonAddIcon", {
	  type: ButtonType.Default,
	  text: "Add Icon",
	  icon: sAddIconURI,
	  enabled: true,
	  press : function() {
		  oHelper.addIcon(oButtonSample)
	  }
  });

  var oButtonRemoveIcon = new Button("myButtonRemoveIcon", {
	  type: ButtonType.Default,
	  text: "Remove Icon",
	  icon: sDeleteIconURI,
	  enabled: true,
	  press : function() {
		  oHelper.removeIcon(oButtonSample)
	  }
  });

  var oButtonAlignIcon = new Button("myButtonAlignIcon", {
	  type: ButtonType.Default,
	  text: "Button Icon (left/right)",
	  enabled: true,
	  press : function() {
		  oHelper.alignIcon(oButtonSample)
	  }
  });

  var oButtonHide = new Button("myButtonHide", {
	  type: ButtonType.Default,
	  text: "Hide Button",
	  enabled: true,
	  press : function() {
		  oHelper.hide(oButtonSample)
	  }
  });

  var oButtonShow = new Button("myButtonShow", {
	  type: ButtonType.Default,
	  text: "Show Button",
	  enabled: true,
	  press : function() {
		  oHelper.show(oButtonSample)
	  }
  });

  var oButtonRemoveText = new Button("myButtonRemoveText", {
	  type: ButtonType.Default,
	  text: "Remove Text",
	  enabled: true,
	  press : function() {
		  oHelper.removeText(oButtonSample)
	  }
  });

  var oButtonChangeText = new Button("myButtonChangeText", {
	  type: ButtonType.Default,
	  text: "Change Text",
	  enabled: true,
	  press : function() {
		  oHelper.changeText(oButtonSample)
	  }
  });

  var oButtonResetText = new Button("myButtonResetText", {
	  type: ButtonType.Default,
	  text: "Reset Text",
	  enabled: true,
	  press : function() {
		  oHelper.resetText(oButtonSample)
	  }
  });

  var oButtonToggleTextDirection = new Button("myButtonToggleTextDirection", {
	  type: ButtonType.Default,
	  text: "Toggle TextDirection",
	  enabled: true,
	  press: function() {
		  oHelper.toggleTextDirection(oButtonSample);
	  }
  });

  var oButtonBdiLTR = new Button("myButtonBdiLtr", {
	  text: "BDI tag when text is in LTR language (Next button is only in RTL 123)"
  });

  var oButtonBdiRTL = new Button("myButtonBdiRtl", {
	  text: "עברית (עברית 123)"
  });

  var oButtonBdi = new Button("myButtonBdi", {
	  text: "Here we have both LTR and RTL languages 123 (עברית  456)"
  });

  var oButtonBdi2 = new Button("myButtonBdi2", {
	  text: "עברית 123 (now English in the brackets 456)"
  });

  var oButtonWithTwoYearsText = new AdditionalTextButton("myBottonWithTwoYears",{
	  type: ButtonType.Transparent,
	  text : "1424 AH – 1431 AH",
	  additionalText: "2003 – 2010"
  });


  var oButtonWithTwoMonthsText = new AdditionalTextButton("myBottonWithTwoMoths",{
	  type: ButtonType.Transparent,
	  text : "Jumada I",
	  additionalText: "Dec – Jan"
  });

  oPage1.addContent(oBar2)
		.addContent(new HTML("myEmptyLine1", {content: "<br>"}))
			  .addContent(new HTML("myHtmlBarDefault", {content: ""}))
			  .addContent(oButtonBarDefault)
			  .addContent(new HTML("myHtmlBarUnstyled", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarUnstyled)
			  .addContent(new HTML("myHtmlBarAccept", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarAccept)
			  .addContent(new HTML("myHtmlBarReject", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarReject)
			  .addContent(new HTML("myHtmlBarTransparent", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarTransparent)
			  .addContent(new HTML("myHtmlBarGhost", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarGhost)
			  .addContent(new HTML("myHtmlBarBack", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarBack)
			  .addContent(new HTML("myHtmlBarUp", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarUp)
			  .addContent(new HTML("myHtmlBarEmphasized", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarEmphasized)
			  .addContent(new HTML("myHtmlBarEnabled", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarEnabled)
			  .addContent(new HTML("myHtmlBarWidth100Pixel", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarWidth100Pixel)
			  .addContent(new HTML("myHtmlBarWidth300Pixel", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarWidth300Pixel)
			  .addContent(new HTML("myHtmlBarWidth100Percent", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarWidth100Percent)
			  .addContent(new HTML("myHtmlBarWidthReset", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarWidthReset)
			  .addContent(new HTML("myHtmlBarAddImage", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarAddImage)
			  .addContent(new HTML("myHtmlBarRemoveImage", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarRemoveImage)
			  .addContent(new HTML("myHtmlBarAlignImage", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarAlignImage)
			  .addContent(new HTML("myHtmlBarAddIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarAddIcon)
			  .addContent(new HTML("myHtmlBarChangeIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarChangeIcon)
			  .addContent(new HTML("myHtmlBarRemoveIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarRemoveIcon)
			  .addContent(new HTML("myHtmlBarAlignIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarAlignIcon)
			  .addContent(new HTML("myHtmlBarHide", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarHide)
			  .addContent(new HTML("myHtmlBarShow", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarShow)
			  .addContent(new HTML("myHtmlBarRemoveText", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarRemoveText)
			  .addContent(new HTML("myHtmlBarChangeText", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarChangeText)
			  .addContent(new HTML("myHtmlBarResetText", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarResetText)
			  .addContent(new HTML("myHtmlBarToggleTextDirection", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBarToggleTextDirection)
			  .addContent(oButtonBarLinkRole)
			  .addContent(new HTML("myEmptyLine2", {content: "<br><br>"}))
			  .addContent(new HTML("myDividerLine1", {content: "<br><hr style='border:solid #000000; border-width: 5px 0 0;'>"}))
			  .addContent(oButtonSample)
			  .addContent(new HTML("myDividerLine3", {content: "<br><hr>"}))
			  .addContent(new HTML("myHtmlDefault", {content: "<br>"}))
			  .addContent(oButtonDefault)
			  .addContent(new HTML("myHtmlUnstyled", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonUnstyled)
			  .addContent(new HTML("myHtmlAccept", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonAccept)
			  .addContent(new HTML("myHtmlReject", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonReject)
			  .addContent(new HTML("myHtmlTransparent", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonTransparent)
			  .addContent(new HTML("myHtmlBack", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBack)
			  .addContent(new HTML("myHtmlUp", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonUp)
			  .addContent(new HTML("myHtmlEmphasized", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonEmphasized)
			  .addContent(new HTML("myHtmlEnabled", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonEnabled)
			  .addContent(new HTML("myHtmlWidth100Pixel", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonWidth100Pixel)
			  .addContent(new HTML("myHtmlWidth100Percent", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonWidth100Percent)
			  .addContent(new HTML("myHtmlWidth50Percent", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonWidth50Percent)
			  .addContent(new HTML("myHtmlWidthReset", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonWidthReset)
			  .addContent(new HTML("myHtmlAddImage", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonAddImage)
			  .addContent(new HTML("myHtmlRemoveImage", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonRemoveImage)
			  .addContent(new HTML("myHtmlAlignImage", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonAlignImage)
			  .addContent(new HTML("myHtmlAddIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonAddIcon)
			  .addContent(new HTML("myHtmlRemoveIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonRemoveIcon)
			  .addContent(new HTML("myHtmlAlignIcon", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonAlignIcon)
			  .addContent(new HTML("myHtmlHide", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonHide)
			  .addContent(new HTML("myHtmlShow", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonShow)
			  .addContent(new HTML("myHtmlRemoveText", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonRemoveText)
			  .addContent(new HTML("myHtmlChangeText", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonChangeText)
			  .addContent(new HTML("myHtmlResetText", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonResetText)
			  .addContent(new HTML("myHtmlToggleTextDirection", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonToggleTextDirection)
			  .addContent(new HTML("myDividerLine4", {content: "<br><hr style='border:solid #000000; border-width: 5px 0 0;'>"}))
			  .addContent(oButtonBdiLTR)
			  .addContent(new HTML("myHtmloButtonBdiLTR", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBdiRTL)
			  .addContent(new HTML("myHtmloButtonBdi", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBdi)
			  .addContent(new HTML("myHtmloButtonBdi2", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonBdi2)
			  .addContent(new HTML("myHtmloButtonWithSecondTextYears", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonWithTwoYearsText)
			  .addContent(new HTML("myHtmloButtonWithSecondTextMonths", {content: "<div class='ButtonSpace'>&nbsp;</div>"}))
			  .addContent(oButtonWithTwoMonthsText);

  oApp.addPage(oPage1);
  oApp.placeAt("body");
});
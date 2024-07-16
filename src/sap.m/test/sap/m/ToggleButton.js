sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/MessageToast",
  "sap/m/ToggleButton",
  "sap/m/library",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Bar",
  "sap/m/Label"
], function(Element, HTML, IconPool, MessageToast, ToggleButton, mobileLibrary, App, Page, Bar, Label) {
  "use strict";

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  var oHelper,
	  oPage,
	  oApp;

  oHelper = {
	  showStatus : function(oEvt)  {
		  if (oEvt.getSource().getPressed()) {
			  MessageToast.show(oEvt.getSource().getId() + " Pressed");
		  } else {
			  MessageToast.show(oEvt.getSource().getId() + " Unpressed");
		  }
	  }
  };

  //Toggle Button 1
  var oToggleBtn1 = new ToggleButton("b1");
  oToggleBtn1.setText("Enabled");
  oToggleBtn1.setEnabled(true);

  //Toggle Button 2
  var oToggleBtn2 = new ToggleButton("b2");
  oToggleBtn2.setText("Disabled");
  oToggleBtn2.setEnabled(false);

  //Toggle Button 3
  var oToggleBtn3 = new ToggleButton("b3");
  oToggleBtn3.setIcon("sap-icon://home");
  oToggleBtn3.setTooltip("Home");

  //Toggle Button 4
  var oToggleBtn4 = new ToggleButton("b4");
  oToggleBtn4.setIcon("sap-icon://action");
  oToggleBtn4.setEnabled(false);
  oToggleBtn4.setTooltip("Action");

  //Toggle Button 21
  var oToggleBtn21 = new ToggleButton("b21");
  oToggleBtn21.setIcon("sap-icon://action");
  oToggleBtn21.setText("Pressed & Disabled"),
  oToggleBtn21.setPressed(true);
  oToggleBtn21.setEnabled(false);

  //Toggle Button 21a
  var oToggleBtn21a = new ToggleButton("b21a");
  oToggleBtn21a.setIcon("sap-icon://action");
  oToggleBtn21a.setText("ToggleButton"),
  oToggleBtn21a.setPressed(true);
  oToggleBtn21a.setEnabled(true);

  //	customHeaderButtons
  //Toggle Button 5
  var oToggleBtn5 = new ToggleButton("b5");
  oToggleBtn5.setText("Enabled");
  oToggleBtn5.setEnabled(true);

  //Toggle Button 6
  var oToggleBtn6 = new ToggleButton("b6");
  oToggleBtn6.setText("Disabled");
  oToggleBtn6.setEnabled(false);

  //Toggle Button 7
  var oToggleBtn7 = new ToggleButton("b7");
  oToggleBtn7.setIcon("sap-icon://home");
  oToggleBtn7.setTooltip("Home");

  //Toggle Button 8
  var oToggleBtn8 = new ToggleButton("b8");
  oToggleBtn8.setIcon("sap-icon://action");

  //	subHeaderButtons
  //Toggle Button 9
  var oToggleBtn9 = new ToggleButton("b9");
  oToggleBtn9.setText("Enabled");
  oToggleBtn9.setEnabled(true);

  //Toggle Button 10
  var oToggleBtn10 = new ToggleButton("b10");
  oToggleBtn10.setText("Disabled");
  oToggleBtn10.setEnabled(false);

  //Toggle Button 11
  var oToggleBtn11 = new ToggleButton("b11");
  oToggleBtn11.setText("ToggleButton with icon first");
  oToggleBtn11.setIcon("sap-icon://action");
  oToggleBtn11.setIconFirst(true);

  //ToggleButton 11a (transparent)
  var oToggleBtn11a = new ToggleButton("b11a");
  oToggleBtn11a.setText("Transparent TButton");
  oToggleBtn11a.setPressed(true);
  oToggleBtn11a.setEnabled(false);
  oToggleBtn11a.setType(ButtonType.Transparent);

  //ToggleButton 11b (transparent)
  var oToggleBtn11b = new ToggleButton("b11b");
  oToggleBtn11b.setType(ButtonType.Transparent);
  oToggleBtn11b.setIcon("sap-icon://action");
  oToggleBtn11b.setTooltip("Action");

  //ToggleButton 11c (transparent)
  var oToggleBtn11c = new ToggleButton("b11c");
  oToggleBtn11c.setText("Transparent");
  oToggleBtn11c.setType(ButtonType.Transparent);

  //ToggleButton 11d (transparent)
  var oToggleBtn11d = new ToggleButton("b11d");
  oToggleBtn11d.setIcon("sap-icon://action");
  oToggleBtn11d.setText("Transparent");
  oToggleBtn11d.setIconFirst(true);
  oToggleBtn11d.setType(ButtonType.Transparent);

  //ToggleButton 11e (transparent)
  var oToggleBtn11e = new ToggleButton("b11e");
  oToggleBtn11e.setIcon("sap-icon://action");
  oToggleBtn11e.setText("Transparent/Disabled");
  oToggleBtn11e.setIconFirst(true);
  oToggleBtn11e.setEnabled(false);
  oToggleBtn11e.setType(ButtonType.Transparent);

  //ToggleButton 11f (transparent)
  var oToggleBtn11f = new ToggleButton("b11f");
  oToggleBtn11f.setIcon("sap-icon://action");
  oToggleBtn11f.setEnabled(true);
  oToggleBtn11f.setType(ButtonType.Transparent);
  oToggleBtn11f.setTooltip("Action");

  //ToggleButton 11g (transparent)
  var oToggleBtn11g = new ToggleButton("b11g");
  oToggleBtn11g.setIcon("sap-icon://action");
  oToggleBtn11g.setText("Transparent/Disabled");
  oToggleBtn11g.setPressed(true);
  oToggleBtn11g.setIconFirst(true);
  oToggleBtn11g.setEnabled(false);
  oToggleBtn11g.setType(ButtonType.Transparent);

  //ToggleButton 11h (transparent)
  var oToggleBtn11h = new ToggleButton("b11h");
  oToggleBtn11h.setText("Transparent");
  oToggleBtn11h.setEnabled(true);
  oToggleBtn11h.setType(ButtonType.Transparent);

  //Toggle Button 12
  var oToggleBtn12 = new ToggleButton("b12");
  oToggleBtn12.setText("ToggleButton with icon last");
  oToggleBtn12.setIcon("sap-icon://action");
  oToggleBtn12.setIconFirst(false);

  //	FooterButtons
  //Toggle Button 13
  var oToggleBtn13 = new ToggleButton("b13");
  oToggleBtn13.setText("Enabled");
  oToggleBtn13.setEnabled(true);

  //Toggle Button 14
  var oToggleBtn14 = new ToggleButton("b14");
  oToggleBtn14.setText("Disabled");
  oToggleBtn14.setEnabled(false);

  //Toggle Button 15
  var oToggleBtn15 = new ToggleButton("b15");
  oToggleBtn15.setText("ToggleButton with icon first");
  oToggleBtn15.setIcon("sap-icon://action");
  oToggleBtn15.setIconFirst(true);

  //Toggle Button 16
  var oToggleBtn16 = new ToggleButton("b16");
  oToggleBtn16.setText("ToggleButton with icon last");
  oToggleBtn16.setIcon("sap-icon://action");
  oToggleBtn16.setIconFirst(false);

  //Toggle Button 17
  var oToggleBtn17 = new ToggleButton("b17");
  oToggleBtn17.setIcon("sap-icon://home");
  oToggleBtn17.setTooltip("Home");

  //Toggle Button 18
  var oToggleBtn18 = new ToggleButton("b18");
  oToggleBtn18.setIcon("sap-icon://home");
  oToggleBtn18.setTooltip("Home");

  //Toggle Button 19
  var oToggleBtn19 = new ToggleButton("b19");
  oToggleBtn19.setIcon("sap-icon://home");
  oToggleBtn19.setEnabled(false);
  oToggleBtn19.setTooltip("Home");

  //Toggle Button 20
  var oToggleBtn20 = new ToggleButton("b20");
  oToggleBtn20.setText("Pressed & Disabled");
  oToggleBtn20.setIcon("sap-icon://action");
  oToggleBtn20.setPressed(true);
  oToggleBtn20.setIconFirst(true);
  oToggleBtn20.setEnabled(false);

  //Toggle Button 22
  var oToggleBtn22 = new ToggleButton("b22");
  oToggleBtn22.setText("Pressed & Disabled");
  oToggleBtn22.setPressed(true);
  oToggleBtn22.setEnabled(false);

  //Toggle Button 23
  var oToggleBtn23 = new ToggleButton("b23");
  oToggleBtn23.setText("Toggle Button");

  oApp = new App("myApp", {initialPage: oPage});

  oPage = new Page("myPage", {
	  title: "Mobile Toggle Button Control",
	  showHeader: true,
	  customHeader: new Bar({
		  contentLeft: [oToggleBtn5, oToggleBtn7],
		  contentMiddle: [new Label("myBarLabel", {text: "ToggleButton Testpage"})],
		  contentRight: [oToggleBtn6, oToggleBtn8],
	  }),
	  subHeader: new Bar({
		  contentMiddle: [oToggleBtn9, oToggleBtn10, oToggleBtn11, oToggleBtn12],
		  contentLeft: [oToggleBtn9, oToggleBtn11, oToggleBtn11a, oToggleBtn11b],
		  contentRight: [oToggleBtn22, oToggleBtn10, oToggleBtn12],
	  }),
	  footer: new Bar({
		  contentLeft: [oToggleBtn18, oToggleBtn23, oToggleBtn11c],
		  contentMiddle: [oToggleBtn13, oToggleBtn14, oToggleBtn17, oToggleBtn15, oToggleBtn16],
		  contentRight: [oToggleBtn19, oToggleBtn20],
	  }),
  });

  Element.getElementById("b1").attachPress(function(evt) {
	  oHelper.showStatus(evt);
  });

  Element.getElementById("b3").attachPress(function(evt) {
	  oHelper.showStatus(evt);
  });

  Element.getElementById("b21a").attachPress(function(evt) {
	  oHelper.showStatus(evt);
  });

  Element.getElementById("b11d").attachPress(function(evt) {
	  oHelper.showStatus(evt);
  });

  Element.getElementById("b11f").attachPress(function(evt) {
	  oHelper.showStatus(evt);
  });

  Element.getElementById("b11h").attachPress(function(evt) {
	  oHelper.showStatus(evt);
  });

  oPage.addContent(new HTML("myEmptyLine1", {content: "<br>"}));
  oPage.addContent(oToggleBtn1);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn2);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn3);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn4);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn21);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn21a);

  oPage.addContent(new HTML("myEmptyLine2", {content: "<br>"}));
  oPage.addContent(oToggleBtn11d);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn11e);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn11f);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn11g);
  oPage.addContent(new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}));
  oPage.addContent(oToggleBtn11h);

  oApp.addPage(oPage);

  oApp.placeAt("body");
});
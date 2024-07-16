sap.ui.define([
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/Button",
  "sap/m/library"
], function(HTML, IconPool, Button, mobileLibrary) {
  "use strict";

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  new HTML({content: "</br>Default type Buttons</br>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Default,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Default,
	  text: "Button Type Default"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "Button Type Default"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Default,
	  text: "Button Type Default",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "Button Type Default",
	  enabled: false
  }).placeAt("standAloneBtn");


  new HTML({content: "</br></br>Transparent type Buttons</br>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Transparent,
	  text: "Button Type Transparent"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "Button Type Transparent"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Transparent,
	  text: "Button Type Transparent",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "Button Type Transparent",
	  enabled: false
  }).placeAt("standAloneBtn");


  new HTML({content: "</br></br>Reject type Buttons</br>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Reject,
	  text: "Button Type Reject"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  text: "Button Type Reject"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Reject,
	  text: "Button Type Reject",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  text: "Button Type Reject",
	  enabled: false
  }).placeAt("standAloneBtn");


  new HTML({content: "</br></br>Accept type Buttons</br>"}).placeAt("standAloneBtn");

  ////////////////////////// Accept //////////////////////////////////
  var oButton19 = new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton20 = new Button({
	  type: ButtonType.Accept,
	  text: "Button Type Accept"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton21 = new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "Button Type Accept"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton22 = new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton23 = new Button({
	  type: ButtonType.Accept,
	  text: "Button Type Accept",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton24 = new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "Button Type Accept",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "</br></br>Attention type Buttons</br>"}).placeAt("standAloneBtn");

  ////////////////////////// Attention //////////////////////////////////
  var oButton19 = new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton20 = new Button({
	  type: ButtonType.Attention,
	  text: "Button Type Attention"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton21 = new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home",
	  text: "Button Type Attention"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton22 = new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton23 = new Button({
	  type: ButtonType.Attention,
	  text: "Button Type Attention",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton24 = new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home",
	  text: "Button Type Attention",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "</br></br><span id='buttons2'>Emphasized type Buttons</span></br></br>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Emphasized,
	  text: "Button Type Emphasized"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "Button Type Emphasized"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Emphasized,
	  text: "Button Type Emphasized",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "Button Type Emphasized",
	  enabled: false
  }).placeAt("standAloneBtn");


  new HTML({content: "</br></br>Back type Buttons</br>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back,
	  text: "Button Type Back"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "Button Type Back"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back,
	  text: "Button Type Back",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "Button Type Back",
	  enabled: false
  }).placeAt("standAloneBtn");


  new HTML({content: "</br></br>UP type Buttons</br>"}).placeAt("standAloneBtn");

  ////////////////////////// Up //////////////////////////////////
  var oButton37 = new Button({
	  type: ButtonType.Up
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  var oButton37 = new Button({
	  type: ButtonType.Up,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Up,
	  text: "Button Type Up"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "Button Type Up"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Up,
	  text: "Button Type Up",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "Button Type Up",
	  enabled: false
  }).placeAt("standAloneBtn");


  new HTML({content: "</br></br>Unstyled type Buttons</br></br>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Unstyled,
	  text: "Button Type Unstyled"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  text: "Button Type Unstyled"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Unstyled,
	  text: "Button Type Up",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  text: "Button Type Unstyled",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "</br></br><span id='buttons_rtl'>RTL specific buttons</span></br>"}).placeAt("RTLBtn");

  new Button({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "(Button Type Default)"
  }).placeAt("RTLBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("RTLBtn");

  new Button({
	  type: ButtonType.Default,
	  text: "(Button Type Default)"
  }).placeAt("RTLBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("RTLBtn");

  new Button({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "(עִבְרִית‬ עִבְרִית‬ עִבְרִית‬)"
  }).placeAt("RTLBtn");

  new HTML({content: "</br><span>Special Type Buttons</span></br>"}).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Critical
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Negative
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Success
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Default,
	  text: "(עִבְרִית‬ עִבְרִית‬ עִבְרִית‬)"
  }).placeAt("RTLBtn");

  new Button({
	  type: ButtonType.Neutral,
	  iconFirst: true
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Critical,
	  text: "Button Type Critical"
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Negative,
	  text: "Button Type Negative"
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Success,
	  text: "Button Type Success"
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Neutral,
	  text: "Button Type Neutral",
	  iconFirst: true
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Critical,
	  text: "Button Type Critical",
	  icon: "",
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Negative,
	  text: "Button Type Negative",
	  icon: ""
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Success,
	  text: "Button Type Success",
	  icon: ""
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Neutral,
	  text: "Button Type Neutral",
	  icon: "",
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Critical,
	  text: "Button Type Critical",
	  enabled: false
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Negative,
	  text: "Button Type Negative",
	  enabled: false
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Success,
	  text: "Button Type Success",
	  enabled: false
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Neutral,
	  text: "Button Type Neutral",
	  enabled: false
  }).placeAt("specialBtn");
});
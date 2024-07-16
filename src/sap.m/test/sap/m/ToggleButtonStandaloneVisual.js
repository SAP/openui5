sap.ui.define([
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/ToggleButton",
  "sap/m/library"
], function(HTML, IconPool, ToggleButton, mobileLibrary) {
  "use strict";

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  new HTML({content: "<span id='buttons3'>Default type ToggleButtons</span><br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  text: "ToggleButton Type Default",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Default",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  text: "ToggleButton Type Default",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Default",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Default",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Default",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<br/><br/>Transparent type ToggleButtons<br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  text: "ToggleButton Type Transparent",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Transparent",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  text: "ToggleButton Type Transparent",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Transparent",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Transparent",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Transparent",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<br/><br/>Reject type ToggleButtons<br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  text: "ToggleButton Type Reject",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Reject",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  text: "ToggleButton Type Reject",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Reject",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  text: "ToggleButton Type Reject",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  text: "ToggleButton Type Reject",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<br/><br/>Accept type ToggleButtons<br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  text: "ToggleButton Type Accept",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Accept",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  text: "ToggleButton Type Accept",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Accept",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Accept",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Accept",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "</br></br><span id='buttons4'>Emphasized type ToggleButtons</span><br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  text: "ToggleButton Type Emphasized",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Emphasized",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  text: "ToggleButton Type Emphasized",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Emphasized",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "ToggleButton Emphasized pressed",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "ToggleButton Emphasized pressed",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<br/><br/>Back type ToggleButtons<br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  text: "ToggleButton Type Back",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Back",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  text: "ToggleButton Type Back",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Back",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Back",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Back",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<br/><br/>UP type ToggleButtons<br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  text: "ToggleButton Type Up",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Up",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  text: "ToggleButton Type Up",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Up",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Up",
	  enabled: true,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Up",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<br/><br/>Unstyled type ToggleButtons<br/>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  text: "ToggleButton Type Unstyled",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Unstyled",
	  enabled: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  text: "ToggleButton Type Up",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Unstyled",
	  enabled: false
  }).placeAt("standAloneBtn");
});
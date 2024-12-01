sap.ui.define([
  "sap/base/i18n/Localization",
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/base/security/encodeXML",
  "sap/ui/core/Theming",
  "sap/m/Button",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/library",
  "sap/m/ToggleButton",
  "sap/m/Bar",
  "sap/m/OverflowToolbar",
  "sap/m/Toolbar",
  "sap/ui/model/json/JSONModel",
  "sap/m/VBox",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/Text",
  "sap/m/ColumnListItem",
  "sap/ui/thirdparty/jquery"
], function(
  Localization,
  HTML,
  IconPool,
  encodeXML,
  Theming,
  Button,
  Select,
  Item,
  mobileLibrary,
  ToggleButton,
  Bar,
  OverflowToolbar,
  Toolbar,
  JSONModel,
  VBox,
  Table,
  Column,
  Text,
  ColumnListItem,
  jQuery
) {
  "use strict";

  // shortcut for sap.m.ListSeparators
  const ListSeparators = mobileLibrary.ListSeparators;

  // shortcut for sap.m.BackgroundDesign
  const BackgroundDesign = mobileLibrary.BackgroundDesign;

  // shortcut for sap.m.ToolbarDesign
  const ToolbarDesign = mobileLibrary.ToolbarDesign;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  const encodeXML = sap.ui.require("sap/base/security/encodeXML");

  function toggleCompact() {
	  jQuery("body").toggleClass("sapUiSizeCompact");
  }

  function createSeparator(sText) {
	  return new HTML({content: "<div class='SectionSeparator'>" + encodeXML(sText) + "</div>"});
  }

  new HTML({id: "top", content: "<div>&nbsp;</div>"}).placeAt("controlArea");

  new Button("toggle_mode", {
	  text: "Toggle Compact Mode",
	  press: toggleCompact
  }).placeAt("controlArea");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("controlArea");

  new Select({
	  items: [
		  new Item({text: "Morning Horizon", key: "sap_horizon"}),
		  new Item({text: "Evening Horizon", key: "sap_horizon_dark"}),
		  new Item({text: "Horizon High Contrast Black", key: "sap_horizon_hcb"}),
		  new Item({text: "Horizon High Contrast White", key: "sap_horizon_hcw"}),
		  new Item({text: "Quartz Light", key: "sap_fiori_3"}),
		  new Item({text: "Quartz Dark", key: "sap_fiori_3_dark"}),
		  new Item({text: "Quartz High Contrast Black", key: "sap_fiori_3_hcb"}),
		  new Item({text: "Quartz High Contrast White", key: "sap_fiori_3_hcw"})
	  ],
	  change(e) {
		  const sTheme = e.getParameter("selectedItem").getKey();
		  Theming.setTheme(sTheme);
	  }
  }).placeAt("controlArea");
  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("controlArea");

  new Button("rtl_mode", {
	  text: "toggle RTL",
	  press: function(){
		  Localization.setRTL(!Localization.getRTL());
	  }
  }).placeAt("controlArea");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("controlArea");

  ////////////////////////// DEFAULT //////////////////////////////////
  createSeparator("Default type Buttons").placeAt("standAloneBtn");

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


  createSeparator("Transparent type Buttons").placeAt("standAloneBtn");

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


  createSeparator("Reject type Buttons").placeAt("standAloneBtn");

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


  createSeparator("Accept type Buttons").placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Accept,
	  text: "Button Type Accept"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "Button Type Accept"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Accept,
	  text: "Button Type Accept",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "Button Type Accept",
	  enabled: false
  }).placeAt("standAloneBtn");

  createSeparator("Attention type Buttons").placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Attention,
	  text: "Button Type Attention"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home",
	  text: "Button Type Attention"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Attention,
	  text: "Button Type Attention",
	  enabled: false
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new Button({
	  type: ButtonType.Attention,
	  icon: "sap-icon://home",
	  text: "Button Type Attention",
	  enabled: false
  }).placeAt("standAloneBtn");

  createSeparator("Emphasized type Buttons").placeAt("standAloneBtn");

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


  createSeparator("Back type Buttons").placeAt("standAloneBtn");

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


  createSeparator("UP type Buttons").placeAt("standAloneBtn");

  new Button({
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


  createSeparator("Unstyled type Buttons").placeAt("standAloneBtn");

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


  createSeparator("Default type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  text: "ToggleButton Type Default"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Default,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Default"
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

  createSeparator("Transparent type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  text: "ToggleButton Type Transparent"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Transparent,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Transparent"
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

  createSeparator("Reject type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  text: "ToggleButton Type Reject"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Reject"
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
	  pressed: true
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Reject,
	  text: "ToggleButton Type Reject",
	  enabled: false,
	  pressed: true
  }).placeAt("standAloneBtn");

  createSeparator("Accept type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  text: "ToggleButton Type Accept"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Accept,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Accept"
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

  createSeparator("Emphasized type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  text: "ToggleButton Type Emphasized"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Emphasized,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Emphasized"
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

  createSeparator("Back type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  text: "ToggleButton Type Back"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Back,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Back"
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

  createSeparator("UP type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  text: "ToggleButton Type Up"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Up,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Up"
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

  createSeparator("Unstyled type ToggleButtons").placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  text: "ToggleButton Type Unstyled"
  }).placeAt("standAloneBtn");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("standAloneBtn");

  new ToggleButton({
	  type: ButtonType.Unstyled,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Unstyled"
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

  createSeparator("Bar").placeAt("barBtn");

  new Bar({
	  contentLeft: [
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Def"
		  }),
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Def Dis",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "Btn Accept",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "Btn Accept"
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def"
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Accept",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Accept",
			  enabled: false,
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  new Bar({
	  contentLeft: [
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Button Trans"
		  }),
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Button Trans Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans"
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost"
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emph",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emph",
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  createSeparator("Transparent OverflowToolbar").placeAt("barBtn");

  new OverflowToolbar({
	  design: "Transparent",
	  content: [
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Trans"
		  }),
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Trans Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans"
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost"
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emph",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emph Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  new OverflowToolbar({
	  design: "Transparent",
	  content: [
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default"
		  }),
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans"
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject",
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Up,
			  icon: "sap-icon://home",
			  text: "Btn Up"
		  }),
		  new ToggleButton({
			  type: ButtonType.Up,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Up",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Back,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Back",
			  pressed: false
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  createSeparator("OverflowToolbar").placeAt("barBtn");

  new OverflowToolbar({
	  content: [
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Trans"
		  }),
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Trans Dis",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost"
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans"
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Trans Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emph",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emph Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  createSeparator("ToolBar").placeAt("barBtn");

  new Toolbar({
	  content: [
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default"
		  }),
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default Dis",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "Btn Accept"
		  }),
		  new Button({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "Btn Reject Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Default"
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject",
			  pressed: false
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  new Toolbar({
	  content: [
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Transparent"
		  }),
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Transparent",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost"
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent"
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emphasized",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emphasized",
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  createSeparator("Transparent ToolBar").placeAt("barBtn");

  new Toolbar({
	  design: ToolbarDesign.Transparent,
	  content: [
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default"
		  }),
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default Dis",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "Btn Accept"
		  }),
		  new Button({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "Btn Reject Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Default"
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject",
			  pressed: false
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  new Toolbar({
	  design: ToolbarDesign.Transparent,
	  content: [
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Transparent"
		  }),
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Transparent",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost"
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent"
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emphasized",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emphasized",
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  createSeparator("Solid ToolBar").placeAt("barBtn");

  new Toolbar({
	  design: ToolbarDesign.Solid,
	  content: [
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default"
		  }),
		  new Button({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "Btn Default Dis",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "Btn Accept"
		  }),
		  new Button({
			  type: ButtonType.Accept,
			  icon: "sap-icon://home",
			  text: "Btn Accept",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Default"
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Default,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Def Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject Dis",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Reject,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Reject",
			  pressed: false
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  new Toolbar({
	  design: ToolbarDesign.Solid,
	  content: [
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Transparent"
		  }),
		  new Button({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "Btn Transparent",
			  enabled: false
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost"
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent"
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Transparent,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Transparent",
			  enabled: false,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emphasized",
			  pressed: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Emphasized,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Emphasized",
			  pressed: true
		  }),
		  new Button({
			  type: ButtonType.Critical
		  }),
		  new Button({
			  type: ButtonType.Negative,
			  text: "Button Type Negative Disabled",
			  enabled: false
		  })
	  ]
  }).placeAt('barBtn');

  createSeparator("RTL specific buttons").placeAt("RTLBtn");

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

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("RTLBtn");

  new Button({
	  type: ButtonType.Default,
	  text: "(עִבְרִית‬ עִבְרִית‬ עִבְרִית‬)"
  }).placeAt("RTLBtn");

  createSeparator("Special Type Buttons").placeAt("specialBtn");

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
	  type: ButtonType.Neutral
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
	  text: "Button Type Neutral"
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Critical,
	  text: "Button Type Critical",
	  icon: ""
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
	  icon: ""
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Critical,
	  text: "Button Type Critical Disabled",
	  enabled: false
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Negative,
	  text: "Button Type Negative Disabled",
	  enabled: false
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Success,
	  text: "Button Type Success Disabled",
	  enabled: false
  }).placeAt("specialBtn");

  new Button({
	  type: ButtonType.Neutral,
	  text: "Button Type Neutral Disabled",
	  enabled: false
  }).placeAt("specialBtn");

  new ToggleButton({
	  type: ButtonType.Critical,
	  text: "Toggle Button Type Critical"
  }).placeAt("specialBtn");

  new ToggleButton({
	  type: ButtonType.Critical,
	  text: "Toggle Button TypeCritical Pressed",
	  pressed: true
  }).placeAt("specialBtn");

  // Buttons inside Table
  var data = [{
		  text: "Button"
  }];
  var oModel = new JSONModel();
  oModel.setProperty("/rows", data);

  var oVBox = new VBox();

  var oButtonsTable = new Table("ButtonsTable", {
	  backgroundDesign: BackgroundDesign.Transparent,
	  showSeparators: ListSeparators.All,
	  columns: [
		  new Column({
			  header: new Text({
				  text : "Button1"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Button2"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Button3"
			  })
		  }),
		  new Column("disableTypeColumn", {
			  header: new Text("xxx", {
				  text : "Button4"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Button5"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Button6"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Button7"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Toggle Button1"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Toggle Button2"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Toggle Button3"
			  })
		  })
	  ]
  });


  // Arrange the table columns according to the cells content width
  oButtonsTable.setFixedLayout(false);

  var oTableRowTemplate = new ColumnListItem({
	  type: "Active",
	  cells : [
		  new Button({
			  text : "Contract #D1234567890 Ñagçyfox",
			  icon: "sap-icon://alert",
			  type: ButtonType.Transparent
		  }), new Button({
			  text : "{text}",
			  type: ButtonType.Transparent
		  }), new Button({
			  icon: "sap-icon://pharmacy",
			  type: ButtonType.Transparent
		  }), new Button({
			  text : "John Doe Ñagçyfox",
			  type: ButtonType.Default
		  }), new Button({
			  text : "Some title",
			  icon: "sap-icon://pharmacy",
			  type: ButtonType.Reject
		  }), new Button({
			  icon: "sap-icon://alert",
			  type: ButtonType.Ghost
		  }), new Button({
			  icon: "sap-icon://pharmacy",
			  type: ButtonType.Emphasized
		  }), new ToggleButton({
			  icon: "sap-icon://pharmacy",
			  type: ButtonType.Transparent
		  }), new ToggleButton({
			  icon: "sap-icon://pharmacy",
			  text: "Toggle Button",
			  type: ButtonType.Default
		  }), new ToggleButton({
			  icon: "sap-icon://pharmacy",
			  text: "Toggle Button",
			  type: ButtonType.Accept
		  })
	  ]
  });

  oButtonsTable.bindAggregation("items", {
		  path : "/rows",
		  template: oTableRowTemplate
  });
  oButtonsTable.setModel(oModel);

  oVBox.addItem(oButtonsTable);
  oVBox.placeAt("TableBtn");
});
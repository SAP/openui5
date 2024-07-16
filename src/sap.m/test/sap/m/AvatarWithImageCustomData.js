sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/model/json/JSONModel",
  "sap/ui/thirdparty/jquery"
], async function(XMLView, JSONModel, jQuery) {
  "use strict";
  function toAbsolute(relativeUrl) {
	  return new URL(relativeUrl, document.baseURI).toString();
  }
  var oModel = new JSONModel({
	  srcWithModificationsRelative: "images/Woman_avatar_01.png",
	  srcWithModificationsAbsolute: toAbsolute("images/Woman_avatar_02.png"),
	  srcWithoutModifications: toAbsolute("images/Woman_04.png"),
  });

  (await XMLView.create({ definition: jQuery('#myView').html() })).setModel(oModel).placeAt("content");
});
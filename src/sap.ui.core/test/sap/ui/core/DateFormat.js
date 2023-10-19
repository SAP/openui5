sap.ui.define([
	"./DateFormat.controller",
	"./FormatHelper",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/XMLView"
], function(DateFormatController, FormatHelper, Messaging, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.DateFormat",
		controller: new DateFormatController()
	}).then(function(oView) {
		Messaging.registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});

});

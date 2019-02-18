sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var TimelineCardController = Controller.extend("sap.ui.integration.sample.TimelineCard.TimelineCard", {
		onInit: function () {
		}
	});

	return TimelineCardController;
});

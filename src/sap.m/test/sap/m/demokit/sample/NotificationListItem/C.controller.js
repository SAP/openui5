sap.ui.define([
		'jquery.sap.global',
		'sap/m/List',
		'sap/m/StandardListItem',
		'sap/ui/core/mvc/Controller',
		'sap/m/NotificationListItem'
	], function(jQuery, List, StandardListItem, Controller, NotificationListItem) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.NotificationListItem.C", {});

	return CController;

});

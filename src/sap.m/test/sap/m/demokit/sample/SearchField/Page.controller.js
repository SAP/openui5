sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function (Controller, JSONModel, MessageToast, Filter) {
	"use strict";

	return Controller.extend("sap.m.sample.SearchField.Page", {

		onSearch: function (event) {
			if (event.getParameter("searchButtonPressed")) {
				MessageToast.show("'search' event fired with 'searchButtonPressed' parameter");
			}
		}

	});
});
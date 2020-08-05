/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"

], function (Controller, UIComponent) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Books", {

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("bookdetails", {
				bookId: "add"
			});
		},

		onRowPress: function (oEvent) {
			var oContext = oEvent.getParameter("bindingContext") || oEvent.getSource().getBindingContext();

			UIComponent.getRouterFor(this).navTo("bookdetails", {
				bookId: oContext.getProperty("ID")
			});
		}
	});
});

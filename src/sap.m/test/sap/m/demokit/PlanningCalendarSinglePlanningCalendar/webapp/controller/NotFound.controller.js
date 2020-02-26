sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("teamCalendar.controller.NotFound", {

		/**
		 * Navigates to the Team Calendar when the link is pressed
		 * @public
		 */
		onLinkPressed : function () {
			this.getRouter().navTo("teamCalendar");
		},

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		}


	});

});
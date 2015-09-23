sap.ui.define([
	"myCompany/myApp/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("myCompany.myApp.controller.NotFound", {

		/**
		 * Navigates to the worklist when the link is pressed
		 * @public
		 */
		onLinkPressed: function() {
			this.getRouter().navTo("worklist");
		}

	});

});
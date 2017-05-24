sap.ui.define([
	"mycompany/myapp/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("mycompany.myapp.controller.NotFound", {

		/**
		 * Navigates to the worklist when the link is pressed
		 * @public
		 */
		onLinkPressed: function() {
			this.getRouter().navTo("worklist");
		}

	});

});
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.mdskeleton.view.BaseController", {

		/**
		 * Convenience method for accessing the event bus in every controller of the application
		 * @public
		 * @returns {sap.ui.core.EventBus} the event bus for this component
		 */
		getEventBus : function () {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Convenience method for accessing the router in every controller of the application
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});

}, /* bExport= */ true);
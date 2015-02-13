sap.ui.define([
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.mdtemplate.controller.BaseController", {

		/**
		 * Convenience method for accessing the event bus in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.EventBus} the event bus for this component
		 */
		getEventBus : function () {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getModel : function (sName) {
			return this.getView().getModel(sName);
		},
		
		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		/**
		 * Invoked when the selected line item (e.g. wrong parameter in URL) is not found in the model.
		 * Navigation to the corresponding view is triggered.
		 * 
		 * Will be removed, once router targets are available
		 * 
		 * @function
		 */
		showEmptyView : function () {
			this.getRouter().myNavToWithoutHash({ 
				currentView : this.getView(),
				targetViewName : "sap.ui.demo.mdtemplate.view.NotFound",
				targetViewType : "XML"
			});
		}

	});

}, /* bExport= */ true);
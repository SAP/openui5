sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/core/UIComponent'],
	function(Controller, UIComponent) {
	"use strict";

	var View2Controller = Controller.extend("NavigationWithoutMasterDetailPattern.view.View2", {

		oApplication : null,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.Detail
		 */
		onInit: function() {

			this.getRouter().attachRouteMatched(function(oEvent) {
				if (oEvent.getParameter("name") === "view2") {
					var text = this.byId("text"),
					queryAsString = "",
					oArguments = oEvent.getParameter("arguments"),
					query = oArguments.query;

					if (query) {
						queryAsString += ". Retrieved additional query data:";
						for ( var key in query) {
							if (query.hasOwnProperty(key)) {
								queryAsString += " " + key + " = " + query[key];
							}
						}
					}

					text.setText("view2 coming from " + oArguments.from + queryAsString);
				}
			}, this);
		},

		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf view.Detail
		 */
		//	onBeforeRendering: function() {
		//
		//	},


		handleBtn1Press : function() {
			this.getRouter().navTo("view1", { from : "View 2"});
		},

		handleBtn2Press : function() {
			this.getRouter().navTo("detail", { from : "View 2"});
		}

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf view.Detail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf view.Detail
		 */
		//	onExit: function() {
		//
		//	}

	});

	return View2Controller;

});

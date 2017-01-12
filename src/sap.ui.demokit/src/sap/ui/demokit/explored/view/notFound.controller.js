/*!
 * ${copyright}
 */

sap.ui.controller("sap.ui.demokit.explored.view.notFound", {

	onInit : function () {
		this.router = sap.ui.core.UIComponent.getRouterFor(this);
		this.router.attachRoutePatternMatched(this.onRouteMatched, this);
		this.getView().addEventDelegate(this);
		jQuery.sap.require("sap.ui.model.json.JSONModel");
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			entityName: ""
		}));
	},

	onRouteMatched : function (evt) {
		if (evt.getParameter("name") !== "notFound") {
			return;
		}
		var params = evt.getParameter("arguments")["all*"];
		this.getView().getModel().setProperty("/entityName", params);
	},

	onBeforeShow : function (evt) {
		if (evt.data.path) {
			this.getView().getModel().setProperty("/entityName", evt.data.path);
		}
	},

	onNavBack : function () {
		this.router.myNavBack("home", {});
	}

});

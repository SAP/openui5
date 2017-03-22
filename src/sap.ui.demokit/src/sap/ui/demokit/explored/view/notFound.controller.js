/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"], function (Controller, UIComponent, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demokit.explored.view.notFound", {

		onInit : function () {
			this.router = UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this.getView().addEventDelegate(this);
			this.getView().setModel(new JSONModel({
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
});

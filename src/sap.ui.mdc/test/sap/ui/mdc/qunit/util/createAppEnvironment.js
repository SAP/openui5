/* global */
sap.ui.define([
	"sap/m/App", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/core/mvc/View"
], function (App, UIComponent, ComponentContainer, View) {
	"use strict";

	const fnCreateEnvironment = function(sView, sModule) {

		let oCreatedView;

		//Create a custom component
		const UIComp = UIComponent.extend("test", {
			createContent: function() {
				const oApp = new App(oCreatedView.createId("mdcFlexTest"));
				oApp.addPage(oCreatedView);
				return oApp;
			}
		});

		//1) Asynchronously a XML view
		return View.create({
			type: "XML",
			id: "my" + sModule + "View",
			definition: sView
		})
		//2) Create the Component
		.then(function(oView){
			oCreatedView = oView;
			const oComp = new UIComp();

			return oComp;
		})
		//3) Create the container and return results
		.then(function(oComp){

			// Place component in container and display
			const oUiComponentContainer = new ComponentContainer({
				component: oComp,
				async: false
			});

			return {
				view: oComp.getRootControl().getCurrentPage(),
				app: oComp.getRootControl(),
				container: oUiComponentContainer,
				comp: oComp
			};

		});
	};

	return fnCreateEnvironment;

});
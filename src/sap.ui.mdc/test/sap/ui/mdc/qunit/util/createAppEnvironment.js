/* global */
sap.ui.define([
	"sap/m/App", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/core/mvc/View"
], function (App, UIComponent, ComponentContainer, View) {
	"use strict";

    //Load FL lib (as this might be required for fl related tests)
	sap.ui.getCore().loadLibrary("sap.ui.fl");

	var fnCreateEnvironment = function(sView, sModule) {

		var oCreatedView;

        //Create a custom component
		var UIComp = UIComponent.extend("test", {
			createContent: function() {
				var oApp = new App(oCreatedView.createId("mdcFlexTest"));
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
			var oComp = new UIComp();

			return oComp;
        })
        //3) Create the container and return results
		.then(function(oComp){

			// Place component in container and display
			var oUiComponentContainer = new ComponentContainer({
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
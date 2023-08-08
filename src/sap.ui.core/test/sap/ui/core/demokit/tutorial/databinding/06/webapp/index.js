sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/resource/ResourceModel"
], function (Core, JSONModel, XMLView, ResourceModel) {
	"use strict";

	// Chain an anonymous function to the SAPUI5 'ready' Promise
	Core.ready().then(function () {
		// Create a JSON model from an object literal
		var oModel = new JSONModel({
			firstName: "Harry",
			lastName: "Hawk",
			enabled: true
		});

		// Assign the model object to the SAPUI5 core
		sap.ui.getCore().setModel(oModel);

		// Create a resource bundle for language specific texts
		// configured supportedLocales represent the i18n files present:
		// * "" - i18n/i18n.properties
		// configured fallbackLocale should represent one of these files
		// * "" - according to the fallback chain the root bundle is the last fallback.
		//   Configuring it explicitly avoids side effects when additional resource files are added.
		// @see https://sdk.openui5.org/topic/ec753bc539d748f689e3ac814e129563
		var oResourceModel = new ResourceModel({
			bundleName: "sap.ui.demo.db.i18n.i18n",
			fallbackLocale: "",
			supportedLocales: [""]
		});

		// Assign the model object to the SAPUI5 core using the name "i18n"
		sap.ui.getCore().setModel(oResourceModel, "i18n");

		// Display the XML view called "App"
		new XMLView({
			viewName: "sap.ui.demo.db.view.App"
		}).placeAt("content");
	});
});
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/App"
], (View, App) => {
	"use strict";

	return View.extend("sap.ui.core.sample.View.navigationTypedView.view.RootView", {
		getAutoPrefixId() {
			return true; // Prefix ID of content controls with the ID of this view ("rootView").
		},

		createContent() {
			this.setHeight("100%");
			this.setDisplayBlock(true);
			// Define the view UI by returning a control, an array of controls, or a Promise of control(s).
			return new App({
				id: "app" // Resulting ID suffix: rootView--app
			});
		}

    });
});

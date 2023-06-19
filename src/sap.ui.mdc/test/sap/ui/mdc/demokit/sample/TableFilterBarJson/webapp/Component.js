sap.ui.define([
		"sap/ui/core/UIComponent",
		// TODO Figure out,why the library needs to be loaded explicitly
		"sap/ui/mdc/library"
	],
	function (UIComponent, mdcLibrary) {
		"use strict";

		return UIComponent.extend("sap.ui.mdc.demokit.sample.TableFilterBarJson.webapp.Component", {
			metadata: {
				manifest: "json"
			},

			init: function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// enable routing
				this.getRouter().initialize();
			}
		});
	}
);
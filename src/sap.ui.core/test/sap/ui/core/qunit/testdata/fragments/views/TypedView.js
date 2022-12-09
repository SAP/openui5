 sap.ui.define([
  "sap/ui/core/mvc/View",
  "sap/ui/core/Fragment",
  "sap/m/Panel"
], function(View, Fragment, Panel) {
	"use strict";

	return View.extend("my.TypedView", {
		// define, which controller to use
		getControllerName: function() {
			return "my.TypedViewController";
		},
		// create view content and return the root control(s)
		createContent: function() {
			var oController = this.getController();
			var oPanel = new Panel(this.createId("myPanel"));

			var aContentPromises = [];

			aContentPromises.push(Fragment.load({
				fragmentName: "my.JSFragment",
				type: "JS",
				controller: oController
			}));

			aContentPromises.push(Fragment.load({
				definition: '<Button xmlns="sap.m" id="xmlfragbtn" text="This is an XML Fragment" press="doSomething"></Button>',
				type: "XML",
				controller: oController
			}));

			return Promise.all(aContentPromises).then(function(aContent) {
				aContent.forEach(function(o) {
					oPanel.addContent(o);
				});
				return [oPanel];
			});
		}
	});
});

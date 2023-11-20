sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		assertions: new Opa5({
			iRestoreBodyStyles: function () {
				var oBody = document.body;
				oBody.style.width = "";
				oBody.style.left = "";
				oBody.style.position = "";
				oBody.classList.remove("sapUiOpaBodyComponent");

				return this;
			}
		}),
		viewNamespace: "sap.ui.demo.toolpageapp.view.",
		autoWait: true
	});
});

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Fragment',
	"sap/base/util/UriParameters"
], function(Controller, Fragment, UriParameters) {
	"use strict";
	return Controller.extend("view.Main", {

		onInit: function () {
			var oParams = UriParameters.fromQuery(location.search);
			var sSubView = oParams.get("view") || "Explicit";

			var mViews = {
				Explicit: "AppUnderTestTable.view.Explicit",
				Implicit: "AppUnderTestTable.view.Implicit",
				Transient: "AppUnderTestTable.view.Transient",
				AutoImplicit: "AppUnderTestTable.view.AutoImplicit"
			};

			this.setFragment(mViews[sSubView]);
		},

		setFragment: function (sFragment) {
			var oPage = this.getView().byId('FlexTestPage');
			Fragment.load({
				name: sFragment,
				controller: this
			}).then(function name(oFragment) {
				oPage.addContent(oFragment);
			});
		},

		onPressRTA: function() {
			var oOwnerComponent = this.getOwnerComponent();
			sap.ui.getCore().loadLibrary("sap/ui/rta", { async: true }).then(function () {
				sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
					startKeyUserAdaptation({
						rootControl: oOwnerComponent.getAggregation("rootControl")
					});
				});
			});
		}

	});
});

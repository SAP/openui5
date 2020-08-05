sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/rta/api/startKeyUserAdaptation"
], function(
	Controller,
	RuntimeAuthoring,
	Utils,
	LayerUtils,
	ControlPersonalizationAPI,
	startKeyUserAdaptation
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.embeddedComponent.controller.Main", {
		_data: [],

		onInit: function () {
			this.iCounter = 0;
			var oView = this.getView();
			this._data.push(
				new Promise(function (resolve) {
					oView.bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType01Nav"
						}
					});
				}),

				new Promise(function (resolve) {
					oView.byId("page").bindElement({
						path: "/EntityTypes2(EntityType02_Property01='EntityType02Property01Value')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType02Nav"
						}
					});
				})
			);
		},

		switchToAdaptionMode: function () {
			startKeyUserAdaptation({rootControl: this.getOwnerComponent()});
		},

		isDataReady: function () {
			return Promise.all(this._data);
		}
	});
});

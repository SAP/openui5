sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Lib'
], function(
	Controller,
	Library
) {
	"use strict";

	return Controller.extend("view.Main", {
		onPressRTA: function() {
			const oOwnerComponent = this.getOwnerComponent();
			Library.load({name: "sap/ui/rta"}).then(function () {
				sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
					startKeyUserAdaptation({
						rootControl: oOwnerComponent.getAggregation("rootControl")
					});
				});
			});
		}
	});
});

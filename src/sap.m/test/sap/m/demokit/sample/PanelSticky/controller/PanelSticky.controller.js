sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.Panel.controller.PanelSticky", {
		onOverflowToolbarPress : function () {
			var oPanel = this.byId("expandablePanel");
			oPanel.setExpanded(!oPanel.getExpanded());
		}
	});
});
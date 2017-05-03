sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.SideNavigation.V", {

		onCollapseExpandPress: function () {
			var oSideNavigation = this.getView().byId('sideNavigation');
			var bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		}
	});

});

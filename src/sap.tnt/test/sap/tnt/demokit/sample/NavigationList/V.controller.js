sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller'
], function(jQuery, Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.NavigationList.V", {

		onInit: function () {

		},

		onCollapseExpandPress: function () {
			var oNavigationList = this.byId('navigationList');
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},

		onHideShowSubItemPress: function () {
			var navListItem = this.byId('subItemThree');

			navListItem.setVisible(!navListItem.getVisible());
		}
	});

});

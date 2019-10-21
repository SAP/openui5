sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolHeaderIconTabHeader.C", {

		onHomePress: function () {
			var oIconTabHeader = this.byId('iconTabHeader');
			oIconTabHeader.setSelectedKey('invalidKey');

			var oLabel = this.byId('labelId');
			oLabel.setText('Home Screen');
		},

		onSelectTab: function (event) {
			var oLabel = this.byId('labelId');
			var oTab = event.getParameter('item');

			oLabel.setText(oTab.getText());
		}

	});
});
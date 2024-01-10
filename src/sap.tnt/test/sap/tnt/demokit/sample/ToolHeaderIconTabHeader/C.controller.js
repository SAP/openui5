sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolHeaderIconTabHeader.C", {

		onHomePress: function (event) {
			var id = event.oSource.getParent().getDomRef().getElementsByClassName("sapMITH")[0].id,
				oIconTabHeader = this.byId(id);

			oIconTabHeader.setSelectedKey('invalidKey');
		}

	});
});
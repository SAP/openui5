/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Sorter'
	], function(Controller, Sorter) {
	"use strict";

	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main", {

		onSort : function (oEvent) {
			var oBinding = this.byId('entitySets').getBinding('items');

			oBinding.sort(new Sorter("@sapui.name", oEvent.getSource().getPressed()));
		}

	});

	return MainController;
});

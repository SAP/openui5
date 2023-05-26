// define a root UIComponent which exposes the main view

sap.ui.define([
	"../component/BaseComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/enums/TableGrowingMode"
], function(BaseComponent, JSONModel, GrowingMode) {
	"use strict";

	return BaseComponent.extend("sap.ui.mdc.sample.ResponsiveTable.Component", {

		init : function(){
			// call the init function of the parent
			BaseComponent.prototype.init.apply(this, arguments);

			var aGrowingModes = [];
			for (var p in GrowingMode) {
				aGrowingModes.push({key: p, text: GrowingMode[p]});
			}

			this.setModel(new JSONModel(
				{
					"growingmodes": aGrowingModes
				}
			), "tabletypesettings");
		}
	});

});

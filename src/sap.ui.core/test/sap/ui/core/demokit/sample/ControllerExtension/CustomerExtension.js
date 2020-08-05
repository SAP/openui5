sap.ui.define([
	"sap/ui/core/mvc/ControllerExtension",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
	], function(
		ControllerExtension,
		OverrideExecution,
		Sorter,
		Filter
	) {
	"use strict";
	return ControllerExtension.extend("sap.my.FirstExtension", {
		metadata: {
			methods: {
				"getMinimumSalaryForFilter": {"public": true, "final": false}
			}
		},
		//Controller extension namespacing prevents name clashes with existing onPress functions
		onPress: function(oEvent) {
			//Calling public methods from control
			var oTable = this.base.getTable();
			var oTableBinding = oTable.getBinding("items");
			var oSorter = new Sorter("Name", this.bSortDescending);
			oTableBinding.sort(oSorter);
			this.bSortDescending = this.bSortDescending ? false : true;

			var oMyOwnButtonFromExtension = this.byId("ByName");
			var sText = this.bSortDescending ? "Sort By Name (Descending)" : "Sort By Name";
			oMyOwnButtonFromExtension.setText(sText);
		},

		getMinimumSalaryForFilter: function(){
			return 10000;
		},

		override: {
			//Override controller method
			getToolbarTitle: function(){
				return "FirstExtension Table Operations:";
			},

			"reuse": {
				onFilterHook: function(aFilters) {
					aFilters.push(new Filter({
						path: "Salary",
						operator: "GT",
						value1: this.getMinimumSalaryForFilter()
					}));
				}
			}
		}
	});
});
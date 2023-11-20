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
	return ControllerExtension.extend("sap.other.OtherExtension", {
		metadata: {
			methods: {
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

			/*
			 * Accessing controls from the fragment within the same namespace;
			 * real control ID is prefixed with the extension namespace
			 * to prevent name clashes, you only get controls inside the same
			 * extension namespace via this.byId()
			 */
			var oMyOwnButtonFromExtension = this.byId("ByName");

			var sText = this.bSortDescending ? "Sort By Name (Descending) again" : "Sort By Name again";
			oMyOwnButtonFromExtension.setText(sText);
		},

		overrides: {
			//Override controller method; this is the second extension, so this override will win
			getToolbarTitle: function(){
				return "OtherExtension Table Operations:";
			},

			//Override other extensions method by the namespaced extension name
			extension: {
				"sap.my.FirstExtension" : {
					getMinimumSalaryForFilter: function(){
						return 90000;
					}
				}
			}
		}
	});
});
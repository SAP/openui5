sap.ui.define([
	"sap/ui/core/mvc/ControllerExtension",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter"
	], function(
		ControllerExtension,
		OverrideExecution,
		Filter,
		Sorter
	) {
	"use strict";
	return ControllerExtension.extend("sap.my.ReuseExtension", {
		metadata: {
			methods: {
				"onPress": {"public": true, "final": false},
				/* By defining the overrideExecution in the methods metadata the method becomes a hook,
				 * where each override is called after the other. With OverrideExecution.Before you can
				 * have the overrides be called before each other.
				 */
				"onFilterHook": {"public": true, "final": false, overrideExecution: OverrideExecution.After}
			}
		},

		onPress: function(oEvent) {
			//Calling public methods from control
			var oTable = this.base.getTable();
			var oTableBinding = oTable.getBinding("items");
			var oSorter = new Sorter("Salary", this.bSortDescending);
			oTableBinding.sort(oSorter);
			this.bSortDescending = this.bSortDescending ? false : true;
		},

		/**
		 * @abstract
		 */
		onFilterHook: function(aFilter) {
		}
	});
});
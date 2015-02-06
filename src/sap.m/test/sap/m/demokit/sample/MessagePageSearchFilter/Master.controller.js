sap.ui.controller("sap.m.sample.MessagePageSearchFilter.Master", {

	onInit: function () {
		var that = this,
			oList = this.byId("list");

		oList.onAfterRendering = function () {
			if (this.getVisibleItems().length) {
 				that.oSplitApp.toDetail("Empty")
			}
		};
	},

	handleListItemPress : function (evt) {
		var oContext = evt.getSource().getBindingContext(),
			oSplitApp = this.oSplitApp;

		oSplitApp.getPage("Detail", false).setBindingContext(oContext);
		oSplitApp.toDetail("Detail", "slide");
	},

	handleSearch : function (evt) {
		// create model filter
		var aFilters = [],
			sQuery = evt.getParameter("query");

		if (sQuery && sQuery.length > 0) {
			var oFilter = new sap.ui.model.Filter("SoId", sap.ui.model.FilterOperator.Contains, sQuery);
			aFilters.push(oFilter );
		}
		var oBinding = this.getView().byId('list').getBinding("items");

		// update list binding
		oBinding.filter(aFilters);

		// there is no items to display after filter the message page is shown
		if (!oBinding.getLength()) {
			this.oSplitApp.toDetail("MessagePageSearchNoItems");
		}
	},

	handleFilter : function (evt) {
		var oItem = evt.getParameter("selectedItem"),
			sKey = (oItem) ? oItem.getKey() : null,
			aFilters = [], 	oFilter;

		if (sKey === "None") {
			console.log("none");
		} else if (sKey === "InProgress") {
			oFilter = new sap.ui.model.Filter("LifecycleStatus", sap.ui.model.FilterOperator.EQ, "P");
			aFilters.push(oFilter);
		} else if (sKey === "NoItems") {
			oFilter = new sap.ui.model.Filter("LifecycleStatus", sap.ui.model.FilterOperator.EQ, "Invalid");
			aFilters.push(oFilter);
		}

		var oBinding = this.getView().byId('list').getBinding("items");

		// update list binding
		oBinding.filter(aFilters);

		// there is no items to display after filter the message page is shown
		if (!oBinding.getLength()) {
			this.oSplitApp.toDetail("MessagePageFilterNoItems");
		}
	}
});

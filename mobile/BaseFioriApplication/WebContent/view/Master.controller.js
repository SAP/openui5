sap.ui.core.mvc.Controller.extend("my.demo.basefioriapp.view.Master", {
	
	onInit: function() {
//		var view = this.getView();
//
//		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) {
//			if (oEvent.getParameter("name") === "Detail" && !(oEvent.getParameter("arguments").from === "master")) { // initial call via bookmark
//				// select the listItem referenced in the bookmark
//				var oList = view.byId("list"),
//					aItems = oList.getItems();
//				for (var i = 0; i < aItems.length; i++) { // TODO: is there a more efficient way??
//					if (aItems[i].getBindingContext().getPath() === "/" + oEvent.getParameter("arguments").contextPath) {
//						oList.setSelectedItem(aItems[i], true);
//						break;
//					}
//				}
//			}
//		}, this);
	},
	
	handleSearch: function() {
		// add filter for search
		var filters = [];
		var searchString = this.getView().byId("searchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [ new sap.ui.model.Filter("SalesOrderNumber", sap.ui.model.FilterOperator.Contains, searchString) ];
			// FIXME: currently seaarches for SalesOrderNumber because CustomerName search is broken in the backend
		}
		
		// update list binding
		var list = this.getView().byId("list");
		var binding = list.getBinding("items");
		binding.filter(filters);
	},
	
	handleSelect: function(oEvent) {
		var oListItem = oEvent.getParameter("listItem"); // find out which ListItem was selected
		
		// trigger routing to BindingPath of this ListItem - this will update the data on the detail page
		sap.ui.core.UIComponent.getRouterFor(this).navTo("Detail",{from: "master", contextPath: oListItem.getBindingContext().getPath().substr(1)});
	}
});	
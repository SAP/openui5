sap.ui.core.mvc.Controller.extend("BaseFioriApplication.view.Detail", {

	onInit: function() {
		var view = this.getView();

		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) {
			// when detail navigation occurs, update the binding context
			if (oEvent.getParameter("name") === "Detail") {
				var context = new sap.ui.model.Context(view.getModel(), '/' + oEvent.getParameter("arguments").contextPath);
				view.setBindingContext(context);
				// Make sure the master is here
			}
		}, this);
	},
	
	_openActionSheet: function() {

		if (!this._oActionSheet) {
			this._oActionSheet = new sap.m.ActionSheet({
				buttons: new sap.ushell.ui.footerbar.AddBookmarkButton()
			});
			this._oActionSheet.setShowCancelButton(true);
			this._oActionSheet.setPlacement(sap.m.PlacementType.Top);
		}
		
		this._oActionSheet.openBy(this.getView().byId("actionButton"));
	}
});

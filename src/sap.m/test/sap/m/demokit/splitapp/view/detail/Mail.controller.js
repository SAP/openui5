sap.ui.controller("view.detail.Mail", {

	onInit: function(){
		this.router = sap.ui.core.UIComponent.getRouterFor(this);
		this.router.attachRoutePatternMatched(this._handleRouteMatched, this);
	},	

	_handleRouteMatched : function (evt) {
		var param = evt.getParameter("name"),
			sViewId = evt.getParameter("arguments").viewId;
		
		if ("mail" !== param) {
			return;
		}

		this.getView().bindElement("/items/" + sViewId);
	},

	onBackButtonPress: function(oEvent) {
		this.router.myNavBack("inbox", {});
	}
});
sap.ui.controller("view.Main", {

	_toPage : function (sId) {
		var oView = this.getView();
		oView.byId("app").to(oView.byId(sId));
	},

	onNavToOverview : function () {
		this._toPage("overview");
	},

	onNavToPage1 : function () {
		this._toPage("page1");
	},

	onNavToPage2 : function () {
		this._toPage("page2");
	}

});

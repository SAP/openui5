sap.ui.controller("sap.ui.demo.poa.view.NotFound", {

	/**
	 * Called by the UI5 runtime to init this controller
	 */
	onInit : function () {
		this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		this._oRouter.attachRouteMatched(this._handleRouteMatched, this);
		this.getView().addEventDelegate(this);
	},

	_sMsgtext : "The requested page '{0}' is unknown to the app.",

	_handleRouteMatched : function (evt) {
		if (evt.getParameter("name") !== "notFound") {
			return;
		}
		var params = evt.getParameter("arguments")["all*"];
		var html = this._sMsgtext.replace("{0}", params);
		this.getView().byId("msgNotFound").setText(html);
	},

	onBeforeShow : function (evt) {
		if (evt.data.path) {
			var html = this._sMsgtext.replace("{0}", evt.data.path);
			this.getView().byId("msgNotFound").setText(html);
		}
	},

	handleNavBack : function () {
		var oHistory = sap.ui.core.routing.History.getInstance();
		if (oHistory.getPreviousHash()) {
			window.history.go(-1);
		} else {
			this._oRouter.myNavBack("master", {});
		}
	}
});
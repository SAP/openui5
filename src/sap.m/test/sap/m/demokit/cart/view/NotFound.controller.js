sap.ui.controller("view.NotFound", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.attachRoutePatternMatched(this._handleRouteMatched, this);
		this.getView().addEventDelegate(this);
	},

	_msg : "<div class='titlesNotFound'>The requested product '{0}' is unknown to the shopping cart app.</div>",
	
	_handleRouteMatched : function (oEvent) {
		if ("notFound" !== oEvent.getParameter("name")) {
			return;
		}
		var oParams = oEvent.getParameter("arguments")["all*"];
		var html = this._msg.replace("{0}", oParams);
		this.getView().byId("msgHtml").setContent(html);
	},
	
	onBeforeShow : function (oEvent) {
		if (oEvent.data.path) {
			var html = this._msg.replace("{0}", oEvent.data.path);
			this.getView().byId("msgHtml").setContent(html);
		}
	},
	
	handleNavBack : function () {
		this._router._myNavBack();
	}
});
sap.ui.controller("sap.ui.demo.cart.controller.NotFound", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getTargets().getTarget("notFound").attachDisplay(this._onDisplay, this);
	},

	_msg : "<div class='titlesNotFound'>The requested product '{0}' is unknown to the shopping cart app.</div>",

	_onDisplay : function (oEvent) {
		var oData = oEvent.getParameter("data");
		var html = this._msg.replace("{0}", oData.hash);
		this.getView().byId("msgHtml").setContent(html);
	},

	onNavBack : function () {
		this._router._myNavBack();
	}
});
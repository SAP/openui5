jQuery.sap.require("sap.m.MessageToast");

sap.ui.controller("sap.ui.demo.poa.view.LineItem", {

	/**
	 * Called by the UI5 runtime to init this controller
	 */
	onInit : function () {

		this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		this._oRouter.attachRouteMatched(this._handleRouteMatched, this);
	},

	_handleRouteMatched : function (evt) {
		if (evt.getParameter("name") !== "lineItem") {
			return;
		}
		this._detailId = evt.getParameter("arguments").detailId;
		var oModel = this.getView().getModel();
		var sPath = sap.ui.demo.poa.util.objectSearch.getPath(oModel.getData(), "ID", this._detailId);
		// check if the selected page exists
		if (!sPath) {
			this._oRouter.myNavToWithoutHash("sap.ui.demo.poa.view.NotFound", "XML", false, { path: this._detailId });
			return;
		}
		this._lineItemId = evt.getParameter("arguments").lineItemId;
		sPath = sPath + "PurchaseOrder_Items/" + this._lineItemId;
		var oContext = new sap.ui.model.Context(oModel, sPath);
		this.getView().setBindingContext(oContext);
	},

	/**
	 * Called before the page (= this view) is shown in the app
	 */
	onBeforeShow : function (evt) {
		if (evt.data && evt.data.context) {
			this.getView().setBindingContext(evt.data.context);
		}
	},

	/**
	 * Refreshes the model
	 */
	_refresh : function (channelId, eventId, data) {
		if (data && data.context) {
			// set context of selected master object
			this.getView().setBindingContext(data.context);
			// scroll to top of page
			this.getView().byId("page").scrollTo(0);
		}
	},

	handleNavBack : function (evt) { 
		this._oRouter.myNavBack("detail", {detailId: this._detailId});
	}
});
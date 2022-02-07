sap.ui.define([
	'./BaseController',
	'../model/formatter'
], function (
	BaseController,
	formatter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Comparison", {
		formatter: formatter,
		onInit: function () {
			this._oRouter = this.getRouter();
			this._oRouter.getRoute("comparison").attachPatternMatched(this._onRoutePatternMatched, this);
			this._oRouter.getRoute("comparisonCart").attachPatternMatched(this._onRoutePatternMatched, this);
		},

		_onRoutePatternMatched: function (oEvent) {
			var oContainer = this.byId("comparisonContainer");
			var oParameters = oEvent.getParameter("arguments");
			var oPlaceholder = this.byId("placeholder");

			// save category and current products
			this.getModel("comparison").setProperty("/category", oParameters.id);
			this.getModel("comparison").setProperty("/item1", oParameters.item1Id);
			this.getModel("comparison").setProperty("/item2", oParameters.item2Id);

			// update the comparison panels
			oPlaceholder.setVisible(false);
			updatePanel(0, oParameters.item1Id);
			updatePanel(1, oParameters.item2Id);

			// helper function to update the panel binding
			function updatePanel (iWhich, sId) {
				var oPanel = oContainer.getItems()[iWhich];
				if (sId){
					var sPath = "/Products('" + sId + "')";
					oPanel.bindElement({
						path: sPath
					});
					oPanel.setVisible(true);
				} else {
					oPanel.unbindElement();
					oPanel.setVisible(false);
					oPlaceholder.setVisible(true);
				}
			}
		},

		onRemoveComparison: function (oEvent){
			var oBinding = oEvent.getSource().getBindingContext();
			var sItem1Id = this.getModel("comparison").getProperty("/item1");
			var bRemoveFirst = sItem1Id === oBinding.getObject().ProductId;
			var sRemainingItemId = this.getModel("comparison").getProperty("/item" + (bRemoveFirst ? 2 : 1));
			var sCategory = this.getModel("comparison").getProperty("/category");

			// navigate to comparison view without the removed product
			this.getRouter().navTo("comparison", {
				id : sCategory,
				item1Id : sRemainingItemId
			}, true);
		},

		/**
		 * Navigate to the generic cart view
		 * @param {sap.ui.base.Event} oEvent the button press event
		 */
		onToggleCart: function (oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			var sItem1Id = this.getView().getModel("comparison").getProperty("/item1");
			var sItem2Id = this.getView().getModel("comparison").getProperty("/item2");
			var sCategory = this.getView().getModel("comparison").getProperty("/category");

			this._setLayout(bPressed ? "Three" : "Two");
			this.getRouter().navTo(bPressed ? "comparisonCart" : "comparison", {
				id: sCategory,
				item1Id: sItem1Id,
				item2Id: sItem2Id
			});
		}
	});
});

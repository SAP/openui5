sap.ui.define([
	'./BaseController',
	'../model/formatter'
], (BaseController, formatter) => {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Comparison", {
		formatter,

		onInit() {
			this._oRouter = this.getRouter();
			this._oRouter.getRoute("comparison").attachPatternMatched(this._onRoutePatternMatched, this);
			this._oRouter.getRoute("comparisonCart").attachPatternMatched(this._onRoutePatternMatched, this);
		},

		_onRoutePatternMatched(oEvent) {
			const oContainer = this.byId("comparisonContainer");
			const oParameters = oEvent.getParameter("arguments");
			const oPlaceholder = this.byId("placeholder");

			// save category and current products
			this.getModel("comparison").setProperty("/category", oParameters.id);
			this.getModel("comparison").setProperty("/item1", oParameters.item1Id);
			this.getModel("comparison").setProperty("/item2", oParameters.item2Id);

			// update the comparison panels
			oPlaceholder.setVisible(false);
			updatePanel(0, oParameters.item1Id);
			updatePanel(1, oParameters.item2Id);

			// helper function to update the panel binding
			function updatePanel(iWhich, sId) {
				const oPanel = oContainer.getItems()[iWhich];
				if (sId){
					const sPath = `/Products('${sId}')`;
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

		onRemoveComparison(oEvent){
			const oBinding = oEvent.getSource().getBindingContext();
			const sCategory = this.getModel("comparison").getProperty("/category");
			const sItem1Id = this.getModel("comparison").getProperty("/item1");
			const bRemoveFirst = sItem1Id === oBinding.getObject().ProductId;
			const sRemainingItemId = this.getModel("comparison").getProperty("/item" + (bRemoveFirst ? 2 : 1));

			// navigate to comparison view without the removed product
			this.getRouter().navTo("comparison", {
				id: sCategory,
				item1Id: sRemainingItemId
			}, true);
		},

		/**
		 * Navigates to the generic cart view
		 * @param {sap.ui.base.Event} oEvent the button press event
		 */
		onToggleCart(oEvent) {
			const sCategory = this.getView().getModel("comparison").getProperty("/category");
			const sItem1Id = this.getView().getModel("comparison").getProperty("/item1");
			const sItem2Id = this.getView().getModel("comparison").getProperty("/item2");
			const bPressed = oEvent.getParameter("pressed");

			this._setLayout(bPressed ? "Three" : "Two");
			this.getRouter().navTo(bPressed ? "comparisonCart" : "comparison", {
				id: sCategory,
				item1Id: sItem1Id,
				item2Id: sItem2Id
			});
		}
	});
});

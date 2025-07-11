sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"../model/cart"
], (Controller, MessageToast, UIComponent, History, cart) => {
	"use strict";

	return Controller.extend("sap.ui.demo.cart.controller.BaseController", {
		cart,

		/**
		 * Convenience method for accessing the router.
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter() {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Retrieves the resource bundle from the "i18n" model of the owning component.
		 * @returns {Promise<sap.ui.model.resource.ResourceBundle>}
		 *    A promise that resolves to the resource bundle of the component
		 */
		requestResourceBundle() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Handler for the Avatar button press event.
		 */
		async onAvatarPress() {
			const sMessage = (await this.requestResourceBundle()).getText("avatarButtonMessageToastText");
			MessageToast.show(sMessage);
		},

		/**
		 * React to FlexibleColumnLayout resize events.
		 * Hides navigation buttons and switches the layout as needed.
		 * @param {sap.ui.base.Event} oEvent the change event
		 */
		onStateChange(oEvent) {
			const sLayout = oEvent.getParameter("layout");
			const iColumns = oEvent.getParameter("maxColumnsCount");

			if (iColumns === 1) {
				this.getModel("appView").setProperty("/smallScreenMode", true);
			} else {
				this.getModel("appView").setProperty("/smallScreenMode", false);
				// switch back to two column mode when device orientation is changed
				if (sLayout === "OneColumn") {
					this._setLayout("Two");
				}
			}
		},

		/**
		 * Sets the flexible column layout to one, two, or three columns for the different scenarios across the app.
		 * @param {string} sColumns the target amount of columns
		 */
		_setLayout(sColumns) {
			if (sColumns) {
				this.getModel("appView").setProperty("/layout",
					sColumns + "Column" + (sColumns === "One" ? "" : "sMidExpanded"));
			}
		},

		/**
		 * Navigates back in browser history or to the home screen.
		 */
		onBack() {
			const oHistory = History.getInstance();
			const oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home");
			}
		},

		/**
		 * Called, when the add button of a product is pressed.
		 * Saves the product, the i18n bundle, and the cart model and hands them to the <code>addToCart</code> function.
		 */
		onAddToCart() {
			const oEntry =  arguments[0].getSource().getBindingContext().getObject();
			const oCartModel = this.getView().getModel("cartProducts");
			cart.addToCart(this.requestResourceBundle(), oEntry, oCartModel);
		},

		/**
		 * Clears the comparison model.
		 */
		_clearComparison() {
			const oModel = this.getOwnerComponent().getModel("comparison");
			oModel.setData({
				category: "",
				item1: "",
				item2: ""
			});
		}
	});
});
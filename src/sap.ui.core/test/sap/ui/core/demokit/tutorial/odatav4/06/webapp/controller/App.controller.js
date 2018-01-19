sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.odatav4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			var oJSONData = {
				busy : false,
				hasUIChanges : false,
				order: 0
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");
		},

		/* =========================================================== */
		/*           begin: event handlers                             */
		/* =========================================================== */

		/**
		 * Create a new entry.
		 */
		onCreate : function () {
			this.byId("people").getBinding("items").create({
				"UserName" : "",
				"FirstName" : "",
				"LastName" : "",
				"Age" : ""
			});
			this._setUIChanges();
			this.byId("people").getItems()[0].focus();
			this.byId("people").getItems()[0].setSelected(true);
			// OData Service demands an valid age >0, but the field gets initialized with 0
			this.byId("people").getItems()[0].getCells()[3].setValue(18);
		},

		/**
		 * Lock UI when changing data in the input controls
		 */
		onInputChange : function (oEvt) {
			if (oEvt.getParameter("escPressed")) {
				this._setUIChanges();
			} else {
				this._setUIChanges(true);
			}
		},

		/**
		 * Refresh the data.
		 */
		onRefresh : function () {
			var oBinding = this.byId("people").getBinding("items");

			if (oBinding && oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshFailedMessage"));
				return;
			}
			oBinding.refresh();
		},

		/**
		 * Reset any unsaved changes.
		 */
		onResetChanges : function () {
			this.byId("people").getBinding("items").resetChanges();
			this._setUIChanges();
		},

		/**
		 * Save changes to the source.
		 */
		onSave : function () {
			var oView = this.getView();

			var fnSuccess = function () {
				this._setBusy(false);
				this._setUIChanges();
				this.byId("people").getBinding("items").refresh();
				MessageToast.show(this._getText("creationSuccessMessage"));
			}.bind(this);
			var fnError = function (oError) {
				this._setBusy(false);
				this._setUIChanges();
				this.byId("people").getBinding("items").refresh();
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true); // lock UI until submitBatch is resolved
			oView.getModel().submitBatch("peopleGroup").then(fnSuccess, fnError);
		},


		/**
		 * Search for the term in the search field.
		 */
		onSearch : function () {
			var oView = this.getView(),
				sValue = oView.byId("search").getValue();

			var aFilters = [new Filter("LastName", FilterOperator.Contains, sValue)];
			oView.byId("people").getBinding("items").filter(aFilters, FilterType.Application);
		},

		/**
		 * Sort the table according to the last name.
		 * Cycles between the three sorting states "none", "ascending" and "descending"
		 */
		onSort : function () {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				iOrder = oView.getModel("appView").getProperty("/order");

			// Cycle between the states
			iOrder= (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("people").getBinding("items").sort(sOrder && new Sorter("LastName", sOrder === "desc"));
		},

		/* =========================================================== */
		/*           end: event handlers                               */
		/* =========================================================== */

		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText : function (sTextId) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId);
		},

		/**
		 * Set hasUIChanges flag in View Model
		 * @param {boolean} [bHasUIChanges] - set or clear hasUIChanges
		 * if bHasUIChanges is not set, the hasPendingChanges-function of the OdataV4 model determines the result
		 */
		_setUIChanges : function (bHasUIChanges) {
			if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/hasUIChanges", bHasUIChanges);
		},

		/**
		 * Set busy flag in View Model
		 * @param {boolean} bIsBusy - set or clear busy
		 */
		_setBusy : function (bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
		}
	});
});
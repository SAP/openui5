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

	return Controller.extend("sap.ui.core.tutorial.odatav4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			var oJSONData = {
				busy : false,
				hasUIChanges : false,
				usernameEmpty : true,
				order : 0
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");
			this.getView().setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
		},


		/* =========================================================== */
		/*           begin: event handlers                             */
		/* =========================================================== */


		/**
		 * Create a new entry.
		 */
		onCreate : function () {
			var oList = this.byId("peopleList"),
				oBinding = oList.getBinding("items"),
				// Create a new entry through the table's list binding
				oContext = oBinding.create({
					"UserName" : "",
					"FirstName" : "",
					"LastName" : "",
					"Age" : "18"
				});

			oContext.created().then(function () {
				oBinding.refresh();
			});

			this._setUIChanges();
			this.getView().getModel("appView").setProperty("/usernameEmpty", true);

			// Select and focus the table row that contains the newly created entry
			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
		},

		/**
		 * Lock UI when changing data in the input controls
		 * @param {sap.ui.base.Event} oEvt - Event data
		 */
		onInputChange : function (oEvt) {
			if (oEvt.getParameter("escPressed")) {
				this._setUIChanges();
			} else {
				this._setUIChanges(true);
				// Check if the username in the changed table row is empty and set the appView property accordingly
				if (oEvt.getSource().getParent().getBindingContext().getProperty("UserName")) {
					this.getView().getModel("appView").setProperty("/usernameEmpty", false);
				}
			}
		},

		/**
		 * Refresh the data.
		 */
		onRefresh : function () {
			var oBinding = this.byId("peopleList").getBinding("items");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},

		/**
		 * Reset any unsaved changes.
		 */
		onResetChanges : function () {
			this.byId("peopleList").getBinding("items").resetChanges();
			this._setUIChanges();
		},

		/**
		 * Save changes to the source.
		 */
		onSave : function () {
			var oListBinding = this.byId("peopleList").getBinding("items");

			var fnSuccess = function () {
				var oError;

				this._setBusy(false);

				// If there are still pending changes at this point,
				// then there was a problem with writing back changes.
				if (oListBinding.hasPendingChanges()) {
					// Error; there will be a message in the MessageModel
					oError = this.getView().getModel("message").getProperty("/0");
					MessageBox.error(oError.message);
					sap.ui.getCore().getMessageManager().removeAllMessages();
				} else {
					// No error
					MessageToast.show(this._getText("saveSuccessMessage"));
				}
				this._setUIChanges();
			}.bind(this);

			var fnError = function (oError) {
				this._setBusy(false);
				this._setUIChanges();
				oListBinding.refresh();
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true); // lock UI until submitBatch is resolved
			this.getView().getModel().submitBatch("peopleGroup").then(fnSuccess, fnError);
		},

		/**
		 * Search for the term in the search field.
		 */
		onSearch : function () {
			var oView = this.getView(),
				sValue = oView.byId("searchField").getValue(),
				oFilter = new Filter("LastName", FilterOperator.Contains, sValue);

			oView.byId("peopleList").getBinding("items").filter(oFilter, FilterType.Application);
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
			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("peopleList").getBinding("items").sort(sOrder && new Sorter("LastName", sOrder === "desc"));
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
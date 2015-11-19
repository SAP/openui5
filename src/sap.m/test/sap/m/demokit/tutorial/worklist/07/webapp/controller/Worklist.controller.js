sap.ui.define([
	"myCompany/myApp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"myCompany/myApp/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("myCompany.myApp.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			this._oTable = oTable;
			// keeps the search state
			this._oTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0,
				inStock: 0,
				shortage: 0,
				outOfStock: 0,
				countAll: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Create an object of filters
			this._mFilters = {
				"inStock": [new sap.ui.model.Filter("UnitsInStock", "GT", 10)],
				"outOfStock": [new sap.ui.model.Filter("UnitsInStock", "LE", 0)],
				"shortage": [new sap.ui.model.Filter("UnitsInStock", "BT", 1, 10)],
				"all": []
			};

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);

				// Get the count for all the products and set the value to 'countAll' property
				this.getModel().read("/Products/$count", {
					success: function (oData) {
						oViewModel.setProperty("/countAll", oData);
					}
				});

				// read the count for the unitsInStock filter
				this.getModel().read("/Products/$count", {
					success: function (oData) {
						oViewModel.setProperty("/inStock", oData);
					},
					filters: this._mFilters.inStock
				});

				// read the count for the outOfStock filter
				this.getModel().read("/Products/$count", {
					success: function(oData){
						oViewModel.setProperty("/outOfStock", oData);
					},
					filters: this._mFilters.outOfStock
				});

				// read the count for the shortage filter
				this.getModel().read("/Products/$count", {
					success: function(oData){
						oViewModel.setProperty("/shortage", oData);
					},
					filters: this._mFilters.shortage
				});

			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @public
		 */
		onNavBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			}
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("ProductName", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(oTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			this._oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ProductID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applySearch: function(oTableSearchState) {
			var oViewModel = this.getModel("worklistView");
			this._oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},

		/**
		 * Displays an error message dialog. The displayed dialog is content density aware.
		 * @param {String} sMsg The error message to be displayed
		 * @private
		 */
		_showErrorMessage: function(sMsg) {
			MessageBox.error(sMsg, {
				styleClass: this.getOwnerComponent().getContentDensityClass()
			});
		},

		/**
		 * Event handler when a filter tab gets pressed
		 * @param {sap.ui.base.Event} oEvent the filter tab event
		 * @public
		 */
		onQuickFilter: function(oEvent) {
			var oBinding = this._oTable.getBinding("items"),
				sKey = oEvent.getParameter("selectedKey");

			oBinding.filter(this._mFilters[sKey]);
		},

		/**
		 * Error and success handler for the unlist action.
		 * @param sProductId the product id for which this handler is called
		 * @param bSuccess true in case of a success handler, else false (for error handler)
		 * @param iRequestNumber the counter which specifies the position of this request
		 * @param iTotalRequests the number of all requests sent
		 * @param oData forwarded data object received from the remove/update OData API
         * @param oResponse forwarded response object received from the remove/update OData API
         * @private
         */
		_handleUnlistActionResult : function (sProductId, bSuccess, iRequestNumber, iTotalRequests, oData, oResponse){
			// create a counter for successful and one for failed requests
			// ...

			// however, we just assume that every single request was successful and display a success message once
			if (iRequestNumber === iTotalRequests) {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockRemovedSuccessMsg", [iTotalRequests]));
			}
		},

		/**
		 * Error and success handler for the reorder action.
		 * @param sProductId the product id for which this handler is called
		 * @param bSuccess true in case of a success handler, else false (for error handler)
		 * @param iRequestNumber the counter which specifies the position of this request
		 * @param iTotalRequests the number of all requests sent
		 * @param oData forwarded data object received from the remove/update OData API
		 * @param oResponse forwarded response object received from the remove/update OData API
		 * @private
		 */
		_handleReorderActionResult : function (sProductId, bSuccess, iRequestNumber, iTotalRequests, oData, oResponse){
			// create a counter for successful and one for failed requests
			// ...

			// however, we just assume that every single request was successful and display a success message once
			if (iRequestNumber === iTotalRequests) {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockUpdatedSuccessMsg", [iTotalRequests]));
			}
		},

		/**
		 * Event handler for the unlist button. Will delete the
		 * product from the (local) model.
		 * @public
		 */
		onUnlistObjects: function() {
			var aSelectedProducts, i, sPath, oProduct, oProductId;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					oProduct = aSelectedProducts[i];
					oProductId = oProduct.getBindingContext().getProperty("ProductID");
					sPath = oProduct.getBindingContextPath();
					this.getModel().remove(sPath, {
						success : this._handleUnlistActionResult.bind(this, oProductId, true, i+1, aSelectedProducts.length),
						error : this._handleUnlistActionResult.bind(this, oProductId, false, i+1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		},


		/**
		 * Event handler for the reorder button. Will reorder the
		 * product by updating the (local) model
		 * @public
		 */
		onUpdateStockObjects: function() {
			var aSelectedProducts, i, sPath, oProductObject;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					sPath = aSelectedProducts[i].getBindingContextPath();
					oProductObject = aSelectedProducts[i].getBindingContext().getObject();
					oProductObject.UnitsInStock += 10;
					this.getModel().update(sPath, oProductObject, {
						success : this._handleReorderActionResult.bind(this, oProductObject.ProductID, true, i+1, aSelectedProducts.length),
						error : this._handleReorderActionResult.bind(this, oProductObject.ProductID, false, i+1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		}

	});
});

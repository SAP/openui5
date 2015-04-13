/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/demo/masterdetail/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/demo/masterdetail/model/promise"
	], function (BaseController, JSONModel, Device, promise) {
	"use strict";

	return BaseController.extend("sap.ui.demo.masterdetail.controller.Detail", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit : function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this._oLineItemsList = this.byId("lineItemsList");

			// Set the view unbusy if master route was hit despite the error or not.
			if (!Device.system.phone) {
				this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			}

			// Update the line item list counter after data is loaded or updated
			this._oLineItemsList.attachEvent("updateFinished", function (oData) {
				this._updateListItemCount(oData.getParameter("total"));
			}, this);

			// Set the detail page busy after the metadata has been loaded successfully
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function () {
					this._setViewBusy(true);
				}.bind(this)
			);

			// Control state model
			this._oViewModel = new JSONModel({
				lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
			});
			this.setModel(this._oViewModel, "view");
		},


		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 *
		 * In case there is an error we still have to set the Detail View unbusy
		 *
		 * @function
		 * @private
		 */
		_onMasterMatched : function () {

			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.catch(
				function (mParams) {
					// only in case there is an error we have to set the view unbusy
					if (mParams.error) {
						this._setViewBusy(false);
					}
				}.bind(this)
			);
		},


		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectPath = "/Objects('" + oEvent.getParameter("arguments").objectId + "')";
			this._bindView(sObjectPath);
		},


		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 *
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oView = this.getView().bindElement(sObjectPath, {expand : "LineItems"});

			promise.whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function (sPath) {
					this._setViewBusy(false);
					this.getOwnerComponent().oListSelector.selectAListItem(sPath);
				}.bind(this),
				function () {
					this._setViewBusy(false);
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
				}.bind(this)
			);

		},

		/**
		 * Sets the item count on the line item list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount : function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oLineItemsList.getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				this._oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		/**
		 * Convenience function to set the view Busy
		 * @private
		 */
		_setViewBusy : function (bBusy) {
			var oView = this.getView();
			oView.setBusy(bBusy);
			if (bBusy){
				oView.setBusyIndicatorDelay(0);
			} else {
				oView.setBusyIndicatorDelay(null);
			}
		}
	});

});

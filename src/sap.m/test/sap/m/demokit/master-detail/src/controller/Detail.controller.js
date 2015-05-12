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
			var oViewModel;

			this._bMetadataIsLoaded = false;
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this._oLineItemsList = this.byId("lineItemsList");


			// Update the line item list counter after data is loaded or updated
			this._oLineItemsList.attachEvent("updateFinished", function (oData) {
				this._updateListItemCount(oData.getParameter("total"));
			}, this);

			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			oViewModel = new JSONModel({
				lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading"),
				shareSaveAsTileTitle: "",
				shareOnJamTitle: "",
				shareSendEmailSubject: "",
				shareSendEmailMessage: ""
			});

			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function () {
					// Store original busy indicator delay for the detail view
					var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
						oLineItemTable = this.getView().byId("lineItemsList"),
						iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();
					// Make sure busy indicator is displayed immediately when
					// detail view is displayed for the first time
					oViewModel.setProperty("/delay", 0);
					oViewModel.setProperty("/lineItemTableDelay", 0);
					oViewModel.setProperty("/busy", true);

					oLineItemTable.attachEventOnce("updateFinished", function(){
						// Restore original busy indicator delay for line item table
						oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
					});
					// Restore original busy indicator delay for the detail view
					oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
					this._bMetadataIsLoaded = true;
				}.bind(this),
				function () {
					// Called when loading metadata fails.
					this._bMetadataIsLoaded = true;
				}.bind(this)
			);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share button has been clicked
		 * @param {sap.ui.base.Event} oEvent the butten press event
		 * @public
		 * @returns
		 */
		onSharePress : function (oEvent) {
			var oShareSheet = this.getView().byId("shareSheet");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oShareSheet);
			oShareSheet.openBy(this.byId("shareButton"));
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 * @returns
		 */
		onShareEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object:{
							id: document.location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */


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
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 *
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			// Set busy indicator during view binding
			var oView,
				oViewModel = this.getModel("detailView");

			// Busy indicator on view should only be set if metadata is loaded,
			// otherwise there may be two busy indications next to each other on the
			// screen. This happens because route matched handler already calls '_bindView'
			// while metadata is loaded.
			if (this._bMetadataIsLoaded) {
				oViewModel.setProperty("/busy", true);
			}

			//oView = this.getView().bindElement(sObjectPath, {expand : "LineItems"});
			oView = this.getView().bindElement(sObjectPath);

			promise.whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function (sPath) {
					var oResourceBundle = this.getResourceBundle(),
						oObject = oView.getModel().getObject(oView.getElementBinding().getPath()),
						sObjectId = oObject.ObjectID,
						sObjectName = oObject.Name;

					oViewModel.setProperty("/busy", false);
					this.getOwnerComponent().oListSelector.selectAListItem(sPath);

					oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
					oViewModel.setProperty("/shareOnJamTitle", sObjectName);
					oViewModel.setProperty("/shareSendEmailSubject",
						oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
					oViewModel.setProperty("/shareSendEmailMessage",
						oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, window.location.href]));
				}.bind(this),
				function () {
					oViewModel.setProperty("/busy", false);
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
				}.bind(this)
			);

		},

		/**
		 * Updates the item count within the line item table's header
		 *
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount : function (iTotalItems) {
			var sTitle,
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this._oLineItemsList.getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		}

	});

});

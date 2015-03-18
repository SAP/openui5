sap.ui.define([
		"sap/ui/demo/worklist/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.Worklist", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oView = this.getView(),
				iOriginalBusyDelay;
			this._oTable = this.byId("table");

			// Control state model
			this.oViewModel = new sap.ui.model.json.JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle")
			});

			oView.setModel(this.oViewModel, "view");
			
			// Put down worklist table's original value for busy indicator delay, 
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = this._oTable.getBusyIndicatorDelay();
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is 
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			this._oTable.setBusyIndicatorDelay(0).
				attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for worklist's table
				this._oTable.setBusyIndicatorDelay(iOriginalBusyDelay);
			}.bind(this));
			
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
		 *
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			this._updateListItemCount(oEvent.getParameter("total"));
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ObjectID")
			});
		},

		/**
		 * Sets the item count on the worklist view header
		 * @param {integer} the total number of items in the table
		 * @private
		 */
		_updateListItemCount : function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oTable.getBinding('items').isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				this.oViewModel.setProperty("/worklistTableTitle", sTitle);
			}
		}

	});

}, /* bExport= */ true);

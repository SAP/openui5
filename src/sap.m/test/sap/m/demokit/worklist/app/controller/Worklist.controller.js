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
			var oView = this.getView();
			this._oTable = this.byId("table");

			// Control state model
			this.oControlStateModel = new sap.ui.model.json.JSONModel({
				worklistViewTitle : this.getResourceBundle().getText("worklistViewTitle")
			});
			
			oView.setModel(this.oControlStateModel, 'controlStates');
			
			// Use the table's 'updateStarted' event to set the table busy. We can not use
			// the list bindings's 'dataRequested' because unfortunately is fired BEFORE 
			// the router fires its 'display' event, if the app has been started with an 
			// object hash and navigates back to the worklist.	
			this._oTable.attachUpdateStarted(function () {
				this.setBusy(true);
			}.bind(oView));
			
			// Have to wait until the worklist view is displayed, before we can attach listeners
			// to the table's 'items' list binding: the list bindings are not available any earlier.
			this.getRouter().getTargets().getTarget("worklist").attachEventOnce("display", function () {
				// Put down worklist view's original value for busy indicator delay, 
				// so it can be restored later on.
				
				this.setOriginalBusyIndicatorDelay(this.getView().getBusyIndicatorDelay());
				// Make sure, busy indication is showing immediately so there is no
				// break in between the busy indication for loading the view's meta data
				// (this is being taken care of by class 'BusyHandler')
				this.getView().setBusyIndicatorDelay(0);
				
				// Using event 'dataReceived' and NOT the table's
				// own 'updateFinished' event because 'updateFinished'
				// does not return if the request returns with an error code.
				this._oTable.getBinding("items").attachDataReceived(function () {
					this.getView().setBusy(false);
				}.bind(this));
				
				// Restore original busy indicator delay for the worklist view
				this._oTable.getBinding("items").attachEventOnce('dataReceived', function () {
					this.getView().setBusyIndicatorDelay(this.getOriginalBusyIndicatorDelay());
				}.bind(this));
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
				sTitle = this.getResourceBundle().getText("worklistViewTitleCount", [iTotalItems]);
				this.oControlStateModel.setProperty("/worklistViewTitle", sTitle);
			}
		}

	});

}, /* bExport= */ true);

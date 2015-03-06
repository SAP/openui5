sap.ui.define([
		"sap/ui/demo/fstemplate/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.fstemplate.controller.Worklist", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			this.oTable = this.byId("table");

			// Control state model
			this.oControlStateModel = new sap.ui.model.json.JSONModel({
				worklistViewTitle : this.getResourceBundle().getText("worklistViewTitle")
			});
			this.getView().setModel(this.oControlStateModel, 'controlStates');

			this.oTable.attachEventOnce("updateFinished", function() {

				this.oTable.setBusyIndicatorDelay(null);

			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * After table data is available, this handler method updates the
		 * table counter and hides the pull to refresh control, if
		 * necessary.
		 *
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the master list object counter after new data is loaded
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
			if (this.oTable.getBinding('items').isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistViewTitleCount", [iTotalItems]);
				this.oControlStateModel.setProperty("/worklistViewTitle", sTitle);
			}
		}

	});

}, /* bExport= */ true);

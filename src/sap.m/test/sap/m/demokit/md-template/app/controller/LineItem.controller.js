sap.ui.define([
		"sap/ui/demo/mdtemplate/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.mdtemplate.controller.LineItem", {

		onInit : function() {
			//used to keep track of the currently
			//selected parent object and lineItem
			this._oObject = {};
			this._sObjectPath = null;
			this._sLineItemId = null;
			
			// Introducing a named model to update states of controls within this view
			// such as en- or disabling next and previous buttons. Advantage of this approach:
			// we do not need to get those conrols via their id every time their states need
			// to be updated.
			var oControlStateModel = 
				new sap.ui.model.json.JSONModel({previousButtonEnabled : false, nextButtonEnabled : false});
			this.getView().setModel(oControlStateModel, 'controlStates');
			this.getRouter().getRoute("lineItem").attachPatternMatched(this._onRouteMatched, this);
		},
		
	
		/**
		 * Handler function which is called when a 'lineItem' route is being navigated to. This
		 * function extracts the currently selected object and line item id. Afterwards
		 * it populates the LineItemView with the data of the newly selected lineItem.
		 * 
		 * @function
		 * @private
		 */
		_onRouteMatched : function(oEvent) {
			var oParameters = oEvent.getParameters();
			if (this._oObject.sObjectId !== oParameters.arguments.objectId ){
				this._oObject = {};
				this._oObject.sObjectId = oParameters.arguments.objectId;
			}
			this._sObjectPath = "/Objects('" + this._oObject.sObjectId + "')";
			this._sLineItemId = oParameters.arguments.lineItemId;
	
			this._bindView();
		},
	
	
		/**
		 * Binds the view to the object path and the nested page to the current line item.
		 * This makes sure we have all line items belonging to the current object in our model, which is a 
		 * prerequisite for navigating through line items with the arrow buttons.
		 * 
		 * @function
		 * @private
		 */
		_bindView : function () {
			var oView = this.getView();
			oView.setBusy(true);
	
			// We are binding the view to the object here, and NOT to the line item. This has a reason:
			// In order to be able to navigate forwards and backwards through ALL line items belonging to an object,
			// without leaving the line item view, we need the information which other line items are there.
			// However, we can only get this information and have it written back to the model when we bind the
			// data somewhere. Hence, we are helping us with the construction below, binding the view to the object itself,
			// and then using 'expand' to retrieve all corresponding line items.  
			oView.bindElement(this._sObjectPath, {expand: "LineItems"});
	
			this.getModel().whenThereIsDataForTheElementBinding(oView.getElementBinding())
				.then(
				function (sPath) {
					this.getOwnerComponent().oListSelector.selectAndScrollToAListItem(sPath);
					this._checkLineItemAndBind();
				}.bind(this),
				function () {
					this.getView().setBusy(false);
					this.showEmptyView();
				}.bind(this));
		},
	
		
		/** 
		 * Invoked whenever navigation to a new item occurs, checks if the item exists; if it does, 
		 * the view is populated with new line item data, and the buttons to navigate to next and 
		 * previous line item are updated. If the item does not exist, it navigates to the "Item not found" view.
		 * 
		 * @function
		 * @private
		 */
		_checkLineItemAndBind : function(){
			// now, we need to make sure that the elements in our view show us the data from the particular line item in 
			// the model. As the view has been bound to the object instead, we now need to bind the container element within the view (in our
			// case, the page) to the particular line item.
			var sItemPath = "/LineItems('" + this._sLineItemId + "')",
				oLineItemPage = this.byId("lineItemPage"),
				oView = this.getView();
	
			oLineItemPage.bindElement(sItemPath);
	
			this.getModel().whenThereIsDataForTheElementBinding(oLineItemPage.getElementBinding()).then(
				function () {
					oView.setBusy(false);
					this._populateLineItems();
					this._toggleButtonState();
				}.bind(this),
				function () {
	
					this.getView().setBusy(false);
					this.showEmptyView();
	
				}.bind(this));
		},
		
	
		/**	
		 * Retrieves all line items belonging to the parent object of the current line item. 
		 * This is necessary to allow direct navigation to the next/previous line item.
		 *
		 * @function
		 * @private
		 */
		_populateLineItems : function() {
			if (!this._oObject.aLineItemIds) {
				this._oObject.aLineItemIds = [];
				var aIds = this.getView().getModel().getObject("/Objects('" + this._oObject.sObjectId + "')/LineItems"),
					oRegExLineItemId = new RegExp("LineItemID_[0-9]*");
				aIds.forEach(function(sId, iIndex) { 
					// retrieve all line items and cache them in a private array
					// this makes it easier to check in which relative position in the array 
					// the current item is, and which one is next or previous
					this._oObject.aLineItemIds[iIndex] = sId.match(oRegExLineItemId)[0];
				}, this);
			} 
			this.iCurrentIndex = this._oObject.aLineItemIds.indexOf(this._sLineItemId);
		},
		
	
		/**	
		 * Sets the arrow buttons for navigation between items to enabled/disabled, depending on
		 * whether there is a next or previous item.
		 *
		 * @function
		 * @private 
		 */
		_toggleButtonState : function () {
			var oControlStateModel = this.getView().getModel('controlStates');
			oControlStateModel.setProperty("/nextButtonEnabled", this._itemExists(this.iCurrentIndex + 1));
			oControlStateModel.setProperty("/previousButtonEnabled", this._itemExists(this.iCurrentIndex - 1));
		},
	
	
		/**
		 * Checks if there is an entry in the line items array to this index
		 *
		 * @function
		 * @param {integer} iIndex position of the lineItem of which we'd like to know
		 * @return {boolean} true if there is a lineItem at position iIndex
		 * @private
		 */
		_itemExists : function(iIndex) {
			return !!this._oObject.aLineItemIds[iIndex];
		},
	
	
		/** 
		 * When the 'navigate back' button is pressed on the line item
		 * the app should always navigate back to the parent object view,
		 * even if there have been some visits to neighboring line items
		 * via the 'next' and 'previous' buttons.
		 *
		 */ 
		onNavBack : function () {
			this.getRouter().myNavBack("main");
		},
	
	
		/**
		 * Triggers navigation to the next line item in the list of line items to the current object.
		 * 
		 * @param {Event} oEvent the event object
		 */
		onNavToNextLineItem: function (oEvent) {
			var iLineItemId = this._oObject.aLineItemIds[this.iCurrentIndex + 1];
			this.getRouter().navTo("lineItem", {lineItemId : iLineItemId, objectId: this._oObject.sObjectId}, true);
		},
		
	
		/**
		 * Triggers navigation to the previous line item in the list of line items to the current object.
		 * 
		 * @param {Event} oEvent the event object
		 */
		onNavToPrevLineItem: function (oEvent) {
			var iLineItemId = this._oObject.aLineItemIds[this.iCurrentIndex - 1];
			this.getRouter().navTo("lineItem", {lineItemId : iLineItemId, objectId: this._oObject.sObjectId}, true);
		}
	
	});

}, /* bExport= */ true);

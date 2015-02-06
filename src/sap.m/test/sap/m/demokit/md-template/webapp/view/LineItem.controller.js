jQuery.sap.require("sap.ui.demo.mdtemplate.view.BaseController");

sap.ui.demo.mdtemplate.view.BaseController.extend("sap.ui.demo.mdtemplate.view.LineItem", {

	onInit : function() {
		this.oItems = null;
		this.oObject = {};
		this.sObjectPath = null;
		this.sLineItemId = null;

		this.getRouter().getRoute("lineItem").attachPatternMatched(this.onRouteMatched, this);
	},

	onRouteMatched : function(oEvent) {
		
		var oParameters = oEvent.getParameters();
		if (this.oObject.sObjectId !== oParameters.arguments.objectId ){
			this.oObject = {};
			this.oObject.sObjectId = oParameters.arguments.objectId;
		}
		this.sObjectPath = "/Objects('" + this.oObject.sObjectId + "')";
		this.sLineItemId = oParameters.arguments.lineItemId;

		this._bindView();
	},

	/**
	 * Binds the view to the object path and the nested page to the current line item.
	 * This makes sure we have all line items belonging to the current object in our model, which is a 
	 * prerequisite for navigating through line items with the arrow buttons.
	 * 
	 * @function
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
		oView.bindElement(this.sObjectPath, {expand: "LineItems"});


		this.getModel().whenThereIsDataForTheElementBinding(oView.getElementBinding())
			.then(
			function (sPath) {
				this.getOwnerComponent().oListSelector.selectAndScrollToAListItem(sPath);
				this.checkLineItemAndBind();
			}.bind(this),
			function () {

				this.getView().setBusy(false);
				this.showEmptyView();

			}.bind(this));
	},

	
	/** 
	 * Invoked whenever navigation to a new item occurs, checks if the item exists; if yes, prepares for item navigation, 
	 * if no, forwards to the "Item not found" view
	 * 
	 */
	checkLineItemAndBind : function(){
		// now, we need to make sure that the elements in our view show us the data from the particular line item in 
		// the model. As the view has been bound to the object instead, we now need to bind the container element within the view (in our
		// case, the page) to the particular line item.
		var sItemPath = "/LineItems('" + this.sLineItemId + "')",
			oLineItemPage = this.byId("lineItemPage"),
			oView = this.getView();

		oLineItemPage.bindElement(sItemPath);

		this.getModel().whenThereIsDataForTheElementBinding(oLineItemPage.getElementBinding()).then(
			function () {
				oView.setBusy(false);
				this.populateLineItems();
				this.toggleButtonState();
			}.bind(this),
			this.showEmptyView.bind(this));
	},
	
	/**
	 * Invoked when the selected line item (e.g. wrong parameter in URL) is not found in the model.
	 * Navigation to the corresponding view is triggered.
	 * 
	 * @function
	 */
	
	showEmptyView : function () {
		this.getRouter().myNavToWithoutHash({ 
			currentView : this.getView(),
			targetViewName : "sap.ui.demo.mdtemplate.view.NotFound",
			targetViewType : "XML"
		});
	},
	

	/**	
	 * Retrieves all line items belonging to the parent object of the current line item. 
	 * This is necessary to allow direct navigation to the next/previous line item.
	 */
	populateLineItems : function() {
		if (!this.oObject.aLineItemIds) {
			this.oObject.aLineItemIds = [];
			var aIds = this.getView().getModel().getObject("/Objects('" + this.oObject.sObjectId + "')/LineItems"),
				oRegExLineItemId = new RegExp("LineItemID_[0-9]*");
			aIds.forEach(function(sId, iIndex) { 
				// retrieve all line items and cache them in a private array
				// this makes it easier to check in which relative position in the array 
				// the current item is, and which one is next or previous
				this.oObject.aLineItemIds[iIndex] = sId.match(oRegExLineItemId)[0];
			}, this);
		} 
		this.iCurrentIndex = this.oObject.aLineItemIds.indexOf(this.sLineItemId);
	},
	
	

	/**	
	 * Sets the arrow buttons for navigation between items to enabled/disabled, depending on
	 * whether there _is_ a next or previous item. 
	 */
	toggleButtonState : function () {
		// TODO: Change this function, use a view model
		this.byId("btnNext").setEnabled(this.itemExists(this.iCurrentIndex + 1));
		this.byId("btnPrevious").setEnabled(this.itemExists(this.iCurrentIndex - 1));
	},

	/**
	 * Checks if there is an entry in the line items array to this index
	 * @return {boolean} 
	 */
	itemExists : function(iIndex) {
		return !!this.oObject.aLineItemIds[iIndex];
	},

	/** 
	 * TODO: is supposed to trigger navigation to the parent object...
	 */ 
	onNavBack : function () {
		// TODO: this needs to send us back to the product, and not just back in browser history
		this.getRouter().myNavBack("main");
	},

	/**
	 * Triggers navigation to the next line item in the list of line items to the current object.
	 * 
	 * @param {Event} oEvent the event object
	 */
	onNavToNextLineItem: function (oEvent) {
		var iLineItemId = this.oObject.aLineItemIds[this.iCurrentIndex + 1];
		this.getRouter().navTo("lineItem", {lineItemId : iLineItemId, objectId: this.oObject.sObjectId});
	},
	

	/**
	 * Triggers navigation to the previous line item in the list of line items to the current object.
	 * 
	 * @param {Event} oEvent the event object
	 */
	onNavToPrevLineItem: function (oEvent) {
		var iLineItemId = this.oObject.aLineItemIds[this.iCurrentIndex - 1];
		this.getRouter().navTo("lineItem", {lineItemId : iLineItemId, objectId: this.oObject.sObjectId});
	}

});
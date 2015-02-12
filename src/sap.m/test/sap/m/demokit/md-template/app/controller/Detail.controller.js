sap.ui.define([
		"sap/ui/demo/mdtemplate/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.mdtemplate.controller.Detail", {

		onInit : function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			
			// When there is a list displayed, bind to the first item.
			if (!sap.ui.Device.system.phone) {
				this.getRouter().getRoute("main").attachPatternMatched(this._onMasterMatched, this);
			}
		},

		/**
		 * This function makes sure that the details of the first item in
		 * in the master list are displayed when the app is started with 
		 * the 'default' URL, i.e. a URL that does not deep link to a specific
		 * object or object and line item. 
		 *
		 * This 'default' URL is then matched to the 'master' route which triggers
		 * this function to be called. Herein, the ListSelector is used to wait
		 * for the master list to be loaded. After that, the binding context path to 
		 * the first master list item is returned, which can finally be bound to
		 * the detail view.
		 *  
		 * This is only necessary once though, because the master list does not fire
		 * a 'select' event when it selects its first item initially. Afterwards, the
		 * master controller's 'select' handler takes care of keeping the objects to be
		 * displayed in the detail view up to date.
		 * 
		 * If the list has no entries, the app displays a 'No Items' view instead of 
		 * the detail view.
		 * 
		 * @function
		 * @param oEvent pattern match event in route 'master'
		 * @private
		 */
		_onMasterMatched : function () {
			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(function (sPathToFirstItem) {
				if (sPathToFirstItem) {
					this._bindView(sPathToFirstItem);
				}
			}.bind(this),
			function () {
				//TODO: display the 'No Items' view
			});
		},

		
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * 
		 * @function
		 * @param oEvent pattern match event in route 'object'
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
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oView = this.getView().bindElement(sObjectPath, {expand : "LineItems"});
			oView.setBusy(true);

			this.getModel().whenThereIsDataForTheElementBinding(oView.getElementBinding())
				.then(
				function (sPath) {
					this.getView().setBusy(false);
					this.getOwnerComponent().oListSelector.selectAndScrollToAListItem(sPath);
				}.bind(this),
				function () {
					this.getView().setBusy(false);
					this.showEmptyView();
				}.bind(this));
		},

		/**
		 * On detail view, 'nav back' is only relevant when
		 * running on phone devices. On larger screens, the detail
		 * view has no other view to go back to.
		 * If running on phone though, the app 
		 * will navigate back to the 'main' view.
		 * 
		 * @function
		 */
		onNavBack : function () {
			// This is only relevant when running on phone devices
			this.getRouter().myNavBack("main");
		},

		/**
		 * Triggered when an item of the line item table in the detail view is selected.
		 * Collects the needed information ProductID and OrderID for navigation.
		 * Navigation to the corresponding line item is triggered.
		 * 
		 * @param oEvent listItem selection event
		 * @function
		 */
		onSelect : function (oEvent) {
			//We need the 'ObjectID' and 'LineItemID' of the
			//selected LineItem to navigate to the corresponding
			//line item view. Here's how this information is extracted:
			var oContext = oEvent.getSource().getBindingContext();

			jQuery.sap.log.debug(oContext.getProperty("LineItemID") + "' was pressed");
			this.getRouter().navTo("lineItem", {objectId : oContext.getProperty("ObjectID"), 
				lineItemId: oContext.getProperty("LineItemID")});
		}
	});

}, /* bExport= */ true);

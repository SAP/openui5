sap.ui.define(["sap/ui/demo/mdtemplate/view/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.mdtemplate.view.Detail", {

		onInit : function () {
			this.getRouter().getRoute("object").attachPatternMatched(this.onObjectMatched, this);

			// When there is a list displayed, bind to the first item.
			if (!sap.ui.Device.system.phone) {
				this.getRouter().getRoute("main").attachPatternMatched(this.onMasterMatched, this);
			}
		},

		onObjectMatched : function (oEvent) {
			var sObjectPath = "/Objects('" + oEvent.getParameter("arguments").objectId + "')";
			this._bindView(sObjectPath);
		},

		onMasterMatched : function () {
			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(function (sPath) {
				if (sPath) {
					this._bindView(sPath);
				}
			}.bind(this),
			function () {
				//TODO: what to do here? - no items in the list
			});
		},

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

		//TODO empty view has to be adapted with empty page control which is not available yet
		showEmptyView : function () {
			this.getRouter().myNavToWithoutHash({ 
				currentView : this.getView(),
				targetViewName : "sap.ui.demo.mdtemplate.view.NotFound",
				targetViewType : "XML"
			});
		},

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
		 */
		onSelect : function (oEvent) {
			//We need the 'ObjectID' and 'LineItemID' of the
			//selected LineItem to navigate to the corresponding
			//line item view. Here's how this information is extracted:
			var oContext = oEvent.getSource().getBindingContext();

			//TODO Dear Reviewer, is check for null necessary?
			if (oContext) {
				var sMsg = "Detail Item '" + oContext.getProperty('ObjectID') + '/';
				//TODO navigation to line item
				sMsg += oContext.getProperty("LineItemID") + "' was pressed";
				jQuery.sap.log.debug(sMsg);
				this.getRouter().navTo("lineItem", {objectId : oContext.getProperty("ObjectID"), lineItemId: oContext.getProperty("LineItemID")});
			} else {
				sap.m.MessageToast.show("Detail Item was pressed. No Binding Context found!", {
					duration: 2000
				});
			}
		}
	});

}, /* bExport= */ true);

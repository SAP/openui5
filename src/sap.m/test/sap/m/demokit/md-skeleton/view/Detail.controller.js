jQuery.sap.require("sap.ui.demo.mdskeleton.util.Controller");

sap.ui.demo.mdskeleton.util.Controller.extend("sap.ui.demo.mdskeleton.view.Detail", {

	onInit : function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		if(sap.ui.Device.system.phone) {
			//don't wait for the master on a phone
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			this.getView().setBusy(true);
			this.getEventBus().subscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().getRoute("object").attachPatternMatched(this.onRouteMatched, this);

	},

	onMasterLoaded :  function (sChannel, sEvent, oData) {
		this.bindView(oData.oListItem.getBindingContext().getPath());
		this.getView().setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();
	},

	onRouteMatched : function(oEvent) {
		var oParameters = oEvent.getParameters();

		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function () {
			// when detail navigation occurs, update the binding context
			var sObjectPath = "/" + oParameters.arguments.object;
			this.bindView(sObjectPath);
		}, this));

	},

	bindView : function (sObjectPath) {
		var oView = this.getView();
		oView.bindElement(sObjectPath);

		//Check if the data is already on the client
		if(!oView.getModel().getData(sObjectPath)) {

			// Check that the object specified actually was found.
			oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
				var oData = oView.getModel().getData(sObjectPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				} else {
					this.fireDetailChanged(sObjectPath);
				}
			}, this));

		} else {
			this.fireDetailChanged(sObjectPath);
		}

	},

	//TODO empty view has to be adapted with empty page control which is not available yet
	showEmptyView : function () {
		this.getRouter().myNavToWithoutHash({ 
			currentView : this.getView(),
			targetViewName : "sap.ui.demo.mdskeleton.view.NotFound",
			targetViewType : "XML"
		});
	},

	//this is not needed anymore or?
	fireDetailChanged : function (sObjectPath) {
		this.getEventBus().publish("Detail", "Changed", { sObjectPath : sObjectPath });
	},

	//this is not needed anymore or?
	fireDetailNotFound : function () {
		this.getEventBus().publish("Detail", "NotFound");
	},

	onNavBack : function() {
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
		//We need the 'OrderID' and 'ProductID' of the
		//selected OrderDetail to navigate to the corresponding
		//line item view. Here's how this information is extracted:
		var oContext = oEvent.getSource().getBindingContext();
		
		//Dear Reviewer, is check for null necessary?
		//navigation to line item has to happen here
		if (oContext) {
			var sMsg = "Detail Item '" + oContext.getProperty('LineItemID') + '/';
			//TODO navigation to line item
			sMsg += oContext.getProperty('ObjectID') + "' was pressed" 
			sap.m.MessageToast.show(sMsg, {
				duration: 2000
			});
		} else {
			sap.m.MessageToast.show("Detail Item was pressed. No Binding Context found!", {
				duration: 2000
			});
		}
		
	}

});

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

		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

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
			if (oParameters.name !== "product") { 
				return;
			}

			var sProductPath = "/" + oParameters.arguments.product;
			this.bindView(sProductPath);
		}, this));

	},

	bindView : function (sProductPath) {
		var oView = this.getView();
		oView.bindElement(sProductPath);

		//Check if the data is already on the client
		if(!oView.getModel().getData(sProductPath)) {

			// Check that the product specified actually was found.
			oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
				var oData = oView.getModel().getData(sProductPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				} else {
					this.fireDetailChanged(sProductPath);
				}
			}, this));

		} else {
			this.fireDetailChanged(sProductPath);
		}

	},

	showEmptyView : function () {
		this.getRouter().myNavToWithoutHash({ 
			currentView : this.getView(),
			targetViewName : "sap.ui.demo.mdskeleton.view.NotFound",
			targetViewType : "XML"
		});
	},

	fireDetailChanged : function (sProductPath) {
		this.getEventBus().publish("Detail", "Changed", { sProductPath : sProductPath });
	},

	fireDetailNotFound : function () {
		this.getEventBus().publish("Detail", "NotFound");
	},

	onNavBack : function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	}

});

/*!
 * ${copyright}
 */

jQuery.sap.require("jquery.sap.history");
jQuery.sap.require("sap.m.InstanceManager");

sap.ui.controller("sap.ui.demokit.icex.view.App", {
	
	getDefaultPage : function () {
		return "Master";
	},
	
	onInit : function () {
		var historyDefaultHandler = function (navType) {
			if (navType === jQuery.sap.history.NavType.Back) {
				this.navBack(this.getDefaultPage());
			} else {
				this.navTo(this.getDefaultPage(), null, false);
			}
		};
		
		var historyPageHandler = function (params, navType) {
			if (!params || !params.id) {
				jQuery.sap.log.error("invalid parameter: " + params);
			} else {
				if (navType === jQuery.sap.history.NavType.Back) {
					this.navBack(params.id);
				} else {
					this.navTo(params.id, params.data, false);
				}
			}
		};
		
		jQuery.sap.history({
			routes: [{
				// This handler is executed when you navigate back to the history state on the path "page"
				path : "page",
				handler : jQuery.proxy(historyPageHandler, this)
			}],
			// The default handler is executed when you navigate back to the history state with an empty hash
			defaultHandler: jQuery.proxy(historyDefaultHandler, this)
		});
		
		// subscribe to event bus
		var bus = this.getOwnerComponent().getEventBus();
		bus.subscribe("nav", "to", this.navHandler, this);
		bus.subscribe("nav", "back", this.navHandler, this);
		bus.subscribe("nav", "virtual", this.navHandler, this);
	},
	
	navHandler: function (channelId, eventId, data) {
		if (eventId === "to") {
			this.navTo(data.id, data.data, true);
		} else if (eventId === "back") {
			jQuery.sap.history.back();
		} else if (eventId === "virtual") {
			jQuery.sap.history.addVirtualHistory();
		} else {
			jQuery.sap.log.error("'nav' event cannot be processed. There's no handler registered for event with id: " + eventId);
		}
	},
	
	navTo : function (id, data, writeHistory) {
		var page = null;
		if (id === undefined) {
			
			// invalid parameter
			jQuery.sap.log.error("navTo failed due to missing id");
		
		} else {
			
			var master = (id !== "Detail");
			
			// load view on demand
			var app = this.getView().app;
			if (app.getPage(id, master) === null) {
				this.getOwnerComponent().runAsOwner(function(){
					page = sap.ui.view({
						id : id,
						viewName : "sap.ui.demokit.icex.view." + id,
						type : "XML"
					});
					
				});
				if (master) {
					app.addMasterPage(page);
				} else {
					app.addDetailPage(page);
				}
				jQuery.sap.log.info("app controller > loaded page: " + id);
			}
			
			// navigate in the app control
			app.to(id, "slide", data);
			
			// write browser history
			if ((writeHistory === undefined || writeHistory) &&
				(sap.ui.Device.system.phone || master)) {
				jQuery.sap.history.addHistory("page", { id: id }, false);
			}
			
			// log
			jQuery.sap.log.info("navTo - to page: " + id + " [" + writeHistory + "]");
		}
	},
	
	navBack : function (id) {
		
		if (!id) {
			
			// invalid parameter
			jQuery.sap.log.error("navBack - parameters id must be given");
		
		} else {
			
			// close open popovers
			if (sap.m.InstanceManager.hasOpenPopover()) {
				sap.m.InstanceManager.closeAllPopovers();
			}
			
			// close open dialogs
			if (sap.m.InstanceManager.hasOpenDialog()) {
				sap.m.InstanceManager.closeAllDialogs();
				jQuery.sap.log.info("navBack - closed dialog(s)");
			}
			
			// ... and navigate back
			var app = this.getView().app;
			var currentId = (app.getCurrentPage()) ? app.getCurrentPage().getId() : null;
			if (currentId !== id) {
				app.backToPage(id);
				jQuery.sap.log.info("navBack - back to page: " + id);
			}
		}
	}
});

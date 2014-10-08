jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.declare("sap.ui.demo.tdg.MyRouter");

sap.ui.core.routing.Router.extend("sap.ui.demo.tdg.MyRouter", {

	constructor : function() {
		sap.ui.core.routing.Router.apply(this, arguments);
		this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this);
	},

	/**
	 * Navigates back in the browser history, if the entry was created by this app.
	 * If not, it navigates to a route passed to this function.
	 * 
	 * @public
	 * @param {string} sRoute the name of the route if there is no history entry
	 * @param {object} mData the parameters of the route, if the route does not need parameters, it may be ommited.
	 */
	myNavBack : function(sRoute, mData) {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash();

		//The history contains a previous entry
		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			var bReplace = true; // otherwise we go backwards with a forward history
			this.navTo(sRoute, mData, bReplace);
		}
	},

	/**
	 * Changes the view without changing the hash
	 * 
	 * @param {object} oOptions must have the following properties
	 * <ul>
	 * 	<li> currentView : the view you start the navigation from.</li>
	 * 	<li> targetViewName : the fully qualified name of the view you want to navigate to.</li>
	 * 	<li> targetViewType : the viewtype eg: XML</li>
	 * 	<li> isMaster : default is false, true if the view should be put in the master</li>
	 * 	<li> transition : default is "show", the navigation transition</li>
	 * 	<li> data : the data passed to the navContainers livecycle events</li>
	 * </ul>
	 * @public
	 */
	myNavToWithoutHash : function (oOptions) {
		var oSplitApp = this._findSplitApp(oOptions.currentView);

		// Load view, add it to the page aggregation, and navigate to it
		var oView = this.getView(oOptions.targetViewName, oOptions.targetViewType);
		oSplitApp.addPage(oView, oOptions.isMaster);
		oSplitApp.to(oView.getId(), oOptions.transition || "show", oOptions.data);
	},

	backWithoutHash : function (oCurrentView, bIsMaster) {
		var sBackMethod = bIsMaster ? "backMaster" : "backDetail";
		this._findSplitApp(oCurrentView)[sBackMethod]();
	},

	destroy : function() {
		sap.ui.core.routing.Router.prototype.destroy.apply(this, arguments);
		this._oRouteMatchedHandler.destroy();
	},

	_findSplitApp : function(oControl) {
		sAncestorControlName = "idAppControl";

		if (oControl instanceof sap.ui.core.mvc.View && oControl.byId(sAncestorControlName)) {
			return oControl.byId(sAncestorControlName);
		}

		return oControl.getParent() ? this._findSplitApp(oControl.getParent(), sAncestorControlName) : null;
	}

});

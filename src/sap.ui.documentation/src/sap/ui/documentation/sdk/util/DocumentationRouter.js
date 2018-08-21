/*!
 * ${copyright}
 */
// Provides a customized router class for the 'documentation' app.
sap.ui.define([
	'sap/m/routing/Router',
	'sap/ui/core/routing/History',
	'sap/ui/thirdparty/hasher'
], function(Router, History, Hasher) {
	"use strict";

	// We need to set the global hasher instance to not encode URL's. This is specific for the SDK
	// and it enables the application to handle module URL's which need to be encoded.
	Hasher.raw = true;

	return Router.extend("sap.ui.documentation.sdk.util.DocumentationRouter", {

		constructor : function() {
			Router.prototype.constructor.apply(this, arguments);

			this.getRoute("entitySamplesLegacyRoute").attachPatternMatched(this._onEntityOldRouteMatched, this);
			this.getRoute("entityAboutLegacyRoute").attachPatternMatched(this._onEntityOldRouteMatched, this);
			this.getRoute("entityPropertiesLegacyRoute").attachPatternMatched({entityType: "controlProperties"}, this._forwardToAPIRef, this);
			this.getRoute("entityAggregationsLegacyRoute").attachPatternMatched({entityType: "aggregations"}, this._forwardToAPIRef, this);
			this.getRoute("entityAssociationsLegacyRoute").attachPatternMatched({entityType: "associations"}, this._forwardToAPIRef, this);
			this.getRoute("entityEventsLegacyRoute").attachPatternMatched({entityType: "events"}, this._forwardToAPIRef, this);
			this.getRoute("entityMethodsLegacyRoute").attachPatternMatched({entityType: "methods"}, this._forwardToAPIRef, this);

			this.getRoute("topicIdLegacyRoute").attachPatternMatched(this._onTopicOldRouteMatched, this);
			this.getRoute("apiIdLegacyRoute").attachPatternMatched(this._onApiOldRouteMatched, this);
		},

		_onEntityOldRouteMatched: function(oEvent) {
			this.navTo("entity", {
				id: oEvent.getParameter("arguments").id
			});
		},

		_forwardToAPIRef: function(oEvent, oData) {
			oData || (oData = {});
			oData['id'] = oEvent.getParameter("arguments").id;
			this.navTo("apiId", oData);
		},

		_onTopicOldRouteMatched: function(oEvent) {
			var sId = oEvent.getParameter("arguments").id;
			this.getView("sap.ui.documentation.sdk.view.App", "XML", "app").loaded().then(function(oView) {
				oView.getController()._onTopicOldRouteMatched(sId);
			});
		},

		_onApiOldRouteMatched: function(oEvent) {
			var sId = oEvent.getParameter("arguments").id;
			this.getView("sap.ui.documentation.sdk.view.App", "XML", "app").loaded().then(function(oView) {
				oView.getController()._onApiOldRouteMatched(sId);
			});
		},

		/**
		 * mobile nav back handling
		 */
		myNavBack: function (sRoute, oData) {
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				var bReplace = true; // otherwise we go backwards with a forward history
				this.navTo(sRoute, oData, bReplace);
			}
		},

		/**
		 * a nav to method that does not write hashes but load the views properly
		 */
		myNavToWithoutHash: function (viewName, viewType, master, data) {
			var oComponent = this._getOwnerComponent(),
				oRootView = oComponent.byId(oComponent.getManifestEntry("/sap.ui5/rootView").id),
				oApp = oRootView.byId("splitApp"),
				oView = this.getView(viewName, viewType);

			oApp.addPage(oView, master);
			oApp.toDetail(oView.getId(), "show", data);
		},

		/**
		 * Getter for the owner component
		 *
		 * <b>Note:</b> In the router we have no getter to retrieve the owner component. This should be improved in the
		 * future.
		 * @returns {sap.ui.core.UIComponent} Owner component of the router instance
		 * @private
		 */
		_getOwnerComponent: function () {
			return this._oOwner; // Accessing owner component from reference on the instance object.
		}
	});

});

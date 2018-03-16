/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils"
], function (Controller, UIComponent, Filter, FilterOperator, LRepConnector, DataUtils) {
	"use strict";

	/**
	 * Controller for displaying the master page when selecting a layer in Layered Repository.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.controller.LayerContentMaster
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.45
	 */
	return Controller.extend("sap.ui.fl.support.apps.contentbrowser.controller.LayerContentMaster", {

		sNamespace: "",
		sLayer: "",
		oDataUtils : DataUtils,

		/**
		 * Initialize function;
		 * Handles data binding and route matching.
		 * @public
		 */
		onInit: function () {
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("LayerContentMaster").attachMatched(this._onRouteMatched, this);
		},

		/**
		 * Handler if a route was matched;
		 * Checks if the matched route is current route and then requests content from Layered Repository.
		 * @param {Object} oRouteMatch - route object specified in the router which was matched via regexp
		 * @private
		 */
		_onRouteMatched: function (oRouteMatch) {
			var that = this;
			var mRouteArguments = oRouteMatch.getParameter("arguments");
			this.sLayer = mRouteArguments.layer;
			this.sNamespace = mRouteArguments.namespace || "";
			var oPage = this.getView().getContent()[0];
			oPage.setBusy(true);
			that.sNamespace = decodeURIComponent(that.sNamespace);
			oPage.setTitle(this._shortenNamespace());

			LRepConnector.getContent(that.sLayer, that.sNamespace).then(
				that._onContentReceived.bind(that, oPage),
				function(){
					oPage.setBusy(false);
				}).then(function () {
					LRepConnector.requestPending = false;
				});
		},

		/**
		 * Handler if content data was received;
		 * Sets the received data to the current content model.
		 * @param {Object} oPage
		 * @param {Object} oData - data which is received from <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onContentReceived: function (oPage, oData) {
			var oContentModel = this.getView().getModel("content");
			oContentModel.setData(oData);
			oPage.setBusy(false);
			this.filterListByQuery("");
			this.byId("search").setValue("");
		},

		/**
		 * Searches for a specific namespace inside layer.
		 * @param {Object} oEvent - "liveChange" event of search field
		 * @public
		 */
		onSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			this.filterListByQuery(sQuery);
		},

		/**
		 * Filters the binding of the master list;
		 * This function is also called once navigation to the page to clear the filters or input search entry.
		 * @param {String} sQuery - entered string within the search field
		 * @public
		 */
		filterListByQuery: function (sQuery) {
			// add filter for search
			var aFilters = [];
			if (sQuery && sQuery.length > 0) {
				aFilters = new Filter({
					filters: [
						new Filter("name", FilterOperator.Contains, sQuery),
						new Filter("fileType", FilterOperator.Contains, sQuery)
					],
					and: false
				});
			}

			// update list binding
			var oList = this.byId("masterComponentsList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "content");
		},

		/**
		 * Handles the selection of a layer entry in the master page;
		 * Gathers the selected namespace and the current layer, then navigates to the target.
		 * @param {Object} oEvent - press event of master components list
		 * @public
		 */
		onContentSelected: function (oEvent) {
			var sSource = oEvent.getSource();
			var sContentBindingPath = sSource.getBindingContextPath().substring(1);
			var sContentModelData = this.getView().getModel("content").getData();
			var sContent = sContentModelData[sContentBindingPath];
			var sContentName = sContent.name;
			var sContentFileType = sContentModelData[sContentBindingPath].fileType;
			var oRouter = UIComponent.getRouterFor(this);

			this.sNamespace = (this.sNamespace ? this.sNamespace : '/');

				if (sContentFileType) {
					// show details to a file
					var mRouteParameters = {
						"layer": this.sLayer,
						"namespace": encodeURIComponent(this.sNamespace),
						"fileName": sContentName,
						"fileType": sContentFileType
					};
					oRouter.navTo("ContentDetails", mRouteParameters);
				} else {
					// navigation to a namespace
					this.sNamespace += sContentName + '/';
					oRouter.navTo("LayerContentMaster", {"layer": this.sLayer, "namespace": encodeURIComponent(this.sNamespace)});
				}
		},

		/**
		 * Handles the back navigation in the master list;
		 * Calculates the parent namespace, then navigates to the target.
		 * @public
		 */
		navBack: function () {
			var oRouter = UIComponent.getRouterFor(this);
			if (!this.sNamespace || this.sNamespace === "/") {
				oRouter.navTo("Layers");
			} else {
				var sSplittedNamespace = this.sNamespace.split("/");
				sSplittedNamespace.splice(-2, 1);
				var sTargetNamespace = sSplittedNamespace.join("/");
				oRouter.navTo("LayerContentMaster", {"layer": this.sLayer, "namespace": encodeURIComponent(sTargetNamespace)}, true);
			}
		},

		/**
		 * Formatter to shorten namespaces with multiple hierarchies;
		 * If the hierarchy has more than two levels only the first and last levels are shown.
		 * @returns {String} - shortened namespace for display
		 * @private
		 */
		_shortenNamespace: function () {
			if (!this.sNamespace || this.sNamespace === '/') {
				return "[" + this.sLayer + "] /";
			}

			var aSplittedNamespace = this.sNamespace.split('/');
			var sNamespaceDepth = aSplittedNamespace.length;
			if (sNamespaceDepth > 2) {
				return "[" + this.sLayer + "] .../" + aSplittedNamespace[sNamespaceDepth - 2];
			}

			return "[" + this.sLayer + "] /" + this.sNamespace[sNamespaceDepth - 1];
		},

		/**
		 * Handler for displaying errors;
		 * Calls the "ErrorUtils" helper class for error handling.
		 * @param oEvent - press event on the error button
		 * @public
		 */
		handleMessagePopoverPress: function (oEvent) {
			var sSource = oEvent.getSource();
			sap.ui.require(["sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils"], function (ErrorUtils) {
				ErrorUtils.handleMessagePopoverPress(sSource);
			});
		}
	});
});

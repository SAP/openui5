/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/Device",
		"sap/ui/documentation/sdk/controller/MasterTreeBaseController",
		"sap/m/library",
		"sap/base/Log",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/model/json/JSONModel"
	], function (
		Device,
		MasterTreeBaseController,
		mobileLibrary,
		Log,
		Filter,
		FilterOperator,
		APIInfo,
		JSONModel
	) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		return MasterTreeBaseController.extend("sap.ui.documentation.sdk.controller.ApiMaster", {

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				// Routing
				this._oRouter = this.getRouter();
				this._oRouter.getRoute("api").attachPatternMatched(this._onMatched, this);
				this._oRouter.getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);
				this._oRouter.getRoute("deprecated").attachPatternMatched(this._onTopicMatched, this);
				this._oRouter.getRoute("experimental").attachPatternMatched(this._onTopicMatched, this);
				this._oRouter.getRoute("since").attachPatternMatched(this._onTopicMatched, this);

				// Create the model
				this._oTreeModel = new JSONModel();
				this._oTreeModel.setSizeLimit(10000);
				this.setModel(this._oTreeModel, "treeData");

				// By default we don't show deprecated symbols in the tree
				this._bIncludeDeprecated = false;

				// Cache references
				this._oTree = this.byId("tree");

				// Load model data
				this._oDataLoadedPromise = this.getOwnerComponent().loadVersionInfo()
					.then(APIInfo.getIndexJsonPromise)
					.then(this._bindTreeModel.bind(this))
					.then(function () {
						this._initTreeUtil("name", "nodes");
					}.bind(this));
			},

			_bindTreeModel : function (aTreeContent) {
				// Inject Deprecated, Experimental and Since links
				if (aTreeContent.length > 0) {
					aTreeContent.push({
						isSelected: false,
						name : "experimental",
						displayName : "Experimental APIs",
						bIsDeprecated: false
					}, {
						isSelected: false,
						name : "deprecated",
						displayName : "Deprecated APIs",
						bIsDeprecated: false
					}, {
						isSelected: false,
						name : "since",
						displayName : "Index by Version",
						bIsDeprecated: false
					});
				}

				this._oTreeModel.setData(aTreeContent, false);
			},

			onBeforeRendering : function () {
				// Apply default filters
				this.buildAndApplyFilters();
			},

			/**
			 * Selects a deprecated symbol in the tree and switches the filter to displaying deprecated symbols
			 * @param {string} sTopicId the name of the deprecated symbol to be selected
			 */
			selectDeprecatedSymbol: function (sTopicId) {
				this._bIncludeDeprecated = true; // Switch internal flag
				this.byId("includeDeprecated").setSelected(true); // Update checkbox UI
				this.buildAndApplyFilters(); // Apply filters
				this._expandTreeToNode(sTopicId, this.getModel("treeData")); // Select the searched entity
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Handles "apiId" routing
			 * @function
			 * @param {sap.ui.base.Event} event pattern match event in route 'apiId'
			 * @private
			 */
			_onTopicMatched: function (event) {
				var sTopicId = decodeURIComponent(event.getParameter("arguments").id) || event.getParameter("name");

				try {
					this.showMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}

				// Expand tree node when the data is loaded
				this._oDataLoadedPromise.then(function () {
					this._expandTreeToNode(sTopicId, this._oTreeModel);
				}.bind(this));
			},

			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent(),
					selectedItem = this._oTree.getSelectedItem();

				// We reset selected item
				selectedItem && selectedItem.setSelected(false);

				// Expand only 'sap' namespace
				this._oDataLoadedPromise.then(function () {
					this._oTree.collapseAll().expand(0);
				}.bind(this));

				splitApp.setMode(SplitAppMode.ShowHideMode);

				if (Device.system.desktop) {
					setTimeout(function () {
						this.getView().byId("searchField").getFocusDomRef().focus();
					}.bind(this), 0);
				}
			},

			onNodeSelect : function (oEvent) {
				var sTarget = oEvent.getParameter("listItem").getTarget();
				this._oRouter.navTo("apiId", {id : encodeURIComponent(sTarget)}, false);
			},

			/**
			 * @override
			 */
			buildAndApplyFilters: function () {
				var aFilters = [];

				if (!this._bIncludeDeprecated) {
					aFilters.push(new Filter({
						path: "bIsDeprecated",
						operator: FilterOperator.EQ,
						value1: false
					}));
				}

				if (this._sFilter) {
					aFilters.push(new Filter({
						and: false,
						filters: [
							new Filter({
								path: "name",
								operator: FilterOperator.Contains,
								value1: this._sFilter
							}),
							new Filter({
								path: "name",
								operator: FilterOperator.Contains,
								value1: this._sFilter.replace(/\s/g, '')
							})
						]
					}));
				}

				this._oTree.getBinding("items").filter(new Filter({
					and: true,
					filters: aFilters
				}));

				// Should the tree items be expanded or collapsed - in this case we take into account only the
				// filter string
				return !!this._sFilter;
			},

			/**
			 * Handler for the Checkbox
			 * @param {object} oEvent from the checkbox
			 */
			onIncludeDeprecatedItemsChange: function (oEvent) {
				this._bIncludeDeprecated = oEvent.getParameter("selected"); // Update include deprecated flag
				this.buildAndApplyFilters(); // Update tree
			}
		});
	}
);
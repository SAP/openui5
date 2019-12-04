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
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/Highlighter"
	], function (
		Device,
		MasterTreeBaseController,
		mobileLibrary,
		Log,
		Filter,
		FilterOperator,
		APIInfo,
		JSONModel,
		Highlighter
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
				var oComponent = this.getOwnerComponent();

				// Routing
				this._oRouter = this.getRouter();
				this._oRouter.getRoute("api").attachPatternMatched(this._onMatched, this);
				this._oRouter.getRoute("apiSpecialRoute").attachPatternMatched(this._onTopicMatched, this);
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
				this._oDataLoadedPromise = oComponent.loadVersionInfo()
					.then(function () {
						// Cache allowed members
						this._aAllowedMembers = oComponent.aAllowedMembers;
					}.bind(this))
					.then(APIInfo.getIndexJsonPromise)
					.then(this._bindTreeModel.bind(this))
					.then(function () {
						// Apply default filters
						this.buildAndApplyFilters();

						// Init tree util
						this._initTreeUtil("name", "nodes");
					}.bind(this));
			},

			onAfterRendering: function () {
				if (!this.highlighter) {
					this.highlighter = new Highlighter(this._oTree.getDomRef(), {
						useExternalStyles: false,
						shouldBeObserved: true,
						isCaseSensitive: false
					});
				}
			},

			onExit: function () {
				this.highlighter.destroy();
			},

			_bindTreeModel : function (aTreeContent) {
				// Inject Deprecated, Experimental and Since links
				if (aTreeContent.length > 0) {
					aTreeContent.push({
						isSelected: false,
						name : "experimental",
						displayName : "Experimental APIs",
						bAllContentDeprecated: false,
						visibility: "public"
					}, {
						isSelected: false,
						name : "deprecated",
						displayName : "Deprecated APIs",
						bAllContentDeprecated: false,
						visibility: "public"
					}, {
						isSelected: false,
						name : "since",
						displayName : "Index by Version",
						bAllContentDeprecated: false,
						visibility: "public"
					});
				}

				this._oTreeModel.setData(aTreeContent, false);
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
				var sTopicId = decodeURIComponent(event.getParameter("arguments").id) || event.getParameter("name"),
					oSpecialRouteInfo;

				// Handling for special route
				if (event.getParameter("name") === "apiSpecialRoute") {
					oSpecialRouteInfo = this._oRouter._decodeSpecialRouteArguments(event);
					sTopicId = oSpecialRouteInfo.id;
				}

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
				this._oRouter.navTo("apiId", {
					id : oEvent.getParameter("listItem").getTarget()
				}, false);
			},

			/**
			 * @override
			 */
			onTreeFilter: function () {
				MasterTreeBaseController.prototype.onTreeFilter.apply(this, arguments);

				if (this.highlighter) {
					this.highlighter.highlight(this._sFilter);
				}
				return this;
			},

			/**
			 * @override
			 */
			buildAndApplyFilters: function () {
				var aFilters = [];

				// Visibility filter
				aFilters.push(new Filter({
					path: "visibility",
					test: function (sValue) {
						return this._aAllowedMembers.indexOf(sValue.toLowerCase()) >= 0;
					}.bind(this)
				}));

				if (!this._bIncludeDeprecated) {
					aFilters.push(new Filter({
						path: "bAllContentDeprecated",
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
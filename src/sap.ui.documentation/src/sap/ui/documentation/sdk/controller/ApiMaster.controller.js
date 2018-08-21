/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/Device",
		"sap/ui/documentation/sdk/controller/MasterTreeBaseController",
		"sap/ui/documentation/sdk/model/formatter",
		"sap/m/library",
		"sap/base/Log",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (Device, MasterTreeBaseController, formatter, mobileLibrary, Log, Filter, FilterOperator) {
		"use strict";



		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;



		return MasterTreeBaseController.extend("sap.ui.documentation.sdk.controller.ApiMaster", {

			formatter: formatter,
			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				// By default we don't show deprecated symbols in the tree
				this._bIncludeDeprecated = false;

				var oComponent = this.getOwnerComponent();

				oComponent.loadVersionInfo()
					.then(oComponent.fetchAPIIndex.bind(oComponent))
					.then(function () {
						this._expandTreeToNode(this._topicId, this.getOwnerComponent().getModel("treeData"));
					}.bind(this));

				this._initTreeUtil("name", "nodes");

				this.getRouter().getRoute("api").attachPatternMatched(this._onMatched, this);
				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);
				this.getRouter().getRoute("deprecated").attachPatternMatched(this._onTopicMatched, this);
				this.getRouter().getRoute("experimental").attachPatternMatched(this._onTopicMatched, this);
				this.getRouter().getRoute("since").attachPatternMatched(this._onTopicMatched, this);
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

				try {
					this.showMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}

				this._topicId = formatter.decodeModuleName(event.getParameter("arguments").id) ||
					event.getParameter("name");

				this._expandTreeToNode(this._topicId, this.getOwnerComponent().getModel("treeData"));
			},

			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent(),
					masterTree = this.byId('tree'),
					selectedItem;

				splitApp.setMode(SplitAppMode.ShowHideMode);

				if (masterTree) {
					selectedItem = masterTree.getSelectedItem();
					selectedItem && selectedItem.setSelected(false);
				}

				if (Device.system.desktop) {
					setTimeout(function () {
						this.getView().byId("searchField").getFocusDomRef().focus();
					}.bind(this), 0);
				}
			},

			compareTreeNodes: function (sNode1, sNode2) {
				if (sNode1 === "EXPERIMENTAL") {
					return 1;
				}

				if (sNode2 === "EXPERIMENTAL") {
					return -1;
				}

				if (sNode1 === "DEPRECATED") {
					return 1;
				}

				if (sNode2 === "DEPRECATED") {
					return -1;
				}

				if (sNode1 < sNode2) {
					return -1;
				}

				if (sNode1 > sNode2) {
					return 1;
				}

				if (sNode1 === sNode2) {
					return 0;
				}
			},

			onNodeSelect : function (oEvent) {
				var node = oEvent.getParameter("listItem");
				var apiId = node.getCustomData()[0].getValue();

				if (!apiId) {
					Log.warning("Missing name for entity: " + node.getId() + " - cannot navigate to API ref");
					return;
				}

				this.getRouter().navTo("apiId", {id : formatter.encodeModuleName(apiId)}, false);
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

				this.byId("tree").getBinding("items").filter(new Filter({
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
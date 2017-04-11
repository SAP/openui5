/*!
 * ${copyright}
 */

// This is internal control dedicated for Documentation application usage
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/m/SearchField', 'sap/m/Button', 'sap/m/Toolbar', 'sap/m/ToolbarSpacer'],
	function(jQuery, Control, ItemNavigation, Filter, FilterOperator, SearchField, Button, Toolbar, ToolbarSpacer) {
		"use strict";

		var SimpleTree = Control.extend("sap.ui.documentation.controls.SimpleTree", { metadata : {
			library : "sap.ui.documentation.controls",

			properties : {

				title : {type : "string", defaultValue : null},

				width : {type : "sap.ui.core.CSSSize", defaultValue : 'auto'},

				height : {type : "sap.ui.core.CSSSize", defaultValue : 'auto'},

				showFilter : {type : "boolean", defaultValue : true},

				filterAttribute : {type : "string", defaultValue : 'text'}
			},

			defaultAggregation : "nodes",

			aggregations : {
				nodes : {type : "sap.ui.documentation.controls.SimpleTreeNode", multiple : true, singularName : "node", bindable : "bindable"},

				_searchField : {type : "sap.m.SearchField", multiple : false, visibility : "hidden"},

				_expandAllButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

				_collapseAllButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

				_headerToolbar: {type : "sap.m.Toolbar", multiple : false, visibility : "hidden"}
			}

		}});

		//***********************************************************************************
		//* PUBLIC METHODS
		//***********************************************************************************
		SimpleTree.prototype.init = function() {
			this._initializeSearchField();
			this._initializeExpandAllButton();
			this._initializeCollapseAllButton();
			this._initializeHeaderToolbar();
			this._createNodesFocusHandling();
		};

		SimpleTree.prototype.expandAll = function() {
			var aChildNodes = this.getNodes();
			for (var i = 0; i < aChildNodes.length; i++) {
				aChildNodes[i].expand(true);
			}
		};

		SimpleTree.prototype.collapseAll = function() {
			var aChildNodes = this.getNodes();
			for (var i = 0; i < aChildNodes.length; i++) {
				aChildNodes[i].collapse(true);
			}
		};

		SimpleTree.prototype.isTreeBinding = function(sName) {
			return (sName == "nodes");
		};

		SimpleTree.prototype.onAfterRendering = function() {
			var selectedNode = jQuery(this.getDomRef()).find('.sapDkSimpleTreeNodeSelected'),
				nodeIndex = this._itemNavigation.getItemDomRefs().indexOf(selectedNode.parent()[0]);
			this._initializeNodesFocusHandling();

			this.sSelectedNodeId = selectedNode.parent().attr('id');
			this._itemNavigation.setSelectedIndex(nodeIndex);
			selectedNode.focus();
		};

		SimpleTree.prototype.exit = function () {
			this._destroyNodesFocusHandling();
		};

		//***********************************************************************************
		//* PRIVATE METHODS
		//***********************************************************************************

		SimpleTree.prototype._initializeSearchField = function() {
			var that = this;
			var oSearchField = this.getAggregation("_searchField");
			oSearchField = new SearchField({
				placeholder: "Filter",
				width: "100%",
				liveChange : function(oEvent) {
					_filterTreeContent.call(that, oEvent.getParameter("newValue"));
				}
			});
			this.setAggregation("_searchField", oSearchField, true);

			function _filterTreeContent(sFilterArgument) {
				var aFilters = [];
				var oNameFilter = new Filter(this.getFilterAttribute(), FilterOperator.Contains, sFilterArgument);
				aFilters.push(oNameFilter);
				var oBinding = this.getBinding("nodes");
				oBinding.filter(aFilters);
				this.expandAll();
			}
		};

		SimpleTree.prototype._initializeExpandAllButton = function() {
			var that = this,
				oExpandAllButton = this.getAggregation("_expandAllButton");
			oExpandAllButton = new Button({
				icon: "sap-icon://expand-group",
				press: function (oEvent) {
					that.expandAll();
				}
			});
			this.setAggregation("_expandAllButton", oExpandAllButton, true);
		};

		SimpleTree.prototype._initializeCollapseAllButton = function() {
			var that = this,
				oCollapseAllButton = this.getAggregation("_collapseAllButton");
			oCollapseAllButton = new Button({
				icon: "sap-icon://collapse-group",
				press: function (oEvent) {
					that.collapseAll();
				}
			});
			this.setAggregation("_collapseAllButton", oCollapseAllButton, true);
		};

		SimpleTree.prototype._initializeHeaderToolbar = function() {
			var oHeaderToolbar = this.getAggregation("_headerToolbar");
			oHeaderToolbar = new Toolbar({
				content: [
						new ToolbarSpacer(),
						this.getAggregation("_searchField"),
						new ToolbarSpacer(),
						this.getAggregation("_expandAllButton"),
						new ToolbarSpacer(),
						this.getAggregation("_collapseAllButton")
					]
			});
			oHeaderToolbar.addStyleClass("sapMIBar-CTX");
			oHeaderToolbar.addStyleClass("sapMSubHeader-CTX");
			this.setAggregation("_headerToolbar", oHeaderToolbar, true);
		};

		SimpleTree.prototype._createNodesFocusHandling = function() {
			this._itemNavigation = new ItemNavigation();
			this._itemNavigation.setCycling(false);
			this.addEventDelegate(this._itemNavigation);
		};

		SimpleTree.prototype._initializeNodesFocusHandling = function() {
			this._itemNavigation.setRootDomRef(this.$().children("ul")[0]);
			this._itemNavigation.setItemDomRefs(this._getDomRefs());
		};

		SimpleTree.prototype._destroyNodesFocusHandling = function() {
			if (this._itemNavigation) {
				this._itemNavigation.destroy();
			}
		};

		//***********************************************************************************
		//* HELPER METHODS - FOCUS MANAGEMENT
		//***********************************************************************************

		SimpleTree.prototype._getDomRefs = function() {
			var aDomRefs = [];
			var aNodes = this.getNodes();
			for (var i = 0; i < aNodes.length; i++) {
				aNodes[i]._getDomRefs(aDomRefs);
			}
			return aDomRefs;
		};


		return SimpleTree;
	});

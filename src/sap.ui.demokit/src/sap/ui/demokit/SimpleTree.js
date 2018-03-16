/*!
 * ${copyright}
 */

// This is internal control dedicated for Demo Kit application usage
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Control',
    'sap/ui/core/delegate/ItemNavigation',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/SearchField',
    "./SimpleTreeRenderer"
],
	function(
	    jQuery,
		Control,
		ItemNavigation,
		Filter,
		FilterOperator,
		SearchField,
		SimpleTreeRenderer
	) {
		"use strict";

		var SimpleTree = Control.extend("sap.ui.demokit.SimpleTree", { metadata : {
			library : "sap.ui.demokit",

			properties : {

				title : {type : "string", defaultValue : null},

				width : {type : "sap.ui.core.CSSSize", defaultValue : 'auto'},

				height : {type : "sap.ui.core.CSSSize", defaultValue : 'auto'},

				showFilter : {type : "boolean", defaultValue : true},

				filterAttribute : {type : "string", defaultValue : 'text'}
			},

			defaultAggregation : "nodes",

			aggregations : {
				nodes : {type : "sap.ui.demokit.SimpleTreeNode", multiple : true, singularName : "node", bindable : "bindable"},

				_searchField : {type : "sap.m.SearchField", multiple : false, visibility : "hidden"}
			}

		}});

		//***********************************************************************************
		//* PUBLIC METHODS
		//***********************************************************************************
		SimpleTree.prototype.init = function() {
			this._initializeSearchField();
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
				selectOnFocus: false,
				showSearchButton : false,
				liveChange : function(oEvent) {
					_filterTreeContent.call(that, oEvent.getParameter("newValue"));
				}
			});
			oSearchField.addStyleClass("sapDkSimpleTreeSearchField");
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

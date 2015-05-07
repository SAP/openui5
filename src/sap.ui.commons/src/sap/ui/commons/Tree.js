/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Tree.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";



	/**
	 * Constructor for a new Tree.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Simple tree to display item in a hierarchical way
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.commons.Tree
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Tree = Control.extend("sap.ui.commons.Tree", /** @lends sap.ui.commons.Tree.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * Tree title
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Tree width
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : 'auto'},

			/**
			 * Tree height
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : 'auto'},

			/**
			 * Tree Header is display. If false, the tree will be in a transparent mode
			 */
			showHeader : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Show Header icons (e.g. Expand/Collapse all). Only consider if showHeader is true
			 */
			showHeaderIcons : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Display horizontal scrollbar. If false, the overflow content will be hidden
			 */
			showHorizontalScrollbar : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Minimal width for the Tree. Can be useful when, for example, the width is specified in percentage, to avoid the tree to become too narrow when container is resize
			 */
			minWidth : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * Selection mode of the Tree.
			 */
			selectionMode : {type : "sap.ui.commons.TreeSelectionMode", group : "Behavior", defaultValue : sap.ui.commons.TreeSelectionMode.Legacy}
		},
		defaultAggregation : "nodes",
		aggregations : {

			/**
			 * First level nodes
			 */
			nodes : {type : "sap.ui.commons.TreeNode", multiple : true, singularName : "node", bindable : "bindable"}
		},
		events : {

			/**
			 * Event is fired when a tree node is selected.
			 */
			select : {allowPreventDefault : true,
				parameters : {

					/**
					 * The node which has been selected.
					 */
					node : {type : "sap.ui.commons.TreeNode"},

					/**
					 * The binding context of the selected node.
					 */
					nodeContext : {type : "object"}
				}
			},

			/**
			 * fired when the selection of the tree has been changed
			 */
			selectionChange : {
				parameters : {

					/**
					 * The nodes which has been selected.
					 */
					nodes : {type : "sap.ui.commons.TreeNode[]"},

					/**
					 * The binding context of the selected nodes.
					 */
					nodeContexts : {type : "object[]"}
				}
			}
		}
	}});


	Tree.prototype.resizeListenerId;

	Tree.prototype.init = function(){
		this.bAllCollapsed = false;
		this.allowTextSelection(false);

		this.iOldScrollTop = null;

		this.mSelectedNodes = {};
		this.mSelectedContexts = {};
		this.aLeadSelection = null;

		//Create Buttons for Header

		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
		this.oCollapseAllButton = new sap.ui.commons.Button(this.getId() + "-CollapseAll", { icon: this.getIconPrefix() + "CollapseAll.png", tooltip: oResourceBundle.getText("TREE_COLLAPSE_ALL"), lite: true });
		this.oExpandAllButton	= new sap.ui.commons.Button(this.getId() + "-ExpandAll", { icon: this.getIconPrefix() + "ExpandAll.png", tooltip: oResourceBundle.getText("TREE_EXPAND_ALL"), lite: true });
		this.oCollapseAllButton.attachPress(this.onCollapseAll,this);
		this.oExpandAllButton.attachPress(this.onExpandAll,this);
		this.oCollapseAllButton.addStyleClass("sapUiTreeCol");
		this.oExpandAllButton.addStyleClass("sapUiTreeExp");
	};

	/**
	 * Does all the cleanup when the Tree is to be destroyed.
	 * Called from the element's destroy() method.
	 * @private
	 */
	Tree.prototype.exit = function(){
		if ( this.oCollapseAllButton ) {
			this.oCollapseAllButton.destroy();
			this.oCollapseAllButton = null;
		}
		if ( this.oExpandAllButton ) {
			this.oExpandAllButton.destroy();
			this.oExpandAllButton = null;
		}
	};

	// Enumeration for different types of selection in the tree
	Tree.SelectionType = {
		Select: "Select",
		Toggle: "Toggle",
		Range: "Range"
	};
	/***********************************************************************************
	* EVENTS HANDLING
	***********************************************************************************/

	/** Handler for "Theme Changed" event.
	 * @private
	 */
	Tree.prototype.onThemeChanged = function(){
		if (this.oCollapseAllButton && this.oExpandAllButton) {
			this.oCollapseAllButton.setIcon(this.getIconPrefix() + "CollapseAll.png");
			this.oExpandAllButton.setIcon(this.getIconPrefix() + "ExpandAll.png");
		}
	};

	/** Handler for "Expand All" button.
	 * @private
	 */
	Tree.prototype.onExpandAll = function(){
		this.expandAll();
	};

	/**Handler for "Collapse All" button.
	 * @private
	 */
	Tree.prototype.onCollapseAll = function(){
		this.collapseAll();
	};

	/*"*********************************************************************************
	* PUBLIC METHODS
	***********************************************************************************/

	/**
	 * Expands all nodes in the tree
	 *
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Tree.prototype.expandAll = function(){
		var aNodes = this._getNodes();
		for (var i = 0;i < aNodes.length;i++) {
			aNodes[i].expand(true);
		}
	};


	/**
	 * Collapses all nodes in the tree
	 *
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Tree.prototype.collapseAll = function(){
		var aNodes = this._getNodes();
		for (var i = 0;i < aNodes.length;i++) {
			aNodes[i].collapse(true);
		}
	};

	/***********************************************************************************
	* KEYBOARD NAVIGATION
	***********************************************************************************/
	/**
	* DOWN key behavior
	* Opens the section or activates the UI element on DOWN key
	* @private
	* @param oEvent Browser event
	*/
	Tree.prototype.onsapdown = function(oEvent){
		this.moveFocus(false);
		oEvent.preventDefault();
	};

	/**
	* UP key behavior
	* Opens the section or activates the UI element on UP key
	* @private
	* @param oEvent Browser event
	*/
	Tree.prototype.onsapup = function(oEvent){
		this.moveFocus(true);
		oEvent.preventDefault();
	};

	/**
	 * The general HOME key event of the tree
	 * @private
	 * @param {event} oEvent The saphome event object
	 */
	Tree.prototype.onsaphome = function(oEvent) {
		this.placeFocus(this.getFirstSibling(oEvent.target));
		oEvent.preventDefault();
	};

	/**
	 * The general CTRL+HOME key event of the tree
	 * @private
	 * @param {event} oEvent The saphome event object
	 */
	Tree.prototype.onsaphomemodifiers = function(oEvent) {
		this.placeFocus(this.getFirst());
		oEvent.preventDefault();
	};

	/**
	 * The general END key event of the tree
	 * @private
	 * @param {event} oEvent The sapend event object
	 */
	Tree.prototype.onsapend = function(oEvent) {
		this.placeFocus(this.getLastSibling(oEvent.target));
		oEvent.preventDefault();
	};

	/**
	 * The general CTRL+END key event of the tree
	 * @private
	 * @param {event} oEvent The sapend event object
	 */
	Tree.prototype.onsapendmodifiers = function(oEvent) {
		this.placeFocus(this.getLast());
		oEvent.preventDefault();
	};

	/**
	 * The numpad STAR(*) key event of the tree
	 * @private
	 * @param {event} oEvent The sapcollapseall event object
	 */
	Tree.prototype.onsapcollapseall = function(oEvent) {

		if (this.bAllCollapsed ) {
			this.expandAll();
		} else {
			this.collapseAll();
		}

		this.bAllCollapsed = !this.bAllCollapsed;
	};

	/***********************************************************************************
	* HELPER METHODS - DOM NAVIGATION
	***********************************************************************************/

	/**
	 * Determine the icon prefix for the embedded button icons
	 * @private
	 */
	Tree.prototype.getIconPrefix = function() {
		var sIconPrefix = "themes/" + sap.ui.getCore().getConfiguration().getTheme() + "/";

		if (!sap.ui.getCore().getConfiguration().getRTL()) {
			sIconPrefix		+= "img/tree/";
		} else {
			sIconPrefix		+= "img-RTL/tree/";
		}
		return sap.ui.resource("sap.ui.commons", sIconPrefix);
	};

	/**Returns the first Sibling tree node based on DOM Tree node provided
	 * @param oDomNode The DOM Tree node from which calculate the first sibling
	 * @returns The first sibling tree node
	 * @private
	*/
	Tree.prototype.getFirstSibling = function(oDomNode) {
		var aDomFirstSiblingNode	= jQuery(oDomNode).siblings(".sapUiTreeNode:visible").first();

		if (aDomFirstSiblingNode.length) {
			return aDomFirstSiblingNode[0];
		}
		return null;
	};

	/**Returns the last Sibling tree node based on DOM Tree node provided
	 * @param oDomNode The DOM Tree node from which calculate the last sibling
	 * @returns The last sibling tree node
	 * @private
	*/
	Tree.prototype.getLastSibling = function(oDomNode) {
		var aDomLastSiblingNode	= jQuery(oDomNode).siblings(".sapUiTreeNode:visible").last();

		if (aDomLastSiblingNode.length) {
			return aDomLastSiblingNode[0];
		}
		return null;
	};

	/**Returns the first tree node of the tree. Children of collapsed nodes (hidden) are not considered.
	 * @returns The first tree node
	 * @private
	*/
	Tree.prototype.getFirst = function() {
		var aDomFirstNode		= this.$().find(".sapUiTreeNode:visible").first();

		if (aDomFirstNode.length) {
			return aDomFirstNode[0];
		}
		return null;
	};

	/**Returns the last tree node of the tree. Children of collapsed nodes (hidden) are not considered.
	 * @returns The last tree node
	 * @private
	*/
	Tree.prototype.getLast = function() {
		var aDomLastNode		= this.$().find(".sapUiTreeNode:visible").last();

		if (aDomLastNode.length) {
			return aDomLastNode[0];
		}
		return null;

	};

	/***********************************************************************************
	* HELPER METHODS - FOCUS MANAGEMENT
	***********************************************************************************/

	/**
	 * Move the focus by one position, either UP or DOWN depending of "bMoveUp"
	 * @param bMoveUp When true the focus is move up. Otherwise, it's moved down
	 * @private
	 */
	Tree.prototype.moveFocus = function(bMoveUp){
	   var afocusedNodeDom	= jQuery(".sapUiTreeNode:focus");
	   if (afocusedNodeDom.length) {

		   var oCurrNode = sap.ui.getCore().getControl(afocusedNodeDom[0].id);
		   var aDomAllNodes = this.$().find(".sapUiTreeNode:visible");
		   var currIndex	= aDomAllNodes.index(afocusedNodeDom[0]);

		   var nextIndex = currIndex;
		   if (bMoveUp) {
			   nextIndex--;
		   } else {
			   nextIndex++;
		   }

		   if (nextIndex >= 0 && nextIndex < aDomAllNodes.length) {
				var oDomNextNode	= aDomAllNodes.eq( nextIndex );
				var oNextNode = sap.ui.getCore().getControl(oDomNextNode[0].id);
				oCurrNode.blur();
				oNextNode.focus();
		   }
		}

	};

	/**Adjusts the focus after a node is collapsed. This is necessary as the currently focused node can then be hidden,
	 * leading the tree not being focusable anymore.
	 *
	 * When the focusable is being hid by the collapsing of its parent, the focus is then set on this parent.
	 *
	 * @private
	 */
	Tree.prototype.adjustFocus = function(){

		var oFocusableNode = this.$().find('.sapUiTreeNode[tabIndex="0"]');

		if (!oFocusableNode.is(':visible')) {


			var aDomAllNodes		= this.$().find(".sapUiTreeNode");
			var focusIndex			= aDomAllNodes.index(oFocusableNode[0]);
			var aDomPrecedingNodes	= aDomAllNodes.filter(":lt(" + focusIndex + ")");
			var aDomVisiblePrecedingNodes = aDomPrecedingNodes.filter(":visible");
			var oNewFocusNode		= aDomVisiblePrecedingNodes[aDomVisiblePrecedingNodes.length - 1];

			if (oNewFocusNode) {
				oNewFocusNode.setAttribute("tabindex", "0");

				if ( jQuery(".sapUiTreeNode:focus").is(":not(:visible)")) {
					oNewFocusNode.focus();
				}
			}

		}

	};

	/**Places the focus on the node corresponding to given DOM Tree Node
	 * @param oDomTargetNode The DOM Tree Node corresponding to the node to focus
	 * @private
	 */
	Tree.prototype.placeFocus = function(oDomTargetNode){

		if (!oDomTargetNode) {
			return; //No Target node provided!
		}

		var oDomfocusedNode	= this.$().find(".sapUiTreeNode[tabIndex='0']");
		if (oDomfocusedNode.length) {
			oDomfocusedNode[0].setAttribute("tabindex", "-1");
		}

		oDomTargetNode.setAttribute("tabindex", "0");
		var oTargetNode = sap.ui.getCore().getControl(oDomTargetNode.id);
		oTargetNode.focus();
	};

	/***********************************************************************************
	* HELPER METHODS - SELECTION MANAGEMENT
	***********************************************************************************/
	/**Adjusts the selection, when expanding, by re-selecting a children node when the expanded node was
	   selected only to reprensented the selection of a children node
	 * @param oExpandingDomNode The Node being expanded
	 * @private
	 */
	Tree.prototype.adjustSelectionOnExpanding = function(oExpandingDomNode) {

		var $Tree = this.$(),
			$ExpandingDomNode = jQuery(oExpandingDomNode),
			$DomSelectedNode,
			$DomParent;

		//Current node is a fake selection, remove it. A child will be either another fake selection or an actual one.
		if ($ExpandingDomNode.hasClass("sapUiTreeNodeSelectedParent")) {
			$ExpandingDomNode.removeClass("sapUiTreeNodeSelectedParent");
		}

		//If the actual selection now visible, remove all fake ones
		var $DomActualSelection = $Tree.find(".sapUiTreeNodeSelected:visible");
		if ($DomActualSelection.length) {
			$Tree.find(".sapUiTreeNodeSelectedParent").removeClass("sapUiTreeNodeSelectedParent");
		} else {
			$DomSelectedNode = $Tree.find(".sapUiTreeNodeSelected");

			//Find first visible parent node
			$DomParent = $DomSelectedNode.parent(".sapUiTreeChildrenNodes").prev(".sapUiTreeNode");

			while ($DomParent.length && !$DomParent.is(":visible")) {
				$DomParent = $DomParent.parent(".sapUiTreeChildrenNodes").prev(".sapUiTreeNode");
			}
			$DomParent.addClass("sapUiTreeNodeSelectedParent");
		}
	};

	/**Adjusts the selection, when collapsing, selecting a parent when the actual selected node is
	 * not visible.
	 * @param oDomCollapsingNode The Node being expanded
	 * @private
	 */
	Tree.prototype.adjustSelectionOnCollapsing = function(oDomCollapsingNode){
		var that = this;
		if (this.getSelectionMode() != sap.ui.commons.TreeSelectionMode.Multi) {
			var $DomCollapsingNode = jQuery(oDomCollapsingNode),
			sChildrenId = "#" + $DomCollapsingNode.attr("id") + "-children",
			$DomActualSelSubNode = $DomCollapsingNode.siblings(sChildrenId).find(".sapUiTreeNodeSelected"),
			$DomParentSelSubNode = $DomCollapsingNode.siblings(sChildrenId).find(".sapUiTreeNodeSelectedParent");

			if ($DomActualSelSubNode.length || $DomParentSelSubNode.length) {
				$DomCollapsingNode.addClass("sapUiTreeNodeSelectedParent");

				if ($DomParentSelSubNode.length) {
					$DomParentSelSubNode.removeClass("sapUiTreeNodeSelectedParent");
				}
			}
		} else {
			var $DomCollapsingNode = jQuery(oDomCollapsingNode),
			sChildrenId = "#" + $DomCollapsingNode.attr("id") + "-children",
			$DomActualSelSubNode = $DomCollapsingNode.siblings(sChildrenId).find(".sapUiTreeNodeSelected");
			var aSelNode = $DomActualSelSubNode.control();
			if (aSelNode) {
				if (jQuery.isEmptyObject(aSelNode) == false) {
					jQuery.each(aSelNode, function(sId, oNode){
						that._delMultiSelection(oNode);
					});
				}
			}
		}
	};

	/**
	 * override this method on Element.js and return true if tree binding
	 * @private
	 */
	Tree.prototype.isTreeBinding = function(sName) {
		return (sName == "nodes");
	};

	/**
	 * override element updateAggregation method with this one and update the tree node bindings
	 * @private
	 */
	Tree.prototype.updateNodes = function(){
		var oNode,
			that = this;
		this.updateAggregation("nodes");
		jQuery.each(this.mSelectedContexts, function(sId, oContext) {
			oNode = that.getNodeByContext(oContext);
			if (oNode) {
				oNode.setIsSelected(true);
			}
		});
	};
	
	/**
	 * Determine the binding context of the given node (dependent on the model name used
	 * for the nodes binding)
	 * 
	 * @param {sap.ui.commons.TreeNode} oNode
	 * @private
	 */
	Tree.prototype.getNodeContext = function(oNode) {
		var oBindingInfo = this.getBindingInfo("nodes"),
			sModelName = oBindingInfo && oBindingInfo.model;
		return oNode.getBindingContext(sModelName);
	};

	/**
	 * Returns the node with the given context, or null if no such node currently exists
	 *
	 * @param {sap.ui.model.Context} oContext the context of the node to be retrieved
	 * @public
	 * @since 1.19
	 */
	Tree.prototype.getNodeByContext = function(oContext){
		var oBindingInfo = this.getBindingInfo("nodes"),
			sModelName = oBindingInfo && oBindingInfo.model;
		return this.findNode(this, function(oNode) {
			return oNode.getBindingContext(sModelName) == oContext;
		});
	};

	/**
	 * Search through all existing nodes and return the first node which matches using
	 * the given matching function
	 *
	 * @param {function} fnMatch the matching function
	 * @param {sap.ui.commons.Tree|sap.ui.commons.TreeNode} oNode the node to check
	 * @returns The found node
	 * @private
	 */
	Tree.prototype.findNode = function(oNode, fnMatch) {
		var oFoundNode,
			that = this;
		if (fnMatch(oNode)) {
			return oNode;
		}
		jQuery.each(oNode._getNodes(), function(i, oNode) {
			oFoundNode = that.findNode(oNode, fnMatch);
			if (oFoundNode) {
				return false;
			}
		});
		return oFoundNode;
	};

	Tree.prototype.setSelectionMode = function(oMode){
		oMode = this.validateProperty("selectionMode", oMode);
		if (this.getSelectionMode() != oMode) {
			this.setProperty("selectionMode", oMode);
			// Clear current selection, whenever the selectionmode changes
			this._delSelection();
		}
	};

	/**Returns the selected node in the tree. If not selection, returns false.
	 * @returns The selected node
	 * @private
	 */
	Tree.prototype.getSelection = function(){
		for (var sId in this.mSelectedNodes) {
			return this.mSelectedNodes[sId];
		}
		return null;
	};

	/**Sets the selected node reference of the Tree
	 * @private
	 */
	Tree.prototype.setSelection = function(oNode, bSuppressEvent, sType, bDeselectOtherNodes){
		var bDoSelect = true;
		if (!bSuppressEvent) {
			bDoSelect = this.fireSelect({node: oNode, nodeContext: this.getNodeContext(oNode)});
		}

		if (bDoSelect) {
			switch (this.getSelectionMode()) {
				case sap.ui.commons.TreeSelectionMode.Legacy:
				case sap.ui.commons.TreeSelectionMode.Single:
					this._setSelectedNode(oNode, bSuppressEvent);
					break;
				case sap.ui.commons.TreeSelectionMode.Multi:
					if (sType == Tree.SelectionType.Range) {
						this._setSelectedNodeMapRange(oNode, bSuppressEvent);
					} else if (sType == Tree.SelectionType.Toggle) {
						this._setSelectedNodeMapToggle(oNode, bSuppressEvent);
					} else {
						this._setSelectedNode(oNode, bSuppressEvent);
					}
					break;
				case sap.ui.commons.TreeSelectionMode.None:
					break;
			}
		}
	};

	/**Rerendering handling. Sets the scroll position so that the selected node stays on the position it
	 * was before rerendering, for example after the expand and adding the nodes dynamically.
	 * @private
	 */
	Tree.prototype.onAfterRendering = function () {
		if (this.iOldScrollTop) {
			this.$("TreeCont").scrollTop(this.iOldScrollTop);
		}
	};

	/**
	 * Whenever nodes are added ore removed from the tree, the selection needs to be adapted,
	 * so that the selected node map is in sync with the isSelected properties of the contained
	 * nodes
	 * @private
	 */
	Tree.prototype.invalidate = function () {
		var that = this;
		Control.prototype.invalidate.apply(this, arguments);
		if (this.iSelectionUpdateTimer) {
			return;
		}
		this.iSelectionUpdateTimer = setTimeout(function() {
			that.mSelectedNodes = {};
			that.mSelectedContexts = {};
			that.updateSelection(that, true);
			that.iSelectionUpdateTimer = null;
		}, 0);
	};

	/**
	 * Loop through all tree nodes and collect the selected state
	 * @private
	 */
	Tree.prototype.updateSelection = function (oNode, bExpanded) {
		var that = this;
		jQuery.each(oNode._getNodes(), function(i, oNode) {
			if (oNode.getIsSelected()) {
				switch (that.getSelectionMode()) {
					case sap.ui.commons.TreeSelectionMode.None:
						jQuery.sap.log.warning("Added selected nodes in a tree with disabled selection");
						oNode.setIsSelected(false);
						break;
					case sap.ui.commons.TreeSelectionMode.Legacy:
						if (jQuery.isEmptyObject(that.mSelectedNodes)) {
							that.mSelectedNodes[oNode.getId()] = oNode;
							that.mSelectedContexts[oNode.getId()] = that.getNodeContext(oNode);
						}
						break;
					case sap.ui.commons.TreeSelectionMode.Single:
						if (jQuery.isEmptyObject(that.mSelectedNodes) == false) {
							jQuery.sap.log.warning("Added multiple selected nodes in single select tree");
							oNode.setIsSelected(false);
						} else {
							that.mSelectedNodes[oNode.getId()] = oNode;
							that.mSelectedContexts[oNode.getId()] = that.getNodeContext(oNode);
						}
						break;
					case sap.ui.commons.TreeSelectionMode.Multi:
						if (!bExpanded) {
							jQuery.sap.log.warning("Added selected node inside collapsed node in multi select tree");
							oNode.setIsSelected(false);
						} else {
							that.mSelectedNodes[oNode.getId()] = oNode;
							that.mSelectedContexts[oNode.getId()] = that.getNodeContext(oNode);
						}
						break;
				}
			}
			that.updateSelection(oNode, bExpanded && oNode.getExpanded());
		});
	};

	/**Rerendering handling. Remembers the scroll position of the selected node.
	 * @private
	 */
	Tree.prototype.onBeforeRendering = function() {
		this.iOldScrollTop = this.$("TreeCont").scrollTop();
	};

	Tree.prototype._setSelectedNode = function(oNode, bSuppressEvent) {
		var that = this, 
			oContext = this.getNodeContext(oNode);

		jQuery.each(this.mSelectedNodes, function(sId, oNode){
			that._delMultiSelection(oNode, bSuppressEvent);
		});

		oNode._select(bSuppressEvent, true);
		this.mSelectedNodes[oNode.getId()] = oNode;
		this.mSelectedContexts[oNode.getId()] = oContext;
		this.oLeadSelection = oNode;
		if (!bSuppressEvent) {
			this.fireSelectionChange({nodes: [oNode], nodeContexts: [oContext]});
		}
	};

	Tree.prototype._setSelectedNodeMapToggle = function(oNode, bSuppressEvent) {
		this._setNodeSelection(oNode, !oNode.getIsSelected(), bSuppressEvent);
	};

	Tree.prototype._setSelectedNodeMapRange = function(oNode, bSuppressEvent) {
		var aSelectableNodes,
			aSelectedNodes = [],
			aSelectedNodeContexts = [],
			iStartIndex, iEndIndex, iFrom, iTo;

		if (this.mSelectedNodes[oNode.getId()] == oNode) {
			return; //Nothing to do!
		} else {
			if (this._getNodes().length > 0) {
				aSelectableNodes = this._getSelectableNodes();
				iStartIndex = aSelectableNodes.indexOf(this.oLeadSelection);
				iEndIndex = aSelectableNodes.indexOf(oNode);
				iFrom = iStartIndex < iEndIndex ? iStartIndex : iEndIndex;
				iTo = iStartIndex < iEndIndex ? iEndIndex : iStartIndex;
				for (var i = iFrom; i <= iTo; i++) {
					this._setMultiSelection(aSelectableNodes[i], bSuppressEvent);
				}
			}
		}

		if (!bSuppressEvent) {
			jQuery.map(this.mSelectedNodes, function(oNode) {aSelectedNodes.push(oNode);});
			jQuery.map(this.mSelectedContexts, function(oContext) {aSelectedNodeContexts.push(oContext);});
			this.fireSelectionChange({nodes: aSelectedNodes, nodeContexts: aSelectedNodeContexts});
		}
	};

	Tree.prototype._getSelectableNodes = function(aNodes) {
		var aSelectableNodes = [];
		function collectSelectableNodes(aNodes) {
			jQuery.each(aNodes, function(i, oNode) {
				if (oNode.getSelectable()) {
					aSelectableNodes.push(oNode);
				}
				if (oNode.getExpanded()) {
					collectSelectableNodes(oNode._getNodes());
				}
			});
		}
		collectSelectableNodes(this._getNodes());
		return aSelectableNodes;
	};

	Tree.prototype._setNodeSelection = function(oNode, bIsSelected, bSuppressEvent) {
		var aSelectedNodes = [],
			aSelectedNodeContexts = [];
		var oVisibleDomNode;

		if (this.getSelectionMode() == sap.ui.commons.TreeSelectionMode.Single) {
			if (bIsSelected) {
				var oSelectedNode = this.getSelection();
				this._setSelectedNode(oNode, bSuppressEvent);
				if (!oNode.isVisible()) {
					oVisibleDomNode = this._getVisibleNode(oNode).getDomRef();
					this.adjustSelectionOnCollapsing(oVisibleDomNode);
				}
				if (oSelectedNode && !oSelectedNode.isVisible()) {
					oVisibleDomNode = this._getVisibleNode(oSelectedNode).getDomRef();
					this.adjustSelectionOnExpanding(oVisibleDomNode);
				}
				return;
			} else {
				this._delMultiSelection(oNode, bSuppressEvent);
				if (!oNode.isVisible()) {
					oVisibleDomNode = this._getVisibleNode(oNode).getDomRef();
					this.adjustSelectionOnExpanding(oVisibleDomNode);
				}
			}
		}

		if (bIsSelected) {
			this._setMultiSelection(oNode, bSuppressEvent);
			this.oLeadSelection = oNode;
		} else {
			this._delMultiSelection(oNode, bSuppressEvent);
			this.oLeadSelection = oNode;
		}
		if (!bSuppressEvent) {
			jQuery.map(this.mSelectedNodes, function(oNode) {aSelectedNodes.push(oNode);});
			jQuery.map(this.mSelectedContexts, function(oContext) {aSelectedNodeContexts.push(oContext);});
			this.fireSelectionChange({nodes: aSelectedNodes, nodeContexts: aSelectedNodeContexts});
		}
	};

	Tree.prototype._setMultiSelection = function(oSelNode, bSuppressEvent) {
		if (!oSelNode) {
			return;
		}
		oSelNode._select(bSuppressEvent);
		this.mSelectedNodes[oSelNode.getId()] = oSelNode;
		this.mSelectedContexts[oSelNode.getId()] = this.getNodeContext(oSelNode);
	};

	Tree.prototype._delMultiSelection = function(oSelNode, bSuppressEvent) {
		if (!oSelNode) {
			return;
		}
		oSelNode._deselect();
		delete this.mSelectedNodes[oSelNode.getId()];
		delete this.mSelectedContexts[oSelNode.getId()];
	};

	Tree.prototype._delSelection = function() {
		var that = this;
		if (this.oSelectedNode) {
			this.oSelectedNode._deselect();
		}
		if (jQuery.isEmptyObject(this.mSelectedNodes) == false) {
			jQuery.each(this.mSelectedNodes, function(sId, oNode){
				that._delMultiSelection(oNode);
			});
		}
	};

	Tree.prototype._getNodes = function() {
		return this.mAggregations.nodes || [];
	};

	Tree.prototype._getVisibleNode = function(oNode) {
		var oParentNode = oNode.getParent();
		if (oParentNode.isVisible()) {
			var oVisibleNode = oParentNode;
		} else {
			oVisibleNode = this._getVisibleNode(oParentNode);
		}
		return oVisibleNode;
	};

	return Tree;

}, /* bExport= */ true);

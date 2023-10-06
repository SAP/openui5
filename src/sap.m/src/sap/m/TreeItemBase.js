/*!
 * ${copyright}
 */

// Provides control sap.m.StandardListItem.
sap.ui.define([
	'./ListItemBase',
	'./library',
	'sap/ui/core/IconPool',
	'sap/ui/core/Icon',
	'./TreeItemBaseRenderer',
	'sap/ui/events/KeyCodes'
],
	function(ListItemBase, library, IconPool, Icon, TreeItemBaseRenderer, KeyCodes) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	/**
	 * Constructor for a new TreeItemBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.TreeItemBase</code> contains the basic features of all specific tree items.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.42.0
	 * @alias sap.m.TreeItemBase
	 */
	var TreeItemBase = ListItemBase.extend("sap.m.TreeItemBase", /** @lends sap.m.TreeItemBase.prototype */ {
		metadata : {
			library : "sap.m"
		},

		renderer: TreeItemBaseRenderer
	});

	TreeItemBase.prototype.ExpandedIconURI = IconPool.getIconURI("navigation-down-arrow");
	TreeItemBase.prototype.CollapsedIconURI = IconPool.getIconURI("navigation-right-arrow");

	TreeItemBase.prototype.getTree = function() {
		var oParent = this.getParent();
		if (oParent && oParent.isA("sap.m.Tree")) {
			return oParent;
		}
	};

	TreeItemBase.prototype.getList = TreeItemBase.prototype.getTree;
	TreeItemBase.prototype.informTree = TreeItemBase.prototype.informList;

	/**
	 * Gets the context of the node.
	 *
	 * @returns {Object}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.getItemNodeContext = function() {
		var oTree = this.getTree();
		var oTreeProxy = this._getTreeBindingProxy();
		var oNode = null;

		if (oTreeProxy) {
			oNode = oTreeProxy.getNodeByIndex(oTree.indexOfItem(this));
		}

		return oNode;
	};

	/**
	 * Gets the parent node control.
	 *
	 * @returns {sap.m.TreeItemBase | undefined}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.getParentNode = function() {

		if (this.isTopLevel()) {
			return;
		}

		var oTree = this.getTree(),
			iNodeLevel = this.getLevel(),
			oParentNode = null,
			i = oTree.indexOfItem(this) - 1,
			aItems = oTree.getItems(),
			iLevel;

		while (i >= 0) {
			iLevel = aItems[i].getLevel();
			if (iLevel === iNodeLevel - 1) {
				oParentNode = aItems[i];
				break;
			}
			i--;
		}

		return oParentNode;
	};

	/**
	 * Gets the context of the parent node control.
	 *
	 * @returns {Object}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.getParentNodeContext = function() {
		return this.getItemNodeContext().parent;
	};

	/**
	 * Determines if the node is a leaf.
	 *
	 * @returns {boolean}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.isLeaf = function() {
		var oTree = this.getTree(),
			oTreeProxy = this._getTreeBindingProxy();

		if (oTreeProxy) {
			var iIndex = oTree.indexOfItem(this);
			return oTreeProxy.isLeaf(iIndex);
		}

		return false;
	};

	/**
	 * Checks if the node is the top level node.
	 *
	 * @returns {boolean}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.isTopLevel = function() {
		return (this.getLevel() === 0);
	};

	/**
	 * Gets the node level in the hierarchy.
	 *
	 * @returns {int}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.getLevel = function() {
		return (this.getItemNodeContext() || {}).level;
	};

	/**
	 * Gets the expanding information of the node.
	 *
	 * @returns {boolean}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.getExpanded = function() {
		var oTree = this.getTree(),
			oTreeProxy = this._getTreeBindingProxy();
		if (!oTree || !oTreeProxy) {
			return false;
		}

		var iIndex = oTree.indexOfItem(this);
		return oTreeProxy.isExpanded(iIndex);
	};

	TreeItemBase.prototype.setSelected = function (bSelected) {
		ListItemBase.prototype.setSelected.apply(this, arguments);

		// update the binding context
		var oTree = this.getTree();
		var oBinding = oTree ? oTree.getBinding("items") : null;
		var iIndex = -1;

		if (oTree && oBinding) {
			iIndex = oTree.indexOfItem(this);
			if (oTree.getMode() === ListMode.SingleSelect) {
				oBinding.setSelectedIndex(iIndex);
			}
			if (oTree.getMode() === ListMode.MultiSelect) {
				if (bSelected) {
					oBinding.addSelectionInterval(iIndex, iIndex);
				} else {
					oBinding.removeSelectionInterval(iIndex, iIndex);
				}
			}
		}

		return this;
	};

	/**
	 * Gets the expander control for rendering purposes.
	 *
	 * @returns {sap.ui.core.Control}
	 * @private
	 * @since 1.42.0
	 */
	TreeItemBase.prototype._getExpanderControl = function() {
		var sSrc = this.CollapsedIconURI,
			oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sIconTooltip = oBundle.getText("TREE_ITEM_EXPAND_NODE");

		if (this.getExpanded()) {
			sSrc = this.ExpandedIconURI;
			sIconTooltip = oBundle.getText("TREE_ITEM_COLLAPSE_NODE");
		}

		if (this._oExpanderControl) {
			this._oExpanderControl.setSrc(sSrc);
			this._oExpanderControl.setTooltip(sIconTooltip);
			return this._oExpanderControl;
		}

		this._oExpanderControl = new Icon({
			id: this.getId() + "-expander",
			src: sSrc,
			tooltip: sIconTooltip,
			noTabStop: true
		}).setParent(this, null, true).addStyleClass("sapMTreeItemBaseExpander").attachPress(function(oEvent) {
			this.informTree("ExpanderPressed");
		}, this);

		return this._oExpanderControl;
	};

	TreeItemBase.prototype.invalidate = function() {
		ListItemBase.prototype.invalidate.apply(this, arguments);
		this._bInvalidated = true;
	};

	TreeItemBase.prototype.onAfterRendering = function() {
		ListItemBase.prototype.onAfterRendering.apply(this, arguments);
		this._bInvalidated = false;
	};

	TreeItemBase.prototype.setBindingContext = function() {
		ListItemBase.prototype.setBindingContext.apply(this, arguments);
		this.invalidate();
		return this;
	};

	/**
	 * Gets the indentation of the node for rendering purposes.
	 *
	 * @returns {float}
	 * @private
	 * @since 1.42.0
	 */
	TreeItemBase.prototype._getPadding = function() {
		var oTree = this.getTree(),
		iNodeLevel = this.getLevel(),
		iIndentation = 0,
		iDeepestLevel;

		// use number count from hierarchy binding
		if (oTree) {
			iDeepestLevel = oTree.getDeepestLevel();
		}

		// for add node
		if (iDeepestLevel < iNodeLevel) {
			oTree._iDeepestLevel = iNodeLevel;
			iDeepestLevel = oTree._iDeepestLevel;
		}

		if (iDeepestLevel < 2) {
			iIndentation = iNodeLevel * 1.5;
		} else if (iDeepestLevel === 2) {
			iIndentation = iNodeLevel * 1;
		} else if (iDeepestLevel < 6) {
			iIndentation = iNodeLevel * 0.5;
		} else {
			iIndentation = iNodeLevel * 0.25;
		}

		return iIndentation;
	};

	/**
	 * The event is fired when + is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	TreeItemBase.prototype.onsapplus = function(oEvent) {
		this.informTree("ExpanderPressed", true);
	};

	/**
	 * The event is fired when - is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	TreeItemBase.prototype.onsapminus = function(oEvent) {
		this.informTree("ExpanderPressed", false);
	};

	/**
	 * The event is fired when the right arrow key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	TreeItemBase.prototype.onsapright = function(oEvent) {
		if (oEvent.srcControl !== this || this.isLeaf()) {
			return;
		}

		if (!this.getExpanded()) {
			this.informTree("ExpanderPressed", true);
		} else {
			// Change the keyCode so that the item navigation handles the down navigation.
			oEvent.keyCode = KeyCodes.ARROW_DOWN;
		}

	};

	/**
	 * The event is fired when the left arrow key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	TreeItemBase.prototype.onsapleft = function(oEvent) {
		if (oEvent.srcControl !== this || this.isTopLevel() && !this.getExpanded()) {
			return;
		}

		if (!this.isLeaf()) {
			if (this.getExpanded()) {
				this.informTree("ExpanderPressed", false);
			} else {
				this.getParentNode().focus();
			}
		} else {
			this.getParentNode().focus();
		}

	};

	/**
	 * The event is fired when the backspace key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	TreeItemBase.prototype.onsapbackspace = function(oEvent) {
		// Only set focus on parent when the event is fired by item itself.
		// Prevent miss-set when the content of CustomTreeItem fires event.
		if (oEvent.srcControl !== this) {
			return;
		}

		if (!this.isTopLevel()) {
				this.getParentNode().focus();
		}

	};

	TreeItemBase.prototype.getAccessibilityType = function(oBundle) {
		return oBundle.getText("ACC_CTR_TYPE_TREEITEM");
	};

	TreeItemBase.prototype.exit = function() {
		ListItemBase.prototype.exit.apply(this, arguments);
		this.destroyControls(["Expander"]);
	};

	TreeItemBase.prototype.onlongdragover = function(oEvent) {
		this.informTree("LongDragOver");
	};

	TreeItemBase.prototype._getTreeBindingProxy = function() {
		var oTree = this.getTree();
		if (oTree) {
			return oTree._oProxy;
		}
	};

	return TreeItemBase;

});
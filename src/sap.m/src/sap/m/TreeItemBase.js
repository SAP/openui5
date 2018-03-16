/*!
 * ${copyright}
 */

// Provides control sap.m.StandardListItem.
sap.ui.define([
	'jquery.sap.global',
	'./ListItemBase',
	'./library',
	'sap/ui/core/IconPool',
	'sap/ui/core/Icon',
	'./TreeItemBaseRenderer',
	'jquery.sap.keycodes'
],
	function(jQuery, ListItemBase, library, IconPool, Icon, TreeItemBaseRenderer) {
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TreeItemBase = ListItemBase.extend("sap.m.TreeItemBase", /** @lends sap.m.TreeItemBase.prototype */ { metadata : {
		library : "sap.m"
	}});

	TreeItemBase.prototype.ExpandedIconURI = IconPool.getIconURI("navigation-down-arrow");
	TreeItemBase.prototype.CollapsedIconURI = IconPool.getIconURI("navigation-right-arrow");

	TreeItemBase.prototype.getTree = function() {
		var oParent = this.getParent();
		if (oParent instanceof sap.m.Tree) {
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
		var oContext = null;
		var oBinding = null;
		if (oTree) {
			oBinding = oTree.getBinding("items");
			oContext = oBinding.getNodeByIndex(oTree.indexOfItem(this));
		}
		return oContext;
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
		return (this.getItemNodeContext() || {}).isLeaf;
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
	 * @returns {Boolean}
	 * @public
	 * @since 1.42.0
	 */
	TreeItemBase.prototype.getExpanded = function() {
		var bExpanded = false;
		if (this.getItemNodeContext() && this.getItemNodeContext().nodeState) {
			bExpanded = this.getItemNodeContext().nodeState.expanded;
		}
		return bExpanded;
	};

	TreeItemBase.prototype.setSelected = function (bSelected) {
		ListItemBase.prototype.setSelected.apply(this, arguments);

		// update the binding context
		var oTree = this.getTree();
		var oBinding = null;
		var iIndex = -1;

		if (oTree) {
			oBinding = oTree.getBinding("items");
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
	 * @returns {Boolean}
	 * @private
	 * @since 1.42.0
	 */
	TreeItemBase.prototype._getExpanderControl = function() {
		var sSrc = "";
		if (!this.isLeaf()) {
			sSrc = this.getExpanded() ? this.ExpandedIconURI : this.CollapsedIconURI;
		}

		if (this._oExpanderControl) {
			this._oExpanderControl.setSrc(sSrc);
			return this._oExpanderControl;
		}

		this._oExpanderControl = new Icon({
			id: this.getId() + "-expander",
			src: sSrc,
			useIconTooltip: false,
			noTabStop: true
		}).setParent(this, null, true).addStyleClass("sapMTreeItemBaseExpander").attachPress(function(oEvent) {
			this.informTree("ExpanderPressed");
		}, this);

		return this._oExpanderControl;
	};

	/**
	 * Gets expander information.
	 *
	 * @private
	 * @since 1.46.0
	 */
	TreeItemBase.prototype._updateExpander = function() {
		if (this._oExpanderControl) {
			var sSrc = "";
			if (!this.isLeaf()) {
				sSrc = this.getExpanded() ? this.ExpandedIconURI : this.CollapsedIconURI;
			}
			this._oExpanderControl.setSrc(sSrc);
			this.$().attr("aria-expanded", this.getExpanded());

			// update the indentation again
			var iIndentation = this._getPadding(),
				sStyleRule = sap.ui.getCore().getConfiguration().getRTL() ? "paddingRight" : "paddingLeft";
			this.$().css(sStyleRule, iIndentation + "rem");

		}
	};

	TreeItemBase.prototype.setBindingContext = function() {
		ListItemBase.prototype.setBindingContext.apply(this, arguments);
		this._updateExpander();

		return this;
	};

	/**
	 * Gets the indentation of the node for rendering purposes.
	 *
	 * @returns {Boolean}
	 * @private
	 * @since 1.42.0
	 */
	TreeItemBase.prototype._getPadding = function() {
		var oTree = this.getTree(),
		iNodeLevel = this.getLevel(),
		iIndentation = 0,
		iDeepestLevel;

		if (oTree) {
			iDeepestLevel = oTree.getDeepestLevel();
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
	 * @param {jQuery.Event} The event object.
	 */
	TreeItemBase.prototype.onsapplus = function(oEvent) {
		this.informTree("ExpanderPressed", true);
	};

	/**
	 * The event is fired when - is pressed.
	 *
	 * @param {jQuery.Event} The event object.
	 */
	TreeItemBase.prototype.onsapminus = function(oEvent) {
		this.informTree("ExpanderPressed", false);
	};

	/**
	 * The event is fired when the right arrow key is pressed.
	 *
	 * @param {jQuery.Event} The event object.
	 */
	TreeItemBase.prototype.onsapright = function(oEvent) {
		if (this.isLeaf()) {
			return;
		}

		if (!this.getExpanded()) {
			this.informTree("ExpanderPressed", true);
		} else {
			// Change the keyCode so that the item navigation handles the down navigation.
			oEvent.keyCode = jQuery.sap.KeyCodes.ARROW_DOWN;
		}

	};

	/**
	 * The event is fired when the left arrow key is pressed.
	 *
	 * @param {jQuery.Event} The event object.
	 */
	TreeItemBase.prototype.onsapleft = function(oEvent) {
		if (this.isTopLevel() && !this.getExpanded()) {
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
	 * @param {jQuery.Event} The event object.
	 */
	TreeItemBase.prototype.onsapbackspace = function(oEvent) {
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

	return TreeItemBase;

});

/*!
 * ${copyright}
 */

// Provides control sap.m.Tree.
sap.ui.define([
	'jquery.sap.global',
	'./ListBase',
	'./TreeItemBase',
	'./library',
	'sap/ui/model/ClientTreeBindingAdapter',
	'sap/ui/model/TreeBindingCompatibilityAdapter',
	'sap/ui/model/odata/ODataTreeBinding',
	'sap/ui/model/odata/v2/ODataTreeBinding',
	'sap/ui/model/ClientTreeBinding',
	'./TreeRenderer'
],
function(
	jQuery,
	ListBase,
	TreeItemBase,
	library,
	ClientTreeBindingAdapter,
	TreeBindingCompatibilityAdapter,
	ODataTreeBinding,
	V2ODataTreeBinding,
	ClientTreeBinding,
	TreeRenderer
	) {
	"use strict";



	/**
	 * Constructor for a new Tree.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>Tree</code> control provides a tree structure for displaying data in a hierarchy.
	 * <b>Note:</b> Growing feature is not supported by <code>Tree</code>.
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.42
	 * @alias sap.m.Tree
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Tree = ListBase.extend("sap.m.Tree", { metadata : {
		library : "sap.m",
		events : {

			/**
			 * Fired when an item has been expanded or collapsed by user interaction.
			 * @since 1.50
			 */
			toggleOpenState : {
				parameters : {

					/**
					 * Index of the expanded/collapsed item
					 */
					itemIndex : {type : "int"},

					/**
					 * Binding context of the item
					 */
					itemContext : {type : "object"},

					/**
					 * Flag that indicates whether the item has been expanded or collapsed
					 */
					expanded : {type : "boolean"}
				}
			}
		}
	}});

	Tree.prototype.isTreeBinding = function(sName) {
		return (sName == "items");
	};

	Tree.prototype.getBinding = function(sName) {
		// adapt TreeBindingAdapter for Tree
		sName = sName || "items";
		var oBinding = ListBase.prototype.getBinding.call(this, sName);

		if (oBinding && sName === "items" && !oBinding.getLength) {
			// try to resolve optional dependencies
			if (ODataTreeBinding && oBinding instanceof ODataTreeBinding) {
				// use legacy tree binding adapter
				TreeBindingCompatibilityAdapter(oBinding, this);
			} else if (V2ODataTreeBinding && oBinding instanceof V2ODataTreeBinding) {
				oBinding.applyAdapterInterface();
			} else if (ClientTreeBinding && oBinding instanceof ClientTreeBinding) {
				ClientTreeBindingAdapter.apply(oBinding);
			} else {
				jQuery.sap.log.error("TreeBinding is not supported for the control " + this);
			}
		}

		return oBinding;
	};

	Tree.prototype.updateAggregation = function(sName) {
		if (sName != "items") {
			return ListBase.prototype.updateAggregation.apply(this, arguments);
		}

		// Reuse the ListBinding from ManagedObject.updataAggregation
		var oBindingInfo = this.getBindingInfo("items"),
			oBinding = this.getBinding("items"),
			fnFactory = oBindingInfo.factory,
			aContexts;

		// Update a single aggregation with the array of contexts. Reuse existing children
		// and just append or remove at the end, if some are missing or too many.
		function update(oControl, aContexts) {
			var aChildren = oControl.getItems() || [],
				oContext,
				oClone;
			if (aChildren.length > aContexts.length) {
				for (var i = aContexts.length; i < aChildren.length; i++) {
					oControl.removeItem(aChildren[i]);
					aChildren[i].destroy("KeepDom");
				}
			}
			for (var i = 0; i < aContexts.length; i++) {
				oContext = aContexts[i];
				oClone = aChildren[i];
				if (oClone) {
					oClone.setBindingContext(oContext, oBindingInfo.model);
				} else {
					oClone = fnFactory(oControl.getId() + "-" + i, oContext);
					oClone.setBindingContext(oContext, oBindingInfo.model);
					oControl.addItem(oClone);
				}
			}
		}

		// Context length will be filled by model.
		aContexts = oBinding.getContexts(0);

		// If factory function is used without extended change detection, destroy aggregation
		if (!oBindingInfo.template) {
			this.destroyItems();
		}
		update(this, aContexts);

	};

	Tree.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		var oResult = ListBase.prototype.validateAggregation.apply(this, arguments);
		if (sAggregationName === "items" && !(oObject instanceof TreeItemBase)) {
			throw new Error(oObject + " is not a valid items aggregation of " + this + ". Items aggregation in Tree control only supports TreeItemBase-based objects, e.g. StandardTreeItem.");
		}
		return oResult;
	};

	Tree.prototype.onItemExpanderPressed = function(oItem, bExpand) {
		var iIndex = this.indexOfItem(oItem);
		var oBindingInfo = this.getBindingInfo("items");
		var oItemContext = oItem && oItem.getBindingContext(oBindingInfo.model);

		if (oBindingInfo && oItemContext) {
			var bExpandedBeforePress = oItem.getExpanded();
			var bExpandedAfterPress;

			if (bExpand == undefined) {
				this.getBinding("items").toggleIndex(iIndex);
			} else if (bExpand) {
				this.getBinding("items").expand(iIndex);
			} else {
				this.getBinding("items").collapse(iIndex);
			}

			bExpandedAfterPress = oItem.getExpanded();
			if (bExpandedAfterPress && (oItem.getLevel() + 1 > this.getDeepestLevel())) {
				this._iDeepestLevel = oItem.getLevel() + 1;
			}

			if (bExpandedBeforePress !== bExpandedAfterPress && !oItem.isLeaf()) {
				this.fireToggleOpenState({
					itemIndex: iIndex,
					itemContext: oItemContext,
					expanded: bExpandedAfterPress
				});
			}
		}
	};

	/**
	 * The <code>growing</code> property is not supported for control <code>Tree</code>.
	 * @public
	 * @deprecated
	 */
	Tree.prototype.setGrowing = function() {
		jQuery.sap.log.error("Growing feature of " + this + " is not supported!");
		return this;
	};

	/**
	 * The <code>growingThreshold</code> property is not supported for control <code>Tree</code>.
	 * @public
	 * @deprecated
	 */
	Tree.prototype.setGrowingThreshold = function() {
		jQuery.sap.log.error("GrowingThreshold of " + this + " is not supported!");
		return this;
	};

	/**
	 * The <code>growingTriggerText</code> property is not supported for control <code>Tree</code>.
	 * @public
	 * @deprecated
	 */
	Tree.prototype.setGrowingTriggerText = function() {
		jQuery.sap.log.error("GrowingTriggerText of " + this + " is not supported!");
		return this;
	};

	/**
	 * The <code>growingScrollToLoad</code> property is not supported for control <code>Tree</code>.
	 * @public
	 * @deprecated
	 */
	Tree.prototype.setGrowingScrollToLoad = function() {
		jQuery.sap.log.error("GrowingScrollToLoad of " + this + " is not supported!");
		return this;
	};

	/**
	 * The <code>growingDirection</code> property is not supported for control <code>Tree</code>.
	 * @public
	 * @deprecated
	 */
	Tree.prototype.setGrowingDirection = function() {
		jQuery.sap.log.error("GrowingDirection of " + this + " is not supported!");
		return this;
	};

	/**
	 * Defines the level to which the tree is expanded.
	 * The function can be used to define the initial expanding state. An alternative way to define the initial expanding state is to set the parameter <code>numberOfExpandedLevels</code> of the binding.
	 *
	 * Example:
	 * <pre>
	 *   oTree.bindItems({
	 *      path: "...",
	 *      parameters: {
	 *         numberOfExpandedLevels: 1
	 *      }
	 *   });
	 * </pre>
	 * @return {sap.m.Tree} A reference to the Tree control
	 * @public
	 * @param {int} iLevel The level to which the data is expanded
	 * @since 1.48.0
	 */
	Tree.prototype.expandToLevel = function (iLevel) {
		var oBinding = this.getBinding("items");

		jQuery.sap.assert(oBinding && oBinding.expandToLevel, "Tree.expandToLevel is not supported with your current Binding. Please check if you are running on an ODataModel V2.");

		if (oBinding && oBinding.expandToLevel && oBinding.getNumberOfExpandedLevels) {
			if (oBinding.getNumberOfExpandedLevels() > iLevel) {
				oBinding.collapseToLevel(0);
			}
			oBinding.expandToLevel(iLevel);
		}

		return this;
	};

	Tree.prototype.getNumberOfExpandedLevel = function() {
		return this.getBinding("items").getNumberOfExpandedLevels();
	};

	Tree.prototype.getDeepestLevel = function() {
		if (this._iDeepestLevel === undefined) {
			this._iDeepestLevel = this.getNumberOfExpandedLevel();
		}

		return this._iDeepestLevel;
	};

	/**
	 * Collapses all nodes.
	 *
	 * @return {sap.m.Tree} A reference to the Tree control
	 * @public
	 * @since 1.48.0
	 */
	Tree.prototype.collapseAll = function () {
		var oBinding = this.getBinding("items");

		jQuery.sap.assert(oBinding && oBinding.expandToLevel, "Tree.collapseAll is not supported with your current Binding. Please check if you are running on an ODataModel V2.");

		if (oBinding) {
			oBinding.collapseToLevel(0);
		}

		return this;
	};

	/**
	 *
	 * Expands one or multiple items.
	 *
	 * @return {sap.m.Tree} A reference to the Tree control
	 * @public
	 * @param {int|[]} vParam The index or indices of the item to be expanded
	 * @since 1.56.0
	 */
	Tree.prototype.expand = function(vParam) {
		var aIndices = [];
		if (typeof vParam === "number") {
			aIndices.push(vParam);
		} else if ( Array.isArray(vParam) ) {
			//sort
			aIndices = vParam.sort().reverse();
		}

		var oBinding = this.getBinding("items"),
			i = 0;

		for (i = 0; i < aIndices.length - 1; i++) {
			oBinding.expand(aIndices[i], true);
		}
		// trigger change
		oBinding.expand(aIndices[i], false);

		return this;
	};

	/**
	 *
	 * Collapses one or multiple items.
	 *
	 * @return {sap.m.Tree} A reference to the Tree control
	 * @public
	 * @param {int|[]} vParam The index or indices of the tree items to be collapsed
	 * @since 1.56.0
	 */
	Tree.prototype.collapse = function(vParam) {
		var aIndices = [];
		if (typeof vParam === "number") {
			aIndices.push(vParam);
		} else if ( Array.isArray(vParam) ) {
			aIndices = vParam.sort().reverse();
		}
		var oBinding = this.getBinding("items"),
			i = 0;

		for (i = 0; i < aIndices.length - 1; i++) {
			oBinding.collapse(aIndices[i], true);
		}
		// trigger change
		oBinding.collapse(aIndices[i], false);

		return this;
	};

	Tree.prototype.getAccessibilityType = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_TREE");
	};

	Tree.prototype.getAccessbilityPosition = function(oItem) {
		var iSetSize,
			iPosInset,
			oNodeContext = oItem.getItemNodeContext();

		if (oNodeContext.parent) {
			iSetSize = oNodeContext.parent.children.length;
		}
		if (oNodeContext.positionInParent) {
			iPosInset = oNodeContext.positionInParent + 1;
		}

		return {
			setSize: iSetSize,
			posInset: iPosInset
		};
	};

	Tree.prototype.onItemLongDragOver = function(oItem) {
		var iIndex = this.indexOfItem(oItem);
		this.getBinding("items").expand(iIndex);
	};

	Tree.prototype.isGrouped = function() {
		return false;
	};

	return Tree;

});

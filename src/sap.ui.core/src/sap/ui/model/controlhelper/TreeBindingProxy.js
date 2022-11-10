/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/assert"], function (assert) {
	"use strict";

	/**
	 * Proxy for tree controls, such as <code>sap.ui.table.TreeTable</code>
	 * or <code>sap.m.Tree</code>.
	 * Provides proxy methods for binding methods, which can act differently in different
	 * binding types.
	 * Enables the usage of OData V4 bindings in tree controls.
	 *
	 * @class
	 *
	 * @param {sap.ui.core.Control} oControl control instance
	 * @param {string} sAggregation aggregation name to be applied to, e.g. in TreeTable "rows"
	 *
	 * @private
	 * @ui5-restricted sap.m.Tree, sap.ui.table.TreeTable
	 */
	var TreeBindingProxy = function (oControl, sAggregation) {
		this._oControl = oControl;
		this._sAggregation = sAggregation;
		var oParams = new URLSearchParams(window.location.search);
		this._bEnableV4 = oParams.get("sap-ui-xx-v4tree") === "true";
	};

	/**
	 * Determines whether the control's binding is a tree binding.
	 * @returns {boolean} Whether binding is a tree binding. OData V4 bindings
	 * are list bindings even in Tree or TreeTable cases, therefore the method will
	 * always return <code>false</code>, if the binding is a OData V4 binding.
	 */
	TreeBindingProxy.prototype.isTreeBinding = function () {
		var oModel = this._oControl.getModel(
			this._oControl.getBindingInfo(this._sAggregation).model);
		if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
			return false;
		}

		return true;
	};

	/**
	 * Determines whether the node with the given index is a leaf.
	 * @param {int} iIndex Index of the node
	 * @returns {boolean} Leaf state. If the binding is undefined, the method
	 * will return <code>true</code>.
	 */
	TreeBindingProxy.prototype.isLeaf = function (iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return true;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				var oContext = this.getContextByIndex(iIndex);
				return oContext
					? oContext.getProperty("@$ui5.node.isExpanded") === undefined
					: true;
			default:
				var oNode = this.getNodeByIndex(iIndex);
				return !oBinding.nodeHasChildren(oNode);
		}
	};

	/**
	 * Retrieves a node object by an index.
	 * @param {int} iIndex Index of the node
	 * @returns {undefined|sap.ui.model.Context|object} Returns <code>undefined</code>
	 * if no binding is given, a binding context if the binding is a OData V4 binding
	 * and by default a node object.
	 */
	TreeBindingProxy.prototype.getNodeByIndex = function(iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return undefined;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				return this.getContextByIndex(iIndex);
			default:
				return oBinding.getNodeByIndex(iIndex);
		}
	};

	/**
	 * Retrieves the context of a node by an index.
	 * @param {int} iIndex Index of the node
	 * @returns {undefined|sap.ui.model.Context} Binding context of the node or undefined
	 * if no binding exists
	 */
	TreeBindingProxy.prototype.getContextByIndex = function (iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return undefined;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				return oBinding.getContexts(iIndex, 1, 0, true)[0];
			default:
				return oBinding.getContextByIndex(iIndex);
		}
	};

	/**
	 * Returns the expansion state of a node.
	 * @param {int} iIndex Index of the node
	 * @returns {boolean} Always returns <code>false</code> if binding is undefined,
	 * otherwise returns the expansion state.
	 */
	TreeBindingProxy.prototype.isExpanded = function (iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return false;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				var oContext = this.getContextByIndex(iIndex);
				return oContext ? !!oContext.getProperty("@$ui5.node.isExpanded") : false;
			default:
				return oBinding ? oBinding.isExpanded(iIndex) : false;
		}
	};

	/**
	 * Expands the nodes for  the given indices.
	 * @param {int|int[]} vIndices A single index, or an array of indices
	 * of the nodes to be expanded
	 */
	TreeBindingProxy.prototype.expand = function (vIndices) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);
		var mSettings = {
			proxy: this,
			binding: oBinding,
			indices: vIndices,
			expanded: true
		};

		if (typeof mSettings.indices === "number") {
			mSettings.indices = [vIndices];
		}

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				changeExpandedStateV4(mSettings);
				break;
			default:
				changeExpandedStatePreV4(mSettings);
		}
	};

	/**
	 * Collapses the nodes for the given indices.
	 * @param {int|int[]} vIndices A single index, or an array of indices of the nodes
	 * to be collapsed
	 */
	TreeBindingProxy.prototype.collapse = function (vIndices) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);
		var mSettings = {
			proxy: this,
			binding: oBinding,
			indices: vIndices,
			expanded: false
		};

		if (typeof mSettings.indices === "number") {
			mSettings.indices = [vIndices];
		}

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				changeExpandedStateV4(mSettings);
				break;
			default:
				changeExpandedStatePreV4(mSettings);
		}
	};

	/**
	 * Changes the expansion state for "older" bindings, such as ODataV2, ODataV1, etc.
	 * @param {object} mSettings settings object
	 * @param {object} mSettings.proxy proxy object
	 * @param {sap.ui.model.Binding} mSettings.binding binding
	 * @param {int|int[]} mSettings.indices A single index, or an array of indices
	 * of the to be changed nodes
	 * @param {boolean} mSettings.expanded If true, state will be changed to
	 * expanded otherwise to collapsed.
	 */
	function changeExpandedStatePreV4(mSettings) {
		// Operations need to be performed from the highest index to the lowest.
		// This ensures correct results with ODataV2 bindings. The indices
		// are sorted ascending, so the array is iterated backwards.

		var aValidSortedIndices = mSettings.indices.filter(function(iIndex) {
			// Only indices of existing, expandable/collapsible nodes must be considered.
			// Otherwise there might be no change event on the final
			// expand/collapse (Client + ODataV2).
			return iIndex >= 0
				&& iIndex < mSettings.binding.getLength()
				&& !mSettings.proxy.isLeaf(iIndex)
				&& mSettings.expanded !== mSettings.proxy.isExpanded(iIndex);
		}).sort(function(a, b) { return a - b; });

		if (aValidSortedIndices.length === 0) {
			return;
		}

		// Expand/Collapse all nodes except the first, and suppress the change event.
		for (var i = aValidSortedIndices.length - 1; i > 0; i--) {
			if (mSettings.expanded) {
				mSettings.binding.expand(aValidSortedIndices[i], true);
			} else {
				mSettings.binding.collapse(aValidSortedIndices[i], true);
			}
		}

		// Expand/Collapse the first node without suppressing the change event.
		if (mSettings.expanded) {
			mSettings.binding.expand(aValidSortedIndices[0], false);
		} else {
			mSettings.binding.collapse(aValidSortedIndices[0], false);
		}
	}

	/**
	 * Changes the expansion state for ODataV4 bindings.
	 * @param {object} mSettings settings object
	 * @param {object} mSettings.proxy proxy object
	 * @param {sap.ui.model.Binding} mSettings.binding binding
	 * @param {int|int[]} mSettings.indices A single index, or an array of indices of
	 * the to be changed nodes
	 * @param {boolean} mSettings.expanded If true, state will be changed to expanded
	 * otherwise to collapsed.
	 */
	function changeExpandedStateV4(mSettings) {
		for (var i = 0; i < mSettings.indices.length; i++) {
			var oContext = mSettings.proxy.getContextByIndex(mSettings.indices[i]);

			if (oContext) {
				if (mSettings.expanded) {
					oContext.expand();
				} else {
					oContext.collapse();
				}
			}
		}
	}

	/**
	 * Toggles the expansion state for the given node index.
	 * @param {int} iIndex Index of the node
	 */
	TreeBindingProxy.prototype.toggleExpandedState = function (iIndex) {
		if (this.isExpanded(iIndex)) {
			this.collapse(iIndex);
		} else {
			this.expand(iIndex);
		}
	};

	/**
	 * Retrieves the contexts for a given range.
	 * @param {int} iStartIndex start index
	 * @param {int} iLength length to retrieve
	 * @param {int} iThreshold threshold
	 * @returns {sap.ui.model.Context[]|object[]} Returns empty array if binding is
	 * <code>undefined</code>, list of contexts in OData V4 case or by default an array
	 * of node objects.
	 */
	TreeBindingProxy.prototype.getContexts = function(iStartIndex, iLength, iThreshold,
		bKeepCurrent) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);
		var aContexts = [];

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				aContexts =  oBinding.getContexts(iStartIndex, iLength, iThreshold, bKeepCurrent);
				aContexts.forEach(function (oContext) {
					if (!oContext) {
						return;
					}

					oContext._mProxyInfo = {};
					oContext._mProxyInfo.level = getLevelFromObject(oContext, false);
					oContext._mProxyInfo.isLeaf = oContext.getProperty("@$ui5.node.isExpanded")
						=== undefined;
					oContext._mProxyInfo.isExpanded = !!oContext
						.getProperty("@$ui5.node.isExpanded");
				}, this);
				break;
			default:
				var aNodes = oBinding ? oBinding.getNodes(iStartIndex, iLength, iThreshold) : [];
				aNodes.forEach(function (oNode, iIndex) {
					if (!oNode) {
						return;
					}

					var iRowIndex = iIndex + iStartIndex;
					var oContext = oNode.context;

					if (oContext) {
						oContext._mProxyInfo = {};

						if (oNode.nodeState) {
							oContext._mProxyInfo.nodeState = oNode.nodeState;
						}

						oContext._mProxyInfo.level = getLevelFromObject(oNode, true);
						oContext._mProxyInfo.isLeaf = !oBinding.nodeHasChildren(oNode);
						oContext._mProxyInfo.isExpanded = oBinding.isExpanded(iRowIndex);

						aContexts.push(oNode.context);
					}
				}, this);
				break;
		}

		return aContexts;
	};

	/**
	 * Retrieves the level property from a given object.
	 * @param {object|sap.ui.model.Context} oObject object to retrieve the level from, either
	 * a node or a binding context
	 * @param {boolean} bIsNode indicates whether the given object is a node or a binding context
	 * @returns {undefined|int} If the object does not exist, returns undefined otherwise the level
	 */
	function getLevelFromObject(oObject, bIsNode) {
		if (oObject) {
			return bIsNode ? oObject.level + 1 : oObject.getProperty("@$ui5.node.level");
		}
	}

	function expandToV4(oBinding, iLevel) {
		var oAggregation = Object.assign(oBinding.getAggregation(), {
			expandTo: iLevel
		});
		oBinding.setAggregation(oAggregation);
	}

	/**
	 * Collapses all nodes.
	 */
	TreeBindingProxy.prototype.collapseAll = function () {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				expandToV4(oBinding, 1);
				break;
			default:
				oBinding.collapseToLevel(0);
		}
	};

	/**
	 * Expands the tree to the given level.
	 * @param {int} iLevel target level
	 */
	TreeBindingProxy.prototype.expandToLevel = function (iLevel) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				expandToV4(oBinding, iLevel);
				break;
			default:
				if (oBinding.expandToLevel) {
					oBinding.expandToLevel(iLevel);
				} else {
					assert(oBinding.expandToLevel, "Expanding all nodes to a certain level"
						+ " is not supported with your current binding.");
				}
		}
	};

	/**
	 * Sets the root level.
	 * @param {int} iRootLevel root level
	 */
	TreeBindingProxy.prototype.setRootLevel = function(iRootLevel) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				throw Error("Setting the root level is not supported with your current binding.");
			default:
				if (oBinding.setRootLevel) {
					oBinding.setRootLevel(iRootLevel);
				} else {
					assert(oBinding.setRootLevel, "Setting the root level is not supported with"
						+ " your current binding.");
				}
		}
	};

	/**
	 * Sets recursive collapse.
	 * @param {boolean} bCollapseRecursive collapseRecursive
	 */
	TreeBindingProxy.prototype.setCollapseRecursive = function(bCollapseRecursive) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				break;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				throw Error("Setting 'collapseRecursive' is not supported with your"
					+ " current binding.");
			default:
				if (oBinding.setCollapseRecursive) {
					oBinding.setCollapseRecursive(bCollapseRecursive);
				} else {
					assert(oBinding.setCollapseRecursive, "Setting 'collapseRecursive' is"
						+ " not supported with your current binding.");
				}
		}
	};

	/**
	 * Retrieves the level for a given index of a node.
	 * @param {int} iIndex Index of the node
	 * @returns {int} level
	 */
	TreeBindingProxy.prototype.getLevel = function (iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return undefined;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				var oContext = this.getContextByIndex(iIndex);
				return getLevelFromObject(oContext, false);
			default:
				var oNode = this.getNodeByIndex(iIndex);
				return getLevelFromObject(oNode, true);
		}
	};

	/**
	 * Retrieves the amount of siblings for the given index of the node.
	 * @param {int} iIndex Index of the node
	 * @returns {int} Sibling count. If binding is undefined returns 0.
	 * In ODataV4 case will throw an error.
	 */
	TreeBindingProxy.prototype.getSiblingCount = function(iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return 0;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				throw Error("The number of siblings of a node cannot be determined"
					+ " with your current binding.");
			default:
				var oNode = this.getNodeByIndex(iIndex);
				return oNode && oNode.parent ? oNode.parent.children.length : 0;
		}
	};

	/**
	 * Retrieves the position of a node in the parent.
	 * @param {int} iIndex Index of the node
	 * @returns Position in parent. If binding is undefined returns -1.
	 * In ODataV4 case will throw an error.
	 */
	TreeBindingProxy.prototype.getPositionInParent = function(iIndex) {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
				return -1;
			case "sap.ui.model.odata.v4.ODataListBinding":
				if (!this._bEnableV4) {
					throw new Error("UnsupportedOperationException: OData V4 is not supported");
				}
				throw Error("The position of a node in its parent cannot be determined"
					+ " with your current binding.");
			default:
				var oNode = this.getNodeByIndex(iIndex);
				return oNode ? oNode.positionInParent : -1;
		}
	};

	/**
	 * Checks if the selection is supported.
	 * @returns {boolean} Selection support
	 *
	 * Note: If the binding is either undefined or an ODataV4 binding, selection is not supported.
	 */
	TreeBindingProxy.prototype.isSelectionSupported = function() {
		var oBinding = this._oControl.getBinding();
		var sTreeBinding = this._getBindingName(oBinding);

		switch (sTreeBinding) {
			case undefined:
			case "sap.ui.model.odata.v4.ODataListBinding":
				return false;
			default:
				return true;
		}
	};

	/**
	 * Applies legacy settings to the binding information. Only applicable for pre-ODataV4
	 * bindings.
	 * @param {object} oBindingInfo binding infos
	 * @param {object} mLegacySettings settings object
	 * @param {int} mLegacySettings.rootLevel root level
	 * @param {object} mLegacySettings.collapseRecursive collapse recursive
	 * @param {object} mLegacySettings.numberOfExpandedLevels number of expanded levels
	 */
	TreeBindingProxy.prototype.applyLegacySettingsToBindingInfo = function(oBindingInfo,
		mLegacySettings) {
		if (!oBindingInfo.parameters) {
			oBindingInfo.parameters = {};
		}

		if (!("rootLevel" in oBindingInfo.parameters)
			&& mLegacySettings.rootLevel !== undefined) {
			oBindingInfo.parameters.rootLevel = mLegacySettings.rootLevel;
		}

		if (!("collapseRecursive" in oBindingInfo.parameters)
			&& mLegacySettings.collapseRecursive !== undefined) {
			oBindingInfo.parameters.collapseRecursive = mLegacySettings.collapseRecursive;
		}

		if (!("numberOfExpandedLevels" in oBindingInfo.parameters)
			&& mLegacySettings.numberOfExpandedLevels !== undefined) {
			oBindingInfo.parameters.numberOfExpandedLevels
				= mLegacySettings.numberOfExpandedLevels;
		}
	};

	/**
	 * Retrieves the binding name for a given binding.
	 * @param {sap.ui.model.Binding} oBinding binding object
	 * @returns {string|undefined} Name of the binding or undefined if the binding does not exist.
	 */
	TreeBindingProxy.prototype._getBindingName = function (oBinding) {
		assert(oBinding, "Control does not have a binding.");
		return oBinding ? oBinding.getMetadata().getName() : undefined;
	};

	return TreeBindingProxy;
});
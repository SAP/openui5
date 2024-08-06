/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._TreeState
sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	//*********************************************************************************************
	// _TreeState
	//*********************************************************************************************
	/**
	 * A class holding the tree state for a recursive hierarchy. It keeps track which nodes have
	 * been manually expanded resp. collapsed and is able to build the "ExpandLevels" parameter for
	 * the "TopLevels" request (see {@link #getExpandLevels}).
	 *
	 * @alias sap.ui.model.odata.v4.lib._TreeState
	 * @private
	 */
	class _TreeState {
		// maps predicate to node id and number of levels to expand
		mPredicate2ExpandLevels = {};

		// @see #getOutOfPlace
		mPredicate2OutOfPlace = {};

		/**
		 * Constructor for a new _TreeState.
		 * The tree state is only kept if a <code>sNodeProperty</code> is given.
		 *
		 * @param {string} [sNodeProperty] - The path to the node id property
		 * @param {function(object):string} fnGetKeyFilter
		 *   A function to calculate a node's key filter
		 *
		 * @public
		 */
		constructor(sNodeProperty, fnGetKeyFilter) {
			this.fnGetKeyFilter = fnGetKeyFilter;
			this.sNodeProperty = sNodeProperty;
		}

		/**
		 * Collapse a node.
		 *
		 * @param {object} oNode - The node
		 *
		 * @public
		 */
		collapse(oNode) {
			if (!this.sNodeProperty) {
				return;
			}

			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			const oExpandLevel = this.mPredicate2ExpandLevels[sPredicate];
			if (oExpandLevel && oExpandLevel.Levels !== 0) {
				delete this.mPredicate2ExpandLevels[sPredicate];
			} else {
				// must have NodeId as the node may be missing when calling #getExpandLevels
				const sNodeId = _Helper.drillDown(oNode, this.sNodeProperty);
				this.mPredicate2ExpandLevels[sPredicate] = {NodeID : sNodeId, Levels : 0};
			}
		}

		/**
		 * Delete all tree state information for the given node and all known descendants. Expects
		 * that the node is collapsed.
		 *
		 * @param {object} oNode - The node
		 *
		 * @public
		 */
		delete(oNode) {
			if (!this.sNodeProperty) {
				return;
			}

			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			delete this.mPredicate2ExpandLevels[sPredicate];
			this.deleteOutOfPlace(sPredicate);
			_Helper.getPrivateAnnotation(oNode, "spliced", []).forEach((oChild) => {
				this.delete(oChild);
			});
		}

		/**
		 * Deletes the expand levels for the given node and all its descendants.
		 *
		 * @param {object} oNode - The node
		 *
		 * @private
		 */
		deleteExpandLevels(oNode) {
			delete this.mPredicate2ExpandLevels[_Helper.getPrivateAnnotation(oNode, "predicate")];
			_Helper.getPrivateAnnotation(oNode, "spliced", []).forEach((oChild) => {
				this.deleteExpandLevels(oChild);
			});
		}

		/**
		 * Deletes a node and all its descendants from the out-of-place list (making them in-place).
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @param {boolean} [bUpAndDown] - Whether to start from top-most out-of-place ancestor
		 *
		 * @public
		 */
		deleteOutOfPlace(sPredicate, bUpAndDown) {
			if (!this.isOutOfPlace(sPredicate)) {
				return; // already in place
			}
			if (bUpAndDown) {
				for (;;) { // find top-most out-of-place ancestor
					const sParentPredicate = this.mPredicate2OutOfPlace[sPredicate].parentPredicate;
					if (!this.isOutOfPlace(sParentPredicate)) {
						break;
					}
					sPredicate = sParentPredicate;
				}
			}
			this.mPredicate2OutOfPlace[sPredicate].context.setOutOfPlace(false);
			delete this.mPredicate2OutOfPlace[sPredicate];
			Object.values(this.mPredicate2OutOfPlace).forEach((oOutOfPlace) => {
				if (oOutOfPlace.parentPredicate === sPredicate) {
					this.deleteOutOfPlace(oOutOfPlace.nodePredicate);
				}
			});
		}

		/**
		 * Expand a node by the given number of levels.
		 *
		 * @param {object} oNode - The node
		 * @param {number} [iLevels=1]
		 *   The number of levels to expand, <code>iLevels >= Number.MAX_SAFE_INTEGER</code> can be
		 *   used to expand all levels
		 *
		 * @public
		 */
		expand(oNode, iLevels = 1) {
			if (!this.sNodeProperty) {
				return;
			}

			if (iLevels >= Number.MAX_SAFE_INTEGER) {
				iLevels = null;
				this.deleteExpandLevels(oNode);
			}
			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			const oExpandLevel = this.mPredicate2ExpandLevels[sPredicate];
			if (oExpandLevel && !oExpandLevel.Levels) {
				delete this.mPredicate2ExpandLevels[sPredicate];
			} else {
				// must have NodeId as the node may be missing when calling #getExpandLevels
				const sNodeId = _Helper.drillDown(oNode, this.sNodeProperty);
				this.mPredicate2ExpandLevels[sPredicate] = {NodeID : sNodeId, Levels : iLevels};
			}
		}

		/**
		 * Returns the ExpandLevels parameter to the TopLevels function describing the tree state in
		 * $apply.
		 *
		 * @returns {string|undefined} The ExpandLevels or undefined if no tree state is kept
		 *
		 * @public
		 */
		getExpandLevels() {
			const aExpandLevels = Object.values(this.mPredicate2ExpandLevels);
			return aExpandLevels.length ? JSON.stringify(aExpandLevels) : undefined;
		}

		/**
		 * Returns the out-of-place information for the node with the given key predicate.
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @returns {{nodeFilter : string, nodePredicate : string, parentFilter : string?, parentPredicate : string?}|undefined}
		 *   The out-of-place information or undefined if the node is in place
		 *
		 * @public
		 */
		getOutOfPlace(sPredicate) {
			return this.mPredicate2OutOfPlace[sPredicate];
		}

		/**
		 * Returns the number of out-of-place nodes.
		 *
		 * @returns {number} The number of out-of-place nodes
		 *
		 * @public
		 */
		getOutOfPlaceCount() {
			return this.getOutOfPlacePredicates().length;
		}

		/**
		 * Returns information about the out-of-place nodes grouped by parent.
		 *
		 * @returns {Array<{nodeFilters : string[], nodePredicates : string[], parentFilter : string?, parentPredicate : string?}>}
		 *   A list of out-of-place nodes grouped by parent. Each entry contains all out-of-place
		 *   nodes for a parent (root nodes if parentFilter and parentPredicate are undefined) in
		 *   the order in which they were created.
		 *
		 * @public
		 */
		getOutOfPlaceGroupedByParent() {
			const mOutOfPlaceGroupedByParent = {};
			for (const oOutOfPlace of Object.values(this.mPredicate2OutOfPlace)) {
				const sParentPredicate = oOutOfPlace.parentPredicate;
				const oOutOfPlaceByParent = mOutOfPlaceGroupedByParent[sParentPredicate] ??= {
					nodeFilters : [],
					nodePredicates : [],
					parentFilter : oOutOfPlace.parentFilter,
					parentPredicate : sParentPredicate
				};
				oOutOfPlaceByParent.nodeFilters.push(oOutOfPlace.nodeFilter);
				oOutOfPlaceByParent.nodePredicates.push(oOutOfPlace.nodePredicate);
			}
			return Object.values(mOutOfPlaceGroupedByParent);
		}

		/**
		 * Returns the key predicates of all out-of-place nodes.
		 *
		 * @returns {string[]} The key predicates of all out-of-place nodes
		 *
		 * @public
		 */
		getOutOfPlacePredicates() {
			return Object.keys(this.mPredicate2OutOfPlace);
		}

		/**
		 * Tells whether the node with the given key predicate is currently out of place.
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @returns {boolean} Whether the node is out of place
		 *
		 * @public
		 */
		isOutOfPlace(sPredicate) {
			return sPredicate in this.mPredicate2OutOfPlace;
		}

		/**
		 * Resets the tree state.
		 *
		 * @public
		 */
		reset() {
			this.mPredicate2ExpandLevels = {};
			this.resetOutOfPlace();
		}

		/**
		 * Resets all out-of-place information.
		 *
		 * @public
		 */
		resetOutOfPlace() {
			this.getOutOfPlacePredicates()
				.forEach((sPredicate) => this.deleteOutOfPlace(sPredicate));
		}

		/**
		 * Makes the ("created persisted"!) node out of place.
		 *
		 * @param {object} oNode - The node
		 * @param {object} [oParent] - The parent, unless the node is a root
		 * @throws {Error} If the node is not 'created persisted'
		 *
		 * @public
		 */
		setOutOfPlace(oNode, oParent) {
			if (oNode["@$ui5.context.isTransient"] !== false) {
				throw new Error("Not 'created persisted'");
			}
			const oOutOfPlace = {
				context : _Helper.getPrivateAnnotation(oNode, "context"),
				nodeFilter : this.fnGetKeyFilter(oNode),
				nodePredicate : _Helper.getPrivateAnnotation(oNode, "predicate")
			};
			oOutOfPlace.context.setOutOfPlace(true);
			if (oParent) {
				oOutOfPlace.parentFilter = this.fnGetKeyFilter(oParent);
				oOutOfPlace.parentPredicate = _Helper.getPrivateAnnotation(oParent, "predicate");
			}
			this.mPredicate2OutOfPlace[oOutOfPlace.nodePredicate] = oOutOfPlace;
		}

		/**
		 * The given node is still out of place and thus must keep a client-side annotation
		 * <code>"@$ui5.context.isTransient"</code> as well as a private annotation "context".
		 *
		 * @param {object} oNode - The node
		 * @param {string} sPredicate - The node's key predicate
		 *
		 * @public
		 */
		stillOutOfPlace(oNode, sPredicate) {
			oNode["@$ui5.context.isTransient"] = false;
			_Helper.setPrivateAnnotation(oNode, "context",
				this.mPredicate2OutOfPlace[sPredicate].context);
		}
	}

	return _TreeState;
});

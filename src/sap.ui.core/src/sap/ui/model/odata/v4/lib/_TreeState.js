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
	 * A class holding the tree state for recursive hierarchies. It keeps track which nodes have
	 * been manually expanded resp. collapsed and is able to build the "ExpandLevels" parameter for
	 * the "TopLevels" request (see {@link #getExpandLevels}).
	 *
	 * @alias sap.ui.model.odata.v4.lib._TreeState
	 * @private
	 */
	class _TreeState {
		// maps predicate to node id and number of levels to expand
		mPredicate2ExpandLevels = {};

		// @see #getOutOfPlaceGroupedByParent
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
			if (oExpandLevel && oExpandLevel.Levels) {
				delete this.mPredicate2ExpandLevels[sPredicate];
			} else {
				// must have NodeId as the node may be missing when calling #getExpandLevels
				const sNodeId = _Helper.drillDown(oNode, this.sNodeProperty);
				this.mPredicate2ExpandLevels[sPredicate] = {NodeID : sNodeId, Levels : 0};
			}
		}

		/**
		 * Delete a node.
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
		}

		/**
		 * Deletes a node and all its descendants from the out-of-place list (making them in-place).
		 *
		 * @param {string} sPredicate - The node's key predicate
		 *
		 * @public
		 */
		deleteOutOfPlace(sPredicate) {
			delete this.mPredicate2OutOfPlace[sPredicate];
			Object.values(this.mPredicate2OutOfPlace).forEach((oOutOfPlace) => {
				if (oOutOfPlace.parentPredicate === sPredicate) {
					this.deleteOutOfPlace(oOutOfPlace.nodePredicate);
				}
			});
		}

		/**
		 * Expand a node.
		 *
		 * @param {object} oNode - The node
		 *
		 * @public
		 */
		expand(oNode) {
			if (!this.sNodeProperty) {
				return;
			}

			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			const oExpandLevel = this.mPredicate2ExpandLevels[sPredicate];
			if (oExpandLevel && !oExpandLevel.Levels) {
				delete this.mPredicate2ExpandLevels[sPredicate];
			} else {
				// must have NodeId as the node may be missing when calling #getExpandLevels
				const sNodeId = _Helper.drillDown(oNode, this.sNodeProperty);
				this.mPredicate2ExpandLevels[sPredicate] = {NodeID : sNodeId, Levels : 1};
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
		 * Returns the number of out-of-place nodes.
		 * @returns {number} The number of out-of-place nodes
		 *
		 * @public
		 */
		getOutOfPlaceCount() {
			return Object.keys(this.mPredicate2OutOfPlace).length;
		}

		/**
		 * Resets the tree state.
		 *
		 * @public
		 */
		reset() {
			this.mPredicate2ExpandLevels = {};
			this.mPredicate2OutOfPlace = {};
		}

		/**
		 * Makes the node out of place.
		 *
		 * @param {object} oNode - The node
		 * @param {object} [oParent] - The parent, unless the node is a root
		 *
		 * @public
		 */
		setOutOfPlace(oNode, oParent) {
			const oOutOfPlace = {
				nodeFilter : this.fnGetKeyFilter(oNode),
				nodePredicate : _Helper.getPrivateAnnotation(oNode, "predicate")
			};
			if (oParent) {
				oOutOfPlace.parentFilter = this.fnGetKeyFilter(oParent);
				oOutOfPlace.parentPredicate = _Helper.getPrivateAnnotation(oParent, "predicate");
			}
			this.mPredicate2OutOfPlace[oOutOfPlace.nodePredicate] = oOutOfPlace;
		}
	}

	return _TreeState;
});

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

		// @see #getOutOfPlace
		oOutOfPlace = undefined;

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
		 * Returns information about the out-of-place nodes.
		 *
		 * @returns {{nodeFilters : string[], nodePredicates : string[], parentFilter : string?}|undefined}
		 *   The current out-of-place infos, or <code>undefined</code> if no node is out of place
		 *
		 * @public
		 */
		getOutOfPlace() {
			return this.oOutOfPlace;
		}

		/**
		 * Resets the tree state.
		 *
		 * @public
		 */
		reset() {
			this.mPredicate2ExpandLevels = {};
			this.oOutOfPlace = undefined;
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
			this.oOutOfPlace ??= {nodeFilters : [], nodePredicates : []};
			this.oOutOfPlace.parentFilter = oParent && this.fnGetKeyFilter(oParent);
			this.oOutOfPlace.nodeFilters.push(this.fnGetKeyFilter(oNode));
			this.oOutOfPlace.nodePredicates.push(_Helper.getPrivateAnnotation(oNode, "predicate"));
		}
	}

	return _TreeState;
});

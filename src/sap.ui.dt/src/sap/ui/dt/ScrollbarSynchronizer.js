/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DOMUtil"
],
function(
	ManagedObject,
	DOMUtil
) {
	"use strict";

	/**
	 * Class for Scrollbar Synchronizer.
	 *
	 * @class
	 * The ScrollbarSynchronizer helps to keep a set of targets up-to-date with the scrolling events of each other
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.54
	 * @alias sap.ui.dt.ScrollbarSynchronizer
	 */
	const ScrollbarSynchronizer = ManagedObject.extend("sap.ui.dt.ScrollbarSynchronizer", {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				scrollTop: {
					type: "float"	// replaced 'int' with 'float'. In some special cases (chrome on a retina mac) jquery returns a float value instead of int
				},
				scrollLeft: {
					type: "float"	// replaced 'int' with 'float'. In some special cases (chrome on a retina mac) jquery returns a float value instead of int
				},
				targets: {
					type: "any[]",
					defaultValue: []
				}
			},
			events: {
				synced: {},
				destroyed: {}
			}
		},
		_bSyncing: false,
		constructor: function(...aArgs) {
			this._scrollEventHandler = this._scrollEventHandler.bind(this);
			ManagedObject.apply(this, aArgs);
		}
	});

	/**
	 * Returns a copy of the targets array
	 * @return {Element[]} Returns an array with the target elements
	 */
	ScrollbarSynchronizer.prototype.getTargets = function() {
		return this.getProperty("targets").slice(0);
	};

	/**
	 * Removes previous target(s) and set new target(s)
	 * @param {Element|Element[]} vTarget Target element or array of target elements
	 */
	ScrollbarSynchronizer.prototype.setTargets = function(vTarget) {
		const aTargets = Array.isArray(vTarget) ? vTarget : [vTarget];

		// 1. detach scroll events from old targets
		this.getTargets().forEach(this.removeTarget.bind(this));

		// 2. attach scroll events to new targets
		this.addTarget(...aTargets);
	};

	/**
	 * Remove a target
	 * @param  {Element} oDomNode Target to be removed
	 */
	ScrollbarSynchronizer.prototype.removeTarget = function(oDomNode) {
		this._detachScrollEvent(oDomNode);
		this.setProperty(
			"targets",
			this.getTargets().filter(function(oTarget) {
				return oTarget !== oDomNode;
			})
		);
	};

	/**
	 * Add an arbitrary number of elements as targets
	 * Pass any number of elements to this function to add them as targets
	 */
	ScrollbarSynchronizer.prototype.addTarget = function(...aArgs) {
		const aTargets = Array.prototype.slice.call(aArgs);

		if (!aTargets.length) {
			return;
		}

		this._removeDeadNodes();
		aTargets.forEach(this._attachScrollEvent, this);
		const aNextTargets = this.getTargets().concat(aTargets);
		this.setProperty("targets", aNextTargets);
		this.sync(aNextTargets[0]);
	};

	/**
	 * Check if a Dom Node is a target for this Scrollbar Synchronizer
	 * @param  {Element}  oDomNode Element to be checked
	 * @return {boolean}          Returns true if the node is a target
	 */
	ScrollbarSynchronizer.prototype.hasTarget = function(oDomNode) {
		return this.getTargets().indexOf(oDomNode) > -1;
	};

	ScrollbarSynchronizer.prototype._removeDeadNodes = function() {
		this.getTargets().forEach(function(oDomNode) {
			if (!document.body.contains(oDomNode)) {
				this.removeTarget(oDomNode);
			}
		}, this);
	};

	ScrollbarSynchronizer.prototype._attachScrollEvent = function(oDomNode) {
		oDomNode.addEventListener("scroll", this._scrollEventHandler);
	};

	ScrollbarSynchronizer.prototype._detachScrollEvent = function(oDomNode) {
		oDomNode.removeEventListener("scroll", this._scrollEventHandler);
	};

	ScrollbarSynchronizer.prototype._scrollEventHandler = function(oEvent) {
		this.sync(oEvent.target);
	};

	/**
	 * Triggers the synchronization between two scroll target elements.
	 * @param {Element} oSourceDomNode Element that needs to be synchronized with its pair.
	 * @param {boolean} bForce Executes the synchronization even if the scroll values in both elements are the same.
	 */
	ScrollbarSynchronizer.prototype.sync = function(oSourceDomNode, bForce) {
		if (
			bForce
			|| this.getScrollTop() !== oSourceDomNode.scrollTop
			|| this.getScrollLeft() !== oSourceDomNode.scrollLeft
		) {
			this.setScrollTop(oSourceDomNode.scrollTop);
			this.setScrollLeft(oSourceDomNode.scrollLeft);

			if (this._bSyncing) {
				this._abortSync();
			}

			if (bForce) {
				// Synchronous fast-path for layout-driven calls (bForce=true):
				// apply positions immediately instead of scheduling a new requestAnimationFrame (rAF),
				// so the scroll correction lands in the same layout pass as the caller,
				// avoiding extra UpdateLayoutTree cycles from deferred rAF flushes.
				this._syncTargets(oSourceDomNode);
				this.fireSynced();
				return;
			}

			this._bSyncing = true;
			this.animationFrame = window.requestAnimationFrame(function() {
				this._syncTargets(oSourceDomNode);
				this._bSyncing = false;
				this.fireSynced();
			}.bind(this));
		}
	};

	ScrollbarSynchronizer.prototype._syncTargets = function(oSourceDomNode) {
		const aTargets = this.getTargets().filter((oDomNode) => oSourceDomNode !== oDomNode);
		DOMUtil.syncScroll(oSourceDomNode, aTargets);
	};

	ScrollbarSynchronizer.prototype._abortSync = function() {
		window.cancelAnimationFrame(this.animationFrame);
		this._bSyncing = false;
	};

	/**
	 * Destroys the Scrollbar Synchronizer
	 */
	ScrollbarSynchronizer.prototype.destroy = function(...aArgs) {
		this.getTargets().forEach(function(oDomNode) {
			this.removeTarget(oDomNode);
		}, this);
		this._abortSync();
		this.fireDestroyed();

		ManagedObject.prototype.destroy.apply(this, aArgs);
	};

	ScrollbarSynchronizer.prototype.isSyncing = function() {
		return this._bSyncing;
	};

	ScrollbarSynchronizer.prototype.refreshListeners = function() {
		this.getTargets().forEach(function(oDomNode) {
			this._detachScrollEvent(oDomNode);
			this._attachScrollEvent(oDomNode);
		}, this);
	};

	return ScrollbarSynchronizer;
});
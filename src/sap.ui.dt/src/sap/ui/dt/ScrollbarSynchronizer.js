/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DOMUtil",
	"sap/ui/thirdparty/jquery"
],
function(
	ManagedObject,
	DOMUtil,
	jQuery
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
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ScrollbarSynchronizer = ManagedObject.extend("sap.ui.dt.ScrollbarSynchronizer", {
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
		constructor: function () {
			this._scrollEventHandler = this._scrollEventHandler.bind(this);
			ManagedObject.apply(this, arguments);
		}
	});

	/**
	 * Returns a copy of the targets array
	 * @return {Element[]} Returns an array with the target elements
	 */
	ScrollbarSynchronizer.prototype.getTargets = function () {
		return this.getProperty('targets').slice(0);
	};

	/**
	 * Removes previous target(s) and set new target(s)
	 * @param {Element|Element[]} vTarget Target element or array of target elements
	 */
	ScrollbarSynchronizer.prototype.setTargets = function (vTarget) {
		var aTargets = Array.isArray(vTarget) ? vTarget : [vTarget];

		// 1. detach scroll events from old targets
		this.getTargets().forEach(this.removeTarget.bind(this));

		// 2. attach scroll events to new targets
		this.addTarget.apply(this, aTargets);
	};

	/**
	 * Remove a target
	 * @param  {Element} oDomNode Target to be removed
	 */
	ScrollbarSynchronizer.prototype.removeTarget = function (oDomNode) {
		this._detachScrollEvent(oDomNode);
		this.setProperty(
			'targets',
			this.getTargets().filter(function (oTarget) {
				return oTarget !== oDomNode;
			})
		);
	};

	/**
	 * Add an arbitrary number of elements as targets
	 * Pass any number of elements to this function to add them as targets
	 */
	ScrollbarSynchronizer.prototype.addTarget = function () {
		var aTargets = Array.prototype.slice.call(arguments);

		if (!aTargets.length) {
			return;
		}

		this._removeDeadNodes();
		aTargets.forEach(this._attachScrollEvent, this);
		var aNextTargets = this.getTargets().concat(aTargets);
		this.setProperty('targets', aNextTargets);
		this.sync(aNextTargets[0]);
	};

	/**
	 * Check if a Dom Node is a target for this Scrollbar Synchronizer
	 * @param  {Element}  oDomNode Element to be checked
	 * @return {Boolean}          Returns true if the node is a target
	 */
	ScrollbarSynchronizer.prototype.hasTarget = function (oDomNode) {
		return this.getTargets().indexOf(oDomNode) > -1;
	};

	ScrollbarSynchronizer.prototype._removeDeadNodes = function () {
		this.getTargets().forEach(function (oDomNode) {
			if (!document.body.contains(oDomNode)) {
				this.removeTarget(oDomNode);
			}
		}, this);
	};

	ScrollbarSynchronizer.prototype._attachScrollEvent = function (oDomNode) {
		jQuery(oDomNode).on("scroll", this._scrollEventHandler);
	};

	ScrollbarSynchronizer.prototype._detachScrollEvent = function (oDomNode) {
		jQuery(oDomNode).off("scroll", this._scrollEventHandler);
	};

	ScrollbarSynchronizer.prototype._scrollEventHandler = function (oEvent) {
		this.sync(oEvent.target);
	};

	ScrollbarSynchronizer.prototype.sync = function (oSourceDomNode, bForce) {
		if (
			bForce
			|| this.getScrollTop() !== oSourceDomNode.scrollTop
			|| this.getScrollLeft() !== oSourceDomNode.scrollLeft
		) {
			this.setScrollTop(oSourceDomNode.scrollTop);
			this.setScrollLeft(oSourceDomNode.scrollLeft);

			if (!this._bSyncing) {
				this._bSyncing = true;
				this.animationFrame = window.requestAnimationFrame(function () {
					this.getTargets()
						.filter(function (oDomNode) {
							return oSourceDomNode !== oDomNode;
						})
						.forEach(function (oDomNode) {
							DOMUtil.syncScroll(oSourceDomNode, oDomNode);
						});
					this.fireSynced();
					this._bSyncing = false;
				}.bind(this));
			}
		}
	};

	/**
	 * Destroys the Scrollbar Synchronizer
	 */
	ScrollbarSynchronizer.prototype.destroy = function () {
		this.getTargets().forEach(function (oDomNode) {
			this.removeTarget(oDomNode);
		}, this);
		window.cancelAnimationFrame(this.animationFrame);
		this._bSyncing = false;
		this.fireDestroyed();

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	ScrollbarSynchronizer.prototype.isSyncing = function () {
		return this._bSyncing;
	};

	ScrollbarSynchronizer.prototype.refreshListeners = function () {
		this.getTargets().forEach(function (oDomNode) {
			this._detachScrollEvent(oDomNode);
			this._attachScrollEvent(oDomNode);
		}, this);
	};

	return ScrollbarSynchronizer;
});
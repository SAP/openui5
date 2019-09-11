/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.MutationObserver.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DOMUtil",
	"sap/base/util/restricted/_intersection"
], function(
	jQuery,
	OverlayUtil,
	ManagedObject,
	DOMUtil,
	_intersection
) {
	"use strict";

	/**
	 * Constructor for a new MutationObserver.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The MutationObserver observes changes of a ManagedObject and propagates them via events.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.MutationObserver
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be modified in future.
	 */
	var MutationObserver = ManagedObject.extend("sap.ui.dt.MutationObserver", /** @lends sap.ui.dt.MutationObserver.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			events: {
			/**
			 * Event fired when the observed object is modified or some changes which might affect dom position and styling of overlays happens
			 */
				domChanged: {
					parameters: {
						type: {
							type : "string"
						},
						targetNodes: {
							type : "element[]"
						}
					}
				}
			}
		}
	});

	MutationObserver.prototype.init = function() {
		this._fireDomChangeOnTransitionEnd = this._fireDomChangeOnTransitionEnd.bind(this);
		this._fireDomChangeOnAnimationEnd = this._fireDomChangeOnAnimationEnd.bind(this);
		this._fireDomChangeOnResize = this._fireDomChangeOnResize.bind(this);
		this._fireDomChangeOnScroll = this._fireDomChangeOnScroll.bind(this);

		window.addEventListener("transitionend", this._fireDomChangeOnTransitionEnd, true);
		window.addEventListener("animationend", this._fireDomChangeOnAnimationEnd, true);
		window.addEventListener("scroll", this._fireDomChangeOnScroll, true);
		jQuery(window).on("resize", this._fireDomChangeOnResize);

		this._aIgnoredMutations = [];
		this._aWhiteList = [];

		this._startMutationObserver();
	};

	/**
	 * Called when the MutationObserver is destroyed
	 *
	 * @protected
	 */
	MutationObserver.prototype.exit = function() {
		this._stopMutationObserver();

		window.removeEventListener("transitionend", this._fireDomChangeOnTransitionEnd, true);
		window.removeEventListener("animationend", this._fireDomChangeOnAnimationEnd, true);
		window.removeEventListener("scroll", this._fireDomChangeOnScroll, true);
		jQuery(window).off("resize", this._fireDomChangeOnResize);
	};

	/**
	 * Ignores a mutation once
	 *
	 * @param {object} mParams - Map of params
	 * @param {HTMLElement} mParams.target - DOM Node of the target
	 * @param {string} mParams.type - Type of the mutation, possible values = childList | attributes, see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord}
	 */
	MutationObserver.prototype.ignoreOnce = function (mParams) {
		this._aIgnoredMutations.push(mParams);
	};

	MutationObserver.prototype.addToWhiteList = function (sId) {
		this._aWhiteList.push(sId);
	};

	MutationObserver.prototype.removeFromWhiteList = function (sId) {
		this._aWhiteList = this._aWhiteList.filter(function (sCurrentId) {
			return sCurrentId !== sId;
		});
	};

	MutationObserver.prototype._isRelevantNode = function (oNode) {
		return (
			// 1. Mutation happened in Node which is still in actual DOM Tree
			// Must be always on the first place since sometimes mutations for detached nodes may come
			document.body.contains(oNode)

			// 2. Ignore direct mutation on static area Node
			&& oNode.getAttribute('id') !== 'sap-ui-static'

			// 3. Node is not part of preserve area
			&& !DOMUtil.contains('sap-ui-preserve', oNode)

			// 4. Node must be white listed OR meet certain criteria
			&& (
				this._aWhiteList.some(function (sId) {
					return (
						// 4.1. Target Node is inside one of the white listed element
						DOMUtil.contains(sId, oNode)
						// 4.2. Target Node is an ancestor of one of the white listed element, but not a static area
						|| oNode.contains(document.getElementById(sId))
					);
				})
			)
		);
	};

	MutationObserver.prototype._isRelevantMutation = function (oMutation) {
		return (
			this._isRelevantNode(this._getTargetNode(oMutation))
			|| (
				oMutation.target.id === 'sap-ui-static'
				&& _intersection(
					[]
						.concat(
							Array.prototype.slice.call(oMutation.addedNodes),
							Array.prototype.slice.call(oMutation.removedNodes)
						)
						.map(function (oNode) {
							return oNode.id;
						}),
					this._aWhiteList
				).length > 0
			)
		);
	};

	MutationObserver.prototype._getTargetNode = function (oMutation) {
		// text mutations have no class list, so we use a parent node as a target
		return (
			oMutation.type === "characterData"
			? oMutation.target.parentNode
			: oMutation.target
		);
	};

	MutationObserver.prototype._startMutationObserver = function () {
		this._oMutationObserver = new window.MutationObserver(function(aMutations) {
			var aTargetNodes = [];
			aMutations.forEach(function(oMutation) {
				if (this._isRelevantMutation(oMutation)) {
					var oTarget = this._getTargetNode(oMutation);
					var bIgnore = this._aIgnoredMutations.some(function(oIgnoredMutation, iIndex, aSource) {
						if (
							oIgnoredMutation.target === oMutation.target
							&& (!oIgnoredMutation.type || oIgnoredMutation.type === oMutation.type)
						) {
							aSource.splice(iIndex, 1);
							return true;
						}
					});

					if (!bIgnore) {
						aTargetNodes.push(oTarget);
					}
				}
			}.bind(this));

			if (aTargetNodes.length) {
				this.fireDomChanged({
					type: "mutation",
					targetNodes: aTargetNodes
				});
			}
		}.bind(this));

		// we should observe whole DOM, otherwise position change of elements can be triggered via outter changes
		// (like change of body size, container insertions etc.)
		this._oMutationObserver.observe(window.document, {
			childList : true,
			subtree : true,
			attributes : true,
			attributeFilter : ["style", "class", "width", "height", "border"],
			characterData : true // also observe text node changes, see https://dom.spec.whatwg.org/#characterdata
		});
	};

	MutationObserver.prototype._stopMutationObserver = function() {
		if (this._oMutationObserver) {
			this._oMutationObserver.disconnect();
			delete this._oMutationObserver;
		}
	};

	MutationObserver.prototype._fireDomChangeOnTransitionEnd = function () {
		this.fireDomChanged({
			type: "transitionend"
		});
	};


	MutationObserver.prototype._fireDomChangeOnAnimationEnd = function () {
		this.fireDomChanged({
			type: "animationend"
		});
	};

	MutationObserver.prototype._fireDomChangeOnResize = function () {
		this.fireDomChanged({
			type: "resize"
		});
	};

	MutationObserver.prototype._fireDomChangeOnScroll = function (oEvent) {
		var oTarget = oEvent.target;
		if (
			this._isRelevantNode(oTarget)
			&& !OverlayUtil.getClosestOverlayForNode(oTarget)
			// The line below is required to avoid double scrollbars on the browser
			// when the document is scrolled to negative values (relevant for Mac)
			&& oTarget !== document
		) {
			this.fireDomChanged({
				type: "scroll"
			});
		}
	};

	return MutationObserver;
});
/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.MutationObserver.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DOMUtil",
	"sap/base/util/restricted/_intersection",
	"sap/base/util/restricted/_uniq"
], function(
	jQuery,
	OverlayUtil,
	ManagedObject,
	DOMUtil,
	_intersection,
	_uniq
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
		this._mutationOnTransitionend = this._callDomChangedCallback.bind(this, "MutationOnTransitionend");
		this._mutationOnAnimationEnd = this._callDomChangedCallback.bind(this, "MutationOnAnimationEnd");
		this._fireDomChangeOnScroll = this._fireDomChangeOnScroll.bind(this);
		this._mutationOnResize = this._callDomChangedCallbackWithRoot.bind(this, "MutationOnResize");

		window.addEventListener("transitionend", this._mutationOnTransitionend, true);
		window.addEventListener("animationend", this._mutationOnAnimationEnd, true);
		window.addEventListener("scroll", this._fireDomChangeOnScroll, true);
		jQuery(window).on("resize", this._mutationOnResize);

		this._aIgnoredMutations = [];
		this._bHandlerRegistred = false;
		this._mMutationHandlers = {};

		this._startMutationObserver();
	};

	/**
	 * Called when the MutationObserver is destroyed
	 *
	 * @protected
	 */
	MutationObserver.prototype.exit = function() {
		this._stopMutationObserver();

		window.removeEventListener("transitionend", this._mutationOnTransitionend, true);
		window.removeEventListener("animationend", this._mutationOnAnimationEnd, true);
		window.removeEventListener("scroll", this._fireDomChangeOnScroll, true);
		jQuery(window).off("resize", this._mutationOnResize);

		this._aIgnoredMutations = [];
		this._bHandlerRegistred = false;
		this._mMutationHandlers = {};
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

	/**
	 * Register mutation handler for an overlay.
	 * @param {string} sId - Overlay id as registration key
	 * @param {function} fnDomChangedHandler - Callbackfunction is called on a mutation for the overlay
	 * @param {boolean} [bIsRoot] - <code>true</code> if overlay is a root overlay
	 */
	MutationObserver.prototype.registerHandler = function (sId, fnDomChangedHandler, bIsRoot) {
		if (!this._mMutationHandlers[sId]) {
			this._mMutationHandlers[sId] = [];
			this._bHandlerRegistred = true;
		}
		this._mMutationHandlers[sId].push(fnDomChangedHandler);
		if (bIsRoot) {
			this._sRootId = sId;
		}
	};

	/**
	 * Deregister mutation handler for an overlay.
	 * @param {string} sId - Overlay id as registration key
	 */
	MutationObserver.prototype.deregisterHandler = function (sId) {
		delete this._mMutationHandlers[sId];
		if (Object.keys(this._mMutationHandlers).length === 0) {
			this._bHandlerRegistred = false;
		}
		if (sId === this._sRootId) {
			this._sRootId = undefined;
		}
	};

	MutationObserver.prototype._hasScrollbar = function (bScrollbarOnElement, $Element) {
		return bScrollbarOnElement || DOMUtil.hasScrollBar($Element);
	};

	MutationObserver.prototype._getIdsWhenRegistered = function (bScrollbarOnElement, sElementId, mElementIds) {
		var sRegisteredParentId;
		if (sElementId && this._mMutationHandlers[sElementId]) {
			sRegisteredParentId = sElementId;
			// remember the closest registered element id on mutated dom node
			if (!mElementIds.closestElementInWhitlist) {
				mElementIds.closestElementInWhitlist = sElementId;
			}
		}
		mElementIds.result = bScrollbarOnElement ? sRegisteredParentId : mElementIds.closestElementInWhitlist;
		return mElementIds;
	};

	/*
	 * Searching for closest element that is registered but we also need to consider the scrollbar usecase.
	 * Unfortunately we are not notified from MutationObserver when scrollbars appears on parent controls. Let's asume
	 * we got a mutation from a node inside a container that is also mutated with a new scrollbar (but without own mutations).
	 * Then we need to handle the mutation not only for the triggering element but for the container element that mutated with
	 * the scrollbar. In this regard we need to consider the following possible cases:
	 *
	 *  Return values:
	 *		1. registered element with scrollbar (on the same element or in children) found
	 *			=> returns the last registered element id
	 *		2. registered element found but no scrollbar element available on parents
	 *			=> returns the closest element id registered on mutated node
	 *		3. registered element with scrollbar element available on parents but not registered itself and without own registered parents found
	 *			=> returns the closest element id registered on mutated node
	 *		4. registered element with scrollbar element available on parents and is registered itself of with own registered parents found
	 *			=> returns the closest element id registered on scrollbar element
	 *		5. no registered element available
	 *			=> undefined
	 */
	MutationObserver.prototype._getClosestParentIdForNodeRegisteredWithScrollbar = function (sNodeId, oNode) {
		var mElementIds = {
			closestElementInWhitlist: undefined,
			result: undefined
		};
		var bScrollbarOnElement = false;
		var $ClosestParentElement = jQuery(oNode);
		var sClosestParentElementId = sNodeId;

		do {
			bScrollbarOnElement = this._hasScrollbar(bScrollbarOnElement, $ClosestParentElement);
			mElementIds = this._getIdsWhenRegistered(bScrollbarOnElement, sClosestParentElementId, mElementIds);
			$ClosestParentElement = $ClosestParentElement.parent();
			// $Element could also be a dome node without data-sap-ui attribute
			sClosestParentElementId = $ClosestParentElement.attr("data-sap-ui");
		} while (
			!(mElementIds.result && bScrollbarOnElement)
			&& $ClosestParentElement.length
			&& $ClosestParentElement[0] !== document
		);

		return mElementIds.result || mElementIds.closestElementInWhitlist/* when element with scrollbar and his parents are not registered */;
	};

	MutationObserver.prototype._getRelevantElementId = function (oNode) {
		var sNodeId = oNode && oNode.getAttribute && oNode.getAttribute('id');
		if (
			// 1. Filter out overlay mutations
			!DOMUtil.contains("overlay-container", oNode)

			// 2. Mutation happened in Node which is still in actual DOM Tree
			// Must be always on the first place since sometimes mutations for detached nodes may come
			&& document.body.contains(oNode)

			// 3. Ignore direct mutation on static area Node
			&& sNodeId !== "sap-ui-static"

			// 4. Node is not part of preserve area
			&& !DOMUtil.contains("sap-ui-preserve", oNode)

		) {
			// 4.1, OR the closest element need to be white listed
			var sRelevantElementId = this._getClosestParentIdForNodeRegisteredWithScrollbar(sNodeId, oNode);
			if (sRelevantElementId) {
				return sRelevantElementId;
			}
			// 4.2. Target Node is an ancestor of the root element, but not a static area
			return (this._sRootId && oNode.contains(document.getElementById(this._sRootId))) ? this._sRootId : undefined;
		}
		return undefined;
	};

	MutationObserver.prototype._getRelevantElementIdsFromStaticArea = function (oMutation) {
		return oMutation.target.id === "sap-ui-static"
			&& 	_intersection(
				[]
					.concat(
						Array.prototype.slice.call(oMutation.addedNodes),
						Array.prototype.slice.call(oMutation.removedNodes)
					)
					.map(function (oNode) {
						return oNode.id;
					}),
				Object.keys(this._mMutationHandlers)
		);
	};

	MutationObserver.prototype._ignoreMutation = function(oMutation) {
		return this._aIgnoredMutations.some(function(oIgnoredMutation, iIndex, aSource) {
			if (
				oIgnoredMutation.target === oMutation.target
				&& (!oIgnoredMutation.type || oIgnoredMutation.type === oMutation.type)
			) {
				aSource.splice(iIndex, 1);
				return true;
			}
		});
	};

	MutationObserver.prototype._getTargetNode = function (oMutation) {
		// text mutations have no class list, so we use a parent node as a target
		return (
			oMutation.type === "characterData"
			? oMutation.target.parentNode
			: oMutation.target
		);
	};

	MutationObserver.prototype._callRelevantCallbackFunctions = function (aTargetElementId, sType) {
		aTargetElementId = _uniq(aTargetElementId);
		aTargetElementId.forEach(function (sTargetElementId) {
			(this._mMutationHandlers[sTargetElementId] || []).forEach(function (fnTargetElementCallback) {
				fnTargetElementCallback({ type: sType });
			});
		}.bind(this));
	};

	MutationObserver.prototype._startMutationObserver = function () {
		this._oMutationObserver = new window.MutationObserver(function(aMutations) {
			if (this._bHandlerRegistred) {
				var aOverallTargetElementIds = aMutations.reduce(function (aOverallTargetElementIds, oMutation) {
					var aTargetElementIds = [];
					var oTargetNode = this._getTargetNode(oMutation);
					var oTargetElementId = this._getRelevantElementId(oTargetNode);
					if (oTargetElementId) {
						aTargetElementIds.push(oTargetElementId);
					} else {
						aTargetElementIds = this._getRelevantElementIdsFromStaticArea(oMutation);
					}
					if (
						aTargetElementIds.length
						&& !this._ignoreMutation(oMutation)
					) {
						return aOverallTargetElementIds.concat(aTargetElementIds);
					}
					return aOverallTargetElementIds;
				}.bind(this), []);

				if (aOverallTargetElementIds.length) {
					window.requestAnimationFrame(function () {
						this._callRelevantCallbackFunctions(aOverallTargetElementIds, "MutationObserver");
					}.bind(this));
				}
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

	MutationObserver.prototype._callDomChangedCallback = function (sMutationType, oEvent) {
		var oTarget = oEvent.target;
		if (this._bHandlerRegistred && oTarget !== window) {
			var sTargetElementId = this._getRelevantElementId(oTarget);
			if (sTargetElementId) {
				this._callRelevantCallbackFunctions([sTargetElementId], sMutationType);
			}
		}
	};

	MutationObserver.prototype._callDomChangedCallbackWithRoot = function (sMutationType) {
		if (this._sRootId) {
			this._callRelevantCallbackFunctions([this._sRootId], sMutationType);
		}
	};

	MutationObserver.prototype._fireDomChangeOnScroll = function (oEvent) {
		var oTarget = oEvent.target;
		// The line below is required to avoid double scrollbars on the browser
		// when the document is scrolled to negative values (relevant for Mac)
		if (this._bHandlerRegistred && oTarget !== document) {
			// Target Node is inside one of the white listed element
			var sTargetElementId = this._getRelevantElementId(oTarget);
			// Target Node is an ancestor of one of the root element, but not a static area
			if (
				sTargetElementId === undefined
				&& oTarget.contains(document.getElementById(this._sRootId))
				&& oTarget.getAttribute("id") !== "sap-ui-static"
			) {
				sTargetElementId = this._sRootId;
			}
			if (
				sTargetElementId
				&& !OverlayUtil.getClosestOverlayForNode(oTarget)
			) {
				this._callRelevantCallbackFunctions([sTargetElementId], "MutationOnScroll");
			}
		}
	};

	return MutationObserver;
});
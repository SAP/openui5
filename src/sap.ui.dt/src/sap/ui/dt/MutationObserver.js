/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.MutationObserver.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/ElementUtil',
	'sap/ui/base/ManagedObject'
], function(jQuery, OverlayUtil, ElementUtil, ManagedObject) {
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
	var MutationObserver = ManagedObject.extend("sap.ui.dt.MutationObserver", /** @lends sap.ui.dt.MutationObserver.prototype */
	{
		metadata: {
			library: "sap.ui.dt",
			events: {
				/**
				 * Event fired when the observed object is modified or some changes which might affect dom position and styling of overlays happens
				 */
				domChanged: {
					parameters : {
						type : { type : "string" },
						elemenIds : { type : "string[]"},
						targetNodes : { type : "element[]" }
					}
				}
			}
		}
	});

	/**
	 * Called when the MutationObserver is created
	 *
	 * @protected
	 */
	MutationObserver.prototype.init = function() {
		this._fnFireDomChanged = function() {
			this.fireDomChanged();
		}.bind(this);
		this._onScroll = this._fireDomChangeOnScroll.bind(this);

		this._startMutationObserver();

		// after CSS transition / animation ends, domChanged event is triggered
		window.addEventListener("transitionend", this._fnFireDomChanged, true);
		window.addEventListener("webkitTransitionEnd", this._fnFireDomChanged, true);
		window.addEventListener("otransitionend", this._fnFireDomChanged, true);
		window.addEventListener("animationend", this._fnFireDomChanged, true);
		window.addEventListener("webkitAnimationEnd", this._fnFireDomChanged, true);
		window.addEventListener("oanimationend", this._fnFireDomChanged, true);

		jQuery(window).on("resize", this._fnFireDomChanged);

		window.addEventListener("scroll", this._onScroll, true);
	};

	/**
	 * Called when the MutationObserver is destroyed
	 *
	 * @protected
	 */
	MutationObserver.prototype.exit = function() {
		this._stopMutationObserver();

		window.removeEventListener("transitionend", this._fnFireDomChanged, true);
		window.removeEventListener("animationend", this._fnFireDomChanged, true);

		jQuery(window).off("resize", this._fnFireDomChanged);

		window.removeEventListener("scroll", this._onScroll, true);
	};

	/**
	 * @private
	 */
	MutationObserver.prototype._startMutationObserver = function() {
		if (this._oMutationObserver) {
			return;
		}

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		if (MutationObserver) {
			this._oMutationObserver = new MutationObserver(function(aMutations) {
				var aTargetNodes = [];
				var aElementIds = [];
				aMutations.forEach(function(oMutation) {
					var oTarget = oMutation.target;

					// text mutations have no class list, so we use a parent node as a target
					if (oMutation.type === "characterData") {
						oTarget = oMutation.target.parentNode;
					}

					// filter out all mutation in overlays
					if (!OverlayUtil.isInOverlayContainer(oTarget)) {
						aTargetNodes.push(oTarget);

						// define closest element to notify it's overlay about the dom mutation
						var oOverlay = OverlayUtil.getClosestOverlayForNode(oTarget);
						var sElementId = oOverlay ? oOverlay.getElementInstance().getId() : undefined;
						if (sElementId) {
							aElementIds.push(sElementId);
						}
					}
				});

				if (aTargetNodes.length) {
					this.fireDomChanged({
						type : "mutation",
						elementIds : aElementIds,
						targetNodes : aTargetNodes
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
		} else {
			jQuery.sap.log.error("Mutation Observer is not available");
		}
	};


	/**
	 * @private
	 */
	MutationObserver.prototype._stopMutationObserver = function() {
		if (this._oMutationObserver) {
			this._oMutationObserver.disconnect();
			delete this._oMutationObserver;
		}
	};

	/**
	 * @private
	 */
	MutationObserver.prototype._fireDomChangeOnScroll = function(oEvent) {
		var oTarget = oEvent.target;
		if (!OverlayUtil.isInOverlayContainer(oTarget) &&
			!OverlayUtil.getClosestOverlayForNode(oTarget) &&
			oTarget !== document) {

			this.fireDomChanged({
				type : "scroll"
			});
		}
	};

	return MutationObserver;
}, /* bExport= */true);

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
				 * Event fired when the observed object is modified
				 */
				domChanged: {
					parameters : {
						sapUiId : { type : "string" }
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
		this._fnFireDomChanged = this.fireDomChanged.bind(this);

		this._startMutationObserver();
		this._startResizeObserver();
	};

	/**
	 * Called when the MutationObserver is destroyed
	 *
	 * @protected
	 */
	MutationObserver.prototype.exit = function() {
		this._stopMutationObserver();
		this._stopResizeObserver();
	};

	/**
	 * @private
	 */
	MutationObserver.prototype._startMutationObserver = function() {
		var that = this;

		if (this._oMutationObserver) {
			return;
		}

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		if (MutationObserver) {
			this._oMutationObserver = new MutationObserver(function(aMutations) {
				var bFireChange = false;
				var sElementId;
				aMutations.some(function(oMutation) {
					var oTarget = oMutation.target;

					// text mutations have no class list, so we use a parent node as a target
					if (oMutation.type === "characterData") {
						oTarget = oMutation.target.parentNode;
					}

					// filter out all mutation in overlays
					if (oTarget && jQuery(oTarget).closest(".sapUiDtOverlay, #overlay-container").length === 0) {
						bFireChange = true;

						// define closest element to notify it's overlay about the dom mutation
						var oElement = ElementUtil.getClosestElementForNode(oTarget);
						var oOverlay = OverlayUtil.getClosestOverlayFor(oElement);
						sElementId = oOverlay ? oOverlay.getElementInstance().getId() : undefined;

						return true;
					}
				});

				if (bFireChange) {
					that.fireDomChanged({elementId : sElementId});
				}
			});

			// we should observe whole DOM, otherwise position change of elements can be triggered via outter changes
			// (like change of body size, container insertions etc.)
			this._oMutationObserver.observe(window.document, {
				childList : true,
				subtree : true,
				attributes : true,
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
	MutationObserver.prototype._startResizeObserver = function() {
		jQuery(window).on("resize", this._fnFireDomChanged);
	};

	/**
	 * @private
	 */
	MutationObserver.prototype._stopResizeObserver = function() {
		jQuery(window).off("resize", this._fnFireDomChanged);
	};


	return MutationObserver;
}, /* bExport= */true);

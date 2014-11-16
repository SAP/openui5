/*!
 * ${copyright}
 */

// Provides class sap.ui.core.PopupSupport
sap.ui.define([ 'jquery.sap.global', './Element' ], function(jQuery, Element) {
	"use strict";

	/**
	 * This class provides some methods for Popup handling. This class can be
	 * used as a mixin for controls that use a Popup as a local instance.
	 * 
	 * @returns {sap.ui.core.PopupSupport}
	 * @constructor
	 * @private
	 * @alias sap.ui.core.PopupSupport
	 */
	var PopupSupport = function() {
		this.getMetadata().addPublicMethods([ "getParentPopup", "isInPopup", "getParentPopupId", "addToPopup", "removeFromPopup" ]);

		/**
		 * Checks if the (optional) given jQuery-object or DOM-node is within a
		 * Popup. If no object is given the instance of the control will be used
		 * to check.
		 * 
		 * @param {jQuery |
		 *            Node} [oThis] is the object that should be checked
		 *            (optional)
		 * @returns {boolean} whether this control instance is part of a Popup
		 */
		this.isInPopup = function(oThis) {
			var $ParentPopup = this.getParentPopup(oThis);

			return $ParentPopup && $ParentPopup.length > 0;
		};

		/**
		 * This function returns the parent Popup if available.
		 * 
		 * @param {control}
		 *            [oThat] is an optional control instance. If another
		 *            instance than "this" is given the corresponding control
		 *            instance will be used to fetch the Popup.
		 * @returns {jQuery} [ParentPopup]
		 */
		this.getParentPopup = function(oThat) {
			// use either given object (control or DOM-ref) or this instance
			var oThis = oThat ? oThat : this;

			// if oThis is an element use its DOM-ref to look for a Popup. Else
			// 'oThis' is an DOM-ref therefore simply use it
			var $This = jQuery(oThis instanceof sap.ui.core.Element ? oThis.getDomRef() : oThis);

			// look up if there is a Popup above used DOM-ref
			return $This.closest("[data-sap-ui-popup]");
		};

		/**
		 * This returns the corresponding unique ID of the parent Popup.
		 * 
		 * @param {control}
		 *            [oThat] is an optional control instance. If another
		 *            instance than "this" is given the corresponding control
		 *            instance will be used to fetch the Popup.
		 * @returns [string] ParentPopupId
		 */
		this.getParentPopupId = function(oThis) {
			var $ParentPopup = this.getParentPopup(oThis);
			return $ParentPopup.attr("data-sap-ui-popup");
		};

		/**
		 * Adds the given child Popup id to the given parent's association.
		 * 
		 * @param [string]
		 *            sParentPopupId to which the id will be added
		 * @param [string]
		 *            sChildPopupId that will be added to the perant Popup
		 */
		this.addChildToPopup = function(sParentPopupId, sChildPopupId) {
			var sEventId = "sap.ui.core.Popup.addFocusableContent-" + sParentPopupId;
			sap.ui.getCore().getEventBus().publish("sap.ui", sEventId, {
				id : sChildPopupId
			});
		};

		/**
		 * Removes the control id to the Popup. If a dedicated Popup id is given
		 * then the control will be removed accordingly from this Popup. Else
		 * the closest Popup will be used.
		 * 
		 * @param {string}
		 *            [sPopupId] from which Popup the control should be removed
		 *            (optional)
		 */
		this.removeChildFromPopup = function(sPopupId) {
			if (!sPopupId) {
				sPopupId = this.getPopupId();
			}

			// de-register id of Menu-Popup to parent-Popup to make the menu as
			// focusable
			var sEventId = "sap.ui.core.Popup.removeFocusableContent-" + sPopupId;
			sap.ui.getCore().getEventBus().publish("sap.ui", sEventId, {
				id : this.getId()
			});
		};

		/**
		 * Closes a specific Popup when the control instance isn't available
		 * 
		 * @param [string]
		 *            sPopupId of Popup that should be closed
		 */
		this.closePopup = function(sPopupId) {
			var sEventId = "sap.ui.core.Popup.closePopup-" + sPopupId;
			sap.ui.getCore().getEventBus().publish("sap.ui", sEventId);
		};

		/**
		 * This function calls a popup to increase its z-index
		 * 
		 * @param [string]
		 *            sPopupId of Popup that should increase its z-index
		 * @param [boolean]
		 *            bIsParent marks if a parent Popup calls its child Popups
		 *            to increase their z-index
		 */
		this.increaseZIndex = function(sPopupId, bIsParent) {
			var sEventId = "sap.ui.core.Popup.increaseZIndex-" + sPopupId;
			sap.ui.getCore().getEventBus().publish("sap.ui", sEventId, {
				isFromParentPopup : bIsParent ? bIsParent : false
			});
		};
	};

	return PopupSupport;

}, /* bExport= */true);
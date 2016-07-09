/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.m.delegate.ValueState
 * @private
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/ui/base/Object', 'sap/ui/core/ValueStateSupport', 'sap/ui/core/Popup'],
	function(jQuery, Device, BaseObject, ValueStateSupport, Popup) {
		"use strict";

		/**
		 * Creates a <code>sap.m.delegate.ValueState</code> delegate that can be attached to controls that require
		 * a value state message popup.
		 *
		 * @example <caption>Example of usage:</caption>
		 *
		 * <pre>
		 *	MyControl.prototype.init = function() {
		 *		this._oValueStateMessage = new ValueStateMessage(this);
		 *	};
		 *
		 *  MyControl.prototype.onfocusin = function(oEvent) {
		 *  	this._oValueStateMessage.open();
		 *  };
		 *
		 *  MyControl.prototype.onfocusout = function(oEvent) {
		 *  	this._oValueStateMessage.close();
		 *  };
		 *
		 *	MyControl.prototype.exit = function() {
		 *
		 *		if (this._oValueStateMessage) {
		 *			this._oValueStateMessage.destroy();
		 *		}
		 *
		 *		this._oValueStateMessage = null;
		 *	};
		 * </pre>
		 *
		 * <b>Preconditions:</b>
		 * The given control must implement the following interface:
		 *
		 * <code>
		 * .getValueState()
		 * .getValueStateText()
		 * .getFocusDomRef()
		 * .getDomRefForValueStateMessage()
		 * </code>
		 *
		 * @extends sap.ui.base.Object
		 * @param {sap.ui.core.Control} oControl The control for which this value state message is the delegate
		 * @constructor
		 * @private
		 * @alias sap.m.delegate.ValueState
		 * @version 1.42
		 * @author SAP SE
		 */
		var ValueStateMessage = BaseObject.extend("sap.m.delegate.ValueState", /** @lends sap.m.delegate.ValueState.prototype */ {
			constructor: function(oControl) {
				BaseObject.apply(this, arguments);
				this._oControl = oControl;
				this._oPopup = null;
			}
		});

		/**
		 * Opens value state message popup.
		 *
		 * @protected
		 */
		ValueStateMessage.prototype.open = function() {
			var oControl = this._oControl,
				oPopup = this.getPopup(),
				oMessageDomRef = this.createDom(),
				mDock = Popup.Dock,
				$Control = jQuery(oControl.getDomRefForValueStateMessage());

			if (!oControl || !oPopup || !oMessageDomRef) {
				return;
			}

			oPopup.setContent(oMessageDomRef);
			oPopup.close(0);
			oPopup.open(
				this.getOpenDuration(),
				mDock.BeginTop,
				mDock.BeginBottom,
				oControl.getDomRefForValueStateMessage(),
				null,
				null,
				Device.system.phone ? true : Popup.CLOSE_ON_SCROLL
			);

			var $DomRef = jQuery(oMessageDomRef);

			// check whether popup is below or above the input
			if ($Control.offset().top < $DomRef.offset().top) {
				$DomRef.addClass("sapMValueStateMessageBottom");
			} else {
				$DomRef.addClass("sapMValueStateMessageTop");
			}

			$Control.addAriaDescribedBy(this.getId());
		};

		/**
		 * Closes value state message popup.
		 *
		 * @protected
		 */
		ValueStateMessage.prototype.close = function() {
			var oControl = this._oControl,
				oPopup = this.getPopup();

			if (oPopup) {
				oPopup.close(0);
			}

			if (oControl) {
				jQuery(oControl.getFocusDomRef()).removeAriaDescribedBy(this.getId());
			}
		};

		ValueStateMessage.prototype.getId = function() {
			var oControl = this._oControl;

			if (!oControl) {
				return "";
			}

			return (typeof oControl.getValueStateMessageId === "function") ? oControl.getValueStateMessageId() : oControl.getId() + "-message";
		};

		ValueStateMessage.prototype.getOpenDuration = function() {
			var oControl = this._oControl;

			if (!oControl) {
				return 0;
			}

			return (oControl.iOpenMessagePopupDuration === undefined) ? 0 : oControl.iOpenMessagePopupDuration;
		};

		/**
		 * Creates the value state message popup.
		 *
		 * @param {string} [sID] ID for the new message popup; generated automatically if no ID is given
		 * @returns {sap.ui.core.Popup} The popup instance object
		 */
		ValueStateMessage.prototype.createPopup = function(sID) {
			sID = sID || this.getId();

			if (this._oPopup) {
				return this._oPopup;
			}

			this._oPopup = new Popup(document.createElement("span"), false, false, false);
			this._oPopup.attachClosed(function() {
				jQuery.sap.byId(sID).remove();
			});

			return this._oPopup;
		};

		/**
		 * Gets the value state message popup, creating it if necessary by calling
		 * the <code>createPopup()</code> method.
		 *
		 * @returns {sap.ui.core.Popup} The popup instance object
		 */
		ValueStateMessage.prototype.getPopup = function() {

			if (!this._oControl) {
				return null;
			}

			return this.createPopup();
		};

		/**
		 * Creates the value state message HTML elements.
		 *
		 * @returns {object} The value state message root HTML element
		 */
		ValueStateMessage.prototype.createDom = function() {
			var oControl = this._oControl;

			if (!oControl) {
				return null;
			}

			var sState = oControl.getValueState(),
				sText = oControl.getValueStateText() || sap.ui.core.ValueStateSupport.getAdditionalText(oControl),
				sClass = "sapMValueStateMessage sapMValueStateMessage" + sState,
				oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			if (sState === sap.ui.core.ValueState.Success) {
				sClass = "sapUiInvisibleText";
				sText = "";
			}

			var sID = this.getId();
			var oMessageDomRef = document.createElement("div");
			oMessageDomRef.id = sID;
			oMessageDomRef.className = sClass;
			oMessageDomRef.setAttribute("role", "tooltip");
			oMessageDomRef.setAttribute("aria-live", "assertive");

			var oAccDomRef = document.createElement("span");
			oAccDomRef.id = sID + "hidden";
			oAccDomRef.className = "sapUiHidden";
			oAccDomRef.setAttribute("aria-hidden", "true");
			oAccDomRef.appendChild(document.createTextNode(oRB.getText("INPUTBASE_VALUE_STATE_" + sState.toUpperCase())));

			oMessageDomRef.appendChild(oAccDomRef);
			oMessageDomRef.appendChild(document.createTextNode(sText));
			return oMessageDomRef;
		};

		ValueStateMessage.prototype.destroy = function() {

			if (this._oPopup) {
				this._oPopup.destroy();
				this._oPopup = null;
			}

			this._oControl = null;
		};

		return ValueStateMessage;
	});
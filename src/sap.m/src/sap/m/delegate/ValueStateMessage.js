/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/Object',
	'sap/ui/core/Core',
	'sap/ui/core/ValueStateSupport',
	'sap/ui/core/Popup',
	'sap/ui/core/library',
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/Aria" // jQuery Plugin "addAriaDescribedBy", "removeAriaDescribedBy"
],
	function(
		Device,
		BaseObject,
		Core,
		ValueStateSupport,
		Popup,
		coreLibrary,
		jQuery
	) {
		"use strict";

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

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
				$Control;

			if (!oControl || !oControl.getDomRef() || !oPopup || !oMessageDomRef) {
				return;
			}

			$Control = jQuery(oControl.getDomRefForValueStateMessage());

			oPopup.setContent(oMessageDomRef);
			oPopup.close(0);
			if (oPopup.getContent()) {
				oPopup.getContent().style.maxWidth = oControl.getDomRef().offsetWidth + "px";
			} else {
				oPopup.getContent().style.maxWidth = "";
			}

			oPopup.open(
				this.getOpenDuration(),
				mDock.BeginTop,
				mDock.BeginBottom,
				oControl.getDomRefForValueStateMessage(),
				null,
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
		};

		/**
		 * Closes value state message popup.
		 *
		 * @protected
		 */
		ValueStateMessage.prototype.close = function() {
			if (this._oPopup) {
				this._oPopup.close(0);
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
				jQuery(document.getElementById(sID)).remove();
			});
			this._oPopup.attachOpened(function () {
				var content = this._oPopup.getContent(),
					bControlWithValueStateTextInIE = Device.browser.msie &&
						this._oControl && this._oControl.getFormattedValueStateText && !!this._oControl.getFormattedValueStateText();

				/* z-index of the popup is not calculated correctly by this._getCorrectZIndex() in IE, causing it
				to be "under" the "blind layer" and links to be unreachable (unclickable) in IE */
				if (content && !bControlWithValueStateTextInIE) {
					content.style.zIndex = this._getCorrectZIndex();
				}
			}.bind(this));

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
		 * Determines and extracts the correct value state text depending on the value state
		 * If <code>formattedValueStateText</code> aggregation of type <code>sap.m.FormattedText</code> is set
		 * it has priority over the plain text (string) <code>valueStateText</code> value state property.
		 *
		 * @param {sap.ui.core.Control} oControl The control for which this value state message is attached.
		 * @param {string} sValueState The value state type of the control.
		 * @returns {(string|object)} Value state message text of the control.

		 *
		 * @private
		 */
		ValueStateMessage.prototype._getValueStateText = function(oControl, sValueState) {
			// Don't return text for value state "success" or "none"
			if (sValueState === ValueState.Success || sValueState === ValueState.None) {
				return "";
			}

			var oValueStateFormattedText = oControl.getFormattedValueStateText && oControl.getFormattedValueStateText();
			var oValueStateFormattedTextContent = oValueStateFormattedText && oValueStateFormattedText.getHtmlText();
			var sValueStatePlainText =  oControl.getValueStateText() || ValueStateSupport.getAdditionalText(oControl);

			// Return sap.m.FormattedText aggregation only if there is an actual formatted text set to it
			// Otherwise return the plain text value state message set in the control or the default one
			return oValueStateFormattedTextContent ? oValueStateFormattedText : sValueStatePlainText;
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

			var sID = this.getId(), oTextDomRef,
				oMessageDomRef = document.createElement("div"),
				sValueState = oControl.getValueState(),
				vValueStateMessageText = this._getValueStateText(oControl, sValueState);

			if (sValueState === ValueState.Success || sValueState === ValueState.None) {
				oMessageDomRef.className = "sapUiInvisibleText";
			} else {
				oMessageDomRef.className = "sapMValueStateMessage sapMValueStateMessage" + sValueState;
			}

			// If value state message is plain text create the required DOM
			// otherwise it's of type sap.m.FormattedText - render it and add ID
			if (typeof vValueStateMessageText === "string") {
				oTextDomRef = document.createElement("span");
				oTextDomRef.id = sID + "-text";
				oTextDomRef.appendChild(document.createTextNode(vValueStateMessageText));
				oMessageDomRef.appendChild(oTextDomRef);
			} else {
				Core.getRenderManager().render(vValueStateMessageText, oMessageDomRef);
				oMessageDomRef.lastElementChild.setAttribute("id", sID + "-text");
			}

			// If ValueState Message is sap.m.FormattedText
			if (!oTextDomRef) {
				oMessageDomRef.lastElementChild.setAttribute("id", sID + "-text");
			} else if (!oControl.isA('sap.m.Select') && Device.browser.msie) {
				oTextDomRef.setAttribute("aria-hidden", "true");
			}

			oMessageDomRef.id = sID;

			// This element should be hidden from the accessibility tree, since it has only presentation role
			// The value state announcement is present via hidden span, referenced via aria-describedby/aria-errormessage
			oMessageDomRef.setAttribute("role", "presentation");
			oMessageDomRef.setAttribute("aria-hidden", "true");

			return oMessageDomRef;
		};

		ValueStateMessage.prototype.destroy = function() {

			if (this._oPopup) {
				this._oPopup.destroy();
				this._oPopup = null;
			}

			this._oControl = null;
		};

		/**
		 * Gets the z-index of the popup, so it won't be shown above some other popups.
		 * @return {int} The correct z-index
		 * @private
		 */
		ValueStateMessage.prototype._getCorrectZIndex = function() {

			var aParents = this._oControl.$().parents().filter(function() {
				var sZIndex = jQuery(this).css('z-index');
				return sZIndex && sZIndex !== 'auto' && sZIndex !== '0';
			});

			if (!aParents.length) {
				return 1;
			}

			var iHighestZIndex = 0;

			aParents.each(function () {
				var iZIndex = parseInt(jQuery(this).css('z-index'));

				if (iZIndex > iHighestZIndex) {
					iHighestZIndex = iZIndex;
				}
			});

			return iHighestZIndex + 1;
		};

		return ValueStateMessage;
	});
/*!
 * ${copyright}
 */

// Provides control sap.m.Token.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'./Tokenizer',
	'sap/ui/core/library',
	'sap/ui/core/Icon',
	'./TokenRenderer',
	'sap/ui/core/InvisibleText',
	'sap/ui/events/KeyCodes',
	'sap/ui/core/theming/Parameters',
	'sap/ui/core/Core'
],
	function(
		library,
		Control,
		Tokenizer,
		coreLibrary,
		Icon,
		TokenRenderer,
		InvisibleText,
		KeyCodes,
		Parameters,
		Core
	) {
	"use strict";



	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * Constructor for a new Token.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <h3>Overview</h3>
	 * Tokens are small items of information (similar to tags) that mainly serve to visualize previously selected items.
	 * Tokens are manipulated by a {@link sap.m.Tokenizer Tokenizer}.
	 * <h3>Structure</h3>
	 * The tokens store single text items or sometimes key-value pairs, such as "John Miller (ID1234567)".
	 * Each token also contains a delete icon, which is invisible if the token is in edit mode.
	 *
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * Tokens can only be used with the Tokenizer as a container.
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Token
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/token/ Token}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Token = Control.extend("sap.m.Token", /** @lends sap.m.Token.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Indicates the current selection status of the token.
			 */
			selected : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Key of the token.
			 */
			key : {type : "string", group : "Misc", defaultValue : ""},

			/**
			 * Displayed text of the token.
			 */
			text : {type : "string", group : "Misc", defaultValue : ""},

			/**
			 * Indicates the editable status of the token. If it is set to <code>true</code>, token displays a delete icon.
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * This property specifies the text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Indicates the editable status of the token's parent (Tokenizer). If it is set to <code>true</code>, the ARIA attributes of the token are updated accordingly.
			 */
			editableParent : {type : "boolean", group : "Behavior", defaultValue : true, visibility: "hidden"}
		},
		aggregations : {

			/**
			 * The delete icon.
			 */
			deleteIcon : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"}
		},
		associations : {

			/**
			 * Association to controls / IDs which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events : {

			/**
			 * This event is fired if the user clicks the token's delete icon.
			 */
			"delete" : {},

			/**
			 * This event is fired when the user clicks on the token.
			 */
			press : {},

			/**
			 * This event is fired when the token gets selected.
			 */
			select : {},

			/**
			 * This event is fired when the token gets deselected.
			 */
			deselect : {}
		}
	}});

	/**
	 * This file defines behavior for the control,
	 */
	Token.prototype.init = function() {
		var that = this,
			bSysCancelIconUsed = Parameters.get("_sap_m_Token_Sys_Cancel_Icon") === "true",
			sSrcIcon = bSysCancelIconUsed ? "sap-icon://sys-cancel" : "sap-icon://decline";

		this._deleteIcon = new Icon({
			id : that.getId() + "-icon",
			src : sSrcIcon,
			noTabStop: true,
			press : this._tokenIconPress.bind(this)
		});

		this._deleteIcon.addStyleClass("sapMTokenIcon");
		this.setAggregation("deleteIcon", this._deleteIcon);
		this._deleteIcon.setUseIconTooltip(false);
	};

	/**
	 * Handles the touch start event on the token.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Token.prototype.ontouchstart = function(oEvent) {
		if (oEvent.target.id === this.getId() + "-icon") {
			// prevent default or else the icon may get focused
			oEvent.preventDefault();
		}
	};

	/**
	 * Helper function for synchronizing the tooltip of the token.
	 * @private
	 * @param {sap.m.Token} oControl The control instance to get the tooltip for
	 * @param {boolean} bEditable The editable value
	 * @return {string} The tooltip text
	 */
	Token.prototype._getTooltip = function (oControl, bEditable) {
		var sTooltip = oControl.getTooltip_AsString(),
			sDeletableTooltip = Core.getLibraryResourceBundle("sap.m").getText("TOKEN_ARIA_DELETABLE");

		if (bEditable && !sTooltip) {
			return sDeletableTooltip;
		}

		return sTooltip;
	};

	/**
	 * Function is called when token is pressed to select/deselect token.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Token.prototype._onTokenPress = function(oEvent) {
		var bSelected = this.getSelected(),
			bCtrlKey = oEvent.ctrlKey || oEvent.metaKey,
			bShiftKey = oEvent.shiftKey,
			bNewSelectedValue = true,
			oParent;

		if (bCtrlKey || (oEvent.which === KeyCodes.SPACE)) {
			bNewSelectedValue = !bSelected;
		}

		this.setSelected(bNewSelectedValue);

		this.firePress();

		if (bSelected != bNewSelectedValue) {
			if (bNewSelectedValue) {
				this.fireSelect();
			} else {
				this.fireDeselect();
			}
		}

		oParent = this.getParent();
		if (oParent instanceof Tokenizer) {
			oParent._onTokenSelect(this, bCtrlKey, bShiftKey);
		}

		if (this.getSelected()) {
			this.focus();
		}
	};

	/**
	 * Function is called when token's icon is pressed to delete token.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Token.prototype._tokenIconPress = function(oEvent) {
		var oParent = this.getParent();

		if (!oParent.getEnabled()) {
			return;
		}

		// fire "delete" event before Tokenizer's _onTokenDelete because the Tokenizer will destroy the token
		// and the token's delete handler will not be executed
		this.fireDelete({
			token : this
		});

		if (oParent.isA("sap.m.Tokenizer")) {
			oParent._onTokenDelete(this);
		}

		oEvent.preventDefault();
	};

	/**
	 * Sets the selection status of the token and fires the correct "select" or "deselect" event.
	 *
	 * @param {boolean} bSelected Indicates if the token is selected.
	 * @private
	 */
	Token.prototype._changeSelection = function(bSelected) {
		if (this.getSelected() == bSelected) {
			return;
		}

		this.setSelected(bSelected);

		if (bSelected) {
			this.fireSelect();
		} else {
			this.fireDeselect();
		}
	};


	/**
	 * Event handler called when control is on tap
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	Token.prototype.ontap = function(oEvent) {
		if (oEvent.target.id == this._deleteIcon.getId()){
			oEvent.setMark("tokenDeletePress", true);
			return;
		}
		this._onTokenPress(oEvent);
	};

	/**
	 * Event handler called when control is loosing the focus, removes selection from token
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	Token.prototype.onsapfocusleave = function(oEvent) {
		if (this.getParent() instanceof Tokenizer) {
			return;
		}

		this.setSelected(false);
	};

	/**
	 * Function is called on keyboard backspace, deletes token
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Token.prototype.onsapbackspace = function(oEvent) {
		this._deleteToken(oEvent);
	};

	/**
	 * Function is called on keyboard delete, deletes token
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Token.prototype.onsapdelete = function(oEvent) {
		this._deleteToken(oEvent);
	};

	Token.prototype._deleteToken = function(oEvent) {
		if (this.getParent() instanceof Tokenizer) {
			return;
		}

		if (this.getEditable()) {
			this.fireDelete({
				token : this
			});
		}

		oEvent.preventDefault();
	};

	/**
	 * Function is called on keyboard space, select/deselect token
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Token.prototype.onsapspace = function(oEvent) {

		this._onTokenPress(oEvent);
		// stop browsers default behavior
		if (oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle the key down event for Ctrl+ space
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	Token.prototype.onkeydown = function(oEvent) {

		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.SPACE) {
			//metaKey for MAC command
			this.onsapspace(oEvent);
			oEvent.preventDefault();
		}
	};

	Token.prototype.onThemeChanged = function () {
		var bSysCancelIconUsed = Parameters.get("_sap_m_Token_Sys_Cancel_Icon") === "true",
			sSrcIcon = bSysCancelIconUsed ? "sap-icon://sys-cancel" : "sap-icon://decline";

		if (this._deleteIcon.getSrc() !== sSrcIcon) {
			this._deleteIcon.setSrc(sSrcIcon);
		}
	};

	return Token;

});

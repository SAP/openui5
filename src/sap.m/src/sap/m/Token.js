/*!
 * ${copyright}
 */

// Provides control sap.m.Token.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Lib",
	'sap/ui/core/library',
	'sap/ui/core/Icon',
	'./TokenRenderer',
	'sap/ui/events/KeyCodes'
],
	function(
		library,
		Control,
		Library,
		coreLibrary,
		Icon,
		TokenRenderer,
		KeyCodes
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
	 */
	var Token = Control.extend("sap.m.Token", /** @lends sap.m.Token.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Indicates the current selection status of the token.
				 */
				selected : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Key of the token.
				 */
				key : {type : "string", group : "Data", defaultValue : ""},

				/**
				 * Displayed text of the token.
				 */
				text : {type : "string", group : "Data", defaultValue : ""},

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
				editableParent : {type : "boolean", group : "Behavior", defaultValue : true, visibility: "hidden"},

				/**
				 * Indicates if the token's text should be truncated.
				 */
				truncated : {type : "boolean", group : "Appearance", defaultValue : false, visibility: "hidden"},

				/**
				 * Indicates the position of a token. Used for aria attributes.
				 * @private
				 */
				posinset : { type: "int", visibility: "hidden" },

				/**
				 * Indicates the count of the token. Used for aria attributes.
				 * @private
				 */
				setsize : { type: "int", visibility: "hidden" }
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
				"delete" : {
					enableEventBubbling: true
				},

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
		},

		renderer: TokenRenderer
	});

	Token.prototype.init = function() {
		var oDeleteIcon = new Icon({
				id : this.getId() + "-icon",
				src : "sap-icon://decline",
				noTabStop: true,
				press : this._fireDeleteToken.bind(this),
				tooltip: Library.getResourceBundleFor("sap.m").getText("TOKEN_ICON_TOOLTIP")
			});

		oDeleteIcon.addStyleClass("sapMTokenIcon");
		oDeleteIcon.setUseIconTooltip(false);
		this.setAggregation("deleteIcon", oDeleteIcon);
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
		return oControl.getTooltip_AsString();
	};

	/**
	 * Function is called when token is pressed to select/deselect token.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Token.prototype._onTokenPress = function(oEvent) {
		var bSelected = this.getSelected(),
			bCtrlKey = oEvent.ctrlKey || oEvent.metaKey,
			bNewSelectedValue = true;

		if (bCtrlKey || (oEvent.which === KeyCodes.SPACE)) {
			bNewSelectedValue = !bSelected;
		}

		this.setSelected(bNewSelectedValue);

		this.firePress();

		if (bSelected !== bNewSelectedValue) {
			if (bNewSelectedValue) {
				this.fireSelect();
			} else {
				this.fireDeselect();
			}
		}

		if (this.getSelected()) {
			this.focus();
		}
	};

	/**
	 * Event handler called when control is on tap
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	Token.prototype.ontap = function (oEvent) {
		var oDeleteIcon = this.getAggregation("deleteIcon");

		if (oDeleteIcon && oEvent.target.id === oDeleteIcon.getId()) {
			oEvent.setMark("tokenDeletePress", true);
			return;
		}

		oEvent.setMark("tokenTap", this);

		this._onTokenPress(oEvent);
	};

	Token.prototype._fireDeleteToken = function (oEvent, bKey, bBackspace) {
		if (this.getEditable() && this.getProperty("editableParent")) {
			this.fireDelete({
				token: this,
				byKeyboard: bKey,
				backspace: bBackspace
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

	/**
	 * Returns the value of Token's <code>truncated</code> property.
	 *
	 * @returns {boolean} true if the Token is truncated.
	 * @private
	 * @ui5-restricted sap.m.Tokenizer
	 */
	Token.prototype.getTruncated = function () {
		return this.getProperty("truncated");
	};

	/**
	 * Sets the Token's <code>truncated</code> property.
	 *
	 * @param {boolean} bValue The new property value.
	 * @returns {this} this reference for method chaining.
	 * @private
	 * @ui5-restricted sap.m.Tokenizer
	 */
	Token.prototype.setTruncated = function (bValue) {
		return this.setProperty("truncated", bValue);
	};

	return Token;

});

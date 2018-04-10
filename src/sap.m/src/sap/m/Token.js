/*!
 * ${copyright}
 */

// Provides control sap.m.Token.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'./Tokenizer',
	'sap/ui/core/library',
	'sap/ui/core/Icon',
	'./TokenRenderer',
	'jquery.sap.keycodes'
],
	function(jQuery, library, Control, Tokenizer, coreLibrary, Icon, TokenRenderer) {
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
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
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
		var that = this;
		this._deleteIcon = new Icon({
			id : that.getId() + "-icon",
			src : "sap-icon://sys-cancel",
			noTabStop: true,
			press : function(oEvent) {
				var oParent = that.getParent();

				// fire "delete" event before Tokenizer's _onTokenDelete because the Tokenizer will destroy the token
				// and the token's delete handler will not be executed
				that.fireDelete({
					token : that
				});

				if (oParent instanceof Tokenizer) {
					oParent._onTokenDelete(that);
				}

				oEvent.preventDefault();
			}
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
	 * Sets the selection status of the token.
	 *
	 * @param {boolean} bSelected Indicates if the token is selected.
	 * @return {sap.m.Token} this instance for method chaining
	 * @public
	 */
	Token.prototype.setSelected = function(bSelected) {

		if (this.getSelected() === bSelected) {
			return this;
		}

		var $this = this.$();

		if ($this) {
			$this.toggleClass("sapMTokenSelected", bSelected);
			$this.attr('aria-selected', bSelected);
		}

		this.setProperty("selected", bSelected, true);

		return this;
	};

	/**
	 * Sets the editable status of the token.
	 *
	 * @param {boolean} bEditable Indicates if the token is editable.
	 * @return {sap.m.Token} this instance for method chaining
	 * @public
	 */
	Token.prototype.setEditable = function(bEditable) {
		var oParent = this.getParent();

		this.setProperty("editable", bEditable, true);

		this.$().toggleClass("sapMTokenReadOnly", !bEditable);

		if (oParent instanceof Tokenizer) {
			oParent.invalidate();
		}

		return this;
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

		if (bCtrlKey) {
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

		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			//metaKey for MAC command
			this.onsapspace(oEvent);
			oEvent.preventDefault();
		}
	};

	return Token;

});

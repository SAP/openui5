/*!
 * ${copyright}
 */

// Provides control sap.m.Token.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";



	/**
	 * Constructor for a new Token.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a token containing text and an optional delete icon
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Token
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Token = Control.extend("sap.m.Token", /** @lends sap.m.Token.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * current selection status of token
			 */
			selected : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * token's identifier key
			 */
			key : {type : "string", group : "Misc", defaultValue : ""},

			/**
			 * token's display text
			 */
			text : {type : "string", group : "Misc", defaultValue : ""},

			/**
			 * if true, token displays delete icon and fires events accordingly
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : true},
			
			/**
			 * This property specifies the text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
		},
		aggregations : {

			/**
			 * The delete icon.
			 */
			deleteIcon : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fired if the user click the token's delete button.
			 */
			"delete" : {},

			/**
			 * Event is fired when the user clicks on the control.
			 */
			press : {},

			/**
			 * Event is fired when the user selects a token (could be a keyboard navigation, could be a press)
			 */
			select : {}
		}
	}});

	///**
	// * This file defines behavior for the control,
	// */
	Token.prototype.init = function() {
		this._deleteIcon = new sap.ui.core.Icon({
			src : "sap-icon://sys-cancel"
		});

		this._deleteIcon.addStyleClass("sapMTokenIcon");
		this.setAggregation("deleteIcon", this._deleteIcon);
	};

	Token.prototype.setEditable = function(bEditable){
		this.setProperty("editable", bEditable);
		if (bEditable) {
			this.removeStyleClass("sapMTokenReadOnly");
		} else {
			this.addStyleClass("sapMTokenReadOnly");
		}
	};

	/**
	 * Event handler called when control is touched, registers left mouse down
	 *
	 * @param {jQuery.Event}
	 * 			oEvent
	 * @private
	 */
	Token.prototype.ontouchstart = function(oEvent) {
		this.$().toggleClass("sapMTokenActive", true);
		if (sap.ui.Device.system.desktop && oEvent.originalEvent.button !== 0) {
			return; // only on left mouse button
		}

		this._oSrcStartId = oEvent.target.id;

		if (this._oSrcStartId === this._deleteIcon.getId()) {
			oEvent.preventDefault();
		}
	};

	Token.prototype.setSelected = function(bSelected, bMultiSelect) {

		if (bSelected && !bMultiSelect) {
			this.focus();
		}

		var $this = this.$();

		if ($this) {
			if (bSelected) {
				$this.addClass("sapMTokenSelected");
			} else {
				$this.removeClass("sapMTokenSelected");
			}
		} else {
			if (bSelected) {
				this.addStyleClass("sapMTokenSelected");
			} else {
				this.removeStyleClass("sapMTokenSelected");
			}

		}

		this.setProperty("selected", bSelected, true);

		if (bSelected) {
			this.fireSelect();
		}

	};

	/**
	 * Function is called when token is pressed to select/deselect token.
	 * @private
	 * @param {jQuery.Event}
	 *          oEvent
	 */
	Token.prototype._onTokenPress = function() {
		var bSelected = this.getSelected();
		this.setSelected(!bSelected);

		if (!bSelected) {
			this.fireSelect({});
		}

	};


	/**
	 * Event handler called when control is on tap
	 *
	 * @param {jQuery.Event}
	 * 			oEvent
	 * @private
	 */
	Token.prototype.ontap = function(oEvent) {
		this._onTokenPress();
	};

	/**
	 * Event handler called when control touch ends, triggers possible click events / selects token
	 *
	 * @param {jQuery.Event}
	 * 			oEvent
	 * @private
	 */
	Token.prototype.ontouchend = function(oEvent) {
		this.$().toggleClass("sapMTokenActive", false);
		var oSrc = oEvent.target;
		if (this._oSrcStartId !== oSrc.id) {
			delete this._oSrcStartId;
			return;
		}

		// we only allow deletion on touch devices when the Token is selected - this is to avoid accidental deletion when
		// swiping
		var bTouch = sap.m.MultiInput.prototype._bDoTouchScroll;
		var bTouchDeleteAllow = false;
		if (bTouch && this.getSelected()) {
			bTouchDeleteAllow = true;
		}

		if (oSrc.id === this._deleteIcon.getId()) {
			if (bTouchDeleteAllow || !bTouch) {
				this.fireDelete({
					token : this
				});
			} else {
				// in this case we at least make sure the element gets selected
				this.firePress({
					token : this
				});
			}
			oEvent.preventDefault();

		} else {
			this.firePress({
				token : this
			});
			oEvent.preventDefault();
		}

		delete this._oSrcStartId;

	};

	/**
	 * Event handler called when control is loosing the focus, removes selection from token
	 *
	 * @param {jQuery.Event}
	 * 			oEvent
	 * @private
	 */
	Token.prototype.onsapfocusleave = function(oEvent) {
		this.setSelected(false);
	};

	/**
	 * Function is called on keyboard backspace, deletes token
	 *
	 * @private
	 * @param {jQuery.event}
	 *          oEvent
	 */
	Token.prototype.onsapbackspace = function(oEvent) {
		oEvent.preventDefault();
		oEvent.stopPropagation();
		if (this.getSelected() && this.getEditable()) {
			this.fireDelete({
				token : this
			});

		}
	};

	/**
	 * Function is called on keyboard delete, deletes token
	 *
	 * @private
	 * @param {jQuery.event}
	 *          oEvent
	 */
	Token.prototype.onsapdelete = function(oEvent) {
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
	 * @param {jQuery.event}
	 *          oEvent
	 */
	Token.prototype.onsapspace = function(oEvent) {

		this._onTokenPress();
		// stop browsers default behavior
		if (oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle the key down event for Ctrl+ space
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	Token.prototype.onkeydown = function(oEvent) {

		if ((oEvent.ctrlKey) && oEvent.which === jQuery.sap.KeyCodes.SPACE) { //metaKey for MAC command
			this.onsapspace(oEvent);
			oEvent.preventDefault();
		}

	};

	return Token;

}, /* bExport= */ true);

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
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new control.
	 *
	 * @class
	 * The <code>sap.m.Token</code> is a container of a single text item with a delete icon if the token is in edit mode.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Token
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time meta model.
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
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
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
			select : {}
		}
	}});

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	// create an ARIA announcement and remember its ID for later use in the renderer:
	Token.prototype._sAriaTokenLabelId = new sap.ui.core.InvisibleText({
		text: oRb.getText("TOKEN_ARIA_LABEL")
	}).toStatic().getId();

	Token.prototype._sAriaTokenDeletableId = new sap.ui.core.InvisibleText({
		text: oRb.getText("TOKEN_ARIA_DELETABLE")
	}).toStatic().getId();
	
	///**
	// * This file defines behavior for the control,
	// */
	Token.prototype.init = function() {
		this._deleteIcon = new sap.ui.core.Icon({
			src : "sap-icon://sys-cancel"
		});

		this._deleteIcon.addStyleClass("sapMTokenIcon");
		this.setAggregation("deleteIcon", this._deleteIcon);
		this._deleteIcon.setUseIconTooltip(false);
	};

	Token.prototype.setEditable = function(bEditable){
		this.setProperty("editable", bEditable);
		if (bEditable) {
			this.removeStyleClass("sapMTokenReadOnly");
			this.$().attr("aria-readonly", "true");
		} else {
			this.addStyleClass("sapMTokenReadOnly");
			this.$().attr("aria-readonly", "false");
			
		}
	};

	/**
	 * Handles the touch start event on the token.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Token.prototype.ontouchstart = function(oEvent) {
		this.$().toggleClass("sapMTokenActive", true);
		if (sap.ui.Device.system.desktop && oEvent.originalEvent.button) {
			/* there are two cases that should fire touch start event:
				left button click in desktop, where value of button event is 0; 
				touch event in combi device, where value of button event is undefined.*/
			return;
		}

		this._oSrcStartId = oEvent.target.id;

		if (this._oSrcStartId === this._deleteIcon.getId()) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Sets the selection status of the token.
	 *
	 * @param {boolean} bSelected Indicates if the token is selected.
	 * @param {boolean} bMultiSelect Indicates if the token is one of the multi-selected tokens.
	 */
	Token.prototype.setSelected = function(bSelected, bMultiSelect) {

		if (bSelected && !bMultiSelect) {
			this.focus();
		}

		var $this = this.$();

		if ($this) {
			if (bSelected) {
				$this.addClass("sapMTokenSelected");
				$this.attr('aria-selected', "true");
			} else {
				$this.removeClass("sapMTokenSelected");
				$this.attr('aria-selected', "false");
			}
		} else {
			if (bSelected) {
				this.addStyleClass("sapMTokenSelected");
				this.attr('aria-selected', "true");
			} else {
				this.removeStyleClass("sapMTokenSelected");
				this.attr('aria-selected', "false");
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
	 * @param {jQuery.Event} oEvent
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
		
		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === jQuery.sap.KeyCodes.SPACE) { 
			//metaKey for MAC command		
			this.onsapspace(oEvent);
			oEvent.preventDefault();
		}
	};

	return Token;

}, /* bExport= */ true);

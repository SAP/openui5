/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.RadioButton.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new RadioButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Consists of a round element and a descriptive text. Generally, you would create at least two radio button controls;
	 * by this, you provide a limited choice for the user. Radio buttons can trigger events.
	 * Available value states are "Error", "None", "Success", "Warning".
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.commons.RadioButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RadioButton = Control.extend("sap.ui.commons.RadioButton", /** @lends sap.ui.commons.RadioButton.prototype */ { metadata : {
	
		library : "sap.ui.commons",
		properties : {
	
			/**
			 * Defines the text displayed next to the radio button.
			 */
			text : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * 
			 * Disabled controls are displayed in another color, depending on the customer settings.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * Specifies whether the user can select the radio button
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * Specifies the select state of the radio button
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},
	
			/**
			 * 
			 * Enumeration sap.ui.core.ValueState provides state values Error, Success, Warning, None
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},
	
			/**
			 * The control width depends on the text length. Alternatively, CSS-sizes in % or px can be set.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * 
			 * Available options are LTR and RTL. Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
	
			/**
			 * Name of the radio button group the current radio button belongs to. You can define a new name for the group.
			 * If no new name is specified, this radio button belongs to the sapUiRbDefaultGroup per default. Default behavior of a radio button
			 * in a group is that when one of the radio buttons in a group is selected, all others are unselected.
			 */
			groupName : {type : "string", group : "Behavior", defaultValue : 'sapUiRbDefaultGroup'},
	
			/**
			 * Can be used for subsequent actions
			 */
			key : {type : "string", group : "Data", defaultValue : null}
		},
		associations : {
	
			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"}, 
	
			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {
	
			/**
			 * Event is triggered when the user makes a change on the radio button.
			 */
			select : {}
		}
	}});
	
	/**
	 * Event handler called when the radio button is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onclick = function(oEvent) {
	
		if (this.getEnabled() && oEvent.target.id == (this.getId() + "-RB")) {
			this.focus();
		}
	
		if (!!sap.ui.Device.browser.internet_explorer && (/*!this.getEditable() ||*/ !this.getEnabled())) { //According to CSN2581852 2012 a readonly CB should be in the tabchain 
			// in IE tabindex = -1 hides focus, so in readOnly case tabindex must be set to 0
			// as long as RadioButton is clicked on
			this.$().attr("tabindex", 0).toggleClass("sapUiRbFoc");
		}
	
		this.userSelect(oEvent);
	};

	RadioButton.prototype._groupNames = {};
	
	/**
	 * Event handler called when the space key is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onsapspace = function(oEvent) {
	
		if (this.getEnabled() && oEvent.target.id == (this.getId() + "-RB")) {
			this.focus();
		}
		this.userSelect(oEvent);
	};
	
	/**
	 * Event handler called focus is set on Radio button
	 * Problem in HCB: Focus is set in IE8 to bullet, not to whole control
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onsaptabnext = function(oEvent) {
	
		if (!!sap.ui.Device.browser.internet_explorer) {
			this.bTabPressed = true;
			var that = this;
			window.setTimeout(function(){that.bTabPressed = false;}, 100);
		}
	};
	
	/**
	 * Event handler called when the radio button is focused
	 * Problem in HCB: Focus is sometimes set in IE8 to bullet, not to whole control
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onfocusin = function(oEvent) {
	
		if (this.getEnabled() && oEvent.target.id == (this.getId() + "-RB")) {
			if (this.bTabPressed) {
				// this only occurs in IE in HCB mode
				var aFocusableElements = jQuery(":sapFocusable"),
					bFound = false;
				for (var i = 0; i < aFocusableElements.length; i++) {
					if (bFound && aFocusableElements[i].parentNode != oEvent.target && aFocusableElements[i].tabIndex != "-1") {
						aFocusableElements[i].focus();
						oEvent.preventDefault();
						break;
					}
					if (oEvent.target == aFocusableElements[i]) {
						bFound = true;
					}
				}
			} else {
				this.focus();
			}
		}
	};
	
	/**
	 * Event handler called when the radio button is left
	 * Problem in IE: Tabindex must be set back to -1
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onfocusout = function(oEvent) {
	
		if (!!sap.ui.Device.browser.internet_explorer && (/*!this.getEditable() ||*/ !this.getEnabled())) { //According to CSN2581852 2012 a readonly CB should be in the tabchain 
			// in IE tabindex = -1 hides focus, so in readOnly case tabindex must be set to 0
			// as long as RadioButton is clicked on
			this.$().attr("tabindex", -1).toggleClass("sapUiRbFoc");
		}
	
	};
	/**
	 * This method is used internally only, whenever the user somehow selects the RadioButton.
	 * It is responsible for event cancellation and for firing the select event.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.userSelect = function(oEvent) {
	//	oEvent.preventDefault();
		// the control should not stop browser event propagation
		// Example: table control needs to catch and handle the event as well
		//oEvent.stopPropagation();
	
		if (this.getEnabled() && this.getEditable()) {
			var selected = this.getSelected();
			if (!selected) {
				this.setSelected(true);
				this.fireSelect({/* no parameters */});
			}
		} else {
			// readOnly or disabled -> don't allow browser to switch RadioButton on
			oEvent.preventDefault();
		}
	};
	
	// #############################################################################
	// Overwritten methods that are also generated in RadioButton.API.js
	// #############################################################################
	
	/*
	 * Overwrite the definition from RadioButton.API.js
	 */
	RadioButton.prototype.setSelected = function(bSelected) {
		var oControl,
			bSelectedOld = this.getSelected(),
			sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName],
			iLength = aControlsInGroup && aControlsInGroup.length;
			
		this.setProperty("selected", bSelected, true); // No re-rendering
		this._changeGroupName(this.getGroupName());

		if (bSelected && sGroupName && sGroupName !== "") { // If this radio button is selected and groupName is set, explicitly deselect the other radio buttons of the same group
			for (var i = 0; i < iLength; i++) {
				oControl = aControlsInGroup[i];

				if (oControl instanceof RadioButton && oControl !== this && oControl.getSelected()) {
					oControl.setSelected(false);
				}
			}
		}

		if ((bSelectedOld != bSelected) && this.getDomRef() && this.getRenderer().setSelected) {
			this.getRenderer().setSelected(this, bSelected);
		}

		return this;
	};

	RadioButton.prototype.setGroupName = function(sGroupName) {
		this._changeGroupName(sGroupName, this.getGroupName());

		return this.setProperty("groupName", sGroupName, false);
	};
	
	RadioButton.prototype.getTooltipDomRefs = function() {
		return this.$().children();
	};

	RadioButton.prototype._changeGroupName = function(sNewGroupName, sOldGroupName) {
		var aNewGroup = this._groupNames[sNewGroupName],
			aOldGroup = this._groupNames[sOldGroupName];

		if (!aNewGroup) {
			aNewGroup = this._groupNames[sNewGroupName] = [];
		}

		if (aNewGroup.indexOf(this) === -1) {
			aNewGroup.push(this);
		}

		if (aOldGroup && aOldGroup.indexOf(this) !== -1) {
			aOldGroup.splice(aOldGroup.indexOf(this), 1);
		}
	};

	return RadioButton;

}, /* bExport= */ true);

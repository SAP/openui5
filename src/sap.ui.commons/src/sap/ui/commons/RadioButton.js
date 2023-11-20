/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.RadioButton.
sap.ui.define([
    'sap/ui/thirdparty/jquery',
    './library',
    'sap/ui/core/Control',
    './RadioButtonRenderer',
    'sap/ui/core/library'
],
	function(jQuery, library, Control, RadioButtonRenderer, coreLibrary) {
	"use strict";



	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;



	/**
	 * Constructor for a new RadioButton.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * RadioButton is a control similar to CheckBox, but it allows the user to choose only one of the predefined set of options.
	 *
	 * Usually, RadioButton is used in a group with other RadioButtons (with the groupName property or by using
	 * sap.ui.commons.RadioButtonGroup), thus providing a limited choice for the user. An event is triggered when
	 * the user makes a change of the selection.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.RadioButton</code> control.
	 * @alias sap.ui.commons.RadioButton
	 */
	var RadioButton = Control.extend("sap.ui.commons.RadioButton", /** @lends sap.ui.commons.RadioButton.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * Defines the text displayed next to the RadioButton.
			 */
			text : {type : "string", group : "Data", defaultValue : null},

			/**
			 *
			 * Displays the disabled controls in another color, depending on the customer settings.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies whether the user can select the RadioButton.
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the select state of the RadioButton.
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 *
			 * Enumeration sap.ui.core.ValueState provides state values Error, Success, Warning and None.
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : ValueState.None},

			/**
			 * Determines the control width. By default, it depends on the text length. Alternatively, CSS sizes in % or px can be set.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 *
			 * Defines the text direction - options are left-to-right (LTR) and right-to-left (RTL). Alternatively, the control can
			 * inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Defines the name of the RadioButtonGroup, in which the current RadioButton belongs to. You can define a new name for
			 * the group. If no new name is specified, the default is sapUiRbDefaultGroup. By default, when one of the RadioButtons
			 * in a group is selected, all others are unselected.
			 */
			groupName : {type : "string", group : "Behavior", defaultValue : 'sapUiRbDefaultGroup'},

			/**
			 * Can be used for subsequent actions.
			 */
			key : {type : "string", group : "Data", defaultValue : null}
		},
		associations : {

			/**
			 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

			/**
			 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * Triggers when the user makes a change on the RadioButton.
			 */
			select : {}
		}
	}});

	RadioButton.prototype.init = function() {
		this._changeGroupName(this.getGroupName());
	};

	RadioButton.prototype.exit = function() {
		var sGroupName = this.getGroupName(),
			aGroup = this._groupNames[sGroupName];

		aGroup.splice(aGroup.indexOf(this), 1);
	};

	/**
	 * Event handler called, when the RadioButton is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onclick = function(oEvent) {

		if (this.getEnabled() && oEvent.target.id == (this.getId() + "-RB")) {
			this.focus();
		}

		this.userSelect(oEvent);
	};

	RadioButton.prototype._groupNames = {};

	/**
	 * Event handler called, when the space key is pressed.
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
	 * Event handler called when the radio button is focused.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RadioButton.prototype.onfocusin = function(oEvent) {
		if (this.getEnabled() && oEvent.target.id == (this.getId() + "-RB")) {
			this.focus();
		}
	};

	/**
	 * Handles event cancellation and fires the select event.
	 * Used only internally, whenever the user selects the RadioButton.
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
	 * Overwrites the definition from RadioButton.API.js
	 */
	RadioButton.prototype.setSelected = function(bSelected) {
		var oControl,
			bSelectedOld = this.getSelected(),
			sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName],
			iLength = aControlsInGroup && aControlsInGroup.length;

		this.setProperty("selected", bSelected, true); // No re-rendering

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
		sGroupName = this.validateProperty("groupName", sGroupName);

		this._changeGroupName(sGroupName, this.getGroupName());

		return this.setProperty("groupName", sGroupName, false);
	};

	RadioButton.prototype.getTooltipDomRefs = function() {
		return this.getDomRef().children;
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

});

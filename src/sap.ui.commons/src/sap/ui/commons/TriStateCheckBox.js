/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.TriStateCheckBox.
sap.ui.define([
    './library',
    'sap/ui/core/Control',
    './TriStateCheckBoxRenderer',
    'sap/ui/core/library',
    'sap/ui/Device'
],
	function(library, Control, TriStateCheckBoxRenderer, coreLibrary, Device) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.commons.TriStateCheckBoxState
	var TriStateCheckBoxState = library.TriStateCheckBoxState;

	/**
	 * Constructor for a new TriStateCheckBox.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * TriStateCheckBox to reflect mixed state for checkboxes. The control can display three states, namely checked, unchecked and mixed. However, mixed state cannot be directly reached by user interaction on the particular control.
	 * It can be only set by the control's public toggle function, to make a behaviour possible which is e.g. required in checkbox trees.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.7.2
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.commons.TriStateCheckBox
	 */
	var TriStateCheckBox = Control.extend("sap.ui.commons.TriStateCheckBox", /** @lends sap.ui.commons.TriStateCheckBox.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * Defines the states of the checkbox
			 */
			selectionState : {type : "sap.ui.commons.TriStateCheckBoxState", group : "Data", defaultValue : TriStateCheckBoxState.Unchecked},

			/**
			 * Defines the text displayed next to the check box
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Using this property, the control could be disabled, if required.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies whether the user shall be allowed to flag the check box
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Accepts the core enumeration ValueState.type that supports 'None', 'Error', 'Warning' and 'Success'.
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : ValueState.None},

			/**
			 * The width can be set to an absolute value. If no value is set, the control width results from the text length.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * The value can be set to LTR or RTL. Otherwise, the control inherits the text direction from its parent control.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
		},
		events : {

			/**
			 *
			 * Event is triggered when the control status is changed by the user by flagging or unflagging the checkbox.
			 */
			change : {
				parameters : {

					/**
					 *
					 * Checks whether the box is flagged or not flagged.
					 */
					selectionState : {type : "string"}
				}
			}
		}
	}});


	/**
	 * Event handler called when the check box is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TriStateCheckBox.prototype.onclick = function(oEvent) {
		if (Device.browser.msie && !this.getEnabled()) {
			// in IE tabindex = -1 hides focus, so in disabled case tabindex must be temporarily set to 0
			// as long as CheckBox is focused
			this.$().attr("tabindex", 0).addClass("sapUiTriCbFoc"); // the CSS class itself is not used, but IE only draws the standard focus outline when it is added
		}
		this.userToggle(oEvent);
	};

	/**
	 * Event handler called on focus out
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TriStateCheckBox.prototype.onfocusout = function(oEvent) {

		if (Device.browser.msie && !this.getEnabled()) {
			// in IE tabindex = -1 hides focus, so in disabled case tabindex must be temporarily set to 0
			// as long as CheckBox is focused - now unset this again
			this.$().attr("tabindex", -1).removeClass("sapUiTriCbFoc");
		}
	};

	/**
	 * Event handler called when the space key is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TriStateCheckBox.prototype.onsapspace = function(oEvent) {
		oEvent.preventDefault();
		this.userToggle(oEvent);
	};

	/**
	 * Method called internally whenever a user clicks on a tri-state checkbox:
	 * users can only switch between checked and unchecked by direct manipulation by click or key
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */

	TriStateCheckBox.prototype.userToggle = function(oEvent){
	if (this.getEnabled() && this.getEditable()) {
		// don't allow users to switch to mixed state manually
			if (this.getSelectionState() === 'Mixed' || this.getSelectionState() === "Unchecked") {
				this.toggle("Checked");
			} else {
				this.toggle("Unchecked");
			}
			this.fireChange({selectionState: this.getSelectionState()});
		} else {
			// CheckBox has been activated by the user, but value cannot be changed
			// do nothing, but restore the focus to the complete control
			this.getDomRef().focus();
		}
	};

	/**
	 * Method called whenever a user clicks on a tri-state checkbox
	 *
	 * @param {sap.ui.commons.TriStateCheckBoxState} destState
	 *         destined selection state of checkbox
	 * @public
	 */
	TriStateCheckBox.prototype.toggle = function(destState) {
		if (destState in TriStateCheckBoxState) {
				this.setSelectionState(destState);
		}
	};

	return TriStateCheckBox;

});

/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectNumber.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Lib",
	'sap/ui/core/library',
	"sap/ui/core/LabelEnablement",
	"sap/ui/events/KeyCodes",
	'./ObjectNumberRenderer'
],
	function(library, Control, Library, coreLibrary, LabelEnablement, KeyCodes, ObjectNumberRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	/**
	 * Constructor for a new ObjectNumber.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ObjectNumber control displays number and number unit properties for an object. The number can be displayed using semantic
	 * colors to provide additional meaning about the object to the user.
	 *
	 *
	 * With 1.63, large design of the control is supported by setting <code>sapMObjectNumberLarge</code> CSS class to the <code>ObjectNumber</code>.
	 *
	 * With 1.110, inner text wrapping could be enabled by adding the <code>sapMObjectNumberLongText</code> CSS class to the <code>ObjectNumber</code>. This class can be added by using оObjectStatus.addStyleClass("sapMObjectNumberLongText");
	 *
	 * <b>Note:</b> To fulfill the design guidelines when you are using <code>sapMObjectNumberLarge</code> CSS class set the <code>emphasized</code> property to <code>false</code>.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectNumber
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-display-elements/#-object-status Object Number}
	 */
	var ObjectNumber = Control.extend("sap.m.ObjectNumber", /** @lends sap.m.ObjectNumber.prototype */ {
		metadata : {

			interfaces : ["sap.ui.core.IFormContent"],
			library : "sap.m",
			designtime: "sap/m/designtime/ObjectNumber.designtime",
			properties : {
				/**
				 * Defines the number field.
				 */
				number : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Indicates if the object number should appear emphasized.
				 */
				emphasized : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Determines the object number's value state. Setting this state will cause the number to be rendered in state-specific colors.
				 */
				state : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : ValueState.None},

				/**
				 * Defines the number units qualifier. If numberUnit and unit are both set, the unit value is used.
				 * @since 1.16.1
				 */
				unit : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Available options for the number and unit text direction are LTR(left-to-right) and RTL(right-to-left). By default, the control inherits the text direction from its parent control.
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Sets the horizontal alignment of the number and unit.
				 */
				textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin},

				/**
				 * Indicates if the <code>ObjectNumber</code> text and icon can be clicked/tapped by the user.
				 *
				 * <b>Note:</b> If you set this property to <code>true</code>, you have to set also the <code>number</code> or <code>unit</code> property.
				 *
				 * @since 1.86
				 */
				active : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Determines whether the background color reflects the set <code>state</code> instead of the control's text.
				 * @since 1.86
				 */
				inverted : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Specifies if an empty indicator should be displayed when there is no number.
				 *
				 * @since 1.89
				 */
				emptyIndicatorMode: { type: "sap.m.EmptyIndicatorMode", group: "Appearance", defaultValue: EmptyIndicatorMode.Off }
			},
			associations : {
				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"},

				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
			},
			events : {

				/**
				 * Fires when the user clicks/taps on active <code>Object Number</code>.
				 * @since 1.86
				 */
				press : {}
			},
			dnd: { draggable: true, droppable: false }
		},

		renderer: ObjectNumberRenderer
	});


	// returns translated text for the state
	ObjectNumber.prototype._getStateText = function() {

		var sState = this.getState(),
			oRB = Library.getResourceBundleFor("sap.m");

			return oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_" + sState.toUpperCase(), [], true);
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {sap.ui.core.AccessibilityInfo} Current accessibility state of the control
	 * @protected
	 */
	ObjectNumber.prototype.getAccessibilityInfo = function() {
		var sStateText = "";

		if (this.getState() !== ValueState.None) {
			sStateText = this._getStateText();
		}

		return {
			description: (this.getNumber() + " " + this.getUnit() + " " + sStateText).trim()
		};
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectNumber.prototype.ontap = function(oEvent) {
		if (this._isClickable(oEvent)) {
			this.firePress();
		}
	};

	/**
	 * Ensures that parent interactive controls will not handle
	 * the touch/mouse events a second time.
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectNumber.prototype.ontouchstart = function(oEvent) {
		if (this._isClickable(oEvent)) {
			oEvent.setMarked();
		}
	};

	/**
	 * Applies active state to the OnjectNumber.
	 *
	 * @private
	 */
	ObjectNumber.prototype._activeState = function() {
		this.addStyleClass("sapMObjectNumberPressed");
	};

	/**
	 * Removes active state to the OnjectNumber.
	 *
	 * @private
	 */
	ObjectNumber.prototype._inactiveState = function() {
		this.removeStyleClass("sapMObjectNumberPressed");
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	ObjectNumber.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			// mark the event for components that needs to know if the event was handled by the button
			oEvent.setMarked();
			// set active state
			this._activeState();
			if (oEvent.which === KeyCodes.ENTER) {
				this.firePress();
			} else {
				oEvent.preventDefault();
				this._bPressedSpace = true;
			}
		} else if (this._bPressedSpace) {
			if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
				this._bPressedEscapeOrShift = true;
				// set inactive state
				this._inactiveState();
			} else {
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Handle the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	ObjectNumber.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.ENTER) {
			// mark the event for components that needs to know if the event was handled by the button
			oEvent.setMarked();
			// set inactive state
			this._inactiveState();
		} else if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bPressedEscapeOrShift) {
				// mark the event for components that needs to know if the event was handled by the button
				oEvent.setMarked();
				this.firePress();
				// set inactive state
				this._inactiveState();
			} else {
				this._bPressedEscapeOrShift = false;
			}
			this._bPressedSpace = false;
		} else if (oEvent.which === KeyCodes.ESCAPE){
			this._bPressedSpace = false;
		}
	};

	/**
	 * Checks if the ObjectNumber should be considered as active.
	 * @private
	 * @returns {boolean} If the ObjectNumber is active
	 */
	ObjectNumber.prototype._isActive = function() {
		return  this.getActive() && (this.getNumber().trim() || this.getUnit().trim());
	};


	ObjectNumber.prototype._isClickable = function(oEvent) {
		var sSourceId = oEvent.target.id;

		//event should only be fired if the click is on the number, unit or link
		return this._isActive() && (sSourceId === this.getId() + "-link" || sSourceId === this.getId() + "-number" || sSourceId === this.getId() + "-unit");
	};

	/**
	 * Checks whether or not the control is labelled either via labels or its <code>ariaLabelledBy</code> association.
	 * @returns {boolean}
	 * @private
	 */
	ObjectNumber.prototype._hasExternalLabelling = function() {
		return this.getAriaLabelledBy().length > 0 || LabelEnablement.getReferencingLabels(this).length > 0;
	};

	/**
	 * Generates a string containing all internal elements' IDs, which provide information to the screen reader user.
	 * @returns {string}
	 * @private
	 */
	ObjectNumber.prototype._generateSelfLabellingIds = function() {
		var sId = this.getId(),
			sResult = "";

		if (this.getNumber()) {
			sResult += sId + "-number ";
		}

		if (this.getUnit() && this.getEmptyIndicatorMode() === EmptyIndicatorMode.Off) {
			sResult += sId + "-unit ";
		}

		if ((this.getNumber() && this.getEmphasized())) {
			sResult += sId + "-emphasized ";
		}

		if ((this.getNumber() && this.getState() !== ValueState.None)) {
			sResult += sId + "-state";
		}

		return sResult.trim();
	};

	return ObjectNumber;

});

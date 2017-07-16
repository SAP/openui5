/*!
 * ${copyright}
 */

// Provides control sap.m.RadioButton.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', './RadioButtonGroup'],
	function(jQuery, library, Control, EnabledPropagator, RadioButtonGroup) {
	"use strict";



	/**
	 * Constructor for a new RadioButton.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * Enables users to select a single option from a set of options.
	 * @class
	 * RadioButton is a control similar to a {@link sap.m.CheckBox checkbox}, but it allows you to choose only one of the predefined set of options.
	 * Multiple radio buttons have to belong to the same group (have the same value for <code>groupName</code>) in order to be mutually exclusive.
	 * A wrapper control {@link sap.m.RadioButtonGroup RadioButtonGroup} can be used instead of individual radio buttons.
	 * <h3>Structure</h3>
	 * <ul>
	 * <li>Radio buttons can have a value state like Error or Warning.</li>
	 * <li>Radio buttons can be arranged vertically by setting the <code>column</code> to a number higher than 1.</li>
	 * <li>Radio button options need to have a {@link sap.m.Label label}.</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>You quickly need to choose between at least two alternatives.</li>
	 * <li>You need to place other controls between the radio button options.</li>
	 * </ul>
	 * <h4>When not to use:</h4>
	 * <ul>
	 * <li>You want to select multiple values for the same option. Use {@link sap.m.CheckBox checkboxes} instead.</li>
	 * <li>When the default value is recommended for most users in most situations. Use a {@link sap.m.Select drop-down} instead as is saves space by not showing all the alternatives.</li>
	 * <li>You want have more than 8 options. Use a {@link sap.m.Select drop-down} instead.</li>
	 * <li>When the options are mutually exclusive e.g. ON/OFF. Use a {@link sap.m.Switch switch} instead.</li>
	 * <li>Avoid using horizontally aligned radio buttons as they will be cut off on phones.</li>
	 * </ul>
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.RadioButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RadioButton = Control.extend("sap.m.RadioButton", /** @lends sap.m.RadioButton.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		properties : {

			/**
			 * Specifies if the radio button is disabled.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the select state of the radio button
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 * Name of the radio button group the current radio button belongs to. You can define a new name for the group.
			 * If no new name is specified, this radio button belongs to the sapMRbDefaultGroup per default. Default behavior of a radio button in a group is that when one of the radio buttons in a group is selected, all others are unselected.
			 */
			groupName : {type : "string", group : "Behavior", defaultValue : 'sapMRbDefaultGroup'},

			/**
			 * Specifies the text displayed next to the RadioButton
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
             * Width of the RadioButton or it's label depending on the useEntireWidth property.
             * By Default width is set only for the label.
             * @see {sap.m.RadioButton#useEntireWidth}
             */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * Indicates if the given width will be applied for the whole RadioButton or only it's label.
			 * By Default width is set only for the label.
			 * @since 1.42
			 */
			useEntireWidth : {type : "boolean", group: "Appearance", defaultValue : false },

			/**
			 * This is a flag to switch on activeHandling. When it is switched off,
			 * there will not be visual changes on active state. Default value is 'true'
			 */
			activeHandling : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Specifies whether the user can select the radio button.
			 * @since 1.25
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 *
			 * Enumeration sap.ui.core.ValueState provides state values Error, Success, Warning, None
			 * @since 1.25
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},

			/**
			 * Specifies the alignment of the radio button. Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
			 * @since 1.28
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin}
		},
		events : {

			/**
			 * Event is triggered when the user makes a change on the radio button (selecting or unselecting it).
			 */
			select : {
				parameters : {

					/**
					 * Checks whether the RadioButton is active or not.
					 */
					selected : {type : "boolean"}
				}
			}
		},
		associations : {

			/**
			 * Association to controls / IDs which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		designTime : true
	}});


	/**
	 * Method to set a RadioButton's state to active or inactive.
	 *
	 * @name sap.m.RadioButton#setActiveState
	 * @function
	 * @param {boolean} bActive - Sets the active state to true or false
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * This file defines behavior for the control,
	 */

	EnabledPropagator.call(RadioButton.prototype);

	RadioButton.prototype._groupNames = {};

	// Keyboard navigation variants
	var KH_NAVIGATION = {
		HOME: "first",
		END: "last",
		NEXT: "next",
		PREV: "prev"
	};

	/**
	 * Function is called when radiobutton is tapped.
	 *
	 * @private
	 */
	RadioButton.prototype.ontap = function(oEvent) {

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		var oParent = this.getParent();

		// check if the RadioButton is part of a RadioButtonGroup which is disabled/readonly
		if (oParent instanceof RadioButtonGroup && (!oParent.getEnabled() || !oParent.getEditable())) {
			return;
		}

		// mark the event that it is handled by the control
		oEvent && oEvent.setMarked();

		this.applyFocusInfo();

		if (!this.getSelected()) {
			this.setSelected(true);

			var that = this;
			setTimeout(function() {
				that.fireSelect({selected: true});
			}, 0);

		}
	};

	/**
	 * Function is called when radiobutton is being touched. Only necessary for Android/Blackberry.
	 *
	 * @private
	 */
	RadioButton.prototype.ontouchstart = function(oEvent) {

		//for control who need to know if they should handle events from the CheckBox control
		oEvent.originalEvent._sapui_handledByControl = true;
		if (this.getEnabled() && this.getActiveHandling()) {
			this.$().toggleClass("sapMRbBTouched", true);
		}
	};

	RadioButton.prototype.ontouchend = function(oEvent) {
		this.$().toggleClass("sapMRbBTouched", false);
	};

	RadioButton.prototype.onsapnext = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.NEXT, true);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsapnextmodifiers = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.NEXT, !oEvent.ctrlKey);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsapprevious = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.PREV, true);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsappreviousmodifiers = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.PREV, !oEvent.ctrlKey);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsaphome = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.HOME, true);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsaphomemodifiers = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.HOME, !oEvent.ctrlKey);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsapend = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.END, true);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	RadioButton.prototype.onsapendmodifiers = function(oEvent) {
		this._keyboardHandler(KH_NAVIGATION.END, !oEvent.ctrlKey);

		// mark the event that it is handled by the control
		oEvent.setMarked();

		return this;
	};

	/**
	 * Determines which button becomes focused after an arrow key is pressed.
	 * @param {string} sPosition Button to be focused
	 * @param {boolean} bSelect Determines if the button should be selected
	 * @private
	 */
	RadioButton.prototype._keyboardHandler = function(sPosition, bSelect) {
		if (this.getParent() instanceof sap.m.RadioButtonGroup) {
			return;
		}

		var oNextItem = this._getNextFocusItem(sPosition);
		oNextItem.focus();
		bSelect && oNextItem.setSelected(true);
	};

	/**
	 * Determines next focusable item
	 *
 	 * @param {enum} sNavigation any item from KH_NAVIGATION
	 * @returns {RadioButton}
	 * @private
	 */
	RadioButton.prototype._getNextFocusItem = function(sNavigation) {
		var aVisibleBtnsGroup = this._groupNames[this.getGroupName()].filter(function (oRB) {
			return (oRB.getDomRef() && oRB.getEnabled());
		});

		var iButtonIndex = aVisibleBtnsGroup.indexOf(this),
			iIndex = iButtonIndex,
			iVisibleBtnsLength = aVisibleBtnsGroup.length;

		switch (sNavigation) {
			case KH_NAVIGATION.NEXT:
				iIndex = iButtonIndex === iVisibleBtnsLength - 1 ? iButtonIndex : iButtonIndex + 1;
				break;
			case KH_NAVIGATION.PREV:
				iIndex = iButtonIndex === 0 ? 0 : iIndex - 1;
				break;
			case KH_NAVIGATION.HOME:
				iIndex = 0;
				break;
			case KH_NAVIGATION.END:
				iIndex = iVisibleBtnsLength - 1;
				break;
		}

		return aVisibleBtnsGroup[iIndex] || this;
	};

	// #############################################################################
	// Keyboard Handling Events
	// #############################################################################
	/**
	* Pseudo event for pseudo 'select' event... space, enter, ... without modifiers (Ctrl, Alt or Shift)
	* @param {object} oEvent - provides information for the event
	* @public
	*/
	RadioButton.prototype.onsapselect = function(oEvent) {

		oEvent.preventDefault();
		this.ontap(oEvent);
	};

	RadioButton.prototype.setEnabled = function(bEnabled) {
		this.setProperty("enabled", bEnabled, false);

		return this;
	};



	// #############################################################################
	// Overwritten methods that are also generated in RadioButton.API.js
	// #############################################################################

	/**
	 * Sets the state of the RadioButton to selected.
	 * @param {boolean} bSelected - defines if the radio button is selected
	 * @returns {sap.m.RadioButton} Reference to the control instance for chaining
	 * @public
	 */
	RadioButton.prototype.setSelected = function(bSelected) {
		var oControl,
			bSelectedOld = this.getSelected(),
			sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName],
			iLength = aControlsInGroup && aControlsInGroup.length;

		this.setProperty("selected", bSelected, true); // No re-rendering
		this._changeGroupName(this.getGroupName());

		if (!!bSelected && sGroupName && sGroupName !== "") { // If this radio button is selected and groupName is set, explicitly deselect the other radio buttons of the same group
			for (var i = 0; i < iLength; i++) {
				oControl = aControlsInGroup[i];

				if (oControl instanceof RadioButton && oControl !== this && oControl.getSelected()) {
					oControl.fireSelect({ selected: false });
					oControl.setSelected(false);
				}
			}
		}

		if ((bSelectedOld !== !!bSelected) && this.getDomRef()) {
			this.$().toggleClass("sapMRbSel", bSelected);

			if (bSelected) {
				this.getDomRef().setAttribute("aria-checked", "true");
				this.getDomRef("RB").checked = true;
				this.getDomRef("RB").setAttribute("checked", "checked");
			} else {
				this.getDomRef().removeAttribute("aria-checked"); // aria-checked=false is default value and need not be set explicitly
				this.getDomRef("RB").checked = false;
				this.getDomRef("RB").removeAttribute("checked");
			}
		}

		return this;
	};

	/**
	 * Sets the text for the RadioButton's label.
	 * @param {string} sText - The text to be set
	 * @returns {sap.m.RadioButton} Reference to the control instance for chaining
	 * @public
	 */
	RadioButton.prototype.setText = function(sText) {
		this.setProperty("text", sText, true);
		if (this._oLabel) {
			this._oLabel.setText(this.getText());
		} else {
			this._createLabel("text", this.getText());
		}
		this.addStyleClass("sapMRbHasLabel");
		return this;
	};

	/**
	 * Depeding on useEntireWidth sets the width to the RadioButton's label or the whole RadioButton
	 * @param {boolean} bUserEntireWidth - Determines if the width will be set to the label only or to the whole RadioButton
	 * @private
	 */
	RadioButton.prototype._setWidth = function(bUserEntireWidth) {
		if (!bUserEntireWidth) {
			this._setLableWidth();
		} else {
			this._setLableWidth("auto");
		}
	};

	/**
	 * Sets the width for the RadioButton's label.
	 * @param {string} sWidth - CSS size to be set as width
	 * @private
	 */
	RadioButton.prototype._setLableWidth = function(sWidth) {
		sWidth = sWidth || this.getWidth();

		if (this._oLabel) {
			this._oLabel.setWidth(sWidth);
		} else {
			this._createLabel("width", sWidth);
		}
	};

	/**
	 * Sets the text direction for the RadioButton's label.
	 * @param {string} sDirection - Text direction to be set to RadioButton's label
	 * @returns {sap.m.RadioButton} Reference to the control instance for chaining
	 * @public
	 */
	RadioButton.prototype.setTextDirection = function(sDirection) {

		this.setProperty("textDirection", sDirection, true);
		if (this._oLabel) {
			this._oLabel.setTextDirection(this.getTextDirection());
		} else {
			this._createLabel("textDirection", this.getTextDirection());
		}
		return this;
	};

	/**
	 * Sets RadioButton's groupName. Only one radioButton from the same group can be selected
	 * @param {string} sGroupName - Name of the group to which the RadioButton will belong.
	 * @returns {sap.m.RadioButton} Reference to the control instance for chaining
	 * @public
	 */
	RadioButton.prototype.setGroupName = function(sGroupName) {
		this._changeGroupName(sGroupName, this.getGroupName());
		return this.setProperty("groupName", sGroupName, true);
	};

	RadioButton.prototype.onBeforeRendering = function() {
		// Set the width before rendering as both width and useEntireWidth are dependent
		this._setWidth(this.getUseEntireWidth());
		return this._changeGroupName(this.getGroupName());
	};

	/**
	 * Destroys all related objects to the RadioButton
	 * @public
	 */
	RadioButton.prototype.exit = function() {
		var sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName],
			iGroupNameIndex = aControlsInGroup && aControlsInGroup.indexOf(this);

		this._iTabIndex = null;
		if (this._oLabel) {
			this._oLabel.destroy();
		}

		if (iGroupNameIndex >= -1) {
			aControlsInGroup.splice(iGroupNameIndex, 1);
		}
	};

	/**
	 * Creates label and sets a property to it.
	 * @param {string} prop - Property to be set to the new label.
	 * @param {string} value - Value of the property which will be set.
	 * @private
	 */
	RadioButton.prototype._createLabel = function(prop, value) {
		this._oLabel = new sap.m.Label(this.getId() + "-label").addStyleClass("sapMRbBLabel").setParent(this, null, true);
		this._oLabel.setProperty(prop, value, false);
	};

	/*
	 * Sets the tab index of the control
	 *
	 * @param {int} iTabIndex - Greater than or equal to -1
	 * @return {sap.m.RadioButton}
	 * @since 1.16
	 * @protected
	 */
	RadioButton.prototype.setTabIndex = function(iTabIndex) {
		var oFocusDomRef = this.getFocusDomRef();
		this._iTabIndex = iTabIndex;

		if (oFocusDomRef) {
			oFocusDomRef.setAttribute("tabindex", iTabIndex);
		}

		return this;
	};

	/*
	 * Sets the textAlign to the internal label
	 * @param {string} sAlign
	 * @return {sap.m.RadioButton}
	 * @since 1.28
	 * @public
	 */
	RadioButton.prototype.setTextAlign = function(sAlign) {
		this.setProperty("textAlign", sAlign, true);
		if (this._oLabel) {
			this._oLabel.setTextAlign(this.getTextAlign());
		} else {
			this._createLabel("textAlign", this.getTextAlign());
		}
		return this;
	};

	/**
	 * Changes the groupname of a RadioButton.
	 * @param {string} sNewGroupName - Name of the new group.
	 * @param {string} sOldGroupName - Name of the old group.
	 * @private
	 */
	RadioButton.prototype._changeGroupName = function(sNewGroupName, sOldGroupName) {
		var aNewGroup = this._groupNames[sNewGroupName],
			aOldGroup = this._groupNames[sOldGroupName];

		if (aOldGroup && aOldGroup.indexOf(this) !== -1) {
			aOldGroup.splice(aOldGroup.indexOf(this), 1);
		}

		if (!aNewGroup) {
			aNewGroup = this._groupNames[sNewGroupName] = [];
		}

		if (aNewGroup.indexOf(this) === -1) {
			aNewGroup.push(this);
		}

	};

	return RadioButton;

}, /* bExport= */ true);

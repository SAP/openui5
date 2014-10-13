/*!
 * ${copyright}
 */

// Provides control sap.m.RadioButton.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator'],
	function(jQuery, library, Control, EnabledPropagator) {
	"use strict";


	
	/**
	 * Constructor for a new RadioButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Generally, you would create at least two radio button controls which should have the same GroupName;
	 * by this, you provide a limited choice for the user. Triggers an Event when User makes a change.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.RadioButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RadioButton = Control.extend("sap.m.RadioButton", /** @lends sap.m.RadioButton.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Invisible radio buttons are not rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Disabled controls are displayed in another color.
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
			 * Defines the text displayed next to the RadioButton
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
	
			/**
			 * Width of Label
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},
	
			/**
			 * this is a flag to switch on activeHandling, when it is switch
			 * ed off, there will not be visual changes on active state. Default value is 'true'
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
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None}
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
		}
	}});
	
	
	/**
	 * Method to set a RadioButton's state to active or inactive.
	 *
	 * @name sap.m.RadioButton#setActiveState
	 * @function
	 * @param {boolean} bActive
	 *         boolean to set the active state to true or false
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	/**
	 * This file defines behavior for the control,
	 */
	
	EnabledPropagator.call(RadioButton.prototype);
	
	RadioButton.prototype._groupNames = {};
	
	RadioButton.prototype.onBeforeRendering = function () {
		var sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName];
	
		if (!aControlsInGroup) {
			aControlsInGroup = this._groupNames[sGroupName] = [];
		}
	
		if (aControlsInGroup.indexOf(this) === -1) {
			aControlsInGroup.push(this);
		}
	};
	
	/**
	 * Function is called when radiobutton is tapped.
	 *
	 * @private
	 */
	RadioButton.prototype.ontap = function() {
		
		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}
	
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
	 * Function is called when radiobutton is being touched. Only necessary for Android/Black-Berry.
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
	
	// #############################################################################
	// Keyboard Handling Events
	// #############################################################################
	/**
	* Pseudo event for pseudo 'select' event... space, enter, ... without modifiers (Ctrl, Alt or Shift)
	* @param {object} oEvent
	* @public
	*/
	RadioButton.prototype.onsapselect = function(oEvent) {
		
		oEvent.preventDefault();
		this.ontap(oEvent);
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
	
		if (bSelected && sGroupName && sGroupName !== "") { // If this radio button is selected and groupName is set, explicitly deselect the other radio buttons of the same group
			for (var i = 0; i < iLength; i++) {
				oControl = aControlsInGroup[i];
				
				if (oControl instanceof RadioButton && oControl !== this && oControl.getSelected()) {
					oControl.fireSelect({ selected: false });
					oControl.setSelected(false);
				}
			}
		}
	
		if ((bSelectedOld !== bSelected) && this.getDomRef()) {
			this.$().toggleClass('sapMRbSel', bSelected).attr('aria-checked', bSelected);
	
			if (bSelected) {
				this.getDomRef("RB").checked = true;
				this.getDomRef("RB").setAttribute('checked', 'checked');
			} else {
				this.getDomRef("RB").checked = false;
				this.getDomRef("RB").removeAttribute('checked');
			}
		}
	
		return this;
	};
	
	RadioButton.prototype.setText = function(sText) {
		
		this.setProperty("text", sText, true);
		if (this._oLabel) {
			this._oLabel.setText(this.getText());
		} else {
			this._createLabel("text", this.getText());
		}
		return this;
	};
	
	RadioButton.prototype.setWidth = function(sWidth) {
		
		this.setProperty("width", sWidth, true);
		if (this._oLabel) {
			this._oLabel.setWidth(this.getWidth());
		} else {
			this._createLabel("width", this.getWidth());
		}
		return this;
	};
	
	RadioButton.prototype.setTextDirection = function(sDirection) {
		
		this.setProperty("textDirection", sDirection, true);
		if (this._oLabel) {
			this._oLabel.setTextDirection(this.getTextDirection());
		} else {
			this._createLabel("textDirection", this.getTextDirection());
		}
		return this;
	};
	
	RadioButton.prototype.exit = function() {
		var sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName],
			iGroupNameIndex = aControlsInGroup && aControlsInGroup.indexOf(this);
	
		delete this._iTabIndex;
		if (this._oLabel) {
			this._oLabel.destroy();
		}
	
		if (iGroupNameIndex && iGroupNameIndex !== -1) {
			aControlsInGroup.splice(iGroupNameIndex, 1);
		}
	};
	
	RadioButton.prototype._createLabel = function(prop, value) {
		this._oLabel = new sap.m.Label(this.getId() + "-label").addStyleClass("sapMRbBLabel").setParent(this, null, true);
		this._oLabel.setProperty(prop, value, false);
	};
	
	/*
	 * Sets the tab index of the control
	 *
	 * @param {int} iTabIndex  greater than or equal -1
	 * @return {sap.m.RadioButton}
	 * @since 1.16
	 * @protected
	 */
	RadioButton.prototype.setTabIndex = function(iTabIndex) {
		
		this._iTabIndex = iTabIndex;
		this.$("Button").attr("tabindex", iTabIndex);
		return this;
	};
	
	RadioButton.prototype.getFocusDomRef = function(oFocusInfo) {
		
		//set the focus on the radio button wrapper
		return this.getDomRef("Button");
	};
	
	RadioButton.prototype.applyFocusInfo = function(oFocusInfo) {
		
		this.$().focus();
	};
	

	return RadioButton;

}, /* bExport= */ true);

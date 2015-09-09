/*!
 * ${copyright}
 */

// Provides control sap.m.RadioButtonGroup.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation'],
		function(jQuery, library, Control, ItemNavigation) {
			"use strict";



			/**
			 * Constructor for a new RadioButtonGroup.
			 *
			 * @param {string} [sId] id for the new control, generated automatically if no id is given
			 * @param {object} [mSettings] initial settings for the new control
			 *
			 * @class
			 * This control is used as a wrapper for a group of RadioButton controls, which then can be used as a single UI element.
			 * You can select only one of the grouped radio buttons at a time. Some of the radio buttons can be configured as inactive (they are displayed as grayed out).
			 * The grouped radio buttons can be arranged within different number of columns.
			 * Based on the number of specified columns and the number of radio buttons used, different layout types can be achieved - as a 'matrix', horizontally or vertically aligned radio buttons, etc.

			 * @extends sap.ui.core.Control
			 *
			 * @author SAP SE
			 * @version ${version}
			 *
			 * @constructor
			 * @public
			 * @since 1.25.0
			 * @alias sap.m.RadioButtonGroup
			 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
			 */
			var RadioButtonGroup = Control.extend("sap.m.RadioButtonGroup", /** @lends sap.m.RadioButtonGroup.prototype */ { metadata : {

				library : "sap.m",
				properties : {

					/**
					 * Width of the RadioButtonGroup.
					 */
					width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

					/**
					 * Number of RadioButtons displayed in one line/column.
					 */
					columns : {type : "int", group : "Appearance", defaultValue : 1},

					/**
					 * Specifies whether the user can select the RadioButtonGroup. When the property is set to false, the control obtains visual styles different from its visual styles for the normal and the disabled state. Additionally the control is no longer interactive, but can receive focus.
					 */
					editable : {type : "boolean", group : "Behavior", defaultValue : true},

					/**
					 * Тhe value state to be displayed for the radiobutton. Possible values are: Error, Warning, Success and None.
					 * Note: Setting this attribute to sap.ui.core.ValueState.Error when the accessibility feature is enabled,
					 * sets the value of the invalid propery for the whole radiobutton group to “true”.
					 */
					valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},

					/**
					 * Determines the index of the selected/checked RadioButton. Default is 0.
					 * If no radio button is selected, the selectedIndex property will return -1.
					 */
					selectedIndex : {type : "int", group : "Data", defaultValue : 0},

					/**
					 * Switches the enabled state of the control. All Radio Buttons inside a disabled group are disabled. Default value is “true”.
					 */
					enabled : {type : "boolean", group : "Behavior", defaultValue : true},

					/**
					 * This property specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
					 * @since 1.28.0
					 */
					textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
				},
				defaultAggregation : "buttons",
				aggregations : {

					/**
					 * returns a list of the RadioButtons in a RadioButtonGroup
					 */
					buttons : {type : "sap.m.RadioButton", multiple : true, singularName : "button", bindable : "bindable"}
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
					 * Event is fired when selection is changed by user interaction.
					 */
					select : {
						parameters : {

							/**
							 * Index of the selected RadioButton.
							 */
							selectedIndex : {type : "int"}
						}
					}
				}
			}});


			RadioButtonGroup.prototype.exit = function() {

				this.destroyButtons();

				if (this._oItemNavigation) {
					this.removeDelegate(this._oItemNavigation);
					this._oItemNavigation.destroy();
					delete this._oItemNavigation;
				}
			};

			RadioButtonGroup.prototype.onBeforeRendering = function() {

				if (this.getSelectedIndex() > this.getButtons().length) {
					jQuery.sap.log.warning("Invalid index, set to 0");
					this.setSelectedIndex(0);
				}
			};

			RadioButtonGroup.prototype.onAfterRendering = function() {

				this._initItemNavigation();

				// update ARIA information of RadioButtons
				for (var i = 0; i < this.aRBs.length; i++) {
					this.aRBs[i].$().attr("aria-posinset", i + 1).attr("aria-setsize", this.aRBs.length);
				}
			};

			/*
			 * initialize ItemNavigation. Transfer RadioButtons to ItemNavigation.
			 * TabIndexes are set by ItemNavigation
			 * @private
			 */
			RadioButtonGroup.prototype._initItemNavigation = function() {

				// Collect buttons for ItemNavigation
				var aDomRefs = [];
				var bHasEnabledRadios = false;
				var bRadioGroupEnabled = this.getEnabled();
				for (var i = 0; i < this.aRBs.length; i++) {
					aDomRefs.push(this.aRBs[i].getDomRef());

					// if the i-th radio button is enabled - set the flag to true
					bHasEnabledRadios = bHasEnabledRadios || this.aRBs[i].getEnabled();
				}

				// if no radio buttons are enabled or the whole group is disabled
				if (!bHasEnabledRadios || !bRadioGroupEnabled) {
					// dismiss item navigation
					if (this._oItemNavigation) {
						this.removeDelegate(this._oItemNavigation);
						this._oItemNavigation.destroy();
						delete this._oItemNavigation;
					}
					return;
				}

				// init ItemNavigation
				if (!this._oItemNavigation) {
					this._oItemNavigation = new ItemNavigation();
					this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._handleAfterFocus, this);
					this.addDelegate(this._oItemNavigation);
				}
				this._oItemNavigation.setRootDomRef(this.getDomRef());
				this._oItemNavigation.setItemDomRefs(aDomRefs);
				this._oItemNavigation.setCycling(true);
				this._oItemNavigation.setColumns(this.getColumns());
				this._oItemNavigation.setSelectedIndex(this.getSelectedIndex());
				this._oItemNavigation.setFocusedIndex(this.getSelectedIndex());
			};

			/*
			 * Set selected RadioButton via Index
			 * @param {sap.ui.core.Integer} iSelectedIndex the index of the radio button which has to be selected
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.setSelectedIndex = function(iSelectedIndex) {

				var iIndexOld = this.getSelectedIndex();

				if (iSelectedIndex < -1) {
					// invalid negative index -> don't change index.
					jQuery.sap.log.warning("Invalid index, will not be changed");
					return this;
				}

				this.setProperty("selectedIndex", iSelectedIndex, true); // no re-rendering

				// deselect old RadioButton
				if (!isNaN(iIndexOld) && this.aRBs && this.aRBs[iIndexOld]) {
					this.aRBs[iIndexOld].setSelected(false);
				}

				// select new one
				if (this.aRBs && this.aRBs[iSelectedIndex]) {
					this.aRBs[iSelectedIndex].setSelected(true);
				}

				if (this._oItemNavigation) {
					this._oItemNavigation.setSelectedIndex(iSelectedIndex);
					this._oItemNavigation.setFocusedIndex(iSelectedIndex);
				}

				return this;
			};

			/*
			 * Set selected RadioButton via Button
			 * @param {sap.m.RadioButton} oSelectedButton the item to be selected.
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */

			/**
			 * Sets the button as selected and removes the selection from the previous one.
			 *
			 * @param {sap.m.RadioButton} oButton
			 *         Selected button.
			 * @type void
			 * @public
			 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
			 */
			RadioButtonGroup.prototype.setSelectedButton = function(oSelectedButton) {

				var aButtons = this.getButtons();

				if (oSelectedButton) {
					if (aButtons) {
						for (var i = 0; i < aButtons.length; i++) {
							if (oSelectedButton.getId() == aButtons[i].getId()) {
								this.setSelectedIndex(i);
								break;
							}
						}
					}
				} else {
					this.setSelectedIndex(-1);
				}

				return this;
			};

			/*
			 * Get Button of selected RadioButton
			 * @public
			 * @returns {sap.m.RadioButton} the selected radio button
			 */

			/**
			 * Returns selected button. When no button is selected, "null" is returned.
			 *
			 * @type sap.m.RadioButton
			 * @public
			 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
			 */
			RadioButtonGroup.prototype.getSelectedButton = function() {

				return this.getButtons()[this.getSelectedIndex()];
			};

			/*
			 * Adds a new Button
			 * If a button is added a new RadioButton must be added
			 * @param {sap.m.RadioButton} oButton the button which will be added to the group
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.addButton = function(oButton) {

				this.myChange = true;
				this.addAggregation("buttons", oButton);
				oButton.attachEvent("_change", this._handleItemChanged, this);
				this.myChange = undefined;

				if (!this._bUpdateButtons) {
					if (this.getSelectedIndex() === -1) {
						// if not defined -> select first one
						this.setSelectedIndex(0);
					}
				}

				if (!this.aRBs) {
					this.aRBs = [];
				}

				var iIndex = this.aRBs.length;

				this.aRBs[iIndex] = this._createRadioButton(oButton, iIndex);

				return this;
			};

			/*
			 * Inserts a new Button
			 * If a button is inserted a new RadioButton must be inserted
			 * @param {sap.m.RadioButton} oButton the button which will be added to the group
			 * @param {sap.ui.core.Integer} iIndex the index at which oButton will be added
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.insertButton = function(oButton, iIndex) {

				this.myChange = true;
				this.insertAggregation("buttons", oButton, iIndex);
				oButton.attachEvent("_change", this._handleItemChanged, this);
				this.myChange = undefined;

				if (!this.aRBs) {
					this.aRBs = [];
				}

				var iLength = this.aRBs.length;

				if (!this._bUpdateButtons) {
					if (this.getSelectedIndex() === undefined || iLength == 0) {
						// if not defined -> select first one
						this.setSelectedIndex(0);
					} else if (this.getSelectedIndex() >= iIndex) {
						// If inserted before selected one, move selection index (only change parameter, not RadioButton)
						this.setProperty("selectedIndex", this.getSelectedIndex() + 1, true); // no re-rendering
					}
				}

				if (iIndex >= iLength) {
					this.aRBs[iIndex] = this._createRadioButton(oButton, iIndex);
				} else {
					// Insert RadioButton: loop backwards over Array and shift everything
					for (var i = (iLength); i > iIndex; i--) {
						this.aRBs[i] = this.aRBs[i - 1];
						if ((i - 1) == iIndex) {
							this.aRBs[i - 1] = this._createRadioButton(oButton, iIndex);
						}
					}
				}

				return this;
			};

			/*
			 * create RadioButton for a button
			 * @param {sap.m.RadioButton} oButton the button from which a radio button will be created
			 * @param {sap.ui.core.Integer} iIndex the index in the group at which the radio button will be placed
			 * @private
			 * @returns {sap.m.RadioButton} the created radio button
			 */
			RadioButtonGroup.prototype._createRadioButton = function(oButton, iIndex) {

				if (this.iIDCount == undefined) {
					this.iIDCount = 0;
				} else {
					this.iIDCount++;
				}

				var oRadioButton = new sap.m.RadioButton(this.getId() + "-" + this.iIDCount);
				oRadioButton.setText(oButton.getText());
				oRadioButton.setTooltip(oButton.getTooltip());

				// Enabled if both the group and the button are enabled
				oRadioButton.setEnabled(this.getEnabled() && oButton.getEnabled());
				oRadioButton.setTextDirection(oButton.getTextDirection());
				oRadioButton.setEditable(this.getEditable() && oButton.getEditable());
				oRadioButton.setVisible(this.getVisible() && oButton.getVisible());
				oRadioButton.setValueState(this.getValueState());
				oRadioButton.setGroupName(this.getId());
				oRadioButton.setParent(this);

				if (iIndex == this.getSelectedIndex()) {
					oRadioButton.setSelected(true);
				}

				oRadioButton.attachEvent("select", this._handleRBSelect, this);

				return oRadioButton;
			};

			/*
			 * Removes a Button
			 * If an button is removed the corresponding RadioButton must be deleted
			 * @public
			 * @returns {sap.m.RadioButton} the removed radio button
			 */
			RadioButtonGroup.prototype.removeButton = function(vElement) {

				var iIndex = vElement;
				if (typeof (vElement) == "string") { // ID of the element is given
					vElement = sap.ui.getCore().byId(vElement);
				}
				if (typeof (vElement) == "object") { // the element itself is given or has just been retrieved
					iIndex = this.indexOfButton(vElement);
				}

				this.myChange = true;
				var oButton = this.removeAggregation("buttons", iIndex);
				oButton.detachEvent("_change", this._handleItemChanged, this);
				this.myChange = undefined;

				if (!this.aRBs) {
					this.aRBs = [];
				}

				if (!this.aRBs[iIndex]) {
					// RadioButton not exists
					return null;
				}

				this.aRBs[iIndex].destroy();
				this.aRBs.splice(iIndex, 1);

				if (!this._bUpdateButtons) {
					if (this.aRBs.length == 0) {
						this.setSelectedIndex(-1);
					} else if (this.getSelectedIndex() == iIndex) {
						// selected one is removed -> select first one
						this.setSelectedIndex(0);
					} else {
						if (this.getSelectedIndex() > iIndex) {
							// If removed before selected one, move selection index (only change parameter, not RadioButton)
							this.setProperty("selectedIndex", this.getSelectedIndex() - 1, true); // no re-rendering
						}
					}
				}

				return oButton;
			};

			/*
			 * Removes all buttons
			 * If all buttons are removed all RadioButtons must be deleted
			 * @public
			 * @returns a list of the removed buttons or null
			 */
			RadioButtonGroup.prototype.removeAllButtons = function() {

				this.myChange = true;
				var aButtons = this.removeAllAggregation("buttons");
				for (var i = 0; i < aButtons.length; i++) {
					aButtons[i].detachEvent("_change", this._handleItemChanged, this);
				}
				this.myChange = undefined;

				if (!this._bUpdateButtons) {
					this.setSelectedIndex(-1);
				}

				if (this.aRBs) {
					while (this.aRBs.length > 0) {
						this.aRBs[0].destroy();
						this.aRBs.splice(0, 1);
					}
					return aButtons;
				} else {
					return null;
				}
			};

			/*
			 * destroys all buttons
			 * If all buttons are destroyed all RadioButtons must be deleted
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.destroyButtons = function() {

				this.myChange = true;
				var aButtons = this.getButtons();
				for (var i = 0; i < aButtons.length; i++) {
					aButtons[i].detachEvent("_change", this._handleItemChanged, this);
				}
				this.destroyAggregation("buttons");
				this.myChange = undefined;

				if (!this._bUpdateButtons) {
					this.setSelectedIndex(undefined);
				}

				if (this.aRBs) {
					while (this.aRBs.length > 0) {
						this.aRBs[0].destroy();
						this.aRBs.splice(0, 1);
					}
				}

				return this;
			};

			RadioButtonGroup.prototype.updateButtons = function() {

				var iSelectedIndex = this.getSelectedIndex();

				this._bUpdateButtons = true;
				this.updateAggregation("buttons");
				this._bUpdateButtons = undefined;

				// if selectedIndex is still valid -> restore
				var aButtons = this.getButtons();
				if (aButtons.length > 0) {
					// if not defined -> select first one
					this.setSelectedIndex(0);
				}else if (iSelectedIndex >= 0 && aButtons.length == 0) {
					this.setSelectedIndex(-1);
				}else if (iSelectedIndex >= aButtons.length) {
					// if less items than before -> select last one
					this.setSelectedIndex(aButtons.length - 1);
				}
			};

			RadioButtonGroup.prototype.clone = function(){

				// on clone don't clone event handler
				var aButtons = this.getButtons();
				var i = 0;
				for (i = 0; i < aButtons.length; i++) {
					aButtons[i].detachEvent("_change", this._handleItemChanged, this);
				}

				var oClone = Control.prototype.clone.apply(this, arguments);

				for (i = 0; i < aButtons.length; i++) {
					aButtons[i].attachEvent("_change", this._handleItemChanged, this);
				}

				return oClone;
			};

			/*
			 * On SELECT event of single Radio Buttons fire Select Event for group
			 * @private
			 */
			RadioButtonGroup.prototype._handleRBSelect = function(oControlEvent) {

				// find RadioButton in Array to get Index
				for (var i = 0; i < this.aRBs.length; i++) {
					if (this.aRBs[i].getId() == oControlEvent.getParameter("id") && oControlEvent.getParameter("selected")) {
						this.setSelectedIndex(i);
						this._oItemNavigation.setSelectedIndex(i);
						this._oItemNavigation.setFocusedIndex(i);
						this.fireSelect({
							selectedIndex : i
						});
						break;
					}
				}
			};

			/*
			 * Set all RadioButtons to Editable/ReadOnly
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.setEditable = function(bEditable) {

				this.setProperty("editable", bEditable, false); // re-rendering to update ItemNavigation

				if (this.aRBs) {
					for (var i = 0; i < this.aRBs.length; i++) {
						this.aRBs[i].setEditable(bEditable);
					}
				}

				return this;
			};

			/*
			 * Set all RadioButtons to Enabled/Disabled
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.setEnabled = function(bEnabled) {

				this.setProperty("enabled", bEnabled, false); // re-rendering to update ItemNavigation

				if (this.aRBs) {
					var aButtons = this.getButtons();

					for (var i = 0; i < this.aRBs.length; i++) {
						if (bEnabled) {
							this.aRBs[i].setEnabled(aButtons[i].getEnabled());
						} else {
							this.aRBs[i].setEnabled(bEnabled);
						}
					}
				}

				return this;
			};

			/*
			 * Set ValueState for all RadioButtons
			 * @param {sap.ui.core.String} sValueState The value state of the radio group - none, success, warning, error
			 * @public
			 * @returns {sap.m.RadioButtonGroup} for chaining
			 */
			RadioButtonGroup.prototype.setValueState = function(sValueState) {

				this.setProperty("valueState", sValueState, false); // re-rendering to update ItemNavigation

				if (this.aRBs){
					for (var i = 0; i < this.aRBs.length; i++) {
						this.aRBs[i].setValueState(sValueState);
					}
				}

				return this;
			};

			/*
			 * Handles the event that gets fired by the {@link sap.ui.core.delegate.ItemNavigation} delegate.
			 * Ensures that focused element is selected
			 *
			 * @param {sap.ui.base.Event} oControlEvent The event that gets fired by the {@link sap.ui.core.delegate.ItemNavigation} delegate.
			 * @private
			 */
			RadioButtonGroup.prototype._handleAfterFocus = function(oControlEvent) {

				var iIndex = oControlEvent.getParameter("index");
				var oEvent = oControlEvent.getParameter("event");

				if (iIndex != this.getSelectedIndex() && !(oEvent.ctrlKey || oEvent.metaKey) && this.aRBs[iIndex].getEditable()
						&& this.aRBs[iIndex].getEnabled()) {
					// if CTRL key is used do not switch selection
					this.setSelectedIndex(iIndex);
					this._oItemNavigation.setSelectedIndex(iIndex);
					this.fireSelect({
						selectedIndex : iIndex
					});
				}
			};

			RadioButtonGroup.prototype._handleItemChanged = function(oEvent){

				var oButton = oEvent.oSource;
				var sProperty = oEvent.getParameter("name");
				var sNewValue = oEvent.getParameter("newValue");
				var aButtons = this.getButtons();
				var oRB;

				for (var i = 0; i < aButtons.length; i++) {
					if ( aButtons[i] == oButton) {
						if (this.aRBs[i]) {
							oRB = this.aRBs[i];
						}
						break;
					}
				}

				switch (sProperty) {
					case "enabled":
						if (this.getEnabled()) {
							oRB.setEnabled(sNewValue);
						}
						break;
					case "selected":
						oRB.setSelected(sNewValue);
						break;
					case "groupName":
						oRB.setGroupName(sNewValue);
						break;
					case "text":
						oRB.setText(sNewValue);
						break;
					case "textDirection":
						oRB.setTextDirection(sNewValue);
						break;
					case "width":
						oRB.setWidth(sNewValue);
						break;
					case "activeHandling":
						oRB.setActiveHandling(sNewValue);
						break;
					case "editable":
						oRB.setEditable(sNewValue);
						break;
					case "tooltip":
						oRB.setTooltip(sNewValue);
						break;
					case "valueState":
						oRB.setValueState(sNewValue);
						break;
					case "textAlign":
						oRB.setTextAlign(sNewValue);
						break;

					default:
						break;
				}

			};

			return RadioButtonGroup;

		}, /* bExport= */ true);

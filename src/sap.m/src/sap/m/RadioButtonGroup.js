/*!
 * ${copyright}
 */

// Provides control sap.m.RadioButtonGroup.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/library',
	'./RadioButtonGroupRenderer'
],
	function(
		jQuery,
		library,
		Control,
		ItemNavigation,
		coreLibrary,
		RadioButtonGroupRenderer
		) {
			"use strict";

			// shortcut for sap.ui.core.TextDirection
			var TextDirection = coreLibrary.TextDirection;

			// shortcut for sap.ui.core.ValueState
			var ValueState = coreLibrary.ValueState;

			/**
			 * Constructor for a new RadioButtonGroup.
			 *
			 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
			 * @param {object} [mSettings] Initial settings for the new control
			 * A wrapper control for a group of radio buttons.
			 * @class
			 * This control is used as a wrapper for a group of {@link sap.m.RadioButton} controls, which can be used as a single UI element.
			 * You can select only one of the grouped radio buttons at a time.
			 * <h3>Structure</h3>
			 * <ul>
			 * <li>The radio buttons are stored in the <code>buttons</code> aggregation.</li>
			 * <li>By setting the <code>columns</code> property, you can create layouts like a 'matrix', 'vertical' or 'horizontal'.</li>
			 * <li><b>Note:</b>For proper display on all devices, we recommend creating radio button groups with only one row or only one column.</li>
			 * </ul>
			 * <h3>Usage</h3>
			 * <h4>When to use:</h4>
			 * <ul>
			 * <li>You want to attach a single event handler on a group of buttons, rather than on each individual button.</li>
			 * </ul>
			 * <h4>When not to use:</h4>
			 * <ul>
			 * <li>Do not put two radio button groups right next to each other as it is difficult to determine which buttons belong to which group.</li>
			 * </ul>
			 * @extends sap.ui.core.Control
			 * @implements sap.ui.core.IFormContent
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

				interfaces : ["sap.ui.core.IFormContent"],
				library : "sap.m",
				designtime: "sap/m/designtime/RadioButtonGroup.designtime",
				properties : {

					/**
					 * Specifies the width of the RadioButtonGroup.
					 */
					width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

					/**
					 * Specifies the maximum number of radio buttons displayed in one line.
					 */
					columns : {type : "int", group : "Appearance", defaultValue : 1},

					/**
					 * Specifies whether the user can change the selected value of the RadioButtonGroup.
					 * When the property is set to false, the control obtains visual styles
					 * different from its visual styles for the normal and the disabled state.
					 * Additionally, the control is no longer interactive, but can receive focus.
					 */
					editable : {type : "boolean", group : "Behavior", defaultValue : true},

					/**
					 * The value state to be displayed for the radio button. Possible values are: sap.ui.core.ValueState.Error,
					 * sap.ui.core.ValueState.Warning, sap.ui.core.ValueState.Success and sap.ui.core.ValueState.None.
					 * Note: Setting this attribute to sap.ui.core.ValueState.Error when the accessibility feature is enabled,
					 * sets the value of the invalid property for the whole RadioButtonGroup to "true".
					 */
					valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : ValueState.None},

					/**
					 * Determines the index of the selected/checked RadioButton. Default is 0.
					 * If no radio button is selected, the selectedIndex property will return -1.
					 */
					selectedIndex : {type : "int", group : "Data", defaultValue : 0},

					/**
					 * Switches the enabled state of the control. All Radio Buttons inside a disabled group are disabled. Default value is "true".
					 */
					enabled : {type : "boolean", group : "Behavior", defaultValue : true},

					/**
					 * This property specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
					 * @since 1.28.0
					 */
					textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
				},
				defaultAggregation : "buttons",
				aggregations : {

					/**
					 * Returns a list of the RadioButtons in a RadioButtonGroup
					 */
					buttons : {type : "sap.m.RadioButton", multiple : true, singularName : "button", bindable : "bindable"}
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
				events : {

					/**
					 * Fires when selection is changed by user interaction.
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

			/**
			 * Exits the radio button group.
			 *
			 * @public
			 */
			RadioButtonGroup.prototype.exit = function() {

				this.destroyButtons();

				if (this._oItemNavigation) {
					this.removeDelegate(this._oItemNavigation);
					this._oItemNavigation.destroy();
					delete this._oItemNavigation;
				}
			};

			/**
			 * Overwrites the onBeforeRendering method.
			 *
			 * @public
			 */
			RadioButtonGroup.prototype.onBeforeRendering = function() {

				if (this.getSelectedIndex() > this.getButtons().length) {
					jQuery.sap.log.warning("Invalid index, set to 0");
					this.setSelectedIndex(0);
				}
			};

			/**
			 * Overwrites the onAfterRendering
			 *
			 * @public
			 */
			RadioButtonGroup.prototype.onAfterRendering = function() {

				this._initItemNavigation();

				// update ARIA information of RadioButtons with visible buttons only
				var aVisibleRBs;

				if (this.getVisible()) {
					aVisibleRBs = this.aRBs.filter(function(oButton) {
						return oButton.getVisible();
					});
				} else {
					aVisibleRBs = [];
				}

				for (var i = 0; i < aVisibleRBs.length; i++) {
					var oRBDomRef = aVisibleRBs[i].getDomRef();
					oRBDomRef.setAttribute("aria-posinset", i + 1);
					oRBDomRef.setAttribute("aria-setsize", aVisibleRBs.length);
				}
			};

			/**
			 * Initializes ItemNavigation, which is necessary for the keyboard handling of the group.
			 *
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
				this._oItemNavigation.setDisabledModifiers({
					sapnext : ["alt", "meta"],
					sapprevious : ["alt", "meta"]
				});
			};

			/**
			 * Sets the selected sap.m.RadioButton using index.
			 *
			 * @public
			 * @param {number} iSelectedIndex The index of the radio button which has to be selected.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */
			RadioButtonGroup.prototype.setSelectedIndex = function(iSelectedIndex) {

				var iIndexOld = this.getSelectedIndex();
				// if a radio button in the group is focused is true, otherwise - false
				var hasFocusedRadioButton = document.activeElement && document.activeElement.parentNode &&
					document.activeElement.parentNode.parentNode === this.getDomRef();
				// if radio button group has buttons and one of them is selected is true, otherwise - false
				var isRadioGroupSelected = !!(this.aRBs && this.aRBs[iSelectedIndex]);

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

				// if focus is in the group - focus the selected element
				if (isRadioGroupSelected && hasFocusedRadioButton) {
					this.aRBs[iSelectedIndex].getDomRef().focus();
				}

				return this;
			};

			/**
			 * Sets the selected sap.m.RadioButton using sap.m.RadioButton.
			 *
			 * @public
			 * @param {sap.m.RadioButton} oSelectedButton The item to be selected.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
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

			/**
			 * Returns the selected radio button.
			 *
			 * @public
			 * @returns {sap.m.RadioButton} The selected radio button.
			 */
			RadioButtonGroup.prototype.getSelectedButton = function() {
				return this.getButtons()[this.getSelectedIndex()];
			};

			/**
			 * Adds a new radio button to the group.
			 *
			 * @public
			 * @param {sap.m.RadioButton} oButton The button which will be added to the group.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */
			RadioButtonGroup.prototype.addButton = function(oButton) {
				if (!this._bUpdateButtons && this.getSelectedIndex() === undefined) {
					// if not defined -> select first one
					this.setSelectedIndex(0);
				}

				if (!this.aRBs) {
					this.aRBs = [];
				}

				var iIndex = this.aRBs.length;

				this.aRBs[iIndex] = this._createRadioButton(oButton, iIndex);

				this.addAggregation("buttons",  this.aRBs[iIndex]);
				return this;
			};

			/**
			 * Adds a new radio button to the group at a specified index.
			 *
			 * @public
			 * @param {sap.m.RadioButton} oButton The radio button which will be added to the group.
			 * @param {number} iIndex The index, at which the radio button will be added.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */
			RadioButtonGroup.prototype.insertButton = function(oButton, iIndex) {
				if (!this.aRBs) {
					this.aRBs = [];
				}

				var iLength = this.aRBs.length,
					iMaxLength = this.getButtons().length;

				iIndex = Math.max(Math.min(iIndex, iMaxLength), 0);

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

				this.insertAggregation("buttons", oButton, iIndex);

				return this;
			};

			/**
			 * Creates a copy of the sap.m.RadioButton passed as a first argument and
			 * adds it to the RadioButtonGroup at the index specified in the second argument.
			 *
			 * @private
			 * @param {sap.m.RadioButton} oButton The button from which a radio button will be created.
			 * @param {number} iIndex The index in the group at which the radio button will be placed.
			 * @returns {sap.m.RadioButton} The created radio button.
			 */
			RadioButtonGroup.prototype._createRadioButton = function(oButton, iIndex) {

				if (this.iIDCount == undefined) {
					this.iIDCount = 0;
				} else {
					this.iIDCount++;
				}

				oButton.setValueState(this.getValueState());
				oButton.setGroupName(this.getId());

				if (iIndex == this.getSelectedIndex()) {
					oButton.setSelected(true);
				}

				oButton.attachEvent("select", this._handleRBSelect, this);

				return oButton;
			};

			/**
			 * Removes a radio button from the group.
			 *
			 * @public
			 * @returns {sap.m.RadioButton} vElement The removed radio button.
			 */
			RadioButtonGroup.prototype.removeButton = function(vElement) {

				var iIndex = vElement;
				if (typeof (vElement) == "string") { // ID of the element is given
					vElement = sap.ui.getCore().byId(vElement);
				}
				if (typeof (vElement) == "object") { // the element itself is given or has just been retrieved
					iIndex = this.indexOfButton(vElement);
				}

				var oButton = this.removeAggregation("buttons", iIndex);

				if (!this.aRBs) {
					this.aRBs = [];
				}

				if (!this.aRBs[iIndex]) {
					// RadioButton not exists
					return null;
				}

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

			/**
			 * Removes all radio buttons.
			 *
			 * @public
			 * @returns {Array} Array of removed buttons or null.
			 */
			RadioButtonGroup.prototype.removeAllButtons = function () {
				if (!this._bUpdateButtons) {
					this.setSelectedIndex(-1);
				}

				return this.removeAllAggregation("buttons");
			};

			/**
			 * Destroys all radio buttons.
			 *
			 * @public
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */
			RadioButtonGroup.prototype.destroyButtons = function() {

				this.destroyAggregation("buttons");

				if (!this._bUpdateButtons) {
					this.setSelectedIndex(-1);
				}

				if (this.aRBs) {
					while (this.aRBs.length > 0) {
						this.aRBs[0].destroy();
						this.aRBs.splice(0, 1);
					}
				}

				return this;
			};

			/**
			 * Updates the buttons in the group.
			 *
			 * @public
			 */
			RadioButtonGroup.prototype.updateButtons = function() {
				this._bUpdateButtons = true;
				this.updateAggregation("buttons");
				this._bUpdateButtons = undefined;
			};

			/**
			 * Creates a new instance of RadioButtonGroup, with the same settings as the RadioButtonGroup
			 * on which the method is called.
			 * Event handlers are not cloned.
			 *
			 * @public
			 * @returns {sap.m.RadioButtonGroup} New instance of RadioButtonGroup
			 */
			RadioButtonGroup.prototype.clone = function(){

				// on clone don't clone event handler
				var aButtons = this.getButtons();
				var i = 0;
				for (i = 0; i < aButtons.length; i++) {
					aButtons[i].detachEvent("select", this._handleRBSelect, this);
				}

				var oClone = Control.prototype.clone.apply(this, arguments);

				for (i = 0; i < aButtons.length; i++) {
					aButtons[i].attachEvent("select", this._handleRBSelect, this);
				}

				return oClone;
			};

			/**
			 * Select event of single Radio Buttons fires Select Event for group.
			 *
			 * @private
			 * @param {sap.ui.base.Event} oControlEvent Control event.
			 */
			RadioButtonGroup.prototype._handleRBSelect = function(oControlEvent) {

				// find RadioButton in Array to get Index
				for (var i = 0; i < this.aRBs.length; i++) {
					if (this.aRBs[i].getId() == oControlEvent.getParameter("id") && oControlEvent.getParameter("selected")) {
						this.setSelectedIndex(i);
						this.fireSelect({
							selectedIndex : i
						});
						break;
					}
				}
			};

			/**
			 * Sets the editable property of the RadioButtonGroup. Single buttons preserve the value of their editable property.
			 * If the group is set to editable=false the buttons are also displayed and function as read only.
			 * Non editable radio buttons can still obtain focus.
			 *
			 * @name sap.m.RadioButtonGroup.prototype.setEditable
			 * @public
			 * @function
			 * @param {boolean} bEditable Defines whether the radio buttons should be interactive.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */

			/**
			 * Sets the enabled property of the RadioButtonGroup. Single buttons preserve internally the value of their enabled property.
			 * If the group is set to enabled=false the buttons are also displayed as disabled and getEnabled returns false.
			 *
			 * @name sap.m.RadioButtonGroup.prototype.setEnabled
			 * @public
			 * @function
			 * @param {boolean} bEnabled Defines whether the radio buttons should be interactive.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */

			/**
			 * Sets ValueState of all radio buttons in the group.
			 *
			 * @public
			 * @param {string} sValueState The value state of the radio group - none, success, warning, error.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
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

			/**
			 * Handles the event that gets fired by the {@link sap.ui.core.delegate.ItemNavigation} delegate.
			 * Ensures that focused element is selected.
			 *
			 * @private
			 * @param {sap.ui.base.Event} oControlEvent The event that gets fired by the {@link sap.ui.core.delegate.ItemNavigation} delegate.
			 * @returns {sap.m.RadioButtonGroup} Pointer to the control instance for chaining.
			 */
			RadioButtonGroup.prototype._handleAfterFocus = function(oControlEvent) {

				var iIndex = oControlEvent.getParameter("index");
				var oEvent = oControlEvent.getParameter("event");

				// handle only keyboard navigation here
				if (oEvent.keyCode === undefined) {
					return;
				}

				if (iIndex != this.getSelectedIndex()
					&& !(oEvent.ctrlKey || oEvent.metaKey)
					&& this.aRBs[iIndex].getEditable() && this.aRBs[iIndex].getEnabled()
					&& this.getEditable() && this.getEnabled()) {
					// if CTRL key is used do not switch selection
					this.setSelectedIndex(iIndex);
					this.fireSelect({
						selectedIndex : iIndex
					});
					this.aRBs[iIndex].fireSelect({ selected: true });
				}
			};

			return RadioButtonGroup;

		});

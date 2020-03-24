/*!
 * ${copyright}
 */

// Provides control sap.m.SegmentedButton.
sap.ui.define([
	'./library',
	'./Button',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/ListItem',
	'sap/ui/core/IconPool',
	'./SegmentedButtonRenderer'
],
function(
	library,
	Button,
	Control,
	EnabledPropagator,
	ItemNavigation,
	ResizeHandler,
	ListItem,
	IconPool,
	SegmentedButtonRenderer
	) {
	"use strict";



	/**
	 * Constructor for a new <code>SegmentedButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A horizontal control made of multiple buttons, which can display a title or an image.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>SegmentedButton</code> shows a group of buttons. When the user clicks or taps
	 * one of the buttons, it stays in a pressed state. It automatically resizes the buttons
	 * to fit proportionally within the control. When no width is set, the control uses the available width.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SegmentedButton
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/button/ Segmented Button}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SegmentedButton = Control.extend("sap.m.SegmentedButton", /** @lends sap.m.SegmentedButton.prototype */ { metadata : {

		interfaces : [
			"sap.ui.core.IFormContent",
			"sap.m.IOverflowToolbarContent"
		],
		library : "sap.m",
		designtime: "sap/m/designtime/SegmentedButton.designtime",
		publicMethods : ["createButton"],
		properties : {

			/**
			 * Defines the width of the SegmentedButton control. If not set, it uses the minimum required width to make all buttons inside of the same size (based on the biggest button).
			 *
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * Disables all the buttons in the SegmentedButton control. When disabled all the buttons look grey and you cannot focus or click on them.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Key of the selected item. If no item to this key is found in the items aggregation, no changes will apply. Only the items aggregation is affected. If duplicate keys exist, the first item matching the key is used.
			 * @since 1.28.0
			 */
			selectedKey: { type: "string", group: "Data", defaultValue: "", bindable: "bindable" }
		},
		defaultAggregation : "buttons",
		aggregations : {

			/**
			 * The buttons of the SegmentedButton control. The items set in this aggregation are used as an interface for the buttons displayed by the control. Only the properties ID, icon, text, enabled and textDirections of the Button control are evaluated. Setting other properties of the button will have no effect. Alternatively, you can use the createButton method to add buttons.
			 * @deprecated as of 1.28.0, replaced by <code>items</code> aggregation
			 */
			buttons : {type : "sap.m.Button", multiple : true, singularName : "button"},

			/**
			 * Aggregation of items to be displayed. The items set in this aggregation are used as an interface for the buttons displayed by the control.
			 * The "items" and "buttons" aggregations should NOT be used simultaneously as it causes the control to work incorrectly.
			 * @since 1.28
			 */
			items : { type : "sap.m.SegmentedButtonItem", multiple : true, singularName : "item", bindable : "bindable" },

			/**
			 * Hidden aggregation that holds an instance of sap.m.Select to be used in some contexts as a representation of the segmented button (for example, in a popover with little space).
			 */
			_select: { type : "sap.m.Select", multiple : false, visibility : "hidden"}
		},
		associations : {

			/**
			 * A reference to the currently selected button control. By default or if the association is set to false (null, undefined, "", false), the first button will be selected.
			 * If the association is set to an invalid value (for example, an ID of a button that does not exist) the selection on the SegmentedButton will be removed.
			 * @deprecated as of version 1.52, replaced by <code>selectedItem</code> association
			 */
			selectedButton : {deprecated: true, type : "sap.m.Button", multiple : false},

			/**
			 * A reference to the currently selected item control.
			 * @since 1.52
			 */
			selectedItem : {type : "sap.m.SegmentedButtonItem", multiple : false},

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
			 * Fires when the user selects a button, which returns the ID and button object.
			 * @deprecated as of version 1.52, replaced by <code>selectionChange</code> event
			 */
			select : {
				deprecated: true,
				parameters : {

					/**
					 * Reference to the button, that has been selected.
					 */
					button : {type : "sap.m.Button"},

					/**
					 * ID of the button, which has been selected.
					 */
					id : {type : "string"},

					/**
					 * Key of the button, which has been selected. This property is only filled when the control is initiated with the items aggregation.
					 * @since 1.28.0
					 */
					key : {type : "string"}
				}
			},
			/**
			 * Fires when the user selects an item, which returns the item object.
			 * @since 1.52
			 */
			selectionChange : {
				parameters : {
					/**
					 * Reference to the item, that has been selected.
					 */
					item : {type : "sap.m.SegmentedButtonItem"}
				}
			}
		},
		dnd: { draggable: true, droppable: false }
	}});


	EnabledPropagator.call(SegmentedButton.prototype);

	SegmentedButton.prototype.init = function () {
		// Used to store individual button widths
		this._aWidths = [];

		// Delegate keyboard processing to ItemNavigation, see commons.SegmentedButton
		this._oItemNavigation = new ItemNavigation();
		this._oItemNavigation.setCycling(false);
		//this way we do not hijack the browser back/forward navigation
		this._oItemNavigation.setDisabledModifiers({
			sapnext: ["alt"],
			sapprevious: ["alt"]
		});
		this.addDelegate(this._oItemNavigation);

		//Make sure when a button gets removed to reset the selected button
		this.removeButton = function (sButton) {
			var oRemovedButton = SegmentedButton.prototype.removeButton.call(this, sButton);
			this.setSelectedButton(this.getButtons()[0]);
			this._fireChangeEvent();
			return oRemovedButton;
		};
	};

	SegmentedButton.prototype.onBeforeRendering = function () {
		var aButtons = this._getVisibleButtons();

		this._bCustomButtonWidth = aButtons.some(function(oButton) {
			return oButton.getWidth();
		});

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		// Update the selectedKey because here we have all the aggregations loaded
		this.setSelectedKey(this.getProperty("selectedKey"));

		if (!this.getSelectedButton()) {
			this._selectDefaultButton();
		}
	};

	SegmentedButton.prototype.onAfterRendering = function () {
		var aButtons = this._getVisibleButtons(),
			oParentDom;

		//register resize listener on parent
		if (!this._sResizeListenerId) {
			oParentDom = this.getDomRef().parentNode;
			if (oParentDom) {
				this._sResizeListenerId = ResizeHandler.register(oParentDom,
					this._handleContainerResize.bind(this));
			}
		}

		// Keyboard
		this._setItemNavigation();

		// Calculate and apply widths
		this._aWidths = this._getRenderedButtonWidths(aButtons);
		this._updateWidth();
	};

	/**
	 * Method to handle container resize events and trigger needed reset/recalculation if needed.
	 * @private
	 */
	SegmentedButton.prototype._handleContainerResize = function () {
		var aButtons = this._getVisibleButtons();

		// Needed to provide correct width recalculation
		this._clearAutoWidthAppliedToControl();

		// Get new widths and apply to button
		this._aWidths = this._getRenderedButtonWidths(aButtons);
		this._updateWidth();
	};

	/**
	 * Clear width, previously calculated by the SegmentedButton and applied to the control
	 * @private
	 */
	SegmentedButton.prototype._clearAutoWidthAppliedToControl = function () {
		var aButtons = this._getVisibleButtons(),
			iButtonsLength = aButtons.length,
			oButton,
			i = 0;

		if (!this.getWidth()) {
			this.$().css("width", "");
		}
		while (i < iButtonsLength) {
			oButton = aButtons[i];
			if (!oButton.getWidth()) {
				oButton.$().css("width", "");
			}
			i++;
		}
	};

	/**
	 * Returns a new array with all rendered button widths.
	 * @param {array} aButtons with buttons
	 * @returns {array} The array of the widths
	 * @private
	 */
	SegmentedButton.prototype._getRenderedButtonWidths = function (aButtons) {
		return aButtons.map(function (oButton) {
			var oButtonDomRef = oButton.getDomRef();
			return oButtonDomRef && oButtonDomRef.getBoundingClientRect ? oButtonDomRef.getBoundingClientRect().width : oButton.$().outerWidth();
		});
	};

	/**
	 * Returns button width for button without pre-setted width depending on the other buttons in the control.
	 * @param {array} aButtons Array containing all visible buttons
	 * @returns {string|boolean} CSS Width or false
	 * @private
	 */
	SegmentedButton.prototype._getButtonWidth = function (aButtons) {
		var iButtons = aButtons.length,
			sWidth,
			iNoWidths = 0,
			iSumPercents = 0,
			iSumPixels = 0,
			iPercent,
			iPixels,
			i = 0;

		if (this._bCustomButtonWidth) {
			while (i < iButtons) {
				sWidth = aButtons[i].getWidth();
				if (sWidth) {
					if (sWidth.indexOf("%") !== -1) {
						// Width in Percent
						iSumPercents += parseInt(sWidth.slice(0, -1));
					} else {
						// Width in Pixels
						iSumPixels += parseInt(sWidth.slice(0, -2));
					}
				} else {
					iNoWidths++;
				}
				i++;
			}

			// If there are no buttons without width setted return
			if (iNoWidths === 0) {
				return false;
			}

			iPercent = (100 - iSumPercents) / iNoWidths;
			iPixels = (iSumPixels / iNoWidths);

			// Handle invalid negative numbers or other button occupying more than 100% of the width
			if (iPercent < 0) {
				iPercent = 0;
			}
			if (iPixels < 0) {
				iPixels = 0;
			}

			if (iPixels > 0) {
				return "calc(" + iPercent + "% - " + iPixels + "px)";
			} else {
				return iPercent + "%";
			}
		} else {
			return (100 / iButtons) + "%";
		}
	};

	/**
	 * Recalculates and updates the width of the control and the rendered buttons
	 * @private
	 */
	SegmentedButton.prototype._updateWidth = function () {
		// If this method is called before the dom is rendered or sapUiSegmentedButtonNoAutoWidth style class is applied
		// we skip width calculations
		if (this.$().length === 0 || this.hasStyleClass("sapMSegmentedButtonNoAutoWidth")) {
			return;
		}

		var sControlWidth = this.getWidth(),
			aButtons = this._getVisibleButtons(),
			iButtonsCount = aButtons.length,
			iMaxWidth = (this._aWidths.length > 0) ? Math.max.apply(Math, this._aWidths) : 0,
			iButtonWidthPercent = (100 / iButtonsCount),
			iParentWidth = this.$().parent().innerWidth(),
			sWidth = this._getButtonWidth(aButtons),
			iCurrentWidth,
			oButton,
			i;

		if (!sControlWidth) {
			// Modify whole control width if needed
			if ((iMaxWidth * iButtonsCount) > iParentWidth) {
				this.addStyleClass("sapMSegBFit");
			} else if (iMaxWidth > 0) {
				// Here we add 1px to compensate for the border which is taken within the calculation of max width
				this.$().width((iMaxWidth * iButtonsCount) + 1);
				this.removeStyleClass("sapMSegBFit");
			}
			// Modify button widths
			i = 0;
			while (i < iButtonsCount) {
				oButton = aButtons[i];
				oButton.$().css("width", oButton.getWidth() ? oButton.getWidth() : sWidth);
				i++;
			}
		} else if (sControlWidth && !this._bCustomButtonWidth) {
			// Modify button widths
			i = 0;
			while (i < iButtonsCount) {
				aButtons[i].$().css("width", iButtonWidthPercent + "%");
				i++;
			}
		}

		iCurrentWidth = this.$().width();

		if (this._previousWidth !== undefined && iCurrentWidth !== this._previousWidth && !this._bInOverflow) {
			this.fireEvent("_containerWidthChanged");
		}

		this._previousWidth = iCurrentWidth;
	};

	SegmentedButton.prototype.exit = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}
		this._bCustomButtonWidth = null;
		this._aWidths = null;
	};

	/**
	 * @private
	 */
	SegmentedButton.prototype._setItemNavigation = function () {
		var aButtons,
			oDomRef = this.getDomRef();

		if (oDomRef) {
			this._oItemNavigation.setRootDomRef(oDomRef);
			aButtons = this.$().find(".sapMSegBBtn:not(.sapMSegBBtnDis)");
			this._oItemNavigation.setItemDomRefs(aButtons);
			this._focusSelectedButton();
		}
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidation event which is fired when width of the control is changed.
	 *
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar
	 */
	SegmentedButton.prototype.getOverflowToolbarConfig = function() {
		return {
			canOverflow: true,
			listenForEvents: ["select"],
			autoCloseEvents: ["select"],
			noInvalidationProps: ["enabled", "selectedKey"],
			invalidationEvents: ["_containerWidthChanged"],
			onBeforeEnterOverflow: this._onBeforeEnterOverflow,
			onAfterExitOverflow: this._onAfterExitOverflow
		};
	};

	// SegmentedButton - switch to/from select mode
	SegmentedButton.prototype._onBeforeEnterOverflow = function(oControl) {
		oControl._toSelectMode();
	};

	SegmentedButton.prototype._onAfterExitOverflow = function(oControl) {
		oControl._toNormalMode();
	};

	/**
	* <code>SegmentedButton</code> must not be stretched in Form because ResizeHandler is used internally
	* in order to manage the width of the SegmentedButton depending on the container size
	* @protected
	* @returns {boolean} True this method always returns <code>true</code>
	*/
	SegmentedButton.prototype.getFormDoNotAdjustWidth = function () {
		return true;
	};

	/**
	 * Adds a Button with a text as title, a URI for an icon, enabled and textDirection.
	 * Only one is allowed.
	 *
	 * @param {string} sText
	 *         Defines the title text of the newly created Button
	 * @param {sap.ui.core.URI} sURI
	 *         Icon to be displayed as graphical element within the Button.
	 *         Density related image will be loaded if image with density awareness name in format [imageName]@[densityValue].[extension] is provided.
	 * @param {boolean} bEnabled
	 *         Enables the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings.
	 * @param {sap.ui.core.TextDirection} [sTextDirection]
	 *         Element's text directionality with enumerated options
	 *         @since 1.28.0
	 * @return {sap.m.Button} The created Button
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	SegmentedButton.prototype.createButton = function (sText, sURI, bEnabled, sTextDirection) {
		var oButton = new Button();

		if (sText !== null) {
			oButton.setText(sText);
		}
		if (sURI !== null) {
			oButton.setIcon(sURI);
		}
		if (bEnabled || bEnabled === undefined) {
			oButton.setEnabled(true);
		} else {
			oButton.setEnabled(false);
		}
		if (sTextDirection) {
			oButton.setTextDirection(sTextDirection);
		}
		this.addButton(oButton);

		return oButton;
	};

	(function (){
		SegmentedButton.prototype.addButton = function (oButton) {
			if (oButton) {
				processButton(oButton, this);
				this.addAggregation('buttons', oButton);
				this._syncSelect();
				this._fireChangeEvent();
			}
			return this;
		};

		SegmentedButton.prototype.insertButton = function (oButton, iIndex) {
			if (oButton) {
				processButton(oButton, this);
				this.insertAggregation('buttons', oButton, iIndex);
				this._syncSelect();
				this._fireChangeEvent();
			}
			return this;
		};

		function processButton(oButton, oParent){
			oButton.attachPress(function (oEvent) {
				oParent._buttonPressed(oEvent);
			});

			oButton.attachEvent("_change", oParent._syncSelect, oParent);
			oButton.attachEvent("_change", oParent._fireChangeEvent, oParent);

			var fnOriginalSetEnabled = Button.prototype.setEnabled;
			oButton.setEnabled = function (bEnabled) {
				oButton.$().toggleClass("sapMSegBBtnDis", !bEnabled)
					.toggleClass("sapMFocusable", bEnabled);

				fnOriginalSetEnabled.apply(oButton, arguments);
			};

			oButton.setVisible = function (bVisible) {
				Button.prototype.setVisible.apply(this, arguments);
				oParent.invalidate();
			};
		}

	})();

	/**
	 * Gets the <code>selectedKey</code> and is usable only when the control is initiated with the <code>items</code> aggregation.
	 *
	 * @return {string} Current selected key
	 * @public
	 * @override
	 * @since 1.28
	 */
	SegmentedButton.prototype.getSelectedKey = function() {
		var aButtons = this.getButtons(),
			aItems = this.getItems(),
			sSelectedButtonId = this.getSelectedButton(),
			i = 0;

		if (aItems.length > 0) {
			for (; i < aButtons.length; i++) {
				if (aButtons[i] && aButtons[i].getId() === sSelectedButtonId) {
					this.setProperty("selectedKey", aItems[i].getKey(), true);
					return aItems[i].getKey();
				}
			}
		}
		return "";
	};

	/**
	 * Sets the <code>selectedKey</code> and is usable only when the control is initiated with the <code>items</code> aggregation.
	 *
	 * @param {string} sKey The key of the button to be selected
	 * @returns {sap.m.SegmentedButton} <code>this</code> pointer for chaining
	 * @public
	 * @override
	 * @since 1.28
	 */
	SegmentedButton.prototype.setSelectedKey = function(sKey) {
		var aButtons = this.getButtons(),
			aItems = this.getItems(),
			i = 0;

		// If sKey is empty, undefined or falsy we don't select nothing
		if (!sKey) {
			this.setProperty("selectedKey", sKey, true);
			return this;
		}

		if (aItems.length > 0 && aButtons.length > 0) {
			for (; i < aItems.length; i++) {
				if (aItems[i] && aItems[i].getKey() === sKey) {
					this.setSelectedItem(aItems[i]);
					break;
				}
			}
		}
		this.setProperty("selectedKey", sKey, true);
		return this;
	};

	SegmentedButton.prototype.removeButton = function (oButton) {
		var oRemovedButton = this.removeAggregation("buttons", oButton);
		if (oRemovedButton) {
			delete oRemovedButton.setEnabled;
			oRemovedButton.detachEvent("_change", this._syncSelect, this);
			oRemovedButton.detachEvent("_change", this._fireChangeEvent, this);
			this._syncSelect();
		}

		return oRemovedButton;
	};

	SegmentedButton.prototype.removeAllButtons = function () {
		var aButtons = this.getButtons();
		if (aButtons) {
			for ( var i = 0; i < aButtons.length; i++) {
				var oButton = aButtons[i];
				if (oButton) {
					delete oButton.setEnabled;
					this.removeAggregation("buttons", oButton);
					oButton.detachEvent("_change", this._syncSelect, this);
					oButton.detachEvent("_change", this._fireChangeEvent, this);
				}

			}
			this._syncSelect();
		}

		return aButtons;
	};

	/**
	 * Adds item to <code>items</code> aggregation.
	 * @param {sap.m.SegmentedButtonItem} oItem The item to be added
	 * @returns {sap.m.SegmentedButton} <code>this</code> pointer for chaining
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.addItem = function (oItem) {
		this.addAggregation("items", oItem);
		this.addButton(oItem.oButton);
		return this;
	};

	/**
	 * Removes an item from <code>items</code> aggregation.
	 * @param {sap.m.SegmentedButtonItem} oItem The item to be removed
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.removeItem = function (oItem) {
		var oRemovedItem;
		if (oItem !== null && oItem !== undefined) {
			oRemovedItem = this.removeAggregation("items", oItem);
			this.removeButton(oItem.oButton);//since this fires a "_change" event, it must be placed after public items are removed
		}
		// Reset selected button if the removed button is the currently selected one
		if (oItem && oItem instanceof sap.m.SegmentedButtonItem && this.getSelectedButton() === oItem.oButton.getId()) {
			this.setSelectedKey("");
			this.setSelectedButton("");
			this.setSelectedItem("");
		}

		this.setSelectedItem(this.getItems()[0]);

		return oRemovedItem;
	};

	/**
	 * Inserts item into <code>items</code> aggregation.
	 * @param {sap.m.SegmentedButtonItem} oItem The item to be inserted
	 * @param {int} iIndex index the item should be inserted at
	 * @returns {sap.m.SegmentedButton} <code>this</code> pointer for chaining
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.insertItem = function (oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex);
		this.insertButton(oItem.oButton, iIndex);
		return this;
	};

	/**
	 * Removes all items from <code>items</code> aggregation
	 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code> the control invalidation will be suppressed
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.removeAllItems = function (bSuppressInvalidate) {
		var oRemovedItems = this.removeAllAggregation("items", bSuppressInvalidate);
		this.removeAllButtons();

		// Reset selectedKey, selectedButton and selectedItem
		this.setSelectedKey("");
		this.setSelectedButton("");
		this.setSelectedItem("");

		return oRemovedItems;
	};

	/** Event handler for the internal button press events.
	 * @param {Object} oEvent The event to be fired
	 * @private
	 */
	SegmentedButton.prototype._buttonPressed = function (oEvent) {
		var oButtonPressed = oEvent.getSource(),
			oItemPressed;

		if (this.getSelectedButton() !== oButtonPressed.getId()) {
			// CSN# 0001429454/2014: remove class for all other items
			this.getButtons().forEach(function (oButton) {
				oButton.$().removeClass("sapMSegBBtnSel");
				oButton.$().attr("aria-checked", false);
			});

			//get the corresponding item regarding the pressed button
			oItemPressed = this.getItems().filter(function (oItem) {
				return oItem.oButton === oButtonPressed;
			})[0];

			oButtonPressed.$().addClass("sapMSegBBtnSel");
			oButtonPressed.$().attr("aria-checked", true);

			this.setAssociation('selectedButton', oButtonPressed, true);
			this.setProperty("selectedKey", this.getSelectedKey(), true);

			this.setAssociation('selectedItem', oItemPressed, true);
			this.fireSelectionChange({
				item: oItemPressed
			});

			// support old API
			this.fireSelect({
				button: oButtonPressed,
				id: oButtonPressed.getId(),
				key: this.getSelectedKey()
			});
		}
	};

	/**
	 * Internal helper function that sets the association <code>selectedButton</code> to the first button.
	 * @private
	 */
	SegmentedButton.prototype._selectDefaultButton = function () {
		var aButtons = this._getVisibleButtons();

		// CSN# 0001429454/2014: when the id evaluates to false (null, undefined, "") the first button should be selected
		if (aButtons.length > 0) {
			this.setAssociation('selectedButton', aButtons[0], true);

			if (this.getItems().length > 0) {
				this.setAssociation('selectedItem', this.getItems()[0], true);
			}
		}
	};

	/**
	 * Setter for association <code>selectedButton</code>.
	 *
	 * @param {string | sap.m.Button | null | undefined} vButton New value for association <code>setSelectedButton</code>
	 *    An sap.m.Button instance which becomes the new target of this <code>selectedButton</code> association.
	 *    Alternatively, the ID of an sap.m.Button instance may be given as a string.
	 *    If the value of null, undefined, or an empty string is provided the first item will be selected.
	 * @returns {sap.m.SegmentedButton} <code>this</code> pointer for chaining
	 * @public
	 */
	SegmentedButton.prototype.setSelectedButton = function (vButton) {
		var sSelectedButtonBefore = this.getSelectedButton(),
			aButtons = this.getButtons();

		// set the new value
		this.setAssociation("selectedButton", vButton);

		if (sSelectedButtonBefore !== this.getSelectedButton()) {
			if (!this.getSelectedButton() && aButtons.length > 1) {
				this._selectDefaultButton();
			}
			this._focusSelectedButton();
		}

		this._syncSelect();
		return this;
	};

	/**
	 * Setter for association <code>selectedItem</code>.
	 *
	 * @param {string | sap.m.SegmentedButtonItem | null | undefined} vItem New value for association <code>setSelectedItem</code>
	 *    An sap.m.SegmentedButtonItem instance which becomes the new target of this <code>selectedItem</code> association.
	 *    Alternatively, the ID of an <code>sap.m.SegmentedButtonItem</code> instance may be given as a string.
	 *    If the value of null, undefined, or an empty string is provided, the first item will be selected.
	 * @returns {sap.m.SegmentedButton} <code>this</code> pointer for chaining
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.setSelectedItem = function (vItem) {
		var oItem = typeof vItem === "string" && vItem !== "" ? sap.ui.getCore().byId(vItem) : vItem,
			oItemInstanceOfSegBtnItem = oItem instanceof sap.m.SegmentedButtonItem,
			vButton = oItemInstanceOfSegBtnItem ? oItem.oButton : vItem;

		// set the new value
		this.setAssociation("selectedItem", vItem, true);
		this.setSelectedButton(vButton);

		return this;
	};

	SegmentedButton.prototype._focusSelectedButton = function () {
		var aButtons = this.getButtons(),
			selectedButtonId = this.getSelectedButton(),
			i = 0;

		for (; i < aButtons.length; i++) {
			if (aButtons[i] && aButtons[i].getId() === selectedButtonId) {
				this._oItemNavigation && this._oItemNavigation.setFocusedIndex(i);
				break;
			}
		}
	};

	SegmentedButton.prototype.onsappagedown = function(oEvent) {
		this._oItemNavigation.onsapend(oEvent);
	};

	SegmentedButton.prototype.onsappageup = function(oEvent) {
		this._oItemNavigation.onsaphome(oEvent);
	};

	SegmentedButton.prototype.onsapspace = function (oEvent) {
		oEvent.preventDefault();
	};

	/** Select form function **/

	/**
	 * Lazy loader for the select hidden aggregation.
	 * @private
	 */
	SegmentedButton.prototype._lazyLoadSelectForm = function() {
		var oSelect = this.getAggregation("_select");

		if (!oSelect) {
			// lazy load sap.m.Select, TODO should be loaded async
			jQuery.sap.require("sap.m.Select");
			var Select = sap.ui.require("sap/m/Select");
			oSelect = new Select(this.getId() + "-select");
			oSelect.attachChange(this._selectChangeHandler, this);
			oSelect.addStyleClass("sapMSegBSelectWrapper");
			this.setAggregation("_select", oSelect, true);
		}
	};

	/**
	 * Called when the select is changed so that the SegmentedButton internals stay in sync.
	 * @param {Object} oEvent The event fired
	 * @private
	 */
	SegmentedButton.prototype._selectChangeHandler = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem"),
			sNewKey = parseInt(oSelectedItem.getKey()),
			oButton = this.getButtons()[sNewKey],
			sButtonId = oButton.getId();

		oButton.firePress();
		this.setSelectedButton(sButtonId);
	};

	SegmentedButton.prototype._fireChangeEvent = function () {
		this.fireEvent("_change");
	};

	/**
	 * Builds/rebuilds the select from the buttons in the SegmentedButton.
	 * @private
	 */
	SegmentedButton.prototype._syncSelect = function() {
		var iKey = 0,
			iSelectedKey = 0,
			sButtonText,
			sButtonIcon,
			oSelect = this.getAggregation("_select");


		if (!oSelect) {
			return;
		}

		oSelect.destroyItems();
		this._getVisibleButtons().forEach(function (oButton) {
			sButtonText = oButton.getText();
			sButtonIcon = oButton.getIcon();
			oSelect.addItem(new ListItem({
				key: iKey.toString(),
				icon: sButtonIcon ? sButtonIcon : "",
				text: sButtonText ? sButtonText : oButton.getTooltip_AsString(),
				enabled: oButton.getEnabled()
			}));
			if (oButton.getId() === this.getSelectedButton()) {
				iSelectedKey = iKey;
			}
			iKey++;
		}, this);
		oSelect.setSelectedKey(iSelectedKey.toString());
	};

	/**
	 * To be called to make the control go to select mode.
	 * @private
	 */
	SegmentedButton.prototype._toSelectMode = function() {
		this._bInOverflow = true;
		this.addStyleClass("sapMSegBSelectWrapper");
		this._lazyLoadSelectForm();
		this._syncSelect();
		this._syncAriaAssociations();
	};

	/**
	 * To be called to make the control go back to the default mode.
	 * @private
	 */
	SegmentedButton.prototype._toNormalMode = function() {
		delete this._bInOverflow;
		this.removeStyleClass("sapMSegBSelectWrapper");
	};

	SegmentedButton.prototype._syncAriaAssociations = function () {
		var oSelect = this.getAggregation("_select");
		this.getAriaLabelledBy().forEach(function (oLabel) {
			if (oSelect.getAriaLabelledBy().indexOf(oLabel) === -1) {
				oSelect.addAriaLabelledBy(oLabel);
			}
		});

		// sap.m.Select doesn't have an ariaDescribedBy association, so we copy
		// the ariaDescribedBy association elements from the sap.m.SegmentedButton instance
		// into the ariaLabelledBy association in the sap.m.Select instance
		this.getAriaDescribedBy().forEach(function (oDesc) {
			if (oSelect.getAriaLabelledBy().indexOf(oDesc) === -1) {
				oSelect.addAriaLabelledBy(oDesc);
			}
		});
	};

	/**
	 * Image does not have an onload event but we need to recalculate the button sizes - after the image is loaded
	 * we override the onload method once and call the calculation method after the original method is called.
	 * @param {sap.m.Image} oImage instance of the image
	 * @private
	 */
	SegmentedButton.prototype._overwriteImageOnload = function (oImage) {
		var that = this;

		if (oImage.onload === sap.m.Image.prototype.onload) {
			oImage.onload = function () {
				if (sap.m.Image.prototype.onload) {
					sap.m.Image.prototype.onload.apply(this, arguments);
				}
				window.setTimeout(function() {
					that._updateWidth();
				}, 20);
			};
		}
	};

	/**
	 * Gets native SAP icon name.
	 * @param {sap.ui.core.Icon} oIcon Icon object
	 * @returns {string} The generic name of the icon
	 * @private
	 */
	SegmentedButton.prototype._getIconAriaLabel = function (oIcon) {
		var oIconInfo = IconPool.getIconInfo(oIcon.getSrc()),
			sResult = "";
		if (oIconInfo && oIconInfo.name) {
			sResult = oIconInfo.name;
		}
		return sResult;
	};

	/**
	 * Gets the visible buttons.
	 * @returns {*} Array of the visible buttons
	 * @private
	 */
	SegmentedButton.prototype._getVisibleButtons = function() {
		return this.getButtons().filter(function(oButton) {
			return oButton.getVisible();
		});
	};

	SegmentedButton.prototype.clone = function () {
		var sSelectedButtonId = this.getSelectedButton(),
			aButtons = this.removeAllAggregation("buttons"),
			oClone = Control.prototype.clone.apply(this, arguments),
			iSelectedButtonIndex = aButtons.map(function(b) {
				return b.getId();
			}).indexOf(sSelectedButtonId),
			i;

		if (iSelectedButtonIndex > -1) {
			oClone.setSelectedButton(oClone.getButtons()[iSelectedButtonIndex]);
		}

		for (i = 0; i < aButtons.length; i++) {
			this.addAggregation("buttons", aButtons[i]);
		}

		return oClone;
	};

	return SegmentedButton;

});

/*!
 * ${copyright}
 */

// Provides control sap.m.SegmentedButton.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/ResizeHandler'],
	function(jQuery, library, Control, EnabledPropagator, ItemNavigation, ResizeHandler) {
	"use strict";



	/**
	 * Constructor for a new SegmentedButton.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * SegmentedButton is a horizontal control made of multiple buttons, which can display a title or an image. It automatically resizes the buttons to fit proportionally within the control. When no width is set, the control uses the available width.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SegmentedButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SegmentedButton = Control.extend("sap.m.SegmentedButton", /** @lends sap.m.SegmentedButton.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
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
			 * @deprecated Since 1.28.0 Instead use the "items" aggregation.
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
			 */
			selectedButton : {type : "sap.m.Button", multiple : false},

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
			 */
			select : {
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
			}
		}
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
			SegmentedButton.prototype.removeButton.call(this, sButton);
			this.setSelectedButton(this.getButtons()[0]);
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
	 * @returns {array}
	 * @private
	 */
	SegmentedButton.prototype._getRenderedButtonWidths = function (aButtons) {
		return aButtons.map(function (oButton) {
			return oButton.$().outerWidth();
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
						iSumPercents += parseInt(sWidth.slice(0, -1), 10);
					} else {
						// Width in Pixels
						iSumPixels += parseInt(sWidth.slice(0, -2), 10);
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
			oButton,
			i;

		if (!sControlWidth) {
			// Modify whole control width if needed
			if ((iMaxWidth * iButtonsCount) > iParentWidth) {
				this.$().css("width", "100%");
			} else if (iMaxWidth > 0) {
				// Here we add 1px to compensate for the border which is taken within the calculation of max width
				this.$().width((iMaxWidth * iButtonsCount) + 1);
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
		var oButton = new sap.m.Button();

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
				return this;
			}
		};

		SegmentedButton.prototype.insertButton = function (oButton, iIndex) {
			if (oButton) {
				processButton(oButton, this);
				this.insertAggregation('buttons', oButton, iIndex);
				this._syncSelect();
				return this;
			}
		};

		function processButton(oButton, oParent){
			oButton.attachPress(function (oEvent) {
				oParent._buttonPressed(oEvent);
			});

			oButton.attachEvent("_change", oParent._syncSelect, oParent);
			oButton.attachEvent("_change", oParent._forwardChangeEvent, oParent);

			var fnOriginalSetEnabled = sap.m.Button.prototype.setEnabled;
			oButton.setEnabled = function (bEnabled) {
				oButton.$().toggleClass("sapMSegBBtnDis", !bEnabled)
					.toggleClass("sapMFocusable", bEnabled);

				fnOriginalSetEnabled.apply(oButton, arguments);
			};

			oButton.setVisible = function (bVisible) {
				sap.m.Button.prototype.setVisible.apply(this, arguments);
				oParent.invalidate();
			};
		}

	})();

	/**
	 * Gets the selectedKey and is usable only when the control is initiated with the items aggregation.
	 *
	 * @return {string} Current selected key
	 * @override
	 * @since 1.28.0
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
	 * Sets the selectedKey and is usable only when the control is initiated with the items aggregation.
	 *
	 * @param {string} sKey The key of the button to be selected
	 * @returns {sap.m.SegmentedButton} <code>this</code> this pointer for chaining
	 * @override
	 * @since 1.28.0
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
					this.setSelectedButton(aButtons[i]);
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
			oRemovedButton.detachEvent("_change", this._forwardChangeEvent, this);
			this._syncSelect();
		}
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
					oButton.detachEvent("_change", this._forwardChangeEvent, this);
				}

			}
			this._syncSelect();
		}
	};

	/**
	 * Adds item to <code>items</code> aggregation
	 * @param {sap.m.SegmentedButtonItem} oItem
	 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code> the control invalidation will be suppressed
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.addItem = function (oItem, bSuppressInvalidate) {
		this.addAggregation("items", oItem, bSuppressInvalidate);
		this.addButton(oItem.oButton);
	};

	/**
	 * Removes an item from <code>items</code> aggregation
	 * @param {sap.m.SegmentedButtonItem} oItem
	 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code> the control invalidation will be suppressed
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.removeItem = function (oItem, bSuppressInvalidate) {
		this.removeAggregation("buttons", oItem.oButton, true);
		this.removeAggregation("items", oItem, bSuppressInvalidate);
		// Reset selected button if the removed button is the currently selected one
		if (oItem && oItem instanceof sap.m.SegmentedButtonItem &&
			this.getSelectedButton() === oItem.oButton.getId()) {
			this.setSelectedKey("");
			this.setSelectedButton("");
		}
	};

	/**
	 * Inserts item into <code>items</code> aggregation
	 * @param {sap.m.SegmentedButtonItem} oItem
	 * @param {int} iIndex index the item should be inserted at
	 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code> the control invalidation will be suppressed
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.insertItem = function (oItem, iIndex, bSuppressInvalidate) {
		this.insertAggregation("items", oItem, iIndex, bSuppressInvalidate);
		this.insertButton(oItem.oButton, iIndex);
	};

	/**
	 * Removes all items from <code>items</code> aggregation
	 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code> the control invalidation will be suppressed
	 * @public
	 * @override
	 */
	SegmentedButton.prototype.removeAllItems = function (bSuppressInvalidate) {
		this.removeAllAggregation("items", bSuppressInvalidate);
		this.removeAllButtons();

		// Reset selectedKey and selectedButton
		this.setSelectedKey("");
		this.setSelectedButton("");
	};

	/** Event handler for the internal button press events.
	 * @private
	 */
	SegmentedButton.prototype._buttonPressed = function (oEvent) {
		var oButtonPressed = oEvent.getSource();

		if (this.getSelectedButton() !== oButtonPressed.getId()) {
			// CSN# 0001429454/2014: remove class for all other items
			this.getButtons().forEach(function (oButton) {
				oButton.$().removeClass("sapMSegBBtnSel");
				oButton.$().attr("aria-checked", false);
			});
			oButtonPressed.$().addClass("sapMSegBBtnSel");
			oButtonPressed.$().attr("aria-checked", true);

			this.setAssociation('selectedButton', oButtonPressed, true);
			this.setProperty("selectedKey", this.getSelectedKey(), true);
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
		}
	};

	/**
	 * Setter for association <code>selectedButton</code>.
	 *
	 * @param {string | sap.m.Button | null | undefined} vButton New value for association <code>setSelectedButton</code>
	 *    An sap.m.Button instance which becomes the new target of this <code>selectedButton</code> association.
	 *    Alternatively, the ID of an sap.m.Button instance may be given as a string.
	 *    If the value of null, undefined, or an empty string is provided the first item will be selected.
	 * @returns {sap.m.SegmentedButton} <code>this</code> this pointer for chaining
	 * @public
	 */
	SegmentedButton.prototype.setSelectedButton = function (vButton) {
		var sSelectedButtonBefore = this.getSelectedButton(),
			oSelectedButton,
			aButtons = this.getButtons();

		// set the new value
		this.setAssociation("selectedButton", vButton, true);

		// CSN# 1143859/2014: update selection state in DOM when calling API method to change the selection
		if (sSelectedButtonBefore !== this.getSelectedButton()) {
			// CSN# 0001429454/2014: only update DOM when control is already rendered (otherwise it will be done in onBeforeRendering)
			if (this.$().length) {
				// Select default button if there is no selected button and if there is more than one button available
				if (!this.getSelectedButton() && aButtons.length > 1) {
					this._selectDefaultButton();
				}
				oSelectedButton = sap.ui.getCore().byId(this.getSelectedButton());
				aButtons.forEach(function (oButton) {
					oButton.$().removeClass("sapMSegBBtnSel");
					oButton.$().attr("aria-checked", false);
				});
				if (oSelectedButton) {
					oSelectedButton.$().addClass("sapMSegBBtnSel");
					oSelectedButton.$().attr("aria-checked", true);
				}
				this._focusSelectedButton();
			}
		}

		this._syncSelect();
		return this;
	};

	SegmentedButton.prototype._focusSelectedButton = function () {
		var aButtons = this.getButtons(),
			selectedButtonId = this.getSelectedButton(),
			i = 0;

		for (; i < aButtons.length; i++) {
			if (aButtons[i] && aButtons[i].getId() === selectedButtonId) {
				this._oItemNavigation.setFocusedIndex(i);
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




	/** Select form function **/

	/**
	 * Lazy loader for the select hidden aggregation.
	 * @private
	 */
	SegmentedButton.prototype._lazyLoadSelectForm = function() {
		var oSelect = this.getAggregation("_select");

		if (!oSelect) {
			oSelect = new sap.m.Select(this.getId() + "-select");
			oSelect.attachChange(this._selectChangeHandler, this);
			oSelect.addStyleClass("sapMSegBSelectWrapper");
			this.setAggregation("_select", oSelect, true);
		}
	};

	/**
	 * Called when the select is changed so that the SegmentedButton internals stay in sync.
	 * @param oEvent
	 * @private
	 */
	SegmentedButton.prototype._selectChangeHandler = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem"),
			sNewKey = parseInt(oSelectedItem.getKey(), 10),
			oButton = this.getButtons()[sNewKey],
			sButtonId = oButton.getId();

		oButton.firePress();
		this.setSelectedButton(sButtonId);
	};

	SegmentedButton.prototype._forwardChangeEvent = function () {
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
			oSelect = this.getAggregation("_select");


		if (!oSelect) {
			return;
		}

		oSelect.destroyItems();
		this._getVisibleButtons().forEach(function (oButton) {
			sButtonText = oButton.getText();
			oSelect.addItem(new sap.ui.core.Item({
				key: iKey.toString(),
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
	};

	/**
	 * To be called to make the control go back to the default mode.
	 * @private
	 */
	SegmentedButton.prototype._toNormalMode = function() {
		delete this._bInOverflow;
		this.removeStyleClass("sapMSegBSelectWrapper");
		this.getAggregation("_select").removeAllItems();
		this.destroyAggregation("_select");
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
		var oIconInfo = sap.ui.core.IconPool.getIconInfo(oIcon.getSrc()),
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

}, /* bExport= */ true);

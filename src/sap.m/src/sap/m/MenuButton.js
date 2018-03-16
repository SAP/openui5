/*!
 * ${copyright}
 */

// Provides control sap.m.MenuButton.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'./Button',
	'./SplitButton',
	'sap/ui/Device',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/library',
	"./MenuButtonRenderer"
], function(
	jQuery,
	library,
	Control,
	Button,
	SplitButton,
	Device,
	EnabledPropagator,
	coreLibrary,
	MenuButtonRenderer
	) {
		"use strict";

		// shortcut for sap.m.MenuButtonMode
		var MenuButtonMode = library.MenuButtonMode;

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		/**
		 * Constructor for a new MenuButton.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>sap.m.MenuButton</code> control enables the user to show a hierarchical menu.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.MenuButton
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/menu-button/ Menu Button}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MenuButton = Control.extend("sap.m.MenuButton", /** @lends sap.m.MenuButton.prototype */ { metadata : {
			library : "sap.m",
			properties : {
				/**
				 * Defines the text of the <code>MenuButton</code>.
				 * <br/><b>Note:</b> In <code>Split</code> <code>buttonMode</code> with <code>useDefaultActionOnly</code>
				 * set to <code>false</code>, the text is changed to display the last selected item's text,
				 * while in <code>Regular</code> <code>buttonMode</code> the text stays unchanged.
				 */
				text : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the type of the <code>MenuButton</code> (for example, Default, Accept, Reject, Back, etc.)
				 */
				type : {type : "sap.m.ButtonType", group : "Appearance", defaultValue : ButtonType.Default},

				/**
				 * Defines the width of the <code>MenuButton</code>.
				 * <br/><b>Note:</b>As per visual design this width can be maximum of 12rem (192px).
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

				/**
				 * Boolean property to enable the control (default is <code>true</code>).
				 * <br/><b>Note:</b> Depending on custom settings, the buttons that are disabled have other colors than the enabled ones.
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Defines the icon to be displayed as a graphical element within the button.
				 * It can be an image or an icon from the icon font.
				 */
				icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

				/**
				 * The source property of an alternative icon for the active (pressed) state of the button.
				 * Both active and default icon properties should be defined and of the same type - image or icon font.
				 * If the <code>icon</code> property is not set or has a different type, the active icon is not displayed.
				 */
				activeIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

				/**
				 * When set to <code>true</code> (default), one or more requests are sent trying to get the
				 * density perfect version of image if this version of image doesn't exist on the server.
				 * If only one version of image is provided, set this value to <code>false</code> to
				 * avoid the attempt of fetching density perfect image.
				 */
				iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},

				/**
				 * Specifies the element's text directionality with enumerated options.
				 * By default, the control inherits text direction from the DOM.
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Defines whether the <code>MenuButton</code> is set to <code>Regular</code> or <code>Split</code> mode.
				 */
				buttonMode : { type : "sap.m.MenuButtonMode", group : "Misc", defaultValue : MenuButtonMode.Regular },

				/**
				 * Controls whether the default action handler is invoked always or it is invoked only until a menu item is selected.
				 * Usable only if <code>buttonMode</code> is set to <code>Split</code>.
				 */
				useDefaultActionOnly : { type : "boolean", group : "Behavior", defaultValue: false }
			},
			aggregations: {
				/**
				 * Defines the menu that opens for this button.
				 */
				menu: { type: "sap.m.Menu", multiple: false, singularName: "menu" },

				/**
				 * Internal aggregation that contains the button part.
				 */
				_button: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
			},
			events: {
				/**
				 * Fired when the <code>buttonMode</code> is set to <code>Split</code> and the user presses the main button
				 * unless <code>useDefaultActionOnly</code> is set to <code>false</code> and another action
				 * from the menu has been selected previously.
				 */
				defaultAction: {}
			},
			defaultAggregation : "menu",
			designtime: "sap/m/designtime/MenuButton.designtime"
		}});

		EnabledPropagator.call(MenuButton.prototype);

		/**
		 * Initializes the control.
		 * @public
		 */
		MenuButton.prototype.init = function() {
			this._initButtonControl();
		};

		/**
		 * Called from parent if the control is destroyed.
		 * @private
		 */
		MenuButton.prototype.exit = function() {
			if (this._sDefaultText) {
				this._sDefaultText = null;
			}
			if (this._sDefaultIcon) {
				this._sDefaultIcon = null;
			}
			if (this._iInitialWidth) {
				this._iInitialWidth = null;
			}
			if (this._lastActionItemId) {
				this._lastActionItemId = null;
			}

			if (this.getMenu()) {
				this.getMenu().detachClosed(this._menuClosed, this);
			}
		};

		MenuButton.prototype.onBeforeRendering = function() {
			if (!this._sDefaultText) {
				this._sDefaultText = this.getText();
			}
			if (!this._sDefaultIcon) {
				this._sDefaultIcon = this.getIcon();
			}

			this._updateButtonControl();
			this._attachMenuEvents();

		};

		MenuButton.prototype.onAfterRendering = function() {
			// call the function with delay to assure that the
			// inner buttons are rendered with correct width before setting the initial width
			jQuery.sap.delayedCall(0, this, "_setInitialBtnWidth");

			this._setAriaHasPopup();
		};


		/**
		 * Sets the initial width of the control.
		 * @private
		 */
		MenuButton.prototype._setInitialBtnWidth = function() {
			var iInitialWidth;
			if (this._isSplitButton() && !this._iInitialWidth) {
				iInitialWidth = this.$().outerWidth();
				if (iInitialWidth) {
					this._iInitialWidth = iInitialWidth + 1; //for IE
				}
			}
		};

		MenuButton.prototype._setAriaHasPopup = function() {
			if (this._isSplitButton()) {
				this._getButtonControl()._getArrowButton().$().attr("aria-haspopup", "true");
			} else {
				this._getButtonControl().$().attr("aria-haspopup", "true");
			}
		};

		/**
		 * Sets the <code>buttonMode</code> of the control.
		 * @param {sap.m.MenuButtonMode} sMode The new button mode
		 * @returns {sap.m.MenuButton} This instance
		 * @public
		 */
		MenuButton.prototype.setButtonMode = function(sMode) {
			var sTooltip = this.getTooltip();

			Control.prototype.setProperty.call(this, "buttonMode", sMode, true);
			this._getButtonControl().destroy();
			this._initButtonControl();

			//update all properties
			for (var key in this.mProperties) {
				if (
					this.mProperties.hasOwnProperty(key) &&
					key !== "buttonMode" &&
					key !== "useDefaultActionOnly" &&
					key !== "width"
				) {
					this._getButtonControl().setProperty(key, this.mProperties[key], true);
				}
			}
			//and tooltip aggregation
			if (sTooltip) {
				this._getButtonControl().setTooltip(sTooltip);
			}

			//update the text only
			if (!this._isSplitButton() && this._sDefaultText) {
				this.setText(this._sDefaultText);
			} else if (!this.getUseDefaultActionOnly() && this._getLastSelectedItem()) {
				this.setText(sap.ui.getCore().byId(this._getLastSelectedItem()).getText());
			}

			if (!this._isSplitButton() && this._sDefaultIcon) {
				this.setIcon(this._sDefaultIcon);
			} else if (!this.getUseDefaultActionOnly() && this._getLastSelectedItem()) {
				this.setIcon(sap.ui.getCore().byId(this._getLastSelectedItem()).getIcon());
			}

			this.invalidate();

			return this;
		};

		/**
		 * Creates the button part of a <code>MenuButton</code> in regular mode.
		 * @returns {object} The created <code>Button</code>
		 * @private
		 */
		MenuButton.prototype._initButton = function() {
			var oBtn = new Button({
				width: "100%"
			});
			oBtn.attachPress(this._handleButtonPress, this);
			return oBtn;
		};

		/**
		 * Creates the button part of a <code>MenuButton</code> in split mode.
		 * @returns {object} The created <code>SplitButton</code>
		 * @private
		 */
		MenuButton.prototype._initSplitButton = function() {
			var oBtn = new SplitButton({
				width: "100%"
			});
			oBtn.attachPress(this._handleActionPress, this);
			oBtn.attachArrowPress(this._handleButtonPress, this);
			return oBtn;
		};

		/**
		 * Creates the button part of a <code>MenuButton</code>.
		 * @private
		 */
		MenuButton.prototype._initButtonControl = function() {
			var oBtn;

			if (this._isSplitButton()) {
				oBtn = this._initSplitButton();
			} else {
				oBtn = this._initButton();
			}

			this.setAggregation("_button", oBtn, true);
		};

		MenuButton.prototype._updateButtonControl = function() {
			this._getButtonControl().setText(this.getText());
		};

		/**
		 * Gets the button part of a <code>MenuButton</code>.
		 * @private
		 */
		MenuButton.prototype._getButtonControl = function() {
			return this.getAggregation("_button");
		};

		/**
		 * Handles the <code>buttonPress</code> event and opens the menu.
		 * @param {boolean} bWithKeyboard If keyboard is used
		 * @private
		 */
		MenuButton.prototype._handleButtonPress = function(bWithKeyboard) {
			var oMenu = this.getMenu();

			if (!oMenu) {
				return;
			}

			if (!oMenu.getTitle()) {
				oMenu.setTitle(this.getText());
			}
			oMenu.openBy(this, bWithKeyboard);

			this._writeAriaAttributes();

			if (this._isSplitButton() && !Device.system.phone) {
				this._getButtonControl().setArrowState(true);
			}
		};

		MenuButton.prototype._handleActionPress = function() {
			var sLastSelectedItemId = this._getLastSelectedItem(),
				oLastSelectedItem;
			if (!this.getUseDefaultActionOnly() && sLastSelectedItemId) {
				oLastSelectedItem = sap.ui.getCore().byId(sLastSelectedItemId);
				this.getMenu().fireItemSelected({ item: oLastSelectedItem });
			} else {
				this.fireDefaultAction();
			}
		};

		MenuButton.prototype._menuClosed = function() {
			if (this._isSplitButton()) {
				this._getButtonControl().setArrowState(false);
			}
		};

		MenuButton.prototype._menuItemSelected = function(oEvent) {
			var oMenuItem = oEvent.getParameter("item");

			this.fireEvent("_menuItemSelected", { item: oMenuItem }); // needed for controls that listen to interaction events from within the control (e.g. for sap.m.OverflowToolbar)

			if (
				!this._isSplitButton() ||
				this.getUseDefaultActionOnly() ||
				!oMenuItem
			) {
				return;
			}

			this._lastActionItemId = oMenuItem.getId();
			!!this._sDefaultText && this.setText(oMenuItem.getText());
			!!this._sDefaultIcon && this.setIcon(oMenuItem.getIcon());
		};

		/**
		 * Gets the last selected menu item, which can be used
		 * to trigger the same default action on <code>MenuItem</code> press.
		 * @returns {string} The last selected item's ID
		 * @private
		 */
		MenuButton.prototype._getLastSelectedItem = function() {
			return this._lastActionItemId;
		};

		MenuButton.prototype._attachMenuEvents = function() {
			if (this.getMenu()) {
				this.getMenu().attachClosed(this._menuClosed, this);
				this.getMenu().attachItemSelected(this._menuItemSelected, this);
			}
		};

		MenuButton.prototype._isSplitButton = function() {
			return this.getButtonMode() === MenuButtonMode.Split;
		};

		/**
		 * Overriding the setProperty method in order to keep in sync internal aggregations properties.
		 * @override
		 * @param {string} sPropertyName The name of the property being changed
		 * @param {object} vValue The new value
		 * @param {boolean} bSuppressInvalidate Flag indicating of re-rendering should be suppressed
		 * @returns {object} this Instance for chaining.
		 */
		MenuButton.prototype.setProperty = function(sPropertyName, vValue, bSuppressInvalidate) {
			// Several button type property values are not allowed
			function isForbiddenType(sType) {
				var aTypes = [ButtonType.Up, ButtonType.Back, ButtonType.Unstyled];
				return aTypes.indexOf(sType) !== -1;
			}

			if (sPropertyName === "type" && isForbiddenType(vValue)) {
				return this;
			}

			if (sPropertyName === 'text') {
				this._sDefaultText = vValue;
			}

			// For certain properties, propagate the new value to the inner button
			switch (sPropertyName) {
				case 'activeIcon':
				case 'iconDensityAware':
				case 'textDirection':
					this._getButtonControl().setProperty(sPropertyName, vValue);
					break;
			}

			return Control.prototype.setProperty.apply(this, arguments);
		};

		/**
		 * Sets the tooltip for the <code>MenuButton</code>.
		 * Can either be an instance of a TooltipBase subclass or a simple string.
		 * @param {sap.ui.core.TooltipBase} vTooltip The tooltip that should be shown.
		 * @returns {*} this instance
		 * @public
		 */
		MenuButton.prototype.setTooltip = function(vTooltip) {
			this._getButtonControl().setTooltip(vTooltip);
			return Control.prototype.setTooltip.apply(this, arguments);
		};

		/*
		 * Override setter because the parent control has placed custom logic in it and all changes need to be propagated
		 * to the internal button aggregation.
		 * @param {string} sValue The text of the sap.m.MenuButton
		 * @return {sap.m.MenuButton} This instance for chaining
		 */
		MenuButton.prototype.setText = function (sValue) {
			Button.prototype.setProperty.call(this, 'text', sValue);
			this._getButtonControl().setText(sValue);
			return this;
		};

		/*
		 * Override setter because the parent control has placed custom logic in it and all changes need to be propagated
		 * to the internal button aggregation.
		 * @param {string} sValue`
		 * @return {sap.m.MenuButton} This instance for chaining
		 */
		MenuButton.prototype.setType = function (sValue) {
			Button.prototype.setProperty.call(this, 'type', sValue);
			this._getButtonControl().setType(sValue);
			return this;
		};

		/*
		 * Override setter because the parent control has placed custom logic in it and all changes need to be propagated
		 * to the internal button aggregation.
		 * @param {string} vValue
		 * @return {sap.m.MenuButton} This instance for chaining
		 */
		MenuButton.prototype.setIcon = function (vValue) {
			Button.prototype.setProperty.call(this, 'icon', vValue);
			this._getButtonControl().setIcon(vValue);
			return this;
		};

		MenuButton.prototype.getFocusDomRef = function() {
			return this._getButtonControl().getDomRef();
		};

		MenuButton.prototype.onsapup = function(oEvent) {
			this.openMenuByKeyboard();
		};

		MenuButton.prototype.onsapdown = function(oEvent) {
			this.openMenuByKeyboard();
		};

		MenuButton.prototype.onsapupmodifiers = function(oEvent) {
			this.openMenuByKeyboard();
		};

		MenuButton.prototype.onsapdownmodifiers = function(oEvent) {
			this.openMenuByKeyboard();
		};

		//F4
		MenuButton.prototype.onsapshow = function(oEvent) {
			this.openMenuByKeyboard();
			!!oEvent && oEvent.preventDefault();
		};

		MenuButton.prototype.openMenuByKeyboard = function() {
			if (!this._isSplitButton()) {
				this._handleButtonPress(true);
			}
		};

		MenuButton.prototype._writeAriaAttributes = function() {
			if (this.getMenu()) {
				this.$().attr("aria-controls", this.getMenu().getDomRefId());
			}
		};

		return MenuButton;
	});

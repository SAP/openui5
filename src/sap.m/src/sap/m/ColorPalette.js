/*!
 * ${copyright}
 */

// Provides control sap.m.ColorPalette
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/base/DataType',
	'sap/ui/core/library',
	'sap/ui/core/delegate/ItemNavigation',
	'./Button',
	'./Dialog',
	'./library',
	'./ColorPaletteRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/ColorPickerDisplayMode"
], function(
	Control,
	Device,
	DataType,
	coreLibrary,
	ItemNavigation,
	Button,
	Dialog,
	library,
	ColorPaletteRenderer,
	containsOrEquals,
	KeyCodes,
	jQuery,
	ColorPickerDisplayMode
) {
		"use strict";

		// shortcut to CSSColor of the core library
		var CSSColor = coreLibrary.CSSColor;

		// shortcut to ColorPicker (lazy initialized)
		var ColorPicker;

		// shortcut to ColorPickerMode (lazy initialized)
		var ColorPickerMode;

		// shortcut to the ButtonType enumeration
		var ButtonType = library.ButtonType;

		// reference to the boolean data type in the core
		var BooleanType = DataType.getType("boolean");

		// The name of the class, corresponding to a single color item
		var CSS_CLASS_SWATCH = "sapMColorPaletteSquare";

		// Defines the exact count of swatches per row
		var SWATCHES_PER_ROW = 5;

		// Min amount of swatches when app.developer sets colors
		var MIN_COLORS = 2;

		// Max amount of swatches when app.developer sets colors
		var MAX_COLORS = 15;

		// get resource translation bundle;
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		/**
		 * Constructor for a new <code>ColorPalette</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Represents a predefined range of colors for easier selection.
		 *
		 * <h3>Overview</h3>
		 * The <code>ColorPalette</code> provides the users with a range of predefined colors.
		 *
		 * You can customize them with the use of the <code>colors</code> property.
		 * You can specify a <code>defaultColor</code> and display a "Default color" button
		 * for the user to choose directly. You can display a "More colors..." button
		 * that opens an additional color picker for the user to choose specific colors
		 * that are not present in the predefined range.
		 *
		 * <h3>Usage</h3>
		 *
		 * The palette is intended for users, who don't want to check and remember the
		 * different values of the colors and spend large amount of time to configure the
		 * right color through the color picker.
		 *
		 * The control can be embedded in a form or can be opened as popover (by use of thin
		 * wrapper control <code>sap.m.ColorPalettePopover</code>).
		 * @see {@link sap.m.ColorPalettePopover}
		 *
		 * <b>Note:</b> The {@link sap.ui.unified.ColorPicker} is used internally only if the <code>ColorPicker</code>
		 * is opened (not used for the initial rendering). If the <code>sap.ui.unified</code> library is not loaded
		 * before the <code>ColorPicker</code> is opened, it will be loaded upon opening. This could lead to a waiting
		 * time when the <code>ColorPicker</code> is opened for the first time. To prevent this, apps using the
		 * <code>ColorPalette</code> should also load the <code>sap.ui.unified</code> library.
		 *
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.54
		 * @alias sap.m.ColorPalette
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ColorPalette = Control.extend("sap.m.ColorPalette", /** @lends sap.m.ColorPalette.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Defines the List of colors displayed in the palette. Minimum is 2 colors, maximum is 15 colors.
					 */
					colors: {
						type: "sap.ui.core.CSSColor[]", group: "Appearance",
						defaultValue: [
							"gold",
							"darkorange",
							"indianred",
							"darkmagenta",
							"cornflowerblue",
							"deepskyblue",
							"darkcyan",
							"olivedrab",
							"darkslategray",
							"azure",
							"white",
							"lightgray",
							"darkgray",
							"dimgray",
							"black"
						]
					}
				},

				aggregations: {
					/* Reference to an optional button for activating default color. For private use. */
					_defaultColorButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

					/* Reference to an optional button for activating more color selection. For private use. */
					_moreColorsButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
				},

				events: {
					/**
					 * Fired when the user selects a color.
					 */
					colorSelect: {
						parameters: {
							/**
							 * The color that is returned when user chooses the "Default color" button.
							 */
							"value": {type: "sap.ui.core.CSSColor"},
							/**
							 * Denotes if the color has been chosen by selecting the "Default Color" button (true or false)
							 */
							"defaultAction": {type: "boolean"}
						}
					}
				}
			}
		});

		ColorPalette.prototype.init = function () {

			// The default color. Private API. Allowed consumer is ColorPaletteAPI.
			this._oDefaultColor = null;

			// If the "Default color" button should be shown. Private API. Allowed consumer is ColorPaletteAPI.
			this._bShowDefaultColorButton = false;

			// If the "More colors" button should be shown. Private API. Allowed consumer is ColorPaletteAPI.
			this._bShowMoreColorsButton = false;

			// If the "Recent colors" section should be shown. Private API. Allowed consumer is ColorPaletteAPI
			this._bShowRecentColorsSection = false;

			// Display mode. Private API. Allowed consumer is ColorPaletteAPI.
			this._oDisplayMode = ColorPickerDisplayMode.Default;

			// Reference to the dialog containing the internal "Color Picker". For private use.
			this._oMoreColorsDialog = null;

			// Reference to the palette color section item navigation
			this._oPaletteColorItemNavigation = null;

			// Reference to the recent color section item navigation
			this._oRecentColorItemNavigation = null;

			// Queue of recently used colors
			this._recentColors = [];
		};

		ColorPalette.prototype.exit = function () {
			if (this._oMoreColorsDialog) {
				this._oMoreColorsDialog.destroy();
				delete this._oMoreColorsDialog;
			}

			if (this._oPaletteColorItemNavigation) {
				this.removeDelegate(this._oPaletteColorItemNavigation);
				this._oPaletteColorItemNavigation.destroy();
				delete this._oPaletteColorItemNavigation;
			}

			if (this._oRecentColorItemNavigation) {
				this.removeDelegate(this._oRecentColorItemNavigation);
				this._oRecentColorItemNavigation.destroy();
				delete this._oRecentColorItemNavigation;
			}
		};

		ColorPalette.prototype.setColors = function (aColors) {
			aColors = this.validateProperty("colors", aColors);

			if (aColors.length < MIN_COLORS || aColors.length > MAX_COLORS) {
				throw new Error("Cannot set property 'colors' - array must has minimum 2 and maximum 15 elements");
			}
			return this.setProperty("colors", aColors);
		};

		/**
		 * Sets a default displayMode.
		 * @param {sap.ui.unified.ColorPickerDisplayMode} oDisplayMode the color
		 * @private
		 * @return {sap.m.ColorPalette} <code>this</code> for method chaining
		 */
		ColorPalette.prototype._setDisplayMode = function (oDisplayMode) {
			var oColorPicker = this._getColorPicker();
			oColorPicker.setDisplayMode(oDisplayMode);
			this._oDisplayMode = oDisplayMode;

			return this;
		};

		// Display mode
		ColorPalette.prototype._getDisplayMode = function () {
			return this._oDisplayMode;
		};

		ColorPalette.prototype._getColorPicker = function () {
			return this._ensureMoreColorsDialog()._oColorPicker;
		};

		ColorPalette.prototype.ontap = function (oEvent) {
			var $Target = jQuery(oEvent.target),
				sColor,
				$Swatch;

			$Swatch = $Target.closest("." + CSS_CLASS_SWATCH);
			if (!$Swatch.length) {
				return;
			}

			sColor = $Swatch.attr("data-sap-ui-color");
			this._fireColorSelect(sColor, false, oEvent);
		};

		ColorPalette.prototype.onsaptabnext = ColorPalette.prototype.onsaptabprevious = function (oEvent) {
			var oElementInfo = this._getElementInfo(oEvent.target);

			if (oElementInfo.bIsMoreColorsButton) {
				this.fireEvent("_colorNotSelected", {_originalEvent: oEvent});
				return;
			}

			if (oElementInfo.bIsDefaultColorButton) {
				this._fireColorSelect(this._getDefaultColor(), true, oEvent);
				return;
			}

			ColorPalette.prototype.ontap.apply(this, arguments);
		};

		ColorPalette.prototype.onsapenter = ColorPalette.prototype.ontap;

		ColorPalette.prototype.onsapspace = function (oEvent) {
			oEvent.preventDefault();
		};

		ColorPalette.prototype.onkeyup = function (oEvent) {
			if (oEvent.which === KeyCodes.SPACE) {
				oEvent.preventDefault();
				ColorPalette.prototype.ontap.apply(this, arguments);
			}
		};

		ColorPalette.prototype.onsaphome = ColorPalette.prototype.onsapend = function(oEvent) {
			// Home and End keys on ColorPalette buttons should do nothing. If event occurs on the swatch, see ItemNavigationHomeEnd).
			var oElemInfo = this._getElementInfo(oEvent.target);

			if (oElemInfo.bIsDefaultColorButton || oElemInfo.bIsMoreColorsButton) {
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation(true); // does not allow the ItemNavigationHomeEnd delegate to receive it
			}
		};

		ColorPalette.prototype.onAfterRendering = function () {
			this._ensureItemNavigation();
		};

		ColorPalette.prototype.pushToRecentColors = function (sColor) {
			var iIndexOfColor = this._recentColors.indexOf(sColor);

			if (iIndexOfColor > -1){
				this._recentColors.splice(iIndexOfColor,1);
			} else if (this._recentColors.length === 5) {
				this._recentColors.pop();
			}

			this._recentColors.unshift(sColor);

			this.invalidate();
		};


		// Private methods -------------------------------------------------------------------------------------------
		ColorPalette.prototype._createDefaultColorButton = function () {
			return new Button(this.getId() + "-btnDefaultColor", {
				width: "100%",
				type: ButtonType.Transparent,
				text: oLibraryResourceBundle.getText("COLOR_PALETTE_DEFAULT_COLOR"),
				visible: this._getShowDefaultColorButton(),
				press: function (oEvent) {
					this._fireColorSelect(this._getDefaultColor(), true, oEvent);
				}.bind(this)
			});
		};

		// Default color
		ColorPalette.prototype._getDefaultColor = function () {
			return this._oDefaultColor;
		};

		/**
		 * Sets a default color.
		 * @param {sap.ui.core.CSSColor} color the color
		 * @private
		 * @return {sap.m.ColorPalette} <code>this</code> for method chaining
		 */
		ColorPalette.prototype._setDefaultColor = function (color) {
			if (!CSSColor.isValid(color)) {
				throw new Error("Cannot set internal property '_defaultColor' - invalid value: " + color);
			}
			this._oDefaultColor = color;
			return this;
		};


		ColorPalette.prototype._getShowDefaultColorButton = function () {
			return this._bShowDefaultColorButton;
		};


		ColorPalette.prototype._setShowDefaultColorButton = function (bValue) {
			if (!BooleanType.isValid(bValue)) {
				throw new Error("Cannot set internal property 'showDefaultColorButton' - invalid value: " + bValue);
			}
			this._bShowDefaultColorButton = bValue;

			//lazy loading check
			if (bValue && !this._getDefaultColorButton()) {
				this.setAggregation("_defaultColorButton", this._createDefaultColorButton());
			}

			if (this._getDefaultColorButton()) { /* still button may not be there */
				this._getDefaultColorButton().setVisible(bValue);
			}
			return this;
		};

		ColorPalette.prototype._getDefaultColorButton = function () {
			return this.getAggregation("_defaultColorButton");
		};

		// More Colors...
		ColorPalette.prototype._createMoreColorsButton = function () {
			return new Button(this.getId() + "-btnMoreColors", {
				width: "100%",
				type: ButtonType.Transparent,
				text: oLibraryResourceBundle.getText("COLOR_PALETTE_MORE_COLORS"),
				visible: this._getShowMoreColorsButton(),
				press: this._openColorPicker.bind(this)
			});
		};

		ColorPalette.prototype._getShowMoreColorsButton = function () {
			return this._bShowMoreColorsButton;
		};

		ColorPalette.prototype._getShowRecentColorsSection = function () {
			return this._bShowRecentColorsSection;
		};

		ColorPalette.prototype._getRecentColors = function () {
			return this._recentColors;
		};

		ColorPalette.prototype._setShowRecentColorsSection = function (bValue) {
			if (!BooleanType.isValid(bValue)) {
				throw new Error("Cannot set internal property 'showRecentColorsSection' - invalid value: " + bValue);
			}
			this._bShowRecentColorsSection = bValue;

			return this;
		};

		ColorPalette.prototype._setShowMoreColorsButton = function (bValue) {
			if (!BooleanType.isValid(bValue)) {
				throw new Error("Cannot set internal property 'showMoreColorsButton' - invalid value: " + bValue);
			}
			this._bShowMoreColorsButton = bValue;

			//lazy loading check
			if (bValue && !this._getMoreColorsButton()) {
				this.setAggregation("_moreColorsButton", this._createMoreColorsButton());
			}

			if (this._getMoreColorsButton()) { /* still button may not be there */
				this._getMoreColorsButton().setVisible(bValue);
			}
			return this;
		};

		ColorPalette.prototype._getMoreColorsButton = function () {
			return this.getAggregation("_moreColorsButton");
		};

		/**
		 * Opens a color picker in a Dialog.
		 * The function assumes that there is a "more colors.." button visible.
		 * @return void
		 * @private
		 */
		ColorPalette.prototype._openColorPicker = function () {
			this.fireEvent("_beforeOpenColorPicker"); //hook for program consumers (i.e. ColorPalettePopover)
			this._ensureMoreColorsDialog().open();
		};

		/**
		 * Ensure a dialog wrapping the ColorPicker exists (creates new if is not created yet).
		 * @return {sap.m.Dialog} the dialog.
		 * @private
		 */
		ColorPalette.prototype._ensureMoreColorsDialog = function () {
			if (!this._oMoreColorsDialog) {
				this._oMoreColorsDialog = this._createMoreColorsDialog();
			}

			return this._oMoreColorsDialog;
		};

		/**
		 * Creates a dialog that wraps the ColorPicker
		 * @return {sap.m.Dialog} the dialog containing the ColorPicker
		 * @private
		 */
		ColorPalette.prototype._createMoreColorsDialog = function () {
			var oDialog = new Dialog(this.getId() + "-moreColorsDialog", {
				stretch: !!Device.system.phone,
				title: oLibraryResourceBundle.getText("COLOR_PALETTE_MORE_COLORS_TITLE")
			}).addStyleClass("CPDialog");

			this._ensureUnifiedLibrary();

			// keep explicit reference to the picker attached to the parent dialog
			oDialog.addContent(oDialog._oColorPicker = new ColorPicker({
				mode: ColorPickerMode.HSL,
				displayMode: this._oDisplayMode
			}));

			// OK button
			oDialog.setBeginButton(new Button({
				text: oLibraryResourceBundle.getText("COLOR_PALETTE_MORE_COLORS_CONFIRM"),
				press: function (oEvent) {
					oDialog.close();
					if (oDialog._oColorPicker.getColorString()) {
						this._fireColorSelect(oDialog._oColorPicker.getColorString(), false, oEvent);
					}
				}.bind(this)
			}));

			// Cancel button
			oDialog.setEndButton(new Button({
				text: oLibraryResourceBundle.getText("COLOR_PALETTE_MORE_COLORS_CANCEL"),
				press: function () {
					oDialog.close();
				}
			}));

			return oDialog;
		};
		// Other

		// Ensure that the sap.ui.unified library and sap.ui.unified.ColorPicker are both loaded
		ColorPalette.prototype._ensureUnifiedLibrary = function () {
			var oUnifiedLib;

			if (!ColorPicker) {
				sap.ui.getCore().loadLibrary("sap.ui.unified");
				oUnifiedLib = sap.ui.require("sap/ui/unified/library");

				ColorPicker = sap.ui.requireSync("sap/ui/unified/ColorPicker");
				ColorPickerMode = oUnifiedLib.ColorPickerMode;
			}
		};

		/**
		 * Focuses the first available element in the palette.
		 * @private
		 */
		ColorPalette.prototype._focusFirstElement = function () {
			var oFirstSwatchElement = this._getShowDefaultColorButton() ? this._getDefaultColorButton().getDomRef() : this._getAllPaletteColorSwatches()[0];

			oFirstSwatchElement.focus();
		};

		/**
		 * Helper function to fire the event "colorSelect"
		 * @param {sap.ui.core.CSSColor} color the color
		 * @param {boolean} [defaultAction=false] if the selection is performed via "Default color" button
		 * @param {jQuery.Event} oOriginalEvent original event
		 * @private
		 */
		ColorPalette.prototype._fireColorSelect = function (color, defaultAction, oOriginalEvent) {
			this.fireColorSelect({value: color, defaultAction: defaultAction, _originalEvent: oOriginalEvent});
			this.pushToRecentColors(color);
		};
		/**
		 * Handles creation or update of the ItemNavigation.
		 * @private
		 */
		ColorPalette.prototype._ensureItemNavigation = function () {
			var aPaletteColorsDomRefs = [],
				aRecentColorsDomRefs = [];

			if (!this._oPaletteColorItemNavigation) {
				this._oPaletteColorItemNavigation = new ItemNavigationHomeEnd(this);
				this._oPaletteColorItemNavigation.setColumns(SWATCHES_PER_ROW);
				this._oPaletteColorItemNavigation.setCycling(false);
				this.addDelegate(this._oPaletteColorItemNavigation);
				this._oPaletteColorItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._onSwatchContainerBorderReached, this);
			}

			if (!this._oRecentColorItemNavigation) {
				this._oRecentColorItemNavigation = new ItemNavigationHomeEnd(this);
				this._oRecentColorItemNavigation.setColumns(SWATCHES_PER_ROW);
				this._oRecentColorItemNavigation.setCycling(false);
				this.addDelegate(this._oRecentColorItemNavigation);
				this._oRecentColorItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._onSwatchContainerBorderReached, this);
			}

			// all currently available swatches
			aPaletteColorsDomRefs = aPaletteColorsDomRefs.concat(this._getAllPaletteColorSwatches());
			aRecentColorsDomRefs = aRecentColorsDomRefs.concat(this._getAllRecentColorSwatches());
			aRecentColorsDomRefs = aRecentColorsDomRefs.slice(0, this._getRecentColors().length);


			this._oPaletteColorItemNavigation.setRootDomRef(this.getDomRef("swatchCont-paletteColor"));
			this._oPaletteColorItemNavigation.setItemDomRefs(aPaletteColorsDomRefs);

			this._oRecentColorItemNavigation.setRootDomRef(this.getDomRef("swatchCont-recentColors"));
			this._oRecentColorItemNavigation.setItemDomRefs(aRecentColorsDomRefs);
		};

		/**
		 * Handles navigation from within the swatch container to the outside where the end-user navigates through the
		 * swatch container and reaches its border (<code>ItemNavigationHomeEnd.BorderReachedDirectionBackward</code> or
		 * <code>ItemNavigationHomeEnd.BorderReachedDirectionForward</code>).
		 *
		 * The buttons Default Color and More colors are handled as color palette items, these are also part of the
		 * arrow key navigation.
		 *
		 * If the user is on the last swatch item and presses [Down] or [Right] keyboard key
		 * (<code>ItemNavigationHomeEnd.BorderReachedDirectionForward</code>), the focus should go into one of the
		 * following elements (in the provided order):
		 * <ol>
		 *	<li>More Colors button if such is available. If not, the focus should go to</li>
		 *	<li>Default color button if such is available. If not, the focus should go to</li>
		 *	<li>The first swatch item in the swatch container (there is always such)</li>
		 * </ol>
		 *
		 * If the user is on the first swatch item inside the swatch container and presses [Up] or [Down] keyboard keys
		 * (<code>ItemNavigationHomeEnd.BorderReachedDirectionBackward</code>) the focus should go into one of the
		 * following elements (in the provided order):
		 * <ol>
		 *	<li>Default color button if such is available. If not, the focus should go to</li>
		 *	<li>More Colors button if such is available. If not, the focus should go to</li>
		 *  <li>The first swatch item in the last row of the swatch container (there is always such)</li>
		 * </ol>
		 *
		 * @param {jQuery.Event} oEvent the keyboard event
		 * @return {Element|sap.m.Button} the element that the focus has been moved on.
		 * @private
		 */
		ColorPalette.prototype._onSwatchContainerBorderReached = function(oEvent) {
			var vNextElement,
				aSwatches,
				bHomeOrEnd = ["saphome","sapend"].indexOf(oEvent.getParameter("event").type) > -1,
				bIsRecentColorSwatch = this._getAllRecentColorSwatches()[0] ? this._getElementInfo(oEvent.mParameters.event.target).bIsRecentColorSwatch : false;

			if (oEvent.getParameter(ItemNavigationHomeEnd.BorderReachedDirection) === ItemNavigationHomeEnd.BorderReachedDirectionForward) {
				if (this._getShowMoreColorsButton() && !bIsRecentColorSwatch) {
					vNextElement = this._getMoreColorsButton();
				} else if (!bHomeOrEnd && this._bShowRecentColorsSection && !bIsRecentColorSwatch && this._getRecentColors().length > 0) {
					vNextElement = this._getAllRecentColorSwatches()[0];
				} else if (!bHomeOrEnd && this._getShowDefaultColorButton()) {// Default Color, but excluding "home" and "end"
					vNextElement = this._getDefaultColorButton();
				}  else if (!bHomeOrEnd) { // swatch, but not due to "home" and "end" keys
					vNextElement = this._getAllPaletteColorSwatches()[0];
				}
			} else { // Backward
				if (this._getShowDefaultColorButton() && !bIsRecentColorSwatch) {
					vNextElement = this._getDefaultColorButton();
				} else if (!bHomeOrEnd && this._bShowRecentColorsSection && !bIsRecentColorSwatch && this._getRecentColors().length > 0) {
					vNextElement = this._getAllRecentColorSwatches()[0];
				} else if (!bHomeOrEnd && this._getShowMoreColorsButton()) {// More Colors, but excluding "home" and "end"
					vNextElement = this._getMoreColorsButton();
				} else if (!bHomeOrEnd && !this._getShowDefaultColorButton()) { // swatch, but not due to "home" and "end" keys
					aSwatches = this._getAllPaletteColorSwatches();
					vNextElement = aSwatches[aSwatches.length - 1];
				} else if (!bHomeOrEnd) { // swatch, but not due to "home" and "end" keys
					aSwatches = this._getAllPaletteColorSwatches();
					vNextElement = aSwatches[this._oPaletteColorItemNavigation._getIndexOfTheFirstItemInLastRow()];
				}
			}

			if (vNextElement) {
				vNextElement.focus();
			}

			return vNextElement;
		};

		/**
		 * Handles forward navigation when the user is either on Default Color or More Colors buttons.
		 *
		 * If the user is on Default Color, focus should go to the first item in the swatch container.
		 * If the user is on More Colors, focus should go on the Default Color button if such exists, otherwise on the
		 * the first item in the swatch container.
		 *
		 * @param {jQuery.Event} oEvent the keyboard event
		 */
		ColorPalette.prototype.onsapnext = function (oEvent) {
			var vNextElement,
				oElementInfo = this._getElementInfo(oEvent.target);

			if (!(oElementInfo.bIsDefaultColorButton || oElementInfo.bIsMoreColorsButton)) {
				return;
			}

			oEvent.preventDefault();
			oEvent.stopImmediatePropagation(true); //also prevents ItemNavigation handler

			if (oElementInfo.bIsDefaultColorButton) {
				vNextElement = this._getAllPaletteColorSwatches()[0];
			} else if (this._getRecentColors().length > 0 && !oElementInfo.bIsRecentColorSwatch && this._bShowRecentColorsSection){
				vNextElement = this._getAllRecentColorSwatches()[0];
			} else {
				vNextElement = this._getShowDefaultColorButton() ? this._getDefaultColorButton() : this._getAllPaletteColorSwatches()[0];
			}

			vNextElement.focus();
		};

		/**
		 * Handles backward navigation when user is either on Default Color or More Colors buttons.
		 *
		 * If the user is on Default Color, focus should go to the More Colors button if such exists, otherwise,
		 * on the first item in the last row of the swatch container.
		 * If user is on More Colors, focus should go on:
		 *  - the first item in the last row of the swatch container if <code>sapprevious</code> is fired due to
		 * [Up] key, otherwise
		 *  - the last item in the swatch container (the possible keycodes is: [Left] (in ltr) or [Right] (rtl).
		 *
		 * @param {jQuery.Event} oEvent the keyboard event
		 */
		ColorPalette.prototype.onsapprevious = function (oEvent) {
			var vNextElement,
				oFocusInfo = this._getElementInfo(oEvent.target),
				aAllSwatches;

			if (!(oFocusInfo.bIsDefaultColorButton || oFocusInfo.bIsMoreColorsButton || oEvent.target === this._getAllRecentColorSwatches()[0])) {
				return;
			}

			oEvent.preventDefault();
			oEvent.stopImmediatePropagation(true);//also prevents ItemNavigation handler

			aAllSwatches = this._getAllPaletteColorSwatches();

			if (oFocusInfo.bIsMoreColorsButton || (!oFocusInfo.bIsMoreColorsButton && this.bIsRecentColorSwatch)) {
				vNextElement = oEvent.keyCode === KeyCodes.ARROW_UP ?
					aAllSwatches[this._oPaletteColorItemNavigation._getIndexOfTheFirstItemInLastRow()] : aAllSwatches[aAllSwatches.length - 1];
			} else if (oFocusInfo.bIsRecentColorSwatch && !this._bShowMoreColorsButton && !this._bShowDefaultColorButton) {
				aAllSwatches = this._getAllPaletteColorSwatches();
				vNextElement = aAllSwatches[this._oPaletteColorItemNavigation._getIndexOfTheFirstItemInLastRow()];
			} else if (this._getRecentColors().length > 0 && !oFocusInfo.bIsRecentColorSwatch && this._bShowRecentColorsSection){
				vNextElement = this._getAllRecentColorSwatches()[0];
			} else if (this._getShowMoreColorsButton()){
				vNextElement = this._getMoreColorsButton();
			} else {
				vNextElement = aAllSwatches[this._oPaletteColorItemNavigation._getIndexOfTheFirstItemInLastRow()];
			}

			vNextElement.focus();
		};

		// DOM related private helpers

		/**
		 * Returns all palette swatches/squares
		 * @return {Element[]} returns all swatch container items in an array of DOM elements.
		 * @private
		 */
		ColorPalette.prototype._getAllPaletteColorSwatches = function () {
			return this.$().find("." + CSS_CLASS_SWATCH).get().slice(0, this.getColors().length);
		};

		/**
		 * Returns all swatches/squares in recent color section
		 * @return {Element[]} returns all swatch container items in an array of DOM elements.
		 * @private
		 */
		ColorPalette.prototype._getAllRecentColorSwatches = function () {
			return this.$().find("." + CSS_CLASS_SWATCH).get().slice(this.getColors().length);
		};

		/**
		 * Analyzes if given DOM element is one of the <code>ColorPalette</code> artifacts (Default Color, More Colors,
		 * swatch color).
		 * @param {Element} oElement DOM Element
		 * @return {{bIsDefaultColorButton: *, bIsMoreColorsButton: boolean|*, bIsASwatch: boolean|*}} result
		 * @private
		 */
		ColorPalette.prototype._getElementInfo = function (oElement) {
			var bIsDefaultColorButton = this._getShowDefaultColorButton() && containsOrEquals(oElement,
					this._getDefaultColorButton().getDomRef()),
				bIsMoreColorsButton = !bIsDefaultColorButton && this._getShowMoreColorsButton() && containsOrEquals(oElement,
					this._getMoreColorsButton().getDomRef()),
				bIsRecentColorSwatch = this._getAllRecentColorSwatches().indexOf(oElement) > -1,
				bIsASwatch = this._getAllPaletteColorSwatches().indexOf(oElement) > -1;

			return {
				bIsDefaultColorButton: bIsDefaultColorButton,
				bIsMoreColorsButton: bIsMoreColorsButton,
				bIsASwatch: bIsASwatch,
				bIsRecentColorSwatch: bIsRecentColorSwatch
			};
		};

		/**
		 * Extension of <code>sap.ui.core.delegate.ItemNavigation</code> to support custom keyboard handling for:
		 * - [Home] (overrides <code>onsaphome</code>,
		 * - [End] (overrides <code>onsapend</code>),
		 * - [Up] (overrides <code>onsapprevious</code>),
		 * - [Down] (overrides <code>onsapnext</code>).
		 *
		 * When using [Up] or [Down] keys, the focus moves up one row or down one row.
		 * If the next row has less items than the currently focused row, and the focus is above whitespace, the use of
		 * the [Down] arrow key moves the focus to the last item of the next row (-> also changes column). When using [Up] now,
		 * the focus moves one row up, onto the same column.
		 *
		 * <code>ItemNavigation</code>'s event <code>BorderReached</code> is enhanced. It used to be fired by [Right]
		 * (respectively [Left]) key on the last (respectively the first) item. Now, the same event is fired also when
		 * [Down] (respectively [Up]) key is used.
		 *
		 * If the [Home] key is pressed, it moves the focus according to the following order:
		 * - to the first item in the current row. If already on it
		 * - to the first item in the whole container. If already on it
		 * - fires a <code>BorderReached</code> event
		 *
		 * Respectively, if the [End] key is pressed, it moves the focus according to the following order:
		 * - to the last item in the current row. If already on it
		 * - to the last item in the whole container. If already on it
		 * - fires a <code>BorderReached</code> event
		 *
		 *  @private
		 */
		var ItemNavigationHomeEnd = ItemNavigation.extend("sap.m.ItemNavigationHomeEnd", {
			constructor: function () {
				ItemNavigation.apply(this, arguments);
				this.setHomeEndColumnMode(true);

				// overrides fireEvent in order to enhance it with the parameter 'direction'
				this.fireEvent = function(sName, oEventParams) {
					var sDirection;

					if (sName === ItemNavigation.Events.BorderReached) {
						sDirection = ItemNavigationHomeEnd.BorderReachedDirectionBackward;
						if (["sapnext", "sapend"].indexOf(oEventParams.event.type) > -1) { // last item
							sDirection = ItemNavigationHomeEnd.BorderReachedDirectionForward;
						}
						oEventParams[ItemNavigationHomeEnd.BorderReachedDirection] = sDirection;
					}
					ItemNavigation.prototype.fireEvent.apply(this, arguments);
				};
			}
		});

		// Custom Event Parameter to enhance ItemNavigation.BorderReached event with the direction of reach.
		ItemNavigationHomeEnd.BorderReachedDirection = "direction";
		ItemNavigationHomeEnd.BorderReachedDirectionForward = "BorderReachedDirectionForward";
		ItemNavigationHomeEnd.BorderReachedDirectionBackward = "BorderReachedDirectionBackward";

		/**
		 * Returns the number of columns defined.
		 * @return {*}
		 */
		ItemNavigationHomeEnd.prototype.getColumns = function() {
			return this.iColumns;
		};

		/**
		 * Handles the backward navigation in case the [Up] key is used on the first swatch item.
		 * Otherwise, delegates the event to the <code>ItemNavigation</code>.
		 * @param {jQuery.Event} oEvent the keyboard event
		 */
		ItemNavigationHomeEnd.prototype.onsapprevious = function (oEvent) {
			var bIsOnItem = containsOrEquals(this.getRootDomRef(), oEvent.target),
				bArrowUpOnFirstItem = oEvent.keyCode === KeyCodes.ARROW_UP && this.getFocusedIndex() === 0;

			if (!bIsOnItem) {
				return;
			}

			if (!bArrowUpOnFirstItem) {
				ItemNavigation.prototype.onsapprevious.apply(this, arguments);
				return;
			}

			oEvent.preventDefault(); // browser's scrolling should be prevented

			this.fireEvent(ItemNavigation.Events.BorderReached, {
				index: 0,
				event: oEvent
			});

		};

		/**
		 * Handles the forward navigation when the [Down] key is used in the following cases:
		 * - on the last swatch item
		 * - on an upper row item when moving on the same column of the next row will hit an empty/whitespace swatch item.
		 * Otherwise delegates the event to the <code>ItemNavigation</code>.
		 *
		 * @param {jQuery.Event} oEvent the keyboard event
		 */
		ItemNavigationHomeEnd.prototype.onsapnext = function (oEvent) {
			var bIsOnItem = containsOrEquals(this.getRootDomRef(), oEvent.target),
				aItemDomRefs,
				iCurrentIndex,
				oItemInfo;

			if (!bIsOnItem) {
				return;
			}

			if (oEvent.keyCode !== KeyCodes.ARROW_DOWN) {
				ItemNavigation.prototype.onsapnext.apply(this, arguments);
				return;
			}

			iCurrentIndex = this.getFocusedIndex();
			oItemInfo = this._getItemInfo(iCurrentIndex);

			if (oItemInfo.bIsLastItem && oItemInfo.bIsInTheLastColumn) {
				oEvent.preventDefault(); //browser's scrolling should be prevented

				this.fireEvent(ItemNavigation.Events.BorderReached, {// Arrow down on last item should fire the event "BorderRеached"
					index: iCurrentIndex,
					event: oEvent
				});
				return;
			}

			// Whitespace handler
			if (oItemInfo.bNextRowExists && !oItemInfo.bItemSameColumnNextRowExists) {

				oEvent.preventDefault(); //browser's scrolling should be prevented

				aItemDomRefs = this.getItemDomRefs();
				aItemDomRefs[aItemDomRefs.length - 1].focus();

				return;
			}

			ItemNavigation.prototype.onsapnext.apply(this, arguments);
		};

		ItemNavigationHomeEnd.prototype.onsaphome = function(oEvent) {
			var bIsOnItem = containsOrEquals(this.getRootDomRef(), oEvent.target),
				oItemInfo;

			if (!bIsOnItem) {
				return;
			}

			oItemInfo = this._getItemInfo(this.getFocusedIndex());

			if (!oItemInfo.bIsInTheFirstColumn) {
				// delegate to the parent, which should move the focus to the first item in the row
				ItemNavigation.prototype.onsaphome.apply(this, arguments);
				return;
			}

			oEvent.preventDefault(); // browser's scrolling should be prevented

			if (oItemInfo.bIsFirstItem) {
				this.fireEvent(ItemNavigation.Events.BorderReached, {
					index: 0,
					event: oEvent
				});
			} else { //first item in the row, move the focus to the first item in the whole container
				this.getItemDomRefs()[0].focus();
			}
		};

		ItemNavigationHomeEnd.prototype.onsapend = function(oEvent) {
			var bIsOnItem = containsOrEquals(this.getRootDomRef(), oEvent.target),
				oItemInfo;

			if (!bIsOnItem) {
				return;
			}

			oItemInfo = this._getItemInfo(this.getFocusedIndex());

			if (!(oItemInfo.bIsLastItem || oItemInfo.bIsInTheLastColumn)) {
				// delegate to the parent, which should move the focus to the last item in the row
				ItemNavigation.prototype.onsapend.apply(this, arguments);
				return;
			}

			oEvent.preventDefault(); // browser's scrolling should be prevented

			if (oItemInfo.bIsLastItem) {
				this.fireEvent(ItemNavigation.Events.BorderReached, {
					index: this.getItemDomRefs().length - 1,
					event: oEvent
				});
			} else { // last item in the row, move the focus to the last item in the whole container
				this.getItemDomRefs()[this.getItemDomRefs().length - 1].focus();
			}
		};

		/**
		 * Analyzes the given item and produces information about its position.
		 * @param {number} iIndex the item given by its position
		 * @return {{bIsLastItem: boolean, bIsInTheLastColumn: boolean, bNextRowExists: boolean|*, bItemSameColumnNextRowExists: boolean|*}}
		 * @private
		 */
		ItemNavigationHomeEnd.prototype._getItemInfo = function(iIndex) {
			var iItemsCount = this.getItemDomRefs().length,
				bItemIsLast = iIndex === (iItemsCount - 1),
				iLastVisibleColumn = iItemsCount  > this.getColumns() ? this.getColumns() : iItemsCount,
				bItemIsInTheFirstColumn = iIndex % this.getColumns() === 0,
				bItemIsInTheLastColumn = (iIndex + 1) % iLastVisibleColumn === 0,
				iCurrentRow = Math.floor(iIndex / this.getColumns()) + 1, //1 based
				bNextRowExists,
				bItemSameColumnNextRowExists;

			bNextRowExists = iCurrentRow * this.getColumns() < iItemsCount;
			bItemSameColumnNextRowExists = bNextRowExists && (iIndex + this.getColumns()) < iItemsCount;

			return {
				bIsFirstItem: iIndex === 0,
				bIsLastItem: bItemIsLast,
				bIsInTheLastColumn: bItemIsInTheLastColumn,
				bIsInTheFirstColumn: bItemIsInTheFirstColumn,
				bNextRowExists: bNextRowExists,
				bItemSameColumnNextRowExists: bItemSameColumnNextRowExists
			};
		};

		/**
		 * Calculates the index of the first item in the last row.
		 * @return {int} the index(zero based) of the first/last item in the row.
		 * @private
		 */
		ItemNavigationHomeEnd.prototype._getIndexOfTheFirstItemInLastRow = function () {
			return Math.floor((this.getItemDomRefs().length - 1) / this.getColumns()) * this.getColumns();
		};


		/**
		 * @private
		 */
		ColorPalette.prototype._ItemNavigation = ItemNavigationHomeEnd;

		/**
		 * Private Color map helper
		 * @private
		 */
		ColorPalette.prototype._ColorsHelper = {
			RGB_TO_NAMED_COLORS_MAP: {
				"#FFB200": "gold",
				"#FF8C00": "darkorange",
				"#CD5C5C": "indianred",
				"#8B008B": "darkmagenta",
				"#6495ED": "cornflowerblue",
				"#00BFFF": "deepskyblue",
				"#008B8B": "darkcyan",
				"#6B8E23": "olivedrab",
				"#2F4F4F": "darkslategray",
				"#F0FFFF": "azure",
				"#FFFFFF": "white",
				"#D3D3D3": "lightgray",
				"#A9A9A9": "darkgray",
				"#696969": "dimgray",
				"#000000": "black"
			},
			NAME_COLORS_TO_RGB_MAP: {
				"gold": "#FFB200",
				"darkorange": "#FF8C00",
				"indianred": "#CD5C5C",
				"darkmagenta": "#8B008B",
				"cornflowerblue": "#6495ED",
				"deepskyblue": "#00BFFF",
				"darkcyan": "#008B8B",
				"olivedrab": "#6B8E23",
				"darkslategray": "#2F4F4F",
				"azure": "#F0FFFF",
				"white": "#FFFFFF",
				"lightgray": "#D3D3D3",
				"darkgray": "#A9A9A9",
				"dimgray": "#696969",
				"black": "#000000"
			},

			/**
			 * Returns a named color for given color. For example - "gold" for input "#FFB200".
			 * @param {string} sColor the given color
			 * @return {string|undefined} The named color, if such can really corresponds to the input color, or undefined otherwise.
			 */
			getNamedColor: function (sColor) {
				var sHexColor = "";

				if (!sColor || sColor.toLowerCase().indexOf("hsl") !== -1) {
					return undefined;
				}

				// named color
				if (sColor.indexOf("#") === -1) {
					return this.NAME_COLORS_TO_RGB_MAP[sColor.toLowerCase()] ? sColor.toLowerCase() : undefined;
				}

				//HEX value
				if (sColor.length === 4) {
					sHexColor = ["#", sColor[1], sColor[1], sColor[2], sColor[2], sColor[3], sColor[3]].join("");
				} else {
					sHexColor = sColor;
				}

				sHexColor = sHexColor.toUpperCase();

				return this.RGB_TO_NAMED_COLORS_MAP[sHexColor];
			}
		};

		return ColorPalette;
	}
);
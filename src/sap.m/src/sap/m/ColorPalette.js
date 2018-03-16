/*!
 * ${copyright}
 */

// Provides control sap.m.ColorPalette
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/base/DataType',
	'sap/ui/core/CSSColor',
	'sap/ui/core/delegate/ItemNavigation',
	'./Button',
	'./Dialog',
	'./library',
	'./ColorPaletteRenderer'
], function(
	Control,
	Device,
	DataType,
	CSSColor,
	ItemNavigation,
	Button,
	Dialog,
	library,
	ColorPaletteRenderer
	) {
		"use strict";

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
		 * wrapper control <code>sap.m.ColorPalettePopover<code>).
		 * @see {sap.m.ColorPalettePopover}
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

			// Reference to the dialog containing the internal "Color Picker". For private use.
			this._oMoreColorsDialog = null;

			// Reference to the item navigation
			this._oItemNavigation = null;
		};

		ColorPalette.prototype.exit = function () {
			if (this._oMoreColorsDialog) {
				this._oMoreColorsDialog.destroy();
				delete this._oMoreColorsDialog;
			}

			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				delete this._oItemNavigation;
			}
		};

		ColorPalette.prototype.setColors = function (aColors) {
			aColors = this.validateProperty("colors", aColors);

			if (aColors.length < MIN_COLORS || aColors.length > MAX_COLORS) {
				throw new Error("Cannot set property 'colors' - array must has minimum 2 and maximum 15 elements");
			}
			return this.setProperty("colors", aColors);
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
			var bOnDefaultColorButton = this._getShowDefaultColorButton() && jQuery.sap.containsOrEquals(oEvent.target, this._getDefaultColorButton().getDomRef()),
				bOnMoreColorsButton = this._getShowMoreColorsButton() && jQuery.sap.containsOrEquals(oEvent.target, this._getMoreColorsButton().getDomRef());

			if (bOnMoreColorsButton) {
				this.fireEvent("_colorNotSelected", {_originalEvent: oEvent});
				return;
			}

			if (bOnDefaultColorButton) {
				this._fireColorSelect(this._getDefaultColor(), true, oEvent);
				return;
			}

			ColorPalette.prototype.ontap.apply(this, arguments);
		};

		ColorPalette.prototype.onsapspace = ColorPalette.prototype.onsapenter = ColorPalette.prototype.ontap;

		ColorPalette.prototype.onAfterRendering = function () {
			this._ensureItemNavigation();
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
		 * @returns {sap.m.ColorPalette} <code>this</code> for method chaining
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
		 * @returns {sap.m.Dialog} the dialog.
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
				contentWidth: Device.system.phone ? "" : "29rem", /* magic number, otherwise ColorPicker gets to much of height*/
				stretch: !!Device.system.phone,
				title: oLibraryResourceBundle.getText("COLOR_PALETTE_MORE_COLORS_TITLE")
			});

			this._ensureUnifiedLibrary();

			// keep explicit reference to the picker attached to the parent dialog
			oDialog.addContent(oDialog._oColorPicker = new ColorPicker({
				mode: ColorPickerMode.HSL
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
			var oFirstSwatchElement = this._getShowDefaultColorButton() ? this._getDefaultColorButton().getDomRef() : this._getAllSwatches()[0];

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
		};

		/**
		 * Handles creation or update of the ItemNavigation.
		 * @private
		 */
		ColorPalette.prototype._ensureItemNavigation = function () {
			var aDomRefs = [],
				oDefaultButton = this._getDefaultColorButton(),
				oMoreColorsButton = this._getMoreColorsButton();

			if (!this._oItemNavigation) {
				this._oItemNavigation = new ItemNavigationHomeEnd(this);
				this.addDelegate(this._oItemNavigation);
			}

			// "default color" button if such
			if (oDefaultButton && oDefaultButton.getVisible()) {
				aDomRefs.push(oDefaultButton.getDomRef());
			}

			// all currently available swatches
			aDomRefs = aDomRefs.concat(this._getAllSwatches());

			// "more colors" button if such
			if (oMoreColorsButton && oMoreColorsButton.getVisible()) {
				aDomRefs.push(oMoreColorsButton.getDomRef());
			}

			this._oItemNavigation.setRootDomRef(this.getDomRef());
			this._oItemNavigation.setItemDomRefs(aDomRefs);
		};


		// DOM related private helpers

		/**
		 * Returns all swatches/squares
		 * @returns [Element[]]
		 * @private
		 */
		ColorPalette.prototype._getAllSwatches = function () {
			return this.$().find("." + CSS_CLASS_SWATCH).get();
		};

		/**
		 * Extension of <code>sap.ui.core.delegate.ItemNavigation</code> to support custom [home] and [end] keyboard handling.
		 * @private
		 */
		var ItemNavigationHomeEnd = ItemNavigation.extend("sap.ui.core.delegate.ItemNavigation", {
			constructor: function (oColorPalette) {
				ItemNavigation.apply(this);
				this._oColorPalette = oColorPalette;
			}
		});

		/**
		 * Handles keyboard [HOME] & [END] keys, where:
		 * - [HOME] moves to the first color swatch item in the current row, unless the focus is outside the swatch container
		 * - [END] moves to the last color swatch item in the current row, unless the focus is outside the swatch container
		 * @param oEvent
		 */
		ItemNavigationHomeEnd.prototype._onHomeEnd = function (oEvent) {
			var iCurrentSwatchIndex,
				iNewSwatchIndex,
				$AllSwatches,
				bHome = oEvent.type === "saphome";

			if (!jQuery(oEvent.target).hasClass(CSS_CLASS_SWATCH)) {
				return;
			}

			//We take care, so nobody else should be bothered
			oEvent.preventDefault();
			oEvent.stopPropagation();

			iCurrentSwatchIndex = jQuery(oEvent.target).index();
			$AllSwatches = this._oColorPalette._getAllSwatches();

			iNewSwatchIndex = this._calcIndexOfBorderSwatch(bHome, iCurrentSwatchIndex, $AllSwatches.length);

			$AllSwatches[iNewSwatchIndex].focus();
		};

		ItemNavigationHomeEnd.prototype.onsaphome = ItemNavigationHomeEnd.prototype.onsapend = ItemNavigationHomeEnd.prototype._onHomeEnd;

		/**
		 * Calculates the index of the first/last color swatch item in the current row of items.
		 * @param {boolean} bHome the direction. If true, the index of the first color swatch item in the row will be returned,
		 * otherwise - the last swatch index in the row will be returned.
		 * @param {int} iCurrentSwatchIndex the index(zero based) of the current swatch
		 * @param {int} iSwatchesCount the total amount of available swatch items
		 * @return {int} the index(zero based) of the first/last swatch item in the row.
		 * @private
		 */
		ItemNavigationHomeEnd.prototype._calcIndexOfBorderSwatch = function (bHome, iCurrentSwatchIndex, iSwatchesCount) {
			var iIndex;

			if (bHome) {
				iIndex = Math.floor(iCurrentSwatchIndex / SWATCHES_PER_ROW) * SWATCHES_PER_ROW;
			} else {
				iIndex = Math.floor(iCurrentSwatchIndex / SWATCHES_PER_ROW) * SWATCHES_PER_ROW + (SWATCHES_PER_ROW - 1);
				if (iIndex > iSwatchesCount) {
					iIndex = iSwatchesCount - 1;
				}
			}
			return iIndex;
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
			 * @param sColor
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

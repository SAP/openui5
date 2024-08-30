/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ColorPalettePopover
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	"sap/ui/core/Lib",
	'sap/ui/unified/ColorPickerDisplayMode',
	'./Button',
	'./ResponsivePopover',
	'./ColorPalette',
	'./library'
], function(
	Control,
	Device,
	Library,
	ColorPickerDisplayMode,
	Button,
	ResponsivePopover,
	ColorPalette,
	library
) {
		"use strict";

		// shortcut for PlacementType
		var PlacementType = library.PlacementType;

		/**
		 * Constructor for a new <code>ColorPalettePopover</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A thin wrapper over {@link sap.m.ColorPalette} allowing the latter to be used in a popover.
		 *
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @public
		 * @since 1.54
		 * @alias sap.m.ColorPalettePopover
		 */
		var ColorPalettePopover = Control.extend("sap.m.ColorPalettePopover", /** @lends sap.m.ColorPalettePopover.prototype */ {
			metadata: {
				library: "sap.m",

				properties: {

					/**
					 * The color, which the app developer will receive when end-user chooses the "Default color" button.
					 * See event {@link #event:colorSelect colorSelect}.
					 */
					defaultColor: {type: "sap.ui.core.CSSColor", group: "Appearance", defaultValue: null},

					/**
					 * Defines the list of colors displayed in the palette. Minimum is 2 colors, maximum is 15 colors.
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
					},

					/**
					 * The last selected color in the ColorPalette.
					 * @since 1.122
					 * @experimental Since 1.122, this property is in a beta state.
					 */
					selectedColor: { type: "sap.ui.core.CSSColor", defaultValue: null },

					/**
					 * Indicates if the button for default color selection is available.
					 */
					showDefaultColorButton: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Whether the popover shows a "More colors..." button that opens an additional color picker
					 * for the user to choose specific colors, not present in the predefined range.
					 */
					showMoreColorsButton: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Indicates if the Recent Colors section is available
					 * @since 1.74
					 */
					showRecentColorsSection: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Determines the <code>displayMode</code> of the <code>ColorPicker</code> among three types - Default, Large and Simplified
					 * @since 1.70
					 */
					displayMode : {type: "sap.ui.unified.ColorPickerDisplayMode", group : "Appearance", defaultValue : ColorPickerDisplayMode.Default}
				},

				events: {
					/**
					 * Fired when the user selects a color.
					 */
					colorSelect: {
						parameters: {
							/**
							 * The selected color value.
							 */
							"value": {type: "sap.ui.core.CSSColor"},
							/**
							 * Denotes if the color has been chosen by selecting the "Default Color" button (true or false).
							 */
							"defaultAction": {type: "boolean"}
						}
					},
					/**
					 * Fired when the value is changed by user interaction in the internal ColorPicker of the ColorPalette
					 *
					 * @since 1.85
					 */
					liveChange: {
						parameters : {

							/**
							 * Parameter containing the RED value (0-255).
							 */
							r : {type: "int"},

							/**
							 * Parameter containing the GREEN value (0-255).
							 */
							g : {type: "int"},

							/**
							 * Parameter containing the BLUE value (0-255).
							 */
							b : {type: "int"},

							/**
							 * Parameter containing the HUE value (0-360).
							 */
							h : {type: "int"},

							/**
							 * Parameter containing the SATURATION value (0-100).
							 */
							s : {type: "int"},

							/**
							 * Parameter containing the VALUE value (0-100).
							 */
							v : {type: "int"},

							/**
							 * Parameter containing the LIGHTNESS value (0-100).
							 */
							l : {type: "int"},

							/**
							 * Parameter containing the Hexadecimal string (#FFFFFF).
							 */
							hex : {type: "string"},

							/**
							 * Parameter containing the alpha value (transparency).
							 */
							alpha : {type: "string"}
						}
					}
				}
			},
			renderer: {
				apiVersion: 2
			}
		});

		// get resource translation bundle;
		var oLibraryResourceBundle = Library.getResourceBundleFor("sap.m");

		/**
		 * Keeps reference to all API properties and/or methods that are about to be forwarded to either a
		 * <code>ColorPalette</code> or <code>Popover</code>. The value contains the name of the method at the target
		 * instance. If empty, then the key is used as target name.
		 */
		var FORWARDABLE = {
			COLOR_PALETTE_PROPS: {
				colors: "setColors",
				selectedColor: "setSelectedColor",
				defaultColor: "_setDefaultColor",
				showDefaultColorButton: "_setShowDefaultColorButton",
				showMoreColorsButton: "_setShowMoreColorsButton",
				showRecentColorsSection: "_setShowRecentColorsSection",
				displayMode: "_setDisplayMode"
			},
			POPOVER_METHODS: {
				getDomRef: "",
				close: "",
				openBy: ""
			}
		};

		ColorPalettePopover.prototype.init = function () {
			// Reference to the popover containing the internal "Color Palette". For private use
			this._oPopover = null;

			// We don't use the unofficial ManagedObject.prototype._bIsBeingDestroyed, but the official API method #exit
			this._bPopoverDestroying = null;
		};

		ColorPalettePopover.prototype.exit = function () {
			this._bPopoverDestroying = true;

			if (this._oPopover) {
				this._oPopover.removeDelegate(this._oPopover._onAfterRenderingDelegate);
				this._oPopover.destroy();
				this._oPopover = null;
			}
		};

		/**
		 * Opens the <code>ColorPalettePopover</code>.
		 *
		 * On table or desktop devices, the popover is positioned relative to the given <code>oControl</code>
		 * parameter. On phones, it is shown full screen, the <code>oControl</code> parameter is ignored.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *    When displayed on a tablet or desktop device, the <code>ColorPalettePopover</code> is positioned
		 *    relative to this control
		 * @returns {sap.ui.core.Control}
		 *    Reference to the opened control
		 * @public
		 * @name sap.m.ColorPalettePopover#openBy
		 * @function
		 */


		/**
		 * Closes the <code>ColorPalettePopover</code>.
		 *
		 * @name sap.m.ColorPalettePopover#close
		 * @function
		 * @returns {sap.ui.core.Control} Reference to the closed control
		 * @public
		 */

		/**
		 * Sets a selected color for the ColorPicker control.
		 *
		 * @param {sap.ui.core.CSSColor} color the selected color
		 * @public
		 * @returns {this} <code>this</code> for method chaining
		 */
		ColorPalettePopover.prototype.setColorPickerSelectedColor = function (color) {
			this._getPalette().setColorPickerSelectedColor(color);

			return this;
		};

		// Private methods -------------------------------------------------------------------------------------------
		ColorPalettePopover.prototype._getPalette = function () {
			return this._ensurePopover().getContent()[0];
		};

		/**
		 * Ensure a popover wrapping the ColorPalette exists (creates new if is not created yet).
		 * @returns {sap.m.ResponsivePopover} the popover.
		 * @private
		 */
		ColorPalettePopover.prototype._ensurePopover = function () {
			if (!this._oPopover) {
				this._oPopover = this._createPopover();
			}

			return this._oPopover;
		};

		/**
		 * Creates a popover that wraps the ColorPalette.
		 *
		 * @returns {sap.m.ResponsivePopover} the popover containing the ColorPalette.
		 * @private
		 */
		ColorPalettePopover.prototype._createPopover = function () {
			var oPopover,
				oColorPalette = this._createColorPalette(),
				oDelegate;

			oPopover = new ResponsivePopover(this.getId() + "-colorPalettePopover", {
				showHeader: Device.system.phone,
				placement: PlacementType.VerticalPreferredBottom,
				showArrow: false,
				showCloseButton: false,
				title: oLibraryResourceBundle.getText("COLOR_PALETTE_TITLE"),
				content: oColorPalette,
				afterOpen: oColorPalette._focusSelectedElement.bind(oColorPalette)

			}).addStyleClass("sapMColorPaletteContainer");

			// cancel button for phones
			if (Device.system.phone) {
				oPopover.setEndButton(new Button({
					text: oLibraryResourceBundle.getText("COLOR_PALETTE_CANCEL"),
					press: function () {
						oPopover.close();
					}
				}));
			}

			// there should be only one popover at a time, so make sure we close the current when ColorPalette opens its own
			oColorPalette.attachEvent("_beforeOpenColorPicker", function () {
				oPopover.close();
			});

			// if the end-user navigated out of the palette without selecting a color
			oColorPalette.attachEvent("_colorNotSelected", function (oEvent) {
				this._handleNextOrPreviousUponPaletteClose(oEvent);
				oPopover.close();
			}.bind(this));

			// when color is selected in the ColorPalette, we close the popover, update the selected color, and notify the app developer
			oColorPalette.attachEvent("colorSelect", function (oEvent) {
				this._handleNextOrPreviousUponPaletteClose(oEvent);
				oPopover.close();
				const sColor = oEvent.getParameter("value");
				this.setSelectedColor(sColor);
				this.fireColorSelect({
					"value": sColor,
					"defaultAction": oEvent.getParameter("defaultAction")
				});
			}.bind(this));


			// aria requirements for the popover implemented as delegate
			oDelegate = {
				onAfterRendering: function () {
					var $Popover = this.$(); //this is bound to the popover, see below
					$Popover.attr("aria-modal", "true");
					$Popover.attr("aria-label", this.getTitle());
				}
			};

			oPopover.addEventDelegate(oDelegate, oPopover);
			oPopover._onAfterRenderingDelegate = oDelegate; // shortcut for quick access

			return oPopover;
		};

		/**
		 * Creates a ColorPalette that reflects the current API properties for colors,
		 * defaultColor, showDefaultColorButton, showMoreColors button.
		 *
		 * @returns {sap.m.ColorPalette} the ColorPalette.
		 * @private
		 */
		ColorPalettePopover.prototype._createColorPalette = function () {
			var oColorPalette = new ColorPalette(this.getId() + "-palette", {
				liveChange: function (oEvent) {
					this.fireLiveChange(oEvent.getParameters());
				}.bind(this)
			});

			oColorPalette._setShowDefaultColorButton(this.getShowDefaultColorButton());
			oColorPalette._setShowMoreColorsButton(this.getShowMoreColorsButton());
			oColorPalette._setShowRecentColorsSection(this.getShowRecentColorsSection());

			return oColorPalette;
		};

		/**
		 * Should be called once the ColorPalette is closed to determine if the TAB/SHIFT+TAB should be prevented or not.
		 *
		 * @param {sap.ui.base.Event} oEvent
		 * @private
		 */
		ColorPalettePopover.prototype._handleNextOrPreviousUponPaletteClose = function (oEvent) {
			var oOriginalEvent = oEvent.getParameter("_originalEvent");

			if (!oOriginalEvent) {
				return;
			}

			if (oOriginalEvent.type === "saptabnext" || oOriginalEvent.type === "saptabprevious") {
				oOriginalEvent.stopPropagation();
				oOriginalEvent.preventDefault();
			}
		};

		//proxy properties to the ColorPalette's content
		ColorPalettePopover.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			var sTargetMethodName;

			if (FORWARDABLE.COLOR_PALETTE_PROPS[sPropertyName] !== undefined) {
				sTargetMethodName = FORWARDABLE.COLOR_PALETTE_PROPS[sPropertyName] || sPropertyName;
				ColorPalette.prototype[sTargetMethodName].call(this._getPalette(), oValue);
			}

			return Control.prototype.setProperty.apply(this, arguments);
		};

		//proxy methods to the popover's content
		Object.keys(FORWARDABLE.POPOVER_METHODS).forEach(function (sSourceName) {
			var sTargetMethodName = FORWARDABLE.COLOR_PALETTE_PROPS[sSourceName] || sSourceName;

			ColorPalettePopover.prototype[sSourceName] = function () {
				if (this._bPopoverDestroying) {
					return null;
				}
				var oPopover = this._ensurePopover();
				return oPopover[sTargetMethodName].apply(oPopover, arguments);
			};
		});

		return ColorPalettePopover;
	});


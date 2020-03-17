/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ColorPalettePopover
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/unified/ColorPickerDisplayMode',
	'./Button',
	'./ResponsivePopover',
	'./ColorPalette',
	'./library'
], function (
	Control,
	Device,
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
		 *
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
		 * @constructor
		 * @public
		 * @since 1.54
		 * @alias sap.m.ColorPalettePopover
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ColorPalettePopover = Control.extend("sap.m.ColorPalettePopover", /** @lends sap.m.ColorPalettePopover.prototype */ {
			metadata: {
				library: "sap.m",
				publicMethods: ["openBy", "close"],
				properties: {

					/**
					 * The color, which the app developer will receive when end-user chooses the "Default color" button.
					 * See event {@link #event:colorSelect colorSelect}.
					 */
					defaultColor: {type: "sap.ui.core.CSSColor", group: "Appearance", defaultValue: null},

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
					},

					/**
					 * Indicates if the button for default color selection is available.
					 */
					showDefaultColorButton: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Denotes if the color has been chosen by selecting the "Default Color" button (true or false)
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
							 * The color that is returned when user chooses the "Default Color" button.
							 */
							"value": {type: "sap.ui.core.CSSColor"},
							/**
							 * Denotes if the color has been chosen by selecting the "Default Color" button (true or false).
							 */
							"defaultAction": {type: "boolean"}
						}
					}
				}
			},
			renderer: {
				apiVersion: 2
			}
		});

		// get resource translation bundle;
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		/**
		 * Keeps reference to all API properties and/or methods that are about to be forwarded to either a
		 * <code>ColorPalette</code> or <code>Popover</code>. The value contains the name of the method at the target
		 * instance. If empty, the the key is used as target name.
		 */
		var FORWARDABLE = {
			COLOR_PALETTE_PROPS: {
				colors: "setColors",
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
		 * The popover is positioned relative to the control parameter on tablet or desktop and is full screen on phone.
		 * Therefore the control parameter is only used on tablet or desktop and is ignored on phone.
		 *
		 * @param {Object} openBy When this control is displayed on tablet or desktop, the <code>ColorPalettePopover</code>
		 * is positioned relative to this control
		 * @returns {Object} Reference to the opening control
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */


		/**
		 * Closes the <code>ColorPalettePopover</code>.
		 *
		 * @name sap.m.ColorPalettePopover#close
		 * @function
		 * @type sap.ui.core.Control
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */


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
		 * @return {sap.m.ResponsivePopover} the popover containing the ColorPalette.
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
				afterOpen: oColorPalette._focusFirstElement.bind(oColorPalette)

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

			// when color is selected in the ColorPalette, we close the popover and notify the app. developer
			oColorPalette.attachEvent("colorSelect", function (oEvent) {
				this._handleNextOrPreviousUponPaletteClose(oEvent);
				oPopover.close();
				this.fireColorSelect({
					"value": oEvent.getParameter("value"),
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
		 * @return {sap.m.ColorPalette} the ColorPalette.
		 * @private
		 */

		ColorPalettePopover.prototype._createColorPalette = function () {
			var oColorPalette = new ColorPalette(this.getId() + "-palette");

			oColorPalette._setShowDefaultColorButton(this.getShowDefaultColorButton());
			oColorPalette._setShowMoreColorsButton(this.getShowMoreColorsButton());
			oColorPalette._setShowRecentColorsSection(this.getShowRecentColorsSection());

			return oColorPalette;
		};

		/**
		 * Should be called once the ColorPalette is closed to determine if the TAB/SHIFT+TAB should be prevented or not.
		 *
		 * @param oEvent
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


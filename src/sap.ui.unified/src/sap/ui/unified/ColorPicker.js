/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ColorPicker.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/HTML",
	"sap/ui/core/ResizeHandler",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/core/Icon",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/InvisibleText",
	"sap/ui/Device",
	"sap/ui/core/library",
	"./ColorPickerRenderer",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Global"
], function(
	Library,
	Control,
	HTML,
	ResizeHandler,
	Grid,
	GridData,
	VLayout,
	HLayout,
	Icon,
	Parameters,
	InvisibleText,
	Device,
	coreLibrary,
	ColorPickerRenderer,
	Log,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState,
		// shortcut for sap.ui.unified.ColorPickerMode & sap.ui.unified.ColorPickerDisplayMode
		ColorPickerMode = Library.ColorPickerMode,
		ColorPickerDisplayMode = Library.ColorPickerDisplayMode;

	/**
	 * Constructor for a new <code>ColorPicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables the user to select a color.
	 * The color can be defined using HEX, RGB, or HSV values or a CSS color name.
	 *
	 * <b>Note:</b> Keep in mind that this control needs either <code>sap.m</code>
	 * or <code>sap.ui.commons</code> library to be loaded in order to work as
	 * it depends on controls available in one or the other library.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.48.0
	 * @alias sap.ui.unified.ColorPicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColorPicker = Control.extend("sap.ui.unified.ColorPicker", /** @lends sap.ui.unified.ColorPicker.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Determines the input parameter that can be a string of type HEX, RGB, HSV, or a CSS color name:
			 * <ul>
			 * <li>HEX - #FFFFFF</li>
			 * <li>RGB - rgb(255,255,255)</li>
			 * <li>HSV - hsv(360,100,100)</li>
			 * <li>CSS - red</li>
			 * </ul>
			 * <b>Note:</b> The output parameter is an RGB string of the current color.
			 * @since 1.48.0
			 */
			colorString : {type: "string", group : "Misc", defaultValue : null},

			/**
			 * Determines the color mode of the <code>ColorPicker</code>.
			 * @since 1.48.0
			 */
			mode : {type: "sap.ui.unified.ColorPickerMode", group : "Appearance", defaultValue : ColorPickerMode.HSV},

			/**
			 * Determines the display mode of the <code>ColorPicker</code> among three types - Default, Large and Simplified
			 * @since 1.58
			 */
			displayMode : {type: "sap.ui.unified.ColorPickerDisplayMode", group : "Appearance", defaultValue : ColorPickerDisplayMode.Default}
		},
		aggregations: {
			/**
			 * Holds the control layout.
			 * @private
			 * @since 1.48.0
			 */
			_grid: {type: "sap.ui.layout.Grid", group: "Appearance", multiple: false, visibility: "hidden"},

			/**
			 * Holds the control invisible texts.
			 * @private
			 * @since 1.48.0
			 */
			_invisibleTexts: {type: "sap.ui.core.InvisibleText", multiple: true, visibility: "hidden"},

			/*
			 * ColorPickerBox.
			 * All the hidden aggegations from here to the bottom are of type Control because the code also
			 * works in commons.ColorPicker. It could be fixed via separation of the controls.
			 * @private
			 * @since 1.61
			 */
			_oCPBox: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Slider to determine the preferred Hue.
			 * @private
			 * @since 1.61
			 */
			_oSlider: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Alpha slider for transparency regulation of the selected color.
			 * @private
			 * @since 1.61
			 */
			_oAlphaSlider: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Hex's value. For faster and precise color picking.
			 * @private
			 * @since 1.61
			 */
			_oHexField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Red's value.
			 * @private
			 * @since 1.61
			 */
			_oRedField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Green's value.
			 * @private
			 * @since 1.61
			 */
			_oGreenField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Blue's value.
			 * @private
			 * @since 1.61
			 */
			_oBlueField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Hue's value.
			 * @private
			 * @since 1.61
			 */
			_oHueField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Saturation's value.
			 * @private
			 * @since 1.61
			 */
			_oSatField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Lightness's value.
			 * @private
			 * @since 1.61
			 */
			_oLitField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Value's value.
			 * @private
			 * @since 1.61
			 */
			_oValField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Input for the Alpha's value.
			 * We need two fields because of the specific of the design. Both fields should be kept in sync.
			 * @private
			 * @since 1.61
			*/
			_oAlphaField: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},
			_oAlphaField2: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * RadioButtonGroup control.
			 * @private
			 * @since 1.61
			 */
			_oRGBorHSLRBUnifiedGroup: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"},

			/*
			 * Button control.
			 * @private
			 * @since 1.61
			 */
			_oButton: {type: "sap.ui.core.Control", group: "Appearance", multiple: false, visibility: "hidden"}

		},
		events : {

			/**
			 * Fired when the value is changed by user action.
			 *
			 * <b>Note:</b> When the user action is mouse dragging, the
			 * <code>change</code> event fires on the mouseup event.
			 * @since 1.48.0
			 */
			change : {
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
			},

			/**
			 * Fired when the value is changed during the mouse move.
			 *
			 * <b>Note:</b> When the user action is mouse move, the <code>liveChange</code>
			 * event is fired during the mousedown event.
			 * @since 1.48.0
			 */
			liveChange : {
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
	}});

	// variable that will be used for browser specific prefix of the slider background gradient
	// it is set in the init function and is used inside _updateAlphaBackground() function
	var sBrowserPrefix = "",
		// get the background image of the slider
		sBgSrc = sap.ui.resource('sap.ui.unified', 'img/ColorPicker/Alphaslider_BG.png'),
		// get resource bundle
		oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified"),
		// Constants object
		CONSTANTS = {};

	// Create truly immutable constant properties
	Object.defineProperties(CONSTANTS, {
		RGB: {value: "RGB"},
		CPResponsiveClass: {value: "sapUnifiedColorPicker"},
		CPMatrixClass: {value: "sapUiColorPicker-ColorPickerMatrix"},
		HSLClass: {value: "sapUiColorPickerHSL"},
		LabelClass: {value: "sapUiColorPicker-ColorPickerLabels"},
		UnitLabelClass: {value: "sapUiCPUnitLabel"},
		HEXClass: {value: "sapUiColorPicker-ColorPickerHexField"},
		LeftColumnInputClass: {value: "sapUiColorPicker-ColorPickerInputFieldsLeft"},
		RightColumnInputClass: {value: "sapUiColorPicker-ColorPickerInputFieldsRight"},
		SliderClass: {value: "sapUiColorPicker-ColorPickerSlider"},
		AlphaSliderClass: {value: "sapUiColorPicker-ColorPickerAlphaSlider"},
		OutputSelectorClass: {value: "sapUiColorPickerHSL-RB"},
		OutputSelectorRowClass: {value: "sapUiColorPicker-RBRow"},
		CPBoxClass: {value: "sapUiColorPicker-ColorPickerBox"},
		CPCircleClass: {value: "sapUiColorPicker-ColorPickerCircle"},
		LastColumnClass: {value: "sapUiColorPicker-ColorPickerLastColumn"},
		HideForHSVClass: {value: "hideForHSV"},
		HideForHSLClass: {value: "hideForHSL"},
		OldColorClass: {value: "sapUiColorPicker-ColorPickerOldColor"},
		NewColorClass: {value: "sapUiColorPicker-ColorPickerNewColor"},
		SwatchesClass: {value: "sapUiColorPicker-swatches"},
		Colors: {value: {
			aliceblue: 'f0f8ff',
			antiquewhite: 'faebd7',
			aqua: '00ffff',
			aquamarine: '7fffd4',
			azure: 'f0ffff',
			beige: 'f5f5dc',
			bisque: 'ffe4c4',
			black: '000000',
			blanchedalmond: 'ffebcd',
			blue: '0000ff',
			blueviolet: '8a2be2',
			brown: 'a52a2a',
			burlywood: 'deb887',
			cadetblue: '5f9ea0',
			chartreuse: '7fff00',
			chocolate: 'd2691e',
			coral: 'ff7f50',
			cornflowerblue: '6495ed',
			cornsilk: 'fff8dc',
			crimson: 'dc143c',
			cyan: '00ffff',
			darkblue: '00008b',
			darkcyan: '008b8b',
			darkgoldenrod: 'b8860b',
			darkgray: 'a9a9a9',
			darkgrey: 'a9a9a9',
			darkgreen: '006400',
			darkkhaki: 'bdb76b',
			darkmagenta: '8b008b',
			darkolivegreen: '556b2f',
			darkorange: 'ff8c00',
			darkorchid: '9932cc',
			darkred: '8b0000',
			darksalmon: 'e9967a',
			darkseagreen: '8fbc8f',
			darkslateblue: '483d8b',
			darkslategray: '2f4f4f',
			darkslategrey: '2f4f4f',
			darkturquoise: '00ced1',
			darkviolet: '9400d3',
			deeppink: 'ff1493',
			deepskyblue: '00bfff',
			dimgray: '696969',
			dimgrey: '696969',
			dodgerblue: '1e90ff',
			firebrick: 'b22222',
			floralwhite: 'fffaf0',
			forestgreen: '228b22',
			fuchsia: 'ff00ff',
			gainsboro: 'dcdcdc',
			ghostwhite: 'f8f8ff',
			gold: 'ffd700',
			goldenrod: 'daa520',
			gray: '808080',
			grey: '808080',
			green: '008000',
			greenyellow: 'adff2f',
			honeydew: 'f0fff0',
			hotpink: 'ff69b4',
			indianred: 'cd5c5c',
			indigo: '4b0082',
			ivory: 'fffff0',
			khaki: 'f0e68c',
			lavender: 'e6e6fa',
			lavenderblush: 'fff0f5',
			lawngreen: '7cfc00',
			lemonchiffon: 'fffacd',
			lightblue: 'add8e6',
			lightcoral: 'f08080',
			lightcyan: 'e0ffff',
			lightgoldenrodyellow: 'fafad2',
			lightgray: 'd3d3d3',
			lightgrey: 'd3d3d3',
			lightgreen: '90ee90',
			lightpink: 'ffb6c1',
			lightsalmon: 'ffa07a',
			lightseagreen: '20b2aa',
			lightskyblue: '87cefa',
			lightslategray: '778899',
			lightslategrey: '778899',
			lightsteelblue: 'b0c4de',
			lightyellow: 'ffffe0',
			lime: '00ff00',
			limegreen: '32cd32',
			linen: 'faf0e6',
			magenta: 'ff00ff',
			maroon: '800000',
			mediumaquamarine: '66cdaa',
			mediumblue: '0000cd',
			mediumorchid: 'ba55d3',
			mediumpurple: '9370db',
			mediumseagreen: '3cb371',
			mediumslateblue: '7b68ee',
			mediumspringgreen: '00fa9a',
			mediumturquoise: '48d1cc',
			mediumvioletred: 'c71585',
			midnightblue: '191970',
			mintcream: 'f5fffa',
			mistyrose: 'ffe4e1',
			moccasin: 'ffe4b5',
			navajowhite: 'ffdead',
			navy: '000080',
			oldlace: 'fdf5e6',
			olive: '808000',
			olivedrab: '6b8e23',
			orange: 'ffa500',
			orangered: 'ff4500',
			orchid: 'da70d6',
			palegoldenrod: 'eee8aa',
			palegreen: '98fb98',
			paleturquoise: 'afeeee',
			palevioletred: 'db7093',
			papayawhip: 'ffefd5',
			peachpuff: 'ffdab9',
			peru: 'cd853f',
			pink: 'ffc0cb',
			plum: 'dda0dd',
			powderblue: 'b0e0e6',
			purple: '800080',
			red: 'ff0000',
			rosybrown: 'bc8f8f',
			royalblue: '4169e1',
			saddlebrown: '8b4513',
			salmon: 'fa8072',
			sandybrown: 'f4a460',
			seagreen: '2e8b57',
			seashell: 'fff5ee',
			sienna: 'a0522d',
			silver: 'c0c0c0',
			skyblue: '87ceeb',
			slateblue: '6a5acd',
			slategray: '708090',
			slategrey: '708090',
			snow: 'fffafa',
			springgreen: '00ff7f',
			steelblue: '4682b4',
			tan: 'd2b48c',
			teal: '008080',
			thistle: 'd8bfd8',
			tomato: 'ff6347',
			turquoise: '40e0d0',
			violet: 'ee82ee',
			wheat: 'f5deb3',
			white: 'ffffff',
			whitesmoke: 'f5f5f5',
			yellow: 'ffff00',
			yellowgreen: '9acd32',
			transparent: '00000000'
		}}
	});

	/**
	 * Initialization hook creating composite parts.
	 */
	ColorPicker.prototype.init = function() {
		// set gradient prefix depending of the browser
		if (Device.browser.firefox) {
			sBrowserPrefix = "-moz-linear-gradient";
		} else if (Device.browser.msie) {
			sBrowserPrefix = "-ms-linear-gradient";
		} else if (Device.browser.webkit) {
			sBrowserPrefix = "-webkit-linear-gradient";
		} else {
			sBrowserPrefix = "linear-gradient";
		}

		// declare global variable for the ColorObject
		this.Color = {
				r: 255,
				g: 255,
				b: 255,
				h: 0,
				s: 0,
				l: 100,
				v: 100,
				a: 1,
				oldA: 1,
				hex: "#ffffff",
				old: "#ffffff"
		};

		// create global variables
		this.sHexString = "ffffff";
		this.$CPBox = null;
		this.$CPCur = null;
		this.RGB = {r: 0, g: 0, b: 0};

		// check if we are in RTL mode
		this.bRtl = sap.ui.getCore().getConfiguration().getRTL();

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		// Get if control should be in responsive mode
		this.bResponsive = Library.ColorPickerHelper.isResponsive();

		// Color picker cursor size in px obtained from less parameter. Keep in mind width and height are the same.
		var circleSize = this.bResponsive ? "_sap_ui_unified_ColorPicker_CircleSize" : "_sap_ui_commons_ColorPicker_CircleSize";
		this._iCPCursorSize = parseInt(Parameters.get(circleSize));

		// Init _processChanges and _bHSLMode according to default control mode
		this._processChanges = this._processHSVChanges;
		this._bHSLMode = false;

		if (this.getDisplayMode() === ColorPickerDisplayMode.Simplified) {
			CONSTANTS.HideForDisplay.value = ".hideDisplay";
		}

		this.bPressed = false;
	};

	/**
	 * Internal <code>ColorPickerBox</code> control.
	 */
	var ColorPickerBox = Control.extend("sap.ui.unified._ColorPickerBox", {
		metadata: {
			events: {
				/**
				 * Fired on interaction with the <code>ColorPickerBox</code>.
				 */
				select: {
					parameters: {
						value: {type: "int"},
						saturation: {type: "int"}
					}
				},
				/**
				 * Fired on size change of the <code>ColorPickerBox</code>.
				 */
				resize: {
					parameters: {
						size: {type: "int"}
					}
				}
			}
		},
		init: function() {
			this.bRtl = sap.ui.getCore().getConfiguration().getRTL();
		},
		exit: function() {
			if (this._sResizeListener) {
				ResizeHandler.deregister(this._sResizeListener);
			}
		},
		/**
		 * @returns {int} Width of the rendered control
		 */
		getWidth: function() {
			return this.$().width();
		},
		/**
		 * @returns {object} jQuery object containing the offset coordinates of the control
		 */
		getOffset: function() {
			return this.$().offset();
		},
		onBeforeRendering: function() {
			if (this._sResizeListener) {
				ResizeHandler.deregister(this._sResizeListener);
			}
		},
		onAfterRendering: function() {
			this._handle = this.$().find("> div." + CONSTANTS.CPCircleClass);

			// Attach resize listener
			this._sResizeListener = ResizeHandler.register(this.getDomRef(), this.handleResize.bind(this));
		},
		/**
		 * Updates cached <code>ColorPickerBox</code> size so that it's not needed
		 * to calculate box width/height on every cursor move.
		 *
		 * <b>Note:</b> Keep in mind that the <code>ColorPickerBox</code> width
		 * and height should always be equal.
		 * @param {object} oEvent event
		 */
		handleResize: function(oEvent) {
			this.fireResize({size: oEvent.size.width});
		},
		/**
		 * @returns {object} DOM reference of the handle
		 */
		getHandle: function() {
			return this._handle;
		},
		/**
		 * Called when touch/mouse interaction starts.
		 * @override
		 * @param {object} oEvent event object
		 */
		ontouchstart: function(oEvent) {
			// React on first touch|click event
			this.handleTouch(oEvent);
		},
		/**
		 * Called when touch/mouse interaction ends.
		 * @override
		 * @param {object} oEvent event object
		 */
		ontouchend: function(oEvent) {
			// React on the last position of the handle
			this.handleTouch(oEvent);
		},
		/**
		 * Called during touch/mouse drag interaction.
		 * @override
		 * @param {object} oEvent event object
		 */
		ontouchmove: function(oEvent) {
			this.handleTouch(oEvent);
		},
		/**
		 * Handles touch/click/mouse drag interaction.
		 * @param {object} oEvent event object
		 */
		handleTouch: function(oEvent) {
			var oValues = this.calculateValuesFromEvent(oEvent);
			// Fire event if calculation is ok so ColorPicker control can react to the interaction
			if (oValues) {
				this.fireSelect(oValues);
			}
		},
		/**
		 * Calculates the <code>value</code> and <code>saturation</code> from event XY coordinates related to the
		 * <code>ColorPickerBox</code> coordinates.
		 * @param {object} oEvent event object
		 * @returns {object|false} with 'value' and 'saturation' properties
		 */
		calculateValuesFromEvent: function(oEvent) {
			var iX = oEvent.offsetX,
				iY = oEvent.offsetY,
				iBoxHeight,
				// Keep in mind that box width and height should be equal on all screen sizes
				iBoxWidth = iBoxHeight = this.getWidth(),
				oEventPosition,
				oOffset;

			// Prevent default to eliminate scrolling while someone uses the color picker box
			oEvent.preventDefault && oEvent.preventDefault();

			// If no control offset is available try to get touch event position
			if (!iX) {
				oEventPosition = oEvent.targetTouches ? oEvent.targetTouches[0] : oEvent;

				// get the event position for tap/touch/click events
				if (!oEventPosition || !oEventPosition.pageX) { // desktop fallback
					oEventPosition = oEvent;
					if ((!oEventPosition || !oEventPosition.pageX) && oEvent.changedTouches) { // touchend fallback
						oEventPosition = oEvent.changedTouches[0];
					}
				}

				// if an event position is not present we don't continue
				if (!oEventPosition.pageX) {
					return false;
				}

				// Calculate interaction point based on control->page offset
				oOffset = this.getOffset();
				iX = oEventPosition.pageX - oOffset.left;
				iY = oEventPosition.pageY - oOffset.top;

			}

			// Keep handle position always in range 0..iBox{Width|Height} for both X and Y coordinates
			iX = Math.min(Math.max(iX, 0), iBoxWidth);
			iY = Math.min(Math.max(iY, 0), iBoxHeight);

			// Handle RTL mode
			if (this.bRtl) {
				iX = iBoxWidth - iX;
			}

			return {
				value: iX / iBoxWidth * 100,
				saturation: (1 - iY / iBoxHeight) * 100
			};
		},
		renderer: function(oRm, oControl) {
			// Control container div
			oRm.write("<div");
			oRm.addClass(CONSTANTS.CPBoxClass);
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");

			// Handle
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-cpCur");
			oRm.addClass(CONSTANTS.CPCircleClass);
			oRm.writeClasses();
			oRm.write("></div>");

			// Close control container div
			oRm.write("</div>");
		}
	});

	/**
	 * Create input with label and unit measures label as a suffix after the input fields.
	 * @param {Input} oInput control
	 * @param {string} sTooltipID text id from resource bundle
	 * @param {string} sLabelText title label text
	 * @param {string} [sUnit=undefined] Unit of measure
	 * @returns{sap.ui.layout.HorizontalLayout} Holding the input control and the label's
	 * @private
	 */
	ColorPicker.prototype._createRowFromInput = function(oInput, sTooltipID, sLabelText, sUnit) {
		var sTooltip = oRb.getText(sTooltipID),
			oHL;

		// Create horizontal layout
		oHL = new HLayout({
			content: [
				// Label
				Library.ColorPickerHelper.factory.createLabel({
					text: sLabelText,
					tooltip: sTooltip,
					labelFor: oInput
				}).addStyleClass(CONSTANTS.LabelClass),
				// Input
				oInput.setTooltip(sTooltip)
			]
		});

		// Manage unit label
		if (sUnit) {
			oHL.addContent(Library.ColorPickerHelper.factory.createLabel({text: sUnit, labelFor: oInput})
				.addStyleClass(CONSTANTS.UnitLabelClass)
				.addStyleClass(CONSTANTS.LabelClass)
			);
		}

		return oHL;
	};

	/**
	 * Updates the <code>colorString</code> property and fires the <code>change</code> and <code>liveChange</code> events.
	 * @param {boolean} [bFireChange=false] If <code>change</code> event should be fired on this update
	 * @param {boolean} [bFireLiveChange=false] if <code>liveChange</code> event should be fired on this update
	 * @private
	 */
	ColorPicker.prototype._updateColorStringProperty = function(bFireChange, bFireLiveChange) {
		var sRGBString = this._getCSSColorString();
		this.setProperty('colorString', sRGBString, true);
		if (bFireLiveChange) {
			this.fireLiveChange({
				r: this.Color.r,
				g: this.Color.g,
				b: this.Color.b,
				h: this.Color.h,
				s: this.Color.s,
				v: this.Color.v,
				l: this.Color.l,
				alpha: this.Color.a,
				hex: this.Color.hex,
				formatHSL: this.Color.formatHSL,
				colorString: sRGBString
			});
		}
		if (bFireChange) {
			this.fireChange({
				r: this.Color.r,
				g: this.Color.g,
				b: this.Color.b,
				h: this.Color.h,
				s: this.Color.s,
				v: this.Color.v,
				l: this.Color.l,
				alpha: this.Color.a,
				hex: this.Color.hex,
				formatHSL: this.Color.formatHSL,
				colorString: sRGBString
			});
		}
	};

	/**
	 * Handles the internal <code>ColorPickerBox</code> select event.
	 * @param {object} oEvent event object
	 * @private
	 */
	ColorPicker.prototype._handleCPBoxSelectEvent = function(oEvent) {
		var valValue = oEvent.getParameter("value"),
			satValue = oEvent.getParameter("saturation");

		this.oSatField.setValue(satValue);

		if (this._bHSLMode) {
			this.oLitField.setValue(valValue);
		} else {
			this.oValField.setValue(valValue);
		}

		this._processChanges();
		this._updateColorStringProperty(false, true);
	};

	/**
	 * Handles the internal <code>ColorPickerBox</code> resize event.
	 * @param {object} oEvent event object
	 * @private
	 */
	ColorPicker.prototype._handleCPBoxResizeEvent = function(oEvent) {
		this._iCPBoxSize = oEvent.getParameter("size");
		this._updateCursorPosition();
	};

	/**
	 * Handles the internal <code>ColorPickerBox</code> <code>onTouchEnd</code> event.
	 * @param {object} oEvent event object
	 * @private
	 */
	ColorPicker.prototype._handleCPBoxTouchEndEvent = function(oEvent) {
		this._updateColorStringProperty(true, false);
	};

	/**
	 * Creates all internal interaction controls needed for displaying the <code>ColorPicker</code>.
	 * @private
	 */
	ColorPicker.prototype._createInteractionControls = function() {
		var sId = this.getId();

		// Create the internal ColorPickerBox control
		this.oCPBox = new ColorPickerBox(sId + "-cpBox", {
			// Attach to the select event
			select: this._handleCPBoxSelectEvent.bind(this),
			// Attach to the resize event
			resize: this._handleCPBoxResizeEvent.bind(this)
		});

		// Execute after ColorPickerBox "ontouchend" event so we can handle local ColorPicker events
		this.oCPBox.addDelegate({
			ontouchend: this._handleCPBoxTouchEndEvent.bind(this)
		});

		this.oHexField = Library.ColorPickerHelper.factory.createInput(sId + "-hxF", {
			value: this.Color.hex.substr(1),
			change: this._handleHexValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_HEX")
		}).addStyleClass(CONSTANTS.HEXClass);


		this.oRedField = Library.ColorPickerHelper.factory.createInput(sId + "-rF", {
			value: this.Color.r,
			change: this._handleRedValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_RED")
		}).addStyleClass(CONSTANTS.LeftColumnInputClass);


		this.oGreenField = Library.ColorPickerHelper.factory.createInput(sId + "-gF", {
			value: this.Color.g,
			change: this._handleGreenValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_GREEN")
		}).addStyleClass(CONSTANTS.LeftColumnInputClass);



		this.oBlueField = Library.ColorPickerHelper.factory.createInput(sId + "-bF", {
			value: this.Color.b,
			change: this._handleBlueValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_BLUE")
		}).addStyleClass(CONSTANTS.LeftColumnInputClass);


		this.oHueField = Library.ColorPickerHelper.factory.createInput(sId + "-hF", {
			value: this.Color.h,
			change: this._handleHueValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_HUE")
		}).addStyleClass(CONSTANTS.RightColumnInputClass);


		this.oSatField = Library.ColorPickerHelper.factory.createInput(sId + "-sF", {
			value: this.Color.s,
			change: this._handleSatValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_SAT") +
				" " + InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_PERCENTAGE")
		}).addStyleClass(CONSTANTS.RightColumnInputClass);


		this.oLitField = Library.ColorPickerHelper.factory.createInput(sId + "-lF", {
			value: this.Color.l,
			change: this._handleLitValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_LIGHTNESS") +
				" " + InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_PERCENTAGE")
		}).addStyleClass(CONSTANTS.RightColumnInputClass).addStyleClass(CONSTANTS.HideForHSVClass);

		// this alpha field is rendered along with R, G, B fields
		this.oAlphaField = Library.ColorPickerHelper.factory.createInput(sId + "-aF", {
			value: this.Color.a,
			change: this._handleAlphaValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_ALPHA")
		}).addStyleClass(CONSTANTS.RightColumnInputClass).addStyleClass(CONSTANTS.HideForHSVClass).addStyleClass("sapUnifiedA");

		// this alpha field is rendered along with H, S, L fields
		this.oAlphaField2 = Library.ColorPickerHelper.factory.createInput(sId + "-aF2", {
			value: this.Color.a,
			change: this._handleAlphaValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_ALPHA")
		}).addStyleClass(CONSTANTS.RightColumnInputClass).addStyleClass(CONSTANTS.HideForHSVClass).addStyleClass("sapUnifiedA");


		this.oValField = Library.ColorPickerHelper.factory.createInput(sId + "-vF", {
			value: this.Color.v,
			change: this._handleValValueChange.bind(this),
			ariaLabelledBy: InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_VALUE")
		}).addStyleClass(CONSTANTS.RightColumnInputClass).addStyleClass(CONSTANTS.HideForHSLClass);


		//Commons RGB|HSL output
		this.oRGBorHSLRBGroup = Library.ColorPickerHelper.factory.createRadioButtonGroup({
			columns: 2,
			buttons: [
				Library.ColorPickerHelper.factory.createRadioButtonItem({text: CONSTANTS.RGB}),
				Library.ColorPickerHelper.factory.createRadioButtonItem({text: Library.ColorPickerMode.HSL})
			],
			select: this._handleRGBorHSLValueChange.bind(this),
			selectedIndex: (this.Color.formatHSL ? 1 : 0 )
		}).addStyleClass(CONSTANTS.OutputSelectorClass);

		// Slider
		this.oHueInvisibleText = new InvisibleText({text: oRb.getText("COLORPICKER_HUE_SLIDER")}).toStatic();
		this.addAggregation("_invisibleTexts", this.oHueInvisibleText, true);
		this.oSlider = Library.ColorPickerHelper.factory.createSlider(sId + "-hSLD", {
			max: 360,
			step: 1,
			tooltip: oRb.getText("COLORPICKER_HUE"),
			value: parseInt(this.oHueField.getValue())
		}).addStyleClass(CONSTANTS.SliderClass).addAriaLabelledBy(this.oHueInvisibleText);


		// Attaching events with parameter passed so the handler will know in which mode to execute
		this.oSlider.attachEvent("liveChange", "liveChange", this._handleSliderChange.bind(this));
		this.oSlider.attachEvent("change", "change", this._handleSliderChange.bind(this));

		// Alpha Slider
		this.oAlphaInvisibleText = new InvisibleText({text: oRb.getText("COLORPICKER_ALPHA_SLIDER")}).toStatic();
		this.addAggregation("_invisibleTexts", this.oAlphaInvisibleText, true);

		this.oAlphaSlider = Library.ColorPickerHelper.factory.createSlider(sId + "-aSLD", {
			max: 1,
			value: 1,
			step: 0.01,
			tooltip: oRb.getText("COLORPICKER_ALPHA")
		}).addStyleClass(CONSTANTS.AlphaSliderClass).addAriaLabelledBy(this.oAlphaInvisibleText);


		// Attaching events with parameter passed so the handler will know in which mode to execute
		this.oAlphaSlider.attachEvent("liveChange", "liveChange", this._handleAlphaSliderChange.bind(this));
		this.oAlphaSlider.attachEvent("change", "change", this._handleAlphaSliderChange.bind(this));
	};

	/**
	 * Creates the controls and the layout needed to build the <code>ColorPicker</code>.
	 * Controls will be created only once during the lifecycle of the control.
	 * @private
	 */
	ColorPicker.prototype._createLayout = function() {
		var sId = this.getId(),
			oGrid;

		// If controls are created once - no need to recreate them
		if (this._bLayoutControlsCreated) {
			return;
		}

		// Create internal controls
		this._createInteractionControls();

		// Layout Data - that will be needed for visual state update
		this.oCPBoxGD = new GridData({span: "L6 M6 S12"}); // Color picker box
		this.icOne = new GridData({span: "L3 M3 S6"}); // Input column 1
		this.icTwo = new GridData({span: "L3 M3 S6"}); // Input column 2
		this.swatches = new GridData({span: "L3 M3 S12"}); // New and old color swatches
		this.rbg = new GridData({span: "L6 M8 S12"}); // RadioButton group RGB|HSL output

		if (this.bResponsive) {
			this._createUnifiedColorPicker(sId);
		} else {
			oGrid = this._createCommonsColorPicker(oGrid, sId);
			// Grid as aggregation of the ColorPicker control - needed for lifecycle management
			this.setAggregation("_grid", oGrid, true);
		}

		// Internal flag marking that layout controls are created
		this._bLayoutControlsCreated = true;

		if (!this.bResponsive) {
			// Adapt control to library - only initial adaptation needed here.
			this._adaptControlToLibrary();
		}
	};

	/**
	 * Should be called once after creating of internal controls to apply library specific layout
	 * @private
	 */
	ColorPicker.prototype._adaptControlToLibrary = function() {
		var oGrid;

		// If layout is not created there is nothing to adapt
		if (!this._bLayoutControlsCreated) {
			return;
		}

		oGrid = this.getAggregation("_grid");

		if (this.bResponsive) {
			// If library is not commons switch the control to responsive mode
			if (!Device.system.phone && !jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				// Changing tablet breakpoint to 400px is a magic number enabling the best adaptive behavior of the control
				// mainly on Desktop which apply's best to control specific look and feel.
				// Consider rewriting the renderer to take advantage on responsive grid behavior and to use it's private methods.
				oGrid._setBreakPointTablet(400);
			}
			oGrid.addStyleClass(CONSTANTS.CPResponsiveClass);
		} else {
			oGrid.setProperty("hSpacing", 0, true);
			oGrid.setProperty("vSpacing", 0, true);
			this.oCPBoxGD.setSpanS(5);
			this.icOne.setSpanS(4);
			this.icTwo.setSpanS(3);
			this.rbg.setSpanS(8);
		}
	};

	/**
	 * Adapts the control visual state depending on the currently used mode.
	 * @private
	 */
	ColorPicker.prototype._updateControlVisualState = function() {
		var oGrid = this.getAggregation("_grid");

		// If controls are not created there is nothing to update
		if (!oGrid) {
			return;
		}
		if (this.bResponsive) {
			// Responsive control mode
			if (this._bHSLMode) {
				oGrid.addStyleClass(CONSTANTS.HSLClass);
				this.swatches.setSpanM(4).setLinebreak(true);
			} else {
				// HSV mode
				oGrid.removeStyleClass(CONSTANTS.HSLClass);
				this.swatches.setSpanM(3).setLinebreak(false);
			}
		} else {
			// Legacy control mode
			if (this._bHSLMode) {
				oGrid.addStyleClass(CONSTANTS.HSLClass);
				this.swatches.setSpanS(4).setLinebreak(true);
			} else {
				// HSV mode
				oGrid.removeStyleClass(CONSTANTS.HSLClass);
				this.swatches.setSpanS(3).setLinebreak(false);
			}
		}
	};

	/**
	 * Refers to either <code>_processHSLChanges</code> or <code>_processHSVChanges</code> method
	 * depending on the current control mode.
	 * @private
	 */
	ColorPicker.prototype._processChanges = function() {};

	/**
	 * Setter for <code>mode</code> property.
	 * @param {sap.ui.unified.ColorPickerMode} sMode control mode enum
	 * @param {boolean} bSuppressInvalidate should control invalidation be suppressed
	 * @public
	 * @override
	 */
	ColorPicker.prototype.setMode = function(sMode, bSuppressInvalidate) {
		this._bLayoutControlsCreated = false;
		// Assign internal _processChanges method reference depending on current control mode
		switch (sMode) {
			case Library.ColorPickerMode.HSL:
				this._processChanges = this._processHSLChanges;
				break;
			case Library.ColorPickerMode.HSV:
				this._processChanges = this._processHSVChanges;
				break;
			default:
				Log.error("Control must have a valid mode set to work correct");
				break;
		}

		this._bHSLMode = sMode === Library.ColorPickerMode.HSL;
		return this.setProperty("mode", sMode, bSuppressInvalidate);
	};

	/**
	 * Setter for <code>displayMode</code> property.
	 * @param {sap.ui.unified.ColorPickerDisplayMode} sDisplayMode control displayMode enum
	 * @public
	 * @override
	 */
	ColorPicker.prototype.setDisplayMode = function(sDisplayMode) {
		this._bLayoutControlsCreated = false;
		return this.setProperty("displayMode", sDisplayMode, false);
	};

	ColorPicker.prototype._cleanup = function() {
		var aControls = [this.getAggregation("_grid"), this.getAggregation("_oCPBox"), this.getAggregation("_oHexField"),
			this.getAggregation("_oRedField"), this.getAggregation("_oGreenField"), this.getAggregation("_oBlueField"),
			this.getAggregation("_oHueField"), this.getAggregation("_oSatField"), this.getAggregation("_oLitField"),
			this.getAggregation("_oAlphaField"), this.getAggregation("_oAlphaField2"), this.getAggregation("_oValField"),
			this.getAggregation("_oSlider"), this.getAggregation("_oAlphaSlider"), this.oRGBorHSLRBUnifiedGroup,
			this.oCPBoxGD, this.icOne, this.icTwo, this.rbg, this.swatches, this.oAlphaInvisibleText, this.oHueInvisibleText,
			this.getAggregation("_oButton"), this.getAggregation("_oRGBorHSLRBUnifiedGroup"), this.oRGBorHSLRBGroup];

		aControls.forEach(function(oControl) {
			if (oControl) {
				oControl.destroy();
			}
		}, this);

		this._bLayoutControlsCreated = false;
	};

	ColorPicker.prototype.exit = function() {
		this._cleanup();
	};

	ColorPicker.prototype.onBeforeRendering = function() {
		this._cleanup();
		// Create the layout controls
		this._createLayout();

		// Update control state depending on mode/library
		this._updateControlVisualState();

		// Update color values
		this._updateColorString();
	};

	ColorPicker.prototype._updateColorString = function() {
		// parse string; get the color object
		this._parseColorString(this.getColorString());

		// update UI
		this.oHexField.setValue(this.Color.hex.substr(1));
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);

		if (this._bHSLMode) {
			this.oLitField.setValue(this.Color.l);
			this.oAlphaField.setValue(this.Color.a);
			this.oAlphaField2.setValue(this.Color.a);
			this.oSlider.setValue(this.Color.h);
			this.oAlphaSlider.setValue(this.Color.a);
			if (this.bResponsive) {
				this.oRGBorHSLRBUnifiedGroup.setSelectedIndex(this.Color.formatHSL ? 1 : 0);
			} else {
				this.oRGBorHSLRBGroup.setSelectedIndex(this.Color.formatHSL ? 1 : 0);
			}
		} else {
			this.oValField.setValue(this.Color.v);
			this.oSlider.setValue(this.Color.h);
			this.oAlphaSlider.setValue(this.Color.a);
			this.oAlphaField.setValue(this.Color.a);
			this.oAlphaField2.setValue(this.Color.a);
		}

		this._updateColorStringProperty(true, true);
	};

	/**
	 * Checks the validity of the CSS color string.
	 * @param {string} sColorString CSS color string to be validated
	 * @returns {boolean} If the passed string is a valid CSS color string
	 * @public
	 * @since 1.48.0
	 */
	ColorPicker.prototype.isColor = function(sColorString) {
		// parse string; only check
		return this._parseColorString(sColorString, true);
	};

	/**
	 * Event handler for Slider changes.
	 * @param {object} oEvent event object
	 * @param {object} oData object passed with the event initially registered on attachEvent
	 * @private
	 */
	ColorPicker.prototype._handleSliderChange = function(oEvent, oData) {
		// get the new value
		var sliderValue = parseInt(this.oSlider.getValue());

		// set the new hue value in the hue input field
		this.oHueField.setValue(sliderValue);

		this._processChanges();
		this._updateColorStringProperty(oData === "change", oData === "liveChange");
	};

	/**
	 * Event handler for Alpha-Slider changes.
	 * @param {object} oEvent event object
	 * @param {object} oData object passed with the event initially registered on attachEvent
	 * @private
	 */
	ColorPicker.prototype._handleAlphaSliderChange = function(oEvent, oData) {
		// update the new value
		this.Color.a = this.oAlphaSlider.getValue();

		// Update Alpha Field if needed - it's visible only in HSL mode
		if (this._bHSLMode) {
			this.oAlphaField.setValue(this.Color.a);
			this.oAlphaField2.setValue(this.Color.a);
		}

		// process changes
		if (!this.Color.formatHSL) {
			this._processRGBChanges();
		} else {
			this._processChanges();
		}
		this._updateColorStringProperty(oData === "change", oData === "liveChange");
	};

	/**
	 * Checks whether the value belongs within a range. If the value belongs, returns the same value.
	 * If the value is below the min or above the max, returns the range's min or max respectively.
	 * @param {number} iValue The value that should be kept in range
	 * @param {number} iMin The minimum value in the range
	 * @param {number} iMax The maximum value of the range
	 * @returns {number} in the defined by iMin and iMax range
	 * @private
	 */
	ColorPicker.prototype._getValueInRange = function(iValue, iMin, iMax) {
		if (isNaN(iValue)) {
			iValue = 0;
		}
		return Math.min(Math.max(iValue, iMin), iMax);
	};

	/**
	 * Event handler for changes of alpha input field.
	 *
	 * <b>Note:</b> This input is available only in HSL mode.
	 * @private
	 */
	ColorPicker.prototype._handleAlphaValueChange = function(oEvent) {
		// get the new value from the alpha field that was modified
		var alphaValue = (oEvent.getParameter("id") == "cp-aF2") ?
			parseFloat(this.oAlphaField2.getValue(), 10) : parseFloat(this.oAlphaField.getValue(), 10);

		alphaValue = this._getValueInRange(alphaValue, 0, 1);

		// set the new value
		this.Color.a = alphaValue;

		// set the new value (maybe the value has been changed in the above lines)
		this.oAlphaField.setValue(alphaValue);
		this.oAlphaField2.setValue(alphaValue);
		this.oAlphaSlider.setValue(alphaValue);

		if (!this.Color.formatHSL) {
			this._processRGBChanges();
		} else {
			this._processChanges();
		}

		this._updateColorStringProperty(true, true);
	};

	/**
	 * Event handler for changes of RGB or HSL radio button field.
	 */
	ColorPicker.prototype._handleRGBorHSLValueChange = function() {
		// store new value
		var oUnifiedRBGroup = this.oRGBorHSLRBUnifiedGroup;
		this.Color.formatHSL = oUnifiedRBGroup ? oUnifiedRBGroup.getSelectedIndex() === 1 : this.oRGBorHSLRBGroup.getSelectedIndex() === 1;

		this._updateColorStringProperty(true, true);
	};

	/**
	 * Event handler for changes of Hue input field.
	 * @private
	 */
	ColorPicker.prototype._handleHueValueChange = function() {
		// get the new value
		var hueValue = parseInt(this.oHueField.getValue());
		hueValue = this._getValueInRange(hueValue, 0, 360);

		// set the new value (maybe the value has been changed in the above lines)
		this.oHueField.setValue(hueValue);

		// update slider value
		this.oSlider.setValue(hueValue);

		this._processChanges();
		this._updateColorStringProperty(true, true);
	};

	/**
	 * Event handler for changes of Saturation input field.
	 * @private
	 */
	ColorPicker.prototype._handleSatValueChange = function() {
		// get the new value
		var satValue = parseInt(this.oSatField.getValue());
		satValue = this._getValueInRange(satValue, 0, 100);

		// set the new value (maybe the value has been changed in the above lines)
		this.oSatField.setValue(satValue);

		this._processChanges();
		this._updateColorStringProperty(true, true);
	};


	/**
	 * Event handler for changes of value input field.
	 * @private
	 */
	ColorPicker.prototype._handleValValueChange = function() {
		// get the new value
		var valValue = parseInt(this.oValField.getValue());
		valValue = this._getValueInRange(valValue, 0, 100);

		// set the new value (maybe the value has been changed in the above lines)
		this.oValField.setValue(valValue);

		// process Changes
		this._processHSVChanges();
		this._updateColorStringProperty(true, true);
	};

	/**
	 * Event handler for changes of Lightness input field.
	 * @private
	 */
	ColorPicker.prototype._handleLitValueChange = function() {
		// get the new value
		var litValue = parseInt(this.oLitField.getValue());
		litValue = this._getValueInRange(litValue, 0, 100);

		// set the new value (maybe the value has been changed in the above lines)
		this.oLitField.setValue(litValue);

		// process Changes
		this._processHSLChanges();
		this._updateColorStringProperty(true, true);
	};


	/**
	 * Event handler for changes of RED input field.
	 * @private
	 */
	ColorPicker.prototype._handleRedValueChange = function() {
		// get the new value
		var redValue = parseInt(this.oRedField.getValue());
		redValue = this._getValueInRange(redValue, 0, 255);

		// set the new value (maybe the value has been changed in the above lines)
		this.oRedField.setValue(redValue);

		this._processRGBChanges();
		this._updateColorStringProperty(true, true);
	};

	/**
	 * Event handler for changes of GREEN input field.
	 * @private
	 */
	ColorPicker.prototype._handleGreenValueChange = function() {
		// get the new value
		var greenValue = parseInt(this.oGreenField.getValue());
		greenValue = this._getValueInRange(greenValue, 0, 255);

		// set the new value (maybe the value has been changed in the above lines)
		this.oGreenField.setValue(greenValue);

		// process changes
		this._processRGBChanges();
		this._updateColorStringProperty(true, true);
	};

	/**
	 * Event handler for changes of BLUE input field.
	 * @private
	 */
	ColorPicker.prototype._handleBlueValueChange = function() {
		// get the new value
		var blueValue = parseInt(this.oBlueField.getValue());
		blueValue = this._getValueInRange(blueValue, 0, 255);

		// set the new value (maybe the value has been changed in the above lines)
		this.oBlueField.setValue(blueValue);

		// process changes
		this._processRGBChanges();
		this._updateColorStringProperty(true, true);
	};


	/**
	 * Processes changes of Hue, Value, and Saturation values.
	 * @private
	 */
	ColorPicker.prototype._processHSVChanges = function() {
		// get HSV-values
		var hueValue = parseInt(this.oHueField.getValue());
		var satValue = parseInt(this.oSatField.getValue());
		var valValue = parseInt(this.oValField.getValue());

		// calculate and set new RGB-values
		this._calculateRGB(hueValue, satValue, valValue);
		this.Color.r = this.RGB.r;
		this.Color.g = this.RGB.g;
		this.Color.b = this.RGB.b;
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);

		// calculate and set HEX-values from the RGB-values
		this._calculateHEX(this.Color.r, this.Color.g, this.Color.b);
		this.oHexField.setValue(this.sHexString);
		this.Color.hex = "#" + this.oHexField.getValue();

		// set HSV-values
		this.Color.h = hueValue;
		this.Color.s = satValue;
		this.Color.v = valValue;
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);
		this.oValField.setValue(this.Color.v);

		this._updateGradientBoxBackground(this.Color.h);
		this._updateCursorPosition();
		this._updateSelColorBackground();
	};

	/**
	 * Processes changes of Hue, Lightness, and Saturation values.
	 * @private
	 */
	ColorPicker.prototype._processHSLChanges = function() {
		// get HSL-values
		var iHueValue = parseInt(this.oHueField.getValue()),
			iSatValue = parseInt(this.oSatField.getValue()),
			iLitValue = parseInt(this.oLitField.getValue());

		if (iHueValue > 360) {
			iHueValue %= 360;
		}

		// calculate and set new RGB-values
		this._calculateRGB(iHueValue, iSatValue, iLitValue);
		this.Color.r = this.RGB.r;
		this.Color.g = this.RGB.g;
		this.Color.b = this.RGB.b;
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);

		// calculate and set HEX-values from the RGB-values
		this._calculateHEX(this.Color.r, this.Color.g, this.Color.b);
		this.oHexField.setValue(this.sHexString);
		this.Color.hex = "#" + this.oHexField.getValue();

		// set HSL-values
		this.Color.h = iHueValue;
		this.Color.s = iSatValue;
		this.Color.l = iLitValue;
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);
		this.oLitField.setValue(this.Color.l);

		this._updateGradientBoxBackground(this.Color.h);
		this._updateCursorPosition();
		this._updateAlphaBackground();
		this._updateSelColorBackground();
	};

	/**
	 * Processes changes of Red, Green, and Blue values.
	 * @private
	 */
	ColorPicker.prototype._processRGBChanges = function() {
		// calculate and set HEX-value from the RGB-values
		var redValue = Math.round(parseInt(this.oRedField.getValue())),
			greenValue = Math.round(parseInt(this.oGreenField.getValue())),
			blueValue = Math.round(parseInt(this.oBlueField.getValue())),
			// 765 is the sum of red, green and blue values if they are all equal to 255 which in combination gives pure white
			bPureWhite = (redValue + greenValue + blueValue) === 765;

		this._calculateHEX(redValue, greenValue, blueValue);
		this.oHexField.setValue(this.sHexString);

		if (this._bHSLMode) {
			this._calculateHSL(redValue, greenValue, blueValue);
			this.oLitField.setValue(this.Color.l);
		} else {
			// Special case if the currently selected color is pure white we should not reset the HUE slider
			// as it has no effect for the color but only a visual representation for the user.
			if (!bPureWhite) {
				this._calculateHSV(redValue, greenValue, blueValue);
			}
			this.oValField.setValue(this.Color.v);
		}

		// calculate and set HSV-values from the RGB-values
		if (!bPureWhite) {
			this.oHueField.setValue(this.Color.h);
		}
		this.oSatField.setValue(this.Color.s);

		// update slider value
		this.oSlider.setValue(parseInt(this.oHueField.getValue()));

		// store the values in variable
		this.Color.r = redValue;
		this.Color.g = greenValue;
		this.Color.b = blueValue;
		this.Color.hex = "#" + this.oHexField.getValue();

		this._updateGradientBoxBackground(this.Color.h);
		this._updateCursorPosition();
		this._updateSelColorBackground();
	};

	/**
	 * Event handler for changes of HEX input field.
	 * @private
	 */
	ColorPicker.prototype._handleHexValueChange = function() {
		// get the new value
		var sHexValue = this.oHexField.getValue().toLowerCase(),
			flAlphaValue = 1,
			re;

		// check for correct value
		if (sHexValue.substr(0, 1) === '#') {
			sHexValue = sHexValue.substr(1);
		}

		// parse #RRGGBBAA
		re = /^([0-9a-fA-F]{8})$/;
		if (re.test(sHexValue) !== false) {
			flAlphaValue = Number((parseInt(sHexValue.substr(6, 2), 16) / 255).toFixed(2));
			sHexValue = sHexValue.substr(0, 6);
		}

		re = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
		if (re.test(sHexValue) === false) {
			this.oHexField.setValueState(ValueState.Error);
			this.oSlider.setEnabled(false);
			this.oAlphaSlider.setEnabled(false);
			this.oHueField.setEnabled(false);
			this.oRedField.setEnabled(false);
			this.oGreenField.setEnabled(false);
			this.oBlueField.setEnabled(false);
			this.oSatField.setEnabled(false);
			this.oAlphaField.setEnabled(false);
			this.oAlphaField2.setEnabled(false);
			if (this._bHSLMode) {
				this.oLitField.setEnabled(false);
			} else {
				this.oValField.setEnabled(false);
			}
			return;
		} else if (this.oHexField.getValueState() === ValueState.Error) {
			this.oHexField.setValueState(ValueState.None);
			this.oSlider.setEnabled(true);
			this.oAlphaSlider.setEnabled(true);
			this.oHueField.setEnabled(true);
			this.oRedField.setEnabled(true);
			this.oGreenField.setEnabled(true);
			this.oBlueField.setEnabled(true);
			this.oSatField.setEnabled(true);
			this.oAlphaField.setEnabled(true);
			this.oAlphaField2.setEnabled(true);
			if (this._bHSLMode) {
				this.oLitField.setEnabled(true);
			} else {
				this.oValField.setEnabled(true);
			}
		}

		// convert from short to long hex (if needed)
		if (sHexValue.length === 3) {
			sHexValue = sHexValue.charAt(0) + sHexValue.charAt(0) + sHexValue.charAt(1) + sHexValue.charAt(1) + sHexValue.charAt(2) + sHexValue.charAt(2);
		}

		// process Changes
		this._processHexChanges(sHexValue);

		// update UI
		this.oHexField.setValue(sHexValue);
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);

		if (this._bHSLMode) {
			this.oLitField.setValue(this.Color.l);
			this.oAlphaField.setValue(1);
			this.oAlphaField2.setValue(1);
		} else {
			this.oValField.setValue(this.Color.v);
		}
		this.oSlider.setValue(parseInt(this.oHueField.getValue()));
		this.oAlphaSlider.setValue(flAlphaValue);
		this.Color.a = flAlphaValue;

		if (this._bHSLMode) {
			this.oAlphaField.setValue(flAlphaValue);
			this.oAlphaField2.setValue(flAlphaValue);
		}

		this._updateGradientBoxBackground(this.Color.h);
		this._updateCursorPosition();
		this._updateSelColorBackground();
		this._updateColorStringProperty(true, true);
	};

	/**
	 * Processes changes of HEX values.
	 * @param {string} sHexValue color value
	 * @private
	 */
	ColorPicker.prototype._processHexChanges = function(sHexValue) {
		// convert RGB-values
		this._convertRGB(sHexValue);

		if (this._bHSLMode) {
			// calculate and set HSL-values from the RGB-values
			this._calculateHSL(this.Color.r, this.Color.g, this.Color.b);
		} else {
			// calculate and set HSV-values from the RGB-values
			this._calculateHSV(this.Color.r, this.Color.g, this.Color.b);
		}

		// all values except hex set; set the hex value
		this.Color.hex = "#" + sHexValue.toLowerCase();
	};

	/**
	 * Update background color of alpha slider.
	 * @private
	 */
	ColorPicker.prototype._updateAlphaBackground = function() {
		var sRGB = [this.Color.r, this.Color.g, this.Color.b].join(","),
			newBG = sBrowserPrefix + "(left,rgba(" + sRGB + ",0),rgba(" + sRGB + ",1)),url(" + sBgSrc + ")";

		if (this.lastAlphaSliderGradient !== newBG) { // check against cached value to prevent flicker
			this.oAlphaSlider.$().find(this.bResponsive ? ".sapMSliderInner" : ".sapUiSliBar")
				.css("background-image", newBG); // stop flicker

			// cache last value to prevent flicker
			this.lastAlphaSliderGradient = newBG;
		}
	};

	/**
	 * Updates the cursor position in the <code>ColorPickerBox</code>.
	 * @private
	 */
	ColorPicker.prototype._updateCursorPosition = function() {
		var iX,
			iY;

		// If there is no size available yet we don't do any adaptation
		if (!this._iCPBoxSize) {
			return;
		}

		// get the width & height
		if (this._bHSLMode) {
			// calculate the x and y values
			iX = Math.round(this.oLitField.getValue() * this._iCPBoxSize / 100.0);
		} else {
			// calculate the x and y values
			iX = Math.round(this.oValField.getValue() * this._iCPBoxSize / 100.0);
		}

		// calculate x if we are in RTL mode
		if (sap.ui.getCore().getConfiguration().getRTL()) {
			iX = this._iCPBoxSize - iX;
		}
		iY = Math.round((1 - this.oSatField.getValue() / 100.0) * this._iCPBoxSize);
		iX = Math.round(Math.max(iX, 0) - this._iCPCursorSize / 2.0 - 1.0);
		iY = Math.round(Math.max(iY, 0) - this._iCPCursorSize / 2.0 - 1.0);

		// set the new cursor position
		this.$CPCur.css("left", iX).css("top", iY);

		// fixes Edge rendering glitches on (x50%) zoom: 50%, 150%, 250%, etc...
		if (sap.ui.Device.browser.edge) {
			var oBox = document.getElementById(this.oCPBox.getId());
			oBox.style.verticalAlign = "top";
			setTimeout( function() {
				oBox.style.verticalAlign = "initial";
			}, 0);
		}

	};

	/**
	 * Calculates RGB values from Hue/Saturation/Value.
	 * @param {int} iHue Hue color value
	 * @param {int} iSat Saturation color value
	 * @param {int} iVal Value color value
	 * @private
	 */
	ColorPicker.prototype._calculateRGB = function(iHue, iSat, iVal) {
		var iRedValue,
			iGreenValue,
			iBlueValue,
			iM,
			iX,
			iC,
			i;

		if (this._bHSLMode) {
			this._calculateRGBAdvanced(iHue, iSat, iVal);
			return;
		}
		// hue value is cyclic, so 360 = 0
		iHue %= 360;

		iHue /= 60;
		iSat /= 100;
		iVal /= 100;

		//Formula taken from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
		iC = iVal * iSat;
		iX = iC * (1 - Math.abs(iHue % 2 - 1));
		iM = iVal - iC;

		// calculate values
		iRedValue = 0;
		iGreenValue = 0;
		iBlueValue = 0;
		i = Math.floor(iHue);

		switch (i) {
			case 0:
				iRedValue = iC;
				iGreenValue = iX;
				break;
			case 1:
				iRedValue = iX;
				iGreenValue = iC;
				break;
			case 2:
				iGreenValue = iC;
				iBlueValue = iX;
				break;
			case 3:
				iGreenValue = iX;
				iBlueValue = iC;
				break;
			case 4:
				iRedValue = iX;
				iBlueValue = iC;
				break;
			case 5:
				iRedValue = iC;
				iBlueValue = iX;
				break;
			default:
				iRedValue = 0;
				iBlueValue = 0;
				iGreenValue = 0;
				break;
		}

		this.RGB.r = Math.floor((iRedValue + iM) * 255);
		this.RGB.g = Math.floor((iGreenValue + iM) * 255);
		this.RGB.b = Math.floor((iBlueValue + iM) * 255);
	};

	/**
	 * Calculates RGB values from Hue/Saturation/Lightness.
	 * @param {int} iHue Hue color value
	 * @param {int} iSat Saturation color value
	 * @param {int} iLit Lightness color value
	 * @private
	 */
	ColorPicker.prototype._calculateRGBAdvanced = function(iHue, iSat, iLit) {
		var iRedValue,
			iGreenValue,
			iBlueValue,
			iM255d,
			iM255x,
			iX,
			iM,
			iD,
			i;

		iHue = this._getValueInRange(iHue, 0, 360);
		iHue %= 360;

		if (iSat > 100) {
			iSat = 1;
		} else if (iSat < 0) {
			iSat = 0;
		} else {
			iSat = iSat / 100;
		}

		if (iLit > 100) {
			iLit = 1;
		} else if (iLit < 0) {
			iLit = 0;
		} else {
			iLit = iLit / 100;
		}

		iD = iSat * (1 - Math.abs(2 * iLit - 1));
		iM = 255 * (iLit - 0.5 * iD);
		iX = iD * (1 - Math.abs((iHue / 60) % 2 - 1));

		i = Math.floor(iHue / 60);

		iM255x = iM + 255 * iX;
		iM255d = iM + 255 * iD;

		switch (i) {
			case 0:
				iRedValue = iM255d;
				iGreenValue = iM255x;
				iBlueValue = iM;
				break;
			case 1:
				iRedValue = iM255x;
				iGreenValue = iM255d;
				iBlueValue = iM;
				break;
			case 2:
				iRedValue = iM;
				iGreenValue = iM255d;
				iBlueValue = iM255x;
				break;
			case 3:
				iRedValue = iM;
				iGreenValue = iM255x;
				iBlueValue = iM255d;
				break;
			case 4:
				iRedValue = iM255x;
				iGreenValue = iM;
				iBlueValue = iM255d;
				break;
			case 5:
				iRedValue = iM255d;
				iGreenValue = iM;
				iBlueValue = iM255x;
				break;
			default:
				iRedValue = 0;
				iGreenValue = 0;
				iBlueValue = 0;
				break;
		}
		this.RGB.r = Math.round(iRedValue);
		this.RGB.g = Math.round(iGreenValue);
		this.RGB.b = Math.round(iBlueValue);
	};

	/**
	 * Getter for the CSS color string.
	 * @private
	 * @returns{string} CSS Color String
	 */
	ColorPicker.prototype._getCSSColorString = function() {
		if (this.Color.formatHSL) {
			if (this.Color.a < 1) {
				return "hsla(" + this.Color.h + "," + this.Color.s + "%," + this.Color.l + "%, " + this.Color.a + ")";
			} else {
				return "hsl(" + this.Color.h + "," + this.Color.s + "%," + this.Color.l + "%)";
			}
		}

		if (this.Color.a < 1) {
			return "rgba(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ", " + this.Color.a + ")";
		} else {
			return "rgb(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ")";
		}
	};

	/**
	 * Calculates the HEX values when the RGB values change.
	 * @param {int} iRed red color value
	 * @param {int} iGreen green color value
	 * @param {int} iBlue blue color value
	 * @private
	 */
	ColorPicker.prototype._calculateHEX = function(iRed, iGreen, iBlue) {
		// convert values
		var sRedStr = iRed.toString(16),
			sGreenStr = iGreen.toString(16),
			sBlueStr = iBlue.toString(16);

		// Pad strings if needed
		if (sRedStr.length === 1) {
			sRedStr = '0' + sRedStr;
		}
		if (sGreenStr.length === 1) {
			sGreenStr = '0' + sGreenStr;
		}
		if (sBlueStr.length === 1) {
			sBlueStr = '0' + sBlueStr;
		}

		// return the HexValue
		this.sHexString = (sRedStr + sGreenStr + sBlueStr).toLowerCase();
	};

	/**
	 * Calculates HSV values from RGB values.
	 * @param {int} iRed red color value
	 * @param {int} iGreen green color value
	 * @param {int} iBlue blue color value
	 * @private
	 */
	ColorPicker.prototype._calculateHSV = function(iRed, iGreen, iBlue) {
		// calculate values
		var max = Math.max(Math.max(iRed, iGreen), iBlue),
			min = Math.min(Math.min(iRed, iGreen), iBlue),
			delta = max - min,
			valValue = Math.round(max * 100 / 255),
			satValue = max === 0.0 ? 0 : (100 * delta / max),
			hueValue = 0;

		if (satValue === 0) {
			hueValue = 0;
		} else if (iRed === max)   {
			hueValue = 60.0 * (iGreen - iBlue) / delta;
		} else if (iGreen === max)  {
			hueValue = 120.0 + 60.0 * (iBlue - iRed) / delta;
		} else if (iBlue === max) {
			hueValue = 240.0 + 60.0 * (iRed - iGreen) / delta;
		}
		if (hueValue < 0.0) {
			hueValue += 359.9;
		}

		hueValue = Math.round(hueValue);
		satValue = Math.round(satValue);

		// store the new values
		this.Color.h = hueValue;
		this.Color.s = satValue;
		this.Color.v = valValue;
	};

	/**
	 * Calculates HSL values from RGB values.
	 * @param {int} iRed color
	 * @param {int} iGreen color
	 * @param {int} iBlue color
	 */
	ColorPicker.prototype._calculateHSL = function(iRed, iGreen, iBlue) {
		var max = Math.max(iRed, iGreen, iBlue),
			min = Math.min(iRed, iGreen, iBlue),
			d = (max - min) / 255,
			litValue = (max + min) / 510,
			denominator = 1 - Math.abs(2 * litValue - 1),
			lVal = (litValue === 0.0) ? 0 : d / denominator,
			satValue = (denominator !== 0) ? lVal : 0,
			hueValue = 0;

		litValue = Math.round(litValue * 100);
		satValue = Math.round(satValue * 100);

		if (litValue === 0 || satValue === 0 || (iRed + iGreen + iBlue === 765)) {
			hueValue = 0;
		} else {

			// The hexagon method does the best numeric conversion on our standard colors as best as I can tell - darin

			// method hexagon begin
			var C = max - min;
			if (max === iRed) {
				hueValue = ((iGreen - iBlue) / C) % 6;
			}
			if (max === iGreen) {
				hueValue = (iBlue - iRed) / C + 2;
			}
			if (max === iBlue) {
				hueValue = (iRed - iGreen) / C + 4;
			}
			if (C === 0) {
				hueValue = 0;
			}

			hueValue *= 60;
			if (hueValue < 0) {
				hueValue += 360;
			}
			// method hexagon end
		}

		// store the new values
		// be careful not to change 360 to 0
		if (hueValue !== 0 || this.Color.h !== 360) {
			this.Color.h = Math.round(hueValue);
		}
		this.Color.s = satValue;
		this.Color.l = litValue;
	};

	/**
	 * Converts HEX value to internal RGB value.
	 * @param {string} sHex HEX CSS string
	 * @private
	 */
	ColorPicker.prototype._convertRGB = function(sHex) {
		// Convert values
		this.Color.r = parseInt(sHex.substr(0, 2), 16);
		this.Color.g = parseInt(sHex.substr(2, 2), 16);
		this.Color.b = parseInt(sHex.substr(4, 2), 16);
	};

	/**
	 * Updates the <code>GradientBox</code> background color.
	 * @param {int} iHue hue color value
	 * @private
	 */
	ColorPicker.prototype._updateGradientBoxBackground = function(iHue) {
		// calculate RGB-values
		if (this._bHSLMode) {
			this._calculateRGBAdvanced(iHue, 100, 50);
		} else {
			this._calculateRGB(iHue, 100, 100);
		}

		// calculate Hex-value
		this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);

		// set backgroundColor
		this.$CPBox.css('background-color', 'rgb(' + [this.RGB.r, this.RGB.g, this.RGB.b].join(",") + ')');
	};

	/**
	 * Updates the background color of new color box.
	 * @private
	 */
	ColorPicker.prototype._updateSelColorBackground = function() {
		this.$().find(".sapUiColorPicker-ColorPickerNewColor").css('background-color', this._getCSSColorString());
	};

	/**
	 * Parses the input parameter and checks the validity of the CSS color.
	 * @param {string} sColor CSS HSL color string allowed input formats is hsv(360,100,100); hsv360,100,100;
	 * @param {boolean} bCheckOnly check only
	 * @returns {boolean} if string is a valid CSS color
	 * @private
	 */
	ColorPicker.prototype._parseColorString = function(sColor, bCheckOnly) {
		var hexValue;

		// delete #, trim and lowercase
		if (sColor.substr(0, 1) === '#') {
			sColor = sColor.substr(1);
		}
		sColor = sColor.trim().toLowerCase();

		// Color name
		hexValue = this._parseColorName(sColor);
		if (hexValue) {
			if (bCheckOnly) {
				return true;
			}

			if (hexValue.length === 8) {
				this.Color.a = this.Color.oldA = Number((parseInt(hexValue.substr(6, 2), 16) / 255).toFixed(2));
				hexValue = hexValue.substring(0, 6);
			}

			this._processHexChanges(hexValue);
			this.Color.old = this.Color.hex;

			if (this._bHSLMode) {
				this.Color.formatHSL = false;
			}
			return true;
		}

		if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(sColor)) {
			if (bCheckOnly) {
				return true;
			}
			if (sColor.length === 3) {
				hexValue = sColor[0] + sColor[0] + sColor[1] + sColor[1] + sColor[2] + sColor[2];
			} else {
				hexValue = sColor;
			}
			this._processHexChanges(hexValue);
			this.Color.old = this.Color.hex;
			if (this._bHSLMode) {
				this.Color.formatHSL = false;
			}
			return true;
		}
		if (sColor.substr(0, 3) === 'rgb') {
			return this._parseRGB(sColor, bCheckOnly);
		}
		if (this._bHSLMode) {
			return this._parseHSL(sColor, bCheckOnly);
		} else if (sColor.substr(0, 3) === 'hsv') {
			return this._parseHSV(sColor, bCheckOnly);
		}
		return false;
	};

	/**
	 * Parses CSS HSV string.
	 * @param {string} sColor CSS HSL color string allowed input formats are hsv(360,100,100) and hsv360,100,100;
	 * @param {boolean} bCheckOnly check only
	 * @returns {boolean} If string is a valid RGB CSS string
	 * @private
	 */
	ColorPicker.prototype._parseHSV = function(sColor, bCheckOnly) {
		// allowed input: hsv(360,100,100); hsv360,100,100; [hsv(360,0.5,0.5); hsv360,0.5,0.5 later]
		var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),)(((\d{1,2})|(100)),)((\d{1,2})|(100))$/,
			aHSVColor,
			iH,
			iS,
			iV;

		// remove hsv, "(", ")" and blanks
		sColor = sColor.substr(3).replace("(", '').replace(")", '').split(' ').join('');
		if (re.test(sColor) === true) {
			// If we are in check only mode we don't do any control adaptation
			if (bCheckOnly) {
				return true;
			}

			// it's a hsv string, get the values
			aHSVColor = sColor.split(",");
			iH = parseInt(aHSVColor[0]);
			iS = parseInt(aHSVColor[1]);
			iV = parseInt(aHSVColor[2]);

			//get RGB values
			this._calculateRGB(iH, iS, iV);
			//get Hex values
			this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
			//store the values
			this.Color.r = this.RGB.r;
			this.Color.g = this.RGB.g;
			this.Color.b = this.RGB.b;
			this.Color.h = iH;
			this.Color.s = iS;
			this.Color.v = iV;
			this.Color.hex = "#" + this.sHexString;
			this.Color.old = this.Color.hex;

			return true;
		}

		return false;
	};

	/**
	 * Parses CSS HSL or HSLA string.
	 * @param {string} sColor CSS HSL color string Allowed input formats are hsl|a(360,100,100); hsl|a360,100,100;
	 * [hsl|a(360,0.5,0.5); hsl|a360,0.5,0.5 later]
	 * @param {boolean} bCheckOnly check only
	 * @returns {boolean} If string is a valid RGB CSS string
	 * @private
	 */
	ColorPicker.prototype._parseHSL = function(sColor, bCheckOnly) {
		var aHSLColor,
			sBeginning = sColor.substr(0, 4),
			bHSLA,
			iH,
			iS,
			iL,
			fA;

		if (sBeginning === "hsla") {
			bHSLA = true;
		} else if (sBeginning === "hsl(") {
			bHSLA = false;
		} else {
			// This is not a valid HSL|A String and we fail ignoring the bCheckOnly state
			return false;
		}

		// remove hsl|a, "(", ")" and blanks
		sColor = sColor.substr(bHSLA ? 4 : 3).replace("(", '').replace(")", '').split(' ').join('');

		// split string to array of values
		aHSLColor = sColor.split(",");

		iH = parseInt(aHSLColor[0]);
		// Parsing iS and iL as floats as they could be of both float or int type
		iS = parseFloat(aHSLColor[1]);
		iL = parseFloat(aHSLColor[2]);

		// We default alpha to 1 in HSL mode
		if (bHSLA) {
			fA = parseFloat(aHSLColor[3]);
		} else {
			// If we have a 4th color parameter in HSL mode we fail ignoring bCheckOnly state
			if (aHSLColor[3] && parseFloat(aHSLColor[3]) >= 0) {
				return false;
			}
			fA = 1;
		}

		// Normalize iS and iL if needed
		// Note - this is for legacy implementation as Saturation and Lightness should be in percent
		// so value of 1 will be treated as 1% and not 1.0 (100%);
		iS = (iS < 1 && iS > 0) ? iS * 100 : iS;
		iL = (iL < 1 && iL > 0) ? iL * 100 : iL;

		// Check for valid values
		if ((iH >= 0 && iH <= 360) &&
			(iS >= 0 && iS <= 100) &&
			(iL >= 0 && iL <= 100) &&
			(fA >= 0 && fA <= 1)) {

			// If we are in check only mode we don't do any control adaptation
			if (bCheckOnly) {
				return true;
			}

			// get RGB values
			this._calculateRGB(iH, iS, iL);
			// get Hex values
			this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
			// store the values
			this.Color.r = this.RGB.r;
			this.Color.g = this.RGB.g;
			this.Color.b = this.RGB.b;
			this.Color.h = iH;
			this.Color.s = iS;
			this.Color.l = iL;
			this.Color.hex = "#" + this.sHexString;
			this.Color.old = this.Color.hex;
			this.Color.a = this.Color.oldA = fA;
			this.Color.formatHSL = true;
		} else {
			// We did not manage to parse a valid values from the string passed
			return false;
		}

		return true;
	};

	/**
	 * Parses CSS RGB and RGBA color string.
	 * @param {string} sColor RGB|A color string
	 * @param {boolean} bCheckOnly check only
	 * @returns {boolean} If string is a valid RGB|A CSS color string
	 */
	ColorPicker.prototype._parseRGB = function(sColor, bCheckOnly) {
		var aValues,
			sBeginning,
			bRGBA,
			re;

		// Detect RGB|RGBA mode
		sBeginning = sColor.substring(0, 4);
		if (sBeginning === "rgba") {
			re = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])),){2}(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])),)([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1])$/;
			bRGBA = true;
		} else if (sBeginning.substring(0, 3) === "rgb") {
			re = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])),){2}(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])))$/;
			bRGBA = false;
		} else {
			// This is not a valid RGB|A String and we fail ignoring the bCheckOnly state
			return false;
		}

		// remove rgb|a, "(", ")" and blanks
		sColor = sColor.substr(bRGBA ? 4 : 3).replace("(", '').replace(")", '').split(' ').join('');

		if (re.test(sColor)) {
			if (bCheckOnly) {
				return true;
			}
			// it's a rgb string, get the values and convert to Hex
			aValues = sColor.split(",");
			this._calculateHEX(parseInt(aValues[0]), parseInt(aValues[1]), parseInt(aValues[2]));
			// get HSV values
			this._processHexChanges(this.sHexString);
			this.Color.old = this.Color.hex;
			if (bRGBA) {
				this.Color.a = this.Color.oldA = parseFloat(aValues[3]);
			}
			return true;
		}
		if (this._bHSLMode) {
			this.Color.formatHSL = false;
		}
		return false;
	};

	/**
	 * Parses a color name and if valid, generates a HEX string representing the color.
	 * @param {string} sColor color name that the method will try to map to hex format
	 * @returns{string} HEX representation of a color
	 * @private
	 */
	ColorPicker.prototype._parseColorName = function(sColor) {
		return CONSTANTS.Colors[sColor];
	};

	/**
	 * Event after rendering the control.
	 * @override
	 */
	ColorPicker.prototype.onAfterRendering = function() {
		var sRGBString = this._getCSSColorString(),
			oParent = this.getParent();

		// get the jQuery-Object for oCPBox and cpCur
		this.$CPBox = this.oCPBox.$();
		this.$CPCur = this.oCPBox.getHandle();

		// set the background color of the Color Boxes
		this.$().find(".sapUiColorPicker-ColorPickerNewColor").css('background-color', sRGBString);
		this.$().find(".sapUiColorPicker-ColorPickerOldColor").css('background-color', sRGBString);

		// update the background color of the 'new color box'
		this._updateGradientBoxBackground(this.Color.h);

		// Initial ColorPickerBox size and fire cursor position update - this is needed if ColorPicker is used
		// inside a Dialog
		this._iCPBoxSize = this.oCPBox.getWidth();
		this._updateCursorPosition();

		// update alpha slider background only in HSL mode
		if (this._bHSLMode) {
			this._updateAlphaBackground();
		}
		this.oSlider.iShiftGrip = Math.round(jQuery(this.oSlider.oGrip).outerWidth() / 2);
		this.oAlphaSlider.iShiftGrip = Math.round(jQuery(this.oAlphaSlider.oGrip).outerWidth() / 2);

		//TODO This is a temporary fix. It's in order to satisfy the control's VD until the refactoring of the control
		if (oParent && oParent.getMetadata().getName() === "sap.m.Dialog") {
			oParent.addStyleClass("sapUiCPDialog");
		}
		//unified: the class must be added here in order to toggle it in the button press
		this.addStyleClass("sapUiCPDisplayRGB");
	};

	/**
	 * Gets current RGB values.
	 * @returns {object} Containing current RGB values
	 * @public
	 * @since 1.48.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ColorPicker.prototype.getRGB = function() {
		return {r: this.Color.r, g: this.Color.g, b: this.Color.b};
	};

	/**
	 * Method is used only for QUnit testing to get the CONSTANTS object.
	 * @returns {object} CONSTANTS object
	 * @private
	 */
	ColorPicker.prototype._getConstants = function() {
		return CONSTANTS;
	};

	/**
	 * Creates the grid for the commons.ColorPicker
	 * @param {sap.ui.layout.Grid} oGrid
	 * @param {string} sId
	 * @returns {object} sap.ui.layout.Grid
	 * @private
	 */
	ColorPicker.prototype._createCommonsColorPicker = function(oGrid, sId) {
		oGrid = new Grid({
			containerQuery: true,
			content: [
				// ColorPickerBox
				this.oCPBox.setLayoutData(this.oCPBoxGD),
				// Input column 1
				new VLayout({
					content: [
						this._createRowFromInput(this.oRedField, "COLORPICKER_RED", "R:"),
						this._createRowFromInput(this.oGreenField, "COLORPICKER_GREEN", "G:"),
						this._createRowFromInput(this.oBlueField, "COLORPICKER_BLUE", "B:"),
						this._createRowFromInput(this.oHexField, "COLORPICKER_HEX", "#:")
					],
					layoutData: this.icOne
				}),
				// Input column 2
				new VLayout({
					content: [
						this._createRowFromInput(this.oHueField, "COLORPICKER_HUE", "H:"),
						this._createRowFromInput(this.oSatField, "COLORPICKER_SAT", "S:", "%"),
						this._createRowFromInput(this.oLitField, "COLORPICKER_LIGHTNESS", "L:", "%").addStyleClass(CONSTANTS.HideForHSVClass),
						this._createRowFromInput(this.oAlphaField, "COLORPICKER_ALPHA", "A:").addStyleClass(CONSTANTS.HideForHSVClass),
						this._createRowFromInput(this.oAlphaField2, "COLORPICKER_ALPHA", "A:").addStyleClass(CONSTANTS.HideForHSVClass),
						this._createRowFromInput(this.oValField, "COLORPICKER_VALUE", "V:").addStyleClass(CONSTANTS.HideForHSLClass)
					],
					layoutData: this.icTwo
				}).addStyleClass(CONSTANTS.LastColumnClass),
				// Old and New color swatches
				new HLayout({
					content: [
						// HTML-Control containing the Old Color Box
						new HTML({
							content: ["<div id='", sId, "-ocBox' class='", CONSTANTS.OldColorClass, "'></div>"].join("")
						}),
						// HTML-Control containing the New Color Box
						new HTML({
							content: ["<div id='", sId, "-ncBox' class='", CONSTANTS.NewColorClass, "'></div>"].join("")
						})
					],
					layoutData: this.swatches
				}).addStyleClass(CONSTANTS.SwatchesClass),
				// RGB|HSL output selector
				new HLayout({
					content: [
						Library.ColorPickerHelper.factory.createLabel({ text: "Output:", labelFor: this.oRGBorHSLRBGroup}),
						this.oRGBorHSLRBGroup
					],
					layoutData: this.rbg
				}).addStyleClass(CONSTANTS.HideForHSVClass).addStyleClass(CONSTANTS.OutputSelectorRowClass),
				// Slider
				this.oSlider.setLayoutData(new GridData({span: "L6 M6 S12", linebreak: true})),
				// Alpha Slider
				this.oAlphaSlider.setLayoutData(new GridData({span: "L6 M6 S12"}))
			]
		}).addStyleClass(CONSTANTS.CPMatrixClass);

		return oGrid;
	};

	/**
	 * Creates the needed elements for unified.ColorPicker
	 * @param {string} sId
	 * @private
	 */
	ColorPicker.prototype._createUnifiedColorPicker = function(sId) {
		var that = this;

		this.oRbRGB = Library.ColorPickerHelper.factory.createRadioButtonItem({tooltip: oRb.getText("COLORPICKER_SELECT_RGB_TOOLTIP")});
		this.oRbRGB.addStyleClass("sapUiCPRB");
		this.oRbHSLV = Library.ColorPickerHelper.factory.createRadioButtonItem({tooltip: oRb.getText("COLORPICKER_SELECT_HSL_TOOLTIP")});
		this.oRbHSLV.addStyleClass("sapUiCPRB");
		this.oButton = Library.ColorPickerHelper.factory.createButton(sId + "-toggleMode", {
			type: Device.system.phone ? "Default" : "Transparent",
			tooltip: oRb.getText("COLORPICKER_TOGGLE_BTN_TOOLTIP"),
			icon: "sap-icon://source-code",
			press: function(oEvent) {
				//todo add third state - an input field must be shown
				that.toggleStyleClass("sapUiCPDisplayRGB", that.bPressed);
				that.bPressed = !that.bPressed;
			}
		});
		this.setAggregation("_oButton", this.oButton, true);

		// RGB|HSL output
		this.oRGBorHSLRBUnifiedGroup = Library.ColorPickerHelper.factory.createRadioButtonGroup({
			select: this._handleRGBorHSLValueChange.bind(this),
			selectedIndex: (this.Color.formatHSL ? 1 : 0)
		});

		this.oRGBorHSLRBUnifiedGroup.addButton(this.oRbRGB);
		this.oRGBorHSLRBUnifiedGroup.addButton(this.oRbHSLV);

		this.setAggregation("_oRGBorHSLRBUnifiedGroup", this.oRGBorHSLRBUnifiedGroup, true);
		this.setAggregation("_oCPBox", this.oCPBox, true);
		this.setAggregation("_oHexField", this.oHexField, true);
		this.setAggregation("_oRedField", this.oRedField, true);
		this.setAggregation("_oGreenField", this.oGreenField, true);
		this.setAggregation("_oBlueField", this.oBlueField, true);
		this.setAggregation("_oHueField", this.oHueField, true);
		this.setAggregation("_oSatField", this.oSatField, true);
		this.setAggregation("_oLitField", this.oLitField, true);
		this.setAggregation("_oAlphaField", this.oAlphaField, true);
		this.setAggregation("_oAlphaField2", this.oAlphaField2, true);
		this.setAggregation("_oValField", this.oValField, true);
		this.setAggregation("_oSlider", this.oSlider, true);
		this.setAggregation("_oAlphaSlider", this.oAlphaSlider, true);
	};

	return ColorPicker;

});
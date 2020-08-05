/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ColorPickerPopover
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/m/Button',
	'sap/m/ResponsivePopover',
	'./ColorPicker',
	'./library',
	'sap/m/library',
	"sap/ui/thirdparty/jquery"
], function (
	Control,
	Device,
	Button,
	ResponsivePopover,
	ColorPicker,
	library,
	mLibrary,
	jQuery
) {
		"use strict";

		// shortcut for PlacementType
		var PlacementType = mLibrary.PlacementType;

		// shortcut for sap.ui.unified.ColorPickerMode & sap.ui.unified.ColorPickerDisplayMode
		var ColorPickerMode = library.ColorPickerMode,
			ColorPickerDisplayMode = library.ColorPickerDisplayMode;

		// shortcut for sap.m.ButtonType
		var ButtonType = mLibrary.ButtonType;

		/**
		 *
		 * Constructor for a new <code>ColorPickerPopover</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A thin wrapper over {@link sap.ui.unified.ColorPicker} allowing the latter to be used in a popover.
		 *
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.60
		 * @alias sap.ui.unified.ColorPickerPopover
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ColorPickerPopover = Control.extend("sap.ui.unified.ColorPickerPopover", /** @lends sap.ui.unified.ColorPickerPopover.prototype */ {
			metadata: {
				library: "sap.ui.unified",
				publicMethods: ["openBy", "close"],
				properties: {

					/**
					 * Determines the input parameter that can be a string of type HEX, RGB, HSV, or a CSS color name:
					 * <ul>
					 * <li>HEX - #FFFFFF</li>
					 * <li>RGB - rgb(255,255,255)</li>
					 * <li>HSV - hsv(360,100,100)</li>
					 * <li>CSS - red</li>
					 * </ul>
					 * <b>Note:</b> The output parameter is an RGB string of the current color.
					 * @since 1.60.0
					 */
					colorString : {type : "string", group : "Misc", defaultValue : null},

					/**
					 * Determines the color mode of the <code>ColorPicker</code>.
					 * @since 1.60.0
					 */
					mode : {type : "sap.ui.unified.ColorPickerMode", group : "Appearance", defaultValue : ColorPickerMode.HSV},

					/**
					* Determines the display mode of the <code>ColorPicker</code> among three types - Default, Large and Simplified
					* @since 1.60.0
					*/
					displayMode : {type : "sap.ui.unified.ColorPickerDisplayMode", group : "Appearance", defaultValue : ColorPickerDisplayMode.Default}
				},

				events: {
					/**
					 * Fired when the submit button of the popover is clicked.
					 *
					 * @since 1.60.0
					 */
					change : {
						parameters : {

							/**
							 * Parameter containing the RED value (0-255).
							 */
							r : {type : "int"},

							/**
							 * Parameter containing the GREEN value (0-255).
							 */
							g : {type : "int"},

							/**
							 * Parameter containing the BLUE value (0-255).
							 */
							b : {type : "int"},

							/**
							 * Parameter containing the HUE value (0-360).
							 */
							h : {type : "int"},

							/**
							 * Parameter containing the SATURATION value (0-100).
							 */
							s : {type : "int"},

							/**
							 * Parameter containing the VALUE value (0-100).
							 */
							v : {type : "int"},

							/**
							 * Parameter containing the LIGHTNESS value (0-100).
							 */
							l : {type : "int"},

							/**
							 * Parameter containing the Hexadecimal string (#FFFFFF).
							 */
							hex : {type : "string"},

							/**
							 * Parameter containing the alpha value (transparency).
							 */
							alpha : {type : "string"}
						}
					}
				}
			},
			renderer: {
				apiVersion: 2
			}
		});

		// get resource translation bundle;
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

		/**
		 * Keeps reference to all API properties and/or methods that are about to be forwarded to either a
		 * <code>ColorPicker</code> or <code>Popover</code>. The value contains the name of the method at the target
		 * instance. If empty, the key is used as target name.
		 */
		var FORWARDABLE = {
			COLOR_PICKER_PROPS: {
				colorString: "setColorString",
				mode: "setMode",
				displayMode: "setDisplayMode"
			},
			POPOVER_METHODS: {
				getDomRef: "",
				close: ""
			}
		};

		ColorPickerPopover.prototype.init = function () {
			// Reference to the popover containing the internal "Color Picker". For private use
			this._oPopover = null;

			// We don't use the unofficial ManagedObject.prototype._bIsBeingDestroyed, but the official API method #exit
			this._bPopoverDestroying = null;
		};

		ColorPickerPopover.prototype.exit = function () {
			this._bPopoverDestroying = true;

			if (this._oPopover) {
				this._oPopover.removeDelegate(this._oPopover._onAfterRenderingDelegate);
				this._oPopover.destroy();
				this._oPopover = null;
			}
		};

		/**
		 * Opens the <code>ColorPickerPopover</code>.
		 * The popover is positioned relative to the control parameter on tablet or desktop and is full screen on phone.
		 * Therefore the openBy parameter is only used on tablet or desktop and is ignored on phone.
		 *
		 * @param {Object} openBy When this control is displayed on tablet or desktop, the <code>ColorPickerPopover</code>
		 * is positioned relative to this control
		 * @returns {Object} Reference to the opening control
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ColorPickerPopover.prototype.openBy = function (openBy) {
			return ResponsivePopover.prototype.openBy.apply(this._ensurePopover(), arguments);
		};

		/**
		 * Closes the <code>ColorPickerPopover</code>.
		 *
		 * @name sap.ui.unified.ColorPickerPopover#close
		 * @function
		 * @type sap.ui.core.Control
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */


		// Private methods -------------------------------------------------------------------------------------------
		ColorPickerPopover.prototype._getColorPicker = function () {
			return this._ensurePopover().getContent()[0];
		};

		/**
		 * Ensures a popover wrapping the ColorPicker exists (creates new if is not created yet).
		 * @returns {sap.m.ResponsivePopover} the popover.
		 * @private
		 */
		ColorPickerPopover.prototype._ensurePopover = function () {
			if (!this._oPopover) {
				this._oPopover = this._createPopover();
			}

			return this._oPopover;
		};

		/**
		 * Creates a popover that wraps the ColorPicker.
		 * @return {sap.m.ResponsivePopover} the popover containing the ColorPicker.
		 * @private
		 */
		ColorPickerPopover.prototype._createPopover = function () {
			var oPopover,
				oColorPicker = this._createColorPicker(),
				oDelegate,
				that = this;
			oPopover = new ResponsivePopover(this.getId() + "-colorPickerPopover", {
				showHeader: Device.system.phone,
				placement: PlacementType.VerticalPreferredBottom,
				showArrow: false,
				showCloseButton: false,
				beginButton: new Button({
					text: oLibraryResourceBundle.getText("COLOR_PICKER_SUBMIT"),
					type: ButtonType.Emphasized,
					press: function () {
						that.fireChange(that._oLastChangeCPParams);
						oPopover.close();
					}}),
				endButton: new Button({
					text: oLibraryResourceBundle.getText("COLOR_PICKER_CANCEL"),
					press: function () {
						oPopover.close();
					}}),
				title: oLibraryResourceBundle.getText("COLOR_PICKER_TITLE"),
				content: oColorPicker
			});

			oColorPicker.attachEvent("change", function (oEvent) {
				this._handleChange(oEvent);
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
		 * On submit fires change event of the control with parameters
		 * taken from the event fired from the ColorPicker control.
		 * @return {sap.ui.unified.ColorPickerPopover} <code>this</code> for method chaining.
		 * @private
		 */
		ColorPickerPopover.prototype._handleChange = function (oEvent) {
			var oTmpEventParams = {};
			this._oLastChangeCPParams = jQuery.extend(oTmpEventParams, oEvent.getParameters());
			delete this._oLastChangeCPParams.id;

			return this;
		};

		/**
		 * Creates a ColorPicker that reflects the current API properties.
		 * @return {sap.ui.unified.ColorPicker} the ColorPicker.
		 * @private
		 */

		ColorPickerPopover.prototype._createColorPicker = function () {
			var oColorPicker = new ColorPicker(this.getId() + "-color_picker");

			return oColorPicker;
		};


		//proxy properties to the ColorPicker's content
		ColorPickerPopover.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			var sTargetMethodName;

			if (FORWARDABLE.COLOR_PICKER_PROPS[sPropertyName] !== undefined) {
				sTargetMethodName = FORWARDABLE.COLOR_PICKER_PROPS[sPropertyName] || sPropertyName;
				ColorPicker.prototype[sTargetMethodName].call(this._getColorPicker(), oValue);
			}

			return Control.prototype.setProperty.apply(this, arguments);
		};

		//proxy methods to the popover's content
		Object.keys(FORWARDABLE.POPOVER_METHODS).forEach(function (sSourceName) {
			var sTargetMethodName = FORWARDABLE.POPOVER_METHODS[sSourceName] || sSourceName;

			ColorPickerPopover.prototype[sSourceName] = function () {
				if (this._bPopoverDestroying) {
					return null;
				}
				var oPopover = this._ensurePopover();
				return oPopover[sTargetMethodName].apply(oPopover, arguments);
			};
		});

		return ColorPickerPopover;
	});


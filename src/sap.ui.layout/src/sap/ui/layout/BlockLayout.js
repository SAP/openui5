/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	'sap/ui/core/ResizeHandler',
	"./BlockLayoutRenderer"
],
	function(Control, library, ResizeHandler, BlockLayoutRenderer) {
		"use strict";

		/**
		 * Constructor for a new BlockLayout.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The BlockLayout is used to display several objects in a section-based manner.
		 * <h3>Overview</h3>
		 * The BlockLayout uses horizontal and vertical subdivisions, and full-width banners to display a set of elements.
		 * By placing pictorial and textual elements side-by-side in different blocks, you can establish a visual connection between blocks and between similar elements.
		 * <h3>Structure</h3>
		 * The BlockLayout contains BlockLayout cells. Every cell consists of a title and content. The title can be text or a link.
		 *
		 * Special full-width sections of the BlockLayout allow horizontal scrolling through a set of blocks.
		 *
		 * The BlockLayout comes in five predefined types for background colors:
		 * <ul>
		 * <li>Layout only (default) - a layout scheme and no background colors</li>
		 * <li>Light - a layout scheme with light colors</li>
		 * <li>Accent - a layout scheme with 11 pre-defined color sets</li>
		 * <li>Dashboard - a layout scheme with additional borders and no background colors</li>
		 * </ul>
		 * Background colors are attached directly to the blocks of the layout.
		 *
		 * <b>Note:</b> With version 1.48 colors can be set for each individual {@link sap.ui.layout.BlockLayoutCell cell}.
		 * There are 11 pre-defined color sets, each with 4 different shades for the SAP Belize theme and 6 different shades for the Quartz and Horizon themes.
		 * To change the background of a particular cell, set <code>backgroundColorSet</code> (main color)
		 * and <code>backgroundColorShade</code> (shade).
		 *
		 * <b>Note:</b> Usage of disabled, emphasized or subtle links as titles is not recommended. Dark background designs, for example Accent, are not fully supported with regards to Accessibility when used with links as titles.
		 *
		 * <h3>Usage</h3>
		 * <h4>When to use</h4>
		 * <ul>
		 * <li>You want to create a catalogue-like page with sections of blocks.</li>
		 * <li>The BlockLayout is intended for developing administrative tools and applications.</li>
		 * </ul>
		 * <h4>When not to use</h4>
		 * <ul>
		 * <li>You want to display properties or features of one content item. Use a {@link sap.uxap.ObjectPageLayout object page} or {@link sap.f.DynamicPage dynamic page} instead.</li>
		 * </ul>
		 * <h3>Responsive Behavior</h3>
		 * <ul>
		 * <li>The breakpoints of the block layout react to the width of the control itself and not to the actual screen size.</li>
		 * <li> On small screens all blocks will wrap to a single scrollable column</li>
		 * </ul>
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.ui.layout.BlockLayout
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/block-layout/ Block Layout}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BlockLayout = Control.extend("sap.ui.layout.BlockLayout", { metadata : {

			library : "sap.ui.layout",
			properties : {
				/**
				 * Determines the background used for the Layout
				 * @since 1.42
				 */
				background: { type: "sap.ui.layout.BlockBackgroundType", group: "Appearance", defaultValue: "Default" },

				/**
				 * Keeps the font-size of the contents as is, independent from the screen size.
				 * @since 1.52
				 */
				keepFontSize: { type: "boolean", group:"Behavior", defaultValue: false}
			},
			defaultAggregation : "content",
			aggregations : {
				/**
				 * The Rows to be included in the content of the control
				 */
				content: { type: "sap.ui.layout.BlockLayoutRow", multiple: true }
			},
			designtime: "sap/ui/layout/designtime/BlockLayout.designtime"
		}});

		/**
		 * Breakpoints used for the parent container of the Layout, to determine the inner representation of the rows.
		 * @type {{breakPointM: number, breakPointL: number}}
		 */
		BlockLayout.CONSTANTS = {
			SIZES: {
				S: 600,  //Phone
				M: 1024, //Tablet
				L: 1440, //Desktop
				XL: null //LargeDesktop
			}
		};

		BlockLayout.prototype.init = function () {
			this._currentBreakpoint = null;
		};

		BlockLayout.prototype.onBeforeRendering = function () {
			this._detachResizeHandler();
		};

		/**
		 * Resize handler is being attached to the control after the rendering
		 */
		BlockLayout.prototype.onAfterRendering = function () {
			this._onParentResize();
			this._notifySizeListeners();
		};

		/**
		 * Handler for the parent resize event
		 * @private
		 */
		BlockLayout.prototype._onParentResize = function () {
			var sProp,
				domRef = this.getDomRef(),
				iWidth = domRef.clientWidth,
				mSizes = BlockLayout.CONSTANTS.SIZES;

			this._detachResizeHandler();
			// Put additional styles according to SAP_STANDARD_EXTENDED from sap.ui.Device.media.RANGESETS
			// Not possible to use sap.ui.Device directly as it calculates window size, but here is needed parent's size
			if (iWidth > 0){
				this._removeBreakpointClasses();
				for (sProp in mSizes) {
					if (mSizes.hasOwnProperty(sProp) && (mSizes[sProp] === null || mSizes[sProp] > iWidth)) {
						if (this._currentBreakpoint != sProp) {
							this._currentBreakpoint = sProp;
							this._notifySizeListeners();
						}

						this.addStyleClass("sapUiBlockLayoutSize" + sProp, true);
						break;
					}
				}
			}

			this._attachResizeHandler();
		};

		BlockLayout.prototype._notifySizeListeners = function () {
			var that = this;
			this.getContent().forEach(function (oRow) {
				oRow._onParentSizeChange(that._currentBreakpoint);
			});
		};

		/**
		 * Removes all breakpoint classes
		 * @private
		 */
		BlockLayout.prototype._removeBreakpointClasses = function () {
			var mSizes = BlockLayout.CONSTANTS.SIZES;

			for (var prop in mSizes) {
				if (mSizes.hasOwnProperty(prop)) {
					this.removeStyleClass("sapUiBlockLayoutSize" + prop, true);
				}
			}
		};

		/**
		 * Attaches resize handler to the parent
		 * @private
		 */
		BlockLayout.prototype._attachResizeHandler = function () {
			if (!this._parentResizeHandler) {
				this._parentResizeHandler = ResizeHandler.register(this, this._onParentResize.bind(this));
			}
		};

		/**
		 * Detaches the parent resize handler
		 * @private
		 */
		BlockLayout.prototype._detachResizeHandler = function () {
			if (this._parentResizeHandler) {
				ResizeHandler.deregister(this._parentResizeHandler);
				this._parentResizeHandler = null;
			}
		};

		/**
		 * Detaches the resize handler on exit
		 */
		BlockLayout.prototype.exit = function () {
			this._detachResizeHandler();
		};

		return BlockLayout;

	});
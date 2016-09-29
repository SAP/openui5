/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Control', './library'],
	function(Control, library) {
		"use strict";

		/**
		 * Constructor for a new BlockLayout.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The BlockLayout is used to display several objects in a section-based manner. It features horizontal and vertical subdivisions, and full-width banners seen frequently in contemporary web design. Background colors are attached directly to these “blocks” of the layout. Special full-width sections of the BlockLayout allow horizontal scrolling through a set of blocks.
		 * Example use cases are SAP HANA Cloud Integration and the SAPUI5 Demo Kit. In SAP HANA Cloud Integration the BlockLayout serves as a banner-like presentation of illustrative icons with associated text. By placing pictorial and textual elements side by side in different blocks, a relation of content is established. In the SAPUI5 Demo Kit the BlockLayout serves as a flexible container for diverging content, such as headings, explanatory texts, code snippets, remarks, and examples.
		 * The BlockLayout comes in three types: Layout only (default), Bright, and Mixed background colors.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.ui.layout.BlockLayout
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BlockLayout = Control.extend("sap.ui.layout.BlockLayout", { metadata : {

			library : "sap.ui.layout",
			properties : {
				/**
				 * Determines the background used for the Layout
				 * @since 1.42
				 */
				background: { type: "sap.ui.layout.BlockBackgroundType", group: "Appearance", defaultValue: "Default" }

			},
			defaultAggregation : "content",
			aggregations : {
				/**
				 * The Rows to be included in the content of the control
				 */
				content: { type: "sap.ui.layout.BlockLayoutRow", multiple: true }
			}
		}});

		/**
		 * Breakpoints used for the parent container of the Layout, to determine the inner representation of the rows.
		 * @type {{breakPointM: number, breakPointL: number}}
		 */
		BlockLayout.CONSTANTS = {
			breakPointM : 600,
			breakPointL : 1024,
			SIZES: {
				S: 600,  //Phone
				M: 1024, //Tablet
				L: 1440, //Desktop
				XL: null //LargeDesktop
			}
		};

		BlockLayout.prototype.onBeforeRendering = function () {
			this._detachResizeHandler();
		};

		/**
		 * Resize handler is being attached to the control after the rendering
		 */
		BlockLayout.prototype.onAfterRendering = function () {
			this._parentResizeHandler = sap.ui.core.ResizeHandler.register(this, this._onParentResize.bind(this));
			this._onParentResize();
		};

		/**
		 * Changes background type
		 *
		 * @param {string} sNewBackground Background's style of type sap.ui.layout.BlockBackgroundType
		 * @returns {sap.ui.layout.BlockLayout} BlockLayout instance. Allows method chaining
		 */
		BlockLayout.prototype.setBackground = function (sNewBackground) {
			var sCurBackground = this.getBackground(),
			// Apply here so if there's an exception the code bellow won't be executed
				oObject = Control.prototype.setProperty.apply(this, ["background"].concat(Array.prototype.slice.call(arguments)));

			if (this.hasStyleClass("sapUiBlockLayoutBackground" + sCurBackground)) {
				this.removeStyleClass("sapUiBlockLayoutBackground" + sCurBackground, true);
			}
			this.addStyleClass("sapUiBlockLayoutBackground" + sNewBackground, true);

			// Invalidate the whole block layout as the background dependencies, row color sets and accent cells should be resolved properly
			this.invalidate();

			return oObject;
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

			this._removeBreakpointClasses();

			// Put additional styles according to SAP_STANDARD_EXTENDED from sap.ui.Device.media.RANGESETS
			// Not possible to use sap.ui.Device directly as it calculates window size, but here is needed parent's size
			for (sProp in mSizes) {
				if (mSizes.hasOwnProperty(sProp) && (mSizes[sProp] === null || mSizes[sProp] > iWidth)) {
					this.addStyleClass("sapUiBlockLayoutSize" + sProp, true);
					break;
				}
			}
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
		 * Detaches the parent resize handler
		 * @private
		 */
		BlockLayout.prototype._detachResizeHandler = function () {
			if (this._parentResizeHandler) {
				sap.ui.core.ResizeHandler.deregister(this._parentResizeHandler);
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

	}, /* bExport= */ true);

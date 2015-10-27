/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
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
			breakPointL : 1024
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
		 * Handler for the parent resize event
		 * @private
		 */
		BlockLayout.prototype._onParentResize = function () {
			var domRef = this.getDomRef(),
				width = domRef.clientWidth;

			this._removeBreakpointClasses();

			if (width <= BlockLayout.CONSTANTS.breakPointM) {
				this.addStyleClass("sapUiBlockLayoutSmall", true);
			} else if (width > BlockLayout.CONSTANTS.breakPointM && width < BlockLayout.CONSTANTS.breakPointL) {
				this.addStyleClass("sapUiBlockLayoutMedium", true);
			} else {
				this.addStyleClass("sapUiBlockLayoutBig", true);
			}
		};

		/**
		 * Removes all breakpoint classes
		 * @private
		 */
		BlockLayout.prototype._removeBreakpointClasses = function () {
			this.removeStyleClass("sapUiBlockLayoutBig", true);
			this.removeStyleClass("sapUiBlockLayoutMedium", true);
			this.removeStyleClass("sapUiBlockLayoutSmall", true);
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

/*!
 * ${copyright}
 */

// Provides control sap.m.ScrollContainer
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/core/Element",
	"./ScrollContainerRenderer",
	"sap/ui/dom/denormalizeScrollBeginRTL"
],
	function(
		library,
		Control,
		ScrollEnablement,
		Element,
		ScrollContainerRenderer,
		denormalizeScrollBeginRTL
	) {
		"use strict";


		/**
		 * Constructor for a new ScrollContainer.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The ScrollContainer is a control that can display arbitrary content within a limited screen area and provides scrolling to make all content accessible.
		 * <h3>When not to use</h3>
		 * Do not nest scrolling areas that scroll in the same direction (e.g. a ScrollContainer that scrolls vertically inside a Page control with scrolling enabled).
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.ScrollContainer
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ScrollContainer = Control.extend("sap.m.ScrollContainer", /** @lends sap.m.ScrollContainer.prototype */ {
			metadata: {

				library: "sap.m",
				properties: {
					/**
					 * The width of the ScrollContainer.
					 * If not set, it consumes the complete available width, behaving like normal HTML block elements. If only vertical scrolling is enabled, make sure the content always fits or wraps.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: 'auto'},

					/**
					 * The height of the ScrollContainer.
					 * By default the height equals the content height. If only horizontal scrolling is used, do not set the height or make sure the height is always larger than the height of the content.
					 *
					 * Note that when a percentage is given, for the height to work as expected, the height of the surrounding container must be defined.
					 */
					height: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: 'auto'},

					/**
					 * Whether horizontal scrolling should be possible.
					 */
					horizontal: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Whether vertical scrolling should be possible.
					 *
					 * Note that this is off by default because typically a Page is used as fullscreen element which can handle vertical scrolling. If this is not the case and vertical scrolling is required, this flag needs to be set to "true".
					 * Important: it is not supported to have nested controls that both enable scrolling into the same dimension.
					 */
					vertical: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * Whether the scroll container can be focused.
					 *
					 * Note that it should be set to "true" when there are no focusable elements inside or when keyboard interaction requires an additional tab stop on the container.
					 */
					focusable: {type: "boolean", group: "Behavior", defaultValue: false}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * The content of the ScrollContainer.
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
				},
				dnd: { draggable: false, droppable: true },
				designtime: "sap/m/designtime/ScrollContainer.designtime"
			}
		});

		ScrollContainer.prototype.init = function () {
			this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
				horizontal: true,
				vertical: false
			});
		};

		ScrollContainer.prototype.onBeforeRendering = function () {
			// properties are not known during init
			this._oScroller.setHorizontal(this.getHorizontal());
			this._oScroller.setVertical(this.getVertical());
		};

		/**
		 * Called when the control is destroyed.
		 *
		 * @private
		 */
		ScrollContainer.prototype.exit = function () {
			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}
		};

		/**
		 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
		 * @rerurns {sap.ui.core.ScrollEnablementDelegate} The scroll delegate instance
		 * @private
		 */
		ScrollContainer.prototype.getScrollDelegate = function () {
			return this._oScroller;
		};

		//*** API Methods ***


		/**
		 * Scrolls to the given position.
		 * When called while the control is not rendered (yet), the scrolling position is still applied, but there is no animation.
		 *
		 * @param {int} x
		 *         The horizontal pixel position to scroll to.
		 *         Scrolling to the right happens with positive values. In right-to-left mode scrolling starts at the right side and higher values scroll to the left.
		 *         If only vertical scrolling is enabled, give 0 as value.
		 * @param {int} y
		 *         The vertical pixel position to scroll to.
		 *         Scrolling down happens with positive values.
		 *         If only horizontal scrolling is enabled, give 0 as value.
		 * @param {int} time
		 *         The duration of animated scrolling.
		 *         To scroll immediately without animation, give 0 as value. 0 is also the default value, when this optional parameter is omitted.
		 * @returns {sap.m.ScrollContainer} <code>this</code> to facilitate method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ScrollContainer.prototype.scrollTo = function (x, y, time) {
			if (this._oScroller) {

				var oDomRef = this.getDomRef();
				if (oDomRef) {
					// only if rendered
					if (sap.ui.getCore().getConfiguration().getRTL()) {
						x = denormalizeScrollBeginRTL(x, oDomRef);
					}
					this._oScroller.scrollTo(x, y, time);
				} else {
					// remember for later rendering
					this._oScroller._scrollX = x;
					this._oScroller._scrollY = y;
				}
			}
			return this;
		};

		/**
		 * Scrolls to an element(DOM or sap.ui.core.Element) within the page if the element is rendered.
		 * @param {HTMLElement | sap.ui.core.Element} element The element to which should be scrolled.
		 * @param {int} [time=0] The duration of animated scrolling. To scroll immediately without animation, give 0 as value or leave it default.
		 * @returns {sap.m.ScrollContainer} <code>this</code> to facilitate method chaining.
		 * @since 1.30
		 * @public
		 */
		ScrollContainer.prototype.scrollToElement = function (element, time) {
			if (element instanceof Element) {
				element = element.getDomRef();
			}

			if (this._oScroller) {
				this._oScroller.scrollToElement(element, time);
			}
			return this;
		};

		return ScrollContainer;
	});
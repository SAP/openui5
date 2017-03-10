/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Control', './library', 'sap/ui/core/ResizeHandler'],
	function(Control, library, ResizeHandler) {
		"use strict";

		/**
		 * Constructor for a new AlignedFlowLayout.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>AlignedFlowLayout</code> arranges its child controls evenly across the available horizontal space,
		 * each item gets the same width and grows and shrinks in response to the layout width.
		 * Items not fitting into a row when considering the configured <code>minItemWidth</code> property, wrap into
		 * the next row (like in a regular flow layout). However, those wrapped items have the same flexible widths as
		 * the items in the rows above, so they are aligned.
		 * In addition, there is a special <code>endContent</code> area which is positioned at the bottom right of the
		 * entire layout control.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @experimental This control is only for internal/experimental use and the API will change!
		 *
		 * @since 1.48
		 * @alias sap.ui.layout.AlignedFlowLayout
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var AlignedFlowLayout = Control.extend("sap.ui.layout.AlignedFlowLayout", {
			metadata: {
				library: "sap.ui.layout",
				properties: {

					/**
					 * TODO.
					 */
					minItemWidth: {
						type: "sap.ui.core.CSSSize",
						defaultValue: "240px" // =15rem, but easier to get pixel size TODO: verify  TODO: percentages do not make sense!  TODO: Reasonable default?
					}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * TODO.
					 * TODO: mention constraints, e.g. size/complexity of items, and whether content can be added that tries to adapt to the parent height.
					 */
					content: {
						type: "sap.ui.core.Control",
						multiple: true
					},

					/**
					 * TODO.
					 */
					endContent: {
						type: "sap.ui.core.Control",
						multiple: true // TODO: multiple?
					}
				}
			}
		});

		AlignedFlowLayout.prototype.init = function() {

			// indicates whether the items currently all fit in one line
			this._bItemsFitInFirstLine = false;
			this._iEndContentWidth = -1;
			this._oLastVisibleElement = null;
			this._bEnoughSpaceForEndContent = undefined;

			// registration ID used for deregistering the resize handler
			this._sResizeListenerId = ResizeHandler.register(this, this._onResize.bind(this));
		};

		AlignedFlowLayout.prototype.exit = function() {
			if (this._sResizeListenerId) {
				ResizeHandler.deregister(this._sResizeListenerId);
				this._sResizeListenerId = "";
			}
		};

		AlignedFlowLayout.prototype._onRenderingOrThemeChanged = function() {
			var oDomRef = this.getDomRef(),
				oEndContentDomRef = this.getDomRef("endContent");

			if (oEndContentDomRef && this.getContent().length) {
				this._iEndContentWidth = oEndContentDomRef.offsetWidth;
				oDomRef.lastElementChild.style.width = this._iEndContentWidth + "px";
			}

			this._oLastVisibleElement = oEndContentDomRef || this.getLastContentDomRef();
			this._onResize();
		};

		AlignedFlowLayout.prototype.onAfterRendering = AlignedFlowLayout.prototype._onRenderingOrThemeChanged;
		AlignedFlowLayout.prototype.onThemeChanged = AlignedFlowLayout.prototype._onRenderingOrThemeChanged;

		AlignedFlowLayout.prototype._onResize = function(oEvent) {

			// called by resize handler, but only the height changed, so there is nothing to do; this is required to avoid a resizing loop
			if ((oEvent && (oEvent.size.width === oEvent.oldSize.width)) || (this.getContent().length === 0)) {
				return;
			}

			this._checkRowCount();
			var oEndContentDomRef = this.getDomRef("endContent");

			// only needed if there is any endContent;  TODO: de-/register ResizeHandler after rendering depending on whether we have endContent
			if (!oEndContentDomRef) {
				return;
			}

			var oDomRef = this.getDomRef(),
				oLastContentDomRef = this.getLastContentDomRef(),
				iRightBorderOfLastItem = oLastContentDomRef.offsetLeft + oLastContentDomRef.offsetWidth,
				bEnoughSpaceForEndContent = (oDomRef.offsetWidth - iRightBorderOfLastItem >= this._iEndContentWidth);

			if (bEnoughSpaceForEndContent !== this._bEnoughSpaceForEndContent) { // only when it changes

				var oLastElementChildStyle = oDomRef.lastElementChild.style;

				if (bEnoughSpaceForEndContent) { // if endContent fits into the line

					if (this._bItemsFitInFirstLine) {
						oLastElementChildStyle.display = "block";
					} else {
						oLastElementChildStyle.height = "0";
						oLastElementChildStyle.display = "";
					}

				} else { // not enough space - increase the height of the last item to make the endContent go down
					oLastElementChildStyle.height = oEndContentDomRef.offsetHeight + "px";
					oLastElementChildStyle.display = "block";
				}
			}
		};

		/*
		 * Checks whether the visible content fits is currently in one line and sets a CSS class in this case,
		 * which is needed for the invisible spacer elements.
		 * Notice, it needs to be called after rendering, theme change, and whenever the width of this control changes.
		 */
		AlignedFlowLayout.prototype._checkRowCount = function() {

			// behavior with all elements in the first row is different than when there is wrapping;
			// we have to detect and differentiate
			if (this._oLastVisibleElement) {

				var oDomRef = this.getDomRef();

				// flex elements fill the row height, so the first child height is the row height; the last element is absolutely positioned, so use height+top
				var bOneLineNow = (this._oLastVisibleElement.offsetTop + this._oLastVisibleElement.offsetHeight <= oDomRef.firstElementChild.offsetHeight);

				// state has changed, so update the flag and the CSS class
				if (bOneLineNow !== this._bItemsFitInFirstLine) {
					this.$().toggleClass("sapUiAFLayoutOneLine", bOneLineNow);
					this._bItemsFitInFirstLine = bOneLineNow;
				}
			}
		};

		/*
		 * Returns the DomRef of the last content control - if this control and its DomRef exist.
		 */
		AlignedFlowLayout.prototype.getLastContentDomRef = function() {
			var aContent = this.getContent(),
				iContentLength = aContent.length;

			if (iContentLength) {

				var oContent = aContent[aContent.length - 1];

				if (oContent) {
					return oContent.getDomRef();
				}
			}

			return null;
		};

		return AlignedFlowLayout;
}, /* bExport= */ true);
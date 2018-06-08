/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPageHeader.
sap.ui.define([
    "./library",
    "sap/ui/Device",
    "sap/ui/core/Control",
    "sap/m/ToggleButton",
    "sap/m/Button",
    "./DynamicPageHeaderRenderer"
], function(
    library,
	Device,
	Control,
	ToggleButton,
	Button,
	DynamicPageHeaderRenderer
) {
		"use strict";

		/**
		 * Constructor for a new <code>DynamicPageHeader</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Header of the {@link sap.f.DynamicPage}.
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>DynamicPageHeader</code> control is part of the {@link sap.f.DynamicPage} family
		 * and is used to serve as header of the {@link sap.f.DynamicPage DynamicPage}.
		 *
		 * <h3>Usage</h3>
		 *
		 * The <code>DynamicPageHeader</code> can hold any layout control and has  two states - expanded
		 * and collapsed (snapped). The switching between these states happens when:
		 *
		 * <ul><li>the user scrolls below its bottom margin</li>
		 * <li>the user clicks on the {@link sap.f.DynamicPageTitle DynamicPageTitle}</li>
		 * <li>through the {@link sap.f.DynamicPage DynamicPage} property <code>headerExpanded</code></li></ul>
		 *
		 * <h3>Responsive Behavior</h3>
		 *
		 * The responsive behavior of the <code>DynamicPageHeader</code> depends on the behavior of the
		 * content that is displayed.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.42
		 * @alias sap.f.DynamicPageHeader
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var DynamicPageHeader = Control.extend("sap.f.DynamicPageHeader", /** @lends sap.f.DynamicPageHeader.prototype */ {
			metadata: {
				library: "sap.f",
				properties: {
					/**
					 * Determines whether the header is pinnable.
					 */
					pinnable: {type: "boolean", group: "Appearance", defaultValue: true}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * The content of the header.
					 */
					content: {type: "sap.ui.core.Control", multiple: true},

					/**
					 *  The pin/unpin button in the header.
					 */
					_pinButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

					/**
					 * Visual indication for expanding/collapsing.
					 */
					_collapseButton: {type: "sap.m.Button", multiple: false,  visibility: "hidden"}
				},
				designtime: "sap/f/designtime/DynamicPageHeader.designtime"
			}
		});

		/*************************************** Static members ******************************************/

		/**
		 * Retrieves the resource bundle for the <code>sap.f</code> library.
		 * @returns {Object} the resource bundle object
		 */
		DynamicPageHeader._getResourceBundle = function () {
			return sap.ui.getCore().getLibraryResourceBundle("sap.f");
		};

		DynamicPageHeader.ARIA = {
			ARIA_CONTROLS: "aria-controls",
			ARIA_EXPANDED: "aria-expanded",
			ARIA_LABEL: "aria-label",
			LABEL_EXPANDED: DynamicPageHeader._getResourceBundle().getText("EXPANDED_HEADER"),
			LABEL_COLLAPSED: DynamicPageHeader._getResourceBundle().getText("SNAPPED_HEADER"),
			LABEL_PINNED: DynamicPageHeader._getResourceBundle().getText("PIN_HEADER"),
			LABEL_UNPINNED: DynamicPageHeader._getResourceBundle().getText("UNPIN_HEADER"),
			TOOLTIP_COLLAPSE_BUTTON: DynamicPageHeader._getResourceBundle().getText("COLLAPSE_HEADER_BUTTON_TOOLTIP"),
			STATE_TRUE: "true",
			STATE_FALSE: "false"
		};

		/*************************************** Lifecycle members ******************************************/
		DynamicPageHeader.prototype.init = function() {
			this._bShowCollapseButton = true;
		};

		DynamicPageHeader.prototype.onAfterRendering = function () {
			this._initARIAState();
			this._initPinButtonARIAState();
		};

		/*************************************** Private members ******************************************/

		/**
		 * Determines the pin/unpin toggle button state.
		 * @param {boolean} bValue
		 * @private
		 */
		DynamicPageHeader.prototype._togglePinButton = function (bValue) {
			this._getPinButton().setPressed(bValue);
		};

		/**
		 * Shows/hides the pin/unpin button without re-rendering.
		 * @param {boolean} bValue to show or hide the button
		 * @private
		 */
		DynamicPageHeader.prototype._setShowPinBtn = function (bValue) {
			this._getPinButton().$().toggleClass("sapUiHidden", !bValue);
		};

		/**
		 * Fires the pin/unpin press event.
		 * @private
		 */
		DynamicPageHeader.prototype._pinUnpinFireEvent = function () {
			this.fireEvent("_pinUnpinPress");
		};

		/**
		 * Handles <code>collapseButton</code> <code>press</code> event.
		 * @private
		 */
		DynamicPageHeader.prototype._onCollapseButtonPress = function () {
			this.fireEvent("_headerVisualIndicatorPress");
		};

		/**
		* Handles <code>collapseButton</code> <code>mouseover</code> event.
		* @private
		*/
		DynamicPageHeader.prototype._onCollapseButtonMouseOver = function () {
			this.fireEvent("_visualIndicatorMouseOver");
		};

		/**
		* Handles <code>collapseButton</code> <code>mouseout</code> event.
		* @private
		*/
		DynamicPageHeader.prototype._onCollapseButtonMouseOut = function () {
			this.fireEvent("_visualIndicatorMouseOut");
		};

		/**
		 * Initializes the <code>DynamicPageHeader</code> ARIA State.
		 * @private
		 */
		DynamicPageHeader.prototype._initARIAState = function () {
			var $header = this.$();

			$header.attr(DynamicPageHeader.ARIA.ARIA_EXPANDED, DynamicPageHeader.ARIA.STATE_TRUE);
			$header.attr(DynamicPageHeader.ARIA.ARIA_LABEL, DynamicPageHeader.ARIA.LABEL_EXPANDED);
		};

		/**
		 * Initializes the <code>DynamicPageHeader</code> pin/unpin ARIA State.
		 * @private
		 */
		DynamicPageHeader.prototype._initPinButtonARIAState = function () {
			var $pinButton;

			if (this.getPinnable()) {
				$pinButton = this._getPinButtonJQueryRef();
				$pinButton.attr(DynamicPageHeader.ARIA.ARIA_CONTROLS, this.getId());
			}
		};

		/**
		 * Updates <code>DynamicPageHeader</code> ARIA attributes values according to expanded/collapsed (snapped) state.
		 * @param {Boolean} bExpanded expanded or collapsed (snapped)
		 * @private
		 */
		DynamicPageHeader.prototype._updateARIAState = function (bExpanded) {
			var $header = this.$();

			if (bExpanded) {
				$header.attr(DynamicPageHeader.ARIA.ARIA_EXPANDED, DynamicPageHeader.ARIA.STATE_TRUE);
				$header.attr(DynamicPageHeader.ARIA.ARIA_LABEL, DynamicPageHeader.ARIA.LABEL_EXPANDED);
			} else {
				$header.attr(DynamicPageHeader.ARIA.ARIA_EXPANDED, DynamicPageHeader.ARIA.STATE_FALSE);
				$header.attr(DynamicPageHeader.ARIA.ARIA_LABEL, DynamicPageHeader.ARIA.LABEL_COLLAPSED);
			}
		};

		/**
		 * Updates <code>DynamicPageHeader</code> pin/unpin button ARIA attributes values according to the pinned/unpinned state.
		 * @param {Boolean} bPinned determines if the <code>DynamicPageHeader</code> is pinned or unpinned
		 * @private
		 */
		DynamicPageHeader.prototype._updateARIAPinButtonState = function (bPinned) {
			var oPinBtn = this._getPinButton();

			if (bPinned) {
				oPinBtn.setTooltip(DynamicPageHeader.ARIA.LABEL_UNPINNED);
			} else {
				oPinBtn.setTooltip(DynamicPageHeader.ARIA.LABEL_PINNED);
			}
		};

		/**
		 * Lazily retrieves the <code>DynamicPageHeader</code> pin/unpin button.
		 * @returns {sap.m.ToggleButton}
		 * @private
		 */
		DynamicPageHeader.prototype._getPinButton = function () {
			if (!this.getAggregation("_pinButton")) {
				var oPinButton = new ToggleButton({
					id: this.getId() + "-pinBtn",
					icon: "sap-icon://pushpin-off",
					tooltip: DynamicPageHeader.ARIA.LABEL_PINNED,
					press: this._pinUnpinFireEvent.bind(this)
				}).addStyleClass("sapFDynamicPageHeaderPinButton");
				this.setAggregation("_pinButton", oPinButton, true);
			}

			return this.getAggregation("_pinButton");
		};

		/**
		 * Lazily retrieves the <code>collapseButton</code> aggregation.
		 * @returns {sap.m.Button}
		 * @private
		 */
		DynamicPageHeader.prototype._getCollapseButton = function () {
			if (!this.getAggregation("_collapseButton")) {
				var oCollapseButton = new Button({
					id: this.getId() + "-collapseBtn",
					icon: "sap-icon://slim-arrow-up",
					press: this._onCollapseButtonPress.bind(this),
					tooltip: DynamicPageHeader.ARIA.TOOLTIP_COLLAPSE_BUTTON
				}).addStyleClass("sapFDynamicPageToggleHeaderIndicator");

				oCollapseButton.onmouseover = this._onCollapseButtonMouseOver.bind(this);
				oCollapseButton.onmouseout = this._onCollapseButtonMouseOut.bind(this);

				this.setAggregation("_collapseButton", oCollapseButton, true);
			}

			return this.getAggregation("_collapseButton");
		};

		/**
		 * Toggles the <code>collapseButton</code> visibility.
		 * @param {boolean} bToggle
		 * @private
		 */
		DynamicPageHeader.prototype._toggleCollapseButton = function (bToggle) {
			this._setShowCollapseButton(bToggle);
			this._getCollapseButton().$().toggleClass("sapUiHidden", !bToggle);
		};

		/**
		 * Returns the private <code>bShowExpandButton</code> property.
		 * @returns {boolean}
		 * @private
		 */
		DynamicPageHeader.prototype._getShowCollapseButton = function () {
			return this._bShowCollapseButton;
		};

		/**
		 * Sets the private <code>_bShowCollapseButton</code> property.
		 * @param {boolean} bValue
		 * @private
		 */
		DynamicPageHeader.prototype._setShowCollapseButton = function (bValue) {
			this._bShowCollapseButton = !!bValue;
		};

		/**
		 * Focuses the <code>collapseButton</code> button.
		 * @private
		 */
		DynamicPageHeader.prototype._focusCollapseButton = function () {
			this._getCollapseButton().$().focus();
		};

		/**
		 * Focuses the <code>DynamicPageHeader</code> pin/unpin button.
		 * @private
		 */
		DynamicPageHeader.prototype._focusPinButton = function () {
			this._getPinButtonJQueryRef().focus();
		};

		/**
		 * Returns the <code>DynamicPageHeader</code> pin/unpin button DOM Ref.
		 * @return {jQuery}
		 * @private
		 */
		DynamicPageHeader.prototype._getPinButtonJQueryRef = function () {
			return this._getPinButton().$();
		};

		/**
		* Determines the <code>DynamicPageHeader</code> state.
		* @returns {Object}
		* @private
		*/
		DynamicPageHeader.prototype._getState = function () {
			var aContent = this.getContent(),
				bHeaderHasContent = aContent.length > 0,
				bHeaderPinnable = this.getPinnable() && bHeaderHasContent && !Device.system.phone,
				oPinButton = this._getPinButton(),
				oCollapseButton = this._getCollapseButton();

			oCollapseButton.toggleStyleClass("sapUiHidden", !this._getShowCollapseButton());

			return {
				content: aContent,
				headerHasContent: bHeaderHasContent,
				headerPinnable: bHeaderPinnable,
				hasContent: aContent.length > 0,
				pinButton: oPinButton,
				collapseButton: oCollapseButton
			};
		};

		return DynamicPageHeader;
	});

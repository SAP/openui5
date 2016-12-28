/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPageHeader.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Control", "sap/ui/core/InvisibleText", "sap/m/ButtonType", "sap/m/ToggleButton"],
	function (jQuery, library, Control, InvisibleText, ButtonType, ToggleButton) {
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
				aggregations: {

					/**
					 * The content of the header.
					 */
					content: {type: "sap.ui.core.Control", multiple: true},

					/**
					 *  The pin/unpin button in the header.
					 */
					_pinButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
				}
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
			LABEL_SNAPPED: DynamicPageHeader._getResourceBundle().getText("SNAPPED_HEADER"),
			LABEL_PINNED: DynamicPageHeader._getResourceBundle().getText("PIN_HEADER"),
			LABEL_UNPINNED: DynamicPageHeader._getResourceBundle().getText("UNPIN_HEADER"),
			STATE_TRUE: "true",
			STATE_FALSE: "false"
		};

		/*************************************** Lifecycle members ******************************************/
		DynamicPageHeader.prototype.onAfterRendering = function () {
			this._initARIAState();
			this._initPinButtonARIAState();
		};

		/*************************************** Private members ******************************************/

		/**
		 * Determines the pin/unpin toggle button state.
		 * @param bValue
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
				$header.attr(DynamicPageHeader.ARIA.ARIA_LABEL, DynamicPageHeader.ARIA.LABEL_SNAPPED);
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
					type: ButtonType.Transparent,
					press: this._pinUnpinFireEvent.bind(this)
				});
				this.setAggregation("_pinButton", oPinButton, true);
			}

			return this.getAggregation("_pinButton");
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

		return DynamicPageHeader;

	}, /* bExport= */ false);

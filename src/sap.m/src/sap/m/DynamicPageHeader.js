/*!
 * ${copyright}
 */

// Provides control sap.m.DynamicPageHeader.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Control", "sap/ui/core/InvisibleText", "./ToggleButton"],
	function (jQuery, library, Control, InvisibleText, ToggleButton) {
		"use strict";

		/**
		 * Constructor for a new Basic Page Layout Header.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The DynamicPage header can hold any UI5 layout control. The header has two versions - snapped and expanded.
		 * The header switches between these modes when the user scrolls below its bottom margin.
		 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.38
		 * @alias sap.m.DynamicPageHeader
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var DynamicPageHeader = Control.extend("sap.m.DynamicPageHeader", /** @lends sap.m.DynamicPageHeader.prototype */ {
			metadata: {
				interfaces: [
					"sap.m.ISnappable"
				],
				library: "sap.m",
				properties: {
					/**
					 * Determines whether the header will be pinnable.
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

		DynamicPageHeader._LIBRARY = "sap.m";

		/**
		 * Retrieves the resource bundle for the sap.m library
		 *
		 * @returns {Object} the resource bundle object
		 */
		DynamicPageHeader._getResourceBundle = function () {
			return sap.ui.getCore().getLibraryResourceBundle(DynamicPageHeader._LIBRARY);
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

		DynamicPageHeader.prototype.onBeforeRendering = function () {
			if (this.getPinnable()) {
				this._getPinButton().addAriaLabelledBy(this._getARIAInvisibleText());
			}
		};

		DynamicPageHeader.prototype.onAfterRendering = function () {
			this._initARIAState();
			this._initPinButtonARIAState();
		};

		/*************************************** Private members ******************************************/

		/**
		 * Determines the pin/unpin toggle button state
		 * @param bValue
		 * @private
		 */
		DynamicPageHeader.prototype._togglePinButton = function (bValue) {
			this._getPinButton().setPressed(bValue);
		};

		/**
		 * Used to internally show/hide the pin/unpin button without going through the rendering phase
		 * @param {boolean} bValue - to show or to hide the button
		 * @private
		 */
		DynamicPageHeader.prototype._setShowPinBtn = function (bValue) {
			this._getPinButton().$().toggleClass("sapUiHidden", !bValue);
		};

		/**
		 * Fires the pin/unpin press event
		 * @private
		 */
		DynamicPageHeader.prototype._pinUnpinFireEvent = function () {
			this.fireEvent("_pinUnpinPress");
		};

		/**
		 * Initializes the Header ARIA State.
		 * @private
		 */
		DynamicPageHeader.prototype._initARIAState = function () {
			var $header = this.$();

			$header.attr(DynamicPageHeader.ARIA.ARIA_EXPANDED, DynamicPageHeader.ARIA.STATE_TRUE);
			$header.attr(DynamicPageHeader.ARIA.ARIA_LABEL, DynamicPageHeader.ARIA.LABEL_EXPANDED);
		};

		/**
		 * Initializes the Header Pin Button ARIA State.
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
		 * Updates Header ARIA attributes values according to expanded/snapped state.
		 * @param {Boolean} bExpanded determines if the Header is expanded or snapped
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
		 * Updates Header Pin Button ARIA attributes values according to pinned/unpinned state.
		 * @param {Boolean} bPinned determines if the Header is pinned or unpinned
		 * @private
		 */
		DynamicPageHeader.prototype._updateARIAPinButtonState = function (bPinned) {
			var oInvisibleText = this._getARIAInvisibleText();

			if (bPinned) {
				oInvisibleText.setText(DynamicPageHeader.ARIA.LABEL_UNPINNED);
			} else {
				oInvisibleText.setText(DynamicPageHeader.ARIA.LABEL_PINNED);
			}
		};

		/**
		 * Lazily loads ARIA sap.ui.core.InvisibleText for the given translation text
		 *
		 * @param {String} sARIAText the ARIA announcement text
		 * @returns {Object} the InvisibleText control
		 * @private
		 */
		DynamicPageHeader.prototype._getARIAInvisibleText = function () {
			if (!this._oInvisibleText) {
				this._oInvisibleText = new InvisibleText({
					text: DynamicPageHeader.ARIA.LABEL_PINNED
				}).toStatic();
			}

			return this._oInvisibleText;
		};

		/**
		 * Lazily retrieves the Header Pin button.
		 * @returns {sap.m.ToggleButton}
		 * @private
		 */
		DynamicPageHeader.prototype._getPinButton = function () {
			if (!this.getAggregation("_pinButton")) {
				var oPinButton = new ToggleButton({
					id: this.getId() + "-pinBtn",
					icon: "sap-icon://pushpin-off",
					press: this._pinUnpinFireEvent.bind(this)
				});
				this.setAggregation("_pinButton", oPinButton, true);
			}

			return this.getAggregation("_pinButton");
		};

		/**
		 * Focuses the Header Pin button.
		 * @private
		 */
		DynamicPageHeader.prototype._focusPinButton = function () {
			this._getPinButtonJQueryRef().focus();
		};

		/**
		 * Returns the Header Pin Button DOM Ref.
		 * @return {jQuery}
		 * @private
		 */
		DynamicPageHeader.prototype._getPinButtonJQueryRef = function () {
			return this._getPinButton().$();
		};

		return DynamicPageHeader;

	}, /* bExport= */ false);

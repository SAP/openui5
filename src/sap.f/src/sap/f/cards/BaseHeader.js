/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/core/Lib",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/library",
	"sap/m/Text"
], function (
	Control,
	IntervalTrigger,
	Library,
	DateFormat,
	UniversalDate,
	coreLibrary,
	Text
) {
	"use strict";

	/**
	 * @const int The refresh interval for dataTimestamp in ms.
	 */
	var DATA_TIMESTAMP_REFRESH_INTERVAL = 60000;

	var TextAlign = coreLibrary.TextAlign;

	/**
	 * Constructor for a new <code>BaseHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides basic functionality for header controls that can be used in <code>sap.f.Card</code.
	 *
	 * @extends sap.ui.core.Control
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.86
	 * @alias sap.f.cards.BaseHeader
	 */
	var BaseHeader = Control.extend("sap.f.cards.BaseHeader", {
		metadata: {
			library: "sap.f",
			"abstract" : true,
			properties: {
				/**
				 * Defines the timestamp of the oldest data in the card. Use this to show to the end user how fresh the information in the card is.
				 *
				 * Must be specified in ISO 8601 format.
				 *
				 * Will be shown as a relative time like "5 minutes ago".
				 *
				 * @experimental Since 1.89 this feature is experimental and the API may change.
				 */
				dataTimestamp: { type: "string", defaultValue: ""},

				/**
				 * Defines the status text visibility.
				 * @experimental Since 1.116 this feature is experimental and the API may change.
				 */
				statusVisible: { type: "boolean", defaultValue: true },

				/**
				 * Set to true to show that the data timestamp is currently updating.
				 * @private
				 */
				dataTimestampUpdating: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * Set to false if header shouldn't be focusable.
				 * @private
				 */
				focusable: { type: "boolean", defaultValue: true, visibility: "hidden" },

				/**
				 * If the header should be rendered as a tile.
				 * @private
				 */
				useTileLayout: { type: "boolean", group: "Appearance", visibility: "hidden" },

				/**
				 * Defines aria-level of the header.
				 *
				 * When header is in a dialog aria-level is 1
				 * When header is not in a dialog(standard scenario) aria-level is 3
				 *
				 * @private
				 */
				headingLevel: { type: "string", visibility: "hidden", defaultValue: "3"}
			},
			aggregations: {
				/**
				 * Holds the internal data timestamp text aggregation.
				 */
				_dataTimestamp: { type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * Defines the toolbar.
				 * @experimental Since 1.86
				 * @since 1.86
				 */
				toolbar: { type: "sap.ui.core.Control", multiple: false },

				/**
				 * Defines an error which will be displayed in the header.
				 */
				_error: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

				/**
				 * Show as a banner in the header area. Use for example for system info and application shortcut.
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				bannerLines: { type: "sap.m.Text", group: "Appearance", multiple: true  }
			}
		}
	});

	BaseHeader.prototype.init = function () {
		this._oRb = Library.getResourceBundleFor("sap.f");

		this._oToolbarDelegate = {
			onfocusin: this._onToolbarFocusin,
			onfocusout: this._onToolbarFocusout
		};
	};

	BaseHeader.prototype.exit = function () {
		this._removeTimestampListener();

		if (this._oToolbarDelegate) {
			this._oToolbarDelegate = null;
		}

		this._oRb = null;
	};

	BaseHeader.prototype.onBeforeRendering = function () {
		var oToolbar = this.getToolbar(),
			aBannerLines = this.getBannerLines();

		if (oToolbar) {
			oToolbar.addStyleClass("sapFCardHeaderToolbar");
			oToolbar.removeEventDelegate(this._oToolbarDelegate, this);
		}

		if (aBannerLines) {
			aBannerLines.forEach((oText) => {
				oText.setTextAlign(TextAlign.End);
			});
		}
	};

	BaseHeader.prototype.onAfterRendering = function () {
		var oToolbar = this.getToolbar();

		if (oToolbar) {
			oToolbar.addEventDelegate(this._oToolbarDelegate, this);
		}
	};

	BaseHeader.prototype.getFocusDomRef = function () {
		return this.getDomRef("focusable");
	};

	BaseHeader.prototype.ontap = function (oEvent) {
		if (this.isInteractive() && !this._isInsideToolbar(oEvent.target)) {
			this.firePress();
		}
	};

	BaseHeader.prototype.onsapselect = function (oEvent) {
		if (this.isInteractive() && !this._isInsideToolbar(oEvent.target)) {
			this.firePress();
		}
	};

	/**
	 * Adds a CSS class on the header which removes its focus outline
	 * to prevent drawing two focuses when the toolbar is focused.
	 * @private
	 */
	BaseHeader.prototype._onToolbarFocusin = function () {
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			this.getDomRef().classList.add("sapFCardHeaderToolbarFocused");
		}
	};

	/**
	 * Removes a CSS class on the header which allows the header to show its focus outline.
	 * @private
	 */
	BaseHeader.prototype._onToolbarFocusout = function () {
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			this.getDomRef().classList.remove("sapFCardHeaderToolbarFocused");
		}
	};

	/*
	 * @override
	 */
	BaseHeader.prototype.setDataTimestamp = function (sDataTimestamp) {
		var sOldDataTimestamp = this.getDataTimestamp();

		if (sOldDataTimestamp && !sDataTimestamp) {
			this.destroyAggregation("_dataTimestamp");
			this._removeTimestampListener();
		}

		this.setProperty("dataTimestamp", sDataTimestamp);

		if (sDataTimestamp) {
			this._updateDataTimestamp();
			this._addTimestampListener();
		}

		return this;
	};

	/**
	 * @private
	 */
	BaseHeader.prototype.setDataTimestampUpdating = function (bDataTimestampUpdating) {
		var oTimestampText = this._createDataTimestamp();
		this.setProperty("dataTimestampUpdating", bDataTimestampUpdating);

		if (bDataTimestampUpdating) {
			oTimestampText.setText("updating..."); //@todo translate
			oTimestampText.addStyleClass("sapFCardDataTimestampUpdating");
			this._removeTimestampListener();
		} else {
			oTimestampText.removeStyleClass("sapFCardDataTimestampUpdating");
		}

		return this;
	};

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 */
	BaseHeader.prototype._createDataTimestamp = function () {
		var oDataTimestamp = this.getAggregation("_dataTimestamp");

		if (!oDataTimestamp) {
			oDataTimestamp = new Text({
				wrapping: false,
				textAlign: "End"
			});
			oDataTimestamp.addStyleClass("sapFCardDataTimestamp");
			this.setAggregation("_dataTimestamp", oDataTimestamp);
		}

		return oDataTimestamp;
	};

	/**
	 * Updates the formatted data timestamp.
	 * @private
	 */
	BaseHeader.prototype._updateDataTimestamp = function () {
		var oDataTimestamp = this._createDataTimestamp(),
			sDataTimestamp = this.getDataTimestamp(),
			oDateFormat,
			oUniversalDate,
			sFormattedText;

		if (!sDataTimestamp) {
			oDataTimestamp.setText("");
			return;
		}

		oDateFormat = DateFormat.getDateTimeInstance({relative: true});
		oUniversalDate = new UniversalDate(sDataTimestamp);
		sFormattedText = oDateFormat.format(oUniversalDate);

		// no less than "1 minute ago" should be shown, "30 seconds ago" should not be shown
		if (oUniversalDate.getTime() + 59000 > Date.now()) {
			sFormattedText = "now"; //@todo get formatted (translated text) for "now"
		}

		oDataTimestamp.setText(sFormattedText);
		oDataTimestamp.removeStyleClass("sapFCardDataTimestampUpdating");
	};

	/**
	 * Adds listener to update the timestamp on interval.
	 * @private
	 */
	BaseHeader.prototype._addTimestampListener = function () {
		BaseHeader.getTimestampIntervalTrigger().addListener(this._updateDataTimestamp, this);

		this._bHasTimestampListener = true;
	};

	/**
	 * Removes the listener for updating the timestamp.
	 * @private
	 */
	BaseHeader.prototype._removeTimestampListener = function () {
		if (!this._bHasTimestampListener) {
			return;
		}

		BaseHeader.getTimestampIntervalTrigger().removeListener(this._updateDataTimestamp, this);

		this._bHasTimestampListener = false;
	};

	/**
	 * Gets or creates an interval trigger for the timestamp which is shared for all card headers.
	 * @private
	 * @ui5-restricted
	 * @returns {sap.ui.core.IntervalTrigger} The timestamp interval trigger for all card headers.
	 */
	BaseHeader.getTimestampIntervalTrigger = function () {
		if (!BaseHeader._oTimestampIntervalTrigger) {
			BaseHeader._oTimestampIntervalTrigger = new IntervalTrigger(DATA_TIMESTAMP_REFRESH_INTERVAL);
		}

		return BaseHeader._oTimestampIntervalTrigger;
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getTitleAriaRole = function () {
		return "heading";
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getFocusableElementAriaRole = function () {
		return this.hasListeners("press") ? "button" : "group";
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getAriaHeadingLevel = function () {
		return this.getProperty("headingLevel");
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getAriaRoleDescription = function () {
		return this.hasListeners("press") ? this._oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER") : this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER");
	};

	/**
	 * Gets the ids of the banner lines to be used in aria-labelledby
	 * @returns {string} The ids of the banner lines.
	 */
	BaseHeader.prototype._getBannerLinesIds = function () {
		return this.getBannerLines().map((oBannerLine) => {
			return oBannerLine.getId();
		}).join(" ");
	};

	/**
	 * Returns if the control is inside a sap.f.GridContainer
	 *
	 * @private
	 */
	BaseHeader.prototype._isInsideGridContainer = function() {
		var oParent = this.getParent();
		if (!oParent) {
			return false;
		}

		oParent = oParent.getParent();
		if (!oParent) {
			return false;
		}

		return oParent.isA("sap.f.GridContainer");
	};

	BaseHeader.prototype.isInteractive = function() {
		return this.hasListeners("press");
	};

	BaseHeader.prototype._isInsideToolbar = function(oElement) {
		var oToolbar = this.getToolbar();

		return oToolbar && oToolbar.getDomRef() && oToolbar.getDomRef().contains(oElement);
	};

	return BaseHeader;
});

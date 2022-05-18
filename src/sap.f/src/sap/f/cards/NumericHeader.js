/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseHeader",
	"./NumericIndicators",
	"sap/m/Text",
	"sap/f/cards/NumericHeaderRenderer",
	"sap/ui/core/Core"
], function (
	BaseHeader,
	NumericIndicators,
	Text,
	NumericHeaderRenderer,
	Core
) {
	"use strict";

	/**
	 * Constructor for a new <code>NumericHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.f.Card} and allows the
	 * configuration of a numeric value visualization.
	 *
	 * You can configure the title, subtitle, and status text, using the provided properties.
	 * To add more side number indicators, use the <code>sideIndicators</code> aggregation.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>You should always set a title.</li>
	 * <li>You should always have a maximum of two side indicators.</li>
	 * <li>To show only basic information, use {@link sap.f.cards.Header Header} instead.</li>
	 * </ul>
	 *
	 * @extends sap.f.cards.BaseHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.64
	 * @alias sap.f.cards.NumericHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NumericHeader = BaseHeader.extend("sap.f.cards.NumericHeader", {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.cards.IHeader"],
			properties: {

				/**
				 * The title of the card
				 */
				title: { "type": "string", group: "Appearance" },

				/**
				 * Limits the number of lines for the title.
				 * @experimental since 1.101
				 */
				titleMaxLines: { type: "int", defaultValue: 3 },

				/**
				 * The subtitle of the card
				 */
				subtitle: { "type": "string", group: "Appearance" },

				/**
				 * Limits the number of lines for the subtitle.
				 * @experimental since 1.101
				 */
				subtitleMaxLines: { type: "int", defaultValue: 2 },

				/**
				 * Defines the status text.
				 */
				statusText: { type: "string", defaultValue: "" },

				/**
				 * General unit of measurement for the header. Displayed as side information to the subtitle.
				 */
				unitOfMeasurement: { "type": "string", group : "Data" },

				/**
				 * The numeric value of the main number indicator.
				 * If the value contains more than five characters, only the first five are displayed. Without rounding the number.
				 */
				number: { "type": "string", group : "Data" },

				/**
				 * Defines the unit of measurement (scaling prefix) for the main indicator.
				 * Financial characters can be used for currencies and counters. The International System of Units (SI) prefixes can be used.
				 * If the unit contains more than three characters, only the first three characters are displayed.
				 */
				scale: { "type": "string", group : "Data" },

				/**
				 * The direction of the trend arrow. Shows deviation for the value of the main number indicator.
				 */
				trend: { "type": "sap.m.DeviationIndicator", group: "Appearance", defaultValue : "None" },

				/**
				 * The semantic color which represents the state of the main number indicator.
				 * @experimental since 1.64
				 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				state: { "type": "sap.m.ValueColor", group: "Appearance", defaultValue : "Neutral" },

				/**
				 * Additional text which adds more details to what is shown in the numeric header.
				 */
				details: { "type": "string", group: "Appearance" },

				/**
				 * Limits the number of lines for the details.
				 * @experimental since 1.101
				 */
				detailsMaxLines: { type: "int", defaultValue: 1 },

				/**
				 * The alignment of the side indicators.
				 */
				sideIndicatorsAlignment: { "type": "sap.f.cards.NumericHeaderSideIndicatorsAlignment", group: "Appearance", defaultValue : "Begin" }
			},
			aggregations: {

				/**
				 * Additional side number indicators. For example "Deviation" and "Target". Not more than two side indicators should be used.
				 */
				sideIndicators: {
					type: "sap.f.cards.NumericSideIndicator",
					multiple: true,
					forwarding: {
						getter: "_getNumericIndicators",
						aggregation: "sideIndicators"
					}
				},

				/**
				 * Used to display title text
				 */
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Used to display subtitle text
				 */
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Shows unit of measurement next to subtitle
				 */
				_unitOfMeasurement: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Display details
				 */
				_details: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Displays the main and side indicators
				 */
				_numericIndicators: { type: "sap.f.cards.NumericIndicators", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		},
		renderer: NumericHeaderRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	NumericHeader.prototype.init = function () {
		BaseHeader.prototype.init.apply(this, arguments);

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	NumericHeader.prototype.exit = function () {
		BaseHeader.prototype.exit.apply(this, arguments);
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	NumericHeader.prototype.onBeforeRendering = function () {
		BaseHeader.prototype.onBeforeRendering.apply(this, arguments);

		this._getTitle()
			.setText(this.getTitle())
			.setMaxLines(this.getTitleMaxLines());

		this._getSubtitle()
			.setText(this.getSubtitle())
			.setMaxLines(this.getSubtitleMaxLines());

		this._getUnitOfMeasurement().setText(this.getUnitOfMeasurement());
		this._getDetails()
			.setText(this.getDetails())
			.setMaxLines(this.getDetailsMaxLines());

		this._getNumericIndicators()
			.setNumber(this.getNumber())
			.setScale(this.getScale())
			.setTrend(this.getTrend())
			.setState(this.getState())
			.setSideIndicatorsAlignment(this.getSideIndicatorsAlignment());
	};


	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {object} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	NumericHeader.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
		if (oElement === this.getAggregation("_title")) {
			mAriaProps.role = this.getTitleAriaRole();
			mAriaProps.level = this.getAriaHeadingLevel();
		}
	};

	/**
	 * Lazily create a title and return it.
	 *
	 * @private
	 * @return {sap.m.Text} The title aggregation
	 */
	NumericHeader.prototype._getTitle = function () {
		var oControl = this.getAggregation("_title");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-title",
				wrapping: true,
				maxLines: this.getTitleMaxLines()
			});
			this.setAggregation("_title", oControl);
		}

		return oControl;
	};

	/**
	 * Lazily create a subtitle and return it.
	 *
	 * @private
	 * @return {sap.m.Text} The subtitle aggregation
	 */
	NumericHeader.prototype._getSubtitle = function () {
		var oControl = this.getAggregation("_subtitle");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-subtitle",
				wrapping: true,
				maxLines: this.getSubtitleMaxLines()
			});
			this.setAggregation("_subtitle", oControl);
		}

		return oControl;
	};

	/**
	 * Lazily create a unit of measurement and return it.
	 *
	 * @private
	 * @return {sap.m.Text} The unit of measurement aggregation
	 */
	NumericHeader.prototype._getUnitOfMeasurement = function () {
		var oControl = this.getAggregation("_unitOfMeasurement");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-unitOfMeasurement",
				wrapping: false
			});
			this.setAggregation("_unitOfMeasurement", oControl);
		}

		return oControl;
	};

	/**
	 * Lazily create details and return it.
	 *
	 * @private
	 * @return {sap.m.Text} The details aggregation
	 */
	NumericHeader.prototype._getDetails = function () {
		var oControl = this.getAggregation("_details");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-details"
			});
			this.setAggregation("_details", oControl);
		}

		return oControl;
	};

	/**
	 * Lazily create numeric content and return it.
	 *
	 * @private
	 * @return {sap.m.NumericContent} The main indicator aggregation
	 */
	NumericHeader.prototype._getNumericIndicators = function () {
		var oControl = this.getAggregation("_numericIndicators");

		if (!oControl) {
			oControl = new NumericIndicators();
			this.setAggregation("_numericIndicators", oControl);
		}

		return oControl;
	};

	/**
	 * Fires the <code>sap.f.cards.NumericHeader</code> press event.
	 */
	NumericHeader.prototype.ontap = function (oEvent) {
		var srcControl = oEvent.srcControl;
		if (srcControl && srcControl.getId().indexOf("overflowButton") > -1) { // better way?
			return;
		}

		this.firePress();
	};

	/**
	 * Fires the <code>sap.f.cards.NumericHeader</code> press event.
	 */
	NumericHeader.prototype.onsapselect = function () {
		this.firePress();
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	NumericHeader.prototype._getAriaLabelledBy = function () {
		var sCardTypeId = "",
			sTitleId = "",
			sSubtitleId = "",
			sStatusTextId = "",
			sUnitOfMeasureId = this._getUnitOfMeasurement().getId(),
			sMainIndicatorId = "",
			sSideIndicatorsIds = this._getSideIndicatorIds(),
			sDetailsId = "",
			sIds;

		if (this.getParent() && this.getParent()._ariaText) {
			sCardTypeId = this.getParent()._ariaText.getId();
		}

		if (this.getTitle()) {
			sTitleId = this._getTitle().getId();
		}

		if (this.getSubtitle()) {
			sSubtitleId = this._getSubtitle().getId();
		}

		if (this.getStatusText()) {
			sStatusTextId = this.getId() + "-status";
		}

		if (this.getDetails()) {
			sDetailsId = this._getDetails().getId();
		}

		if (this.getNumber() || this.getScale()) {
			sMainIndicatorId = this._getNumericIndicators()._getMainIndicator().getId();
		}

		sIds = sCardTypeId + " " + sTitleId + " " + sSubtitleId + " " + sStatusTextId + " " + sUnitOfMeasureId + " " + sMainIndicatorId + " " + sSideIndicatorsIds + " " + sDetailsId;

		// remove whitespace from both sides
		// and merge the consecutive spaces into one
		return sIds.replace(/ {2,}/g, ' ').trim();
	};

	/**
	 * Helper function to get the IDs of <code>sap.f.cards.NumericSideIndicator</code>.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	NumericHeader.prototype._getSideIndicatorIds = function () {
		return this.getSideIndicators()
			.map(function(oSideIndicator) { return oSideIndicator.getId(); })
			.join(" ");
	};

	NumericHeader.prototype.isLoading = function () {
		return false;
	};

	NumericHeader.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		BaseHeader.prototype.attachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	NumericHeader.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		BaseHeader.prototype.detachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	return NumericHeader;
});

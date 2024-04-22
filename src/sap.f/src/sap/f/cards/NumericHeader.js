/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseHeader",
	"./NumericIndicators",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/ObjectStatus",
	"sap/f/cards/NumericHeaderRenderer",
	"sap/ui/core/library",
	"sap/m/Avatar",
	"sap/ui/core/InvisibleText"
], function (
	BaseHeader,
	NumericIndicators,
	Log,
	mLibrary,
	Text,
	ObjectStatus,
	NumericHeaderRenderer,
	coreLibrary,
	Avatar,
	InvisibleText
) {
	"use strict";

	const ValueState = coreLibrary.ValueState;
	const AvatarShape = mLibrary.AvatarShape;
	const AvatarColor = mLibrary.AvatarColor;
	const AvatarImageFitType = mLibrary.AvatarImageFitType;
	const AvatarSize = mLibrary.AvatarSize;

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
				 * Defines the shape of the icon.
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the icon source.
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },

				/**
				 * Defines the initials of the icon.
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines an alt text for the avatar or icon.
				 *
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				iconAlt: { type: "string", defaultValue: "" },

				/**
				 * Defines a background color for the avatar or icon.
				 *
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				iconBackgroundColor: { type: "sap.m.AvatarColor", defaultValue: AvatarColor.Transparent },

				/**
				 * Defines whether the card icon is visible.
				 *
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				iconVisible: { type: "boolean", defaultValue: true },

				/**
				 * Defines the size of the icon.
				 *
				 * @experimental Since 1.119 this feature is experimental and the API may change.
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.S },

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
				 * The size of the of the main indicator. Possible values are "S" and "L".
				 */
				numberSize: { "type": "string", group : "Appearance", defaultValue: "L" },

				/**
				 * Whether the main numeric indicator is visible or not
				 * @since 1.109
				 */
				numberVisible: { "type": "boolean", defaultValue : true},

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
				 * The semantic color which represents the state of the details text.
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				detailsState: { type : "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },

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
				 * Micro Chart
				 * @experimental since 1.124
				 */
				microChart: {
					type: "sap.ui.core.Control",
					multiple: false
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
				* Defines the inner avatar control.
				*/
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" },

				/**
				 * Shows unit of measurement next to subtitle
				 */
				_unitOfMeasurement: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Display details
				 */
				_details: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

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

		this._oAriaAvatarText = new InvisibleText({id: this.getId() + "-ariaAvatarText"});
		this._oAriaAvatarText.setText(this._oRb.getText("ARIA_HEADER_AVATAR_TEXT"));
	};

	NumericHeader.prototype.exit = function () {
		BaseHeader.prototype.exit.apply(this, arguments);

		this._oAriaAvatarText.destroy();
		this._oAriaAvatarText = null;
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	NumericHeader.prototype.onBeforeRendering = function () {
		BaseHeader.prototype.onBeforeRendering.apply(this, arguments);

		this._getTitle()
			.setText(this.getTitle())
			.setMaxLines(this.getTitleMaxLines())
			.setWrappingType(this.getWrappingType());

		this._enhanceText(this._getTitle());

		this._getSubtitle()
			.setText(this.getSubtitle())
			.setMaxLines(this.getSubtitleMaxLines())
			.setWrappingType(this.getWrappingType());

		this._enhanceText(this._getSubtitle());

		this._getUnitOfMeasurement().setText(this.getUnitOfMeasurement());

		this._getAvatar()
			.setDisplayShape(this.getIconDisplayShape())
			.setSrc(this.getIconSrc())
			.setInitials(this.getIconInitials())
			.setTooltip(this.getIconAlt())
			.setBackgroundColor(this.getIconBackgroundColor())
			.setDisplaySize(this.getIconSize());

		if (!this.isPropertyInitial("detailsState") && !this.isPropertyInitial("detailsMaxLines")) {
			Log.error("Both details state and details max lines can not be used at the same time. Max lines setting will be ignored.");
		}

		if (!this.isPropertyInitial("detailsState")) {
			this._createDetails(true)
				.setText(this.getDetails())
				.setState(this.getDetailsState());
		} else {
			this._createDetails()
				.setText(this.getDetails())
				.setMaxLines(this.getDetailsMaxLines())
				.setWrappingType(this.getWrappingType());

			this._enhanceText(this._getDetails());
		}

		this._getNumericIndicators()
			.setNumber(this.getNumber())
			.setNumberSize(this.getNumberSize())
			.setScale(this.getScale())
			.setTrend(this.getTrend())
			.setState(this.getState())
			.setSideIndicatorsAlignment(this.getSideIndicatorsAlignment())
			.setNumberVisible(this.getNumberVisible());
	};

	/**
	 * @protected
	 * @returns {boolean} If the icon should be shown.
	 */
	NumericHeader.prototype.shouldShowIcon = function () {
		return this.getIconVisible();
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {{role: string, level: string}} mAriaProps - The mapping of "aria-" prefixed attributes
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
	 * Lazily creates an avatar control and returns it.
	 * @private
	 * @returns {sap.m.Avatar} The inner avatar aggregation
	 */
	NumericHeader.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");
		if (!oAvatar) {
			oAvatar = new Avatar({
				imageFitType: AvatarImageFitType.Contain
			}).addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}
		return oAvatar;
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
			}).addStyleClass("sapFCardHeaderUnitOfMeasurement");
			this.setAggregation("_unitOfMeasurement", oControl);
		}

		return oControl;
	};

	/**
	 * Create details and return it.
	 * @private
	 * @param {boolean} bUseObjectStatus If set to true the details will be sap.m.ObjectStatus
	 * @return {sap.m.Text|sap.m.ObjectStatus} The details aggregation
	 */
	NumericHeader.prototype._createDetails = function (bUseObjectStatus) {
		var oControl = this.getAggregation("_details");

		if (oControl?.isA("sap.m.Text") && bUseObjectStatus) {
			oControl.destroy();
		} else if (oControl) {
			return oControl;
		}

		var oSettings = {
			id: this._getDetailsId()
		};

		if (bUseObjectStatus) {
			oControl = new ObjectStatus(oSettings);
		} else {
			oControl = new Text(oSettings);
		}

		this.setAggregation("_details", oControl);

		return oControl;
	};

	/**
	 * Gets the control create for showing details.
	 * @private
	 * @return {sap.m.Text|sap.m.ObjectStatus} The details aggregation
	 */
	NumericHeader.prototype._getDetails = function () {
		return this.getAggregation("_details");
	};

	/**
	 * Gets the id for details control.
	 * @private
	 * @return {string} The id for details control.
	 */
	NumericHeader.prototype._getDetailsId = function () {
		return this.getId() + "-details";
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
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	NumericHeader.prototype._getAriaLabelledBy = function () {
		const aIds = [];

		if (this.getParent() && this.getParent()._ariaText) {
			aIds.push(this.getParent()._ariaText.getId());
		}

		if (this.getTitle()) {
			aIds.push(this._getTitle().getId());
		}

		if (this.getSubtitle()) {
			aIds.push(this._getSubtitle().getId());
		}

		if (this.getStatusText()) {
			aIds.push(this.getId() + "-status");
		}

		aIds.push(this._getUnitOfMeasurement().getId());

		if (this.getIconSrc() || this.getIconInitials()) {
			aIds.push(this.getId() + "-ariaAvatarText");
		}

		if (this.getNumber() || this.getScale()) {
			aIds.push(this._getNumericIndicators()._getMainIndicator().getId());
		}

		aIds.push(this._getSideIndicatorIds());

		if (this.getDetails()) {
			aIds.push(this._getDetailsId());
		}

		aIds.push(this._getBannerLinesIds());

		return aIds.filter((sElement) => { return !!sElement; }).join(" ");
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

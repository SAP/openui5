/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/NumericContent',
	'sap/m/Text',
	'sap/ui/model/json/JSONModel',
	"sap/f/cards/NumericSideIndicator",
	"sap/f/cards/NumericHeaderRenderer",
	"sap/ui/core/Core",
	"sap/f/cards/loading/LoadingProvider"
], function (
		Control,
		NumericContent,
		Text,
		JSONModel,
		NumericSideIndicator,
		NumericHeaderRenderer,
		Core,
		LoadingProvider
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
	 * configuration of a numeric value visualization..
	 *
	 * You can configure the title, subtitle, status text and icon, using the provided properties.
	 * To add more side number indicators, use the <code>sideIndicators</code> aggregation.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>You should always set a title.</li>
	 * <li>You should always have a maximum of two side indicators.</li>
	 * <li>To show only basic information, use {@link sap.f.cards.Header Header} instead.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
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
	var NumericHeader = Control.extend("sap.f.cards.NumericHeader", {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.cards.IHeader"],
			properties: {

				/**
				 * The title of the card
				 */
				title: { "type": "string", group: "Appearance" },

				/**
				 * The subtitle of the card
				 */
				subtitle: { "type": "string", group: "Appearance" },

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
				details: { "type": "string", group: "Appearance" }
			},
			aggregations: {

				/**
				 * Defines the toolbar.
				 * @experimental Since 1.75
				 * @since 1.75
				 */
				toolbar: { type: "sap.ui.core.Control", multiple: false },

				/**
				 * Additional side number indicators. For example "Deviation" and "Target". Not more than two side indicators should be used.
				 */
				sideIndicators: { type: "sap.f.cards.NumericSideIndicator", multiple: true },

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
				 * Displays the main number indicator
				 */
				_mainIndicator: { type: "sap.m.NumericContent", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		}
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	NumericHeader.prototype.init = function () {
		this._oRb = Core.getLibraryResourceBundle("sap.f");
		this._aReadyPromises = [];
		this._bReady = false;

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));

		this._oLoadingProvider = new LoadingProvider();

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	NumericHeader.prototype.exit = function () {
		this._oServiceManager = null;
		this._oDataProviderFactory = null;
		this._oRb = null;

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}

		if (this._oActions) {
			this._oActions.destroy();
			this._oActions = null;
		}

		if (this._oLoadingProvider) {
			this._oLoadingProvider.destroy();
			this._oLoadingProvider = null;
		}
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	NumericHeader.prototype.onBeforeRendering = function () {
		this._setAccessibilityAttributes();
	};

	/**
	 * Await for an event which controls the overall "ready" state of the header.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	NumericHeader.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};

	/**
	 * @public
	 * @returns {boolean} If the header is ready or not.
	 */
	NumericHeader.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * Sets the title.
	 *
	 * @public
	 * @param {string} sValue The text of the title
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setTitle = function(sValue) {
		this.setProperty("title", sValue, true);
		this._getTitle().setText(sValue);
		return this;
	};

	/**
	 * Sets the subtitle.
	 *
	 * @public
	 * @param {string} sValue The text of the subtitle
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setSubtitle = function(sValue) {
		this.setProperty("subtitle", sValue, true);
		this._getSubtitle().setText(sValue);
		return this;
	};

	/**
	 * Sets the general unit of measurement for the header. Displayed as side information to the subtitle.
	 *
	 * @public
	 * @param {string} sValue The value of the unit of measurement
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setUnitOfMeasurement = function(sValue) {
		this.setProperty("unitOfMeasurement", sValue, true);
		this._getUnitOfMeasurement().setText(sValue);
		return this;
	};

	/**
	 * Sets additional text which adds more details to what is shown in the numeric header.
	 *
	 * @public
	 * @param {string} sValue The text of the details
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setDetails = function(sValue) {
		this.setProperty("details", sValue, true);
		this._getDetails().setText(sValue);
		return this;
	};

	/**
	 * Sets the value of the main number indicator.
	 *
	 * @public
	 * @param {string} sValue A string representation of the number
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setNumber = function(sValue) {
		this.setProperty("number", sValue, true);
		this._getMainIndicator().setValue(sValue);
		return this;
	};

	/**
	 * Sets the unit of measurement (scaling prefix) for the main indicator.
	 *
	 * @public
	 * @param {string} sValue The text of the title
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setScale = function(sValue) {
		this.setProperty("scale", sValue, true);
		this._getMainIndicator().setScale(sValue);
		return this;
	};

	/**
	 * Sets the direction of the trend arrow.
	 *
	 * @public
	 * @param {sap.m.DeviationIndicator} sValue The direction of the trend arrow
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setTrend = function(sValue) {
		this.setProperty("trend", sValue, true);
		this._getMainIndicator().setIndicator(sValue);
		return this;
	};

	/**
	 * Sets the semantic color which represents the state of the main number indicator.
	 *
	 * @public
	 * @param {sap.m.ValueColor} sValue The semantic color which represents the state
	 * @return {sap.f.cards.NumericHeader} <code>this</code> pointer for chaining
	 */
	NumericHeader.prototype.setState = function(sValue) {
		this.setProperty("state", sValue, true);
		this._getMainIndicator().setValueColor(sValue);
		return this;
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
				maxLines: 3
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
				maxLines: 2
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
				id: this.getId() + "-details",
				wrapping: false
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
	NumericHeader.prototype._getMainIndicator = function () {
		var oControl = this.getAggregation("_mainIndicator");

		if (!oControl) {
			oControl = new NumericContent({
				id: this.getId() + "-mainIndicator",
				withMargin: false,
				nullifyValue: false,
				animateTextChange: false,
				truncateValueTo: 100
			});
			this.setAggregation("_mainIndicator", oControl);
		}

		return oControl;
	};

	/**
	 * Fires the <code>sap.f.cards.NumericHeader</code> press event.
	 */
	NumericHeader.prototype.ontap = function (oEvent) {
		var srcControl = oEvent.srcControl;
		if (srcControl && srcControl.getId().indexOf('overflowButton') > -1) { // better way?
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

	NumericHeader.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	NumericHeader.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
		return this;
	};

	/**
	 * Sets a data provider to the header.
	 *
	 * @private
	 * @param {object} oDataSettings The data settings
	 */
	NumericHeader.prototype._setData = function (oDataSettings) {
		var sPath = "/";
		if (oDataSettings && oDataSettings.path) {
			sPath = oDataSettings.path;

		}
		this.bindObject(sPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}


		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		this._oLoadingProvider.createLoadingState(this._oDataProvider);
		if (this._oDataProvider) {
			// If a data provider is created use an own model. Otherwise bind to the one propagated from the card.
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this._updateModel(oEvent.getParameter("data"));
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
			}.bind(this));
			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_dataReady");
				this._oLoadingProvider.setLoading(false);
				this._oLoadingProvider.removeHeaderPlaceholder(this);
			}.bind(this));
		} else {
			this.fireEvent("_dataReady");
		}
	};

	NumericHeader.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);
	};

	NumericHeader.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	NumericHeader.prototype._getHeaderAccessibility = function () {
		var sTitleId = this._getTitle() ? this._getTitle().getId() : "",
			sSubtitleId = this._getSubtitle() ? this._getSubtitle().getId() : "",
			sStatusTextId = this.getStatusText() ? this.getId() + "-status" : "",
			sUnitOfMeasureId = this._getUnitOfMeasurement() ? this._getUnitOfMeasurement().getId() : "",
			sSideIndicatorsId = this.getSideIndicators() ? this._getSideIndicatorIds() : "",
			sDetailsId = this._getDetails() ? this._getDetails().getId() : "",
			sMainIndicatorId = this._getMainIndicator() ? this._getMainIndicator().getId() : "";

			return sTitleId + " " + sSubtitleId + " " + sStatusTextId + " " + sUnitOfMeasureId + " " + sMainIndicatorId + sSideIndicatorsId + " " + sDetailsId;
	};

	/**
	 * Sets accessibility to the header to the header.
	 *
	 * @private
	 */
	NumericHeader.prototype._setAccessibilityAttributes = function () {
		if (this.hasListeners("press")) {
			this._sAriaRole = 'button';
			this._sAriaHeadingLevel = undefined;
			this._sAriaRoleDescritoion = this._oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER");
		} else {
			this._sAriaRole = 'heading';
			this._sAriaHeadingLevel = '3';
			this._sAriaRoleDescritoion = this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER");
		}
	};

	/**
	 * Helper function to get the IDs of <code>sap.f.cards.NumericSideIndicator</code>.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	NumericHeader.prototype._getSideIndicatorIds = function () {
		var sSideIndicatorIds = "";
		this.getSideIndicators().forEach(function(oSideIndicator) {
			sSideIndicatorIds += " " + oSideIndicator.getId();
		});

		return sSideIndicatorIds;
	};

	NumericHeader.prototype.isLoading = function () {
		var oLoadingProvider = this._oLoadingProvider,
			oCard = this.getParent(),
			cardLoading = oCard.getMetadata()._sClassName === 'sap.ui.integration.widgets.Card' ? oCard.isLoading() : false;

		return !oLoadingProvider.getDataProviderJSON() && (oLoadingProvider.getLoadingState() || cardLoading);
	};

	NumericHeader.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.attachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	NumericHeader.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.detachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	return NumericHeader;
});

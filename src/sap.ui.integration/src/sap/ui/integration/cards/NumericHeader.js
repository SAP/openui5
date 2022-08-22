/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/base/util/extend",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericHeaderRenderer",
	"sap/f/cards/NumericSideIndicator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/LoadingProvider"
], function (
	Core,
	extend,
	FNumericHeader,
	FNumericHeaderRenderer,
	NumericSideIndicator,
	JSONModel,
	BindingResolver,
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
	 * Displays general information in the header of the {@link sap.ui.integration.widgets.Card}.
	 * @extends sap.f.cards.NumericHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.77
	 * @alias sap.ui.integration.cards.NumericHeader
	 */
	var NumericHeader = FNumericHeader.extend("sap.ui.integration.cards.NumericHeader", {

		constructor: function (mConfiguration, oActionsToolbar) {

			mConfiguration = mConfiguration || {};

			var mSettings = {
				title: mConfiguration.title,
				titleMaxLines: mConfiguration.titleMaxLines,
				subtitle: mConfiguration.subTitle,
				subtitleMaxLines: mConfiguration.subTitleMaxLines,
				dataTimestamp: mConfiguration.dataTimestamp
			};

			if (mConfiguration.status && mConfiguration.status.text && !mConfiguration.status.text.format) {
				mSettings.statusText = mConfiguration.status.text;
			}

			extend(mSettings, {
				unitOfMeasurement: mConfiguration.unitOfMeasurement,
				details: mConfiguration.details,
				detailsMaxLines: mConfiguration.detailsMaxLines,
				sideIndicatorsAlignment: mConfiguration.sideIndicatorsAlignment
			});

			if (mConfiguration.mainIndicator) {
				mSettings.number = mConfiguration.mainIndicator.number;
				mSettings.scale = mConfiguration.mainIndicator.unit;
				mSettings.trend = mConfiguration.mainIndicator.trend;
				mSettings.state = mConfiguration.mainIndicator.state; // TODO convert ValueState to ValueColor
			}

			if (mConfiguration.sideIndicators) {
				mSettings.sideIndicators = mConfiguration.sideIndicators.map(function (mIndicator) { // TODO validate that it is an array and with no more than 2 elements
					return new NumericSideIndicator(mIndicator);
				});
			}

			mSettings.toolbar = oActionsToolbar;

			FNumericHeader.call(this, mSettings);
		},
		metadata: {
			library: "sap.ui.integration",
			properties: {
				interactive: { type: "boolean", defaultValue: false }
			},
			aggregations: {
				/**
				 * The internally used LoadingProvider.
				 */
				_loadingProvider: { type: "sap.ui.core.Element", multiple: false, visibility: "hidden" }
			},
			associations: {
				/**
				 * Association with the parent Card that contains this filter.
				 */
				card: { type: "sap.ui.integration.widgets.Card", multiple: false }
			}
		},
		renderer: FNumericHeaderRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	NumericHeader.prototype.init = function () {
		FNumericHeader.prototype.init.call(this);

		this._bReady = false;

		this.setAggregation("_loadingProvider", new LoadingProvider());

		this._aReadyPromises = [];

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));
	};

	NumericHeader.prototype.exit = function () {

		FNumericHeader.prototype.exit.call(this);

		this._oServiceManager = null;
		this._oDataProviderFactory = null;

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}

		if (this._oActions) {
			this._oActions.destroy();
			this._oActions = null;
		}
	};

	/**
	 * @override
	 */
	NumericHeader.prototype._isInteractive = function () {
		return this.getInteractive();
	};

	/**
	 * @public
	 * @returns {boolean} If the header is ready or not.
	 */
	NumericHeader.prototype.isReady = function () {
		return this._bReady;
	};

	NumericHeader.prototype.isLoading = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider"),
			oCard = this.getCardInstance(),
			bCardLoading = oCard && oCard.isA("sap.ui.integration.widgets.Card") ? oCard.isLoading() : false;

		return !oLoadingProvider.isDataProviderJson() && (oLoadingProvider.getLoading() || bCardLoading);
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


	NumericHeader.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	NumericHeader.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
		return this;
	};

	/**
	 * Sets a data settings to the header.
	 *
	 * @private
	 * @param {object} oDataSettings The data settings
	 */
	NumericHeader.prototype._setDataConfiguration = function (oDataSettings) {
		var oCard = this.getCardInstance(),
			sPath = "/",
			oModel;

		if (oDataSettings && oDataSettings.path) {
			sPath = BindingResolver.resolveValue(oDataSettings.path, this.getCardInstance());
		}

		this.bindObject(sPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = oCard.getDataProviderFactory().create(oDataSettings, this._oServiceManager);

		this.getAggregation("_loadingProvider").setDataProvider(this._oDataProvider);

		if (oDataSettings && oDataSettings.name) {
			oModel = oCard.getModel(oDataSettings.name);
		} else if (this._oDataProvider) {
			oModel = new JSONModel();
			this.setModel(oModel);
		}

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this.showLoadingPlaceholders();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				oModel.setData(oEvent.getParameter("data"));
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		} else {
			this.fireEvent("_dataReady");
		}
	};

	NumericHeader.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	NumericHeader.prototype.refreshData = function () {
		if (this._oDataProvider) {
			this._oDataProvider.triggerDataUpdate();
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	NumericHeader.prototype.showLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(true);
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	NumericHeader.prototype.hideLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(false);
	};

	NumericHeader.prototype.onDataRequestComplete = function () {
		this.fireEvent("_dataReady");
		this.hideLoadingPlaceholders();
	};

	/**
	 * Gets the card instance of which this element is part of.
	 * @private
	 * @ui5-restricted
	 * @returns {sap.ui.integration.widgets.Card} The card instance.
	 */
	NumericHeader.prototype.getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	return NumericHeader;
});

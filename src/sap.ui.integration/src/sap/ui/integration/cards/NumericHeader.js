/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/util/extend',
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericHeaderRenderer",
	"sap/ui/integration/util/BindingHelper",
	"sap/f/cards/NumericSideIndicator",
	'sap/ui/model/json/JSONModel',
	"sap/ui/integration/util/LoadingProvider"
], function (extend,
			 FNumericHeader,
			 FNumericHeaderRenderer,
			 BindingHelper,
			 NumericSideIndicator,
			 JSONModel,
			 LoadingProvider) {
	"use strict";


	/**
	 * Constructor for a new <code>NumericHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.ui.integration.widgets.Card}.
	 * @extends sap.f.NumericHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.77
	 * @alias sap.ui.integration.cards.Header
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NumericHeader = FNumericHeader.extend("sap.ui.integration.cards.NumericHeader", {

		constructor: function (mConfiguration, oActionsToolbar, sAppId) {

			mConfiguration = mConfiguration || {};
			this._sAppId = sAppId;

			var mSettings = {
				title: mConfiguration.title,
				subtitle: mConfiguration.subTitle
			};

			if (mConfiguration.status && typeof mConfiguration.status.text === "string") {
				mSettings.statusText = mConfiguration.status.text;
			}

			extend(mSettings, {
				unitOfMeasurement: mConfiguration.unitOfMeasurement,
				details: mConfiguration.details
			});

			if (mConfiguration.mainIndicator) {
				mSettings.number = mConfiguration.mainIndicator.number;
				mSettings.scale = mConfiguration.mainIndicator.unit;
				mSettings.trend = mConfiguration.mainIndicator.trend;
				mSettings.state = mConfiguration.mainIndicator.state; // TODO convert ValueState to ValueColor
			}

			mSettings = BindingHelper.createBindingInfos(mSettings);

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

		this._oLoadingProvider = new LoadingProvider();

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

		if (this._oLoadingProvider) {
			this._oLoadingProvider.destroy();
			this._oLoadingProvider = null;
		}
	};


	/**
	 * @public
	 * @returns {boolean} If the header is ready or not.
	 */
	NumericHeader.prototype.isReady = function () {
		return this._bReady;
	};


	NumericHeader.prototype.isLoading = function () {
		var oLoadingProvider = this._oLoadingProvider,
			oCard = this.getParent(),
			cardLoading = oCard.getMetadata()._sClassName === 'sap.ui.integration.widgets.Card' ? oCard.isLoading() : false;

		return !oLoadingProvider.getDataProviderJSON() && (oLoadingProvider.getLoadingState() || cardLoading);
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
		var sPath = "/";
		if (oDataSettings && oDataSettings.path) {
			sPath = oDataSettings.path;

		}
		this.bindObject(sPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}


		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (this._oDataProvider) {
			// If a data provider is created use an own model. Otherwise bind to the one propagated from the card.
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataRequested(function () {
				this.onDataRequested();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this._updateModel(oEvent.getParameter("data"));
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

	NumericHeader.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);
	};

	NumericHeader.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	NumericHeader.prototype.onDataRequested = function () {
		this._oLoadingProvider.createLoadingState(this._oDataProvider);
	};

	NumericHeader.prototype.onDataRequestComplete = function () {
		this.fireEvent("_dataReady");
		this._oLoadingProvider.setLoading(false);
		this._oLoadingProvider.removeHeaderPlaceholder(this);
	};

	return NumericHeader;
});

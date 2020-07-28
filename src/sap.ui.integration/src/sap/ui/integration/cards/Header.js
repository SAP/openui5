/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/Header",
	"sap/f/cards/HeaderRenderer",
	"sap/ui/integration/util/BindingHelper",
	'sap/ui/model/json/JSONModel',
	"sap/ui/integration/util/LoadingProvider"
], function (FHeader,
			 FHeaderRenderer,
			 BindingHelper,
			 JSONModel,
			 LoadingProvider) {
	"use strict";

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.ui.integration.widgets.Card}.
	 * @extends sap.f.Header
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
	var Header = FHeader.extend("sap.ui.integration.cards.Header", {

		constructor: function (mConfiguration, oActionsToolbar, sAppId, oIconFormatter) {

			mConfiguration = mConfiguration || {};
			this._sAppId = sAppId;

			var mSettings = {
				title: mConfiguration.title,
				subtitle: mConfiguration.subTitle
			};

			if (mConfiguration.status && typeof mConfiguration.status.text === "string") {
				mSettings.statusText = mConfiguration.status.text;
			}

			if (mConfiguration.icon) {
				mSettings.iconSrc = mConfiguration.icon.src;
				mSettings.iconDisplayShape = mConfiguration.icon.shape;
				mSettings.iconInitials = mConfiguration.icon.text;
				mSettings.iconAlt = mConfiguration.icon.alt;
			}

			mSettings = BindingHelper.createBindingInfos(mSettings);

			if (mSettings.iconSrc) {
				mSettings.iconSrc = BindingHelper.formattedProperty(mSettings.iconSrc, function (sValue) {
					return oIconFormatter.formatSrc(sValue, sAppId);
				});
			}

			mSettings.toolbar = oActionsToolbar;

			FHeader.call(this, mSettings);
		},

		metadata: {
			library: "sap.ui.integration",
			properties: {
			}
		},
		renderer: FHeaderRenderer
	});

	Header.prototype.init = function () {

		FHeader.prototype.init.call(this);

		this._bReady = false;
		this._oLoadingProvider = new LoadingProvider();
		this._aReadyPromises = [];

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");
		this._awaitEvent("_actionHeaderReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));
	};

	Header.prototype.exit = function () {

		FHeader.prototype.exit.call(this);

		this._oServiceManager = null;
		this._oDataProviderFactory = null;

		if (this._oLoadingProvider) {
			this._oLoadingProvider.destroy();
			this._oLoadingProvider = null;
		}

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
	 * @public
	 * @returns {boolean} If the header is ready or not.
	 */
	Header.prototype.isReady = function () {
		return this._bReady;
	};

	Header.prototype.isLoading = function () {
		var oLoadingProvider = this._oLoadingProvider,
			oCard = this.getParent(),
			cardLoading = oCard.getMetadata()._sClassName === 'sap.ui.integration.widgets.Card' ? oCard.isLoading() : false;

		return !oLoadingProvider.getDataProviderJSON() && (oLoadingProvider.getLoadingState() || cardLoading);
	};


	Header.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);
	};

	Header.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	/**
	 * Await for an event which controls the overall "ready" state of the header.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	Header.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};


	Header.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	Header.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
		return this;
	};

	/**
	 * Sets a data settings to the header.
	 *
	 * @private
	 * @param {object} oDataSettings The data settings
	 */
	Header.prototype._setDataConfiguration = function (oDataSettings) {
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

			//TODO Designers to decide if we have to keep loading status when an error occured during loading
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

	Header.prototype.onDataRequested = function () {
		this._oLoadingProvider.createLoadingState(this._oDataProvider);
	};

	Header.prototype.onDataRequestComplete = function () {
		this.fireEvent("_dataReady");
		this._oLoadingProvider.setLoading(false);
		this._oLoadingProvider.removeHeaderPlaceholder(this);
	};

	return Header;
});

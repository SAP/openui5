/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge",
	"sap/f/cards/Header",
	"sap/f/cards/HeaderRenderer",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/formatters/IconFormatter"
], function (
	Core,
	JSONModel,
	merge,
	FHeader,
	FHeaderRenderer,
	mLibrary,
	Text,
	BindingHelper,
	BindingResolver,
	LoadingProvider,
	Utils,
	IconFormatter
) {
	"use strict";

	// shortcut for sap.m.AvatarColor
	var AvatarColor = mLibrary.AvatarColor;

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.ui.integration.widgets.Card}.
	 * @extends sap.f.cards.Header
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.77
	 * @alias sap.ui.integration.cards.Header
	 */
	var Header = FHeader.extend("sap.ui.integration.cards.Header", {

		constructor: function (sId, mConfiguration, oActionsToolbar, oIconFormatter) {

			mConfiguration = mConfiguration || {};

			var mSettings = {
				title: mConfiguration.title,
				titleMaxLines: mConfiguration.titleMaxLines,
				subtitle: mConfiguration.subTitle,
				subtitleMaxLines: mConfiguration.subTitleMaxLines,
				dataTimestamp: mConfiguration.dataTimestamp,
				visible: mConfiguration.visible
			};

			if (mConfiguration.status && mConfiguration.status.text && !mConfiguration.status.text.format) {
				mSettings.statusText = mConfiguration.status.text;
				mSettings.statusVisible = mConfiguration.status.visible;
			}

			if (mConfiguration.icon) {
				var vInitials = mConfiguration.icon.initials || mConfiguration.icon.text;
				var sBackgroundColor = mConfiguration.icon.backgroundColor || (vInitials ? AvatarColor.Accent6 : AvatarColor.Transparent);

				mSettings.iconSrc = mConfiguration.icon.src;
				mSettings.iconDisplayShape = mConfiguration.icon.shape;
				mSettings.iconInitials = vInitials;
				mSettings.iconAlt = mConfiguration.icon.alt;
				mSettings.iconBackgroundColor = sBackgroundColor;
				mSettings.iconVisible = mConfiguration.icon.visible;
			}

			if (mSettings.iconSrc) {
				mSettings.iconSrc = BindingHelper.formattedProperty(mSettings.iconSrc, function (sValue) {
					return oIconFormatter.formatSrc(sValue);
				});
			}

			if (mConfiguration.banner) {
				mSettings.bannerLines = mConfiguration.banner.map(function (mBannerLine) { // TODO validate that it is an array and with no more than 2 elements
					var oBannerLine = new Text({
						text: mBannerLine.text,
						visible: mBannerLine.visible
					});

					if (mBannerLine.diminished) {
						oBannerLine.addStyleClass("sapFCardHeaderBannerLineDiminished");
					}

					return oBannerLine;
				});
			}

			mSettings.toolbar = oActionsToolbar;

			FHeader.call(this, sId, mSettings);

			this._oConfiguration = mConfiguration;
			this._oIconFormatter = oIconFormatter;
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
		renderer: FHeaderRenderer
	});

	Header.prototype.init = function () {
		FHeader.prototype.init.call(this);

		this._bReady = false;

		this.setAggregation("_loadingProvider", new LoadingProvider());

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
	Header.prototype.shouldShowIcon = function () {
		return this.getIconVisible() && this.getIconSrc() !== IconFormatter.SRC_FOR_HIDDEN_ICON;
	};

	/**
	 * @override
	 */
	Header.prototype.isInteractive = function () {
		return this.getInteractive();
	};

	/**
	 * @public
	 * @returns {boolean} If the header is ready or not.
	 */
	Header.prototype.isReady = function () {
		return this._bReady;
	};

	Header.prototype.isLoading = function () {
		if (!this.isReady()) {
			return true;
		}

		if (this._oDataProvider) {
			return this.getAggregation("_loadingProvider").getLoading();
		}

		var oCard = this.getCardInstance();

		return oCard && oCard.isLoading();
	};

	Header.prototype._handleError = function (mErrorInfo) {
		this.fireEvent("_error", { errorInfo: mErrorInfo });
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
	 * @returns {object} Header configuration with static values.
	 */
	Header.prototype.getStaticConfiguration = function () {
		var oConfiguration = merge({}, this._oConfiguration),
			mFormat = Utils.getNestedPropertyValue(oConfiguration, "/status/text/format"),
			oBindingInfo;

		if (mFormat) {
			oBindingInfo = Utils.getStatusTextBindingInfo(mFormat);
		}

		if (oBindingInfo) {
			oConfiguration.status.text = oBindingInfo;
		}

		if (oConfiguration.icon && oConfiguration.icon.src) {
			oConfiguration.icon.src = this._oIconFormatter.formatSrc(BindingResolver.resolveValue(oConfiguration.icon.src, this));
		}

		return oConfiguration;
	};

	/**
	 * Sets a data settings to the header.
	 *
	 * @private
	 * @param {object} oDataSettings The data settings
	 */
	Header.prototype._setDataConfiguration = function (oDataSettings) {
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

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

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
				this._handleError({
					requestErrorParams: oEvent.getParameters(),
					requestSettings: this._oDataProvider.getSettings()
				});
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		} else {
			this.fireEvent("_dataReady");
		}
	};

	Header.prototype.refreshData = function () {
		if (this._oDataProvider) {
			this._oDataProvider.triggerDataUpdate();
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	Header.prototype.showLoadingPlaceholders = function () {
		if (!this._isDataProviderJson()) {
			this.getAggregation("_loadingProvider").setLoading(true);
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	Header.prototype.hideLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(false);
	};

	Header.prototype.onDataRequestComplete = function () {
		var oCard = this.getCardInstance();
		if (oCard) {
			oCard._fireDataChange();
		}

		this.fireEvent("_dataReady");
		this.hideLoadingPlaceholders();
	};

	/**
	 * Gets the card instance of which this element is part of.
	 * @ui5-restricted
	 * @private
	 * @returns {sap.ui.integration.widgets.Card} The card instance.
	 */
	Header.prototype.getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	Header.prototype._isDataProviderJson = function () {
		return this._oDataProvider && this._oDataProvider.getSettings() && this._oDataProvider.getSettings()["json"];
	};

	return Header;
});

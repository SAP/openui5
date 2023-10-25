/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/ui/core/date/UI5Date"
], function (Element, RequestDataProvider, Log, deepExtend, UI5Date) {
	"use strict";

	/**
	 * @const The amount of seconds in a common calendar year.
	 */
	var SECONDS_IN_YEAR = 31536000;

	function getFullUrl(oRequest) {
		var sUrl = oRequest.url,
			vData = oRequest.data,
			oUrl,
			sParamKey;

		if (oRequest.method !== "GET") {
			return oRequest.url;
		}

		oUrl = new URL(sUrl, window.location.href);

		for (sParamKey in vData) {
			oUrl.searchParams.set(sParamKey, vData[sParamKey]);
		}
		return oUrl.href;
	}

	/**
	 * Executes data requests with enabled caching based on the given settings.
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @alias sap.ui.integration.util.CacheAndRequestDataProvider
	 */
	var CacheAndRequestDataProvider = RequestDataProvider.extend("sap.ui.integration.util.CacheAndRequestDataProvider");

	/**
	 * @override
	 */
	CacheAndRequestDataProvider.prototype.init = function () {
		RequestDataProvider.prototype.init.apply(this, arguments);

		this._oRefreshWithoutCacheBound = this.refreshWithoutCache.bind(this);
	};

	/**
	 * @override
	 */
	CacheAndRequestDataProvider.prototype.destroy = function () {
		this._unsubscribeFromHostMessages();

		this._detachTimestampPress();

		RequestDataProvider.prototype.destroy.apply(this, arguments);
	};

	CacheAndRequestDataProvider.prototype.getHostInstance = function () {
		return Element.getElementById(this.getHost());
	};

	CacheAndRequestDataProvider.prototype.getCardInstance = function () {
		return Element.getElementById(this.getCard());
	};

	CacheAndRequestDataProvider.prototype.getCardInstanceHeader = function () {
		var oCard = this.getCardInstance();

		if (!oCard) {
			return null;
		}

		return oCard.getCardHeader();
	};

	CacheAndRequestDataProvider.prototype.onDataRequestComplete = function () {
		var iInterval;

		if (this._iUpdateIntervalTimeout) {
			clearTimeout(this._iUpdateIntervalTimeout);
			this._iUpdateIntervalTimeout = null;
		}

		if (!this.getSettings() || !this.getSettings().updateInterval) {
			return;
		}

		iInterval = parseInt(this.getSettings().updateInterval);

		if (isNaN(iInterval)) {
			return;
		}

		this._iUpdateIntervalTimeout = setTimeout(function () {
			this.refreshWithoutCache();
		}.bind(this), iInterval * 1000);
	};

	/**
	 * @override
	 */
	CacheAndRequestDataProvider.prototype._request = function (oRequest) {
		var pRequestPromise,
			oCardHeader = this.getCardInstanceHeader();

		this._sCurrentRequestFullUrl = getFullUrl(oRequest.url);

		this._subscribeToHostMessages();

		pRequestPromise = RequestDataProvider.prototype._request.apply(this, arguments);

		pRequestPromise.then(function (vResult) {
			var oResponse = vResult[1],
				sDate = oResponse.headers.get("Date");

			if (sDate && oCardHeader) {
				this._attachTimestampPress();
				oCardHeader.setDataTimestamp((UI5Date.getInstance(sDate)).toISOString());
			}
		}.bind(this));

		return pRequestPromise;
	};

	/**
	 * Refresh the data without using cache.
	 */
	CacheAndRequestDataProvider.prototype.refreshWithoutCache = function () {
		var oCardHeader = this.getCardInstanceHeader();

		if (oCardHeader) {
			oCardHeader.setDataTimestampUpdating(true);
		}

		setTimeout(function () {
			this._bCacheOnly = false;
			this._bNoCache = true;
			this._triggerDataUpdate();
		}.bind(this), 200); // @todo, this delay is only for visualizing the change, else it happens almost instantly
	};

	/**
	 * Refresh the data preferring any cache if available.
	 */
	CacheAndRequestDataProvider.prototype.refreshFromCache = function () {
		var oCardHeader = this.getCardInstanceHeader();

		if (oCardHeader) {
			oCardHeader.setDataTimestampUpdating(true);
		}

		setTimeout(function () {
			this._bCacheOnly = true;
			this._bNoCache = false;
			this._triggerDataUpdate();
		}.bind(this), 200); // @todo, this delay is only for visualizing the change in data, else it happens almost instantly
	};

	/**
	 * @inheritdoc
	 */
	CacheAndRequestDataProvider.prototype._modifyRequestBeforeSent = function (oRequest, oSettings) {
		oSettings.request = this._addCacheSettings(oSettings.request);

		return RequestDataProvider.prototype._modifyRequestBeforeSent.call(this, oRequest, oSettings);
	};

	/**
	 * @inheritdoc
	 */
	CacheAndRequestDataProvider.prototype._addCacheSettings = function (oSettings) {
		var oDefault = {
				cache: {
					enabled: true,
					maxAge: 0,
					staleWhileRevalidate: true
				}
			},
			oNewSettings = deepExtend(oDefault, oSettings),
			oCache = oNewSettings.cache;

		if (oCache.noStore) {
			// temporary needed for backward compatibility
			oCache.enabled = false;
		}

		if (oCache.enabled) {
			if (this._bCacheOnly) {
				oCache.maxAge = SECONDS_IN_YEAR;
				oCache.staleWhileRevalidate = false;
			} else if (this._bNoCache) {
				oCache.maxAge = 0;
				oCache.staleWhileRevalidate = false;
			}
		}

		return oNewSettings;
	};

	/**
	 * @override
	 */
	CacheAndRequestDataProvider.prototype._getRequestSettings = function () {
		return this._addCacheSettings(this.getSettings().request);
	};

	/**
	 * Starts to listen for messages from the host.
	 */
	CacheAndRequestDataProvider.prototype._subscribeToHostMessages = function () {
		var oHost = this.getHostInstance();

		if (this._bIsSubscribed) {
			return;
		}

		if (!oHost) {
			return;
		}

		oHost.attachMessage(this._handleHostMessage, this);

		this._bIsSubscribed = true;
	};

	/**
	 * Stops to listen for messages from the host.
	 */
	CacheAndRequestDataProvider.prototype._unsubscribeFromHostMessages = function () {
		var oHost = this.getHostInstance();

		if (!oHost) {
			return;
		}

		oHost.detachMessage(this._handleHostMessage, this);

		this._bIsSubscribed = false;
	};

	/**
	 * Handler for when there is a message from the host.
	 * @param {Object} oEvent The event.
	 */
	CacheAndRequestDataProvider.prototype._handleHostMessage = function (oEvent) {
		var oData = oEvent.getParameter("data");

		if (oData.type !== "ui-integration-card-update") {
			return;
		}

		if (oData.url !== this._sCurrentRequestFullUrl) {
			return;
		}

		Log.info("[CARDS CACHE] message ui-integration-card-update received for " + oData.url);

		this.refreshFromCache();
	};

	CacheAndRequestDataProvider.prototype._attachTimestampPress = function (oEvent) {
		var oCard = this.getCardInstance(),
			oHeader = this.getCardInstanceHeader();

		if (this._oHeaderDelegate) {
			return;
		}

		if (!oHeader) {
			return;
		}

		this._oHeaderDelegate = {
			onBeforeRendering: function () {
				var $timestamp = oCard.$().find(".sapFCardDataTimestamp");
				$timestamp.off("click", this._oRefreshWithoutCacheBound);
			}.bind(this),
			onAfterRendering: function () {
				var $timestamp = oCard.$().find(".sapFCardDataTimestamp");
				$timestamp.on("click", this._oRefreshWithoutCacheBound);
			}.bind(this)
		};

		oHeader.addEventDelegate(this._oHeaderDelegate);
	};

	CacheAndRequestDataProvider.prototype._detachTimestampPress = function (oEvent) {
		var oCard = this.getCardInstance(),
			oHeader = this.getCardInstanceHeader(),
			$timestamp = oCard && oCard.$().find(".sapFCardDataTimestamp");

		if (!oHeader) {
			return;
		}

		$timestamp.off("click", this._oRefreshWithoutCacheBound);

		oHeader.removeEventDelegate(this._oHeaderDelegate);
		this._oHeaderDelegate = null;
	};

	return CacheAndRequestDataProvider;
});

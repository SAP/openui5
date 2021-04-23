/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/util/RequestDataProvider",
	"sap/base/Log"
], function (RequestDataProvider, Log) {
	"use strict";
	/*global Response, URL*/

	function getFullUrl(oRequest) {
		var sUrl = oRequest.url,
			vData = oRequest.data,
			oUrl,
			sParamKey;

		if (oRequest.method !== "GET") {
			return oRequest.url;
		}

		oUrl = new URL(sUrl);
		for (sParamKey in vData) {
			oUrl.searchParams.set(sParamKey, vData[sParamKey]);
		}
		return oUrl.href;
	}

	/**
	 * @private
	 */
	var CacheAndRequestDataProvider = RequestDataProvider.extend("sap.ui.integration.util.CacheAndRequestDataProvider");

	/**
	 * @override
	 */
	CacheAndRequestDataProvider.prototype.init = function () {
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

	CacheAndRequestDataProvider.prototype.onDataRequestComplete = function () {
		var iInterval;

		if (this._iUpdateIntervalTimeout) {
			clearTimeout(this._iUpdateIntervalTimeout);
			this._iUpdateIntervalTimeout = null;
		}

		if (!this._oSettings || !this._oSettings.updateInterval) {
			return;
		}

		iInterval = parseInt(this._oSettings.updateInterval);

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
			oCard = this.getCardInstance(),
			oCardHeader = oCard.getCardHeader();

		this._sCurrentRequestFullUrl = getFullUrl(oRequest);

		this._subscribeToHostMessages();

		pRequestPromise = RequestDataProvider.prototype._request.apply(this, arguments);

		pRequestPromise.then(function (vResult) {
			var jqXHR = vResult[1],
				sDate = jqXHR.getResponseHeader("Date");

			if (sDate && oCardHeader) {
				this._attachTimestampPress();
				oCardHeader.setDataTimestamp((new Date(sDate)).toISOString());
			}
		}.bind(this));

		return pRequestPromise;
	};

	/**
	 * Refresh the data without using cache.
	 */
	CacheAndRequestDataProvider.prototype.refreshWithoutCache = function () {
		var oCardHeader = this.getCardInstance().getCardHeader();

		oCardHeader.setDataTimestampUpdating(true);

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
		var oCardHeader = this.getCardInstance().getCardHeader();

		oCardHeader.setDataTimestampUpdating(true);

		setTimeout(function () {
			this._bCacheOnly = true;
			this._bNoCache = false;
			this._triggerDataUpdate();
		}.bind(this), 200); // @todo, this delay is only for visualizing the change in data, else it happens almost instantly
	};

	/**
	 * Asks the host to modify the headers. Mainly for the cache headers.
	 * @param {map} mHeaders Current headers.
	 * @param {Object} oSettings Request settings
	 * @returns {map} The new headers
	 */
	CacheAndRequestDataProvider.prototype._prepareHeaders = function (mHeaders, oSettings) {
		var oCard = this.getCardInstance(),
			oHost = oCard.getHostInstance(),
			oNewSettings = Object.assign({}, oSettings),
			oCache = oNewSettings.cache;

		if (!oCache) {
			oCache = {
				noStore: true,
				maxAge: 0
			};
		}

		if (!oCache.noStore) {
			if (this._bCacheOnly) {
				oCache.maxAge = 3000000;
				oCache.staleWhileRevalidate = 3000000;
			} else if (this._bNoCache) {
				oCache.maxAge = 0;
				oCache.staleWhileRevalidate = 0;
			}
		}

		oNewSettings.cache = oCache;

		if (oHost && oHost.modifyRequestHeaders) {
			return oHost.modifyRequestHeaders(Object.assign({}, mHeaders), oNewSettings, oCard);
		}

		return mHeaders;
	};

	/**
	 * Starts to listen for messages from the host.
	 */
	CacheAndRequestDataProvider.prototype._subscribeToHostMessages = function () {
		var oCard = this.getCardInstance(),
			oHost = oCard.getHostInstance();

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
		var oCard = this.getCardInstance(),
			oHost = oCard.getHostInstance();

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
			oHeader = oCard.getCardHeader();

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
			oHeader = oCard.getCardHeader(),
			$timestamp = this.getCardInstance().$().find(".sapFCardDataTimestamp");

		$timestamp.off("click", this._oRefreshWithoutCacheBound);

		oHeader.removeEventDelegate(this._oHeaderDelegate);
		this._oHeaderDelegate = null;
	};

	return CacheAndRequestDataProvider;
});

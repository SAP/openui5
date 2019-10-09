/*!
 * ${copyright}
 */
/*global Blob*/
sap.ui.define(["sap/base/Log"], function (Log) {
	"use strict";

	/**
	 * A helper for buffering and sending BeaconRequests to a certain URL
	 *
	 * @param {object} option Options for beacon API initialization
	 * @param {string} option.url beacon URL
	 * @param {string} option.maxBufferLength Number of entries in the stack before the beacon is send
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var BeaconRequest = function (option) {
		option = option || {};

		if (!BeaconRequest.isSupported()) {
			throw Error("Beacon API is not supported");
		}

		if (typeof option.url !== "string") {
			throw Error("Beacon url must be valid");
		}

		this._nMaxBufferLength = option.maxBufferLength || 10;
		this._aBuffer = [];
		this._sUrl = option.url;

		/**
		 * Send data if the browser has been closed
		 *
		 * The "visibilitychange" event is not fired in Safari when the browser tab is closed.
		 */
		document.addEventListener("visibilitychange", function () {
			if (document.visibilityState === "hidden") {
				this.send();
			}
		}.bind(this));

		/**
		 * Ensure that the date is sent if the "visibilitychange" event was not fired.
		 */
		window.addEventListener("unload", function () {
			this.send();
		}.bind(this));
	};

	/**
	 * Check if Beacon API is supported by the currently used browser
	 * @return {boolean} true if supported
	 */
	BeaconRequest.isSupported = function() {
		return "navigator" in window && "sendBeacon" in window.navigator && "Blob" in window;
	};

	/**
	 * Append form data to buffer and send request automatically if max buffer length
	 * has been reacherd
	 * @param {string} key Form data key
	 * @param {string} value Form data value
	 */
	BeaconRequest.prototype.append = function(key, value) {
		this._aBuffer.push({key: key, value: value});

		// Send data if queue limit has been reached
		if (this.getBufferLength() === this._nMaxBufferLength) {
			this.send();
		}
	};

	BeaconRequest.prototype.getBufferLength = function() {
		return this._aBuffer.length;
	};

	/**
	 * Send all data stored in buffer and clear the buffer afterwards
	 */
	BeaconRequest.prototype.send = function() {
		if (this.getBufferLength()) {
			// prepare the content to be x-www-form-urlencoded
			var sBody = this._aBuffer.reduce(function(sResult, oEntry) {
				sResult +=  "&" + oEntry.key + "=" + oEntry.value;
				return sResult;
			}, "sap-fesr-only=1");

			//blobs are supported in all browsers using sendBeacon
			var oBeaconDataToSend = new Blob([sBody], {
				type: "application/x-www-form-urlencoded;charset=UTF-8"
			});
			window.navigator.sendBeacon(this._sUrl, oBeaconDataToSend);
			this.clear();
		}
	};

	/**
	 * Clears the buffer
	 */
	BeaconRequest.prototype.clear = function() {
		this._aBuffer = [];
	};

	return BeaconRequest;
});
/*!
 * ${copyright}
 */
/*global Blob*/
sap.ui.define([], function () {
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
		 * Send data if the document visibility has changed to 'hidden'.
		 * That's the case if the tab inactive e.g. by switching to another tab
		 * or in case the active tab is closed. On mobile devices it's the only
		 * reliable event for detecting tab switch or minimizing/closing the
		 * browser.
		 * Previously also the pagehinde event was needed because safari did not
		 * fire the 'visibilitychange' event on navigating away from a page but
		 * but as of Safari 14.5 this issue is fixed.
		 */
		document.addEventListener("visibilitychange", function () {
			if (document.visibilityState === "hidden") {
				this.send();
			}
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
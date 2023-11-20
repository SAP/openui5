/*!
 * ${copyright}
 */
sap.ui.define([
	"./LocalStorageMock",
	"sap/ui/support/supportRules/Storage"
], function (
	LocalStorageMock,
	Storage
) {
	"use strict";

	var CHANNELS = {
		INIT: "initMockedStorageData",
		PRESERVE: "preserveMockedStorageData"
	};

	// Helper module that syncs IFrame's storage with the opener's
	var StorageSynchronizer = {
		_fnAfterInitFrame: null,
		_mOpenerStorageData: {},
		_sOpenerCookie: ""
	};

	// Serves as an interface for setting and getting document.cookie
	var _mockedCookieInterface = {
		_sCookie: "",
		get cookie() {
			return this._sCookie;
		},
		set cookie(sValue) {
			var aCookies = this._sCookie.split(" "),
				sCookieName = sValue.split("=").shift();

			var iCookieIndex = aCookies.findIndex(function (sCookie) {
				return sCookie.startsWith(sCookieName  + "=");
			});

			if (iCookieIndex > -1) {
				aCookies[iCookieIndex] = sValue + ";";
			} else if (sValue !== "") {
				aCookies.push(sValue + ";");
			}

			this._sCookie = aCookies.join(' ').trim();
		}
	};

	/**
	 * To be called from the opening window
	 */
	StorageSynchronizer.initialize = function () {
		window.addEventListener("message", function (event) {
			if (event.data.id === CHANNELS.INIT) {
				event.source.postMessage({
					id: CHANNELS.INIT,
					storage: this._mOpenerStorageData,
					cookie: this._sOpenerCookie
				}, event.source.location.origin);
			} else if (event.data.id === CHANNELS.PRESERVE) {
				this._mOpenerStorageData = event.data.storage;
				this._sOpenerCookie = event.data.cookie;
			}
		}.bind(this));
	};

	/**
	 * To be called from the opening window
	 * @param {window} oFrame The frame from which opener will request data
	 */
	StorageSynchronizer.preserve = function (oFrame) {
		oFrame.postMessage({
			id: CHANNELS.PRESERVE
		}, oFrame.location.origin);
	};

	/**
	 * To be called from the opening window
	 */
	StorageSynchronizer.deletePersistedData = function () {
		this._mOpenerStorageData = {};
		this._sOpenerCookie = "";
	};

	/**
	 * To be called from the opened frame
	 * @param {function} fnCallback Function which will be executed after the real Storage is mocked.
	 */
	StorageSynchronizer.initializeFrame = function (fnCallback) {
		window.parent.postMessage({ id: CHANNELS.INIT }, window.parent.location.origin);
		this._fnAfterInitFrame = fnCallback;
	};

	/**
	 * To be called from the opened frame
	 */
	StorageSynchronizer.preparePreserveFrame = function () {
		window.addEventListener("message", function (event) {
			if (event.data.id === CHANNELS.PRESERVE) {
				window.parent.postMessage({
					id: CHANNELS.PRESERVE,
					storage: Storage._getStorage()._mData,
					cookie: Storage._getCookieInterface().cookie
				}, window.parent.location.origin);
			}
		});
	};

	/**
	 * To be called from the opened frame
	 */
	StorageSynchronizer.prepareInitFrame = function () {
		Storage._setCookieInterface(_mockedCookieInterface);

		window.addEventListener("message", function (event) {
			if (event.data.id === CHANNELS.INIT) {
				Storage._setStorage(new LocalStorageMock(event.data.storage));
				Storage._getCookieInterface().cookie = event.data.cookie;
				this._fnAfterInitFrame();
			}
		}.bind(this));
	};

	return StorageSynchronizer;
});

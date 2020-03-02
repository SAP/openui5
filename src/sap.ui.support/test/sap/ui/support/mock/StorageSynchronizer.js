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

	// Helper module that syncs IFrame's storage with the opener's
	var mOpenerStorageData = {},
		sOpenerCookie = "";

	var CHANNELS = {
		INIT: "initMockedStorageData",
		PRESERVE: "preserveMockedStorageData"
	};

	/**
	 * To be called from the opening window
	 */
	function initialize () {
		window.addEventListener("message", function (event) {
			if (event.data.id === CHANNELS.INIT) {
				event.source.postMessage({
					id: CHANNELS.INIT,
					storage: mOpenerStorageData,
					cookie: sOpenerCookie
				}, event.source.location.origin);
			} else if (event.data.id === CHANNELS.PRESERVE) {
				mOpenerStorageData = event.data.storage;
				sOpenerCookie = event.data.cookie;
			}
		});
	}

	/**
	 * To be called from the opening window
	 * @param {window} oFrame The frame from which opener will request data
	 */
	function preserve (oFrame) {
		oFrame.postMessage({
			id: CHANNELS.PRESERVE
		}, oFrame.location.origin);
	}

	/**
	 * To be called from the opening window
	 */
	function deletePersistedData () {
		mOpenerStorageData = {};
		sOpenerCookie = "";
	}

	/**
	 * To be called from the opened frame
	 */
	function initializeFrame () {
		window.parent.postMessage({ id: CHANNELS.INIT }, window.parent.location.origin);
	}

	/**
	 * To be called from the opened frame
	 */
	function preparePreserveFrame () {
		window.addEventListener("message", function (event) {
			if (event.data.id === CHANNELS.PRESERVE) {
				window.parent.postMessage({
					id: CHANNELS.PRESERVE,
					storage: Storage._getStorage()._mData,
					cookie: Storage._getCookie()
				}, window.parent.location.origin);
			}
		});
	}

	/**
	 * To be called from the opened frame
	 */
	function prepareInitFrame () {
		window.addEventListener("message", function (event) {
			if (event.data.id === CHANNELS.INIT) {
				Storage._setStorage(new LocalStorageMock(event.data.storage));
				Storage._setCookie(event.data.cookie);
			}
		});
	}

	return {
		initialize: initialize,
		preserve: preserve,
		deletePersistedData: deletePersistedData,
		initializeFrame: initializeFrame,
		preparePreserveFrame: preparePreserveFrame,
		prepareInitFrame: prepareInitFrame
	};
});

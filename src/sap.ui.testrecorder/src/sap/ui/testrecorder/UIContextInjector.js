/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Object",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels"
], function (jQuery, BaseObject, CommunicationBus, CommunicationChannels) {
	"use strict";

	var oUIContextInjector = null;

	var IFRAME_ID = "sap-ui-test-recorder-frame";
	var FRAME_HEIGHT = {
		MIN: "32px",
		MID: "50%",
		MAX: "100%"
	};
	var FRAME_WIDTH = {
		MIN: "180px",
		MAX: "100%"
	};

	var UIContextInjector = BaseObject.extend("sap.ui.testrecorder.UIContextInjector", {
		constructor: function () {
			if (!oUIContextInjector) {
				this._sIdentifier = generateIdentifier();
				Object.apply(this, arguments);
			} else {
				return oUIContextInjector;
			}
		}
	});

	UIContextInjector.prototype.injectFrame = function (aTestRecorderConfig, fnOnClose) {
		window.communicationWindows = window.communicationWindows || {};
		this.fnOnClose = fnOnClose;
		this._generateTestRecorderUrl();
		this._isInIframe = aTestRecorderConfig.indexOf("window") === -1;

		if (this._isInIframe) {
			this._openFrame();
		} else {
			this._openWindow();
		}

		// beforeunload will only work if the page was loaded and received; it is not guarateed to fire
		window.communicationWindows.testRecorder.addEventListener("beforeunload", function () {
			if (!this._dockStarted && !this._closeTriggered) {
				this.close();
			}
		}.bind(this));

		CommunicationBus.subscribe(CommunicationChannels.HIDE_IFRAME, this.hideFrame.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.SHOW_IFRAME, this.showFrame.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.RESIZE_IFRAME_UP, this.resizeFrameUp.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.RESIZE_IFRAME_DOWN, this.resizeFrameDown.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.CLOSE_IFRAME, this.close.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.DOCK_IFRAME, this.dockFrame.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.OPEN_NEW_WINDOW, this.openNewWindow.bind(this));
	};

	UIContextInjector.prototype.hideFrame = function (bHidden) {
		var frameStyle = document.getElementById(IFRAME_ID).style;
		this._originalFrameSize = {
			width: frameStyle.width,
			height: frameStyle.height
		};

		frameStyle.width = FRAME_WIDTH.MIN;
		frameStyle.height = FRAME_HEIGHT.MIN;
	};

	UIContextInjector.prototype.showFrame = function (bHidden) {
		var frameStyle = document.getElementById(IFRAME_ID).style;
		if (this._originalFrameSize) {
			frameStyle.width = this._originalFrameSize.width;
			frameStyle.height = this._originalFrameSize.height;
			this._originalFrameSize = null;
		} else {
			frameStyle.width = FRAME_WIDTH.MAX;
			frameStyle.height = FRAME_HEIGHT.MID;
		}
	};

	UIContextInjector.prototype.resizeFrameUp = function () {
		var frameStyle = document.getElementById(IFRAME_ID).style;
		switch (frameStyle.height) {
			case FRAME_HEIGHT.MIN: frameStyle.height = FRAME_HEIGHT.MID; break;
			case FRAME_HEIGHT.MID: frameStyle.height = FRAME_HEIGHT.MAX; break;
			default: frameStyle.height = FRAME_HEIGHT.MAX;
		}
	};

	UIContextInjector.prototype.resizeFrameDown = function () {
		var frameStyle = document.getElementById(IFRAME_ID).style;
		switch (frameStyle.height) {
			case FRAME_HEIGHT.MAX: frameStyle.height = FRAME_HEIGHT.MID; break;
			case FRAME_HEIGHT.MID: frameStyle.height = FRAME_HEIGHT.MIN; break;
			default: frameStyle.height = FRAME_HEIGHT.MIN;
		}
	};

	UIContextInjector.prototype.dockFrame = function () {
		this._dockStarted = true;
		this.close();
		this._openFrame();
	};

	UIContextInjector.prototype.openNewWindow = function () {
		this._dockStarted = true;
		this.close();
		this._openWindow();
	};

	UIContextInjector.prototype._openWindow = function () {
		window.communicationWindows.testRecorder = window.open(
			this._sUrl,
			"sapUiTestRecorder",
			"width=1024,height=700,status=no,toolbar=no,menubar=no,resizable=yes,location=no,directories=no,scrollbars=yes"
		);

		window.communicationWindows.testRecorder.window.onload = function () {
			window.communicationWindows.testRecorder.document.title = "Test Recorder";
		};
		this._isInIframe = false;
		this._dockStarted = false;
		this._closeTriggered = false;
	};

	UIContextInjector.prototype._openFrame = function () {
		var iFrame = document.createElement("IFRAME");

		iFrame.id = IFRAME_ID;
		iFrame.src = this._sUrl;

		iFrame.style.width = FRAME_WIDTH.MAX;
		iFrame.style.height = FRAME_HEIGHT.MID;
		iFrame.style.position = "absolute";
		iFrame.style.left = "0";
		iFrame.style.bottom = "0";
		iFrame.style.border = "none";
		iFrame.style.borderRadius = "1px";
		iFrame.style.zIndex = "1001";
		iFrame.style.boxShadow = "1px -10px 42px -4px #888";

		document.body.appendChild(iFrame);
		window.communicationWindows.testRecorder = iFrame.contentWindow;
		this._dockStarted = false;
		this._isInIframe = true;
		this._closeTriggered = false;
	};

	UIContextInjector.prototype.close = function () {
		// the window can close via window buttons and app view buttons.
		// when docking or closing with app buttons,
		// if onbeforeunload is triggered, close will be executed 2 times, causing errors in IE11 and Edge
		if (this._closeTriggered) {
			return;
		}
		this._closeTriggered = true;
		if (this._isInIframe) {
			var frame = document.getElementById(IFRAME_ID);
			var frameWindow = frame && frame.contentWindow;
			if (frameWindow) {
				// Workaround for IE - there are errors even after removing the frame so setting the onerror to noop again seems to be fine
				frameWindow.onerror = jQuery.noop;
				frame.src = "about:blank";
				frameWindow.document.write('');
				frameWindow.close();
				/*global CollectGarbage */
				if (typeof CollectGarbage == "function") {
					CollectGarbage(); // eslint-disable-line
				}
				frame.remove();
			}
		} else if (window.communicationWindows.testRecorder) {
			window.communicationWindows.testRecorder.close();
		}

		if (!this._dockStarted) {
			// cleanup globals
			window.communicationWindows = {};
			// notify the contextInjector starter
			this.fnOnClose();
		}
	};

	UIContextInjector.prototype.getCommunicationInfo = function () {
		return {
			origin: this._sOrigin,
			identifier: this._sIdentifier,
			url: this._sUrl
		};
	};

	UIContextInjector.prototype._generateTestRecorderUrl = function () {
		this._sUrl = jQuery.sap.getModulePath("sap.ui.testrecorder.ui",
			"/overlay.html?sap-ui-testrecorder-origin=" + window.location.protocol +
			"//" + window.location.host + "&" + "sap-ui-testrecorder-frame-identifier=" + this._sIdentifier);
		var frameURI = new window.URI(this._sUrl);
		this._sOrigin = ( frameURI.protocol() || window.location.protocol.replace(':', '') ) +
			'://' + ( frameURI.host() || window.location.host );
	};

	function generateIdentifier() {
		return '' + Date.now();
	}

	oUIContextInjector = new UIContextInjector();

	return oUIContextInjector;

}, true);

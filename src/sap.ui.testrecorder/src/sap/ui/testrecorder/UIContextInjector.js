/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI",
	"sap/ui/base/Object",
	"sap/base/util/restricted/_debounce",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/testrecorder/Constants"
], function (jQuery, URI, BaseObject, _debounce, CommunicationBus, CommunicationChannels, constants) {
	"use strict";

	var oUIContextInjector = null;
	var bResizeHandleDragged = false;

	var UIContextInjector = BaseObject.extend("sap.ui.testrecorder.UIContextInjector", {
		constructor: function () {
			if (!oUIContextInjector) {
				BaseObject.apply(this, arguments);
				this._sIdentifier = generateIdentifier();
			} else {
				return oUIContextInjector;
			}
		}
	});

	// entry point; creates the recorder on request
	UIContextInjector.prototype.injectFrame = function (aTestRecorderConfig, fnOnClose) {
		window.communicationWindows = window.communicationWindows || {};
		this._generateTestRecorderUrl();
		this.fnOnClose = fnOnClose;
		this._isInIframe = aTestRecorderConfig.indexOf("window") === -1;

		this._onResizeHandleMouseover = _onResizeHandleMouseover.bind(this);
		this._onResizeHandleMousedown = _onResizeHandleMousedown.bind(this);
		this._onResizeHandleMouseleave = _onResizeHandleMouseleave.bind(this);
		this._onDocumentMouseup = _onDocumentMouseup.bind(this);
		this._onDocumentMousemove = _onDocumentMousemove.bind(this);

		if (this._isInIframe) {
			// when starting the recorder via URL params, open it in an iframe docked to the bottom of the screen
			this.dockFrameBottom();
		} else {
			this._openWindow();
		}

		CommunicationBus.subscribe(CommunicationChannels.MINIMIZE_IFRAME, this.minimizeFrame.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.SHOW_IFRAME, this.unminimizeFrame.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.CLOSE_IFRAME, this.close.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.OPEN_NEW_WINDOW, this.openNewWindow.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.DOCK_IFRAME_BOTTOM, this.dockFrameBottom.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.DOCK_IFRAME_RIGHT, this.dockFrameRight.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.DOCK_IFRAME_LEFT, this.dockFrameLeft.bind(this));
	};

	UIContextInjector.prototype.minimizeFrame = function () {
		this._iframe.style.width = constants.FRAME.MINIMIZED.width;
		this._iframe.style.height = constants.FRAME.MINIMIZED.height;
		Object.values(this._resizeHandles).forEach(function (resizeHandle) {
			resizeHandle.style.display = "none";
		});
	};

	UIContextInjector.prototype.unminimizeFrame = function () {
		switch (this._sRememberedDockSide) {
			case constants.DOCK.RIGHT: this.dockFrameRight(); break;
			case constants.DOCK.LEFT: this.dockFrameLeft(); break;
			case constants.DOCK.BOTTOM:
			default: this.dockFrameBottom(); break;
		}
	};

	UIContextInjector.prototype.dockFrameBottom = function () {
		this._dockFrame(constants.DOCK.BOTTOM);
	};

	UIContextInjector.prototype.dockFrameRight = function () {
		this._dockFrame(constants.DOCK.RIGHT);
	};

	UIContextInjector.prototype.dockFrameLeft = function () {
		this._dockFrame(constants.DOCK.LEFT);
	};

	UIContextInjector.prototype._dockFrame = function (sSide) {
		if (!this._iframe) {
			// when docking from a window, first close it and then dock a new frame to the chosen side
			this._dockStarted = true;
			this.close();
			this._openFrame();
		}
		this._sRememberedDockSide = sSide;
		// change the iframe position to be the default for the requested side
		for (var sFrameProp in constants.FRAME[sSide]) {
			this._iframe.style[sFrameProp] = constants.FRAME[sSide][sFrameProp];
		}

		// show (only) the relevant resize handle
		Object.values(this._resizeHandles).forEach(function (resizeHandle) {
			resizeHandle.style.display = "none";
		});
		this._resizeHandles[sSide].style.display = "block";
		// return the handle to its default position, to fit the newly docked iframe
		for (var sHandleProp in constants.RESIZE_HANDLE[sSide]) {
			this._resizeHandles[sSide].style[sHandleProp] = constants.RESIZE_HANDLE[sSide][sHandleProp];
		}
	};

	// undock the iframe - close the iframe and open a window
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

		window.communicationWindows.testRecorder.document.title = "Test Recorder";
		_setLanguageFromParentWindow();

		this._isInIframe = false;
		this._dockStarted = false;
		this._closeTriggered = false;

		setTimeout(function () {
			var fnBeforeUnloadListener = function () {
				window.communicationWindows.testRecorder.removeEventListener("beforeunload", fnBeforeUnloadListener);
				if (!this._dockStarted && !this._closeTriggered) {
					this.close();
				}
			}.bind(this);

			// beforeunload will only work if the page was loaded and received; it is not guarateed to fire
			if (window.communicationWindows.testRecorder.closed) {
				if (!this._dockStarted && !this._closeTriggered) {
					this.close();
				}
			} else {
				window.communicationWindows.testRecorder.addEventListener("beforeunload", fnBeforeUnloadListener);
			}
		}.bind(this), 1000);
	};

	UIContextInjector.prototype._openFrame = function () {
		var iFrame = document.createElement("IFRAME");
		// when mouse is moved, it will move over this overlay
		// this way, handlers on the parent document continue to work when mouse is over iframe
		var resizeOverlay = document.createElement("DIV");
		var resizeHandleBottom = this._createResizeHandle(jQuery.extend(constants.RESIZE_HANDLE.BOTTOM, {
			cursor: "n-resize",
			resize: function (resizeHandle, mPosition) {
				resizeHandle.style.top = mPosition.y + "px";
				this._iframe.style.height = "calc(100% - " + mPosition.y + "px)";
			}.bind(this)
		}));
		var resizeHandleRight = this._createResizeHandle(jQuery.extend(constants.RESIZE_HANDLE.RIGHT, {
			cursor: "e-resize",
			resize: function (resizeHandle, mPosition) {
				resizeHandle.style.left = mPosition.x + "px";
				this._iframe.style.left = mPosition.x + "px";
				this._iframe.style.width = "calc(100% - " + mPosition.x + "px)";
			}.bind(this)
		}));
		var resizeHandleLeft = this._createResizeHandle(jQuery.extend(constants.RESIZE_HANDLE.LEFT, {
			cursor: "w-resize",
			resize: function (resizeHandle, mPosition) {
				resizeHandle.style.left = mPosition.x + "px";
				this._iframe.style.width = mPosition.x + "px";
			}.bind(this)
		}));

		resizeOverlay.id = constants.RESIZE_OVERLAY_ID;
		resizeOverlay.style.position = "absolute";
		resizeOverlay.style.width = "100%";
		resizeOverlay.style.height = "100%";
		resizeOverlay.style.top = "0";
		resizeOverlay.style.left = "0";
		resizeOverlay.style["z-index"] = constants.RESIZE_OVERLAY_ZINDEX;
		resizeOverlay.style.display = "none";

		iFrame.id = constants.IFRAME_ID;
		iFrame.src = this._sUrl;
		iFrame.style.position = "absolute";
		iFrame.style.border = "none";
		iFrame.style.borderRadius = "1px";
		iFrame.style["z-index"] = constants.IFRAME_ZINDEX;
		iFrame.style.boxShadow = "1px -10px 42px -4px #888";

		document.body.appendChild(resizeHandleBottom);
		document.body.appendChild(resizeHandleRight);
		document.body.appendChild(resizeHandleLeft);
		document.body.appendChild(resizeOverlay);
		document.body.appendChild(iFrame);

		window.communicationWindows.testRecorder = iFrame.contentWindow;
		_setLanguageFromParentWindow();

		this._iframe = iFrame;
		this._resizeOverlay = resizeOverlay;
		this._resizeHandles = {
			BOTTOM: resizeHandleBottom,
			RIGHT: resizeHandleRight,
			LEFT: resizeHandleLeft
		};
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
			var frameWindow = this._iframe && this._iframe.contentWindow;
			if (frameWindow) {
				this._iframe.src = "about:blank";
				frameWindow.close();
				/*global CollectGarbage */
				if (typeof CollectGarbage == "function") {
					CollectGarbage(); // eslint-disable-line
				}
				this._iframe.remove();
				this._resizeOverlay.remove();
				Object.values(this._resizeHandles).forEach(function (resizeHandle) {
					resizeHandle.remove();
				});
				this._iframe = null;
				this._resizeOverlay = null;
				this._resizeHandles = {};
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
		var mUriParams = new URI().search(true);
		var aIncludeList = ["sap-language"];
		var aExcludeList = ["sap-ui-testRecorder"];
		var sSapUriParams = Object.keys(mUriParams).map(function (sUriParamName) {
			if (aExcludeList.indexOf(sUriParamName) === -1 && sUriParamName.startsWith("sap-ui-") || aIncludeList.indexOf(sUriParamName) > -1) {
				return "&" + sUriParamName + "=" + mUriParams[sUriParamName];
			}
		}).join("");

		this._sUrl = sap.ui.require.toUrl("sap/ui/testrecorder/ui/overlay.html") +
			"?sap-ui-testrecorder-origin=" + window.location.protocol +
			"//" + window.location.host + "&" + "sap-ui-testrecorder-frame-identifier=" + this._sIdentifier + sSapUriParams;
		var frameURI = new URI(this._sUrl);
		this._sOrigin = ( frameURI.protocol() || window.location.protocol.replace(':', '') ) +
			'://' + ( frameURI.host() || window.location.host );
	};

	UIContextInjector.prototype._createResizeHandle = function (mOptions) {
		var resizeHandle = document.createElement("DIV");
		resizeHandle.id = mOptions.id;
		resizeHandle.style.position = "absolute";
		resizeHandle.style.width = mOptions.width;
		resizeHandle.style.height = mOptions.height;
		resizeHandle.style.left = mOptions.left;
		resizeHandle.style.top = mOptions.top;
		resizeHandle.style["z-index"] = constants.RESIZE_HANDLE_ZINDEX;
		resizeHandle.style.cursor = mOptions.cursor;
		resizeHandle.style.display = "none"; // all handles should be invisible initially

		resizeHandle.onmouseover = this._onResizeHandleMouseover(resizeHandle);
		resizeHandle.onmousedown = this._onResizeHandleMousedown(resizeHandle, mOptions.resize);
		resizeHandle.onmouseleave = this._onResizeHandleMouseleave(resizeHandle);

		return resizeHandle;
	};

	function _onResizeHandleMouseover (resizeHandle) {
		return function () {
			// highlight
			resizeHandle.style.background = "#0854a0";
		};
	}

	function _onResizeHandleMousedown (resizeHandle, fnResize) {
		return function (e) {
			e.preventDefault();
			bResizeHandleDragged = true;
			// show the full screen overlay so the mouse can be tracked even when it's 'over' the iframe
			this._resizeOverlay.style.display = "block";
			// attach events to the document to monitor the mouse movement
			document.onmouseup = this._onDocumentMouseup;
			document.onmousemove = this._onDocumentMousemove(resizeHandle, fnResize);
		}.bind(this);
	}

	function _onResizeHandleMouseleave (resizeHandle) {
		return function () {
			if (!bResizeHandleDragged) {
				// remove highlight when not dragging
				resizeHandle.style.background = "transparent";
			}
		};
	}

	function _onDocumentMouseup () {
		// stop resizing the frame
		bResizeHandleDragged = false;
		this._resizeOverlay.style.display = "none";
		document.onmouseup = null;
		document.onmousemove = null;
	}

	function _onDocumentMousemove (resizeHandle, fnResize) {
		return _debounce(function (e) {
			e.preventDefault();
			var iLimit = 150; // the recorder starting position should stay within the visible window
			fnResize(resizeHandle, {
				x: Math.max(Math.min(e.clientX, window.innerWidth - iLimit), iLimit),
				y: Math.max(Math.min(e.clientY, window.innerHeight - iLimit), iLimit)
			});
		}, 50);
	}

	function generateIdentifier() {
		return '' + Date.now();
	}

	function _setLanguageFromParentWindow() {
		var appBootstrapScript = window.document.getElementById("sap-ui-bootstrap");
		if (appBootstrapScript && appBootstrapScript.dataset.sapUiLanguage) {
			_pollForRecorderBootstrap(function (recorderBootstrapScript) {
				recorderBootstrapScript.dataset.sapUiLanguage = appBootstrapScript.dataset.sapUiLanguage;
			});
		}
		if (appBootstrapScript && appBootstrapScript.dataset.sapUiConfig) {
			appBootstrapScript.dataset.sapUiConfig.split(",").forEach(function (sConfig) {
				if (sConfig.startsWith("language:")) {
					_pollForRecorderBootstrap(function (recorderBootstrapScript) {
						recorderBootstrapScript.dataset.sapUiConfig = recorderBootstrapScript.dataset.sapUiConfig ?
						recorderBootstrapScript.dataset.sapUiConfig + "," + sConfig : sConfig;
					});
				}
			});
		}
		if (window["sap-ui-config"].language) {
			window.communicationWindows.testRecorder["sap-ui-config"] = window.communicationWindows.testRecorder["sap-ui-config"] || {};
			window.communicationWindows.testRecorder["sap-ui-config"].language = window["sap-ui-config"].language;
		}
	}

	function _pollForRecorderBootstrap(fnDone) {
		var recorderBootstrapScript = window.communicationWindows.testRecorder.document.getElementById("sap-ui-bootstrap");
		if (recorderBootstrapScript) {
			fnDone(recorderBootstrapScript);
		} else {
			setTimeout(function () {
				_pollForRecorderBootstrap(fnDone);
			}, 10);
		}
	}

	oUIContextInjector = new UIContextInjector();

	return oUIContextInjector;

}, true);

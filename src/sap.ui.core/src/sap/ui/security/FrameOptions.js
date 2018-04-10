/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global XMLHttpRequest */
sap.ui.define(['sap/base/Log'], function(Log) {

	"use strict";

	/**
	 * FrameOptions class
	 */
	var FrameOptions = function(mSettings) {
		/* mSettings: mode, callback, whitelist, whitelistService, timeout, blockEvents, showBlockLayer, allowSameOrigin */
		this.mSettings = mSettings || {};
		this.sMode = this.mSettings.mode || FrameOptions.Mode.ALLOW;
		this.fnCallback = this.mSettings.callback;
		this.iTimeout = this.mSettings.timeout || 10000;
		this.bBlockEvents = this.mSettings.blockEvents !== false;
		this.bShowBlockLayer = this.mSettings.showBlockLayer !== false;
		this.bAllowSameOrigin = this.mSettings.allowSameOrigin !== false;
		this.sParentOrigin = '';
		this.bUnlocked = false;
		this.bRunnable = false;
		this.bParentUnlocked = false;
		this.bParentResponded = false;
		this.sStatus = "pending";
		this.aFPChilds = [];

		var that = this;

		this.iTimer = setTimeout(function() {
			if (that.bRunnable && that.bParentResponded && !that.bParentUnlocked) {
				Log.error("Reached timeout of " + that.iTimeout + "ms waiting for the parent to be unlocked", "", "sap/ui/security/FrameOptions");
			} else {
				Log.error("Reached timeout of " + that.iTimeout + "ms waiting for a response from parent window", "", "sap/ui/security/FrameOptions");
			}
			that._callback(false);
		}, this.iTimeout);

		var fnHandlePostMessage = function() {
			that._handlePostMessage.apply(that, arguments);
		};

		FrameOptions.__window.addEventListener('message', fnHandlePostMessage);

		if (FrameOptions.__parent === FrameOptions.__self || FrameOptions.__parent == null || this.sMode === FrameOptions.Mode.ALLOW) {
			// unframed page or "allow all" mode
			this._applyState(true, true);
		} else {
			// framed page

			this._lock();

			// "deny" mode blocks embedding page from all origins
			if (this.sMode === FrameOptions.Mode.DENY) {
				Log.error("Embedding blocked because configuration mode is set to 'DENY'", "", "sap/ui/security/FrameOptions");
				this._callback(false);
				return;
			}

			if (this.bAllowSameOrigin) {

				try {
					var oParentWindow = FrameOptions.__parent;
					var bOk = false;
					var bTrue = true;
					do {
						var test = oParentWindow.document.domain;
						if (oParentWindow == FrameOptions.__top) {
							if (test != undefined) {
								bOk = true;
							}
							break;
						}
						oParentWindow = oParentWindow.parent;
					} while (bTrue);
					if (bOk) {
						this._applyState(true, true);
					}
				} catch (e) {
					// access to the top window is not possible
					this._sendRequireMessage();
				}

			} else {
				// same origin not allowed
				this._sendRequireMessage();
			}

		}

	};

	FrameOptions.Mode = {
		// only allow with same origin parent
		TRUSTED: 'trusted',

		// allow all kind of embedding (default)
		ALLOW: 'allow',

		// deny all kinds of embedding
		DENY: 'deny'
	};

	// Allow globals to be mocked in unit test
	FrameOptions.__window = window;
	FrameOptions.__parent = parent;
	FrameOptions.__self = self;
	FrameOptions.__top = top;

	// List of events to block while framing is unconfirmed
	FrameOptions._events = [
		"mousedown", "mouseup", "click", "dblclick", "mouseover", "mouseout",
		"touchstart", "touchend", "touchmove", "touchcancel",
		"keydown", "keypress", "keyup"
	];

	// check if string matches pattern
	FrameOptions.prototype.match = function(sProbe, sPattern) {
		if (!(/\*/i.test(sPattern))) {
			return sProbe == sPattern;
		} else {
			sPattern = sPattern.replace(/\//gi, "\\/"); // replace /   with \/
			sPattern = sPattern.replace(/\./gi, "\\."); // replace .   with \.
			sPattern = sPattern.replace(/\*/gi, ".*");  // replace *   with .*
			sPattern = sPattern.replace(/:\.\*$/gi, ":\\d*"); // replace :.* with :\d* (only at the end)

			if (sPattern.substr(sPattern.length - 1, 1) !== '$') {
				sPattern = sPattern + '$'; // if not already there add $ at the end
			}
			if (sPattern.substr(0, 1) !== '^') {
				sPattern = '^' + sPattern; // if not already there add ^ at the beginning
			}

			// sPattern looks like: ^.*:\/\/.*\.company\.corp:\d*$ or ^.*\.company\.corp$
			var r = new RegExp(sPattern, 'i');
			return r.test(sProbe);
		}
	};

	FrameOptions._lockHandler = function(oEvent) {
		oEvent.stopPropagation();
		oEvent.preventDefault();
	};

	FrameOptions.prototype._createBlockLayer = function() {
		if (document.readyState == "complete") {
			var lockDiv = document.createElement("div");
			lockDiv.style.position = "absolute";
			lockDiv.style.top = "-1000px";
			lockDiv.style.bottom = "-1000px";
			lockDiv.style.left = "-1000px";
			lockDiv.style.right = "-1000px";
			lockDiv.style.opacity = "0";
			lockDiv.style.backgroundColor = "white";
			lockDiv.style.zIndex = 2147483647; // Max value of signed integer (32bit)
			document.body.appendChild(lockDiv);
			this._lockDiv = lockDiv;
		}
	};

	FrameOptions.prototype._setCursor = function() {
		if (this._lockDiv) {
			this._lockDiv.style.cursor = this.sStatus == "denied" ? "not-allowed" : "wait";
		}
	};

	FrameOptions.prototype._lock = function() {
		var that = this;
		if (this.bBlockEvents) {
			for (var i = 0; i < FrameOptions._events.length; i++) {
				document.addEventListener(FrameOptions._events[i], FrameOptions._lockHandler, true);
			}
		}
		if (this.bShowBlockLayer) {
			this._blockLayer = function() {
				that._createBlockLayer();
				that._setCursor();
			};
			if (document.readyState == "complete") {
				this._blockLayer();
			} else {
				document.addEventListener("readystatechange", this._blockLayer);
			}
		}
	};

	FrameOptions.prototype._unlock = function() {
		if (this.bBlockEvents) {
			for (var i = 0; i < FrameOptions._events.length; i++) {
				document.removeEventListener(FrameOptions._events[i], FrameOptions._lockHandler, true);
			}
		}
		if (this.bShowBlockLayer) {
			document.removeEventListener("readystatechange", this._blockLayer);
			if (this._lockDiv) {
				document.body.removeChild(this._lockDiv);
				delete this._lockDiv;
			}
		}
	};

	FrameOptions.prototype._callback = function(bSuccess) {
		this.sStatus = bSuccess ? "allowed" : "denied";
		this._setCursor();
		clearTimeout(this.iTimer);
		if (typeof this.fnCallback === 'function') {
			this.fnCallback.call(null, bSuccess);
		}
	};

	FrameOptions.prototype._applyState = function(bIsRunnable, bIsParentUnlocked) {
		if (this.bUnlocked) {
			return;
		}
		if (bIsRunnable) {
			this.bRunnable = true;
		}
		if (bIsParentUnlocked) {
			this.bParentUnlocked = true;
		}
		if (!this.bRunnable || !this.bParentUnlocked) {
			return;
		}
		this._unlock();
		this._callback(true);
		this._notifyChildFrames();
		this.bUnlocked = true;
	};

	FrameOptions.prototype._applyTrusted = function(bTrusted) {
		if (bTrusted) {
			this._applyState(true, false);
		} else {
			this._callback(false);
		}
	};

	FrameOptions.prototype._check = function(bParentResponsePending) {
		if (this.bRunnable) {
			return;
		}
		var bTrusted = false;
		if (this.bAllowSameOrigin && this.sParentOrigin && FrameOptions.__window.document.URL.indexOf(this.sParentOrigin) == 0) {
			bTrusted = true;
		} else if (this.mSettings.whitelist && this.mSettings.whitelist.length != 0) {
			var sHostName = this.sParentOrigin.split('//')[1];
			sHostName = sHostName.split(':')[0];
			for (var i = 0; i < this.mSettings.whitelist.length; i++) {
				var match = sHostName.indexOf(this.mSettings.whitelist[i]);
				if (match != -1 && sHostName.substring(match) == this.mSettings.whitelist[i]) {
					bTrusted = true;
					break;
				}
			}
		}
		if (bTrusted) {
			this._applyTrusted(bTrusted);
		} else if (this.mSettings.whitelistService) {
			var that = this;
			var xmlhttp = new XMLHttpRequest();
			var url = this.mSettings.whitelistService + '?parentOrigin=' + encodeURIComponent(this.sParentOrigin);
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) {
					that._handleXmlHttpResponse(xmlhttp, bParentResponsePending);
				}
			};
			xmlhttp.open('GET', url, true);
			xmlhttp.setRequestHeader('Accept', 'application/json');
			xmlhttp.send();
		} else {
			Log.error("Embedding blocked because the whitelist or the whitelist service is not configured correctly", "", "sap/ui/security/FrameOptions");
			this._callback(false);
		}
	};

	FrameOptions.prototype._handleXmlHttpResponse = function(xmlhttp, bParentResponsePending) {
		if (xmlhttp.status === 200) {
			var bTrusted = false;
			var sResponseText = xmlhttp.responseText;
			var oRuleSet = JSON.parse(sResponseText);
			if (oRuleSet.active == false) {
				this._applyState(true, true);
			} else if (bParentResponsePending) {
				return;
			} else {
				if (this.match(this.sParentOrigin, oRuleSet.origin)) {
					bTrusted = oRuleSet.framing;
				}
				if (!bTrusted) {
					Log.error("Embedding blocked because the whitelist service does not allow framing", "", "sap/ui/security/FrameOptions");
				}
				this._applyTrusted(bTrusted);
			}
		} else {
			Log.error("The configured whitelist service is not available: " + xmlhttp.status, "", "sap/ui/security/FrameOptions");
			this._callback(false);
		}
	};

	FrameOptions.prototype._notifyChildFrames = function() {
		for (var i = 0; i < this.aFPChilds.length; i++) {
			this.aFPChilds[i].postMessage('SAPFrameProtection*parent-unlocked','*');
		}
	};

	FrameOptions.prototype._sendRequireMessage = function() {
		FrameOptions.__parent.postMessage('SAPFrameProtection*require-origin', '*');
		// If not postmessage response was received, send request to whitelist service
		// anyway, to check whether frame protection is enabled
		if (this.mSettings.whitelistService) {
			setTimeout(function() {
				if (!this.bParentResponded) {
					this._check(true);
				}
			}.bind(this), 10);
		}
	};

	FrameOptions.prototype._handlePostMessage = function(oEvent) {
		var oSource = oEvent.source,
			sData = oEvent.data;

		// For compatibility with previous version empty message from parent means parent-unlocked
		// if (oSource === FrameOptions.__parent && sData == "") {
		//	sData = "SAPFrameProtection*parent-unlocked";
		// }

		if (oSource === FrameOptions.__self || oSource == null ||
			typeof sData !== "string" || sData.indexOf("SAPFrameProtection*") === -1) {
			return;
		}
		if (oSource === FrameOptions.__parent) {
			this.bParentResponded = true;
			if (!this.sParentOrigin) {
				this.sParentOrigin = oEvent.origin;
				this._check();
			}
			if (sData == "SAPFrameProtection*parent-unlocked") {
				this._applyState(false, true);
			}
		} else if (oSource.parent === FrameOptions.__self && sData == "SAPFrameProtection*require-origin" && this.bUnlocked) {
			oSource.postMessage("SAPFrameProtection*parent-unlocked", "*");
		} else {
			oSource.postMessage("SAPFrameProtection*parent-origin", "*");
			this.aFPChilds.push(oSource);
		}
	};

	return FrameOptions;
});
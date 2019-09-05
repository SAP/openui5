/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/Constants"
],
function (jQuery, ManagedObject, CommunicationBus, channelNames, constants) {
	"use strict";

	var oIFrameController = null;

	var sFrameOrigin;

	var sFrameIdentifier;

	var sFrameUrl;

	function computeFrameOrigin(sUrl) {
		var frameURI = new window.URI(sUrl);
		var sOrigin = ( frameURI.protocol() || window.location.protocol.replace(':', '') ) +
						'://' +
						( frameURI.host() || window.location.host );

		return sOrigin;
	}

	function generateIdentifier() {
		return '' + +new Date();
	}

	function openFrame(sUrl) {
		var toolFrame = document.createElement("IFRAME");
		var style = toolFrame.style;

		toolFrame.id = "sap-ui-supportToolsFrame";
		toolFrame.src = sUrl;

		style.width = "100%";
		style.height = "28px";
		style.position = "absolute";
		style.left = "0";
		style.bottom = "0";
		style.border = "none";
		// This fixed a visual glitch with the iframe on chrome see BCP 1870314303
		style.borderRadius = "1px";
		style.zIndex = "1001";
		// style.transition = "width 300ms ease-in-out, height 300ms ease-in-out";
		style.boxShadow = "1px -10px 42px -4px #888";

		document.body.appendChild(toolFrame);

		// This interval is needed because sometimes an app is placed at
		// the body element which involves moving everything already there
		// into a new, hidden DIV element
		setInterval(function () {
			if (toolFrame.parentNode.nodeName !== "BODY") {
				document.body.appendChild(toolFrame);
				window.communicationWindows.supportTool = toolFrame.contentWindow;
			}
		}, 1000);

		window.communicationWindows.supportTool = toolFrame.contentWindow;
	}

	function openWindow(sUrl) {
		window.communicationWindows.supportTool = window.open(
			sUrl,
			"sapUiSupportTool",
			"width=1024,height=400,status=no,toolbar=no,menubar=no,resizable=yes,location=no,directories=no,scrollbars=no"
		);

		window.communicationWindows.supportTool.window.onload = function () {
			window.communicationWindows.supportTool.document.title = constants.SUPPORT_ASSISTANT_NAME;
		};
	}

	var IFrameController = ManagedObject.extend("sap.ui.support.IFrameController", {
		constructor: function () {
			if (!oIFrameController) {
				ManagedObject.apply(this, arguments);
			} else {
				jQuery.sap.log.warning("Only one support tool allowed");
				return oIFrameController;
			}
		}
	});

	IFrameController.prototype._setCommunicationSubscriptions = function () {
		CommunicationBus.subscribe(channelNames.ENSURE_FRAME_OPENED, function () {
			if (document.getElementById("sap-ui-supportToolsFrame").style.height === "28px") {
				this.resizeFrame(true);
				this.toggleHide();
			}
		}, this);

		CommunicationBus.subscribe(channelNames.RESIZE_FRAME, function (aParams) {
			oIFrameController.resizeFrame(aParams.bigger);
		});
	};

	IFrameController.prototype.injectFrame = function (supportModeConfig) {
		sFrameIdentifier = generateIdentifier();

		sFrameUrl = jQuery.sap.getModulePath("sap.ui.support.supportRules.ui",
			"/overlay.html?sap-ui-xx-formfactor=compact&sap-ui-xx-support-origin=" +
			window.location.protocol + "//" + window.location.host + "&" +
			"sap-ui-xx-frame-identifier=" + sFrameIdentifier);

		sFrameOrigin = computeFrameOrigin(sFrameUrl);

		window.communicationWindows = window.communicationWindows || {};

		if (supportModeConfig.indexOf("window") > -1) {
			openWindow(sFrameUrl);
		} else {
			openFrame(sFrameUrl);
			this._setCommunicationSubscriptions();
		}
	};

	IFrameController.prototype.resizeFrame = function (bigger) {
		var toolFrameStyle = document.getElementById("sap-ui-supportToolsFrame").style;

		if (bigger) {
			if (toolFrameStyle.height === "50%") {
				toolFrameStyle.height = "100%";
			} else if (toolFrameStyle.height === "28px") {
				toolFrameStyle.height = "50%";
			}
		} else {
			if (toolFrameStyle.height === "100%") {
				toolFrameStyle.height = "50%";
			} else if (toolFrameStyle.height === "50%") {
				toolFrameStyle.height = "28px";
			}
		}
	};

	/**
	 * Toggles frame state between hidden and shown
	 * Default is shown
	 *
	 * @param {boolean} hidden should the frame hide or not
	 */
	IFrameController.prototype.toggleHide = function (hidden) {
		var toolFrameStyle = document.getElementById("sap-ui-supportToolsFrame").style;

		if (hidden) {
			this._originalSize = {
				width: toolFrameStyle.width,
				height: toolFrameStyle.height
			};

			toolFrameStyle.width = "170px";
			toolFrameStyle.height = "28px";
		} else {
			if (this._originalSize) {
				toolFrameStyle.width = this._originalSize.width;
				toolFrameStyle.height = this._originalSize.height;
				this._originalSize = null;
			}
		}
	};

	IFrameController.prototype._stop = function () {
		this._oCssLink.parentNode.removeChild(this._oCssLink);
		this._oDomRef.parentNode.removeChild(this._oCssLink);
		this._oCore = null;
	};

	IFrameController.prototype.getCommunicationInfo = function () {
		return {
			origin: sFrameOrigin,
			identifier: sFrameIdentifier,
			url: sFrameUrl
		};
	};

	oIFrameController = new IFrameController();

	return oIFrameController;

}, true);

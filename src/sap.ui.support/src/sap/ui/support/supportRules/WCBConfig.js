/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI"
],
function (jQuery, URI) {
	"use strict";

	var DEFAULT_FRAME_ID = '_unnamed_frame_-_use_message_origin_';

	var WCBConfig = function (oOptions) {
		this._sModulePath = oOptions.modulePath;
		this._sReceivingWindow = oOptions.receivingWindow;
		this._sNamespace = oOptions.namespace;

		if (oOptions.uriParams) {
			this._sURIOrigin = oOptions.uriParams && oOptions.uriParams.origin;
			this._sURIFrameId = oOptions.uriParams && oOptions.uriParams.frameId;
			this._sOrigin = this.getOriginURIParameter(oOptions.uriParams.origin);
		}
		return this;
	};

	WCBConfig.prototype.getOrigin = function () {
		if (this._sOrigin) {
			// when running in a tool frame, return the origin URI parameter
			// when running in the opener window, return the already calculated origin
			return this._sOrigin;
		}
		// When loading from CDN, module path needs to be relative to that origin
		var modulePathURI = new URI(sap.ui.require.toUrl(this._sModulePath));
		var protocol = modulePathURI.protocol() || window.location.protocol.replace(":", "");
		var host = modulePathURI.host() || window.location.host;

		this._sOrigin = protocol + "://" + host;

		return this._sOrigin;
	};

	WCBConfig.prototype.getFrameId = function () {
		// the opener window assigns a tool frame an ID and includes in as a URI parameter upon opening the frame
		// returns the frame's ID or a default value, when running in an opener window
		return jQuery.sap.getUriParameters().get(this._sURIFrameId) || DEFAULT_FRAME_ID;
	};

	WCBConfig.prototype.getOriginURIParameter = function () {
		// the opener window sets its origin as a URI parameter upon opening the frame
		return jQuery.sap.getUriParameters().get(this._sURIOrigin);
	};

	WCBConfig.prototype.getReceivingWindow = function () {
		// determine the current context (one side of communication) and return the opposite side of the communication
		// determine the context by looking for a specific global property that would be present in an opener window and missing in a tool frame
		if (window.communicationWindows && window.communicationWindows.hasOwnProperty(this._sReceivingWindow)) {
			return window.communicationWindows[this._sReceivingWindow];
		}

		// If opener is not null, tool's UI is in an IFRAME (parent is used),
		// else it's a POPUP WINDOW (opener is used)
		return window.opener || window.parent;
	};

	return WCBConfig;
}, true);

/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global */
sap.ui.define(["sap/base/assert"], function(assert) {
	"use strict";

	function _includeScript(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {
		var oScript = document.createElement("SCRIPT");
		oScript.src = sUrl;
		oScript.type = "text/javascript";
		if (mAttributes && typeof mAttributes === "object") {
			for ( var sKey in mAttributes ) {
				if (mAttributes[sKey] != null) {
					oScript.setAttribute(sKey, mAttributes[sKey]);
				}
			}
		}

		function onload() {
			if ( fnLoadCallback ) {
				fnLoadCallback();
			}
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
		}

		function onerror() {
			if ( fnErrorCallback ) {
				fnErrorCallback();
			}
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
		}

		if (fnLoadCallback || fnErrorCallback) {
			oScript.addEventListener('load', onload);
			oScript.addEventListener('error', onerror);
		}

		var sId = mAttributes && mAttributes.id,
			oOld = sId && document.getElementById(sId);
		if ( oOld && oOld.tagName === "SCRIPT" ) {
			oOld.parentNode.removeChild(oOld);
		}
		document.head.appendChild(oScript);
	}


	return function includeScript(vUrl, vId, fnLoadCallback, fnErrorCallback) {
		var mAttributes;
		if (typeof vUrl === "string") {
			mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeScript(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			mAttributes = vUrl.attributes || {};
			if (vUrl.id) {
				mAttributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeScript(vUrl.url, mAttributes, fnResolve, fnReject);
			});
		}
	};


});
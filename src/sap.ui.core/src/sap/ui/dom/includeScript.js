/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/assert"], function(assert) {
	"use strict";

	function _includeScript(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {
		var oScript = document.createElement("script");
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
			if ( typeof fnLoadCallback === "function" ) {
				fnLoadCallback();
			}
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
		}

		function onerror() {
			if ( typeof fnErrorCallback === "function" ) {
				fnErrorCallback();
			}
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
		}

		if (typeof fnLoadCallback === "function" || typeof fnErrorCallback === "function") {
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

	/**
	 * Includes the script (via &lt;script&gt;-tag) into the head for the
	 * specified <code>sUrl</code> and optional <code>sId</code>.
	 *
	 * @param {string|object} vUrl the URL of the script to load or a configuration object
	 * @param {string} vUrl.url the URL of the script to load
	 * @param {string} [vUrl.id] id that should be used for the script tag
	 * @param {object} [vUrl.attributes] map of attributes that should be used for the script tag
	 * @param {string|object} [vId] id that should be used for the script tag or map of attributes
	 * @param {function} [fnLoadCallback] callback function to get notified once the script has been loaded
	 * @param {function} [fnErrorCallback] callback function to get notified once the script loading failed
	 * @return {void|Promise} When using the configuration object a <code>Promise</code> will be returned. The
	 *         documentation for the <code>fnLoadCallback</code> applies to the <code>resolve</code>
	 *         handler of the <code>Promise</code> and the one for the <code>fnErrorCallback</code>
	 *         applies to the <code>reject</code> handler of the <code>Promise</code>.
	 * @function
	 * @public
	 * @since 1.58
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 * @alias module:sap/ui/dom/includeScript
	 */
	var fnIncludeScript = function(vUrl, vId, fnLoadCallback, fnErrorCallback) {
		var mAttributes;
		if (typeof vUrl === "string") {
			mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeScript(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			mAttributes = Object.assign({}, vUrl.attributes);
			if (vUrl.id) {
				mAttributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeScript(vUrl.url, mAttributes, fnResolve, fnReject);
			});
		}
	};
	return fnIncludeScript;
});

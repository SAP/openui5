/*!
 * ${copyright}
 */
/*global Promise, document */
sap.ui.define(["sap/base/assert"],
	function(assert) {
	"use strict";

	function _includeStyleSheet(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {

		var createLink = function() {

			// create the new link element
			var oLink = document.createElement("link");
			oLink.rel = "stylesheet";
			oLink.href = sUrl;
			if (mAttributes && typeof mAttributes === "object") {
				Object.keys(mAttributes).forEach(function(sKey) {
					if (mAttributes[sKey] != null) {
						oLink.setAttribute(sKey, mAttributes[sKey]);
					}
				});
			}

			function listener(oEvent) {
				var bError = oEvent.type === "error";
				oLink.setAttribute("data-sap-ui-ready", !bError);
				oLink.removeEventListener("load", listener);
				oLink.removeEventListener("error", listener);
				var fnCallback = bError ? fnErrorCallback : fnLoadCallback;
				if (typeof fnCallback === "function") {
					fnCallback();
				}
			}

			oLink.addEventListener("load", listener);
			oLink.addEventListener("error", listener);

			return oLink;

		};

		// check for existence of the link
		var sId = mAttributes && mAttributes.id;
		var oOld = document.getElementById(sId);
		var oLink = createLink();
		if (oOld && oOld.tagName === "LINK" && oOld.rel === "stylesheet") {
			// link exists, so we replace it - but only if a callback has to be attached or if the href will change. Otherwise don't touch it
			if (typeof fnLoadCallback === "function" || typeof fnErrorCallback === "function" ||
				oOld.href !== oLink.href) {
				// if the attribute "data-sap-ui-foucmarker" exists and the value
				// matches the id of the new link the new link will be put
				// before the old link into the document and the id attribute
				// will be removed from the old link (to avoid FOUC)
				// => sap/ui/core/theming/ThemeManager removes these old links again once
				//    the new theme has been fully loaded
				if (oOld.getAttribute("data-sap-ui-foucmarker") === sId) {
					oOld.removeAttribute("id");
					oOld.parentNode.insertBefore(oLink, oOld);
				} else {
					oOld.parentNode.replaceChild(oLink, oOld);
				}
			} else if (oOld.getAttribute("data-sap-ui-foucmarker") === sId) {
				// in case of using without callbacks and applying the same URL
				// the foucmarker has to be removed as the link will not be
				// replaced with another link - otherwise the ThemeManager would
				// remove this link
				oOld.removeAttribute("data-sap-ui-foucmarker");
			}
		} else {
			var oCustomCss = document.getElementById("sap-ui-core-customcss");
			if (oCustomCss) {
				oCustomCss.parentNode.insertBefore(oLink, oCustomCss);
			} else {
				document.head.appendChild(oLink);
			}
		}

	}

	/**
	 * Includes the specified stylesheet via a &lt;link&gt;-tag in the head of the current document.
	 *
	 * If <code>includeStylesheet</code> is called with an <code>sId</code> of an already included stylesheet and:
	 * <ul>
	 * <li>either <code>fnLoadCallback</code> or <code>fnErrorCallback</code> is given: the old stylesheet is deleted and a new one is inserted</li>
	 * <li><code>vUrl</code> is different from the existing one's: the old stylesheet is deleted and a new one is inserted</li>
	 * <li>otherwise: no action</li>
	 * </ul>
	 *
	 * @param {string|object} vUrl the URL of the stylesheet to load or a configuration object
	 * @param {string} vUrl.url the URL of the stylesheet to load
	 * @param {string} [vUrl.id] id that should be used for the link tag
	 * @param {object} [vUrl.attributes] map of attributes that should be used for the script tag
	 * @param {string|object} [vId] id that should be used for the link tag or map of attributes
	 * @param {function} [fnLoadCallback] callback function to get notified once the stylesheet has been loaded
	 * @param {function} [fnErrorCallback] callback function to get notified once the stylesheet loading failed.
	 * @return {void|Promise} When using the configuration object a <code>Promise</code> will be returned. The
	 *         documentation for the <code>fnLoadCallback</code> applies to the <code>resolve</code>
	 *         handler of the <code>Promise</code> and the one for the <code>fnErrorCallback</code>
	 *         applies to the <code>reject</code> handler of the <code>Promise</code>.
	 * @public
	 * @alias module:sap/ui/dom/includeStylesheet
	 * @function
	 * @since 1.58
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	var fnIncludeStyleSheet = function includeStyleSheet(vUrl, vId, fnLoadCallback, fnErrorCallback) {
		var mAttributes;
		if (typeof vUrl === "string") {
			mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeStyleSheet(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			mAttributes = Object.assign({}, vUrl.attributes);
			if (vUrl.id) {
				mAttributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeStyleSheet(vUrl.url, mAttributes, fnResolve, fnReject);
			});
		}
	};
	return fnIncludeStyleSheet;
});

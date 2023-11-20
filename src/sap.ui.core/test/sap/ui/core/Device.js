sap.ui.define([
	"sap/ui/Device",
	"sap/base/security/encodeXML",
	"sap/ui/thirdparty/jquery"
], function(Device, encode, jQuery) {
	"use strict";

	var uriParams = new URLSearchParams(window.location.search);

	// Config
	var customUA = "";

	//Enable this to activate Fullscreen mode on iOS in combination with the "Add to home screen" feature
	if ( /^(x|X|true)$/.test(uriParams.get("ios-fullscreen")) ) {
		var meta = document.createElement("meta");
		meta.setAttribute("name", "apple-mobile-web-app-capable");
		meta.setAttribute("content", "yes");
		document.head.append(meta);
		// document.write('<meta name="apple-mobile-web-app-capable" content="yes">');
	}

	if (customUA) {
		Device._setOS(customUA);
		var br = Device.browser.BROWSER;
		Device.browser = null;
		Device.browser = Device._testUserAgent(customUA);
		Device.browser.BROWSER = br;
		if (Device.browser.name) {
			for (var b in Device.browser.BROWSER) {
				if (Device.browser.BROWSER[b] === Device.browser.name) {
					Device.browser[b.toLowerCase()] = true;
				}
			}
		}
	}

	var sSetId, aPoints, sUnit, bStandard, sFontSize;

	function initPredefined(sName) {
		sSetId = Device.media.RANGESETS[sName];
		aPoints = Device.media._predefinedRangeSets[sSetId].points; //TODO try to get rid of this internal access
		sUnit = Device.media._predefinedRangeSets[sSetId].unit; //TODO try to get rid of this internal access
		bStandard = sName === "SAP_STANDARD";
	}

	function initMedia(sSetName, sPoints, sCustomUnit) {

		if (sSetName && Device.media.RANGESETS[sSetName]) {
			initPredefined(sSetName);
		} else if (!sSetName && !sPoints) {
			initPredefined("SAP_STANDARD");
		} else if (sPoints) {
			sSetId = sSetName || "TEST";
			var p = sPoints.split(",");
			aPoints = [];
			for (var i = 0; i < p.length; i++) {
				aPoints.push(parseInt(p[i]));
			}
			sUnit = sCustomUnit || "px";
			bStandard = false;
		} else {
			//eslint-disable-next-line no-alert
			alert("Incorrect set definition. Default is used.");
			initPredefined("SAP_STANDARD");
		}

		var styles = window.getComputedStyle(document.documentElement);
		sFontSize = styles && styles.fontSize ? styles.fontSize : null;
		if (!sFontSize || sFontSize.indexOf("px") < 0) {
			sFontSize = "16px";
		}
	}

	function elem(selector) {
		return document.querySelector(selector);
	}

	function render(id, str) {
		var target = document.getElementById(id);
		if ( target ) {
			target.innerHTML = str;
		}
	}

	function reportMedia(mParams) {
		if (!mParams) {
			//eslint-disable-next-line no-console
			console.log("No Params");
			return;
		}

		var to = (!mParams.to) ? "INFINITY" : (mParams.to + mParams.unit);
		var txt = "Media: Entered Range: " + mParams.from + mParams.unit + " - " + to + " (Name: " + mParams.name + ")";
		//eslint-disable-next-line no-console
		console.log(txt);
		render("mediareport", txt);
	}


	//******************************************

	function prop(html, sLabel, sVal, tooltip, sId) {
		if (!html) {
			html = [];
		}

		html.push("<div");
		html.push(sId ? (" id='" + sId + "'") : "");
		html.push(tooltip ? (" title='" + tooltip + "'") : "");
		html.push(">", "<label class='label'>", sLabel, ":</label>", sVal, "</div>");

		return html.join("");
	}

	function updateProp(selector, value) {
		elem(selector).lastChild.data = value;
	}

	function _featuresHtml() {
		var _html = [];

		function printProperties(printObject, sPrintHeader) {
			for (var property in printObject) {
				if (Object.hasOwn(printObject, property)) {
					var value = printObject[property];
					if (typeof value !== 'function') {
						if (sPrintHeader) {
							_html.push("<h3>" + sPrintHeader + "." + property + "</h3>");
							printProperties(printObject[property]);
						} else if (typeof value !== 'object') { //ignore enums
							prop(_html, property, value, null, property);
						}
					}
				}
			}
		}

		printProperties(Device, "sap.ui.Device");
		_html.push("<h3>jQuery.support</h3>");
		printProperties(jQuery.support);
		return _html.join("");

	}

	function refreshFeaturesHtml() {
		render("output", _featuresHtml());
	}

	Device.orientation.attachHandler(function(mParams) {
		updateProp("#landscape", Device.orientation.landscape);
		updateProp("#portrait", Device.orientation.portrait);
	});

	Device.resize.attachHandler(function(mParams) {
		updateProp("#width", Device.resize.width);
		updateProp("#height", Device.resize.height);
	});

	initMedia(uriParams.get("set"), uriParams.get("points"), uriParams.get("unit"));
	Device.media.initRangeSet(sSetId, aPoints, sUnit);

	Device.media.attachHandler(function(mParams) {
		reportMedia(mParams);
	}, null, sSetId);

		refreshFeaturesHtml();

		elem("#title").addEventListener("click", function() {
			refreshFeaturesHtml();
		});

		var media = elem("#media");
		media.innerHTML = "";
		for (var i = 0; i < aPoints.length; i++) {
			var div = document.createElement("div");
			div.style.fontSize = sFontSize;
			div.style.width = (aPoints[i] - (i == 0 ? 0 : aPoints[i - 1])) + sUnit;
			div.textContent = aPoints[i] + sUnit;
			media.appendChild(div);
		}

		reportMedia(Device.media.getCurrentRange(sSetId));

		elem("#mediareport").classList.toggle("StandardMedia", bStandard);

	function fnObjectToString(oObject, iIndent, iMaxDepth, includeAll) {
		if (iMaxDepth === undefined) {
			iMaxDepth = 5;
		}

		if (iIndent === undefined) {
			iIndent = 0;
		} else if (iIndent > iMaxDepth) {
			return "[...]";
		}

		var aString = [];
		for (var sKey in oObject) {
			if (!sKey || typeof (sKey) == "number" || !oObject[sKey]) {
				// Ignore entry
				continue;
			}

			if ( Array.isArray(oObject[sKey]) ) {
				aString.push("<tr><td class=\"label\">" + sKey + "</td><td>[" +
					oObject[sKey].map(function(oItem) {
						return oItem;
					}).join(", ") + "]</td></tr>");
			} else if (typeof (oObject[sKey]) == "object") {
				// deactivated, too many details
				// aString.push("<tr><td>" + sKey + "</td><td>" + fnObjectToString(oObject[sKey], iIndent + 1) + "</td></tr>");
			} else if (typeof (oObject[sKey]) == "function") {
				// aString.push("<tr><td>" + sKey + "</td><td>" + fnObjectToString(oObject[sKey], iIndent + 1) + "</td></tr>");
			} else {
				aString.push(
					"<tr><td class=\"label\"'>" + sKey +
					"</td><td>" + oObject[sKey] + "</td></tr>"
				);
			}
		}

		return "<table>" + aString.join("") + "</table>";
	}

	document.getElementById("btnShowNavigatorValues").addEventListener("click", function() {
		var rawDataOut = elem("#rawDataNavigator");
		rawDataOut.innerHTML = "<h3>window.navigator:</h3>" + fnObjectToString(window.navigator, undefined, undefined, true);
		rawDataOut.scrollIntoView(true);
	});
});

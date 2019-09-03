/*!
 * ${copyright}
 */

/* global XMLHttpRequest */
(function() {

	"use strict";

	/*
	 * This script loads and executes the ui5loader.js and ui5loader-autoconfig.js
	 * in a way (sync XHR)  that is not visible to the ui5loader-autoconfig.js (which checks only script tags).
	 *
	 * This is necessary to check the resource root detection in ui5loader-autoconfig
	 * for those cases that don't use a known script name.
	 */

	function loadAndExecSync(url) {
		var xhr = new XMLHttpRequest();
		var code = '';
		xhr.addEventListener('load', function(e) {
			if ( xhr.status === 200 ) {
				code = xhr.responseText;
				code = code +  "\n//# sourceURL=" + url + "?fancyboot";
			}
		});
		xhr.open('GET', url, false);
		xhr.send();

		window.eval(code); // eslint-disable-line no-eval
	}

	if (/(trident|msie)\/[\w.]+;.*rv:([\w.]+)/i.test(window.navigator.userAgent)) {
		loadAndExecSync("../../../../../../resources/sap/ui/thirdparty/baseuri.js");
		loadAndExecSync("../../../../../../resources/sap/ui/thirdparty/es6-promise.js");
		loadAndExecSync("../../../../../../resources/sap/ui/thirdparty/es6-shim-nopromise.js");
	} else if (/(edge)[ \/]([\w.]+)/i.test(window.navigator.userAgent) ||
			/(Version\/(11\.0)|PhantomJS).*Safari/.test(window.navigator.userAgent)) {
		// for Microsoft Edge and Safari 11.0 the Promise polyfill is still needed
		loadAndExecSync("../../../../../../resources/sap/ui/thirdparty/es6-promise.js");
	}
	loadAndExecSync('../../../../../../resources/ui5loader.js');
	loadAndExecSync('../../../../../../resources/ui5loader-autoconfig.js');

}());

/*!
 * ${copyright}
 */

// define jQuery for for bundling sap-ui-integration-nojQuery.js
(function() {
	"use strict";
	sap["ui"].define("sap/ui/thirdparty/jquery", function() {
		return jQuery;
	});
	sap["ui"].define("sap/ui/thirdparty/jqueryui/jquery-ui-position", function() {
		return jQuery;
	});
})();
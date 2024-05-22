// ##### BEGIN MODIFIED BY SAP
ace.define("ace/theme/default", ["require", "exports", "module"], function (require, exports, module) {
	exports.isDark = false;
	exports.cssClass = "ace-default";
	exports.cssText = "";

});
(function () {
	ace.require(["ace/theme/default"], function (m) {
		if (typeof module == "object" && typeof exports == "object" && module) {
			module.exports = m;
		}
	});
})();
// ##### END MODIFIED BY SAP
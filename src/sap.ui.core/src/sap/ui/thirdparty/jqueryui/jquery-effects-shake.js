(function(jQuery, sap) {

	var MESSAGE = "The file sap/ui/thirdparty/jqueryui/jquery-effects-shake.js has been renamed to sap/ui/thirdparty/jqueryui/jquery-ui-effect-shake.js! Please update the dependencies accordingly.";

	if (sap && sap.ui && sap.ui.define) {
		// if sap.ui.define is available, define the new module and log a warning
		sap.ui.define(["sap/ui/thirdparty/jqueryui/jquery-ui-effect-shake"], function(jQuery) {
			return jQuery;
		});
		jQuery.sap.log.warning(MESSAGE);
	} else {
		throw new Error(MESSAGE);
	}

})(window.jQuery, window.sap);
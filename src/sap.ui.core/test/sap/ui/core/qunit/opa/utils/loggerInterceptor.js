sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Loads a module that uses {@link jQuery.sap.log#getLogger}, intercepts logger creation and saves the new loggers in its closure.
		 * This way we can access the internally declared loggers and test their usage.
		 * This function only works if the module has not been loaded yet, since unloading the module would also lead to trouble
		 * (if a module that is unleaded is already saved in another closure)
		 * Keep in mind that dependency and extended modules' loggers will also be intercepted and saved.
		 * @param {string} sNamespaceOfModuleUnderTest the name of the module that is loaded and intercepted
		 * @returns {Array} an array of the instances of the loggers
		 */
		loadAndIntercept : function (sNamespaceOfModuleUnderTest) {
			var aLoggers = [];
			var fnOriginalGetLogger = jQuery.sap.log.getLogger;
			// loadAndIntercept the logger created in the closure
			var fnGetLoggerStub = sinon.stub(jQuery.sap.log, "getLogger", function () {
				var oLogger = fnOriginalGetLogger.apply(this, arguments);
				aLoggers.push(oLogger);
				return oLogger;
			});
			jQuery.sap.require(sNamespaceOfModuleUnderTest);
			fnGetLoggerStub.restore();
			return aLoggers;
		}
	}
}, true);

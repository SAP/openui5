/* global sinon*/
sap.ui.define(['sap/base/Log'], function (Log) {
	"use strict";

	function checkLoggerComponent (oLogger, sModule) {
		var bCheck = false;
		var fnOriginalLog = Log.info;
		Log.info = function () {
			bCheck = arguments[2] === sModule || arguments[2].startsWith(sModule + "#");
		};
		oLogger.info("test");
		Log.info = fnOriginalLog;
		return bCheck;
	}
	return {
		/**
		 * Loads a module that uses {@link jQuery.sap.log#getLogger}, intercepts logger creation and saves the new loggers in its closure.
		 * This way we can access the internally declared loggers and test their usage.
		 * This function only works if the module has not been loaded yet, since unloading the module would also lead to trouble
		 * (if a module that is unleaded is already saved in another closure)
		 * Keep in mind that dependency and extended modules' loggers will also be intercepted.
		 * The returned logger should have a log component name matching the name of the tested module.
		 * @param {string} sNamespaceOfModuleUnderTest the name of the module that is loaded and intercepted
		 * @returns {object | Array} logger instance
		 */
		loadAndIntercept : function (sNamespaceOfModuleUnderTest) {
			var aLoggers = [];
			var fnOriginalGetLogger = Log.getLogger;
			// loadAndIntercept the logger created in the closure
			var fnGetLoggerStub = sinon.stub(Log, "getLogger", function () {
				var oLogger = fnOriginalGetLogger.apply(this, arguments);
				if (checkLoggerComponent(oLogger, sNamespaceOfModuleUnderTest)) {
					aLoggers.push(oLogger);
				}
				return oLogger;
			});
			jQuery.sap.require(sNamespaceOfModuleUnderTest);
			fnGetLoggerStub.restore();
			return aLoggers.length > 1 ? aLoggers : aLoggers[0];
		}
	};
}, true);

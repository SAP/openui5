sap.ui.define([], function () {
	return {
		/**
		 * Loads a module that uses {@link jQuery.sap.log#getLogger} and saves the logger in its closure.
		 * The logger inside of a closure is not testable so it is intercepted by this and returned
		 * This function only works if the module has not been loaded yet, since unloading the module would also lead to trouble
		 * (if a module that is unleaded is already saved in another closure)
		 * @param sNamespaceOfModuleUnderTest the name of the module that is loaded and intercepted
		 * @returns {*} the instance of the logger
		 */
		loadAndIntercept : function (sNamespaceOfModuleUnderTest) {
			var oLogger;
			var fnOriginalGetLogger = jQuery.sap.log.getLogger;
			// loadAndIntercept the logger created in the closure
			var fnGetLoggerStub = sinon.stub(jQuery.sap.log, "getLogger", function () {
				oLogger = fnOriginalGetLogger.apply(this, arguments);
				return oLogger;
			});
			jQuery.sap.require(sNamespaceOfModuleUnderTest);
			fnGetLoggerStub.restore();
			return oLogger;
		}
	}
}, true /* export */);

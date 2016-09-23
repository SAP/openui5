/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.Processor
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/fl/PreprocessorImpl'
], function(jQuery, BaseObject, PreprocessorImpl) {
	'use strict';

	/**
	 * The implementation of the <code>Preprocessor</code> for the SAPUI5 flexibility services that can be hooked in the <code>View</code> life cycle.
	 *
	 * @name sap.ui.fl.Preprocessor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 * @implements sap.ui.core.mvc.View.Preprocessor
	 */
	var FlexPreprocessor = BaseObject.extend("sap.ui.fl.Preprocessor", {
	});

	/**
	 * Asynchronous processing method that should be implemented by the inheriting Preprocessor class.
	 *
	 * @param {sap.ui.core.mvc.View} oView view to process
	 * @returns {jquery.sap.promise} result of the processing, promise if executed asynchronously
	 *
	 * @public
	 */
	 FlexPreprocessor.process = function(oView){
		return PreprocessorImpl.process(oView);
	 };

	 return FlexPreprocessor;

}, /* bExport= */true);

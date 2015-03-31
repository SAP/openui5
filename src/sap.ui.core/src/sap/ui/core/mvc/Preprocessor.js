/*
 * ! ${copyright}
 */
// Provides object sap.ui.core.mvc.Preprocessor
sap.ui.define([	'jquery.sap.global', 'sap/ui/base/Object'],
	function(jQuery, BaseObject) {
	'use strict';

	/**
	 * @classdesc Base class for Preprocessor implementations that can be hooked in the view life cycle.
	 *
	 * There are two possibilities to use the preprocessor. It can be either passed to the view via the mSettings.preprocessors object
	 * where it is the executed only for this instance, or by the registerPreprocessor method of the view type. Currently this is
	 * available only for XMLViews (as of version 1.30).
	 *
	 * @see sap.ui.view
	 * @see sap.ui.core.mvc.View.registerPreprocessor (the method is available specialized for view types, so use the following)
	 * @see sap.ui.core.mvc.XMLView.registerPreprocessor
	 *
	 * @author SAP SE
	 * @since 1.30
	 * @alias sap.ui.core.mvc.Preprocessor
	 * @class
	 * @public
	 * @abstract
	 * @extends sap.ui.base.Object
	 */
	var Preprocessor = BaseObject.extend("sap.ui.core.mvc.Preprocessor", {

		constructor: function() {
			// complain if 'this' is not an instance of a subclass
			if (this instanceof Preprocessor && this.constructor === Preprocessor) {
				throw Error("Cannot instantiate abstract class \"sap.ui.core.mvc.Preprocessor\"");
			} else {
				return this;
			}
		}

	});

	/**
	 * Processing method that must be implemented when inheriting the Preprocessor.
	 *
	 * @name sap.ui.core.mvc.Preprocessor.process
	 * @function
	 * @public
	 * @static
	 * @abstract
	 * @param {object} vSource the source to be processed
	 * @param {object} oViewInfo identification information about the calling instance
	 * @param {string} oViewInfo.id the id
	 * @param {string} oViewInfo.name the name
	 * @param {string} oViewInfo.caller
	 * 		identifies the caller of this preprocessor; basis for log or exception messages
	 * @param {object} [mSettings]
	 * 		settings object which was provided with the preprocessor
	 * @return {object|Promise}
	 * 		the processed resource or a promise which resolves with the processed resource or an error according to the
	 * 		declared preprocessor async capability
	 */

	return Preprocessor;

}, /* bExport= */ true);

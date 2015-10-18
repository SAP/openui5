/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/base/Object'
	],
	function($, UI5Object) {
		"use strict";


		/**
		 * Filters a set of controls or a single control by multiple conditions
		 *
		 * @class
		 * @private
		 * @alias sap.ui.pipelines.PipelineFactory
		 * @author SAP SE
		 * @since 1.34
		 */
		return UI5Object.extend("sap.ui.test.pipelines.PipelineFactory",{

			/**
			 * Usage example is here: @link{sap.ui.test.pipelines.PipelineFactory.create}
			 * @param {object} options an Object containing all options for the validator
			 * @param {string} options.name the name of the object under validation used for logging
			 * @param {string} options.functionName the name of the function that is present on all object returned by this Factory
			 * @private
			 * @constructor
			 */
			constructor: function(options){
				this._oOptions = options;
			},

			/**
			 * Creates a pipeline which is an array of objects that contain a function with a specified
			 * @link{sap.ui.test.pipelines.PipelineFactory.constructor} functionName
			 * Example:
			 *
			 * <code>
			 * <pre>
			 * oFactory = new PipelineFactory({
			 *      name: "myName",
			 *      functionName: "myFunction"
			 * });
			 * aOutput = oFactory.create([
			 *     function () {},
			 *     { myFunction: function () {} },
			 *     function () {},
			 * ])
			 *
			 * aOutput.forEach(function (oObject) {
			 *     oObject.myFunction() // all objects contain this function
			 * })
			 *
			 * </pre>
			 * </code>
			 *
			 * @param {function|function[]|object|object[]} input or several functions or objects all of them will have a uniform structure after the create
			 * @returns {object[]} result - an array of objects implementing the given functionName
			 * @private
			 * @function
			 */
			create: function (input) {
				var aResult = [];

				if ($.isArray(input)) {
					aResult = input;
				} else if (input) {
					aResult = [input];
				} else {
					jQuery.sap.log.error(this._oOptions.name + " were defined, but they were neither an array nor a single element: " + input);
				}

				aResult = aResult.map(function(vFunctionOrObject) {
					var oReturnValue;
					if (vFunctionOrObject[this._oOptions.functionName]) {
						return vFunctionOrObject;
					} else if (typeof vFunctionOrObject == "function") {
						oReturnValue = {};
						oReturnValue[this._oOptions.functionName] = vFunctionOrObject;
						return oReturnValue;
					}
					jQuery.sap.log.error("A " + this._oOptions.name + " was defined, but it is no function and has no '" + this._oOptions.functionName + "' function: " + vFunctionOrObject);
				}.bind(this)).filter(function(vFunctionOrObject) {
					return !!vFunctionOrObject;
				});

				return aResult;
			}
		});

	});

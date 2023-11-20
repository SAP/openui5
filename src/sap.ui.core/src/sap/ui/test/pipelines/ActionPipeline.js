/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/test/pipelines/PipelineFactory'
], function(UI5Object, PipelineFactory) {
		"use strict";
		var oPipelineFactory = new PipelineFactory({
			name: "Action",
			functionName: "executeOn"
		});

		/**
		 * Filters a set of controls or a single control by multiple conditions
		 *
		 * @class
		 * @private
		 * @name sap.ui.test.matcherPipeline
		 * @author SAP SE
		 * @since 1.34
		 */
		return UI5Object.extend("sap.ui.test.matcherPipeline", /** @lends sap.ui.test.matcherPipeline.prototype */ {

			/**
			 * Executes a set of actions on a set of Controls
			 * @param {object} oOptions An Object containing the input for processing actions.
			 * @param {function|array|sap.ui.test.actions} oOptions.actions
			 * A single action or an array of actions {@link sap.ui.test.actions}.
			 * @param {sap.ui.core.Element|sap.ui.core.Element[]} oOptions.control The set of controls the actions will be executed on.
			 * @private
			 */
			process: function (oOptions) {
				var aControls,
					vControl = oOptions.control;

				var aActions = oPipelineFactory.create(oOptions.actions);

				if (!Array.isArray(vControl)) {
					aControls = [vControl];
				} else {
					aControls = vControl;
				}

				aControls.forEach(function (oControl) {
					aActions.forEach(function (oAction) {
						oAction.executeOn(oControl);
					});
				});
			}
		});

	});
/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/test/_OpaLogger',
	'sap/ui/base/Object',
	'sap/ui/thirdparty/jquery'
], function (_OpaLogger, Ui5Object, $) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.SampleOpaExtension");

	var Extension = Ui5Object.extend("sap.ui.test.SampleOpaExtension", {
		metadata: {
			publicMethods: [
				"onAfterInit",
				"onBeforeExit",
				"getAssertions"
			]
		},

		onAfterInit: function () {
			oLogger.info("Default onAfterInit called");
			Extension.onAfterInitCalls += 1;
			var deferred = $.Deferred();
			setTimeout(function () {
				deferred.resolve();
			}, 100);
			return deferred.promise();
		},

		onBeforeExit: function () {
			oLogger.info("Default onBeforeExit called");
			Extension.onBeforeExitCalls += 1;
			var deferred = $.Deferred();
			setTimeout(function () {
				deferred.resolve();
			}, 100);
			return deferred.promise();
		},

		getAssertions: function () {
			return {
				myCustomAssertion: function () {
					var deferred = $.Deferred();

					// start custom assertion logic, resolve the promise when ready
					setTimeout(function () {
						Extension.assertionCalls += 1;
						// Assertion passes
						deferred.resolve({
							result: true,
							message: "Custom assertion passes"
						});
					}, 100);

					return deferred.promise();
				}
			};
		}
	});

	Extension.onAfterInitCalls = 0;
	Extension.onBeforeExitCalls = 0;
	Extension.assertionCalls = 0;

	return Extension;
});
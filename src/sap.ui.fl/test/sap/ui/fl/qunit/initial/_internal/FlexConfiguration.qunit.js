/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexConfiguration,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("When the FlexConfiguration is requested via its getter", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no value is set", function(assert) {
			const aFlexibilityService = FlexConfiguration.getFlexibilityServices();
			assert.deepEqual(aFlexibilityService, [{
				url: "/sap/bc/lrep",
				connector: "LrepConnector"
			}], "then the LrepConnector is configured");
		});

		QUnit.test("given an empty string is set", function(assert) {
			FlexConfiguration.setFlexibilityServices("");
			const aFlexibilityService = FlexConfiguration.getFlexibilityServices();
			assert.deepEqual(aFlexibilityService, [], "then no connector is configured");
		});

		QUnit.test('given a string value starts with "/" is set', function(assert) {
			const aConfiguration = [{
				url: "/something",
				connector: "LrepConnector"
			}];
			FlexConfiguration.setFlexibilityServices("/something");
			const aFlexibilityService = FlexConfiguration.getFlexibilityServices();
			assert.deepEqual(aFlexibilityService, aConfiguration, "then configuration is correct and returned as an array");
		});

		QUnit.test("given a string value is set", function(assert) {
			const aConfiguration = [
				{
					connector: "KeyUserConnector",
					url: "/keyUser/url"
				}, {
					connector: "PersoConnector",
					url: "/perso/url"
				}
			];
			FlexConfiguration.setFlexibilityServices(JSON.stringify(aConfiguration));
			const aFlexibilityService = FlexConfiguration.getFlexibilityServices();
			assert.deepEqual(aFlexibilityService, aConfiguration, "then configuration is correct and returned as an array");
		});

		QUnit.test("given a array value is set", function(assert) {
			const aConfiguration = [
				{
					connector: "KeyUserConnector",
					url: "/keyUser/url"
				}, {
					connector: "PersoConnector",
					url: "/perso/url"
				}
			];
			FlexConfiguration.setFlexibilityServices(aConfiguration);
			const aFlexibilityService = FlexConfiguration.getFlexibilityServices();
			assert.deepEqual(aFlexibilityService, aConfiguration, "then configuration is correct and returned as an array");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

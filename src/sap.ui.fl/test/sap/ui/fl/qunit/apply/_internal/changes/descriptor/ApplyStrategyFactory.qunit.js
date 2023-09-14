/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	ApplyStrategyFactory,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("ApplyStrategyFactory", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting runtime strategy", function(assert) {
			var RuntimeStrategy = ApplyStrategyFactory.getRuntimeStrategy();

			assert.ok(RuntimeStrategy.registry);
			assert.ok(RuntimeStrategy.handleError);
			assert.ok(RuntimeStrategy.processTexts);
			return RuntimeStrategy.registry().then(function(Registry) {
				assert.ok(Registry.appdescr_ui5_addLibraries, "runtime registry contains runtime mergers");
				assert.notOk(Registry.appdescr_app_changeDataSource, "runtime registry does not contain build merger");
			});
		});

		QUnit.test("when resolving a manifest with valid change texts", (assert) => {
			const oRuntimeStrategy = ApplyStrategyFactory.getRuntimeStrategy();
			const oSampleManifest = {
				someEntry: {
					someNestedEntry: {
						a: "someText",
						b: "{{someTranslationKey}} {{someOtherTranslationKey}} {{someTranslationKey}}"
					},
					c: "{{someOtherTranslationKey}}"
				},
				d: ["{{someTranslationKey}}"]
			};
			const oChangeTexts = {
				someTranslationKey: {
					type: "XTIT",
					value: {
						"": "foo"
					}
				},
				someOtherTranslationKey: {
					type: "XTIT",
					value: {
						"": "bar"
					}
				}
			};

			assert.deepEqual(
				oRuntimeStrategy.processTexts(oSampleManifest, oChangeTexts),
				{
					someEntry: {
						someNestedEntry: {
							a: "someText",
							b: "foo bar foo"
						},
						c: "bar"
					},
					d: ["foo"]
				},
				"then all manifest entries are replaced with the localized values"
			);
		});

		QUnit.test("when resolving a manifest with invalid change texts", (assert) => {
			const oRuntimeStrategy = ApplyStrategyFactory.getRuntimeStrategy();
			const oSampleManifest = {
				a: "{{someValidKey}}",
				b: "{{someInvalidKey}}"
			};
			const oChangeTexts = {
				someValidKey: {
					type: "XTIT",
					value: {
						"": "foo"
					}
				},
				someInvalidKey: {
					type: "XTIT",
					value: {
						EN: "bar"
					}
				}
			};

			assert.deepEqual(
				oRuntimeStrategy.processTexts(oSampleManifest, oChangeTexts),
				{
					a: "foo",
					b: "{{someInvalidKey}}"
				},
				"then only valid manifest entries are replaced with the localized values"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

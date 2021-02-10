/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith",
	"sap/ui/fl/Change",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Applier,
	ApplyStrategyFactory,
	AddLibrary,
	AddComponentUsages,
	SetTitle,
	ChangeDataSource,
	AddNewModelEnhanceWith,
	Change,
	Log,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function convertChanges(aChanges) {
		return aChanges.map(function(oChange) {
			return new Change(oChange);
		});
	}

	QUnit.module("Runtime: applyChange", {
		beforeEach: function (assert) {
			var done1 = assert.async();
			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/descriptorChanges/TestApplierManifest.json")
				.done(function(oTestApplierManifestResponse) {
					this.oManifest = oTestApplierManifestResponse;
					done1();
				}.bind(this));

			var done2 = assert.async();
			ApplyStrategyFactory.getRuntimeStrategy().then(function(Strategy) {
				this.RuntimeStrategy = Strategy;
				done2();
			}.bind(this));

			this.fnAddLibrarySpy = sandbox.spy(AddLibrary, "applyChange");
			this.fnAddComponentUsageSpy = sandbox.spy(AddComponentUsages, "applyChange");
			this.fnSetTitleSpy = sandbox.spy(SetTitle, "applyChange");
			this.fnChangeDataSourceSpy = sandbox.spy(ChangeDataSource, "applyChange");
			this.fnAddNewModelEnhanceWithSpy = sandbox.spy(AddNewModelEnhanceWith, "applyChange");

			this.fnLogSpy = sandbox.stub(Log, "error");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'applyChange' with one runtime descriptor change ", function (assert) {
			var aChanges = [{
				changeType: "appdescr_ui5_addLibraries",
				content: {
					libraries: {
						"descriptor.mocha133": {
							minVersion: "1.44"
						}
					}
				}
			}];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function() {
				assert.equal(this.fnAddLibrarySpy.callCount, 1, "AddLibrary.applyChange is called once");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with three conflicting runtime 'appdescr_ui5_addLibraries' changes ", function (assert) {
			var aChanges = [
				{
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}, {
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.40.0"
							}
						}
					}
				}, {
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.60.9"
							}
						}
					}
				}
			];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function(oNewManifest) {
				assert.equal(this.fnAddLibrarySpy.callCount, 3, "AddLibrary.applyChange is called three times");
				// last change wins!
				var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
				var oExpectedNewLib = {minVersion: "1.60.9"};
				assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
				assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with mixed build and runtime change types ", function (assert) {
			var aChanges = [
				{ //runtime change
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}, { //buildtime change
					changeType: "appdescr_app_changeDataSource",
					content: {
						dataSourceId: "ppm",
						entityPropertyChange: {
							propertyPath: "uri",
							operation: "UPDATE",
							propertyValue: "newuri"
						}
					}
				}, {//buildtime change
					changeType: "appdescr_ui5_addNewModelEnhanceWith",
					content: {
						modelId: "ppm"
					},
					texts: {
						i18n: "resources/i18n/i18n.properties"
					}
				}, {//buildtime change
					changeType: "appdescr_ui5_addComponentUsages",
					content: {
						componentUsages: {
							newusage: {
								name: "my.used",
								lazy: false,
								settings: {},
								componentData: {}
							}
						}
					}
				}
			];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function() {
				assert.equal(this.fnAddLibrarySpy.callCount, 1, "AddLibrary.applyChange is called once");
				assert.equal(this.fnAddComponentUsageSpy.callCount, 0, "AddComponentUsages.applyChange is not called");
				assert.equal(this.fnChangeDataSourceSpy.callCount, 0, "ChangeDataSource.applyChange is not called");
				assert.equal(this.fnAddNewModelEnhanceWithSpy.callCount, 0, "AddNewModelEnhanceWith.applyChange is not called");
				assert.equal(this.fnLogSpy.callCount, 3, "three errors were logged");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with change that needs text postprocessing correctly ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {

					},
					texts: {
						"sap.app.descriptor.test_sap.app.title": {
							type: "XTIT",
							value: {
								"": "English Title - Descriptor Variant"
							}
						}
					}
				}
			];

			aChanges = convertChanges(aChanges);

			var mStrategy = this.RuntimeStrategy;
			var fnProcessTextsSpy = sandbox.spy(mStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, mStrategy).then(function(oNewManifest) {
				assert.equal(fnProcessTextsSpy.callCount, 1, "BuildStrategy.processTexts is called once");
				assert.equal(this.fnSetTitleSpy.callCount, 1, "SetTitle.applyChange is called once");
				assert.equal(oNewManifest["sap.app"].title, "English Title - Descriptor Variant", "sap.app/title is replaced correctly");
				assert.equal(oNewManifest["sap.app"].i18n, "i18n/i18n.properties", "sap.app/i18n is not touched");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with change that needs text postprocessing with unexpected language value ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {

					},
					texts: {
						"sap.app.descriptor.test_sap.app.title": {
							type: "XTIT",
							value: {
								de: "Deutscher Titel - Descriptor Variante"
							}
						}
					}
				}
			];

			aChanges = convertChanges(aChanges);

			var mStrategy = this.RuntimeStrategy;
			var fnProcessTextsSpy = sandbox.spy(mStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, mStrategy).then(function(oNewManifest) {
				assert.equal(fnProcessTextsSpy.callCount, 1, "BuildStrategy.processTexts is called once");
				assert.equal(this.fnSetTitleSpy.callCount, 1, "SetTitle.applyChange is called once");
				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "sap.app/title is not replaced");
				assert.equal(oNewManifest["sap.app"].i18n, "i18n/i18n.properties", "sap.app/i18n is not touched");
				assert.equal(this.fnLogSpy.callCount, 1, "1 error logged");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with not implemented change ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_notImplemented",
					content: {

					}
				}
			];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function() {
				assert.equal(this.fnLogSpy.callCount, 1);
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' for text change without text property ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {

					}
				}
			];

			aChanges = convertChanges(aChanges);
			var fnProcessTextsSpy = sandbox.spy(this.RuntimeStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function(oNewManifest) {
				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "title is replaced correctly");
				assert.equal(fnProcessTextsSpy.callCount, 0, "Strategy.processTexts is not called");
			});
		});
	});


	QUnit.module("Buildtime", {
		beforeEach: function (assert) {
			var done1 = assert.async();
			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/descriptorChanges/TestApplierManifest.json")
				.done(function(oTestApplierManifestResponse) {
					this.oManifest = oTestApplierManifestResponse;
					done1();
				}.bind(this));
			var done2 = assert.async();
			ApplyStrategyFactory.getBuildStrategy().then(function(Strategy) {
				this.BuildtimeStrategy = Strategy;
				done2();
			}.bind(this));

			this.fnAddLibrarySpy = sandbox.spy(AddLibrary, "applyChange");
			this.fnAddComponentUsageSpy = sandbox.spy(AddComponentUsages, "applyChange");
			this.fnSetTitleSpy = sandbox.spy(SetTitle, "applyChange");
			this.fnChangeDataSourceSpy = sandbox.spy(ChangeDataSource, "applyChange");
			this.fnAddNewModelEnhanceWithSpy = sandbox.spy(AddNewModelEnhanceWith, "applyChange");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'applyChange' with one runtime descriptor change ", function (assert) {
			var aChanges = [{
				changeType: "appdescr_ui5_addLibraries",
				content: {
					libraries: {
						"descriptor.mocha133": {
							minVersion: "1.44"
						}
					}
				}
			}];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.BuildtimeStrategy).then(function() {
				assert.equal(this.fnAddLibrarySpy.callCount, 1, "AddLibrary.applyChange is called once");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with mixed build and runtime change types ", function (assert) {
			var aChanges = [
				{
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}, {
					changeType: "appdescr_app_changeDataSource",
					content: {
						dataSourceId: "ppm",
						entityPropertyChange: {
							propertyPath: "uri",
							operation: "UPDATE",
							propertyValue: "newuri"
						}
					}
				}, {
					changeType: "appdescr_ui5_addNewModelEnhanceWith",
					content: {
						modelId: "ppm"
					},
					texts: {
						i18n: "resources/i18n/i18n.properties"
					}
				}, {
					changeType: "appdescr_ui5_addComponentUsages",
					content: {
						componentUsages: {
							newusage: {
								name: "my.used",
								lazy: false,
								settings: {},
								componentData: {}
							}
						}
					}
				}
			];

			aChanges = convertChanges(aChanges);

			var mStrategy = this.BuildtimeStrategy;
			var fnProcessTextsSpy = sandbox.spy(mStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, mStrategy).then(function() {
				assert.equal(fnProcessTextsSpy.callCount, 0, "BuildStrategy.processTexts is not called");
				assert.equal(this.fnAddLibrarySpy.callCount, 1, "AddLibrary.applyChange is called once");
				assert.equal(this.fnAddComponentUsageSpy.callCount, 1, "AddComponentUsages.applyChange is called once");
				assert.equal(this.fnChangeDataSourceSpy.callCount, 1, "ChangeDataSource.applyChange is called once");
				assert.equal(this.fnAddNewModelEnhanceWithSpy.callCount, 1, "AddNewModelEnhanceWith.applyChange is called once");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with one change that needs text postprocessing ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {

					},
					texts: {
						i18n: "i18n/i18n.properties"
					}
				}
			];

			aChanges = convertChanges(aChanges);

			var mStrategy = this.BuildtimeStrategy;
			var fnProcessTextsSpy = sandbox.spy(mStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, mStrategy).then(function(oNewManifest) {
				assert.equal(fnProcessTextsSpy.callCount, 1, "BuildStrategy.processTexts is called once");
				assert.equal(this.fnSetTitleSpy.callCount, 1, "SetTitle.applyChange is called once");

				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "title is replaced correctly");
				var oExpectedi18n = {
					bundleUrl: "i18n/i18n.properties",
					enhanceWith: [{ bundleName: "sap.app.descriptor.test.i18n.i18n" }]
				};
				assert.deepEqual(oNewManifest["sap.app"].i18n, oExpectedi18n, "sap.app/i18n enhanced correctly");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with several changes that need text postprocessing ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {

					},
					texts: {
						i18n: "some.random.name"
					}
				},
				{
					changeType: "appdescr_app_setTitle",
					content: {

					},
					texts: {
						i18n: ".other.random.name"
					}
				},
				{
					changeType: "appdescr_app_setTitle",
					content: {

					},
					texts: {
						i18n: "other.random.name"
					}
				}
			];

			aChanges = convertChanges(aChanges);

			var mStrategy = this.BuildtimeStrategy;
			var fnProcessTextsSpy = sandbox.spy(mStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, mStrategy).then(function(oNewManifest) {
				assert.equal(fnProcessTextsSpy.callCount, 3, "BuildStrategy.processTexts is called three times");
				assert.equal(this.fnSetTitleSpy.callCount, 3, "SetTitle.applyChange is called three times");

				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "title is replaced correctly");
				var oExpectedi18n = {
					bundleUrl: "i18n/i18n.properties",
					enhanceWith: [
						{ bundleName: "sap.app.descriptor.test.some.random.name" },
						{ bundleName: "sap.app.descriptor.test.other.random.name" }
					]
				};
				assert.deepEqual(oNewManifest["sap.app"].i18n, oExpectedi18n, "sap.app/i18n enhanced correctly");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with not implemented change ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_notImplemented",
					content: {

					}
				}
			];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.BuildtimeStrategy).catch(function(oError) {
				assert.ok(oError, "error is thrown");
			});
		});

		QUnit.test("when calling 'applyChange' for text change without text property ", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {

					}
				}
			];

			aChanges = convertChanges(aChanges);
			var fnProcessTextsSpy = sandbox.spy(this.BuildtimeStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, this.BuildtimeStrategy).then(function(oNewManifest) {
				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "title is replaced correctly");
				assert.equal(fnProcessTextsSpy.callCount, 0, "Strategy.processTexts is not called");
			});
		});

		QUnit.test("when calling 'applyChange' with texts.i18n with slashes", function (assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					texts: {
						i18n: "bundle/url/random"
					}
				}
			];

			aChanges = convertChanges(aChanges);

			return Applier.applyChanges(this.oManifest, aChanges, this.BuildtimeStrategy).then(function(oNewManifest) {
				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "title is replaced correctly");
				var oExpectedi18n = {
					bundleUrl: "i18n/i18n.properties",
					enhanceWith: [
						{ bundleName: "sap.app.descriptor.test.bundle.url.random" }
					]
				};
				assert.deepEqual(oNewManifest["sap.app"].i18n, oExpectedi18n, "sap.app/i18n enhanced correctly");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});

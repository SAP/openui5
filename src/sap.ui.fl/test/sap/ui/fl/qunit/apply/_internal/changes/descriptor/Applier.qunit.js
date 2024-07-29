/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetDescription",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	Applier,
	ApplyStrategyFactory,
	AddLibrary,
	AddComponentUsages,
	SetTitle,
	SetDescription,
	ChangeDataSource,
	AddNewModelEnhanceWith,
	AppDescriptorChange,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function convertChanges(aChanges) {
		return aChanges.map(function(oChange) {
			var oFileContent = _omit(oChange, "changeType");
			oFileContent.flexObjectMetadata = {
				changeType: oChange.changeType
			};
			return new AppDescriptorChange(oFileContent);
		});
	}

	QUnit.module("Runtime: applyChange", {
		beforeEach(assert) {
			var done = assert.async();
			fetch("test-resources/sap/ui/fl/qunit/testResources/descriptorChanges/TestApplierManifest.json")
			.then(function(oTestApplierManifestResponse) {
				return oTestApplierManifestResponse.json();
			})
			.then(function(oTestApplierManifestResponseJSON) {
				this.oManifest = oTestApplierManifestResponseJSON;
				done();
			}.bind(this));

			this.RuntimeStrategy = ApplyStrategyFactory.getRuntimeStrategy();

			this.fnAddLibrarySpy = sandbox.spy(AddLibrary, "applyChange");
			this.fnAddComponentUsageSpy = sandbox.spy(AddComponentUsages, "applyChange");
			this.fnSetTitleSpy = sandbox.spy(SetTitle, "applyChange");
			this.fnSetDescriptionSpy = sandbox.spy(SetDescription, "applyChange");
			this.fnChangeDataSourceSpy = sandbox.spy(ChangeDataSource, "applyChange");
			this.fnAddNewModelEnhanceWithSpy = sandbox.spy(AddNewModelEnhanceWith, "applyChange");

			this.fnLogSpy = sandbox.stub(Log, "error");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'applyChange' with one runtime descriptor change ", function(assert) {
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

		QUnit.test("when calling 'applyChange' with three conflicting runtime 'appdescr_ui5_addLibraries' changes ", function(assert) {
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
				var oNewLib = oNewManifest["sap.ui5"].dependencies.libs["descriptor.mocha133"];
				var oExpectedNewLib = {minVersion: "1.60.9"};
				assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
				assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with mixed build and runtime change types ", function(assert) {
			var aChanges = [
				{ // runtime change
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}, { // buildtime change
					changeType: "appdescr_app_changeDataSource",
					content: {
						dataSourceId: "ppm",
						entityPropertyChange: {
							propertyPath: "uri",
							operation: "UPDATE",
							propertyValue: "newuri"
						}
					}
				}, {// buildtime change
					changeType: "appdescr_ui5_addNewModelEnhanceWith",
					content: {
						modelId: "ppm"
					},
					texts: {
						i18n: "resources/i18n/i18n.properties"
					}
				}, {// buildtime change
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

		QUnit.test("when calling 'applyChange' with change that needs text postprocessing correctly ", function(assert) {
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

		QUnit.test("when calling 'applyChange' with change that needs text postprocessing with unexpected language value ", function(assert) {
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

		QUnit.test("when calling 'applyChange' with not implemented change ", function(assert) {
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

		QUnit.test("when calling 'applyChange' for text change without text property ", function(assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setTitle",
					content: {}
				}
			];

			aChanges = convertChanges(aChanges);
			var fnProcessTextsSpy = sandbox.spy(this.RuntimeStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function(oNewManifest) {
				assert.equal(oNewManifest["sap.app"].title, "{{sap.app.descriptor.test_sap.app.title}}", "title is replaced correctly");
				assert.equal(fnProcessTextsSpy.callCount, 0, "Strategy.processTexts is not called");
			});
		});

		QUnit.test("when calling 'applyChange' with change that needs text postprocessing correctly ", function(assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setDescription",
					content: {

					},
					texts: {
						"sap.app.descriptor.test_sap.app.description": {
							type: "XTIT",
							value: {
								"": "English Description - Descriptor Variant Description"
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
				assert.equal(this.fnSetDescriptionSpy.callCount, 1, "SetDescription.applyChange is called once");
				assert.equal(oNewManifest["sap.app"].description, "English Description - Descriptor Variant Description", "sap.app/description is replaced correctly");
				assert.equal(oNewManifest["sap.app"].i18n, "i18n/i18n.properties", "sap.app/i18n is not touched");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' with change that needs text postprocessing with unexpected language value ", function(assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setDescription",
					content: {

					},
					texts: {
						"sap.app.descriptor.test_sap.app.description": {
							type: "XTIT",
							value: {
								de: "Deutsche Beschreibung - Descriptor Variante"
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
				assert.equal(this.fnSetDescriptionSpy.callCount, 1, "SetDescription.applyChange is called once");
				assert.equal(oNewManifest["sap.app"].description, "{{sap.app.descriptor.test_sap.app.description}}", "sap.app/description is not replaced");
				assert.equal(oNewManifest["sap.app"].i18n, "i18n/i18n.properties", "sap.app/i18n is not touched");
				assert.equal(this.fnLogSpy.callCount, 1, "1 error logged");
			}.bind(this));
		});

		QUnit.test("when calling 'applyChange' for text change without text property ", function(assert) {
			var aChanges = [
				 {
					changeType: "appdescr_app_setDescription",
					content: {}
				}
			];

			aChanges = convertChanges(aChanges);
			var fnProcessTextsSpy = sandbox.spy(this.RuntimeStrategy, "processTexts");

			return Applier.applyChanges(this.oManifest, aChanges, this.RuntimeStrategy).then(function(oNewManifest) {
				assert.equal(oNewManifest["sap.app"].description, "{{sap.app.descriptor.test_sap.app.description}}", "description is replaced correctly");
				assert.equal(fnProcessTextsSpy.callCount, 0, "Strategy.processTexts is not called");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
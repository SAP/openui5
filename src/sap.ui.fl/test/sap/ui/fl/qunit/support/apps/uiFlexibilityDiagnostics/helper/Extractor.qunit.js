/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/uiFlexibilityDiagnostics/helper/Extractor",
	"sap/ui/thirdparty/jquery"
], function (
	Extractor,
	jQuery
) {
	"use strict";

	QUnit.module("extractData", {}, function() {
		QUnit.test("works correct", function (assert) {
			var sName = "name";

			var oChangePersistence = {
				_mComponent: {
					name: sName
				},
				_mChanges: {
					mChanges: {}
				},
				_mChangesEntries:{},
				_mChangesInitial: {
					mDependencies: {}
				}
			};

			var oExport = Extractor.extractData(oChangePersistence);

			assert.ok(oExport.bIsInvestigationExport, "'bIsInvestigationExport' was set correct");
			assert.ok(oExport.mControlData, "'mControlData' is present");
			assert.ok(oExport.aAppliedChanges, "'aAppliedChanges' is present");
			assert.ok(oExport.aFailedChanges, "'aFailedChanges' is present");
			assert.ok(oExport.mChangesEntries, "'mChangesEntries' is present");
			assert.ok(oExport.mVariantsChanges, "'mVariantsChanges' is present");
			assert.equal(oExport.sComponentName, sName, "'sComponentName' was set correct");
		});
	});

	QUnit.module("_enhanceExportWithChangeData", {}, function() {
		QUnit.test("works correct", function (assert) {
			var oDefinition1 = {};
			var oDefinition2 = {};

			var oChangePersistence = {
				_mChangesEntries: {
					"id1": {
						_oDefinition: oDefinition1,
						_aDependentSelectorList: [{id: "someControl"}]
					},
					"id2": {
						_oDefinition: oDefinition2,
						_aDependentSelectorList: []
					}
				},
				_mChangesInitial: {
					mDependencies: {}
				}
			};

			var oExport = {
				mChangesEntries: {},
				mControlData: {}
			};

			Extractor._enhanceExportWithChangeData(oChangePersistence, oExport);

			assert.equal(Object.keys(oExport.mChangesEntries).length, 2, "two entries were written for changes");
			assert.ok(oExport.mChangesEntries["id1"], "an entry for the for 'id2' change was written");
			assert.equal(oExport.mChangesEntries["id1"].mDefinition, oDefinition1, "the definition was set for 'id1'");
			assert.ok(oExport.mChangesEntries["id2"], "an entry for the for 'id2' change was written");
			assert.equal(oExport.mChangesEntries["id2"].mDefinition, oDefinition2, "the definition was set for 'id2'");
			assert.equal(Object.keys(oExport.mControlData).length, 1, "one entry was written for controls");
			assert.ok(oExport.mControlData["someControl"], "an entry for the for 'someControl' was written");
			assert.ok(!oExport.mControlData["someControl"].bPresent, "the control could not be found");
		});
	});

	QUnit.module("_enhanceExportWithDependencyData", {}, function() {
		QUnit.test("works correct", function (assert) {
			var sId1ControlDependency1 = "ctrlID1";
			var sId1ControlDependency2 = "ctrlID2";
			var sId2ControlDependency = "ctrlID3";

			var oChangePersistence = {
				_mChangesInitial: {
					mDependencies: {
						"id1": {
							controlsDependencies: [sId1ControlDependency1, sId1ControlDependency2],
							dependencies: []
						},
						"id2": {
							controlsDependencies: [sId2ControlDependency],
							dependencies: ["id1"]
						}
					}
				}
			};

			var oExport = {
				mChangesEntries: {
					id1: {
						mDefinition: {},
						aControlsDependencies: [],
						aDependencies: []
					},
					id2: {
						mDefinition: {},
						aControlsDependencies: [],
						aDependencies: []
					}
				}
			};

			Extractor._enhanceExportWithDependencyData(oChangePersistence, oExport);

			assert.equal(oExport.mChangesEntries.id1.aControlsDependencies.length, 2, "two control dependencies were added in change 'id1'");
			assert.equal(oExport.mChangesEntries.id1.aControlsDependencies[0], sId1ControlDependency1, "the dependency is correct");
			assert.equal(oExport.mChangesEntries.id1.aControlsDependencies[1], sId1ControlDependency2, "the dependency is correct");
			assert.equal(oExport.mChangesEntries.id1.aDependencies, 0, "no change dependencies were added");
			assert.equal(oExport.mChangesEntries.id2.aControlsDependencies.length, 1, "one control dependency was added");
			assert.equal(oExport.mChangesEntries.id2.aControlsDependencies[0], sId2ControlDependency, "the dependency is correct");
			assert.equal(oExport.mChangesEntries.id2.aDependencies.length, 1, "one change dependency was added");
			assert.equal(oExport.mChangesEntries.id2.aDependencies[0], "id1", "the dependency is correct");
		});
	});

	QUnit.module("_enhanceExportWithVariantChangeData", {}, function() {
		QUnit.test("works correct", function (assert) {
			var oDefinition = {};

			var oChangePersistence = {
				_mVariantsChanges: {
					id1: {
						_oDefinition: oDefinition
					}
				}
			};

			var oExport = {
				mVariantsChanges: {}
			};

			Extractor._enhanceExportWithVariantChangeData(oChangePersistence, oExport);

			assert.equal(Object.keys(oExport.mVariantsChanges).length, 1, "the variant change were added");
			assert.equal(oExport.mVariantsChanges.id1.mDefinition, oDefinition, "the change definition were added");
		});
	});

	QUnit.module("_enhanceExportWithControlData with non-existing control", {}, function() {
		QUnit.test("the present control is detected", function (assert) {
			var oChangePersistence = {
				_mChanges: {
					mChanges: {
						"someControlId": {}
					}
				}
			};

			var oExport = {
				mControlData: {},
				aAppliedChanges: [],
				aFailedChanges: []
			};

			Extractor._enhanceExportWithControlData(oChangePersistence, oExport);

			assert.ok(oExport.mControlData["someControlId"], "controlData was written");
		});
	});

	QUnit.module("_enhanceExportWithControlData with existing control", {
		beforeEach: function () {
			this.oControl = new sap.m.Button("someControlId");
		},

		afterEach: function () {
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("the present control is detected", function (assert) {
			var oChangePersistence = {
				_mChanges: {
					mChanges: {
						"someControlId": {}
					}
				}
			};

			var oExport = {
				mControlData: {},
				aAppliedChanges: [],
				aFailedChanges: []
			};

			Extractor._enhanceExportWithControlData(oChangePersistence, oExport);

			assert.ok(oExport.mControlData["someControlId"], "controlData was written");
		});

		QUnit.test("the present flag was set", function (assert) {
			var oChangePersistence = {
				_mChanges: {
					mChanges: {
						"someControlId": {}
					}
				}
			};

			var oExport = {
				mControlData: {},
				aAppliedChanges: [],
				aFailedChanges: []
			};

			Extractor._enhanceExportWithControlData(oChangePersistence, oExport);

			assert.ok(oExport.mControlData["someControlId"].bPresent, "flag is set to true");
		});
	});

	QUnit.module("_enhanceExportWithControlData with existing control and custom data", {
		beforeEach: function () {
			this.oControl = new sap.m.Button("someControlId");
			this.oControl.addCustomData(new sap.ui.core.CustomData({
				key: "sap.ui.fl.appliedChanges",
				value: "a,b,c"
			}));
			this.oControl.addCustomData(new sap.ui.core.CustomData({
				key: "sap.ui.fl.failedChanges.js",
				value: "d,e"
			}));
			this.oControl.addCustomData(new sap.ui.core.CustomData({
				key: "sap.ui.fl.failedChanges.xml",
				value: "f,g,h,i"
			}));
		},
		afterEach: function () {
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("the present control is detected", function (assert) {
			var oChangePersistence = {
				_mChanges: {
					mChanges: {
						"someControlId": {}
					}
				}
			};

			var oExport = {
				mControlData: {},
				aAppliedChanges: [],
				aFailedChanges: []
			};

			Extractor._enhanceExportWithControlData(oChangePersistence, oExport);

			assert.equal(oExport.mControlData["someControlId"].aAppliedChanges.length, 3, "3 applied changes were added");
			assert.equal(oExport.mControlData["someControlId"].aAppliedChanges[0], "a", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aAppliedChanges[1], "b", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aAppliedChanges[2], "c", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesJs.length, 2, "2 failed js changes were added");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesJs[0], "d", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesJs[1], "e", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesXml.length, 4, "4 failed xml changes were added");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesXml[0], "f", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesXml[1], "g", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesXml[2], "h", "applied changeId added correct");
			assert.equal(oExport.mControlData["someControlId"].aFailedChangesXml[3], "i", "applied changeId added correct");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
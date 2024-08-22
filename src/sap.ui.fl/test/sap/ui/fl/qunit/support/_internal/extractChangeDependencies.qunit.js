/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Control,
	FlexState,
	extractChangeDependencies,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sReference = "my.reference";
	const oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);

	QUnit.module("extractChangeDependencies", {
		beforeEach() {
			this.oControl1 = new Control("controlId1");
			this.oControl2 = new Control("controlId2");
			this.oControl3 = new Control("controlId3");
			this.oControl4 = new Control("controlId4");
		},
		afterEach() {
			this.oControl1.destroy();
			this.oControl2.destroy();
			this.oControl3.destroy();
			this.oControl4.destroy();
			FlexState.clearState();
			oAppComponent.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("mChangeEntries with a dependency", async function(assert) {
		this.oChange1 = {
			fileName: "fileNameChange1",
			selector: { id: "controlId1" }
		};
		this.oChange2 = {
			fileName: "fileNameChange2",
			selector: { id: "controlId2" },
			dependentSelector: {
				dependentSelector1: { id: "controlId1" }
			}
		};
		await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
			changes: [this.oChange1, this.oChange2]
		});
		const oResult = extractChangeDependencies(oAppComponent);
		assert.deepEqual(oResult.mChangesEntries.fileNameChange1, {
			aControlsDependencies: [
				"controlId1"
			],
			aDependencies: [],
			mDefinition: {
				content: {},
				dependentSelector: {},
				fileName: "fileNameChange1",
				fileType: "change",
				originalLanguage: "EN",
				selector: {
					id: "controlId1"
				},
				support: {
					generator: "FlexObjectFactory.createFromFileContent"
				},
				texts: {}
			}
		}, "the change entry is correctly generated for the first change");
		assert.deepEqual(
			oResult.mChangesEntries.fileNameChange2.aControlsDependencies,
			["controlId2", "controlId1"],
			"the control dependencies are correctly generated for the second change"
		);
		assert.strictEqual(
			oResult.mChangesEntries.fileNameChange2.mDefinition.dependentSelector.dependentSelector1.id,
			"controlId1",
			"the dependent selector is correctly generated for the second change"
		);
	});

	QUnit.test("VM Independent Changes Only: two changes applied, one failed change in JS, one failed change in XML and one not applicable change", async function(assert) {
		this.oChange1 = {
			fileName: "fileNameChange1",
			selector: { id: "controlId1" }
		};
		this.oChange2 = {
			fileName: "fileNameChange2",
			selector: { id: "controlId2" },
			dependentSelector: {
				dependentSelector1: { id: "controlId1" }
			}
		};
		this.oChange3 = {
			fileName: "fileNameChange3",
			selector: { id: "controlId3" }
		};
		this.oChange4 = {
			fileName: "fileNameChange4",
			selector: { id: "controlId3" }
		};
		this.oChange4 = {
			fileName: "fileNameChange4",
			selector: { id: "controlId4" },
			dependentSelector: {
				dependentSelector1: { id: "controlId3" }
			}
		};
		this.oChange5 = {
			fileName: "fileNameChange5",
			selector: { id: "controlId1" }
		};
		await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
			changes: [this.oChange1, this.oChange2, this.oChange3, this.oChange4, this.oChange5]
		});
		this.oControl1.getCustomData = sandbox.stub().returns([{
			getKey() {
				return `sap.ui.fl.appliedChanges.fileNameChange1`;
			}
		},
		{
			getKey() {
				return `sap.ui.fl.failedChanges.js.fileNameChange5`;
			}
		}]);
		this.oControl2.getCustomData = sandbox.stub().returns([{
			getKey() {
				return `sap.ui.fl.appliedChanges.fileNameChange2`;
			}
		}]);
		this.oControl3.getCustomData = sandbox.stub().returns([{
			getKey() {
				return `sap.ui.fl.failedChanges.xml.fileNameChange3`;
			}
		}]);
		this.oControl4.getCustomData = sandbox.stub().returns([{
			getKey() {
				return `sap.ui.fl.notApplicableChanges.fileNameChange4`;
			}
		}]);
		const oResult = extractChangeDependencies(oAppComponent);
		assert.strictEqual(oResult.aAppliedChanges.length, 2, "two changes applied");
		assert.strictEqual(oResult.aFailedChanges.length, 2, "two changes failed");
		assert.strictEqual(oResult.aNotApplicableChanges.length, 1, "one change not applicable");
	});

	QUnit.test("VM Independent + VM Dependent Changes", async function(assert) {
		this.oChange1 = {
			fileName: "fileNameChange1",
			selector: { id: "controlId1" }
		};
		this.oChange2 = {
			fileName: "fileNameChange2",
			selector: { id: "controlId2" },
			dependentSelector: {
				dependentSelector1: { id: "controlId1" }
			}
		};
		this.oChange3 = {
			fileName: "fileNameChange3",
			selector: { id: "controlId3" },
			variantReference: "foo"
		};
		this.oChange4 = {
			fileName: "fileNameChange4",
			selector: { id: "controlId3" },
			variantReference: "foo"
		};
		this.oChange4 = {
			fileName: "fileNameChange4",
			selector: { id: "controlId4" },
			dependentSelector: {
				dependentSelector1: { id: "controlId3" }
			},
			variantReference: "foo"
		};
		this.oChange5 = {
			fileName: "fileNameChange5",
			selector: { id: "controlId1" },
			variantReference: "foo"
		};
		await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
			changes: [this.oChange1, this.oChange2],
			variantDependentControlChanges: [this.oChange3, this.oChange4, this.oChange5]
		});
		const oResult = extractChangeDependencies(oAppComponent);
		assert.strictEqual(Object.keys(oResult.mChangesEntries).length, 5, "all changes are returned");
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
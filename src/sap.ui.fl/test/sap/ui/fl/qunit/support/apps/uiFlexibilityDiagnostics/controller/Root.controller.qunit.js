/*global QUnit*/
sap.ui.define([
	"sap/ui/fl/support/apps/uiFlexibilityDiagnostics/controller/Root.controller",
	"sap/ui/thirdparty/jquery"
], function (
	RootController,
	jQuery
) {
	"use strict";

	QUnit.module("formatStatus", {
		beforeEach : function () {
			this.oController = new RootController();
		}
	}, function() {
		QUnit.test("displays correct a applied change", function (assert) {
			var sKey = "id_123_moveControl";
			var aAppliedChanges = ["id_456_hideControl", "id_123_moveControl"];
			var aFailedChanges = [];

			var sStatus = this.oController.formatStatus(sKey, aAppliedChanges, aFailedChanges);

			assert.equal(sStatus, "Success", "the applied change was correct formatted");
		});

		QUnit.test("displays correct a failed change", function (assert) {
			var sKey = "id_123_moveControl";
			var aAppliedChanges = ["id_456_hideControl"];
			var aFailedChanges = [ "id_123_moveControl"];

			var sStatus = this.oController.formatStatus(sKey, aAppliedChanges, aFailedChanges);

			assert.equal(sStatus, "Error", "the applied change was correct formatted");
		});
	});

	QUnit.module("generateAttributes", {
		beforeEach : function () {
			this.oController = new RootController();
		}
	}, function() {
		QUnit.test("generateAttributes collects all data required", function (assert) {
			var sLayer = "CUSTOMER";
			var sCreatedAt = "01-02-03:04:05.67890Z";
			var sUser = "Peter Porker";
			var sVersion = "1.2.3";
			var sSelector = "controlId";
			var sSomeDependentControlId = "s0m3";
			var sSomeOtherDependentControlId = "s0m3 07h3r";


			var oDefinition = {
				layer: sLayer,
				creation: sCreatedAt,
				selector: {
					id: sSelector,
					isLocalId: true
				},
				support: {
					user: sUser
				},
				validAppVersions: {
					creation: sVersion,
					from: sVersion
				},
				dependentSelector: {
					"some": [{
						id: sSomeDependentControlId,
						isLocalId: true
					}],
					"some other": [{
						id: sSomeOtherDependentControlId,
						isLocalId: true
					}]
				}
			};

			var aAttributes = this.oController._generateAttributes(oDefinition);

			assert.equal(aAttributes.length, 7, "the right number of attributes was generated");
			assert.equal(aAttributes[0].label, "Layer", "the 'Layer' attribute label was set correct");
			assert.equal(aAttributes[0].value, sLayer, "the 'Layer' attribute value was set correct");
			assert.equal(aAttributes[1].label, "created at", "the 'created at' attribute label was set correct");
			assert.equal(aAttributes[1].value, sCreatedAt, "the 'created at' attribute value was set correct");
			assert.equal(aAttributes[2].label, "created with app version", "the 'created with app version' attribute label was set correct");
			assert.equal(aAttributes[2].value, sVersion, "the 'created with app version' attribute value was set correct");
			assert.equal(aAttributes[3].label, "created by", "the 'created by' attribute label was set correct");
			assert.equal(aAttributes[3].value, sUser, "the 'created by' attribute value was set correct");
			assert.equal(aAttributes[4].label, "selector", "the 'selector' attribute label was set correct");
			assert.equal(aAttributes[4].value, sSelector, "the 'selector' attribute value was set correct");
			assert.equal(aAttributes[5].label, "dependency (some)", "the 'dependency (some)' attribute label was set correct");
			assert.equal(aAttributes[5].value, sSomeDependentControlId, "the 'dependency (some)' attribute value was set correct");
			assert.equal(aAttributes[6].label, "dependency (some other)", "the 'dependency (some other)' attribute label was set correct");
			assert.equal(aAttributes[6].value, sSomeOtherDependentControlId, "the 'dependency (some other)' attribute value was set correct");
		});
	});

	QUnit.module("_generateDependencies", {
		beforeEach : function () {
			this.oController = new RootController();
		}
	}, function() {
		QUnit.test("the generated dependencies are freed of shortcuts", function (assert) {

			var mChangesInitial = {
				mChangesEntries : {
					"change1" : {
						"mDefinition" : {},
						"aDependencies" : []
					},
					"change2" : {
						"mDefinition" : {},
						"aDependencies" : ["change1"]
					},
					"change3" : {
						"mDefinition" : {},
						"aDependencies" : ["change1", "change2"]
					}
				}
			};

			var mGraphData = {
				lines : []
			};

			this.oController._generateDependencies(mChangesInitial, mGraphData);

			assert.equal(mGraphData.lines.length, 2, "the dependencies were reduced to 2");
		});
	});

	QUnit.module("_createGraphData", {
		beforeEach : function () {
			this.oController = new RootController();
		}
	}, function() {
		QUnit.test("the generated graph is correct", function (assert) {
			var mFlexData = {
				bIsInvestigationExport: true,
				mControlData: {},
				aAppliedChanges: [],
				aFailedChanges: [],
				mChangesEntries: {
					"id1": {
						mDefinition: {
							changeType: "moveControl",
							fileName: "id_123_moveControl",
							layer: "CUSTOMER",
							dependentSelector: [],
							selector: {
								"id": "id1"
							},
							support: {
								user: "x"
							}
						},
						aControlsDependencies: [
							"Comp1---idMain1--GeneralLedgerDocument",
							"Comp1---idMain1--GeneralLedgerDocument.Name"
						],
						aDependencies: ["id2"]
					},
					"id2": {
						mDefinition: {
							changeType: "renameField",
							fileName: "id_456_renameField",
							layer: "CUSTOMER",
							dependentSelector: [],
							selector: {
								"id": "id2"
							},
							support: {
								user: "x"
							}
						},
						aControlsDependencies: ["Comp1---idMain1--GeneralLedgerDocument"],
						aDependencies: []
					}
				},
				mVariantsChanges: {},
				mComponent: {}

			};

			var mGraphData = this.oController._createGraphData(mFlexData);

			assert.equal(mGraphData.nodes.length, 2, "two nodes were generated");
			assert.equal(mGraphData.groups.length, 1, "one group was generated");
			assert.equal(mGraphData.lines.length, 1, "one line was generated");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
/*global QUnit*/
sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/support/apps/uiFlexibilityDiagnostics/controller/Root.controller",
	"sap/ui/thirdparty/jquery"
], function (
	Layer,
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
			var aNotApplicableChanges = [];

			var sStatus = this.oController.formatStatus(sKey, aAppliedChanges, aFailedChanges, aNotApplicableChanges);

			assert.equal(sStatus, "Success", "the applied change was correct formatted");
		});

		QUnit.test("displays correct a failed change", function (assert) {
			var sKey = "id_123_moveControl";
			var aAppliedChanges = ["id_456_hideControl"];
			var aFailedChanges = ["id_123_moveControl"];
			var aNotApplicableChanges = [];

			var sStatus = this.oController.formatStatus(sKey, aAppliedChanges, aFailedChanges, aNotApplicableChanges);

			assert.equal(sStatus, "Error", "the applied change was correct formatted");
		});

		QUnit.test("displays correct a not applicable change", function (assert) {
			var sKey = "id_123_moveControl";
			var aAppliedChanges = [];
			var aFailedChanges = [];
			var aNotApplicableChanges = ["id_123_moveControl"];

			var sStatus = this.oController.formatStatus(sKey, aAppliedChanges, aFailedChanges, aNotApplicableChanges);

			assert.equal(sStatus, "CustomNotApplicable", "the not-applicable change was correct formatted");
		});
	});

	QUnit.module("generateAttributes", {
		beforeEach : function () {
			this.oController = new RootController();
		}
	}, function() {
		QUnit.test("generateAttributes collects all data required", function (assert) {
			var sFilename = "file123";
			var sLayer = Layer.CUSTOMER;
			var sCreatedAt = "01-02-03:04:05.67890Z";
			var sUser = "Peter Porker";
			var sVersion = "1.2.3";
			var sSelector = "controlId";
			var sSomeDependentControlId = "s0m3";
			var sSomeOtherDependentControlId = "s0m3 07h3r";
			var sODataPropertyName = "SomeProp";
			var sEntityType = "MyEntity";
			var sODataURI = "/some/path";


			var oDefinition = {
				fileName : sFilename,
				layer: sLayer,
				creation: sCreatedAt,
				selector: {
					id: sSelector,
					isLocalId: true
				},
				content: {a:1},
				variantReference: "",
				support: {
					user: sUser
				},
				oDataInformation: {
					propertyName: sODataPropertyName,
					entityType: sEntityType,
					oDataServiceUri: sODataURI
				},
				validAppVersions: {
					creation: sVersion,
					from: sVersion
				},
				dependentSelector: {
					some: [{
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

			assert.equal(aAttributes.length, 13, "the right number of attributes was generated");
			assert.equal(aAttributes[0].label, "Filename", "the 'Filename' attribute label was set correct");
			assert.equal(aAttributes[0].value, sFilename, "the 'Filename' attribute value was set correct");
			assert.equal(aAttributes[1].label, "Layer", "the 'Layer' attribute label was set correct");
			assert.equal(aAttributes[1].value, sLayer, "the 'Layer' attribute value was set correct");
			assert.equal(aAttributes[2].label, "created at", "the 'created at' attribute label was set correct");
			assert.equal(aAttributes[2].value, sCreatedAt, "the 'created at' attribute value was set correct");
			assert.equal(aAttributes[3].label, "created with app version", "the 'created with app version' attribute label was set correct");
			assert.equal(aAttributes[3].value, sVersion, "the 'created with app version' attribute value was set correct");
			assert.equal(aAttributes[4].label, "created by", "the 'created by' attribute label was set correct");
			assert.equal(aAttributes[4].value, sUser, "the 'created by' attribute value was set correct");
			assert.equal(aAttributes[5].label, "Variant Reference", "the 'Variant Reference' attribute label was set correct");
			assert.equal(aAttributes[5].value, "", "the 'Variant Reference' attribute value was set correct");
			assert.equal(aAttributes[6].label, "selector", "the 'selector' attribute label was set correct");
			assert.equal(aAttributes[6].value, sSelector, "the 'selector' attribute value was set correct");
			assert.equal(aAttributes[7].label, "dependency (some)", "the 'dependency (some)' attribute label was set correct");
			assert.equal(aAttributes[7].value, sSomeDependentControlId, "the 'dependency (some)' attribute value was set correct");
			assert.equal(aAttributes[8].label, "dependency (some other)", "the 'dependency (some other)' attribute label was set correct");
			assert.equal(aAttributes[8].value, sSomeOtherDependentControlId, "the 'dependency (some other)' attribute value was set correct");
			assert.equal(aAttributes[9].label, "OData Property", "the 'OData Property' attribute label was set correct");
			assert.equal(aAttributes[9].value, sODataPropertyName, "the 'OData Property' attribute value was set correct");
			assert.equal(aAttributes[10].label, "OData EntityType", "the 'OData EntityType' attribute label was set correct");
			assert.equal(aAttributes[10].value, sEntityType, "the 'OData EntityType' attribute value was set correct");
			assert.equal(aAttributes[11].label, "OData URI", "the 'OData URI' attribute label was set correct");
			assert.equal(aAttributes[11].value, sODataURI, "the 'OData URI' attribute value was set correct");
			assert.equal(aAttributes[12].label, "Change content", "the 'Change content' attribute label was set correct");
			assert.ok(aAttributes[12].value.length > 0, "the 'Change content' attribute value was set somehow");
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
					change1 : {
						mDefinition : {},
						aDependencies : []
					},
					change2 : {
						mDefinition : {},
						aDependencies : ["change1"]
					},
					change3 : {
						mDefinition : {},
						aDependencies : ["change1", "change2"]
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
				aNotApplicableChanges: [],
				mChangesEntries: {
					id1: {
						mDefinition: {
							changeType: "moveControl",
							fileName: "id_123_moveControl",
							layer: Layer.CUSTOMER,
							dependentSelector: [],
							selector: {
								id: "id1"
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
					id2: {
						mDefinition: {
							changeType: "renameField",
							fileName: "id_456_renameField",
							layer: Layer.CUSTOMER,
							dependentSelector: [],
							selector: {
								id: "id2"
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
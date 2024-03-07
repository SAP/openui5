/* global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
],
function(
	XMLView,
	ODataV2ReadDelegate,
	nextUIUpdate,
	sinon
) {
	"use strict";

	const sandbox = sinon.sandbox.create();

	const aExpectedPropertyInfos = [
		{
		  name: "Property01",
		  bindingPath: "Property01",
		  entityType: "EntityType01",
		  label: "Entity1-Property01-Label",
		  tooltip: "EntityType01/Property01 Quickinfo (from annotation)",
		  hideFromReveal: false
		},
		{
		  name: "Property02",
		  bindingPath: "Property02",
		  entityType: "EntityType01",
		  label: "Entity1-Property02-Label (from annotation)",
		  tooltip: "Entity1-Property02-QuickInfo",
		  hideFromReveal: false
		},
		{
		  name: "Property03",
		  bindingPath: "Property03",
		  entityType: "EntityType01",
		  label: "Entity1-Property03-Label",
		  tooltip: undefined,
		  hideFromReveal: false
		},
		{
		  name: "Property04",
		  bindingPath: "Property04",
		  entityType: "EntityType01",
		  label: "Entity1-Property04-Label",
		  tooltip: "Entity1-Property04-QuickInfo",
		  hideFromReveal: false
		},
		{
		  name: "Property05",
		  bindingPath: "Property05",
		  entityType: "EntityType01",
		  label: "Entity1-Ignored Property",
		  tooltip: "Entity1-Ignored Property QuickInfo",
		  hideFromReveal: false
		},
		{
		  name: "Property06",
		  bindingPath: "Property06",
		  entityType: "EntityType01",
		  label: "Entity1-Property06-Unbound",
		  tooltip: "Unbound Property6",
		  hideFromReveal: false
		},
		{
		  name: "Property07",
		  bindingPath: "Property07",
		  entityType: "EntityType01",
		  label: "Entity1-Property07-ignored-unbound",
		  tooltip: "Unbound Property7",
		  hideFromReveal: false
		},
		{
		  name: "Property08",
		  bindingPath: "Property08",
		  entityType: "EntityType01",
		  label: undefined,
		  tooltip: "Property without sap:label",
		  hideFromReveal: false
		},
		{
		  name: "Property09",
		  bindingPath: "Property09",
		  entityType: "EntityType01",
		  label: undefined,
		  tooltip: "Property without sap:label and visible false",
		  hideFromReveal: true
		},
		{
		  bindingPath: "Property10-Controlled-by-Field-Control",
		  entityType: "EntityType01",
		  hideFromReveal: true,
		  label: undefined,
		  name: "Property10-Controlled-by-Field-Control",
		  tooltip: "Property without sap:label and visible false"
		},
		{
		  name: "EntityType01_Complex",
		  bindingPath: "EntityType01_Complex",
		  entityType: "EntityType01",
		  label: undefined,
		  tooltip: undefined,
		  hideFromReveal: false,
		  properties: [
				{
			  name: "ComplexProperty031",
			  bindingPath: "EntityType01_Complex/ComplexProperty031",
			  entityType: "EntityType01",
			  label: "ComplexProperty 031",
			  tooltip: "ComplexProperty 031-QuickInfo",
			  hideFromReveal: false,
			  referencedComplexPropertyName: "EntityType01_Complex"
				}
		  ]
		},
		{
			name: "EntityType01_TechnicalInvisibleProperty",
			bindingPath: "EntityType01_TechnicalInvisibleProperty",
			entityType: "EntityType01",
			label: "Technical Invisible Property by old Annotations only",
			tooltip: undefined,
			hideFromReveal: true
		},
		{
			bindingPath: "EntityType01_TechnicalInvisibleProperty_uihidden",
			entityType: "EntityType01",
			label: "Technical Invisible Property by Annotations only",
			name: "EntityType01_TechnicalInvisibleProperty_uihidden",
			tooltip: undefined,
			hideFromReveal: true
		},
		{
		  name: "to_EntityType01Nav",
		  entityType: "AdditionalElementsTest.EntityTypeNav",
		  bindingPath: "to_EntityType01Nav",
		  unsupported: true
		}
	  ];

	/**
	 * Asynchronously renders a complex view and checks if the data is ready.
	 *
	 * @param {Object} scope - The scope object containing information about the view.
	 * @returns {boolean} - Indicates if the data is ready in the view.
	 */
	async function _renderComplexView(scope) {
		const oViewInstance = await XMLView.create({
			id: "idMain1",
			viewName: "sap.ui.fl.test.delegate.SmartFormGroup"
		});
		scope.oView = oViewInstance;
		oViewInstance.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oViewInstance.getController().isDataReady();
	}

	QUnit.module("Given a test view", {
		before() {
			return _renderComplexView(this);
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			this.oView.destroy();
		}
	});

	function checkPropertyInfos(assert, aPropertyInfos) {
		assert.strictEqual(
			aPropertyInfos.length,
			aExpectedPropertyInfos.length,
			"then all expected property infos are returned - field control properties are filtered out"
		);
		assert.deepEqual(aPropertyInfos, aExpectedPropertyInfos, "then all property infos are consistent");
	}

	QUnit.test("when getting the propertyInfo for element with binding context without delegate payload", function(assert) {
		const mPropertyBag = {
			element: this.oView.byId("someGroup"),
			aggregationName: "groupElements",
			payload: {}
		};
		return ODataV2ReadDelegate.getPropertyInfo(mPropertyBag)
		.then(checkPropertyInfos.bind(this, assert));
	});

	QUnit.test("when  the propertyInfo for element with absolute list binding and without delegate payload", function(assert) {
		const mPropertyBag = {
			element: this.oView.byId("someList"),
			aggregationName: "items",
			payload: {}
		};
		return ODataV2ReadDelegate.getPropertyInfo(mPropertyBag)
		.then(checkPropertyInfos.bind(this, assert));
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	// internal:
	'sap/ui/rta/util/BindingsExtractor',
	// should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	BindingsExtractor
) {
	"use strict";

	QUnit.module("Given a complex test view with oData Model...", {

		// One model with EntityType01 and EntityType02 (default) + one i18n model ("i18n")

		setup : function(assert) {
			this.oView = renderComplexView(assert);
			return this.oView.getController().isDataReady();
		},
		teardown : function(assert) {
			this.oView.destroy();
		}
	});

	QUnit.test("when getting the Bindings for the Smart Form Group bound to EntityType01 and main data model,", function(assert) {
		var oMainModel = this.oView.getModel();
		var oGroup = this.oView.byId("GroupEntityType01");
		var oGroupElement = this.oView.byId("EntityType01.Prop1");
		var aBindings = BindingsExtractor.getBindings(oGroup, oMainModel);

		assert.equal(hasBindingPath(aBindings,
			oGroupElement.getFields()[0].getBindingPath("value")),
			true,
			"the bound property inside the group element field is found");
	});

	QUnit.test("when getting the BoundPaths for the Smart Form Group bound to EntityType01 and i18n data model,", function(assert) {
		var oI18Model = this.oView.getModel("i18n");
		var oGroup = this.oView.byId("GroupEntityType01");
		var oGroupElement = this.oView.byId("EntityType02.BoundButton34");
		var aBindings = BindingsExtractor.getBindings(oGroup, oI18Model);
		assert.equal(hasBindingPath(aBindings,
			oGroupElement.getFields()[0].getBindingPath("text")),
			true,
			"the binding to i18n>buttonText for the button text inside the group is found");
	});

	QUnit.test("when getting the Bindings for the Text Area bound to EntityType02_Property03 & EntityType02_Complex/ComplexProperty02,", function(assert) {
		var oMainModel = this.oView.getModel();
		var oGroupElement = this.oView.byId("ComplexBindingCase");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(hasBindingPath(aBindings,
			oGroupElement.getFields()[0].getBindingInfo("value").parts[0].path),
			true,
			"the binding to EntityType02_Property03 inside the group element text area is found");
		assert.equal(hasBindingPath(aBindings,
			oGroupElement.getFields()[0].getBindingInfo("value").parts[1].path),
			true,
			"the binding to EntityType02_Complex/ComplexProperty02 inside the group element text area is also found");
	});

	QUnit.test("when getting the Bindings for the Group Element with absolute binding,", function(assert) {
		var oMainModel = this.oView.getModel();
		var oGroupElement = this.oView.byId("EntityType02.AbsoluteBinding");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(aBindings.length, 0, "then the binding is not returned");
	});

	QUnit.test("when getting the Bindings for a navigation binding,", function(assert) {
		var oMainModel = this.oView.getModel();
		var oGroupElement = this.oView.byId("EntityType02.NavigationProperty");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(hasBindingPath(aBindings,
			oGroupElement.getFields()[0].getBindingPath("value")),
			true,
			"the bound property inside the group element field is found");
	});

	QUnit.test("when getting the Bindings for a navigation binding relative to the parent form,", function(assert) {
		var oMainModel = this.oView.getModel();
		var oGroupElement = this.oView.byId("NavPropertyGroupElement");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(hasBindingPath(aBindings,
			oGroupElement.getFields()[0].getBindingPath("value")),
			true,
			"the bound property inside the group element field is found");
	});

	function renderComplexView(assert) {
		var oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.additionalElements.ComplexTest");
		oView.placeAt("test-view");
		sap.ui.getCore().applyChanges();
		return oView;
	}

	function hasBindingPath(aBindings, sPath){
		return aBindings.some(function(oBinding){
			return oBinding.getPath && oBinding.getPath() === sPath;
		});
	}

});

/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/rta/util/BindingsExtractor'
],
function(
	BindingsExtractor
) {
	"use strict";

	var oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.additionalElements.ComplexTest");
	oView.placeAt("test-view");
	sap.ui.getCore().applyChanges();
	oView.getController().isDataReady().then(function () {
		QUnit.start();
	});

	QUnit.done(function () {
		oView.destroy();
	});

	// One model with EntityType01 and EntityType02 (default) + one i18n model ("i18n")
	QUnit.module("Given a complex test view with oData Model...");


	QUnit.test("when getting the Bindings for the Smart Form Group bound to EntityType01 and main data model,", function(assert) {
		var oMainModel = oView.getModel();
		var oGroup = oView.byId("GroupEntityType01");
		var oGroupElement = oView.byId("EntityType01.Prop1");
		var aBindings = BindingsExtractor.getBindings(oGroup, oMainModel);

		assert.equal(
			hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("value")),
			true,
			"the bound property inside the group element field is found");
	});

	QUnit.test("when getting the BoundPaths for the Smart Form Group bound to EntityType01 and i18n data model,", function(assert) {
		var oI18Model = oView.getModel("i18n");
		var oGroup = oView.byId("GroupEntityType01");
		var oGroupElement = oView.byId("EntityType02.BoundButton34");
		var aBindings = BindingsExtractor.getBindings(oGroup, oI18Model);
		assert.equal(
			hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("text")),
			true,
			"the binding to i18n>buttonText for the button text inside the group is found");
	});

	QUnit.test("when getting the Bindings for the Text Area bound to EntityType02_Property03 & EntityType02_Complex/ComplexProperty02,", function(assert) {
		var oMainModel = oView.getModel();
		var oGroupElement = oView.byId("ComplexBindingCase");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(
			hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingInfo("value").parts[0].path),
			true,
			"the binding to EntityType02_Property03 inside the group element text area is found");
		assert.equal(
			hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingInfo("value").parts[1].path),
			true,
			"the binding to EntityType02_Complex/ComplexProperty02 inside the group element text area is also found");
	});

	QUnit.test("when getting the Bindings for the Group Element with absolute binding,", function(assert) {
		var oMainModel = oView.getModel();
		var oGroupElement = oView.byId("EntityType02.AbsoluteBinding");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(aBindings.length, 0, "then the binding is not returned");
	});

	QUnit.test("when getting the Bindings for a navigation binding,", function(assert) {
		var oMainModel = oView.getModel();
		var oGroupElement = oView.byId("EntityType02.NavigationProperty");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(
			hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("value")),
			true,
			"the bound property inside the group element field is found");
	});

	QUnit.test("when getting the Bindings for a navigation binding relative to the parent form,", function(assert) {
		var oMainModel = oView.getModel();
		var oGroupElement = oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[0].getGroupElements()[0];
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.equal(
			hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("value")),
			true,
			"the bound property inside the group element field is found");
	});

	QUnit.test("when getting the Bindings for a field bound to non-existent model,", function(assert) {
		var oMainModel = oView.getModel();
		var oGroupElement = oView.byId("NonExistentModel");
		var aBindings = BindingsExtractor.getBindings(oGroupElement, oMainModel);
		assert.strictEqual(
			aBindings.length,
			0,
			"then no binding is found");
	});

	function hasBindingPath(aBindings, sPath){
		return aBindings.some(function(oBinding){
			return oBinding.getPath && oBinding.getPath() === sPath;
		});
	}

});

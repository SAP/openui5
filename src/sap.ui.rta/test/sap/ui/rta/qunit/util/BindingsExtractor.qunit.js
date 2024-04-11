/* global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/rta/util/BindingsExtractor",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	XMLView,
	BindingsExtractor,
	Button,
	sinon,
	nextUIUpdate
) {
	"use strict";

	function hasBindingPath(aBindings, sPath) {
		return aBindings.some(function(oBinding) {
			return oBinding.getPath && oBinding.getPath() === sPath;
		});
	}

	var sandbox = sinon.createSandbox();

	// One model with EntityType01 and EntityType02 (default) + one i18n model ("i18n")
	QUnit.module("Given a complex test view with oData Model...", {
		before() {
			return XMLView.create({
				id: "idMain1",
				viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
			}).then(function(oView) {
				this.oView = oView;
				return oView.loaded();
			}.bind(this)).then(async function() {
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				return this.oView.getController().isDataReady();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			this.oView.destroy();
		}
	}, function() {
		QUnit.test("when getting the Bindings for the Smart Form Group bound to EntityType01 and main data model", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement = this.oView.byId("EntityType01.Prop1");
			var aBindings = BindingsExtractor.getBindings({element: oGroup, model: oMainModel});

			assert.equal(
				hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("value")),
				true,
				"the bound property inside the group element field is found"
			);
		});

		QUnit.test("when getting the BoundPaths for the Smart Form Group bound to EntityType01 and i18n data model", function(assert) {
			var oI18Model = this.oView.getModel("i18n");
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement = this.oView.byId("EntityType02.BoundButton34");
			var aBindings = BindingsExtractor.getBindings({element: oGroup, model: oI18Model});
			assert.equal(
				hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("text")),
				true,
				"the binding to i18n>buttonText for the button text inside the group is found"
			);
		});

		QUnit.test("when getting the Bindings for the Text Area bound to EntityType02_Property03 & EntityType02_Complex/ComplexProperty02", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroupElement = this.oView.byId("ComplexBindingCase");
			var aBindings = BindingsExtractor.getBindings({element: oGroupElement, model: oMainModel});
			assert.equal(
				hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingInfo("value").parts[0].path),
				true,
				"the binding to EntityType02_Property03 inside the group element text area is found"
			);
			assert.equal(
				hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingInfo("value").parts[1].path),
				true,
				"the binding to EntityType02_Complex/ComplexProperty02 inside the group element text area is also found"
			);
		});

		QUnit.test("when getting the Bindings for the Group Element with absolute binding", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroupElement = this.oView.byId("EntityType02.AbsoluteBinding");
			var aBindings = BindingsExtractor.getBindings({element: oGroupElement, model: oMainModel});
			assert.equal(aBindings.length, 0, "then the binding is not returned");
		});

		QUnit.test("when getting the Bindings for a navigation binding", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroupElement = this.oView.byId("EntityType02.NavigationProperty");
			var aBindings = BindingsExtractor.getBindings({element: oGroupElement, model: oMainModel});
			assert.equal(
				hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("value")),
				true,
				"the bound property inside the group element field is found"
			);
		});

		QUnit.test("when getting the Bindings for a navigation binding relative to the parent form", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroupElement = this.oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[0].getGroupElements()[0];
			var aBindings = BindingsExtractor.getBindings({element: oGroupElement, model: oMainModel});
			assert.equal(
				hasBindingPath(aBindings, oGroupElement.getFields()[0].getBindingPath("value")),
				true,
				"the bound property inside the group element field is found"
			);
		});

		QUnit.test("when getting the Bindings for a field bound to non-existent model", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroupElement = this.oView.byId("NonExistentModel");
			var aBindings = BindingsExtractor.getBindings({element: oGroupElement, model: oMainModel});
			assert.strictEqual(aBindings.length, 0, "then no binding is found");
		});

		QUnit.test("when getting the Bindings for a form element containing a control with a binding for the same model and another with a different data model", function(assert) {
			var oMainModel = this.oView.getModel();
			var oElement = this.oView.byId("FormActivationElement");
			var aBindings = BindingsExtractor.getBindings({element: oElement, model: oMainModel});
			assert.strictEqual(aBindings.length, 1, "then only one binding is found");
			assert.strictEqual(aBindings[0].getPath(), "Property01", "then only the binding from the same model (Property01) is found");
		});

		QUnit.test("when getting the Bindings for a form element containing a control with only bindings inside a template with different data model", function(assert) {
			var oMainModel = this.oView.getModel();
			var oElement = this.oView.byId("FormActivationElementAlone");
			var aBindings = BindingsExtractor.getBindings({element: oElement, model: oMainModel});
			assert.strictEqual(aBindings.length, 0, "then no bindings are found, because they belong to a different data model");
		});

		QUnit.test("when getting the Bindings for a table where a column has a control with bindings inside a template with different data model", function(assert) {
			var oMainModel = this.oView.getModel();
			var oElement = this.oView.byId("table");
			var aBindings = BindingsExtractor.getBindings({element: oElement, model: oMainModel});
			assert.strictEqual(aBindings.length, 4, "then only the bindings belonging to the same data model are found");
		});

		QUnit.test("when collecting the BindingPaths for the Smart Form Group bound to EntityType02 and main data model", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement = this.oView.byId("EntityType02.CompProp1");
			var oForm = this.oView.byId("MainForm");
			var mBindings = BindingsExtractor.collectBindingPaths(oGroup, oMainModel);

			assert.ok(
				mBindings.bindingPaths.indexOf(oGroupElement.getFields()[0].getBindingPath("value")) !== -1,
				"the bound property inside the group element field is found"
			);
			assert.ok(
				mBindings.bindingContextPaths.indexOf(oForm.getBindingContext().getPath()) !== -1,
				"the bound property inside the form is found"
			);
		});

		QUnit.test("when collecting the BindingPaths for the Smart Form Group bound to EntityType02 and main data model, and providing a depth", function(assert) {
			var oMainModel = this.oView.getModel();
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement = this.oView.byId("EntityType02.CompProp1");
			var oForm = this.oView.byId("MainForm");
			var mBindings = BindingsExtractor.collectBindingPaths(oGroup, oMainModel, null, 1);

			assert.ok(
				!mBindings.bindingPaths.includes(oGroupElement.getFields()[0].getBindingPath("value")),
				"the bound property inside the group element field is not found"
			);
			assert.ok(
				!mBindings.bindingContextPaths.includes(oForm.getBindingContext().getPath()),
				"the bound property inside the form is not found"
			);
		});

		QUnit.test("when getBindingContextPath is called for element without bindingContext", function(assert) {
			var oElementWithoutContext = new Button("my-new-button");
			assert.strictEqual(BindingsExtractor.getBindingContextPath(oElementWithoutContext),
				undefined,
				"then 'undefined' is returned");
		});

		QUnit.test("when getBindingContextPath is called for element with bindingContext", function(assert) {
			var oElementWithContext = this.oView.byId("EntityType02.CompProp1");
			var sBindingContextPath = BindingsExtractor.getBindingContextPath(oElementWithContext);
			assert.strictEqual(typeof sBindingContextPath, "string",
				"then the return value is a string");
		});

		QUnit.test("when collectBindingPaths is called for element with bindings not containing a path property", function(assert) {
			var oElement = {
				getParent() {
					return undefined;
				}
			};

			sandbox.stub(BindingsExtractor, "getBindings")
			.returns(
				[
					{
						parts: [{
							value: true,
							mode: "OneWay"
						}]
					},
					{
						parts: [{
							value: "",
							mode: "OneWay"
						}]
					},
					{
						parts: [{
							path: "realPath",
							mode: "OneWay",
							value: "doesntMatter"
						}]
					}
				]
			);

			var aBindingPaths = BindingsExtractor.collectBindingPaths(oElement);

			assert.strictEqual(aBindingPaths.bindingPaths.length, 1, "then only one binding is returned");
			assert.strictEqual(aBindingPaths.bindingPaths[0], "realPath", "then only the binding with a path is returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

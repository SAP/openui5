/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Title",
	"sap/ui/core/mvc/View",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/layout/changeHandler/AddFormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/fl/Change",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Title,
	View,
	JsControlTreeModifier,
	AddFormContainerChangeHandler,
	Form,
	ResponsiveGridLayout,
	FormContainer,
	FormElement,
	Change,
	Log,
	sinon
) {
	'use strict';

	var sandbox = sinon.createSandbox();

	QUnit.module("AddFormContainer for Form", {
		beforeEach: function () {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};
		},
		afterEach: function () {
			if (this.oForm) {
				this.oForm.destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test('Add the same smart form container to Form two times', function (assert) {
			var oTitle = new Title("NewGroup");

			this.oForm = new Form({
				id: "idForm",
				layout: new ResponsiveGridLayout(),
				formContainers: new FormContainer({
					id: "idOldFormContainer",
					formElements: [new FormElement()]
				}),
				title : oTitle
			});
			var oView = new View({content : [
				this.oForm
			]});

			var mSpecificChangeInfo = {
				"newControlId": "addedContainerId",
				"newLabel": "addedContainerLabel",
				"index" : 1
			};
			var oChange = new Change({"changeType" : "addFormContainer"});
			var oPropertyBag = {
				modifier : JsControlTreeModifier,
				view : oView,
				appComponent : this.oMockedAppComponent
			};
			var oLogErrorSpy = sandbox.spy(Log, "error");

			assert.equal(this.oForm.getFormContainers().length, 1,
			"the form has only one form element in the beginning");

			AddFormContainerChangeHandler.completeChangeContent(oChange, mSpecificChangeInfo, oPropertyBag);
			AddFormContainerChangeHandler.applyChange(oChange, this.oForm, oPropertyBag);
			var oNewFormContainer = this.oForm.getFormContainers()[1];
			assert.equal(oLogErrorSpy.callCount, 0, "the first change to add a container was applied without errors");
			assert.equal(this.oForm.getFormContainers().length, 2, "the form has now 2 form container");
			assert.equal(oNewFormContainer.getId(), "addedContainerId", "the new form container has a stable id");
			assert.equal(oNewFormContainer.getTitle().getText(), "addedContainerLabel", "the new Title was inserted for the form container element");
			assert.throws(function() {
				AddFormContainerChangeHandler.applyChange(oChange, this.oForm, oPropertyBag);
			}, function(oReturn) {
				return oReturn && oReturn.message ? oReturn.message.indexOf("Control to be created already exists") >= 0 : false;
			}, "the second change to add the same field throws a not applicable info message");
		});
	});
});

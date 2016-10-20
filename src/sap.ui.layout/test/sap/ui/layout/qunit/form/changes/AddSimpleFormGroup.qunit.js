/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.layout.changeHandler.AddSimpleFormGroup");
jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.layout.form.FormElement");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function () {
	"use strict";

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup", {
		beforeEach: function () {

			this.oTitle0 = new sap.ui.core.Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new sap.m.Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new sap.m.Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new sap.m.Input({id: "Input0", visible: true});
			this.oInput1 = new sap.m.Input({id: "Input1"});
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			var oLegacyChange = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {
						"id": "newId",
						"index": 5
					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};
			this.oLegacyChangeWrapper = new sap.ui.fl.Change(oLegacyChange);

			var oChangeWithLocalIds = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {
						"selector": {
							"id": "newId",
							"idIsLocal": true
						},
						"index": 5
					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};
			this.oChangeWithLocalIdsWrapper = new sap.ui.fl.Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {
						"selector": {
							"id": "newId",
							"idIsLocal": false
						},
						"index": 5
					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};
			this.oChangeWithGlobalIdsWrapper = new sap.ui.fl.Change(oChangeWithGlobalIds);

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			this.oChangeHandler = sap.ui.layout.changeHandler.AddSimpleFormGroup;
			this.oJsControlTreeModifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
			this.oXmlTreeModifier = sap.ui.fl.changeHandler.XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oLegacyChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oSimpleForm.getContent()[5].getId(), "newId", "the FormContainer has the correct id");
		assert.equal(this.oSimpleForm.getContent()[5].getText(), "New Control", "the FormContainer is added");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithLocalIdsWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oSimpleForm.getContent()[5].getId(), "component---newId", "the FormContainer has the correct id");
		assert.equal(this.oSimpleForm.getContent()[5].getText(), "New Control", "the FormContainer is added");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing global ids", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdsWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oSimpleForm.getContent()[5].getId(), "newId", "the FormContainer has the correct id");
		assert.equal(this.oSimpleForm.getContent()[5].getText(), "New Control", "the FormContainer is added");
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.m'>" +
			"<layout:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
			"<layout:content>" +
			"<Title id='Title0' text='Title 0' visible='true' />" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</layout:content>" +
			"</layout:SimpleForm>" +
			"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0].childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		assert.ok(this.oChangeHandler.applyChange(this.oLegacyChangeWrapper, this.oXmlSimpleForm, {
			modifier: this.oXmlTreeModifier,
			view: this.oXmlDocument
		}), "no errors occur");
		this.testControl = this.oXmlSimpleForm.childNodes[0].childNodes[5];
		assert.equal(this.testControl.getAttribute("text"), "New Control", "the FormContainer is added");
	});

	QUnit.test("applyChange shall raise an exception if the control does not have the required methods", function (assert) {
		var exception, oControl;

		oControl = {};

		//Call CUT
		try {
			this.oChangeHandler.applyChange(this.oLegacyChangeWrapper, oControl, {modifier: this.JsControlTreeModifier});
		} catch (ex) {
			exception = ex;
		}
		assert.ok(exception, "Shall raise an exception");
	});

	QUnit.test('when calling completeChangeContent', function (assert) {
		var oChange = {
			"selector": {
				"id": "SimpleForm"
			},
			"changeType": "addSimpleFormGroup",
			"content": {}
		};
		var oChangeWrapper = new sap.ui.fl.Change(oChange);
		var oSpecificChangeInfo = {index: 5, newControlId: "newId", newLabel: "New Control"};

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);

		assert.equal(oChange.content.group.selector.id, "newId", "newControlId has been added to the change");
		assert.equal(oChange.content.group.index, 5, "index has been added to the change");
		assert.equal(oChange.texts.groupLabel.value, "New Control", "groupLabel has been added to the change");
	});

	QUnit.test('when calling completeChangeContent without sHideId', function (assert) {
		var oChangeWrapper = new sap.ui.fl.Change({
			"selector": {
				"id": "SimpleForm"
			},
			"changeType": "addSimpleFormGroup",
			"content": {}
		});

		assert.throws(function () {
				this.oChangeHandler.completeChangeContent(oChangeWrapper, this.oSimpleForm, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.groupLabel attribute required"),
			"the undefined value raises an error message"
		);
	});

})();

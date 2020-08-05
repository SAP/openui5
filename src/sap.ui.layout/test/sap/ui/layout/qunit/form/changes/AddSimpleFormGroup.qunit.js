/*global QUnit*/
sap.ui.define([
	"sap/ui/layout/changeHandler/AddSimpleFormGroup",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Input"
], function(
	AddSimpleFormGroup,
	SimpleForm,
	FormElement,
	FormContainer,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	Title,
	Label,
	Input
) {
	"use strict";


	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform with title and having old index", {
		beforeEach: function () {

			this.oTitle0 = new Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var mCommonChangeData = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {

					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};

			var oLegacyChange = jQuery.extend(true, {}, mCommonChangeData);
			oLegacyChange.content.group = {
				"id": "newId",
				"index": 5
			};
			this.oLegacyChangeWrapper = new Change(oLegacyChange);

			var oChangeWithLocalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithLocalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": true
				},
				"index": 5
			};
			this.oChangeWithLocalIdsWrapper = new Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithGlobalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": false
				},
				"index": 5
			};
			this.oChangeWithGlobalIdsWrapper = new Change(oChangeWithGlobalIds);

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			this.oChangeHandler = AddSimpleFormGroup;
			this.oXmlTreeModifier = XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	function _testApplyChangeWithJsControlTreeModifier (oChange, sExpectedId, iIndex, assert){
		assert.ok(this.oChangeHandler.applyChange(oChange, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oSimpleForm.getContent()[iIndex].getId(), sExpectedId, "the FormContainer has the correct id");
		assert.equal(this.oSimpleForm.getContent()[iIndex].getText(), "New Control", "the FormContainer is added");
	}

	function _testApplyChangeWithXMLTreeModifier (oXmlString, oChange, sExpectedId, iIndex, assert){
		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];

		assert.ok(this.oChangeHandler.applyChange(this.oLegacyChangeWrapper, this.oXmlSimpleForm, {
			modifier: this.oXmlTreeModifier,
			view: this.oXmlDocument
		}), "no errors occur");
		this.testControl = this.oXmlSimpleForm.childNodes[0].childNodes[iIndex];
		assert.equal(this.testControl.getAttribute("text"), "New Control", "the FormContainer is added");
	}

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oLegacyChangeWrapper, "newId", 5, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithLocalIdsWrapper, "component---newId", 5, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing global ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithGlobalIdsWrapper, "newId", 5, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
			"<form:content>" +
			"<Title id='Title0' text='Title 0' visible='true' />" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		_testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oLegacyChangeWrapper, "New Control", 5, assert);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform without title and having old index", {
		beforeEach: function () {

			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				content: [this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var mCommonChangeData = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {

					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};

			var oLegacyChange = jQuery.extend(true, {}, mCommonChangeData);
			oLegacyChange.content.group = {
				"id": "newId",
				"index": 0
			};
			this.oLegacyChangeWrapper = new Change(oLegacyChange);

			var oChangeWithLocalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithLocalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": true
				},
				"index": 0
			};
			this.oChangeWithLocalIdsWrapper = new Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithGlobalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": false
				},
				"index": 0
			};
			this.oChangeWithGlobalIdsWrapper = new Change(oChangeWithGlobalIds);

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			this.oChangeHandler = AddSimpleFormGroup;
			this.oXmlTreeModifier = XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oLegacyChangeWrapper, "newId", 0, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithLocalIdsWrapper, "component---newId", 0, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing global ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithGlobalIdsWrapper, "newId", 0, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
			"<form:content>" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		_testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oLegacyChangeWrapper, "New Control", 0, assert);
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

	QUnit.test('when calling completeChangeContent with relative index', function (assert) {
		var oChange = {
			"selector": {
				"id": "SimpleForm"
			},
			"changeType": "addSimpleFormGroup",
			"content": {}
		};
		var oChangeWrapper = new Change(oChange);
		var oSpecificChangeInfo = {index: 5, newControlId: "newId", newLabel: "New Control"};

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);

		assert.equal(oChange.content.group.selector.id, "newId", "newControlId has been added to the change");
		assert.equal(oChange.content.group.relativeIndex, 5, "index has been added to the change");
		assert.equal(oChange.texts.groupLabel.value, "New Control", "groupLabel has been added to the change");
	});

	QUnit.test('when calling completeChangeContent with incomplete specificChangeInfo', function (assert) {
		var oChangeWrapper = new Change({
			"selector": {
				"id": "SimpleForm"
			},
			"changeType": "addSimpleFormGroup",
			"content": {}
		});

		assert.throws(function () {
				this.oChangeHandler.completeChangeContent(oChangeWrapper, this.oSimpleForm, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.newLabel attribute required"),
			"the undefined value raises an error message"
		);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform with title and having relative index", {
		beforeEach: function () {
			this.oTitle0 = new Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var mCommonChangeData = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {

					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};

			var oLegacyChange = jQuery.extend(true, {}, mCommonChangeData);
			oLegacyChange.content.group = {
				"id": "newId",
				"relativeIndex": 1
			};
			this.oLegacyChangeWrapper = new Change(oLegacyChange);

			var oChangeWithLocalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithLocalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": true
				},
				"relativeIndex": 1
			};
			this.oChangeWithLocalIdsWrapper = new Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithGlobalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": false
				},
				"relativeIndex": 1
			};
			this.oChangeWithGlobalIdsWrapper = new Change(oChangeWithGlobalIds);

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			this.oChangeHandler = AddSimpleFormGroup;
			this.oXmlTreeModifier = XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oLegacyChangeWrapper, "newId", 5, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithLocalIdsWrapper, "component---newId", 5, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing global ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithGlobalIdsWrapper, "newId", 5, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
			"<form:content>" +
			"<Title id='Title0' text='Title 0' visible='true' />" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		_testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oLegacyChangeWrapper, "New Control", 5, assert);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform without title and having relative index", {
		beforeEach: function () {

			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				content: [this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var mCommonChangeData = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {

					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};

			var oLegacyChange = jQuery.extend(true, {}, mCommonChangeData);
			oLegacyChange.content.group = {
				"id": "newId",
				"relativeIndex": 0
			};
			this.oLegacyChangeWrapper = new Change(oLegacyChange);

			var oChangeWithLocalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithLocalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": true
				},
				"relativeIndex": 0
			};
			this.oChangeWithLocalIdsWrapper = new Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithGlobalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": false
				},
				"relativeIndex": 0
			};
			this.oChangeWithGlobalIdsWrapper = new Change(oChangeWithGlobalIds);

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			this.oChangeHandler = AddSimpleFormGroup;
			this.oXmlTreeModifier = XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oLegacyChangeWrapper, "newId", 0, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithLocalIdsWrapper, "component---newId", 0, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing global ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithGlobalIdsWrapper, "newId", 0, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
			"<form:content>" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		_testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oLegacyChangeWrapper, "New Control", 0, assert);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform with two form containers having title and relative index", {
		beforeEach: function () {

			this.oTitle0 = new Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});

			this.oTitle1 = new Title({id: "Title1", text: "Title 1"});
			this.oLabel2 = new Label({id: "Label2", text: "Label 2", visible: true});
			this.oLabel3 = new Label({id: "Label3", text: "Label 3"});
			this.oInput2 = new Input({id: "Input2", visible: true});
			this.oInput3 = new Input({id: "Input3"});

			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oTitle1, this.oLabel2, this.oInput2, this.oLabel3, this.oInput3]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var mCommonChangeData = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"group": {

					}
				},
				"texts": {
					"groupLabel": {
						"value": "New Control"
					}
				},
				"changeType": "addSimpleFormGroup"
			};

			var oLegacyChange = jQuery.extend(true, {}, mCommonChangeData);
			oLegacyChange.content.group = {
				"id": "newId",
				"relativeIndex": 1
			};
			this.oLegacyChangeWrapper = new Change(oLegacyChange);

			var oChangeWithLocalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithLocalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": true
				},
				"relativeIndex": 1
			};
			this.oChangeWithLocalIdsWrapper = new Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = jQuery.extend(true, {}, mCommonChangeData);
			oChangeWithGlobalIds.content.group = {
				"selector": {
					"id": "newId",
					"idIsLocal": false
				},
				"relativeIndex": 1
			};
			this.oChangeWithGlobalIdsWrapper = new Change(oChangeWithGlobalIds);

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			this.oChangeHandler = AddSimpleFormGroup;
			this.oXmlTreeModifier = XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oLegacyChangeWrapper, "newId", 5, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier twice with the same control to add", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oLegacyChangeWrapper, "newId", 5, assert);
		// add the same change another time
		assert.throws(function() {
			this.oChangeHandler.applyChange(this.oLegacyChangeWrapper, this.oSimpleForm, this.mPropertyBag);
		}, function(oReturn) {
			return oReturn && oReturn.message ? oReturn.message.indexOf("Control to be created already exists") >= 0 : false;
		}, "the second change to add the same group throws a not applicable info message");
		assert.equal(this.oSimpleForm.getContent()[5].getId(), "newId", "the FormContainer has the correct id");
		assert.equal(this.oSimpleForm.getContent()[5].getText(), "New Control", "the FormContainer is still available");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithLocalIdsWrapper, "component---newId", 5, assert);
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing global ids", function (assert) {
		_testApplyChangeWithJsControlTreeModifier.call(this, this.oChangeWithGlobalIdsWrapper, "newId", 5, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
			"<form:content>" +
			"<Title id='Title0' text='Title 0' visible='true' />" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"<Title id='Title1' text='Title 1' visible='true' />" +
			"<Label id='Label2' text='Label 2' visible='true' />" +
			"<Input id='Input2' visible='true' />" +
			"<Label id='Label3' text='Label 3' visible='true' />" +
			"<Input id='Input3' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		_testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oLegacyChangeWrapper, "New Control", 5, assert);
	});
});
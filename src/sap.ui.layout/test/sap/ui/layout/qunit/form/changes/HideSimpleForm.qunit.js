/*global QUnit*/
jQuery.sap.require("sap.ui.layout.changeHandler.HideSimpleForm");
jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.layout.form.FormElement");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function() {
	"use strict";

	QUnit.module("using sap.ui.layout.changeHandler.HideSimpleForm with old change format", {
		beforeEach: function () {

			this.oTitle0 = new sap.ui.core.Title({id : "Title0", text : "Title 0"});
			this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "Input0", visible : true});
			this.oInput1 = new sap.m.Input({id : "Input1"});
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oLegacyChange = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"elementSelector": this.oLabel0.getId()
				},
				"changeType": "hideSimpleFormField"
			};

			this.oChangeWrapper = new sap.ui.fl.Change(oLegacyChange);
			this.oChangeHandler = sap.ui.layout.changeHandler.HideSimpleForm;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.notOk(this.oLabel0.getVisible(), "the FormElement is hidden");
	});

	QUnit.module("using sap.ui.layout.changeHandler.HideSimpleForm with a new change format", {
		beforeEach: function () {

			this.oTitle0 = new sap.ui.core.Title({id : "component---Title0",  text : "Title 0"});
			this.oLabel0 = new sap.m.Label({id : "component---Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new sap.m.Label({id : "component---Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "component---Input0", visible : true});
			this.oInput1 = new sap.m.Input({id : "component---Input1"});
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "component---SimpleForm", title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return "component---" + sString;},
				getLocalId: function (sString) {return sString.substring("component---".length);}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oChange = {
				"selector": {
					"id": "component---SimpleForm"
				},
				"content": {
					"elementSelector": {
						"id": this.oLabel0.getId()
					}
				},
				"changeType": "hideSimpleFormField"
			};
			this.oChangeWrapper = new sap.ui.fl.Change(oChange);

			var oChangeWithLocalIds = {
				"selector": {
					"id": "SimpleForm",
					"idIsLocal": true
				},
				"content": {
					"elementSelector": {
						"id" : "Label0",
						"idIsLocal": true
					}
				},
				"changeType": "hideSimpleFormField"
			};
			this.oChangeWithLocalIdsWrapper = new sap.ui.fl.Change(oChangeWithLocalIds);

			var oChangeWithGlobalIds = {
				"selector": {
					"id": "component---SimpleForm"
				},
				"content": {
					"elementSelector": {
						id : this.oLabel0.getId(),
						idIsLocal: false
					}
				},
				"changeType": "hideSimpleFormField"
			};

			this.oChangeWithGlobalIdsWrapper = new sap.ui.fl.Change(oChangeWithGlobalIds);
			this.oChangeHandler = sap.ui.layout.changeHandler.HideSimpleForm;
			this.oXmlTreeModifier = sap.ui.fl.changeHandler.XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.notOk(this.oLabel0.getVisible(), "the FormElement is hidden");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a change containing local ids", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithLocalIdsWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.notOk(this.oLabel0.getVisible(), "the FormElement is hidden");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a change containing global ids", function (assert) {
		//Call CUT
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdsWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.notOk(this.oLabel0.getVisible(), "the FormElement is hidden");
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

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdsWrapper, this.oXmlSimpleForm, {
			modifier : this.oXmlTreeModifier,
			view : this.oXmlDocument
		}), "no errors occur");
		assert.ok(this.oXmlLabel0.getAttribute("visible"), "the FormElement is hidden");
	});

	QUnit.test("applyChange shall raise an exception if the control does not have the required methods", function (assert) {
		var exception, oControl;

		//Call CUT
		try {
			this.oChangeHandler.applyChange(this.oChangeWithGlobalIdsWrapper, oControl, {modifier : this.JsControlTreeModifier});
		} catch (ex) {
			exception = ex;
		}
		assert.ok(exception, "Shall raise an exception");
	});

	QUnit.test('when calling completeChangeContent', function (assert) {
		var oChange = {
			"selector": {
				"id": "SimpleForm",
				"idIsLocal": true
			},
			"changeType": "hideSimpleFormField",
			"content": {
			}
		};
		var oChangeWrapper = new sap.ui.fl.Change(oChange);
		var oSpecificChangeInfo = { removedElement: { id : "component---Label1" } };

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);

		assert.equal(oChange.content.elementSelector.id, "Label1", "elementSelector.id has been added to the change");
		assert.ok(oChange.content.elementSelector.idIsLocal, "elementSelector.idIsLocal has been added to the change");
	});

	QUnit.test('when calling completeChangeContent without removedElement.id', function (assert) {
		var oChangeWrapper = new sap.ui.fl.Change({
			"selector": {
				"id": "SimpleForm",
				"idIsLocal": true
			},
			"changeType": "hideSimpleFormField",
			"content": {
			}
		});

		assert.throws(function() {
			this.oChangeHandler.completeChangeContent(oChangeWrapper, this.oSimpleForm, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.removedElement.id attribute required"),
			"the undefined value raises an error message"
		);
	});

	QUnit.module("using sap.ui.layout.changeHandler.HideSimpleForm with a simpleform with toolbar", {
		beforeEach: function () {

			this.oToolbar0 = new sap.m.Toolbar({id : "Toolbar0"});
			var oTitle0 = new sap.m.Title("Title0", {text : "Title 0"});
			this.oToolbar0.addContent(oTitle0);
			this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "Input0", visible : true});
			this.oInput1 = new sap.m.Input({id : "Input1"});

			this.oToolbar1 = new sap.m.Toolbar({id : "Toolbar1"});
			var oTitle1 = new sap.m.Title("Title1", {text : "Title 1"});
			this.oToolbar1.addContent(oTitle1);
			this.oLabel10 = new sap.m.Label({id : "Label10",  text : "Label 10", visible : true});
			this.oLabel11 = new sap.m.Label({id : "Label11",  text : "Label 11"});
			this.oInput10 = new sap.m.Input({id : "Input10", visible : true});
			this.oInput11 = new sap.m.Input({id : "Input11"});

			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				content : [this.oToolbar0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oToolbar1, this.oLabel10, this.oInput10, this.oLabel11, this.oInput11]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oChange = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"elementSelector": this.oToolbar1.getId()
				},
				"changeType": "removeSimpleFormGroup"
			};

			this.oChangeWrapper = new sap.ui.fl.Change(oChange);
			this.oChangeHandler = sap.ui.layout.changeHandler.HideSimpleForm;
			this.oXmlTreeModifier = sap.ui.fl.changeHandler.XmlTreeModifier;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
			this.oLabel0.destroy();
			this.oLabel1.destroy();
			this.oInput0.destroy();
			this.oInput1.destroy();
			this.oToolbar0.destroy();
			this.oToolbar1.destroy();
			this.oLabel10.destroy();
			this.oLabel11.destroy();
			this.oInput10.destroy();
			this.oInput11.destroy();
		}
	});

	QUnit.test("when removing a FormContainer in SimpleForm with Toolbars", function(assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.ok(this.oLabel0.getVisible(), "the label of first FormElement is visible");
		assert.ok(this.oLabel1.getVisible(), "the label of first FormElement is visible");
		assert.ok(this.oInput0.getVisible(), "the input of first FormElement is visible");
		assert.ok(this.oInput1.getVisible(), "the input of first FormElement is visible");
		assert.notOk(this.oLabel10.getVisible(), "the label of second FormElement is hidden");
		assert.notOk(this.oLabel11.getVisible(), "the label of second FormElement is hidden");
		assert.notOk(this.oInput10.getVisible(), "the input of second FormElement is hidden");
		assert.notOk(this.oInput11.getVisible(), "the input of second FormElement is hidden");
	});

	QUnit.test("when removing a FormContainer in SimpleForm with Toolbars using XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.m'>" +
		"<layout:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
		"<layout:content>" +
		"<Toolbar id='Toolbar0' text='Title 0' visible='true' />" +
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

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oXmlSimpleForm, {
			modifier : this.oXmlTreeModifier,
			view : this.oXmlDocument
		}), "no errors occur");
		assert.ok(this.oXmlLabel0.getAttribute("visible"), "the FormElement is hidden");
	});

	QUnit.module("using sap.ui.layout.changeHandler.HideSimpleForm with a simpleform with toolbar", {
		beforeEach: function () {

			this.oLabel0 = new sap.m.Label({id : "Label30",  text : "Label 0", visible : true});
			this.oLabel1 = new sap.m.Label({id : "Label31",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "Input30", visible : true});
			this.oInput1 = new sap.m.Input({id : "Input31"});

			this.oToolbar1 = new sap.m.Toolbar({id : "Toolbar31"});
			var oTitle1 = new sap.m.Title("Title31", {text : "Title 1"});
			this.oToolbar1.addContent(oTitle1);
			this.oLabel10 = new sap.m.Label({id : "Label130",  text : "Label 10", visible : true});
			this.oLabel11 = new sap.m.Label({id : "Label311",  text : "Label 11"});
			this.oInput10 = new sap.m.Input({id : "Input310", visible : true});
			this.oInput11 = new sap.m.Input({id : "Input311"});

			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				content : [this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oToolbar1, this.oLabel10, this.oInput10, this.oLabel11, this.oInput11]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oChange = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"elementSelector": this.oToolbar1.getId()
				},
				"changeType": "removeSimpleFormGroup"
			};

			var oChange1 = {
				"selector": {
					"id": "SimpleForm"
				},
				"content": {
					"elementSelector": null
				},
				"changeType": "removeSimpleFormGroup"
			};

			this.oChangeWrapper = new sap.ui.fl.Change(oChange);
			this.oChangeWrapper1 = new sap.ui.fl.Change(oChange1);
			this.oChangeHandler = sap.ui.layout.changeHandler.HideSimpleForm;
		},

		afterEach: function () {
			this.oSimpleForm.destroy();
			this.oToolbar1.destroy();
		}
	});

	QUnit.test("when removing a FormContainer in SimpleForm with Toolbars, and the first FormContainer has no Toolbar", function(assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.ok(this.oLabel0.getVisible(), "the label of first FormElement is visible");
		assert.ok(this.oLabel1.getVisible(), "the label of first FormElement is visible");
		assert.ok(this.oInput0.getVisible(), "the input of first FormElement is visible");
		assert.ok(this.oInput1.getVisible(), "the input of first FormElement is visible");
		assert.notOk(this.oLabel10.getVisible(), "the label of second FormElement is hidden");
		assert.notOk(this.oLabel11.getVisible(), "the label of second FormElement is hidden");
		assert.notOk(this.oInput10.getVisible(), "the input of second FormElement is hidden");
		assert.notOk(this.oInput11.getVisible(), "the input of second FormElement is hidden");
	});

	QUnit.test("when removing the first FormContainer (without Toolbar) in SimpleForm with Toolbars", function(assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper1, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.notOk(this.oLabel0.getVisible(), "the label of first FormElement is hidden");
		assert.notOk(this.oLabel1.getVisible(), "the label of first FormElement is hidden");
		assert.notOk(this.oInput0.getVisible(), "the input of first FormElement is hidden");
		assert.notOk(this.oInput1.getVisible(), "the input of first FormElement is hidden");
		assert.ok(this.oLabel10.getVisible(), "the label of second FormElement is visible");
		assert.ok(this.oLabel11.getVisible(), "the label of second FormElement is visible");
		assert.ok(this.oInput10.getVisible(), "the input of second FormElement is visible");
		assert.ok(this.oInput11.getVisible(), "the input of second FormElement is visible");
	});
})();

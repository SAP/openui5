/*global QUnit*/
jQuery.sap.require("sap.ui.layout.changeHandler.RenameSimpleForm");
jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.layout.form.FormElement");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function() {
	"use strict";

	QUnit.module("using sap.ui.layout.changeHandler.RenameSimpleForm with legacy change format", {
		beforeEach: function () {
			this.sNewValue = "new label";

			this.oTitle0 = new sap.ui.core.Title({id : "Title0",  text : "Title 0"});
			this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0"});
			this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "Input0"});
			this.oInput1 = new sap.m.Input({id : "Input1"});

			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oLegacyChange = {
				selector : {
					id : "SimpleForm"
				},
				content : {
					elementSelector : this.oLabel0.getId()
				},
				texts : {
					formText : {
						value : this.sNewValue
					}
				}
			};

			this.oChangeWrapper = new sap.ui.fl.Change(oLegacyChange);

			this.oChangeHandler = sap.ui.layout.changeHandler.RenameSimpleForm;

		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}

	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oFormElement.getLabel().getText(), this.sNewValue, "the label has changed");
	});

	QUnit.test("when calling applyChange with XmlTreeModifier and a legacy change", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.m'>" +
		"<layout:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
		"<layout:content>" +
		"<Title id='Title0' text='oldTitle' />" +
		"<Label id='Label0' text='oldLabel0' />" +
		"<Input id='Input0'/>" +
		"<Label id='Label1' text='oldLabel1' />" +
		"<Input id='Input1'/>" +
		"</layout:content>" +
		"</layout:SimpleForm>" +
		"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oXmlSimpleForm, {
			appComponent: this.oMockedComponent,
			modifier : sap.ui.fl.changeHandler.XmlTreeModifier,
			view : this.oXmlDocument
		}), "no errors occur");
		assert.equal(this.oXmlLabel0.getAttribute("text"), this.sNewValue, "the label has changed");
	});

	QUnit.module("using sap.ui.layout.changeHandler.RenameSimpleForm with a new change format", {
		beforeEach: function () {
			this.sNewValue = "new label";

			this.oTitle0 = new sap.ui.core.Title({id : "component---Title0",  text : "Title 0"});
			this.oLabel0 = new sap.m.Label({id : "component---Label0",  text : "Label 0"});
			this.oLabel1 = new sap.m.Label({id : "component---Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "component---Input0"});
			this.oInput1 = new sap.m.Input({id : "component---Input1"});

			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "component---SimpleForm", title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			this.oMockedComponent = {
				createId: function (sString) {return "component---" + sString;},
				getLocalId: function (sString) {return sString.substring("component---".length);}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: sap.ui.fl.changeHandler.JsControlTreeModifier
			};

			var oChange = {
				selector : {
					id : "component---SimpleForm"
				},
				content : {
					elementSelector : this.oLabel0.getId()
				},
				texts : {
					formText : {
						value : this.sNewValue
					}
				}
			};

			this.oChangeWrapper = new sap.ui.fl.Change(oChange);

			var oChangeWithLocalId = {
				selector : {
					id : "SimpleForm"
				},
				content : {
					elementSelector : {
						id : "Label0",
						idIsLocal : true
					}
				},
				texts : {
					formText : {
						value : this.sNewValue
					}
				}
			};

			this.oChangeWithLocalIdWrapper = new sap.ui.fl.Change(oChangeWithLocalId);

			var oChangeWithGlobalId = {
				selector : {
					id : "component---SimpleForm"
				},
				content : {
					elementSelector : {
						id : this.oFormElement.getLabel().getId(),
						idIsLocal : false
					}
				},
				texts : {
					formText : {
						value : this.sNewValue
					}
				}
			};

			this.oChangeWithGlobalIdWrapper = new sap.ui.fl.Change(oChangeWithGlobalId);

			this.oChangeHandler = sap.ui.layout.changeHandler.RenameSimpleForm;

		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}

	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oFormElement.getLabel().getText(), this.sNewValue, "the label has changed");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a change containing a local Id", function (assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithLocalIdWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oFormElement.getLabel().getText(), this.sNewValue, "the label has changed");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a change containing a global Id", function (assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oFormElement.getLabel().getText(), this.sNewValue, "the label has changed");
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.m'>" +
		"<layout:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
		"<layout:content>" +
		"<Title id='component---Title0' text='oldTitle' />" +
		"<Label id='component---Label0' text='oldLabel0' />" +
		"<Input id='component---Input0'/>" +
		"<Label id='component---Label1' text='oldLabel1' />" +
		"<Input id='component---Input1'/>" +
		"</layout:content>" +
		"</layout:SimpleForm>" +
		"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdWrapper, this.oXmlSimpleForm, {
			appComponent: this.oMockedComponent,
			modifier : sap.ui.fl.changeHandler.XmlTreeModifier,
			view : this.oXmlDocument
		}), "no errors occur");
		assert.equal(this.oXmlLabel0.getAttribute("text"), this.sNewValue, "the label has changed");
	});

	QUnit.test("applyChange shall raise an exception if the control does not have the required methods", function (assert) {
		var exception, oControl;
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
		//Call CUT
		try {
			this.oChangeHandler.applyChange(this.oChangeWithGlobalIdWrapper, oControl, this.mPropertyBag);
		} catch (ex) {
			exception = ex;
		}
		assert.ok(exception, "Shall raise an exception");
	});

	QUnit.test('when calling completeChangeContent for FormElement', function (assert) {
		var oChange = {
			selector : {
				id : "SimpleForm",
				idIsLocal : true
			},
			content : {
			}
		};

		var oChangeWrapper = new sap.ui.fl.Change(oChange);
		var oSpecificChangeInfo = {
			renamedElement :{
				id: this.oFormElement.getId()
			},
			changeType: "renameLabel",
			value: this.sNewValue
		};

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);

		assert.equal(oChange.texts.formText.value, this.sNewValue, "the new value has been added to the change");
        assert.equal(oChange.content.elementSelector.id, "Label0", "stableRenamedElementId has been added to the change");
        assert.ok(oChange.content.elementSelector.idIsLocal, "the id is a local one");
		assert.equal(oChangeWrapper.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oLabel0.getId(), "elementSelector is part of dependent selector");
	});

	QUnit.test('when calling completeChangeContent for FormContainer', function (assert) {
		var oChange = {
			selector : {
				id : "SimpleForm",
				idIsLocal : true
			},
			content : {
			}
		};

		var oChangeWrapper = new sap.ui.fl.Change(oChange);
		var oSpecificChangeInfo = {
			renamedElement :{
				id: this.oFormContainer.getId()
			},
			changeType: "renameTitle",
			value: this.sNewValue
		};

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);

		assert.equal(oChange.texts.formText.value, this.sNewValue, "the new value has been added to the change");
		assert.equal(oChange.content.elementSelector.id, "Title0", "stableRenamedElementId has been added to the change");
        assert.ok(oChange.content.elementSelector.idIsLocal, "the id is a local one");
		assert.equal(oChangeWrapper.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oTitle0.getId(), "elementSelector is part of dependent selector");
	});

	QUnit.test('when calling applyChange with an empty string as value', function (assert) {
		this.mPropertyBag.modifier = sap.ui.fl.changeHandler.JsControlTreeModifier;

		var oChangeWrapper = new sap.ui.fl.Change({
			selector: {
				id : "component---SimpleForm"
			},
			content : {
				elementSelector : {
					id :this.oLabel0.getId(),
					idIsLocal : false
				}
			},
			texts : {
				formText : {
					type : "XFLD",
					value : ""
				}
			}
		});

		assert.ok(this.oChangeHandler.applyChange(oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.equal(this.oFormElement.getLabel().getText(), "", "the label has changed");
	});

	QUnit.test('when calling completeChangeContent with an empty string as value', function (assert) {
		var oChange = {
			selector : {
				id : "SimpleForm",
				idIsLocal : true
			},
			content : {
			}
		};
		var oChangeWrapper = new sap.ui.fl.Change(oChange);

		var oSpecificChangeInfo = {
			renamedElement :{
				id: this.oFormContainer.getId()
			},
			changeType: "renameTitle",
			value: ""
		};

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);
		assert.equal(oChange.texts.formText.value, "", "the empty value has been copied to the change");

	});

	QUnit.test('when calling completeChangeContent with an undefined value', function (assert) {
		var oChange = {
			selector : {
				id : "SimpleForm",
				idIsLocal : true
			},
			content : {
			}
		};
		var oChangeWrapper = new sap.ui.fl.Change(oChange);

		var oSpecificChangeInfo = {
			renamedElement :{
				id: this.oFormContainer.getId()
			},
			changeType: "renameTitle",
			value: undefined
		};

		assert.throws(function() {
				this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.value attribute required"),
			"the undefined value raises an error message"
		);

	});

	QUnit.test('when calling completeChangeContent without renamedElementId', function (assert) {
		var oChange = {
			selector : {
				id : "SimpleForm",
				idIsLocal : true
			},
			content : {
			}
		};
		var oChangeWrapper = new sap.ui.fl.Change(oChange);

		var oSpecificChangeInfo = {
			changeType: "renameTitle",
			value: this.sNewValue
		};

		assert.throws(function() {
			this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.renamedElement attribute required"),
			"the undefined value raises an error message"
		);
	});

})();

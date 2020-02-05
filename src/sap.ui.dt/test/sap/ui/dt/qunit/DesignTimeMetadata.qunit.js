/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input"
],
function(
	jQuery,
	sinon,
	DesignTimeMetadata,
	SimpleForm,
	Title,
	Button,
	Label,
	Input
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that the DesignTimeMetadata is created for a fake control", {
		beforeEach: function() {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data: {
					testField : "testValue",
					domRef : "domRef",
					actions : {
						action1 : "firstChangeType",
						action2 : {
							changeType : "secondChangeType"
						},
						action3 : function(oElement) {
							return {changeType: oElement.name};
						}
					}
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
			this.oDesignTimeMetadata.destroy();
		}
	}, function() {
		QUnit.test("when the DesignTimeMetadata is initialized", function(assert) {
			assert.strictEqual(this.oDesignTimeMetadata.getData().testField, "testValue", "then the field is returned right");
			assert.strictEqual(this.oDesignTimeMetadata.getDomRef(), "domRef", "then the domRef is returned right");
			assert.strictEqual(this.oDesignTimeMetadata.isIgnored(), false, "then ignore property is returned right");
		});

		QUnit.test("when getAction is called...", function(assert) {
			assert.propEqual(this.oDesignTimeMetadata.getAction("action1"), {changeType : "firstChangeType"}, "...for string action, the string is returned");
			assert.propEqual(this.oDesignTimeMetadata.getAction("action2"), {changeType : "secondChangeType"}, "...for object action, the object is returned");
			assert.propEqual(this.oDesignTimeMetadata.getAction("action3", {name:"thirdChangeType"}), {changeType : "thirdChangeType"}, "...for function action, the correct string is returned");
		});

		QUnit.test("when getLibraryText is called", function(assert) {
			var oFakeElement = {
				getMetadata : sandbox.stub().returns({
					getLibraryName : sandbox.stub().returns("fakeLibrary")
				})
			};
			var oFakeLibBundle = {
				getText : sandbox.stub().returns("translated text"),
				hasText : sandbox.stub().returns(true)
			};
			sandbox.stub(sap.ui.getCore(), "getLibraryResourceBundle").returns(oFakeLibBundle);
			assert.equal(this.oDesignTimeMetadata.getLibraryText(oFakeElement, "I18N_KEY"), "translated text", "then you get the text from the resource bundle of the corresponding library");
		});

		QUnit.test("when getLibraryText is called and only the parent control has a text", function(assert) {
			var oFakeElement = {
				getMetadata : sandbox.stub().returns({
					getLibraryName : sandbox.stub().returns("dummyLib"),
					getParent : sandbox.stub().returns({
						getLibraryName : sandbox.stub().returns("fakeLibrary")
					})
				})
			};

			var oFakeLibBundle = {
				getText : sandbox.stub().returns("translated text"),
				hasText : sandbox.stub().withArgs("I18N_KEY").returns(true)
			};
			sandbox.stub(sap.ui.getCore(), "getLibraryResourceBundle").withArgs("fakeLibrary").returns(oFakeLibBundle);
			assert.equal(this.oDesignTimeMetadata.getLibraryText(oFakeElement, "I18N_KEY"), "translated text", "then you get the text from the resource bundle of the library from the parent");
		});

		QUnit.test("when ignore is false", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					ignore : false
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.isIgnored(), false, "then ignore property is returned right");
		});

		QUnit.test("when ignore is true", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					ignore : true
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.isIgnored(), true, "then ignore property is returned right");
		});

		QUnit.test("when ignore is a function returning false", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					ignore : function() {return false; }
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.isIgnored(), false, "then ignore property is returned right");
		});

		QUnit.test("when ignore is a function returning true", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					ignore : function() {return true; }
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.isIgnored(), true, "then ignore property is returned right");
		});

		QUnit.test("when 'getControllerExtensionTemplate' is called with a path specified", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					controllerExtensionTemplate: "foo"
				}
			});

			assert.equal(this.oDesignTimeMetadata.getControllerExtensionTemplate(), "foo", "the correct path is retrieved");
		});

		QUnit.test("when 'getControllerExtensionTemplate' is called without a path specified", function(assert) {
			assert.equal(this.oDesignTimeMetadata.getControllerExtensionTemplate(), undefined, "the correct path is retrieved");
		});

		QUnit.test("when markedAsNotAdaptable function is called on an action with 'not-adaptable' value", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions: "not-adaptable"
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.markedAsNotAdaptable(), true, "then the function returns 'true'");
		});

		QUnit.test("when markedAsNotAdaptable function is called on an action with 'null' value", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions: null
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.markedAsNotAdaptable(), false, "then the function returns 'false'");
		});

		QUnit.test("when markedAsNotAdaptable function is called on an action with with an action-object value", function(assert) {
			this.oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions: {
						rename : {
							domRef : function (oElement) {
								return oElement.getDomRef();
							}
						}
					}
				}
			});
			assert.strictEqual(this.oDesignTimeMetadata.markedAsNotAdaptable(), false, "then the function returns 'false'");
		});
	});

	QUnit.module("Given a dedicated rendered control and designtime metadata is created", {
		beforeEach: function() {
			this.oButton = new Button({
				text : "myButton"
			});

			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when getAssociatedDomRef is called on an action with domRef as a function", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : {
							domRef : function (oElement) {
								return oElement.getDomRef();
							}
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			assert.ok(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef), "then the domRef of the control is returned");
			assert.strictEqual(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef).get(0), this.oButton.getDomRef(), "then the value of domRef is correct");
		});

		QUnit.test("when getAssociatedDomRef is called on an action with domRef as a function and no element", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : {
							domRef : function (oElement) {
								return oElement.getDomRef();
							}
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			assert.notOk(oDesignTimeMetadata.getAssociatedDomRef(undefined, vDomRef), "then undefined is returned");
		});

		QUnit.test("when getAssociatedDomRef is called on an action with domRef as a string", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : {
							domRef : ".sapMBtnContent"
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			assert.ok(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef), "then the domRef of the control is returned");
			assert.strictEqual(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef).get(0).textContent, "myButton", "then the text of the button is correct");
		});

		QUnit.test("when getAssociatedDomRef is called on an action with domRef as undefined", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : {
							domRef : undefined
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			assert.strictEqual(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef), undefined, "then the domRef of the control is undefined ");
		});

		QUnit.test("when getAssociatedDomRef is called on an action with no domRef at all", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : {
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			assert.strictEqual(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef), undefined, "then the domRef of the control is undefined ");
		});

		QUnit.test("when getAssociatedDomRef is called on an action with an invalid/not available selector", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : {
							domRef: ""
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			assert.strictEqual(oDesignTimeMetadata.getAssociatedDomRef(this.oButton, vDomRef).length, 0, "then the domRef of the control is undefined ");
		});
	});

	QUnit.module("Given a dedicated rendered control and an AggregationDesignTimeMetadata is created for a control", {
		beforeEach: function() {
			this.oTitle0 = new Title({id : "Title0", text : "Title 0"});
			this.oLabel0 = new Label({id : "Label0", text : "Label 0"});
			this.oInput0 = new Input({id : "Input0"});

			this.oSimpleForm = new SimpleForm("form", {
				id: "SimpleForm",
				title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oSimpleForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSimpleForm.destroy();
		}
	}, function() {
		QUnit.test("when getAssociatedDomRef is called on an action with domRef as a function returning the actual domRef", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : function() {
							return {
								domRef : function (oElement) {
									return oElement.getDomRef();
								}
							};
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oSimpleForm).domRef;
			var oAssociatedDomRef = oDesignTimeMetadata.getAssociatedDomRef(this.oSimpleForm, vDomRef);
			assert.ok(oAssociatedDomRef, "then the domRef of the control is returned");
			assert.strictEqual(oAssociatedDomRef.get(0), this.oSimpleForm.getDomRef(), "then the domRef is correct");
		});

		QUnit.test("when getAssociatedDomRef is called on an action with domRef as a function returning ':sap-domRef'", function(assert) {
			var oDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						rename : function() {
							return {
								domRef : ":sap-domref"
							};
						}
					}
				}
			});

			var vDomRef = oDesignTimeMetadata.getAction("rename", this.oButton).domRef;
			var oAssociatedDomRef = oDesignTimeMetadata.getAssociatedDomRef(this.oSimpleForm, vDomRef);
			assert.ok(oAssociatedDomRef, "then the domRef of the content is returned");
			assert.strictEqual(oAssociatedDomRef.get(0), this.oSimpleForm.getDomRef(), "then the domRef is correct");
		});
	});

	QUnit.module("Given responsible element is requested", {
		beforeEach: function() {
			this.oDesignTimeMetadataWithResponsibleElement = new DesignTimeMetadata({
				data: {
					actions : {
						getResponsibleElement: function(oElement) {
							return oElement;
						}
					}
				}
			});

			this.oDesignTimeMetadataWithoutResponsibleElement = new DesignTimeMetadata({
				data: {
					actions : {}
				}
			});

			this.oDesignTimeMetadataWithoutActions = new DesignTimeMetadata({
				data: {}
			});
		}
	}, function() {
		QUnit.test("then getResponsibleElement is called", function(assert) {
			var oResponsibleElement = {type: "responsibleElement"};
			assert.deepEqual(this.oDesignTimeMetadataWithResponsibleElement.getResponsibleElement(oResponsibleElement), oResponsibleElement, "then the resposible element was returned correctly");
			assert.equal(this.oDesignTimeMetadataWithoutResponsibleElement.getResponsibleElement(oResponsibleElement), undefined);
			assert.equal(this.oDesignTimeMetadataWithoutActions.getResponsibleElement(oResponsibleElement), undefined);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
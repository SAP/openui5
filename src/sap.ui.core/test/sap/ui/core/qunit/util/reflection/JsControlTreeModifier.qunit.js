/* global QUnit*/

sap.ui.define([
	'sap/m/Button',
	'sap/m/Label',
	'sap/m/Page',
	'sap/m/QuickViewPage',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData",
	"sap/ui/base/Event",
	"sap/ui/thirdparty/sinon-4",
	"sap/f/DynamicPageTitle" //used implicitly
],
function(
	Button,
	Label,
	Page,
	QuickViewPage,
	XMLView,
	JsControlTreeModifier,
	StashedControlSupport,
	UIComponent,
	JSONModel,
	CustomData,
	Event,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Using the JsControlTreeModifier...", {
		beforeEach: function () {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});
			var oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<HBox id="hbox1">' +
					'<items>' +
						'<Button id="button1" text="Button1" />' +
						'<Button id="button2" text="Button2" />' +
						'<Button id="button3" text="Button3" />' +
						'<core:ExtensionPoint name="ExtensionPoint1">' +
							'<Label id="default-label1" text="Extension point label1 - default content" />' +
						'</core:ExtensionPoint>' +
						'<Label id="label1" text="TestLabel1" />' +
					'</items>' +
				'</HBox>' +
				'<Panel id="panel">' +
						'<core:ExtensionPoint name="ExtensionPoint2" />' +
						'<Label id="label2" text="TestLabel2" />' +
						'<core:ExtensionPoint name="ExtensionPoint3" />' +
				'</Panel>' +
				'<HBox id="hbox2">' +
					'<Button id="button4" text="Button4" />' +
					'<Button id="button5" text="Button5" />' +
					'<core:ExtensionPoint name="ExtensionPoint3" />' +
					'<Label id="label3" text="TestLabel3" />' +
				'</HBox>' +
			'</mvc:View>';
			return XMLView.create({id: "testapp---view", definition: oXmlString})
				.then(function(oXmlView) {
					this.oXmlView = oXmlView;
				}.bind(this));
		},

		afterEach: function () {
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("the constructor processes parameters", function (assert) {
			var sButtonText = "ButtonText";
			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText});
			assert.equal(this.oControl.getText(), sButtonText);
		});

		QUnit.test("the createControl is called asynchronously", function (assert) {
			var sButtonText = "ButtonText";
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText}, true)
				.then(function(oButton) {
					this.oControl = oButton;
					assert.equal(oButton.getText(), sButtonText);
				}.bind(this));
		});

		QUnit.test("the createControl is called asynchronously, expecting an error after loading", function (assert) {
			var sButtonText = "ButtonText";
			sandbox.stub(sap.ui, "require").callThrough().withArgs(["sap/m/Button"]).callsArgWithAsync(2);
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText}, true)
				.then(function() {
					assert.notOk(true, "then the promise shouldn't be resolved");
				})
				.catch(function(oError) {
					assert.equal(oError.message,
						"Required control 'sap.m.Button' couldn't be created asynchronously",
						"then the promise is rejected with the expected message");
				});
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 1 - no overwritten methods in parent control", function (assert) {
			// arrange
			this.oControl = JsControlTreeModifier.createControl('sap.m.Page', this.oComponent, undefined, "myPage");

			for (var i = 0; i < 3; i++) {
				this["oButton" + i] = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + i, {'text' : 'ButtonText' + i});
				JsControlTreeModifier.insertAggregation(this.oControl, 'content', this["oButton" + i], i);
			}

			// assert
			assert.strictEqual(this.oControl.getContent().length, 3, "There are exactly 3 buttons inside of the page");
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton2), 2, "then the index of the most recently created button is found correctly");
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 2 - with overwritten methods in parent control", function (assert) {
			// arrange
			this.oControl = JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle");
			this.oButtonOutsideAggregation = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myActionNotUsed", {'text' : 'This is not used'});

			for (var i = 0; i < 3; i++) {
				this["oButton" + i] = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + i, {'text' : 'ButtonText' + i});
				JsControlTreeModifier.insertAggregation(this.oControl, 'actions', this["oButton" + i], i);
			}

			// assert
			assert.strictEqual(this.oControl.getActions().length, 3, "There are exactly 3 actions inside of the dynamic page title");
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton2), 2, "then the index of the most recently created button is found correctly");
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButtonOutsideAggregation), -1, "The action is not in this aggregation and is not found.");

			this.oButtonOutsideAggregation.destroy();
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 3 - singular aggregation", function (assert) {
			// arrange
			this.oControl = JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle");
			this.oButton = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButtonInHeading", {'text' : 'ButtonInHeading'});

			JsControlTreeModifier.insertAggregation(this.oControl, 'heading', this.oButton);

			// assert
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton), 0, "then the index of the most recently created button is found correctly");
		});

		QUnit.test("the modifier is not invalidating controls for changes in custom data aggregation", function (assert) {
			var mData = {
				key : "key",
				value : "value"
			};
			this.oCustomData = JsControlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, undefined, undefined, mData);
			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton");
			var fnInvalidateSpy = sandbox.spy(this.oControl, "invalidate");

			JsControlTreeModifier.insertAggregation(this.oControl, 'customData', this.oCustomData);
			assert.deepEqual(this.oControl.data(), {
				"key": "value"
			}, "custom data is set");
			JsControlTreeModifier.removeAggregation(this.oControl, 'customData', this.oCustomData);
			assert.deepEqual(this.oControl.data(), {}, "custom data is removed");
			JsControlTreeModifier.insertAggregation(this.oControl, 'customData', this.oCustomData);
			JsControlTreeModifier.removeAllAggregation(this.oControl, 'customData');
			assert.deepEqual(this.oControl.data(), {}, "all custom data is removed");

			assert.strictEqual(fnInvalidateSpy.callCount, 0, "then the control is not invalidated (no rerendering needed)");
		});

		QUnit.test("bindAggregation - basic functionality", function (assert) {
			this.oControl = new Button();

			var oModel = new JSONModel();
			oModel.setData({
				customData: [{
					key: "foo",
					value: "bar"
				}]
			});

			var sModelName = "someModel";
			this.oControl.setModel(oModel, sModelName);

			JsControlTreeModifier.bindAggregation(this.oControl, "customData", {
				path: sModelName + ">/customData",
				template: new CustomData({
					key: {
						path: sModelName + ">key"
					},
					value: {
						path: sModelName + ">value"
					}
				})
			});

			assert.strictEqual(this.oControl.getCustomData()[0].getKey(), "foo");
			assert.strictEqual(this.oControl.getCustomData()[0].getValue(), "bar");

			oModel.destroy();
		});

		QUnit.test("unbindAggregation - basic functionality", function (assert) {
			this.oControl = new Button();

			var oModel = new JSONModel();
			oModel.setData({
				customData: [{
					key: "foo",
					value: "bar"
				}]
			});

			var sModelName = "someModel";
			this.oControl.setModel(oModel, sModelName);

			JsControlTreeModifier.bindAggregation(this.oControl, "customData", {
				path: sModelName + ">/customData",
				template: new CustomData({
					key: "{path: '" + sModelName + ">key'}",
					value: "{path: '" + sModelName + ">value'}"
				})
			});

			assert.strictEqual(this.oControl.getCustomData()[0].getKey(), "foo");
			assert.strictEqual(this.oControl.getCustomData()[0].getValue(), "bar");

			JsControlTreeModifier.unbindAggregation(this.oControl, "customData");

			assert.strictEqual(this.oControl.getCustomData().length, 0);

			oModel.destroy();
		});

		QUnit.test("when getExtensionPointInfo is called", function (assert) {
			var oExtensionPointInfo1 = JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint1", this.oXmlView);
			assert.equal(oExtensionPointInfo1.parent.getId(), "testapp---view--hbox1", "then the returned object contains the parent control");
			assert.equal(oExtensionPointInfo1.aggregationName, "items", "and the aggregation name");
			assert.equal(oExtensionPointInfo1.index, 3, "and the index");
			assert.ok(Array.isArray(oExtensionPointInfo1.defaultContent), "and the defaultContent is an Array");
			assert.equal(oExtensionPointInfo1.defaultContent.length, 1, "and the defaultContent contains one item");
			assert.equal(oExtensionPointInfo1.defaultContent[0].getId(), "testapp---view--default-label1", "and the default label is returned");

			var oExtensionPointInfo2 = JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint2", this.oXmlView);
			assert.equal(oExtensionPointInfo2.parent.getId(), "testapp---view--panel", "then the returned object contains the parent control");
			assert.equal(oExtensionPointInfo2.aggregationName, "content", "and the aggregation name");
			assert.equal(oExtensionPointInfo2.index, 0, "and the index");
			assert.ok(Array.isArray(oExtensionPointInfo2.defaultContent), "and the defaultContent is an Array");
			assert.equal(oExtensionPointInfo2.defaultContent.length, 0, "and the defaultContent is empty");
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which is not on the view", function (assert) {
			var oExtensionPointInfo = JsControlTreeModifier.getExtensionPointInfo("notAvailableExtensionPoint", this.oXmlView);
			assert.notOk(oExtensionPointInfo, "then nothing is returned");
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which exists multiple times on the view", function (assert) {
			var oExtensionPointInfo = JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint3", this.oXmlView);
			assert.notOk(oExtensionPointInfo, "then nothing is returned");
		});
	});

	QUnit.module("Given the JsControlTreeModifier...", {
		beforeEach: function () {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});
		},
		afterEach: function () {
			this.oComponent.destroy();
			if (this.oControl) {
				this.oControl.destroy();
			}
			sandbox.restore();
		}
	}, function () {

		QUnit.test("when the modifier retrieves the change handler module for a control with instance-specific change handler module", function(assert) {
			var sDummyModulePath = 'dummy/path/to/dummy/file.flexibility';

			var mCustomData = {
					'key' : 'sap-ui-custom-settings',
					'value' : {
						'sap.ui.fl' : {
							'flexibility' : sDummyModulePath
						}
					}
				};

			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
					{'text' : 'ButtonInHeading', 'customData' : mCustomData});

			var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);

			assert.equal(sChangeHandlerModulePath, sDummyModulePath, "then the correct module is returned");
		});

		QUnit.test("when the modifier tries to retrieve the change handler module for a control without instance-specific change handler module", function(assert) {
			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
					{'text' : 'ButtonInHeading'});

			var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);

			assert.equal(sChangeHandlerModulePath, undefined, "then 'undefined' is returned");
		});

		function _getDelegate(mCustomData) {
			this.oControl = JsControlTreeModifier.createControl("sap.m.Button", this.oComponent, undefined, "myButton", {
				text: "ButtonInHeading",
				customData : mCustomData
			});

			return JsControlTreeModifier.getFlexDelegate(this.oControl);
		}

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info for a control with delegate info", function(assert) {
			var mDummyDelegateInfo = {
				name: "dummy/path/to/dummy/file"
			};
			var mCustomData = {
				"key" : "sap-ui-custom-settings",
				"value" : {
					"sap.ui.fl" : {
						"delegate" : JSON.stringify(mDummyDelegateInfo)
					}
				}
			};
			var mDelegateInfo = _getDelegate.call(this, mCustomData);
			assert.deepEqual(mDelegateInfo, {
				name: mDummyDelegateInfo.name,
				payload: {}
			}, "then the correct delegate info is returned");
		});

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info for a control with an incorrect format", function(assert) {
			var mIncorrectDelegateInfo = {
				name: "dummy/path/to/dummy/file"
			};
			var mCustomData = {
				"key" : "sap-ui-custom-settings",
				"value" : {
					"sap.ui.fl" : {
						"delegate" : mIncorrectDelegateInfo
					}
				}
			};
			var mDelegateInfo = _getDelegate.call(this, mCustomData);
			assert.deepEqual(mDelegateInfo, undefined, "then an undefined value is returned");
		});

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info for a control with an broken format", function(assert) {
			var mCustomData = {
				"key" : "sap-ui-custom-settings",
				"value" : {
					"sap.ui.fl" : {
						"delegate" : "{ name : foo}" //missing quotation marks in json
					}
				}
			};
			var mDelegateInfo = _getDelegate.call(this, mCustomData);
			assert.deepEqual(mDelegateInfo, undefined, "then an undefined value is returned");
		});

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info for a control, with no custom data", function(assert) {
			var mDelegateInfo = _getDelegate.call(this, undefined);
			assert.deepEqual(mDelegateInfo, undefined, "then an undefined value is returned");
		});

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info without control", function(assert) {
			var mDelegateInfo = JsControlTreeModifier.getFlexDelegate(undefined);
			assert.strictEqual(mDelegateInfo, undefined, "then an undefined value is returned");
		});

		QUnit.test("applySettings", function(assert) {
			this.oControl = new Button();

			JsControlTreeModifier.applySettings(this.oControl, { text: "Test", enabled: false});

			assert.equal(JsControlTreeModifier.getProperty(this.oControl, "enabled"), false, "the button is not enabled from applySettings");
			assert.equal(JsControlTreeModifier.getProperty(this.oControl, "text"), "Test", "the buttons text is set from applySettings");
		});

		QUnit.test("isPropertyInitial", function(assert) {
			this.oControl = new Button( { text: "Test"  });
			assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "enabled"), true, "the enabled property of the button is initial");
			assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "text"), false, "the text property of the button is not initial");
		});

		QUnit.test("when getStashed is called for non-stash control with visible property true", function(assert) {
			this.oControl = new Button({ text: "Test"  });
			this.oControl.getStashed = function () { };
			var fnGetVisibleSpy = sandbox.spy(this.oControl, "getVisible");
			assert.strictEqual(JsControlTreeModifier.getStashed(this.oControl), false, "then false is returned");
			assert.ok(fnGetVisibleSpy.calledOnce, "then getVisible is called once");
		});

		QUnit.test("when getStashed is called for a stashed control", function(assert) {
			this.oControl = new Button({ text: "Test"  });
			this.oControl.getStashed = function () {
				return true;
			};
			var fnGetVisibleSpy = sandbox.spy(this.oControl, "getVisible");
			assert.strictEqual(JsControlTreeModifier.getStashed(this.oControl), true, "then true is returned");
			assert.strictEqual(fnGetVisibleSpy.callCount, 0, "then getVisible is not called");
		});

		QUnit.test("when setStashed is called for an already unstashed control", function(assert) {
			this.oControl = new Button({ text: "Test"  });
			this.oControl.getStashed = function () { };
			this.oControl.setStashed = function () {
				assert.ok(false, "then setStashed() should not be called on a non-stash control");
			};
			var fnSetVisibleSpy = sandbox.spy(JsControlTreeModifier, "setVisible");
			JsControlTreeModifier.setStashed(this.oControl, true);

			assert.ok(fnSetVisibleSpy.calledOnce, "then modifier's setVisible() is called once");
			assert.ok(fnSetVisibleSpy.calledWith(this.oControl, false), "then modifier's setVisible() is called with the correct arguments");
			assert.strictEqual(this.oControl.getVisible(), false, "then visible property of control is set to false");
		});

		QUnit.test("when setStashed is called for stash control and no new control is created", function(assert) {
			var done = assert.async();
			this.oControl = new Page("pageId");
			var oStashedControl = StashedControlSupport.createStashedControl("stashedControlId", { sParentId: "pageId" });

			sandbox.stub(JsControlTreeModifier, "setVisible");
			sandbox.stub(oStashedControl, "setStashed").callsFake(function (bValue) {
				assert.ok(!bValue, "then setStashed() called on control");
				done();
			});
			JsControlTreeModifier.setStashed(oStashedControl, false);
			assert.strictEqual(JsControlTreeModifier.setVisible.callCount, 0, "then JsControlTreeModifier setVisible() not called");
			oStashedControl.destroy();
		});

		QUnit.test("when setStashed is called for stash control and a new control is created", function(assert) {
			this.oControl = new Page("pageId");
			var oStashedControl = StashedControlSupport.createStashedControl("stashedControlId", { sParentId: "pageId" });

			sandbox.stub(JsControlTreeModifier, "setVisible");

			sandbox.stub(oStashedControl, "setStashed").callsFake(function (bValue) {
				oStashedControl.destroy();
				// new control replaces stashed control
				new Button("stashedControlId");
				assert.ok(!bValue, "then setStashed() called on control");
			});

			var oUnstashedControl = JsControlTreeModifier.setStashed(oStashedControl, false, new UIComponent("mockComponent"));
			assert.ok(oUnstashedControl instanceof Button, "then the returned control is the unstashed control");
			assert.ok(JsControlTreeModifier.setVisible.calledWith(oUnstashedControl, true), "then JsControlTreeModifier setVisible() called for the unstashed control");
			oUnstashedControl.destroy();
		});

		QUnit.test("when getProperty is called for a property of type object", function(assert) {
			this.oControl = new QuickViewPage();
			var oSomeObject = new Button();
			this.oControl.addDependent(oSomeObject); //for later cleanup

			var mData = { key : "value"};
			JsControlTreeModifier.setProperty(this.oControl, "crossAppNavCallback", mData);
			assert.deepEqual(this.oControl.getCrossAppNavCallback(), mData, "then serializable data (plain object) can be passed");

			var aData = [mData];
			JsControlTreeModifier.setProperty(this.oControl, "crossAppNavCallback", aData);
			assert.deepEqual(this.oControl.getCrossAppNavCallback(), aData, "then serializable data (array) can be passed");

			assert.throws(function() {
				JsControlTreeModifier.setProperty(this.oControl, "crossAppNavCallback", oSomeObject);
			},
			/TypeError/,
			"then passing non JSON data will throw a message");

		});

		QUnit.test("when modifying association", function(assert) {
			var sID = "SOME_ID";
			this.oControl = new Label();
			var oSomeObject = new Button(sID);
			this.oControl.addDependent(oSomeObject); //for later cleanup

			JsControlTreeModifier.setAssociation(this.oControl, "labelFor", oSomeObject);
			assert.strictEqual(JsControlTreeModifier.getAssociation(this.oControl, "labelFor"), sID, "then association got set");

		});

		QUnit.test("when destroy modifier function is called", function (assert) {
			this.oControl = new Button("test-id");
			var oDestroySpy = sandbox.spy(this.oControl, "destroy");
			JsControlTreeModifier.destroy(this.oControl, true);
			assert.strictEqual(oDestroySpy.getCall(0).args[0], true, "then the destroy function of the button is called in the modifier including the bSuppressInvalidate parameter");
		});
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});
			this.oButton = new Button();

			this.oSpy1 = sandbox.spy();
			window.$sap__qunit_presshandler1 = this.oSpy1;

			this.oSpy2 = sandbox.spy();
			window.$sap__qunit_presshandler2 = this.oSpy2;
		},
		afterEach: function () {
			this.oComponent.destroy();
			this.oButton.destroy();
			delete window.$sap__qunit_presshandler1;
			delete window.$sap__qunit_presshandler2;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("attachEvent() — basic case", function (assert) {
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param0", "param1", { foo: "bar" }]);
			this.oButton.firePress();
			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param0", "param1", { foo: "bar" }]).callCount, 1);
		});

		QUnit.test("attachEvent() — two different event handlers with different set of parameters for the same event name", function (assert) {
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param0", "param1"]);
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler2", ["param2", "param3"]);

			this.oButton.firePress();

			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param0", "param1"]).callCount, 1);
			assert.strictEqual(this.oSpy2.callCount, 1);
			assert.strictEqual(this.oSpy2.withArgs(sinon.match.instanceOf(Event), ["param2", "param3"]).callCount, 1);
		});

		QUnit.test("attachEvent() — attempt to attach non-existent function", function (assert) {
			assert.throws(
				function () {
					JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_non_existent_handler");
				}.bind(this),
				/function is not found/
			);
		});

		QUnit.test("attachEvent() — two equal event handler functions with a different set of parameters", function (assert) {
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param0", "param1"]);
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param2", "param3"]);

			this.oButton.firePress();

			assert.strictEqual(this.oSpy1.callCount, 2);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param0", "param1"]).callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param2", "param3"]).callCount, 1);
		});

		QUnit.test("detachEvent() — basic case", function (assert) {
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1");
			JsControlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_presshandler1");

			this.oButton.firePress();

			assert.strictEqual(this.oSpy1.callCount, 0);
		});

		QUnit.test("detachEvent() — three event handlers, two of them are with a different set of parameters", function (assert) {
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1");
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler2", ["param0", "param1"]);
			JsControlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler2", ["param2", "param3"]);
			JsControlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_presshandler2");

			this.oButton.firePress();

			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy2.callCount, 1);
			assert.strictEqual(this.oSpy2.withArgs(sinon.match.instanceOf(Event), ["param2", "param3"]).callCount, 1);
		});

		QUnit.test("detachEvent() — attempt to detach non-existent function", function (assert) {
			assert.throws(
				function () {
					JsControlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_non_existent_handler");
				}.bind(this),
				/function is not found/
			);
		});
	});
});

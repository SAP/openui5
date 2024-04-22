/* global QUnit*/

sap.ui.define([
	"sap/base/future",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/DynamicDateRange",
	"sap/ui/base/Event",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/ui/core/CustomData",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"sap/f/DynamicPageTitle" //used implicitly
], function(
	future,
	Button,
	Label,
	DynamicDateRange,
	Event,
	XMLView,
	JsControlTreeModifier,
	Component,
	Control,
	CustomData,
	StashedControlSupport,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	StashedControlSupport.mixInto(Button);

	QUnit.module("Using the JsControlTreeModifier...", {
		beforeEach: function () {
			var oXmlString =
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
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

			return Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				return XMLView.create({
					id: "testapp---view",
					definition: oXmlString
				});
			}.bind(this)).then(function(oXmlView) {
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
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText})
				.then(function (oControl) {
					this.oControl = oControl;
					assert.equal(this.oControl.getText(), sButtonText);
				}.bind(this));
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
			sandbox.stub(sap.ui, "require").callThrough()
				.withArgs("sap/m/Button").returns(undefined)
				.withArgs(["sap/m/Button"]).callsArgWithAsync(2);
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText}, true)
				.then(function() {
					assert.notOk(true, "then the promise shouldn't be resolved");
				})
				.catch(function(oError) {
					assert.equal(oError.message,
						"Required control 'sap/m/Button' couldn't be created asynchronously",
						"then the promise is rejected with the expected message");
				});
		});

		QUnit.test("the createControl is called and expected control is already loaded", function(assert) {
			var oCalledSyncStub = sinon.stub().returns(Button);
			var oCalledAsyncStub = sinon.stub();
			sandbox.stub(sap.ui, "require").callThrough()
				.withArgs("sap/m/Button").callsFake(oCalledSyncStub)
				.withArgs(["sap/m/Button"]).callsFake(oCalledAsyncStub);
				return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : "ButtonText"}, true)
					.then(function(createdControl) {
						assert.ok(createdControl.isA("sap.m.Button"), "then the button returned");
						assert.strictEqual(oCalledAsyncStub.callCount, 0, "then the async require function is not called");
						createdControl.destroy();
					});
		});

		QUnit.test("the createControl is called and expected control is not loaded yet", function(assert) {
			var oCalledSyncStub = sinon.stub();
			var oCalledAsyncStub = sinon.stub();
			sandbox.stub(sap.ui, "require").callThrough()
				.withArgs("sap/m/Button").callsFake(oCalledSyncStub)
				.withArgs(["sap/m/Button"]).callsFake(oCalledAsyncStub).callsArgWithAsync(1, Button);
				return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : "ButtonText"}, true)
					.then(function(createdControl) {
						assert.ok(createdControl.isA("sap.m.Button"), "then the button returned");
						assert.strictEqual(oCalledSyncStub.callCount, 1, "then the sync require function is called");
						assert.strictEqual(oCalledAsyncStub.callCount, 1, "then the async require function is called");
						createdControl.destroy();
					});
		});

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 1 - no overwritten methods in parent control (future=false)", function (assert) {
			future.active = false;
			// arrange
			var aButtons = [];
			return JsControlTreeModifier.createControl('sap.m.Page', this.oComponent, undefined, "myPage")
				.then(function (oControl) {
					this.oControl = oControl;
					var aPromises = [];
					[1, 2, 3].forEach(function (iIndex) {
						aPromises.push(JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + iIndex, {'text' : 'ButtonText' + iIndex})
							.then(function (oButton) {
								aButtons.push(oButton);
								return JsControlTreeModifier.insertAggregation(this.oControl, 'content', oButton, iIndex);
							}.bind(this)));
					}.bind(this));
					return Promise.all(aPromises);
				}.bind(this))
				.then(function () {
					// assert
					assert.strictEqual(this.oControl.getContent().length, 3, "There are exactly 3 buttons inside of the page");
					return JsControlTreeModifier.findIndexInParentAggregation(aButtons[2]);
				}.bind(this))
				.then(function (iIndex) {
					assert.strictEqual(iIndex, 2, "then the index of the most recently created button is found correctly");
					future.active = undefined;
				});
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 1 - no overwritten methods in parent control (future=true)", function (assert) {
			future.active = true;
			// arrange
			var aButtons = [];
			return JsControlTreeModifier.createControl('sap.m.Page', this.oComponent, undefined, "myPage")
				.then(function (oControl) {
					this.oControl = oControl;
					var aPromises = [];
					[0, 1, 2].forEach(function (iIndex) {
						aPromises.push(JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + iIndex, {'text' : 'ButtonText' + iIndex})
							.then(function (oButton) {
								aButtons.push(oButton);
								return JsControlTreeModifier.insertAggregation(this.oControl, 'content', oButton, iIndex);
							}.bind(this)));
					}.bind(this));
					return Promise.all(aPromises);
				}.bind(this))
				.then(function () {
					// assert
					assert.strictEqual(this.oControl.getContent().length, 3, "There are exactly 3 buttons inside of the page");
					return JsControlTreeModifier.findIndexInParentAggregation(aButtons[2]);
				}.bind(this))
				.then(function (iIndex) {
					assert.strictEqual(iIndex, 2, "then the index of the most recently created button is found correctly");
					future.active = undefined;
				});
		});

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 2 - with overwritten methods in parent control (future=false)", function (assert) {
			future.active = false;
			// arrange
			var aButtons = [];
			return Promise.all([
				JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle"),
				JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myActionNotUsed", {'text' : 'This is not used'})
			]).then(function (aControls) {
				this.oControl = aControls[0];
				this.oButtonOutsideAggregation = aControls[1];
				var aPromises = [1, 2, 3].map(function (iIndex) {
					return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + iIndex, {'text' : 'ButtonText' + iIndex})
						.then(function (oButton) {
							aButtons.push(oButton);
							return JsControlTreeModifier.insertAggregation(this.oControl, 'actions', oButton, iIndex);
						}.bind(this));
				}.bind(this));
				return Promise.all(aPromises);
			}.bind(this))
			.then(function () {
				// assert
				assert.strictEqual(this.oControl.getActions().length, 3, "There are exactly 3 actions inside of the dynamic page title");
				return JsControlTreeModifier.findIndexInParentAggregation(aButtons[2]);
			}.bind(this))
			.then(function (iIndexInParentAggregation) {
				assert.strictEqual(iIndexInParentAggregation, 2, "then the index of the most recently created button is found correctly");
				return JsControlTreeModifier.findIndexInParentAggregation(this.oButtonOutsideAggregation);
			}.bind(this))
			.then(function (iIndexInParentAggregation) {
				assert.strictEqual(iIndexInParentAggregation, -1, "The action is not in this aggregation and is not found.");
				this.oButtonOutsideAggregation.destroy();
				future.active = undefined;
			}.bind(this));

		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 2 - with overwritten methods in parent control (future=true)", function (assert) {
			future.active = true;
			// arrange
			var aButtons = [];
			return Promise.all([
				JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle"),
				JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myActionNotUsed", {'text' : 'This is not used'})
			]).then(function (aControls) {
				this.oControl = aControls[0];
				this.oButtonOutsideAggregation = aControls[1];
				var aPromises = [0, 1, 2].map(function (iIndex) {
					return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + iIndex, {'text' : 'ButtonText' + iIndex})
						.then(function (oButton) {
							aButtons.push(oButton);
							return JsControlTreeModifier.insertAggregation(this.oControl, 'actions', oButton, iIndex);
						}.bind(this));
				}.bind(this));
				return Promise.all(aPromises);
			}.bind(this))
			.then(function () {
				// assert
				assert.strictEqual(this.oControl.getActions().length, 3, "There are exactly 3 actions inside of the dynamic page title");
				return JsControlTreeModifier.findIndexInParentAggregation(aButtons[2]);
			}.bind(this))
			.then(function (iIndexInParentAggregation) {
				assert.strictEqual(iIndexInParentAggregation, 2, "then the index of the most recently created button is found correctly");
				return JsControlTreeModifier.findIndexInParentAggregation(this.oButtonOutsideAggregation);
			}.bind(this))
			.then(function (iIndexInParentAggregation) {
				assert.strictEqual(iIndexInParentAggregation, -1, "The action is not in this aggregation and is not found.");
				this.oButtonOutsideAggregation.destroy();
				future.active = undefined;
			}.bind(this));

		});
		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 3 - singular aggregation", function (assert) {
			// arrange
			return Promise.all([
				JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle"),
				JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButtonInHeading", {'text' : 'ButtonInHeading'})
			]).then(function (aControls) {
				this.oControl = aControls[0];
				this.oButton = aControls[1];
				return JsControlTreeModifier.insertAggregation(this.oControl, 'heading', this.oButton);
			}.bind(this))
			.then(function () {
				return JsControlTreeModifier.findIndexInParentAggregation(this.oButton);
			}.bind(this))
			.then(function (iIndexInParentAggregation) {
				// assert
				assert.strictEqual(iIndexInParentAggregation, 0, "then the index of the most recently created button is found correctly");
			});
		});

		QUnit.test("moveAggregation in the same aggregation of the parent control", async function(assert) {
			const oHBox = this.oXmlView.byId("hbox1");
			const oMovedButton = this.oXmlView.byId("button1");
			await JsControlTreeModifier.moveAggregation(oHBox, "items", oHBox, "items", oMovedButton, 2);
			const oContentAggregation = await JsControlTreeModifier.getAggregation(oHBox, "items");
			assert.strictEqual(oContentAggregation[2], oMovedButton);
		});

		QUnit.test("moveAggregation between different controls", async function(assert) {
			const oSourceHBox = this.oXmlView.byId("hbox1");
			const oTargetHBox = this.oXmlView.byId("hbox2");
			const oMovedButton = this.oXmlView.byId("button1");
			await JsControlTreeModifier.moveAggregation(oSourceHBox, "items", oTargetHBox, "items", oMovedButton, 1);
			const oContentAggregation = await JsControlTreeModifier.getAggregation(oTargetHBox, "items");
			assert.strictEqual(oContentAggregation[1], oMovedButton);
		});

		QUnit.test("replaceAllAggregation", async function(assert) {
			const oHBox = this.oXmlView.byId("hbox1");
			const aNewControls = [
				new Button("button4"),
				new Button("button5"),
				new Button("button6")
			];
			const aOldControls = oHBox.getItems();
			await JsControlTreeModifier.replaceAllAggregation(oHBox, "items", aNewControls);
			const aItems = oHBox.getItems();
			assert.strictEqual(aItems.length, 3, "the aggregation has 3 items");
			assert.strictEqual(aItems[0].getId(), "button4", "the items are the new ones");
			assert.strictEqual(aItems[1].getId(), "button5", "the items are the new ones");
			assert.strictEqual(aItems[2].getId(), "button6", "the items are the new ones");

			aOldControls.forEach((oControl) => {
				oControl.destroy();
			});
		});

		QUnit.test("createAndAddCustomData adds Custom Data properly", function(assert) {
			var oCreateStub = sandbox.stub(JsControlTreeModifier, "createControl").resolves("foo");
			var oSetPropertyStub = sandbox.stub(JsControlTreeModifier, "setProperty");
			var oInsertAggregationStub = sandbox.stub(JsControlTreeModifier, "insertAggregation");
			return JsControlTreeModifier.createAndAddCustomData(this.oControl, "myKey", "myValue", this.oComponent)
				.then(function (oCustomData) {
					assert.equal(oCreateStub.lastCall.args[0], "sap.ui.core.CustomData", "the type is passed");
					assert.equal(oCreateStub.lastCall.args[1], this.oComponent, "the component is passed");

					assert.equal(oSetPropertyStub.callCount, 2, "two properties were set");
					assert.equal(oSetPropertyStub.getCall(0).args[1], "key", "the key is set");
					assert.equal(oSetPropertyStub.getCall(0).args[2], "myKey", "the key is set");
					assert.equal(oSetPropertyStub.getCall(1).args[1], "value", "the value is set");
					assert.equal(oSetPropertyStub.getCall(1).args[2], "myValue", "the value is set");

					assert.equal(oInsertAggregationStub.lastCall.args[0], this.oControl, "the control is passed");
					assert.equal(oInsertAggregationStub.lastCall.args[1], "customData", "the aggregation name is passed");
					assert.equal(oInsertAggregationStub.lastCall.args[2], "foo", "the new custom data control is passed");
					assert.equal(oInsertAggregationStub.lastCall.args[3], 0, "the index is passed");
				}.bind(this));
		});

		QUnit.test("createAndAddCustomData / getCustomDataInfo", function(assert) {
			this.oControl = new Control();
			return JsControlTreeModifier.createAndAddCustomData(this.oControl, "myKey", "myValue", this.oComponent).then(function() {
				var oCustomData = JsControlTreeModifier.getCustomDataInfo(this.oControl, "myKey");
				assert.ok(oCustomData.customData, "the custom data is returned");
				assert.strictEqual(oCustomData.customDataValue, "myValue", "the custom data value is returned");
			}.bind(this));
		});

		QUnit.test("the modifier is not invalidating controls for changes in custom data aggregation", function (assert) {
			var mData = {
				key : "key",
				value : "value"
			};
			var fnInvalidateSpy;
			return Promise.all([
				JsControlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, undefined, undefined, mData),
				JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton")
			]).then(function (aControls) {
				this.oCustomData = aControls[0];
				this.oControl = aControls[1];
				fnInvalidateSpy = sandbox.spy(this.oControl, "invalidate");
				return JsControlTreeModifier.insertAggregation(this.oControl, 'customData', this.oCustomData);
			}.bind(this))
			.then(function () {
				assert.deepEqual(this.oControl.data(), {
					"key": "value"
				}, "custom data is set");
				return JsControlTreeModifier.removeAggregation(this.oControl, 'customData', this.oCustomData);
			}.bind(this))
			.then(function () {
				assert.deepEqual(this.oControl.data(), {}, "custom data is removed");
				return JsControlTreeModifier.insertAggregation(this.oControl, 'customData', this.oCustomData);
			}.bind(this))
			.then(function () {
				return JsControlTreeModifier.removeAllAggregation(this.oControl, 'customData');
			}.bind(this))
			.then(function () {
				assert.deepEqual(this.oControl.data(), {}, "all custom data is removed");
				assert.strictEqual(fnInvalidateSpy.callCount, 0, "then the control is not invalidated (no rerendering needed)");
			}.bind(this));

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

			return JsControlTreeModifier.bindAggregation(this.oControl, "customData", {
				path: sModelName + ">/customData",
				template: new CustomData({
					key: {
						path: sModelName + ">key"
					},
					value: {
						path: sModelName + ">value"
					}
				})
			}).then(function () {
				assert.strictEqual(this.oControl.getCustomData()[0].getKey(), "foo");
				assert.strictEqual(this.oControl.getCustomData()[0].getValue(), "bar");
				oModel.destroy();
			}.bind(this));

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

			return JsControlTreeModifier.bindAggregation(this.oControl, "customData", {
				path: sModelName + ">/customData",
				template: new CustomData({
					key: "{path: '" + sModelName + ">key'}",
					value: "{path: '" + sModelName + ">value'}"
				})
			}).then(function () {
				assert.strictEqual(this.oControl.getCustomData()[0].getKey(), "foo");
				assert.strictEqual(this.oControl.getCustomData()[0].getValue(), "bar");
				return JsControlTreeModifier.unbindAggregation(this.oControl, "customData");
			}.bind(this))
			.then(function () {
				assert.strictEqual(this.oControl.getCustomData().length, 0);
				oModel.destroy();
			}.bind(this));
		});

		QUnit.test("when getExtensionPointInfo is called", function (assert) {
			return JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint1", this.oXmlView)
				.then(function (oExtensionPointInfo1) {
					assert.equal(oExtensionPointInfo1.parent.getId(), "testapp---view--hbox1", "then the returned object contains the parent control");
					assert.equal(oExtensionPointInfo1.aggregationName, "items", "and the aggregation name");
					assert.equal(oExtensionPointInfo1.index, 3, "and the index");
					assert.ok(Array.isArray(oExtensionPointInfo1.defaultContent), "and the defaultContent is an Array");
					assert.equal(oExtensionPointInfo1.defaultContent.length, 1, "and the defaultContent contains one item");
					assert.equal(oExtensionPointInfo1.defaultContent[0].getId(), "testapp---view--default-label1", "and the default label is returned");

					oExtensionPointInfo1.defaultContent[0].destroy();
					return JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint1", this.oXmlView);
				}.bind(this))
				.then(function (oExtensionPointInfo1) {
					assert.equal(oExtensionPointInfo1.defaultContent.length, 0, "and after destroy default content and call modifier again the defaultContent contains no items anymore");
					return JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint2", this.oXmlView);
				}.bind(this))
				.then(function (oExtensionPointInfo2){
					assert.equal(oExtensionPointInfo2.parent.getId(), "testapp---view--panel", "then the returned object contains the parent control");
					assert.equal(oExtensionPointInfo2.aggregationName, "content", "and the aggregation name");
					assert.equal(oExtensionPointInfo2.index, 0, "and the index");
					assert.ok(Array.isArray(oExtensionPointInfo2.defaultContent), "and the defaultContent is an Array");
					assert.equal(oExtensionPointInfo2.defaultContent.length, 0, "and the defaultContent is empty");
				});
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which is not on the view", function (assert) {
			return JsControlTreeModifier.getExtensionPointInfo("notAvailableExtensionPoint", this.oXmlView)
				.then(function (oExtensionPointInfo) {
					assert.notOk(oExtensionPointInfo, "then nothing is returned");
				});
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which exists multiple times on the view", function (assert) {
			return JsControlTreeModifier.getExtensionPointInfo("ExtensionPoint3", this.oXmlView)
				.then(function (oExtensionPointInfo) {
					assert.notOk(oExtensionPointInfo, "then nothing is returned");
				});
		});
	});

	QUnit.module("Given the JsControlTreeModifier...", {
		beforeEach: function () {
			return Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
			}.bind(this));
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

			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
					{'text' : 'ButtonInHeading', 'customData' : mCustomData})
				.then(function (oControl) {
					this.oControl = oControl;
					var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);
					assert.equal(sChangeHandlerModulePath, sDummyModulePath, "then the correct module is returned");
				}.bind(this));

		});

		QUnit.test("when the modifier tries to retrieve the change handler module for a control without instance-specific change handler module", function(assert) {
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
					{'text' : 'ButtonInHeading'})
				.then(function (oControl) {
					this.oControl = oControl;
					var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);
					assert.equal(sChangeHandlerModulePath, undefined, "then 'undefined' is returned");
				}.bind(this));
		});

		function _getDelegate(mCustomData) {
			return JsControlTreeModifier.createControl("sap.m.Button", this.oComponent, undefined, "myButton", {
				text: "ButtonInHeading",
				customData : mCustomData
			}).then(function (oControl) {
				this.oControl = oControl;
				return JsControlTreeModifier.getFlexDelegate(this.oControl);
			}.bind(this));
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
			return _getDelegate.call(this, mCustomData)
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo, {
						name: mDummyDelegateInfo.name,
						payload: {}
					}, "then the correct delegate info is returned");
				});
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
			return _getDelegate.call(this, mCustomData)
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo, undefined, "then an undefined value is returned");
				});
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
			return _getDelegate.call(this, mCustomData)
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo, undefined, "then an undefined value is returned");
				});
		});

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info for a control, with no custom data", function(assert) {
			return _getDelegate.call(this, undefined)
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo, undefined, "then an undefined value is returned");
				});
		});

		QUnit.test("when getFlexDelegate() is called to retrieve the delegate info without control", function(assert) {
			var mDelegateInfo = JsControlTreeModifier.getFlexDelegate(undefined);
			assert.strictEqual(mDelegateInfo, undefined, "then an undefined value is returned");
		});

		QUnit.test("applySettings", function(assert) {
			this.oControl = new Button();
			return JsControlTreeModifier.applySettings(this.oControl, { text: "Test", enabled: false})
				.then(function () {
					return JsControlTreeModifier.getProperty(this.oControl, "enabled");
				}.bind(this))
				.then(function (oProperty) {
					assert.equal(oProperty, false, "the button is not enabled from applySettings");
					return JsControlTreeModifier.getProperty(this.oControl, "text");
				}.bind(this))
				.then(function (oProperty) {
					assert.equal(oProperty, "Test", "the buttons text is set from applySettings");
				});
		});

		QUnit.test("isPropertyInitial", function(assert) {
			this.oControl = new Button( { text: "Test"  });
			assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "enabled"), true, "the enabled property of the button is initial");
			assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "text"), false, "the text property of the button is not initial");
		});

		QUnit.test("when getStashed is called for non-stash control", function(assert) {
			this.oControl = new Label({ text: "Test"  });
			return JsControlTreeModifier.getStashed(this.oControl)
				.catch(function (vError) {
					assert.strictEqual(vError.message, "Provided control instance has no isStashed method", "then the function thwors an error");
				});
		});

		QUnit.test("when getStashed is called for a stashed control", function(assert) {
			this.oControl = new Button({ text: "Test"  });
			this.oControl.isStashed = function () {
				return true;
			};
			var fnGetVisibleSpy = sandbox.spy(this.oControl, "getVisible");
			return JsControlTreeModifier.getStashed(this.oControl)
				.then(function (bIsStashed) {
					assert.strictEqual(fnGetVisibleSpy.callCount, 0, "then getVisible is not called");
					assert.strictEqual(bIsStashed, true, "then true is returned");
				});
		});

		QUnit.test("when setStashed is called for an already unstashed control", async function(assert) {
			this.oControl = new Button({ text: "Test"  });
			this.oControl.isStashed = function () { return false;};
			var fnSetVisibleSpy = sandbox.spy(JsControlTreeModifier, "setVisible");
			await JsControlTreeModifier.setStashed(this.oControl, true);

			assert.ok(fnSetVisibleSpy.calledOnce, "then modifier's setVisible() is called once");
			assert.ok(fnSetVisibleSpy.calledWith(this.oControl, false), "then modifier's setVisible() is called with the correct arguments");
			assert.strictEqual(this.oControl.getVisible(), false, "then visible property of control is set to false");
		});

		QUnit.test("when setStashed is called for stash control", function(assert) {
			var oXmlString =
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Panel id="panel">' +
					'<Button id="button1" text="button" stashed="true"></Button>' +
				'</Panel>' +
			'</mvc:View>';

			return XMLView.create({id: "testapp---view", definition: oXmlString}).then(async function(oXmlView) {
				this.oXmlView = oXmlView;
				var oStashedControl = this.oXmlView.byId("button1");

				sandbox.stub(JsControlTreeModifier, "setVisible");

				var oUnstashedControl = await JsControlTreeModifier.setStashed(oStashedControl, false);
				assert.ok(oUnstashedControl instanceof Button, "then the returned control is the unstashed control");
				assert.ok(JsControlTreeModifier.setVisible.calledWith(oUnstashedControl, true), "then JsControlTreeModifier setVisible() called for the unstashed control");

				this.oXmlView.destroy();
			}.bind(this));
		});

		QUnit.test("when getProperty is called for a property of type object", function(assert) {
			this.oControl = new DynamicDateRange();
			var oSomeObject = new Button();
			this.oControl.addDependent(oSomeObject); //for later cleanup

			var mData = { key : "value"};
			JsControlTreeModifier.setProperty(this.oControl, "value", mData);
			assert.deepEqual(this.oControl.getValue(), mData, "then serializable data (plain object) can be passed");

			var aData = [mData];
			JsControlTreeModifier.setProperty(this.oControl, "value", aData);
			assert.deepEqual(this.oControl.getValue(), aData, "then serializable data (array) can be passed");

			assert.throws(function() {
				JsControlTreeModifier.setProperty(this.oControl, "value", oSomeObject);
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

		QUnit.test("when templating a fragment", function(assert) {
			var REPLACED_TEXT = "is replaced as well";
			var mData = {
				foo: true,
				secondValue: REPLACED_TEXT
			};
			var oThis = new JSONModel(mData);
			var mPreprocessorSettings = {
				bindingContexts: {
					"this": oThis.createBindingContext("/")
				},
				models: {
					"this": oThis
				}
			};

			return JsControlTreeModifier.templateControlFragment(
				"sap.ui.test.other.fragment-withTemplating",
				mPreprocessorSettings,
				undefined
			).then(function(aControls) {
				assert.equal(aControls.length, 2, "the root controls are returned");
				assert.equal(aControls[0].getId(), "hbox", "the parent is returned");
				var oText = aControls[0].getItems()[0];
				assert.equal(oText.getId(), "inner", "the inner control is templated based on the model parameters");
				assert.equal(oText.getText(), REPLACED_TEXT, "the inner control's attributed is templated based on the model parameters");
				assert.equal(aControls[1].getId(), "otherRoot", "the parent is returned");
			});
		});
	});

	QUnit.module("Given the 'instantiateFragment' function is called...", {
		beforeEach: function () {
			this.sNamespace = 'fragment-id-prefix';
			var oXmlString = "<mvc:View xmlns:mvc='sap.ui.core.mvc'></mvc:View>";
			return XMLView.create({id: "testapp---view", definition: oXmlString})
				.then(function(oXmlView) {
					this.oXmlView = oXmlView;
				}.bind(this));
		},
		afterEach: function () {
			this.oXmlView.destroy();
		}
	}, function () {
		QUnit.test("when it is called with valid fragment including content", function (assert) {
			var sButtonId = "button1";
			var sFragment = "<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>"
				+ "<Button id='" + sButtonId + "' text='my button' />"
				+ "</core:FragmentDefinition>";
			return JsControlTreeModifier.instantiateFragment(sFragment, this.sNamespace, this.oXmlView)
				.then(function (aNewControls) {
					assert.strictEqual(aNewControls.length, 1, "then one control is created");
					assert.strictEqual(aNewControls[0].getId(),
						this.oXmlView.getId() + "--" + this.sNamespace + "." + sButtonId,
						"then the control inside fragment is created"
					);
				}.bind(this));
		});
		QUnit.test("when it is called with valid fragment without content", function (assert) {
			var sFragment = "<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'></core:FragmentDefinition>";
			return JsControlTreeModifier.instantiateFragment(sFragment, this.sNamespace, this.oXmlView)
				.then(function (aNewControls) {
					assert.strictEqual(aNewControls.length, 0, "then an empty array is returned");
				});
		});
		QUnit.test("when it is called with content inside fragment without stable id", function (assert) {
			var sFragment = "<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>"
				+ "<Button text='my button' />"
				+ "</core:FragmentDefinition>";
			return JsControlTreeModifier.instantiateFragment(sFragment, this.sNamespace, this.oXmlView)
				.catch(function (vError) {
					assert.ok(vError.message.indexOf("At least one control does not have a stable ID") > -1,
						"then an exception is thrown");
				});
		});
		QUnit.test("when it is called without fragment", function (assert) {
			return JsControlTreeModifier.instantiateFragment(undefined, this.sNamespace, this.oXmlView)
				.catch(function (vError) {
					assert.ok(!!vError.message, "then an exception is thrown");
				});
		});
		QUnit.test("when it is called without view", function (assert) {
			var sFragment = "<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'></core:FragmentDefinition>";
			return JsControlTreeModifier.instantiateFragment(sFragment, this.sNamespace, undefined)
				.catch(function (vError) {
					assert.ok(!!vError.message, "then an exception is thrown");
				});
		});
	});
});

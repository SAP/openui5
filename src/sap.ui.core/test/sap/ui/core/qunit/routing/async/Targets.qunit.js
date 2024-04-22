/*global QUnit, sinon */
sap.ui.define([
	"sap/base/future",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/routing/Targets",
	"sap/ui/core/routing/Views",
	"sap/ui/core/routing/Router",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"./AsyncViewModuleHook",
	"sap/m/App",
	"sap/m/Panel",
	"sap/ui/model/json/JSONModel"
], function(future, XMLView, Targets, Views, Router, Log, deepExtend, ModuleHook, App, Panel, JSONModel){
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	QUnit.module("Connect Targets with a router", {
		beforeEach: function() {
			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oTargets = new Targets({
				targets: {
					myTarget: {
						viewName: "myView"
					},
					myParent : {
						viewName: "myParentView"
					},
					myChild : {
						parent: "myParent",
						viewName: "myChildView"
					}
				},
				config: {
					async: true
				},
				views: this.oViews
			});
		},
		afterEach: function() {
			this.oTargets.destroy();
		}
	});

	QUnit.test("First call of setting router is accepted", function(assert) {
		var oRouter = new Router({}, {async: true}, null, {});
		this.oTargets._setRouter(oRouter);

		assert.strictEqual(this.oTargets._oRouter, oRouter, "The router is set into the Targets");
	});

	QUnit.test("Further call of setting router is ignored", function(assert) {
		var oRouter = new Router({}, {async: true}, null, {}),
			oRouter1 = new Router({}, {async: true}, null, {});

		this.oTargets._setRouter(oRouter);
		this.oTargets._setRouter(oRouter1);

		assert.strictEqual(this.oTargets._oRouter, oRouter, "The router is still the same one as before the second call");
	});

	QUnit.module("getTarget and target names", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oTargets = new Targets({
				targets: {
					myTarget: {
						viewName: "myView"
					},
					myParent : {
						viewName: "myParentView"
					},
					myChild : {
						parent: "myParent",
						viewName: "myChildView"
					}
				},
				config: {
					async: true
				},
				views: this.oViews
			});
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should be able to get an existing target by key", function (assert) {
		// Act
		var oTarget = this.oTargets.getTarget("myTarget");

		// Assert
		assert.strictEqual(oTarget._oRawOptions.viewName, "myView", "Did retrieve the correct Target");
		assert.strictEqual(oTarget._oOptions.name, "myView", "config is converted to the new format");
		assert.strictEqual(oTarget._oOptions.type, "View", "config is converted to the new format");
		assert.notOk(oTarget._oOptions.viewName, "config is converted to the new format");
		assert.strictEqual(oTarget._oCache, this.oViews, "Did pass the views instance");
	});

	QUnit.test("Should be able to get an existing target by key which is set in an object", function (assert) {
		// Act
		var oTarget = this.oTargets.getTarget({name: "myTarget"});

		// Assert
		assert.strictEqual(oTarget._oRawOptions.viewName, "myView", "Did retrieve the correct Target");
		assert.strictEqual(oTarget._oOptions.name, "myView", "config is converted to the new format");
		assert.strictEqual(oTarget._oOptions.type, "View", "config is converted to the new format");
		assert.notOk(oTarget._oOptions.viewName, "config is converted to the new format");
		assert.strictEqual(oTarget._oCache, this.oViews, "Did pass the views instance");
	});

	QUnit.test("Should return undefined if a target does not exist", function (assert) {
		// Act
		var oTarget = this.oTargets.getTarget("foo");

		// Assert
		assert.strictEqual(oTarget, undefined, "Did not find such a target");
	});

	QUnit.test("Should return undefined if the given target name is invalid (false, undefined)", function (assert) {
		// Act
		var oTarget = this.oTargets.getTarget(undefined);
		// Assert
		assert.strictEqual(oTarget, undefined, "Did not find such a target");

		oTarget = this.oTargets.getTarget(false);
		// Assert
		assert.strictEqual(oTarget, undefined, "Did not find such a target");

	});

	QUnit.test("Should be able to get a child target", function (assert) {
		// Act
		var oChild = this.oTargets.getTarget("myChild");

		// Assert
		assert.strictEqual(oChild._oRawOptions.viewName, "myChildView", "Did retrieve the correct Target");
		assert.strictEqual(oChild._oOptions.name, "myChildView", "config is converted to the new format");
		assert.strictEqual(oChild._oOptions.type, "View", "config is converted to the new format");
		assert.notOk(oChild._oOptions.viewName, "config is converted to the new format");
		assert.strictEqual(oChild._oParent, this.oTargets.getTarget("myParent"), "The parent was correctly passed to the target");
	});

	QUnit.test("Should be able to get multiple targets", function (assert) {
		// Arrange
		var oErrorSpy = this.spy(Log, "error");

		// Act
		var aTargets = this.oTargets.getTarget(["myTarget",  "foo", "myParent"]);

		// Assert
		assert.strictEqual(aTargets.length, 2, "Should return two targets");
		assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
		assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
		// check if error for non-existing target "foo" is thrown
		sinon.assert.calledWith(oErrorSpy, sinon.match(/"foo" does not exist/), sinon.match(this.oTargets));

		// Act
		aTargets = this.oTargets.getTarget([undefined, "myTarget", false, {name: "myParent"}, "foo", {name: "myTarget"}]);
		// Assert
		assert.strictEqual(aTargets.length, 3, "Should return three targets");
		assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
		assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
		assert.strictEqual(aTargets[2], this.oTargets.getTarget("myTarget"), "The third target should be myTarget");
	});

	QUnit.test("Should be able to add a new target", function (assert) {
		var oErrorSpy = this.spy(Log, "error");
		this.oTargets.addTarget("newTarget", {
			viewName: "newView",
			parent: "myParent"
		});

		assert.ok(oErrorSpy.notCalled, "no error is logged");

		var oTarget = this.oTargets.getTarget("newTarget");
		assert.ok(oTarget, "new target object is created");
		assert.strictEqual(oTarget._oOptions._name, "newTarget", "target name should be correct");
		assert.strictEqual(oTarget._oParent, this.oTargets.getTarget("myParent"), "correct parent should be set");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Should kept the existing target and log an error message if 'addTarget' is called with the same name (future=false)", function (assert) {
		future.active = false;
		// Arrange
		var oStub = this.stub(Log, "error");

		// Act
		this.oTargets.addTarget("myParent", {
			viewName: "myNewParentView"
		});
		var oParent = this.oTargets.getTarget("myParent");

		// Assert
		assert.strictEqual(oParent._oRawOptions.viewName, "myParentView", "options stay the same");
		assert.strictEqual(oParent._oOptions.name, "myParentView", "config is converted to the new format");
		assert.strictEqual(oParent._oOptions.type, "View", "config is converted to the new format");
		assert.notOk(oParent._oOptions.viewName, "config is converted to the new format");
		// Check whether the error message is thrown
		sinon.assert.calledWith(oStub, sinon.match(/myParent/), sinon.match(this.oTargets));
		future.active = undefined;
	});

	QUnit.test("Throw Error if 'addTarget' is called with the same name (future=true)", function (assert) {
		future.active = true;

		// Act
		assert.throws(() => {
			this.oTargets.addTarget("myParent", {
				viewName: "myNewParentView"
			});
		}, new Error("Target with name myParent already exists"), "");

		future.active = undefined;
	});

	QUnit.module("config - defaults and additional values", {
		beforeEach: function () {
			var oTargetConfig = {
				controlAggregation: "foo",
				someThingCustom: "bar",
				someThingToBeReplaced: "baz",
				async: true
			};
			// System under test + Arrange
			this.oTargets = new Targets({
				targets: {
					myView: {
						someThingToBeReplaced: "replaced",
						viewLevel: 5
					}
				},
				config: oTargetConfig
			});
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should be able to get an existing target if no key was specified - view should be the key", function (assert) {
		// Act
		var oOptions = this.oTargets.getTarget("myView")._oOptions;

		// Assert
		assert.strictEqual(oOptions.viewLevel, 5, "Did use the view level");
		assert.strictEqual(oOptions.controlAggregation, "foo", "Did pass one of the routing api values from the config");
		assert.strictEqual(oOptions.someThingToBeReplaced, "replaced", "Did overwrite ");
	});

	QUnit.test("Should propergate changes in the rootView to the targets", function (assert) {
		// Arrange
		this.oTargets._setRootViewId("changed");

		// Act
		var oOptions = this.oTargets.getTarget("myView")._oOptions;

		assert.strictEqual(oOptions.rootView, "changed", "Did pass one of the routing api values from the config");
	});

	QUnit.module("config - invalid parent");

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Should complain about an non existing parent (future=false)", function (assert) {
		future.active = false;
		// Arrange
		var oIncorrectConfig = {
			targets: {
				myChildWithoutParent: {
					parent: "foo"
				}
			}
		},
			oErrorStub = this.stub(Log, "error");

		// System under test + Act
		const oTargets = new Targets(oIncorrectConfig);

		// Assert
		sinon.assert.calledWith(oErrorStub, sinon.match(/was not found/), sinon.match(oTargets));

		oTargets.destroy();
		future.active = undefined;
	});

	QUnit.test("Should complain about an non existing parent (future=true)", function (assert) {
		future.active = true;
		// Arrange
		var oIncorrectConfig = {
				targets: {
					myChildWithoutParent: {
						parent:"foo"
					}
				}
			};

		// System under test + Act
		assert.throws(() => { this.oTargets = new Targets(oIncorrectConfig); },
			new Error("The target 'myChildWithoutParent' has a parent 'foo' defined, but it was not found in the other targets"), "Throws an error because parent doesn't exist.");

		future.active = undefined;
	});

	QUnit.module("display", {
		beforeEach: function () {
			// System under test + Arrange
			this.oTargets = new Targets({
				targets: {
					firstTarget: {
					},
					secondTarget: {
					}
				},
				config: {
					async: true
				}
			});
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should display one target", function (assert) {
		// Arrange
		var sName = "firstTarget";
		// Replace display with an empty fn
		var fnFirstDisplayStub = this.stub(this.oTargets.getTarget(sName), "_display").callsFake(function() {
			return Promise.resolve({name:sName});
		});
		var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "_display");

		// Act
		return this.oTargets.display("firstTarget").then(function(oViewInfo) {
			// Assert
			assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
			assert.strictEqual(fnSecondDisplayStub.callCount, 0, "Did not invoke display on the second target");
			assert.strictEqual(oViewInfo[0].name, sName, "Did resolve with the correct view info");
		});

	});

	QUnit.test("Should display multiple targets", function (assert) {
		// Arrange
		// Set the parentInfo to a non-undefined value because it will be set to undefined later and checked with undefined in an assertion
		var oParentInfo = {};
		// Replace display with an empty fn
		var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "_display").callsFake(function(vData, oSequencePromise) {
			return oSequencePromise.then(function() {
				return {
					name: "firstTarget",
					view: "firstView",
					control: "firstControl"
				};
			});
		});
		var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "_display").callsFake(function(vData, oSequencePromise) {
			return oSequencePromise.then(function(oInfo) {
				oParentInfo = oInfo;
				return {
					name: "secondTarget",
					view: "secondView",
					control: "secondControl"
				};
			});
		});

		// Act
		return this.oTargets.display(["firstTarget", "secondTarget"]).then(function(aViewInfos) {
			// Assert
			assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
			assert.strictEqual(fnSecondDisplayStub.callCount, 1, "Did invoke display on the second target");
			assert.ok(Array.isArray(aViewInfos), "Did resolve with an array of the view infos");
			assert.strictEqual(aViewInfos.length, 2, "Did resolve with two viewinfos");
			assert.strictEqual(aViewInfos[0].name, "firstTarget", "Did resolve with first target as first");
			assert.strictEqual(aViewInfos[1].name, "secondTarget", "Did resolve with second target as second");
			assert.strictEqual(oParentInfo, undefined, "No info should be passed among sibling targets being displayed");
		});

	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Should log an error if user tries to display a non existing Target (future=false)", function (assert) {
		future.active = false;
		// Assert
		var oErrorStub = this.stub(Log, "error");

		// Act
		return this.oTargets.display("foo").then(function(aViewInfos) {
			assert.strictEqual(aViewInfos[0].name, "foo", "Matching target info is returned");
			assert.ok(aViewInfos[0].error.includes("The target with the name \"foo\" does not exist!"), "Matching error message is returned");
			// Assert
			sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
			future.active = undefined;
		}.bind(this));
	});

	QUnit.test("Should throw an error if user tries to display a non existing Target (future=true)", function (assert) {
		future.active = true;
		assert.throws(() => { this.oTargets.display("foo"); }, new Error("The target with the name \"foo\" does not exist!"), "Promise rejects because target does not exist");
		future.active = undefined;
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Should log an error if user tries to display a non existing Target, but should display existing ones (future=false)", function (assert) {
		future.active = false;
		// Assert
		var oErrorStub = this.stub(Log, "error");
		// Replace display with an empty fn
		var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "_display").callsFake(function() {
			return Promise.resolve({name:"firstTarget"});
		});

		// Act
		return this.oTargets.display(["foo", "firstTarget"]).then(function(aViewInfos) {
			// Assert
			assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
			sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
			assert.ok(Array.isArray(aViewInfos), "Did resolve with an array of the view infos");
			assert.strictEqual(aViewInfos.length, 2, "Did resolve with two viewinfos");
			assert.strictEqual(aViewInfos[1].name, "firstTarget", "Did resolve with first target");
			assert.ok(aViewInfos[0].error.includes("The target with the name \"foo\" does not exist!"), "Did resolve with the error message of the erroneous target");
			future.active = undefined;
		}.bind(this));
	});

	function createView (aContent, sId) {
		var sXmlViewContent = aContent.join(''),
			oViewOptions = {
				id : sId,
				definition: sXmlViewContent
			};

		return XMLView.create(oViewOptions);
	}

	QUnit.module("display event", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();

			this.oDefaultConfig = {
				viewName: "foo",
				viewPath: "bar",
				controlAggregation: "content",
				viewType: "XML",
				controlId: this.oShell.getId(),
				async: true
			};

			this.oTargetsConfig = {
				myTarget: {
				},
				mySecondTarget: {
				},
				myChild: {
					parent : "myTarget"
				}
			};

			this.oViews = new Views({async: true});
			// System under test + Arrange
			this.oTargets = new Targets({
				targets: this.oTargetsConfig,
				views: this.oViews,
				config: this.oDefaultConfig
			});

			return createView([
				'<View xmlns="sap.ui.core.mvc">',
				'</View>'
			]).then(function(oView) {
				this.oView = oView;
			}.bind(this));
		},
		afterEach: function () {
			this.oShell.destroy();
			this.oTargets.destroy();
			this.oViews.destroy();
			this.oView.destroy();
		}
	});


	QUnit.test("should be able to fire/attach/detach the display event", function(assert) {
		// Arrange
		var oParameters = { foo : "bar" },
			oListener = {},
			oData = { some : "data" },
			fnEventSpy = this.spy(function(oEvent, oActualData) {
				assert.strictEqual(oActualData, oData, "the data is correct");
				assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
				assert.strictEqual(this, oListener, "the this pointer is correct");
			}),
			oFireReturnValue,
			oDetachReturnValue,
			oAttachReturnValue = this.oTargets.attachDisplay(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oTargets.fireDisplay(oParameters);
		oDetachReturnValue = this.oTargets.detachDisplay(fnEventSpy, oListener);
		this.oTargets.fireDisplay();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oTargets, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oTargets, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oTargets, "did return this for chaining for fire");
	});

	QUnit.test("Should fire the display event", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			oData = {some : "data"};

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		var oExtendedConfig = deepExtend({ _name: "myTarget" }, this.oTargetsConfig.myTarget, this.oDefaultConfig);

		this.oTargets.attachDisplay(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display("myTarget", oData);
		return oDisplayed.then(function(aViews) {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
			assert.strictEqual(oParameters.view, this.oView, "view got passed to the event");
			assert.strictEqual(oParameters.control, this.oShell, "control was the shell");
			assert.strictEqual(oParameters.data, oData, "data was passed");
			assert.strictEqual(oParameters.name, "myTarget", "name was passed");

			Object.keys(oExtendedConfig).forEach(function (sKey) {
				var vValue = oExtendedConfig[sKey];
				if (typeof vValue === "object") {
					assert.propEqual(oExtendedConfig[sKey], oParameters.config[sKey], sKey + "should be passed into the parameter");
				} else {
					assert.strictEqual(oExtendedConfig[sKey], oParameters.config[sKey], sKey + "should be passed into the parameter");
				}
			});
		}.bind(this));
	});

	QUnit.test("Should fire the display event for multiple targets and children", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				aTargetNames.push(oParameters.name);
				assert.propEqual(oParameters.config, that.oTargets.getTarget(oParameters.name)._oRawOptions, "configuration should have been merged");
				assert.strictEqual(oParameters.view, that.oView, "view got passed to the event");
				assert.strictEqual(oParameters.control, that.oShell, "control got passed to the event");
				assert.strictEqual(oParameters.data, oData, "data was passed");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachDisplay(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myChild", "mySecondTarget"], oData);

		return oDisplayed.then(function(aViews) {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 3, "the event got fired");
			assert.strictEqual(aTargetNames.shift(), "myTarget", "the parent got fired first");
			assert.strictEqual(aTargetNames.shift(), "myChild", "the child got fired after the parent");
			assert.strictEqual(aTargetNames.shift(), "mySecondTarget", "the second target got fired last");
		});
	});

	QUnit.module("Typed View", {
		beforeEach: function() {
			this.oShell = new ShellSubstitute();

			this.oTargetsConfig = {
				typedView: {
					type: "View",
					viewName: "module:test/routing/target/TypedView",
					controlId: this.oShell.getId(),
					controlAggregation: "content",
					id: "myView"
				}
			};

			this.oViews = new Views({async: true});
			// System under test + Arrange
			this.oTargets = new Targets({
				targets: this.oTargetsConfig,
				views: this.oViews,
				config: {
					async: true
				}
			});
		},
		afterEach: function() {
			this.oViews.destroy();
			this.oTargets.destroy();
			this.oShell.destroy();
		}
	});

	QUnit.test("Display Typed View", function(assert) {
		return this.oTargets.display("typedView").then(function(aDisplayed) {
			assert.equal(aDisplayed.length, 1, "One target is displayed");

			var oView = aDisplayed[0].view;
			assert.equal(oView.getId(), "myView", "View has the correct id set");

			var oPanel = oView.byId("myPanel");
			assert.ok(oPanel.isA("sap.m.Panel"), "The view's content is created");
		});
	});

	QUnit.module("suspend", {
		beforeEach: function () {
			// System under test + Arrange
			this.oTargets = new Targets({
				targets: {
					firstTarget: {
					},
					secondTarget: {
					},
					thirdTarget: {
					}
				},
				config: {
					async: true
				}
			});
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should suspend the specified target", function(assert) {
		var oTarget = this.oTargets.getTarget("firstTarget");
		var oSpy = this.spy(oTarget, "suspend");

		var oUnrelatedTarget = this.oTargets.getTarget("secondTarget");
		var oUnrelatedTargetSpy = this.spy(oUnrelatedTarget, "suspend");

		this.oTargets.suspend("firstTarget");

		assert.equal(oSpy.callCount, 1, "suspend is called on the target");
		assert.ok(oUnrelatedTargetSpy.notCalled, "suspend isn't called on the other target");
	});

	QUnit.test("Should suspend the specified targets", function(assert) {
		var oTarget1 = this.oTargets.getTarget("firstTarget");
		var oTarget1Spy = this.spy(oTarget1, "suspend");

		var oTarget2 = this.oTargets.getTarget("secondTarget");
		var oTarget2Spy = this.spy(oTarget2, "suspend");

		var oTarget3 = this.oTargets.getTarget("thirdTarget");
		var oTarget3Spy = this.spy(oTarget3, "suspend");

		this.oTargets.suspend(["firstTarget", "secondTarget"]);

		assert.equal(oTarget1Spy.callCount, 1, "suspend is called on the target");
		assert.equal(oTarget2Spy.callCount, 1, "suspend is called on the target");
		assert.ok(oTarget3Spy.notCalled, "suspend isn't called on the other target");
	});

	QUnit.test("Should suspend the specified targets with different type of parameter", function(assert) {
		var oTarget1 = this.oTargets.getTarget("firstTarget");
		var oTarget1Spy = this.spy(oTarget1, "suspend");

		var oTarget2 = this.oTargets.getTarget("secondTarget");
		var oTarget2Spy = this.spy(oTarget2, "suspend");

		var oTarget3 = this.oTargets.getTarget("thirdTarget");
		var oTarget3Spy = this.spy(oTarget3, "suspend");

		this.oTargets.suspend(["firstTarget", { name: "secondTarget" }]);

		assert.equal(oTarget1Spy.callCount, 1, "suspend is called on the target");
		assert.equal(oTarget2Spy.callCount, 1, "suspend is called on the target");
		assert.ok(oTarget3Spy.notCalled, "suspend isn't called on the other target");
	});

	QUnit.module("Component Target", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();

			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oTargets = new Targets({
				targets: {
					myTarget : {
						path: "test.routing.target",
						name: "routingConfig",
						controlAggregation: "content",
						controlId: this.oShell.getId(),
						type: "Component"
					}
				},
				config: {
					async: true
				},
				views: this.oViews
			});
			this.sandbox = sinon.sandbox.create();
		},
		afterEach: function () {
			this.oTargets.destroy();
			this.sandbox.restore();
		}
	});

	QUnit.test("Display a component target", function(assert) {
		var oTarget = this.oTargets.getTarget("myTarget"),
			oTargetDisplaySpy = this.sandbox.spy(oTarget, "_display"),
			oInitializeSpy = this.sandbox.spy(Router.prototype, "initialize");

		return this.oTargets.display("myTarget")
			.then(function() {
				assert.ok(oTargetDisplaySpy.calledOnce, "The target is displayed");

				var oComponentContainer = this.oShell.getContent()[0];
				assert.ok(oComponentContainer.isA("sap.ui.core.ComponentContainer"), "The parent target is added to the target control");

				var oRouter = oComponentContainer.getComponentInstance().getRouter();
				assert.equal(oInitializeSpy.callCount, 1, "router is initialized");

				var oCall = oInitializeSpy.getCall(0);
				assert.ok(oCall.calledOn(oRouter), "the initialize call is called on the correct router");
				assert.strictEqual(oCall.args[0], undefined, "initialize call is called with the correct parameter");
			}.bind(this))
			.then(function() {
				oTarget.suspend();

				return this.oTargets.display("myTarget");
			}.bind(this))
			.then(function() {
				var oComponentContainer = this.oShell.getContent()[0];
				assert.ok(oComponentContainer.isA("sap.ui.core.ComponentContainer"), "The parent target is added to the target control");

				var oRouter = oComponentContainer.getComponentInstance().getRouter();
				assert.equal(oInitializeSpy.callCount, 2, "router is initialized again");
				var oCall = oInitializeSpy.getCall(1);
				assert.ok(oCall.calledOn(oRouter), "the initialize call is called on the correct router");
				assert.strictEqual(oCall.args[0], undefined, "initialize call is called with the correct parameter");
			}.bind(this));
	});

	QUnit.test("Display a component target with ignoreInitialHash=true", function(assert) {
		var oTarget = this.oTargets.getTarget("myTarget"),
			oTargetDisplaySpy = this.sandbox.spy(oTarget, "_display"),
			oInitializeSpy = this.sandbox.spy(Router.prototype, "initialize");

		// act
		return this.oTargets.display("myTarget")
			.then(function() {
				assert.ok(oTargetDisplaySpy.calledOnce, "The target is displayed");

				var oComponentContainer = this.oShell.getContent()[0];
				assert.ok(oComponentContainer.isA("sap.ui.core.ComponentContainer"), "The parent target is added to the target control");

				var oRouter = oComponentContainer.getComponentInstance().getRouter();
				assert.equal(oInitializeSpy.callCount, 1, "router is initialized");

				var oCall = oInitializeSpy.getCall(0);
				assert.ok(oCall.calledOn(oRouter), "the initialize call is called on the correct router");
				assert.strictEqual(oCall.args[0], undefined, "initialize call is called with the correct parameter");
			}.bind(this))
			.then(function() {
				oTarget.suspend();

				return this.oTargets.display({
					name: "myTarget",
					ignoreInitialHash: true
				});
			}.bind(this))
			.then(function() {
				var oComponentContainer = this.oShell.getContent()[0];
				assert.ok(oComponentContainer.isA("sap.ui.core.ComponentContainer"), "The parent target is added to the target control");

				var oRouter = oComponentContainer.getComponentInstance().getRouter();
				assert.equal(oInitializeSpy.callCount, 2, "router is initialized again");
				var oCall = oInitializeSpy.getCall(1);
				assert.ok(oCall.calledOn(oRouter), "the initialize call is called on the correct router");
				assert.strictEqual(oCall.args[0], true, "initialize call is called with the correct parameter");
			}.bind(this));
	});

	QUnit.module("Component Targets parent/child", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();

			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oTargets = new Targets({
				targets: {
					myTarget: {
						path: "test.routing",
						name: "target",
						type: "Component",
						parent: "myParent",
						controlAggregation: "content",
						controlId: "panel",
						id: "baz",
						options: {
							manifest: false
						}
					},
					myParent : {
						path: "test.routing.target",
						name: "parent",
						controlAggregation: "content",
						controlId: this.oShell.getId(),
						type: "Component",
						id: "parent",
						options: {
							manifest: false
						}
					}
				},
				config: {
					async: true
				},
				views: this.oViews
			});
			this.sandbox = sinon.sandbox.create();
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Display a component target which has a parent set with another component target", function(assert) {
		var oTarget = this.oTargets.getTarget("myTarget"),
			oParentTarget = this.oTargets.getTarget("myParent"),
			oTargetDisplaySpy = this.sandbox.spy(oTarget, "_display"),
			oParentTargetDisplaySpy = this.sandbox.spy(oParentTarget, "_display");

		// act
		var pDisplay = this.oTargets.display("myTarget");

		return pDisplay.then(function() {
			assert.ok(oParentTargetDisplaySpy.calledOnce, "The parent target is displayed");
			assert.ok(oTargetDisplaySpy.calledOnce, "The target is displayed");

			var oParentComponentContainer = this.oShell.getContent()[0];
			assert.ok(oParentComponentContainer.isA("sap.ui.core.ComponentContainer"), "The parent target is added to the target control");

			var oParentView = oParentComponentContainer.getComponentInstance().getRootControl();
			assert.ok(oParentView.isA("sap.ui.core.mvc.View"), "The view from parent target is there");

			var oPanel = oParentView.byId("panel");
			assert.ok(oPanel.isA("sap.m.Panel"), "The target control for the child target can be found");

			var aPanelContent = oPanel.getContent();
			var oLastChildInPanel = aPanelContent[aPanelContent.length - 1];
			assert.ok(oLastChildInPanel.isA("sap.ui.core.ComponentContainer"), "The child target's component container is added to the target control");

			var oChildView = oLastChildInPanel.getComponentInstance().getRootControl();
			assert.ok(oChildView.isA("sap.ui.core.mvc.View"), "The child view can be found");
			assert.strictEqual(oChildView.getViewName(), "test.routing.target.Async1", "The correct view is loaded");
		}.bind(this));
	});

	QUnit.module("titleChanged event", {
		beforeEach: function () {
			this.oApp = new App();

			this.oDefaultConfig = {
				viewPath: "bar",
				viewName: "foo",
				controlAggregation: "pages",
				viewType: "XML",
				controlId: this.oApp.getId(),
				async: true
			};

			this.oTargetsConfig = {
				myTarget: {
					title: "myTitle"
				},
				mySecondTarget: {
					title: "mySecondTitle"
				},
				myNoTitleTarget: {
				},
				myChild: {
					parent : "myTarget",
					title: "myChildTarget"
				},
				myNoTitleGrandChild: {
					parent: "myChild"
				},
				myNoTitleChild: {
					parent : "myTarget"
				}
			};

			this.oViews = new Views({async: true});
			// System under test + Arrange
			this.oTargets = new Targets({
				targets: this.oTargetsConfig,
				views: this.oViews,
				config: this.oDefaultConfig
			});

			return createView([
				'<View xmlns="sap.ui.core.mvc">',
				'</View>'
			]).then(function(oView) {
				this.oView = oView;
			}.bind(this));
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oTargets.destroy();
			this.oViews.destroy();
			this.oView.destroy();
		}
	});


	QUnit.test("fire/attach/detach", function(assert) {
		// Arrange
		var oParameters = { title : "bar" },
			oListener = {},
			oData = { some : "data" },
			fnEventSpy = this.spy(function(oEvent, oActualData) {
				assert.strictEqual(oActualData, oData, "the data is correct");
				assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
				assert.strictEqual(this, oListener, "the this pointer is correct");
			}),
			oFireReturnValue,
			oDetachReturnValue,
			oAttachReturnValue = this.oTargets.attachTitleChanged(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oTargets.fireTitleChanged(oParameters);
		oDetachReturnValue = this.oTargets.detachTitleChanged(fnEventSpy, oListener);
		this.oTargets.fireTitleChanged(oParameters);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oTargets, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oTargets, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oTargets, "did return this for chaining for fire");
	});

	QUnit.test("single target", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			oData = {some : "data"};

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display("myTarget", oData);

		// Assert
		return oDisplayed.then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
			assert.strictEqual(oParameters.name, "myTarget", "parameter 'name' is set");
			assert.strictEqual(oParameters.title, "myTitle", "parameter 'title' is set");
		});
	});

	QUnit.test("multiple targets - default title", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "target got passed to the event");
				assert.strictEqual(oParameters.title, "myTitle", "title got passed to the event");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData);

		// Assert
		return oDisplayed.then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		});
	});

	QUnit.test("multiple targets - provided TitleTarget", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "mySecondTarget", "target got passed to the event");
				assert.strictEqual(oParameters.title, "mySecondTitle", "title got passed to the event");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "mySecondTarget");

		// Assert
		return oDisplayed.then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		});
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("multiple targets - provided TitleTarget pointing to target without title (future=false)", function (assert) {
		future.active = false;
		// Arrange
		var that = this,
			oData = {some : "data"},
			fnEventSpy = this.spy();

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "myNoTitleTarget");

		// Assert
		return oDisplayed.then(function() {
			assert.ok(fnEventSpy.notCalled, "the event isn't fired");
			future.active = undefined;
		});
	});

	QUnit.test("multiple targets - provided TitleTarget pointing to target without title (future=true)", function (assert) {
		future.active = true;
		// Arrange
		const that = this,
			oData = { some: "data" },
			fnEventSpy = this.spy();

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		const myAssertFn = () => {
			this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "myNoTitleTarget");
		};

		// Assert
		assert.throws(myAssertFn, new Error("The target with the name \"myNoTitleTarget\" where the titleChanged event should be fired does not exist!"),
			"Throws an error because target does not exist.");
		assert.ok(fnEventSpy.notCalled, "the event isn't fired");
		future.active = undefined;
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("provided invalid TitleTarget (future=false)", function (assert) {
		future.active = false;
		// Arrange
		var that = this,
			oData = {some : "data"},
			fnEventSpy = this.spy();

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});
		var oLogSpy = this.spy(Log, "error");

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myTarget"], oData, "foo");

		return oDisplayed.then(function() {
			// Assert
			assert.ok(fnEventSpy.notCalled, "the event isn't fired");
			assert.ok(
				oLogSpy.calledWith(sinon.match(/The target with the name \"foo\" where the titleChanged event should be fired does not exist!/)),
				this.oTargets
			);
			future.active = undefined;
		}.bind(this));
	});

	QUnit.test("provided invalid TitleTarget (future=true)", function (assert) {
		future.active = true;
		// Arrange
		var that = this,
			oData = { some: "data" },
			fnEventSpy = this.spy();

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		const myAssertFn = () => {
			this.oTargets.display(["myTarget"], oData, "foo");
		};
		assert.throws(myAssertFn, new Error("The target with the name \"foo\" where the titleChanged event should be fired does not exist!"),
			"Throws an error because TitleTarget is invalid.");
		assert.ok(fnEventSpy.notCalled, "the event isn't fired");

		future.active = undefined;
	});

	QUnit.test("single target which has its own title with parent", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myChild", "name from itself is taken");
				assert.strictEqual(oParameters.title, "myChildTarget", "title from itself is taken");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myChild"], oData);

		// Assert
		return oDisplayed.then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		});
	});

	QUnit.test("single target which doesn't have title with parent", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "name from parent is taken");
				assert.strictEqual(oParameters.title, "myTitle", "title from parent is taken");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myNoTitleChild"], oData);

		// Assert
		return oDisplayed.then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		});
	});


	QUnit.test("single target with multiple ancestors", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myChild", "name from nearest parent target is taken");
				assert.strictEqual(oParameters.title, "myChildTarget", "title from nearest parent target is taken");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myNoTitleGrandChild"], oData);

		// Assert
		return oDisplayed.then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		});
	});

	QUnit.test("multiple targets with children", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				aTargetNames.push(oParameters.name);
				assert.propEqual(oParameters.config, that.oTargets.getTarget(oParameters.name)._oRawOptions, "configuration should have been merged");
				assert.strictEqual(oParameters.view, that.oView, "view got passed to the event");
				assert.strictEqual(oParameters.control, that.oApp, "control got passed to the event");
				assert.strictEqual(oParameters.data, oData, "data was passed");
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTargets.attachDisplay(fnEventSpy);

		// Act
		var oDisplayed = this.oTargets.display(["myChild", "mySecondTarget"], oData);

		return oDisplayed.then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 3, "the event got fired");
			assert.strictEqual(aTargetNames.shift(), "myTarget", "the parent got fired first");
			assert.strictEqual(aTargetNames.shift(), "myChild", "the child got fired after the parent");
			assert.strictEqual(aTargetNames.shift(), "mySecondTarget", "the second target got fired last");
		});
	});

	QUnit.module("titleChanged with binding and context change", {
		beforeEach: function () {
			this.oApp = new App();

			this.oDefaultConfig = {
				viewPath: "bar",
				viewName: "foo",
				controlAggregation: "pages",
				viewType: "XML",
				controlId: this.oApp.getId(),
				async: true
			};

			this.oTargetsConfig = {
				target1: {
					title: "{name}"
				}
			};

			this.oViews = new Views({async: true});

			// System under test + Arrange
			this.oTargets = new Targets({
				targets: this.oTargetsConfig,
				views: this.oViews,
				config: this.oDefaultConfig
			});

			this.oModel = new JSONModel({
				cheese: {
					name: "cheese"
				},
				joghurt: {
					name: "joghurt"
				}
			});

			this.oApp.setModel(this.oModel);

			return createView([
				'<View xmlns="sap.ui.core.mvc">',
				'</View>'
			]).then(function(oView) {
				this.oView = oView;

				this.stub(this.oViews, "_getView").callsFake(function () {
					return this.oView;
				}.bind(this));
			}.bind(this));
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oTargets.destroy();
			this.oViews.destroy();
			this.oView.destroy();
			this.oModel.destroy();
		}
	});

	QUnit.test("titleChanged event should be fired once the binding context is available", function(assert) {
		var aEventParams = [];
		var fnEventSpy = this.spy(function (oEvent) {
			aEventParams.push(oEvent.getParameters());
		});

		this.oTargets.attachTitleChanged(fnEventSpy);
		var pDisplayed = this.oTargets.display("target1");
		return pDisplayed.then(function() {
			assert.equal(fnEventSpy.callCount, 0, "titleChanged event isn't fired yet");
			this.oView.bindObject("/cheese");
			assert.equal(fnEventSpy.callCount, 1, "titleChanged event is fired after binding context is available");
			assert.equal(aEventParams[0].title, "cheese", "title property is correct");
		}.bind(this));
	});

	QUnit.test("The same titleChanged event shouldn't be fired again when the target is displayed with the same binding context", function(assert) {
		var aEventParams = [];
		var fnEventSpy = this.spy(function (oEvent) {
			aEventParams.push(oEvent.getParameters());
		});

		this.oView.bindObject("/cheese");
		this.oTargets.attachTitleChanged(fnEventSpy);
		var pDisplayed = this.oTargets.display("target1");
		return pDisplayed.then(function() {
			assert.equal(fnEventSpy.callCount, 1, "titleChanged event is fired after binding context is available");
			assert.equal(aEventParams[0].title, "cheese", "title property is correct");

			// display the same target again
			return this.oTargets.display("target1").then(function() {
				assert.equal(fnEventSpy.callCount, 1, "titleChanged event isn't fired again because the binding context isn't changed");
			});
		}.bind(this));
	});

	QUnit.test("titleChanged event is fired again when new binding context is set", function(assert) {
		var aEventParams = [];
		var fnEventSpy = this.spy(function (oEvent) {
			aEventParams.push(oEvent.getParameters());
		});

		this.oView.bindObject("/cheese");
		this.oTargets.attachTitleChanged(fnEventSpy);
		var pDisplayed = this.oTargets.display("target1");
		return pDisplayed.then(function() {
			assert.equal(fnEventSpy.callCount, 1, "titleChanged event is fired after binding context is available");
			assert.equal(aEventParams[0].title, "cheese", "title property is correct");

			// display the same target again
			return this.oTargets.display("target1").then(function() {
				assert.equal(fnEventSpy.callCount, 1, "titleChanged event isn't fired again because the binding context isn't changed");

				this.oView.bindObject("/joghurt");
				assert.equal(fnEventSpy.callCount, 2, "titleChanged event is fired again because a new binding context is set");
				assert.equal(aEventParams[1].title, "joghurt", "title property is correct");
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all dependencies", function (assert) {
		// Arrange
		var oViews = new Views({async: true}),
			oFirstTarget,
			oSecondTarget;

		// System under test
		var oTargets = new Targets(
			{
				targets: {
					foo: {
					},
					bar: {
					}
				},
				config: {
					async: true
				},
				views : oViews
			}
		);

		oFirstTarget = oTargets.getTarget("foo");
		oSecondTarget = oTargets.getTarget("bar");

		// Act
		oTargets.destroy();

		// Assert
		assert.ok(oTargets.bIsDestroyed, "Did flag the targets as destroyed");
		assert.ok(oFirstTarget.bIsDestroyed, "Did destroy the first target");
		assert.ok(oSecondTarget.bIsDestroyed, "Did destroy the second target");
		assert.strictEqual(oTargets._oCache, null, "Did free the views reference");
		assert.strictEqual(oTargets._mTargets, null, "Did free the targets map reference");
		assert.strictEqual(oTargets._oConfig, null, "Did free the config reference");
		assert.ok(!oViews.bIsDestroyed, "Did not destroy the views instance");

		// Cleanup
		oViews.destroy();
	});
});

/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/Targets",
	"sap/ui/core/routing/Views",
	"sap/base/Log",
	"./AsyncViewModuleHook",
	"sap/m/App",
	"sap/m/Panel"
], function(View, Targets, Views, Log, ModuleHook, App, Panel){
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

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
		assert.strictEqual(oTarget._oOptions.viewName, "myView", "Did retrieve the correct Target");
		assert.strictEqual(oTarget._oCache, this.oViews, "Did pass the views instance");
	});

	QUnit.test("Should be able to get an existing target by key which is set in an object", function (assert) {
		// Act
		var oTarget = this.oTargets.getTarget({name: "myTarget"});

		// Assert
		assert.strictEqual(oTarget._oOptions.viewName, "myView", "Did retrieve the correct Target");
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
		assert.strictEqual(oChild._oOptions.viewName, "myChildView", "Did retrieve the correct Target");
		assert.strictEqual(oChild._oParent, this.oTargets.getTarget("myParent"), "The parent was correctly passed to the target");
	});

	QUnit.test("Should be able to get multiple targets", function (assert) {
		// Arrange
		var oStub = this.stub(Log, "error").callsFake(jQuery.noop);

		// Act
		var aTargets = this.oTargets.getTarget(["myTarget",  "foo", "myParent"]);

		// Assert
		assert.strictEqual(aTargets.length, 2, "Should return two targets");
		assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
		assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
		// check if error for non-existing target "foo" is thrown
		sinon.assert.calledWith(oStub, sinon.match(/foo/), sinon.match(this.oTargets));

		// Act
		aTargets = this.oTargets.getTarget([undefined, "myTarget", false, {name: "myParent"}, "foo", {name: "myTarget"}]);
		// Assert
		assert.strictEqual(aTargets.length, 3, "Should return three targets");
		assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
		assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
		assert.strictEqual(aTargets[2], this.oTargets.getTarget("myTarget"), "The third target should be myTarget");
	});

	QUnit.test("Should be able to add a new target", function (assert) {
		this.oTargets.addTarget("newTarget", {
			viewName: "newView",
			parent: "myParent"
		});

		var oTarget = this.oTargets.getTarget("newTarget");
		assert.ok(oTarget, "new target object is created");
		assert.strictEqual(oTarget._oOptions._name, "newTarget", "target name should be correct");
		assert.strictEqual(oTarget._oParent, this.oTargets.getTarget("myParent"), "correct parent should be set");
	});

	QUnit.test("Should kept the existing target and log an error message if 'addTarget' is called with the same name", function (assert) {
		// Arrange
		var oStub = this.stub(Log, "error").callsFake(jQuery.noop);

		// Act
		this.oTargets.addTarget("myParent", {
			viewName: "myNewParentView"
		});
		var oParent = this.oTargets.getTarget("myParent");

		// Assert
		assert.strictEqual(oParent._oOptions.viewName, "myParentView", "options stay the same");
		// Check whether the error message is thrown
		sinon.assert.calledWith(oStub, sinon.match(/myParent/), sinon.match(this.oTargets));
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

	QUnit.module("config - invalid parent", {
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should complain about an non existing parent", function (assert) {
		// Arrange
		var oIncorrectConfig = {
				targets: {
					myChildWithoutParent: {
						parent:"foo"
					}
				}
			},
			oErrorStub = this.stub(Log, "error").callsFake(jQuery.noop);

		// System under test + Act
		this.oTargets = new Targets(oIncorrectConfig);

		// Assert
		sinon.assert.calledWith(oErrorStub, sinon.match(/was not found/), sinon.match(this.oTargets));
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
		var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "_display").callsFake(jQuery.noop);

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

	QUnit.test("Should log an error if user tries to display a non existing Target", function (assert) {
		// Assert
		var oErrorStub = this.stub(Log, "error").callsFake(jQuery.noop);

		// Act
		return this.oTargets.display("foo").then(function(aViewInfos) {
			assert.strictEqual(aViewInfos[0].name, "foo", "Matching target info is returned");
			assert.strictEqual(aViewInfos[0].error, "The target with the name \"foo\" does not exist!", "Matching error message is returned");
			// Assert
			sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
		}.bind(this));
	});

	QUnit.test("Should log an error if user tries to display a non existing Target, but should display existing ones", function (assert) {
		// Assert
		var oErrorStub = this.stub(Log, "error").callsFake(jQuery.noop);
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
			assert.strictEqual(aViewInfos[0].error, "The target with the name \"foo\" does not exist!", "Did resolve with the error message of the erroneous target");
		}.bind(this));
	});

	function createView (aContent, sId) {
		var sXmlViewContent = aContent.join(''),
			oViewOptions = {
				id : sId,
				viewContent: sXmlViewContent,
				type: "XML"
			};

		return sap.ui.view(oViewOptions);
	}

	QUnit.module("display event", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();
			this.oView = createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);

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

		var oExtendedConfig = jQuery.extend(true, { _name: "myTarget" }, this.oTargetsConfig.myTarget, this.oDefaultConfig);

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
				assert.propEqual(oParameters.config, jQuery.extend(true, {}, that.oTargets.getTarget(oParameters.name)._oOptions, that.oDefaultConfig), "configuration should have been merged");
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
			this.oView = createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);

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
			oAttachReturnValue = this.oTargets.attachTitleChanged(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oTargets.fireTitleChanged(oParameters);
		oDetachReturnValue = this.oTargets.detachTitleChanged(fnEventSpy, oListener);
		this.oTargets.fireTitleChanged();

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

	QUnit.test("multiple targets - provided TitleTarget pointing to target without title", function (assert) {
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
		});
	});

	QUnit.test("provided invalid TitleTarget", function (assert) {
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
			sinon.assert.calledWithExactly(
				oLogSpy,
				"The target with the name \"foo\" where the titleChanged event should be fired does not exist!",
				this.oTargets
			);
		}.bind(this));
	});

	QUnit.test("single target with parent", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "name from parent target is taken");
				assert.strictEqual(oParameters.title, "myTitle", "title from parent target is taken");
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

	QUnit.test("single target with multiple ancestors", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "name from parent target is taken");
				assert.strictEqual(oParameters.title, "myTitle", "title from parent target is taken");
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
				assert.propEqual(oParameters.config, jQuery.extend(true, {}, that.oTargets.getTarget(oParameters.name)._oOptions, that.oDefaultConfig), "configuration should have been merged");
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

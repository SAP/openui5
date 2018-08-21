/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/Targets",
	"sap/ui/core/routing/Views",
	"sap/m/App",
	"sap/m/Panel"
], function (Log, View, Targets, Views, App, Panel) {
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	QUnit.module("getTarget and target names", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views();
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

	QUnit.test("Should return undefined if a target does not exist", function (assert) {
		// Act
		var oTarget = this.oTargets.getTarget("foo");

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
		var oStub = this.stub(Log, "error", jQuery.noop);

		// Act
		var aTargets = this.oTargets.getTarget(["myTarget",  "foo", "myParent"]);

		// Assert
		assert.strictEqual(aTargets.length, 2, "Should return two targets");
		assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
		assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
		// check if error for non-existing target "foo" is thrown
		sinon.assert.calledWith(oStub, sinon.match(/foo/), sinon.match(this.oTargets));
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
		var oStub = this.stub(Log, "error", jQuery.noop);

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
				someThingToBeReplaced: "baz"
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
			oErrorStub = this.stub(Log, "error", jQuery.noop);

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
				}
			});
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should display one target", function (assert) {
		// Arrange
		// Replace display with an empty fn
		var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "display", jQuery.noop);
		var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "display", jQuery.noop);

		// Act
		this.oTargets.display("firstTarget");

		// Assert
		assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
		assert.strictEqual(fnSecondDisplayStub.callCount, 0, "Did not invoke display on the second target");
	});

	QUnit.test("Should display multiple targets", function (assert) {
		// Arrange
		// Replace display with an empty fn
		var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "display", jQuery.noop);
		var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "display", jQuery.noop);

		// Act
		this.oTargets.display(["firstTarget", "secondTarget"]);

		// Assert
		assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
		assert.strictEqual(fnSecondDisplayStub.callCount, 1, "Did invoke display on the second target");
	});

	QUnit.test("Should log an error if user tries to display a non existing Target", function (assert) {

		// Assert
		var oErrorStub = this.stub(Log, "error", jQuery.noop);

		// Act
		this.oTargets.display("foo");

		// Assert
		sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
	});

	QUnit.test("Should log an error if user tries to display a non existing Target, but should display existing ones", function (assert) {

		// Assert
		var oErrorStub = this.stub(Log, "error", jQuery.noop);
		var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "display", jQuery.noop);

		// Act
		this.oTargets.display(["foo", "firstTarget"]);

		// Assert
		assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
		sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
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
				viewPath: "bar",
				viewName: "foo",
				controlAggregation: "content",
				viewType: "XML",
				controlId: this.oShell.getId()
			};

			this.oTargetsCofig = {
				myTarget: {
				},
				mySecondTarget: {
				},
				myChild: {
					parent : "myTarget"
				}
			};

			this.oViews = new Views();
			// System under test + Arrange
			this.oTargets = new Targets({
						targets: this.oTargetsCofig,
						views: this.oViews,
						config: this.oDefaultConfig
					}
			);
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
			fnEventSpy = this.spy(function(oEvent, oActualData) {
				assert.strictEqual(oActualData, oData, "the data is correct");
				assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
				assert.strictEqual(this, oListener, "the this pointer is correct");
			}),
			oListener = {},
			oData = { some : "data" },
			oFireReturnValue,
			oDetachReturnValue,
			oAttachReturnValue = this.oTargets.attachDisplay(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oTargets.fireDisplay(oParameters);
		oDetachReturnValue = this.oTargets.detachDisplay(fnEventSpy, oListener);
		this.oTargets.fireDisplay();
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oTargets, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oTargets, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oTargets, "did return this for chaining for fire");
	});

	// our qunit is so old
	function allPropertiesStrictEqual (object1, object2, assert) {
		var sPropertyName;

		for (sPropertyName in object1) {
			// only check own properties
			if (object1.hasOwnProperty(sPropertyName)) {
				if (object2.hasOwnProperty(sPropertyName)) {
					if (typeof object1[sPropertyName] === "object") {
						allPropertiesStrictEqual(object1[sPropertyName],  object2[sPropertyName], assert);
					} else {
						assert.strictEqual(object1[sPropertyName], object2[sPropertyName], "the property " + sPropertyName + " is equal");
					}
				} else {
					assert.ok(false, JSON.stringify(object1) + " has a property " + sPropertyName + " the second object does not have " + JSON.stringify(object2));
				}
			}
		}
	}


	QUnit.test("Should fire the display event", function (assert) {
		// Arrange
		var that = this,
			oParameters = null,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			oData = {some : "data"};

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachDisplay(fnEventSpy);

		// Act
		this.oTargets.display("myTarget", oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		assert.strictEqual(oParameters.view, this.oView, "view got passed to the event");
		assert.strictEqual(oParameters.control, this.oShell, "control was the shell");
		assert.strictEqual(oParameters.data, oData, "data was passed");
		assert.strictEqual(oParameters.name, "myTarget", "name was passed");
		allPropertiesStrictEqual(jQuery.extend(true, { _name: "myTarget" }, this.oTargetsCofig.myTarget, this.oDefaultConfig), oParameters.config, assert);
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
				allPropertiesStrictEqual(oParameters.config, jQuery.extend(true, {}, that.oTargets.getTarget(oParameters.name)._oOptions, that.oDefaultConfig), assert);
				assert.strictEqual(oParameters.view, that.oView, "view got passed to the event");
				assert.strictEqual(oParameters.control, that.oShell, "control got passed to the event");
				assert.strictEqual(oParameters.data, oData, "data was passed");
			});

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachDisplay(fnEventSpy);

		// Act
		this.oTargets.display(["myChild", "mySecondTarget"], oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 3, "the event got fired");
		assert.strictEqual(aTargetNames.shift(), "myTarget", "the parent got fired first");
		assert.strictEqual(aTargetNames.shift(), "myChild", "the child got fired after the parent");
		assert.strictEqual(aTargetNames.shift(), "mySecondTarget", "the second target got fired last");
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
				controlId: this.oApp.getId()
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

			this.oViews = new Views();
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
			fnEventSpy = this.spy(function(oEvent, oActualData) {
				assert.strictEqual(oActualData, oData, "the data is correct");
				assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
				assert.strictEqual(this, oListener, "the this pointer is correct");
			}),
			oListener = {},
			oData = { some : "data" },
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

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display("myTarget", oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		assert.strictEqual(oParameters.name, "myTarget", "parameter 'name' is set");
		assert.strictEqual(oParameters.title, "myTitle", "parameter 'title' is set");
	});

	QUnit.test("multiple targets - default title", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "target got passed to the event");
				assert.strictEqual(oParameters.title, "myTitle", "title got passed to the event");
			});

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
	});

	QUnit.test("multiple targets - provided TitleTarget", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "mySecondTarget", "target got passed to the event");
				assert.strictEqual(oParameters.title, "mySecondTitle", "title got passed to the event");
			});

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "mySecondTarget");
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
	});

	QUnit.test("multiple targets - provided TitleTarget pointing to target without title", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy();

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "myNoTitleTarget");
		this.clock.tick(0);

		// Assert
		sinon.assert.notCalled(fnEventSpy, "the event isn't fired");
	});

	QUnit.test("provided invalid TitleTarget", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy();

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});
		var oLogSpy = this.spy(Log, "error");

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display(["myTarget"], oData, "foo");
		this.clock.tick(0);

		// Assert
		sinon.assert.notCalled(fnEventSpy, "the event isn't fired");
		sinon.assert.calledWithExactly(
			oLogSpy,
			"The target with the name \"foo\" where the titleChanged event should be fired does not exist!",
			this.oTargets
		);
	});

	QUnit.test("single target with parent", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "name from parent target is taken");
				assert.strictEqual(oParameters.title, "myTitle", "title from parent target is taken");
			});

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display(["myChild"], oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
	});

	QUnit.test("single target with multiple ancestors", function (assert) {
		// Arrange
		var aTargetNames = [],
			that = this,
			oParameters = null,
			oData = {some : "data"},
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
				assert.strictEqual(oParameters.name, "myTarget", "name from parent target is taken");
				assert.strictEqual(oParameters.title, "myTitle", "title from parent target is taken");
			});

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachTitleChanged(fnEventSpy);

		// Act
		this.oTargets.display(["myNoTitleGrandChild"], oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
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
				allPropertiesStrictEqual(oParameters.config, jQuery.extend(true, {}, that.oTargets.getTarget(oParameters.name)._oOptions, that.oDefaultConfig), assert);
				assert.strictEqual(oParameters.view, that.oView, "view got passed to the event");
				assert.strictEqual(oParameters.control, that.oApp, "control got passed to the event");
				assert.strictEqual(oParameters.data, oData, "data was passed");
			});

		var oStub = this.stub(this.oViews, "_getView", function () {
			return that.oView;
		});

		this.oTargets.attachDisplay(fnEventSpy);

		// Act
		this.oTargets.display(["myChild", "mySecondTarget"], oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 3, "the event got fired");
		assert.strictEqual(aTargetNames.shift(), "myTarget", "the parent got fired first");
		assert.strictEqual(aTargetNames.shift(), "myChild", "the child got fired after the parent");
		assert.strictEqual(aTargetNames.shift(), "mySecondTarget", "the second target got fired last");
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all dependencies", function (assert) {
		// Arrange
		var oViews = new Views(),
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

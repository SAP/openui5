/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/OpaPlugin",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/matchers/_Enabled",
	"sap/m/CheckBox",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Dialog",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"./utils/view",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/Log"
], function (OpaPlugin,
			 Interactable,
			 _autoWaiter,
			 _Enabled,
			 CheckBox,
			 Button,
			 Input,
			 Dialog,
			 Element,
			 View,
			 XMLView,
			 viewUtils,
			 nextUIUpdate,
			 Log) {
	"use strict";


	QUnit.module("OpaPlugin - getControlByGlobalId", {
		beforeEach : function() {
			this.oPlugin = new OpaPlugin();
			this.fnLogSpy = sinon.spy(this.oPlugin._oLogger, "debug");

			this.sId = "myId";
			this.oButton = new Button(this.sId);
		},
		afterEach : function() {
			this.fnLogSpy.restore();
			this.oButton.destroy();
		}
	});

	QUnit.test("Should retrieve a control by a global id", async function(assert) {
		// Arrange
		this.oButton.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		var oRetrievedButton = this.oPlugin.getMatchingControls({ id : this.sId });

		// Assert
		assert.strictEqual(oRetrievedButton, this.oButton);
	});

	QUnit.test("Should not retrieve a control by a global id - if control is not rendered", function(assert) {
		// Act
		var oRetrievedButton = this.oPlugin.getMatchingControls({ id : this.sId });

		// Assert
		assert.strictEqual(oRetrievedButton, null);
	});

	[{
		id: "nonexistingId"
	},{
		id: "nonexistingId",
		controlType: "sap.m.Button"
	}].forEach(function (oWaitFor) {
		QUnit.test("Should not retrieve a control by a global id - if control does not exist", function(assert) {
			// Act
			var oResult = this.oPlugin.getMatchingControls(oWaitFor);

			// Assert
			assert.strictEqual(oResult, null);
			sinon.assert.calledWith(this.fnLogSpy, "Found no control with the global ID 'nonexistingId'");
		});
	});

	QUnit.test("Should not retrieve a control by a global id - if control is destroyed", function(assert) {
		// Act
		this.oButton.destroy();
		var oRetrievedButton = this.oPlugin.getMatchingControls({ id : this.sId });

		// Assert
		assert.strictEqual(oRetrievedButton, null);
	});


	QUnit.test("Should retrieve a control by a global id - if visible is set to false", function(assert) {
		// Act
		var oRetrievedButton = this.oPlugin.getMatchingControls({
			id : this.sId,
			visible : false
		});

		// Assert
		assert.strictEqual(oRetrievedButton, this.oButton);
	});

	QUnit.test("Should retrieve multiple controls by global id's", async function(assert) {
		// Arrange
		var oButton = new Button(),
			oButton2 = new Button();

		oButton.placeAt("qunit-fixture");
		oButton2.placeAt("qunit-fixture");
		await nextUIUpdate();

		// System under Test
		var oPlugin = new OpaPlugin();

		// Act
		var aRetrievedButtons = oPlugin.getMatchingControls({ id : [oButton.getId(), oButton2.getId()] });

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 2, "did contain 2 buttons");
		assert.strictEqual(aRetrievedButtons[0], oButton, "did contain first button");
		assert.strictEqual(aRetrievedButtons[1], oButton2, "did contain second button");

		//Cleanup
		oButton.destroy();
		oButton2.destroy();
	});

	QUnit.test("Should retrieve multiple controls by global id's with regexp", async function(assert) {
		// Arrange
		var oButton = new Button(),
			oButton2 = new Button();

		oButton.placeAt("qunit-fixture");
		oButton2.placeAt("qunit-fixture");
		await nextUIUpdate();

		// System under Test
		var oPlugin = new OpaPlugin();

		// Act
		var aRetrievedButtons = oPlugin.getMatchingControls({ id : /.*button.*/ });

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 2, "did contain 2 buttons");
		assert.strictEqual(aRetrievedButtons[0], oButton, "did contain first button");
		assert.strictEqual(aRetrievedButtons[1], oButton2, "did contain second button");

		//Cleanup
		oButton.destroy();
		oButton2.destroy();
	});

	QUnit.test("Should get an empty array if no control was found searching by regexp", function(assert) {
		// System under Test
		var oPlugin = new OpaPlugin();

		// Act
		var aRetrievedButtons = oPlugin.getControlByGlobalId({ id : /.*button.*/ });

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 0, "did not contain buttons");
	});

	QUnit.test("Should get an empty array if no control was found searching multiple ids", function(assert) {
		// System under Test
		var oPlugin = new OpaPlugin();

		// Act
		var aRetrievedButtons = oPlugin.getControlByGlobalId({ id : ["foo" , "bar"] });

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 0, "did not contain buttons");
	});

	QUnit.test("Should get null when no control is found with single id", function(assert) {
		// System under Test
		var oPlugin = new OpaPlugin();

		// Act
		var oRetrievedButtons = oPlugin.getMatchingControls({ id : "myId" });

		// Assert
		assert.strictEqual(oRetrievedButtons, null, "did return null");
	});

	QUnit.module("OpaPlugin - Controls with a control type and id", {
		beforeEach : function() {
			this.oPlugin = new OpaPlugin();
			this.fnLogSpy = sinon.spy(this.oPlugin._oLogger, "debug");
			this.fnLogErrorSpy = sinon.spy(this.oPlugin._oLogger, "error");

			this.oButton = new Button("my_id1");
			this.oButton2 = new Button("my_id2");
			this.oCheckBox = new CheckBox("my_id3");

			this.oButton.placeAt("qunit-fixture");
			this.oButton2.placeAt("qunit-fixture");
			this.oCheckBox.placeAt("qunit-fixture");

			return nextUIUpdate();
		},
		afterEach : function() {
			this.fnLogSpy.restore();
			this.fnLogErrorSpy.restore();
			this.oButton.destroy();
			this.oButton2.destroy();
			this.oCheckBox.destroy();
		}
	});

	/**
	 * @deprecated since 1.56 together with lazy loading as it implies sync loading
	 */
	QUnit.test("Should retrieve a controls even if the control is a lazy stub", function(assert) {
		assert.ok(sap.ui.lazyRequire._isStub("sap.m.ComboBox"), "Combo box is still a stub");

		// Act - combo box is a lazy stub
		var aRetrievedControls = this.oPlugin.getMatchingControls({
			controlType : sap.m.ComboBox // must remain a global to test against lazy stubs
		});

		// Assert
		assert.strictEqual(aRetrievedControls.length, 0);
		sinon.assert.calledWith(this.fnLogSpy, "The control type is currently a lazy stub");
	});

	/**
	 * @deprecated since 1.56 together with lazy loading as it implies sync loading
	 */
	QUnit.test("Should retrieve a controls even if the control is a lazy stub", function(assert) {
		assert.ok(sap.ui.lazyRequire._isStub("sap.m.Select"), "Select is still a stub");

		// Act - combo box is a lazy stub
		var aRetrievedControls = this.oPlugin.getMatchingControls({
			controlType : "sap.m.Select"
		});

		// Assert
		assert.strictEqual(aRetrievedControls.length, 0);
	});

	QUnit.test("Should return all controls", function (assert) {
		var aAllControls = this.oPlugin.getMatchingControls();

		// Assert
		assert.ok(aAllControls.indexOf(this.oButton) !== -1, "has button");
		assert.ok(aAllControls.indexOf(this.oButton2) !== -1, "has button2");
		assert.ok(aAllControls.indexOf(this.oCheckBox) !== -1, "has checkbox");
		assert.strictEqual(aAllControls.length, 3, "got only 3 controls");
	});

	QUnit.test("Should retrieve all buttons by control type as string", function (assert) {
		var aButtons = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Button"
		});

		assert.ok(aButtons.indexOf(this.oButton) !== -1, "has button");
		assert.ok(aButtons.indexOf(this.oButton2) !== -1, "has button2");
		assert.strictEqual(aButtons.length, 2, "got only 2 controls");
	});

	QUnit.test("Should log an error if the controlType does not match and a string id is given", function (assert) {
		var oCheckBox = this.oPlugin.getMatchingControls({
			id: "my_id3",
			controlType: "sap.m.Button"
		});

		assert.strictEqual(oCheckBox, null, "got null");
		sinon.assert.calledWithExactly(this.fnLogErrorSpy, "A control with global ID 'my_id3' is found but does not have required controlType " +
			"'sap.m.Button'. Found control is 'Element sap.m.CheckBox#my_id3' but null is returned instead");
	});

	QUnit.test("Should log an error if the controlType does not match and a string id is given", function (assert) {
		var oCheckBox = this.oPlugin.getMatchingControls({
			id: "my_id3",
			controlType: "sap.m.CheckBox"
		});

		assert.strictEqual(oCheckBox, this.oCheckBox, "got null");
		sinon.assert.notCalled(this.fnLogErrorSpy);
	});

	QUnit.test("Should retrieve all buttons by control type and ids as array", function (assert) {
		var aButtons = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Button",
			id: [this.oButton.getId(), this.oButton2.getId()]
		});

		assert.ok(aButtons.indexOf(this.oButton) !== -1, "has button");
		assert.ok(aButtons.indexOf(this.oButton2) !== -1, "has button2");
		assert.strictEqual(aButtons.length, 2, "got only 2 controls");
	});

	QUnit.test("Should retrieve one button by control type and id as array", function (assert) {
		var aButtons = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Button",
			id: [this.oButton2.getId()]
		});

		assert.ok(aButtons.indexOf(this.oButton2) !== -1, "has button2");
		assert.strictEqual(aButtons.length, 1, "got only one controls");
	});

	QUnit.test("Should retrieve no control for some strange control type", function (assert) {
		var aResult = this.oPlugin.getMatchingControls({
			controlType: "foo.bar.foo"
		});

		assert.strictEqual(aResult.length, 0, "Result was empty");
		sinon.assert.calledWith(this.fnLogSpy, "The control type foo.bar.foo is undefined.");
	});

	QUnit.test("Should retrieve no control for some strange control type and an id", function (assert) {
		var oResult = this.oPlugin.getMatchingControls({
			controlType: "foo.bar.foo",
			id: "foo"
		});

		assert.strictEqual(oResult, null, "Result was null");
		sinon.assert.calledWith(this.fnLogSpy, "The control type foo.bar.foo is undefined.");
	});

	QUnit.test("Should retrieve no control for static control type", function (assert) {
		var oResult = this.oPlugin.getMatchingControls({
			controlType: "sap.m.MessageToast"
		});

		assert.strictEqual(oResult.length, 0, "Result was null");
		/**
		 * @deprecated since 1.56 together with lazy loading as it implies sync loading
		 */
		sinon.assert.calledWith(this.fnLogSpy, "The control type sap.m.MessageToast must be a function.");
	});

	QUnit.test("Should retrieve a control by a global id and control type", function(assert) {
		// Act
		var oRetrievedButton = this.oPlugin.getMatchingControls({
			id : "my_id2",
			controlType : Button
		});

		// Assert
		assert.strictEqual(oRetrievedButton, this.oButton2);
	});

	QUnit.test("Should not retrieve a control by a global id if a control type is different", function(assert) {
		// Act
		var oRetrievedButton = this.oPlugin.getMatchingControls({
			id : "my_id2",
			controlType : CheckBox
		});

		// Assert
		assert.strictEqual(oRetrievedButton, null);
	});

	QUnit.test("Should retrieve multiple controls by global id's with regexp and control type", function(assert) {
		// Act
		var aRetrievedControls = this.oPlugin.getMatchingControls({
			id : /my_id/i,
			controlType : CheckBox
		});

		// Assert
		assert.strictEqual(aRetrievedControls.length, 1);
		assert.strictEqual(aRetrievedControls[0], this.oCheckBox);
	});

	QUnit.test("Should retrieve multiple controls by global id's with regexp and control type", function(assert) {
		// Act
		var aRetrievedControls = this.oPlugin.getMatchingControls({
			id : /not_my_id/i,
			controlType : Button
		});

		// Assert
		assert.strictEqual(aRetrievedControls.length, 0);
	});

	QUnit.module("OpaPlugin - Controls in a view", {
		beforeEach: async function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			await viewUtils.createXmlView("bar", "myFooBarView").then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});

			this.oPlugin = new OpaPlugin();
			this.fnLogSpy = sinon.spy(this.oPlugin._oLogger, "debug");
			this.fnErrorLogSpy = sinon.spy(this.oPlugin._oLogger, "error");
		},
		afterEach: function () {
			this.fnLogSpy.restore();
			this.fnErrorLogSpy.restore();
			this.oView.destroy();
			this.oPlugin.destroy();
		}
	});

	QUnit.test("Should get an empty array if a wrong viewname is given", function (assert) {
		var aAllControlsInTheView = this.oPlugin.getMatchingControls({
			viewName: "notexistingview"
		});

		sinon.assert.calledWith(this.fnLogSpy, "Found no view with ID 'undefined' and viewName 'notexistingview'");
		assert.strictEqual(aAllControlsInTheView.length, 0);
	});

	QUnit.test("Should get null if a wrong viewname and an id as string is given", function (assert) {
		var aAllControlsInTheView = this.oPlugin.getMatchingControls({
			viewName: "notexistingview",
			id: "foo"
		});

		sinon.assert.calledWith(this.fnLogSpy, "Found no view with ID 'undefined' and viewName 'notexistingview'");
		assert.strictEqual(aAllControlsInTheView, null);
	});

	QUnit.test("Should get all controls in a view", function (assert) {
		var aAllControlsInTheView = this.oPlugin.getMatchingControls({
			viewName: "bar",
			visible: false
		});

		assert.strictEqual(aAllControlsInTheView.length, 4);
	});

	QUnit.test("Should get a single control of a view when ID is given as string", function(assert) {
		var oRetrievedButton = this.oPlugin.getMatchingControls({
			viewNamespace : "",
			viewName : "bar",
			id : "foo"
		});

		assert.strictEqual(oRetrievedButton.getId(), this.oView.byId("foo").getId(), "did return the foo button as first element");
	});

	QUnit.test("Should get a single control of a view when ID is string and the control type is also given", function(assert) {
		var oRetrievedButton = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Button",
			viewName : "bar",
			id : "foo"
		});

		assert.strictEqual(oRetrievedButton.getId(), this.oView.byId("foo").getId(), "did return the foo button as first element");
	});

	QUnit.test("Should log if a control with an id is not found in a view", function(assert) {
		var oResult = this.oPlugin.getMatchingControls({
			viewName : "bar",
			id : "notexistingcontrol"
		});

		assert.strictEqual(oResult, null, "returned null");
		sinon.assert.calledWith(this.fnLogSpy, "Found no control with ID 'notexistingcontrol' in view 'bar'");
	});

	QUnit.test("Should get multiple controls of a view", function(assert) {
		var aRetrievedButtons = this.oPlugin.getMatchingControls({
			viewNamespace : "",
			viewName : "bar",
			id : ["foo","bar"]
		});

		assert.strictEqual(aRetrievedButtons.length, 2, "did return all the buttons");
		assert.strictEqual(aRetrievedButtons[0].getId(), this.oView.byId("foo").getId(), "did return the foo button as first element");
		assert.strictEqual(aRetrievedButtons[1].getId(), this.oView.byId("bar").getId(), "did return the bar button as second element");
	});


	QUnit.test("Should get multiple invisible controls of a view", function(assert) {
		//Act
		var aRetrievedButtons = this.oPlugin.getMatchingControls({
			viewNamespace : "",
			viewName : "bar",
			controlType : Button,
			visible: false
		});

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 3, "did return all the buttons");
		assert.strictEqual(aRetrievedButtons[0].getId(), this.oView.byId("foo").getId(), "did return the foo button as first element");
		assert.strictEqual(aRetrievedButtons[1].getId(), this.oView.byId("bar").getId(), "did return the bar button as second element");
		assert.strictEqual(aRetrievedButtons[2].getId(), this.oView.byId("baz").getId(), "did return the baz button as third element");
	});

	QUnit.test("Should get multiple controls wih an id regex in a view", function(assert) {
		//Act
		var aRetrievedButtons = this.oPlugin.getMatchingControls({
			viewNamespace : "",
			viewName : "bar",
			id: /b/,
			visible: false
		});

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 3, "did return all controls with b in the id");
		assert.strictEqual(aRetrievedButtons[0].getId(), this.oView.byId("bar").getId(), "did return the bar button as first element");
		assert.strictEqual(aRetrievedButtons[1].getId(), this.oView.byId("baz").getId(), "did return the baz button as second element");
		assert.strictEqual(aRetrievedButtons[2].getId(), this.oView.byId("boo").getId(), "did return the boo image as third element");
	});

	QUnit.test("Should get multiple controls wih an id regex and control type in a view", function(assert) {
		//Act
		var aRetrievedButtons = this.oPlugin.getMatchingControls({
			viewNamespace : "",
			viewName : "bar",
			id: /b/,
			controlType : Button,
			visible: false
		});

		// Assert
		assert.strictEqual(aRetrievedButtons.length, 2, "did return all buttons with b in the id");
		assert.strictEqual(aRetrievedButtons[0].getId(), this.oView.byId("bar").getId(), "did return the bar button as first element");
		assert.strictEqual(aRetrievedButtons[1].getId(), this.oView.byId("baz").getId(), "did return the baz button as second element");
	});

	QUnit.test("Should match controls by controlType and view ID", function (assert) {
		var aMatchedButtons = this.oPlugin.getMatchingControls({
			viewId: "myFooBarView",
			controlType: "sap.m.Button"
		});

		assert.strictEqual(aMatchedButtons.length, 3, "Should match all buttons in the view");
		assert.strictEqual(aMatchedButtons[0].getId(), "myFooBarView--foo", "Should match the first button");
		assert.strictEqual(aMatchedButtons[1].getId(), "myFooBarView--bar", "Should match the second button");
		assert.strictEqual(aMatchedButtons[2].getId(), "myFooBarView--baz", "Should match the third button");
		sinon.assert.calledWith(this.fnLogSpy, "Found view with ID 'myFooBarView' and viewName 'undefined'");
	});

	// change logic to "should not match" when the warning is replaced by a fix
	// BCP: 2070254964
	QUnit.test("Should match any controls of a view when ID is given and the control type is not correct", function(assert) {
		var oResultSingleId = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Input",
			viewName: "bar",
			id: "foo"
		});
		var oResultArrayId = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Input",
			viewName: "bar",
			id: ["foo"]
		});
		var oResultRegexId = this.oPlugin.getMatchingControls({
			controlType: "sap.m.Input",
			viewName: "bar",
			id: /fo/
		});

		assert.ok(this.oPlugin.getControlConstructor("sap.m.Input"), "Control constructor is found"); // avoid false positives
		assert.ok(oResultSingleId, "Should match (but print warning) when controlType is different - single ID as string");
		assert.ok(oResultArrayId.length, "Should match (but print warning) when controlType is different - array of IDs");
		assert.ok(!oResultRegexId.length, "Should not match when controlType is different - ID regex");

		assert.ok(this.fnErrorLogSpy.firstCall.args[0].match(/Found control with ID 'foo' in view 'bar' but it does not have required controlType 'sap.m.Input'/));
		assert.ok(this.fnErrorLogSpy.secondCall.args[0].match(/Some results don't match the desired controlType 'sap.m.Input'/));
	});

	QUnit.test("Should match controls by string ID and view ID", function (assert) {
		var oMatchedButton = this.oPlugin.getMatchingControls({
			viewId: "myFooBarView",
			id: "foo"
		});

		assert.strictEqual(oMatchedButton.getId(), "myFooBarView--foo", "Should match the button with exact ID in the view");
		sinon.assert.calledWith(this.fnLogSpy, "Found view with ID 'myFooBarView' and viewName 'undefined'");
	});

	QUnit.test("Should match controls by viewName and view ID", function (assert) {
		var aMatchedButtons = this.oPlugin.getMatchingControls({
			viewId: "myFooBarView",
			viewName: "bar",
			controlType: "sap.m.Button"
		});

		assert.strictEqual(aMatchedButtons.length, 3, "Should match all controls");
		sinon.assert.calledWith(this.fnLogSpy, "Found view with ID 'myFooBarView' and viewName 'bar'");
	});

	QUnit.test("Should not match controls if viewID is not an ID of a view", function (assert) {
		var aMatchedButtons = this.oPlugin.getMatchingControls({
			viewId: "foo",
			controlType: "sap.m.Button"
		});

		assert.ok(!aMatchedButtons.length, "Should not match any controls");
		sinon.assert.calledWith(this.fnLogSpy, "Found no view with ID 'foo' and viewName 'undefined'");
	});

	QUnit.test("Should not match controls by correct view ID if viewName is wrong", function (assert) {
		var aMatchedButtons = this.oPlugin.getMatchingControls({
			viewId: "myFooBarView",
			viewName: "notexistingview",
			controlType: "sap.m.Button"
		});

		assert.ok(!aMatchedButtons.length, "Should not match any controls");
		sinon.assert.calledWith(this.fnLogSpy, "Found no view with ID 'myFooBarView' and viewName 'notexistingview'");
	});

	QUnit.test("Should not match controls by correct viewName if view ID is wrong", function (assert) {
		var aMatchedButtons = this.oPlugin.getMatchingControls({
			viewId: "myNotExistingView",
			viewName: "bar",
			controlType: "sap.m.Button"
		});

		assert.ok(!aMatchedButtons.length, "Should not match any controls");
		sinon.assert.calledWith(this.fnLogSpy, "Found no view with ID 'myNotExistingView' and viewName 'bar'");
	});

	QUnit.test("Should ignore viewNamespace when matching by viewId", function (assert) {
		var aMatchedButtons = this.oPlugin.getMatchingControls({
			viewNamespace: "someNameSpace",
			viewId: "myFooBarView",
			controlType: "sap.m.Button"
		});

		assert.strictEqual(aMatchedButtons.length, 3, "Should match all controls");
		sinon.assert.calledWith(this.fnLogSpy, "Found view with ID 'myFooBarView' and viewName 'undefined'");
	});

	QUnit.module("OpaPlugin - initialization", {
		beforeEach: function (assert) {
			this.fnLoggerSpy = sinon.spy(Log, "getLogger");
			this.oPlugin =  new OpaPlugin();
		},
		afterEach: function () {
			this.oPlugin.destroy();
			this.fnLoggerSpy.restore();
		}
	});

	QUnit.test("Should not throw an exception if the core is not defined", function(assert) {
		//Arrange
		this.oPlugin.oCore = undefined;

		//Act
		this.oPlugin.getMatchingControls({ id : "foo" });
		this.oPlugin.getMatchingControls({
			controlType : "anything"
		});

		// Assert
		assert.ok(true, "did not throw an exception");
	});

	QUnit.test("Should not throw an exception if the elements of core are not defined", function(assert) {
		//Arrange
		this.oPlugin.oCore = {};

		//Act
		this.oPlugin.getMatchingControls({ id : "foo" });
		this.oPlugin.getMatchingControls({
			controlType : "anything"
		});

		// Assert
		assert.ok(true, "did not throw an exception");
	});

	QUnit.module("OpaPlugin - controls in an open dialog with no view parent", {
		beforeEach: function () {
			this.oButtonOK = new Button("OKButton", {text: "OK"});
			this.oButtonCancel = new Button("cancelButton", {text: "Cancel"});
			this.oCheckBox = new CheckBox("testCheckBox");
			this.oDialog = new Dialog({
				buttons: [this.oButtonOK, this.oButtonCancel],
				content: [this.oCheckBox]
			});
			this.oPlugin = new OpaPlugin();
		},
		afterEach: function () {
			this.oDialog.destroy();
			this.oPlugin.destroy();
		}
	});

	QUnit.test("Should match all controls in an open dialog when no controlType or ID is given", function (assert) {
		var fnStart = assert.async();
		this.oDialog.attachAfterOpen(function () {
			var aControls = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true
			});

			assert.ok(aControls.indexOf(this.oCheckBox) > -1, "Should match check box");
			assert.ok(aControls.indexOf(this.oButtonOK) > -1, "Should match OK Button");
			assert.ok(aControls.indexOf(this.oButtonCancel) > -1, "Should match cancel Button");

			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.test("Should match controls in an open dialog by control type", function (assert) {
		var fnStart = assert.async();
		this.oDialog.attachAfterOpen(function () {
			var aControls = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				controlType: "sap.m.Button"
			});

			assert.strictEqual(aControls.length, 2, "Should match all controls of type Button");
			assert.strictEqual(aControls.indexOf(this.oCheckBox), -1, "Should not match other type of controls");

			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.test("Should match controls in an open dialog by ID", function (assert) {
		var fnStart = assert.async();
		this.oDialog.attachAfterOpen(function () {
			var oControlWithStrictID = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				id: "OKButton"
			});
			var aControlsWithMatchID = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				id: /Button/
			});
			var aControlsWithSomeID = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				id: ["OKButton", "testCheckBox", "someID"]
			});

			assert.strictEqual(oControlWithStrictID, this.oButtonOK, "Should match button with same ID");

			assert.strictEqual(aControlsWithMatchID.length, 2, "Should match all controls with ID matching regex");
			assert.ok(aControlsWithMatchID.indexOf(this.oButtonOK) > -1, "Should match OK Button with ID regex /Button/");
			assert.ok(aControlsWithMatchID.indexOf(this.oButtonCancel) > -1, "Should match cancel Button  with ID regex /Button/");

			assert.strictEqual(aControlsWithSomeID.length, 2, "Should match controls with IDs contained in set");
			assert.ok(aControlsWithSomeID.indexOf(this.oButtonOK) > -1, "Should match OK Button by ID");
			assert.ok(aControlsWithSomeID.indexOf(this.oCheckBox) > -1, "Should match CheckBox by ID");

			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.test("Should not match controls in an open dialog when control type or ID does not match", function (assert) {
		var fnStart = assert.async();
		this.oDialog.attachAfterOpen(function () {
			var aControlsWithMissingID = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				controlType: "sap.m.CheckBox",
				id: /randomID/
			});
			var aControlsWithWrongType = this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				controlType: "sap.m.CheckBox",
				id: /Button/
			});

			assert.ok(!aControlsWithMissingID.length, "Should not match any controls when ID doesn't match");
			assert.ok(!aControlsWithWrongType.length, "Should not match any controls when control type doesn't match");

			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.test("Should skip matching view when no viewId or viewName in options", function (assert) {
		var fnStart = assert.async(),
			fnMatchViewSpy = sinon.spy(this.oPlugin, "_getMatchingView");
		this.oDialog.attachAfterOpen(function () {
			this.oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				id: "OKButton"
			});

			assert.ok(fnMatchViewSpy.notCalled, "No view matching");
			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.module("OpaPlugin - controls in an open dialog with view parent", {
		beforeEach: function (assert) {
			var sViewContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
				'<Dialog id="myDialog">',
				'<Button id="fooInDialog">',
				'</Button>',
				'</Dialog>',
				'<Button id="foo">',
				'</Button>',
				'</mvc:View>'
			].join('');
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return XMLView.create({
				id: "viewWithDialog",
				definition: sViewContent
			}).then(function(oView) {
				this.oView = oView
					.setViewName("testView")
					.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should only match controls in open dialog", function (assert) {
		var oPlugin = new OpaPlugin();
		var fnStart = assert.async();
		var oDialog = Element.getElementById("viewWithDialog--myDialog");
		oDialog.attachAfterOpen(function () {
			var aControls = oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				viewName: "testView",
				controlType: "sap.m.Button"
			});
			assert.strictEqual(aControls.length, 1, "Should match only one control");
			assert.strictEqual(aControls[0].getId(), "viewWithDialog--fooInDialog", "Should match only control inside open dialog");

			fnStart();
		});

		oDialog.open();
	});

	QUnit.test("Should match controls in open dialog by ID and view", function (assert) {
		var oPlugin = new OpaPlugin();
		var fnStart = assert.async();
		var oDialog = Element.getElementById("viewWithDialog--myDialog");
		oDialog.attachAfterOpen(function () {
			var oControlWithViewName = oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				viewName: "testView",
				id: "fooInDialog"
			});

			var oControlWithViewId = oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				viewId: "viewWithDialog",
				id: "fooInDialog"
			});

			var oControlWithViewNameAndId = oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				viewName: "testView",
				viewId: "viewWithDialog",
				id: "fooInDialog"
			});

			assert.strictEqual(oControlWithViewName.getId(), "viewWithDialog--fooInDialog", "Should match button with same ID and ignore viewId prefix when viewName is given");
			assert.strictEqual(oControlWithViewId.getId(), "viewWithDialog--fooInDialog", "Should match button with same ID and ignore viewId prefix when view ID is given");
			assert.strictEqual(oControlWithViewNameAndId.getId(), "viewWithDialog--fooInDialog", "Should match button with same ID and ignore viewId prefix when viewName and view ID are given");

			fnStart();
		});

		oDialog.open();
	});

	QUnit.test("Should match controls in open dialog by ID with no viewName or viewID", function (assert) {
		var oPlugin = new OpaPlugin();
		var fnStart = assert.async();
		var oDialog = Element.getElementById("viewWithDialog--myDialog");
		oDialog.attachAfterOpen(function () {
			var oControlWithStrictID = oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				id: "viewWithDialog--fooInDialog"
			});
			var aControlsWithMatchID = oPlugin.getMatchingControls({
				searchOpenDialogs: true,
				id: /fooInDialog/
			});

			assert.ok(oControlWithStrictID, "Should match button with full ID");
			assert.strictEqual(aControlsWithMatchID.length, 1, "Should match all controls with ID matching regex");

			fnStart();
		});

		oDialog.open();
	});

	QUnit.module("OpaPlugin - matchers", {
		beforeEach: function () {
			this.oPlugin =  new OpaPlugin();
			this.oButton = new Button("foo").placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oPlugin.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Should invoke the interactable matcher if interactable is true", function(assert) {
		// Arrange
		var fnInteractableSpy = this.spy(Interactable.prototype, "isMatching");

		// Act
		this.oPlugin.getMatchingControls({
			id: "foo",
			interactable: true
		});

		// Assert
		sinon.assert.calledOnce(fnInteractableSpy);
	});

	QUnit.test("Should not call the autoWaiter or interactable if visible is false", function (assert) {
		// Arrange
		var fnInteractableSpy = this.spy(Interactable.prototype, "isMatching"),
			fnWaitSpy = this.spy(_autoWaiter, "hasToWait");

		// Act
		var oResult = this.oPlugin._getFilteredControls({
			autoWait: true,
			visible: false,
			id: this.oButton.getId()
		});

		// Assert
		sinon.assert.notCalled(fnWaitSpy);
		sinon.assert.notCalled(fnInteractableSpy);
		assert.strictEqual(oResult.getId() ,this.oButton.getId());
	});

	QUnit.test("Should use enabled matcher depending on interactablity", function(assert) {
		var fnEnabledSpy = this.spy(_Enabled.prototype, "isMatching");

		this.oPlugin.getMatchingControls({
			id: "foo",
			interactable: false
		});

		sinon.assert.notCalled(fnEnabledSpy);

		this.oPlugin.getMatchingControls({
			id: "foo",
			enabled: false,
			interactable: true
		});

		sinon.assert.notCalled(fnEnabledSpy);

		this.oPlugin.getMatchingControls({
			id: "foo",
			interactable: true
		});

		sinon.assert.calledOnce(fnEnabledSpy);
	});

	QUnit.module("OpaPlugin - Should know if it is looking for a Control", {
		beforeEach: function () {
			// System under Test
			this.oPlugin = new OpaPlugin();
		},
		afterEach: function () {
			this.oPlugin.destroy();
		}
	});

	[{
		value: "foo",
		expected: true
	},{
		value: null,
		expected: false
	}, {
		value: undefined,
		expected: false
	}].forEach(function (valueAndExpected) {
		[{
			options: { id : valueAndExpected.value },
			testedProperty: "id"
		},{
			options: { viewName : valueAndExpected.value },
			testedProperty: "viewName"
		},{
			options: { viewId : valueAndExpected.value },
			testedProperty: "viewId"
		},{
			options: { controlType : valueAndExpected.value },
			testedProperty: "controlType"
		},{
			options: { searchOpenDialogs : valueAndExpected.value },
			testedProperty: "searchOpenDialogs"
		}].forEach(function (testDefinition) {

			QUnit.test("Should return " + valueAndExpected.expected + " for a " + (valueAndExpected.value ? "defined" : "falsy") + " " + testDefinition.testedProperty , function (assert) {
				var oOpaPlugin = new OpaPlugin();
				var bResult = oOpaPlugin._isLookingForAControl(testDefinition.options);

				assert.strictEqual(bResult, valueAndExpected.expected);
				oOpaPlugin.destroy();
			});

		});
	});

	["foo", null, undefined, true, 0, 1].forEach(function (value) {
		QUnit.test("Should return false for an unknown property with the value " + value , function (assert) {
			var oOpaPlugin = new OpaPlugin();
			var bResult = oOpaPlugin._isLookingForAControl({
				foo: value
			});

			assert.ok(!bResult, "should never look for a control");
			oOpaPlugin.destroy();
		});
	});

	QUnit.module("OpaPlugin - Prepare a correct viewName", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			this.oPlugin = new OpaPlugin();
			return viewUtils.createXmlView("sample.viewNamespace.viewName", "myViewSample").then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
			this.oPlugin.destroy();
		}
	});

	[{
		viewNamespace: "",
		viewName: "sample.viewNamespace.viewName"
	},{
		viewNamespace: "",
		viewName: ".sample.viewNamespace.viewName"
	},{
		viewNamespace: "sample.viewNamespace",
		viewName: "viewName"
	},{
		viewNamespace: "sample.viewNamespace.",
		viewName: "viewName"
	},{
		viewNamespace: "sample.viewNamespace",
		viewName: ".viewName"
	},{
		viewNamespace: "sample.viewNamespace.",
		viewName: ".viewName"
	}].forEach(function (value) {
		QUnit.test("Should find matching controls", function (assert) {
			value.visible = false;
			var aAllControlsInTheView = this.oPlugin.getMatchingControls(value);
			assert.strictEqual(aAllControlsInTheView.length, 4);
		});
	});

	QUnit.module("OpaPlugin - getView", {
		beforeEach: function (assert) {
			this.oPlugin = new OpaPlugin();
			this.fnLogSpy = sinon.spy(this.oPlugin._oLogger, "debug");
			this.sViewName = "sample.viewNamespace.viewName";
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return Promise.all([
				viewUtils.createXmlView(this.sViewName, "mySampleView"),
				viewUtils.createXmlView(this.sViewName, "myOtherView"),
				viewUtils.createXmlView("differentName", "myDifferentlyNamedView")
			]).then(function(aViews) {
				this.oSampleView = aViews[0].placeAt("qunit-fixture");
				this.oDuplicateView = aViews[1].placeAt("qunit-fixture");
				this.oDifferentView = aViews[2].placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.fnLogSpy.restore();
			this.oSampleView.destroy();
			this.oDuplicateView.destroy();
			this.oDifferentView.destroy();
		}
	});

	QUnit.test("Should filter invisible views with a duplicate name", function (assert) {
		this.oDuplicateView.$().css("visibility", "hidden"); // hide view

		var aViews = this.oPlugin.getAllControls(View, "View");
		var oMatchedView = this.oPlugin.getView(this.sViewName);

		assert.strictEqual(aViews.length, 3, "Should find all controls of type View");
		assert.strictEqual(oMatchedView.getId(), "mySampleView", "Should match only visible views");
		sinon.assert.calledWith(this.fnLogSpy, "Found 2 views with viewName '" + this.sViewName + "'");
		sinon.assert.calledWith(this.fnLogSpy, "Found 1 visible views with viewName '" + this.sViewName + "'");


		this.oDuplicateView.destroy();

		// Note: This test is executed with QUnit 1 and QUnit 2.
		//       We therefore cannot rely on the built-in promise handling of QUnit 2.
		return viewUtils.createXmlView(this.sViewName, "myOtherView").then(async function(oView) {
			this.oDuplicateView = oView;  // do not render view
			await nextUIUpdate();

			assert.strictEqual(aViews.length, 3, "Should find all controls of type View");
			assert.strictEqual(oMatchedView.getId(), "mySampleView", "Should match only rendered views");
			sinon.assert.calledWith(this.fnLogSpy, "Found 2 views with viewName '" + this.sViewName + "'");
			sinon.assert.calledWith(this.fnLogSpy, "Found 1 visible views with viewName '" + this.sViewName + "'");
		}.bind(this), function(oErr) {
			assert.strictEqual(oErr, undefined, "failed to load view");
		});
	});

	QUnit.test("Should return nothing when more than one visible views have the same name", function (assert) {
		var aViews = this.oPlugin.getAllControls(View, "View");
		var oMatchedView = this.oPlugin.getView(this.sViewName);

		assert.strictEqual(aViews.length, 3, "Should find all controls of type View");
		assert.ok(!oMatchedView, "Should not match views with duplicate name");
		sinon.assert.calledWith(this.fnLogSpy, "Found 2 views with viewName '" + this.sViewName + "'");
		sinon.assert.calledWith(this.fnLogSpy, "Found 2 visible views with viewName '" + this.sViewName + "'");
		sinon.assert.calledWithMatch(this.fnLogSpy, "Please provide viewId");
	});

	QUnit.test("Should not filter out invisible views that have a unique viewname", function (assert) {
		var aViews = this.oPlugin.getAllControls(View, "View");
		var oMatchedView = this.oPlugin.getView("differentName");

		assert.strictEqual(aViews.length, 3, "Should find all controls of type View");
		assert.strictEqual(oMatchedView.getId(), "myDifferentlyNamedView", "Should match invisible views when they have a 'unique' name");
		sinon.assert.calledWith(this.fnLogSpy, "Found 1 views with viewName 'differentName'");
	});

	QUnit.module("OpaPlugin - fragmentId in view-relative match", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return viewUtils.createXmlView("testViewName", "myView", {
				id: "testFragment",
				name: "fixture.OpaPlugin"
			}).then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should match controls by fragment ID inside view", function (assert) {
		testWithFragmentId(new OpaPlugin(), assert);
	});

	QUnit.module("OpaPlugin - fragmentId in static area", {
		beforeEach: function (assert) {
			var sView = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:l="sap.ui.layout" xmlns="sap.m">',
				'<Dialog id="myDialog">',
				'<core:Fragment id="testFragment" fragmentName="fixture.OpaPlugin" type="JS"/>',
				'</Dialog>',
				'</mvc:View>'
			].join('');
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return XMLView.create({
				id: "myView",
				definition: sView
			}).then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should match controls by fragment ID inside static area", function (assert) {
		var fnStart = assert.async();
		var oDialog = Element.getElementById("myView--myDialog");
		oDialog.attachAfterOpen(function () {
			testWithFragmentId(new OpaPlugin(), assert);
			fnStart();
		});

		oDialog.open();
	});

	function testWithFragmentId(oPlugin, assert) {
		var oMatchingString = oPlugin.getMatchingControls({
			viewId: "myView",
			fragmentId: "testFragment",
			id: "fragmentButton"
		});
		var aMatchingRegex = oPlugin.getMatchingControls({
			viewId: "myView",
			fragmentId: "testFragment",
			id: /^frag.*Bu/
		});
		var aMatchingArray = oPlugin.getMatchingControls({
			viewId: "myView",
			fragmentId: "testFragment",
			id: ["fragmentButton", "test"]
		});
		var oMatchingWrongFragment = oPlugin.getMatchingControls({
			viewId: "myView",
			fragmentId: "otherFragment",
			id: "fragmentButton"
		});

		assert.ok(oMatchingString.getId(), "myView--testFragment--fragmentButton", "Should match button inside fragment  by string ID");
		assert.strictEqual(aMatchingRegex.length, 1, "Should match only inside view and fragment");
		assert.ok(aMatchingRegex[0].getId(), "myView--testFragment--fragmentButton", "Should match button inside fragment");
		assert.strictEqual(aMatchingArray.length, 1, "Should match only inside view and fragment");
		assert.ok(aMatchingArray[0].getId(), "myView--testFragment--fragmentButton", "Should match button inside fragment");
		assert.ok(!oMatchingWrongFragment, "Should not match with wrong fragmentID");
	}

	// hack for IE - dialog introduces a global when opened so i open it before the test starts
	new Dialog().open().destroy();
});

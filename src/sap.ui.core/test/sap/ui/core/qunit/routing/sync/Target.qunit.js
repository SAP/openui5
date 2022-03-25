/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/strings/formatMessage",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/Target",
	"sap/ui/core/routing/Views",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Panel"
], function (Log, formatMessage, View, Target, Views, JSONModel, App, Button, Panel) {
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	function addClock() {
		if ( this.clock == null && this._oSandbox ) {
			this.clock = this._oSandbox.useFakeTimers();
		}
	}

	function createView (aContent, sId) {
		var sXmlViewContent = aContent.join(''),
				oViewOptions = {
					id : sId,
					viewContent: sXmlViewContent,
					type: "XML"
				};

		return sap.ui.view(oViewOptions);
	}

	QUnit.module("views - creation", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();
			this.oViews = new Views();
			this.oView = createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);

			// System under test + Arrange
			this.oTarget = new Target(
				{
					key: "myTarget",
					viewPath: "bar",
					viewName: "foo",
					controlAggregation: "content",
					controlId: this.oShell.getId(),
					viewType: "XML",
					viewId: "baz"
				},
				this.oViews
			);
		},
		afterEach: function () {
			this.oShell.destroy();
			this.oTarget.destroy();
			this.oViews.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("Should create a view specified by a target", function (assert) {
		// Arrange
		var oButton = new Button();

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oButton;
		});

		// Act
		this.oTarget.display();

		// Assert
		assert.strictEqual(oButton.getParent(), this.oShell, "the view was placed inside of the shell");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Should pass the correct values to the view creation", function (assert) {
		// Arrange
		var that = this,
			oStub = this.stub(this.oViews, "_getView").callsFake(function (oOptions) {
				assert.strictEqual(oOptions.name, "bar.foo");
				assert.strictEqual(oOptions.type, "XML");
				assert.strictEqual(oOptions.id, "baz");
				return that.oView;
			});

		//Act
		this.oTarget.display();

		// Assert
		assert.strictEqual(oStub.callCount, 1, "Did inform the view creation");
	});

	QUnit.test("Should use the _getView to create a unprefixed id if _bUseRawViewId is set", function (assert) {
		// Arrange
		var that = this,
			oSpy = this.spy(this.oViews, "_getView"),
			oStub = this.stub(this.oViews, "_getViewWithGlobalId").callsFake(function (oOptions) {
				assert.strictEqual(oOptions.name, "bar.foo");
				assert.strictEqual(oOptions.type, "XML");
				assert.strictEqual(oOptions.id, "baz");
				return that.oView;
			});

		//Act
		this.oTarget._bUseRawViewId = true;
		this.oTarget.display();

		// Assert
		assert.strictEqual(oStub.callCount, 1, "Did inform the view creation");
		assert.strictEqual(oSpy.callCount, 1, "Did use the non-prefix version");
		assert.strictEqual(oSpy.getCall(0).args[1], true, "Did use the non-prefix version");
	});

	QUnit.test("Should clear a target aggregation", function (assert) {
		// Arrange
		var oButton = new Button(),
			oExistingButton = new Button();

		this.oTarget._oOptions.clearControlAggregation = true;
		this.oShell.addContent(oExistingButton);

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oButton;
		});

		// Act
		this.oTarget.display();

		// Assert
		assert.strictEqual(this.oShell.getContent().length, 1, "only one button is inside of the Shell");
		assert.strictEqual(this.oShell.getContent()[0], oButton, "it is the displayed button");
		//TODO: Should we destroy in this case? Is it a regression if we do so?
		//assert.ok(oExistingButton.bIsDestroyed, "the button got destroyed");

		// Cleanup
		oButton.destroy();
		oExistingButton.destroy();
	});

	QUnit.test("Should log an error if the target parent is not found", function (assert) {

		// Arrange
		var oStub = this.stub(Log, "error");

		this.oTarget._oOptions.rootView = "foo";

		//Act
		this.oTarget.display();

		// Assert
		sinon.assert.calledWith(oStub, sinon.match(/root view/), sinon.match(this.oTarget));
	});

	QUnit.test("Should log an error if the target control does not have an nonexistion aggregation specified", function (assert) {

		// Arrange
		var oStub = this.stub(Log, "error");

		this.oTarget._oOptions.controlAggregation = "foo";

		//Act
		this.oTarget.display();

		// Assert
		sinon.assert.calledWith(oStub, sinon.match(/aggregation/), sinon.match(this.oTarget));
	});

	QUnit.test("Should log an error if the target control does not have an aggregation specified", function (assert) {

		// Arrange
		var oStub = this.stub(Log, "error");

		this.oTarget._oOptions.controlAggregation = undefined;

		//Act
		this.oTarget.display();

		// Assert
		sinon.assert.calledWith(oStub, sinon.match(/no 'controlAggregation' was set/), sinon.match(this.oTarget));
	});

	QUnit.test("Should log an error if the target control could not be found", function (assert) {

		// Arrange
		var oStub = this.stub(Log, "error");

		this.oTarget._oOptions.controlId = "foo";

		//Act
		this.oTarget.display();

		// Assert
		sinon.assert.calledWith(oStub, sinon.match(/Control with ID/), sinon.match(this.oTarget));
	});


	QUnit.module("target parent and children", {
		beforeEach: function () {
			this.oParentView = createView(
					['<View xmlns="sap.ui.core.mvc" xmlns:m="sap.m">',
						'<m:Panel id="myShell">',  // use sap.m.Panel as a lightweight substitute for sap.ui.ux3.Shell
						'</m:Panel>',
					'</View>'], "parent");

			this.oChildView = createView(
					['<View xmlns="sap.ui.core.mvc">',
					'</View>']);

			this.oViews = new Views();
			this.oViews.setView("child", this.oChildView);

			// System under test + Arrange
			this.oTarget = new Target(
					{
						controlId: "myShell",
						controlAggregation: "content",
						viewName: "child",
						viewType: "XML"
					},
					this.oViews
			);
		},
		afterEach: function () {
			this.oParentView.destroy();
			this.oChildView.destroy();
			this.oTarget.destroy();
			this.oViews.destroy();
		}
	});

	QUnit.test("Should use a different root view", function (assert) {
		// Arrange
		this.oTarget._oOptions.rootView = "parent";
		this.oViews.setView("parent", this.oParentView);

		// Act
		this.oTarget.display();

		// Assert
		var oShell = this.oParentView.byId("myShell");
		assert.strictEqual(oShell.getContent().length, 1, "something was placed inside the shell");
		assert.strictEqual(oShell.getContent()[0], this.oChildView, "it is the child view");
	});

	QUnit.test("Should display a child target", function (assert) {
		// Arrange
		var oRootShell = new ShellSubstitute(),
			oParentTarget = new Target({
				controlId : oRootShell.getId(),
				controlAggregation: "content",
				viewName: "parent",
				viewType: "XML"
			},
			this.oViews);

		this.oViews.setView("parent", this.oParentView);

		this.oTarget._oParent = oParentTarget;

		// Act
		this.oTarget.display();

		// Assert
		var oShell = this.oParentView.byId("myShell");
		assert.strictEqual(oShell.getContent().length, 1, "something was placed inside the shell");
		assert.strictEqual(oShell.getContent()[0], this.oChildView, "it is the child view");

		// Cleanup
		oParentTarget.destroy();
	});

	QUnit.module("display event", {
		beforeEach: function () {
			addClock.call(this);
			this.oShell = new ShellSubstitute();
			this.oView =  createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);

			this.oConfig = {
				key: "myTarget",
				viewPath: "bar",
				viewName: "foo",
				controlAggregation: "content",
				controlId: this.oShell.getId(),
				viewType: "XML",
				viewId: "baz"
			};

			this.oViews = new Views();
			// System under test + Arrange
			this.oTarget = new Target(
					this.oConfig,
					this.oViews
			);
		},
		afterEach: function () {
			this.oShell.destroy();
			this.oTarget.destroy();
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
			oAttachReturnValue = this.oTarget.attachDisplay(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oTarget.fireDisplay(oParameters);
		oDetachReturnValue = this.oTarget.detachDisplay(fnEventSpy, oListener);
		this.oTarget.fireDisplay();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oTarget, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oTarget, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oTarget, "did return this for chaining for fire");
	});

	QUnit.test("Should fire the display event", function (assert) {
		// Arrange
		var oData = { any: "object" },
			that = this,
			oParameters = null,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.stub(this.oViews, "_getView").callsFake(function () {
			return that.oView;
		});

		this.oTarget.attachDisplay(fnEventSpy);

		// Act
		this.oTarget.display(oData);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
		assert.strictEqual(oParameters.view, this.oView, "view got passed to the event");
		assert.strictEqual(oParameters.control, this.oShell, "control got passed to the event");
		assert.strictEqual(oParameters.config, this.oConfig, "config got passed to the event");
		assert.strictEqual(oParameters.data, oData, "data got passed to the event");
	});

	QUnit.module("titleChanged event", {
		beforeEach: function () {
			this.oApp = new App();
			this.oView =  createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);

			this.oConfig = {
				key: "myTarget",
				viewPath: "bar",
				viewName: "foo",
				controlAggregation: "pages",
				controlId: this.oApp.getId(),
				viewType: "XML"
			};

			this.oViews = new Views();
			this.oViews.setView("bar.foo", this.oView);

		},
		afterEach: function () {
			this.oApp.destroy();
			this.oTarget.destroy();
			this.oViews.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("static text", function(assert) {
		var done = assert.async(),
			sTitle = "myTitle";

		this.oConfig.title = sTitle;

		// System under test + Arrange
		this.oTarget = new Target(
			this.oConfig,
			this.oViews
		);

		this.oTarget.attachTitleChanged(function(oEvent) {
			assert.equal(oEvent.getParameter("title"), sTitle);
			done();
		});

		this.oTarget.display();
	});

	QUnit.test("static text - not displayed", function(assert) {
		var sTitle = "myTitle",
			oSpy = this.spy();

		this.oConfig.title = sTitle;

		// System under test + Arrange
		this.oTarget = new Target(
				this.oConfig,
				this.oViews
		);

		this.oTarget.attachTitleChanged(oSpy);

		sinon.assert.notCalled(oSpy);
	});

	QUnit.test("normal binding", function(assert) {
		var done = assert.async(),
			sTitle = "myTitle",
			oModel = new JSONModel({
				title : sTitle
			});

		this.oView.setModel(oModel, "myModel");
		this.oConfig.title = "{myModel>/title}";

		// System under test + Arrange
		this.oTarget = new Target(
				this.oConfig,
				this.oViews
		);

		this.oTarget.attachTitleChanged(function(oEvent) {
			assert.equal(oEvent.getParameter("title"), sTitle);
			done();
		});

		this.oTarget.display();
	});

	QUnit.test("composite binding", function(assert) {
		var done = assert.async(),
			sTemplate = "Track trace of product {0}",
			sProductName = "Laptop",
			oModel = new JSONModel({
				productName : sProductName
			}),
			i18nModel = new JSONModel({
				title : sTemplate
			}),
			sResult = formatMessage(sTemplate, sProductName);

		this.oApp.setModel(i18nModel, "i18n");
		this.oView.setModel(oModel, "myModel");
		this.oConfig.title = {
			parts: ["i18n>/title", "myModel>/productName"],
			formatter: formatMessage
		};

		// System under test + Arrange
		this.oTarget = new Target(
				this.oConfig,
				this.oViews
		);

		this.oTarget.attachTitleChanged(function(oEvent) {
			assert.equal(oEvent.getParameter("title"), sResult);
			done();
		});

		this.oTarget.display();
	});

	QUnit.test("title with complex binding string (simulate configuration passed from manifest.json)", function(assert) {
		var done = assert.async();
		var sProductName = "laptop";
		var oModel = new JSONModel({
			productName: sProductName
		});
		var fnUpperFirstLetter = function(sInput) {
			return sInput.substring(0, 1).toUpperCase() + sInput.substring(1);
		};
		var sProductNameToCompare = fnUpperFirstLetter(sProductName);
		this.oView.setModel(oModel);
		this.oConfig.title = "{path:'/productName', formatter: '.rename'}";
		this.oView.getController = function() {
			return {
				rename: fnUpperFirstLetter
			};
		};
		this.oTarget = new Target(this.oConfig, this.oViews);

		this.oTarget.attachTitleChanged(function(oEvent) {
			assert.equal(oEvent.getParameter("title"), sProductNameToCompare);
			done();
		});

		this.oTarget.display();
	});

	QUnit.test("no title set", function(assert) {
		var done = assert.async(),
			oTitleChangedSpy;

		// System under test + Arrange
		this.oTarget = new Target(
				this.oConfig,
				this.oViews
		);

		oTitleChangedSpy = this.spy();
		assert.notOk(this.oTarget._oTitleProvider, "TitleProvider should not be instantiated");

		// attach an event handler to the titleChanged event
		this.oTarget.attachTitleChanged(oTitleChangedSpy);

		// use display event to check whether the titleChanged event is fired
		this.oTarget.attachDisplay(function(oEvent) {
			sinon.assert.notCalled(oTitleChangedSpy);
			done();
		});

		this.oTarget.display();
	});

	QUnit.test("move TitleProvider instance between views or within the same view shouldn't call invalidate", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oView, "invalidate");
		this.oConfig.title = "myTitle";
		this.oTarget = new Target(this.oConfig, this.oViews);

		var fnDisplayed = function() {
			this.oTarget.detachDisplay(fnDisplayed);
			this.oTarget.attachDisplay(fnDisplayedAgain);
			this.oTarget.display();
		}.bind(this);

		var fnDisplayedAgain = function() {
			assert.notOk(oInvalidateSpy.called, "oView shouldn't be invalidated");
			oInvalidateSpy.restore();
		};

		this.oTarget.attachDisplay(fnDisplayed);
		this.oTarget.display();
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all dependencies", function (assert) {
		// Arrange
		var oParentTarget = new Target({}),
				oViews = new Views();

		// System under test
		var oTarget = new Target(
			{
				title : "myTitle"
			},
			oViews,
			oParentTarget
		);

		var oTitleProvider = oTarget._oTitleProvider;

		// Act
		oTarget.destroy();

		// Assert
		assert.ok(oTarget.bIsDestroyed, "Did flag the target as destroyed");
		assert.strictEqual(oTarget._oParent, null, "Did free the parent reference");
		assert.strictEqual(oTarget._oCache, null, "Did free the views reference");
		assert.notOk(oViews.bIsDestroyed, "Did not destroy the views instance");
		assert.strictEqual(oTarget._oOptions, null, "Did free the options reference");
		assert.ok(oTitleProvider.bIsDestroyed, "TitleProvider is destroyed");
		assert.strictEqual(oTarget._oTitleProvider, null, "Did free the TitleProvider");

		// Cleanup
		oParentTarget.destroy();
		oViews.destroy();
	});
});

/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/strings/formatMessage",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/Target",
	"sap/ui/core/routing/Views",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Panel",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/thirdparty/hasher"
], function(Log, formatMessage, View, Target, Views, JSONModel, App, Panel, Component, UIComponent, ComponentContainer, hasher) {
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	function createView (aContent, sId, bAsync) {
		var sXmlViewContent = aContent.join(''),
			oViewOptions = {
				id : sId,
				viewContent: sXmlViewContent,
				type: "XML",
				async: !!bAsync
			};

		if (bAsync instanceof Promise) {
			var pLoaded = bAsync;
			pLoaded = pLoaded.then(function() {
				return sap.ui.view(oViewOptions);
			});

			return {
				loaded: function() {
					return pLoaded;
				}
			};
		} else {
			return sap.ui.view(oViewOptions);
		}
	}

	QUnit.module("views - creation", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();
			this.oViews = new Views({async: true});
			this.oView = createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);

			// System under test + Arrange
			this.oTarget = new Target(
				{
					name: "myTarget",
					viewPath: "bar",
					viewName: "foo",
					controlAggregation: "content",
					controlId: this.oShell.getId(),
					viewType: "XML",
					viewId: "baz",
					_async: true
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
		var oView = this.oView;

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oView;
		});

		// Act
		var oDisplayed = this.oTarget.display();



		return oDisplayed.then(function() {
			// Assert
			assert.strictEqual(oView.getParent(), this.oShell, "the view was placed inside of the shell");
		}.bind(this));

	});

	QUnit.test("Should resolve with correct values for view creation", function (assert) {
		// Arrange
		var that = this,
			oStub = this.stub(this.oViews, "_getView").callsFake(function (oOptions) {
				return that.oView;
			});

		//Act
		return this.oTarget.display().then(function(oOptions) {
			//Assert
			assert.strictEqual(oStub.callCount, 1, "Did inform the view creation");
			assert.strictEqual(oOptions.view, that.oView);
			assert.strictEqual(oOptions.control, that.oShell);
		});
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
		var oDisplayed = this.oTarget.display();

		// Assert
		assert.strictEqual(oStub.callCount, 1, "Did inform the view creation");

		return oDisplayed;
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
		var oDisplayed = this.oTarget.display();

		// Assert
		assert.strictEqual(oStub.callCount, 1, "Did inform the view creation");
		assert.strictEqual(oSpy.callCount, 1, "Did use the non-prefix version");
		assert.strictEqual(oSpy.getCall(0).args[1], true, "Did use the non-prefix version");

		return oDisplayed;
	});

	QUnit.test("Should clear a target aggregation", function (assert) {
		// Arrange
		var oExistingView = this.oView,
			oView = createView(['<View xmlns="sap.ui.core.mvc">', '</View>']);

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oView;
		});

		this.oTarget._oOptions.clearControlAggregation = true;
		this.oShell.addContent(oExistingView);

		// Act
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
			// Assert
			assert.strictEqual(this.oShell.getContent().length, 1, "only one button is inside of the Shell");
			assert.strictEqual(this.oShell.getContent()[0], oView, "it is the displayed button");
			//TODO: Should we destroy in this case? Is it a regression if we do so?
			//assert.ok(oExistingButton.bIsDestroyed, "the button got destroyed");

			// Cleanup
			oView.destroy();
		}.bind(this));

	});

	QUnit.test("Should return a rejected promise if the target view can't be loaded", function (assert) {
		// Arrange
		this.stub(this.oViews, "_getView").callsFake(function () {
			return {
				loaded: function() {
					return Promise.reject("View with name bar.foo could not be loaded");
				},
				isA: function(sClass) {
					return sClass === "sap.ui.core.mvc.View";
				}
			};
		});

		//Act
		var oDisplayed = this.oTarget.display();
		return oDisplayed.then(function() {
				assert.ok(false, "Promise shouldn't be resolved");
			}, function(sError) {
				assert.equal(sError, "View with name bar.foo could not be loaded", "Error message is correct");
			});
	});

	QUnit.test("Should return a rejected promise if the target parent is not found", function (assert) {
		// Arrange
		var oView = this.oView;
		this.oTarget._oParent = new Target(
			{
				name: "myParent",
				viewPath: "parent",
				viewName: "foo",
				controlAggregation: "content",
				controlId: this.oShell.getId(),
				viewType: "XML",
				viewId: "bar",
				_async: true
			},
			this.oViews
		);

		this.stub(this.oViews, "_getView").callsFake(function (oOptions) {
			if (oOptions.name === "myTarget") {
				return oView;
			} else {
				return {
					loaded: function() {
						return Promise.reject("View with name parent.foo could not be loaded");
					},
					isA: function(sClass) {
						return sClass === "sap.ui.core.mvc.View";
					}
				};
			}
		});

		//Act
		var oDisplayed = this.oTarget.display();
		return oDisplayed.then(function() {
				assert.ok(false, "The promise shouldn't resolve");
			}, function(sError) {
				// Assert
				assert.equal(sError, "View with name parent.foo could not be loaded", "oViewInfo.error error message is provided");
			});
	});

	QUnit.test("Should return a rejected promise if the root view is not found", function (assert) {
		// Arrange
		var oView = this.oView;
		this.stub(this.oViews, "_getView").callsFake(function () {
			return oView;
		});

		this.oTarget._oOptions.rootView = "foo";

		//Act
		var oDisplayed = this.oTarget.display();
		return oDisplayed.then(function() {
				assert.ok(false, "The promise shouldn't resolve");
			}, function(oError) {
				// Assert
				assert.ok(oError instanceof Error, "The promise is rejected with error information");
				assert.equal(oError.message, "Did not find the root view with the id foo - Target: myTarget", "The error message is correct");
			});
	});

	QUnit.test("Should return a rejected promise if the target control does not have an existing aggregation specified", function (assert) {
		// Arrange
		var oView = this.oView;

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oView;
		});

		this.oTarget._oOptions.controlAggregation = "foo";

		//Act
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
				assert.ok(false, "The promise shouldn't resolve");
			}, function(oError) {
				// Assert
				assert.ok(oError instanceof Error, "The promise is rejected with an error object");
				assert.ok(/Control __panel\d+ does not have an aggregation called foo - Target: myTarget/.test(oError.message), "The error message is correct");
			});
	});

	QUnit.test("Should return a rejected promise if the target control does not have an aggregation specified", function (assert) {
		// Arrange
		var oView = this.oView;

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oView;
		});
		this.oTarget._oOptions.controlAggregation = undefined;

		//Act
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
				assert.ok(false, "The promise shouldn't resolve");
			}, function(oError) {
				// Assert
				assert.ok(oError instanceof Error, "The promise is rejected with an error object");
				assert.equal(oError.message, "The target myTarget has a control id or a parent but no 'controlAggregation' was set, so the target could not be displayed. - Target: myTarget", "The error message is correct");
			});
	});

	QUnit.test("Should return a rejected promise if the target control could not be found", function (assert) {
		// Arrange
		var oView = this.oView;

		this.stub(this.oViews, "_getView").callsFake(function () {
			return oView;
		});
		this.oTarget._oOptions.controlId = "foo";

		//Act
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
				assert.ok(false, "The promise shouldn't resolve");
			}, function(oError) {
				// Assert
				assert.ok(oError instanceof Error, "The promise is rejected with an error object");
				assert.equal(oError.message, "Control with ID foo could not be found - Target: myTarget", "The error message is correct");
			});
	});

	QUnit.module("component - creation", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();
			this.oViews = new Views({async: true});

			// System under test + Arrange
			this.oTarget = new Target(
				{
					_name: "componentTarget",
					path: "test.routing",
					name: "target",
					controlAggregation: "content",
					controlId: this.oShell.getId(),
					type: "Component",
					id: "baz",
					_async: true,
					options: {
						manifest: false
					}
				},
				this.oViews
			);

			this.sandbox = sinon.sandbox.create();
		},
		afterEach: function () {
			this.oShell.destroy();
			this.oTarget.destroy();
			this.oViews.destroy();
			this.sandbox.restore();
		}
	});

	QUnit.test("Should load the component specified by a target", function (assert) {
		var oCreationSpy = this.sandbox.spy(Component, "create"),
			oDisplayed,
			oCreationPromise,
			bComponentCreated,
			oCreatedComponent;

		// Act
		oDisplayed = this.oTarget.display();
		assert.equal(oCreationSpy.callCount, 1, "Component create function is called");

		oCreationPromise = oCreationSpy.getCall(0).returnValue;
		oCreationPromise.then(function (oComponent) {
			bComponentCreated = true;
			oCreatedComponent = oComponent;
		});

		return oDisplayed.then(function(oInfo) {
			// Assert
			assert.ok(bComponentCreated, "component should be created before the display promise resolves");
			assert.strictEqual(oInfo.name, "componentTarget", "The name of the target is included in the resolve info");
			assert.strictEqual(oInfo.control, this.oShell, "The container is passed into the resolve info");
			assert.ok(oInfo.view.isA("sap.ui.core.ComponentContainer"), "The return value should be an ComponentContainer");
			assert.strictEqual(oInfo.view.getComponent(), oCreatedComponent.getId(), "The loaded component is added to the ComponentContainer");
			assert.strictEqual(oInfo.view.getParent(), this.oShell, "The loaded component is placed into the shell");
		}.bind(this));
	});

	QUnit.test("Should destroy the component container once the component is destroyed", function (assert) {
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function (oInfo) {
			var oComponentContainer = oInfo.view,
				oDestroySpy = this.sandbox.spy(oComponentContainer, "destroy");

			// Act
			this.oViews.destroy();

			// callCount === 2 because the component instance is cache under both "undefined" and "baz" keys. We loop
			// through all existing keys and call destroy on the single instance twice
			assert.equal(oDestroySpy.callCount, 2, "The component container is also destroyed once the cache is destroyed");
		}.bind(this));
	});

	QUnit.module("component - ComponentContainer integration", {
		beforeEach: function(assert) {
			hasher.setHash("");
			this.fnInitRouter = function() {
				UIComponent.prototype.init.apply(this, arguments);
				this.getRouter().initialize();
			};

			sap.ui.jsview("root", {
				createContent : function() {
					return new ShellSubstitute(this.createId("shell"));
				}
			});

			this.Component = UIComponent.extend("namespace.RootComponent", {
				metadata : {
					routing:  {
						config: {
							async: true
						},
						routes: [
							{
								pattern: "",
								name: "home",
								target: {
									name: "home",
									prefix: "nested"
								}
							}
						],
						targets: {
							home: {
								name: "namespace.NestedComponent",
								id: "nestedComponent",
								type: "Component",
								controlId: "shell",
								controlAggregation: "content",
								options: {
									manifest: false
								},
								containerOptions: {
									option:true,
									width: "90%"
								}
							}
						}
					}
				},
				createContent: function() {
					return sap.ui.jsview("root");
				},
				init : this.fnInitRouter
			});


			sap.ui.predefine("namespace/NestedComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				this.nestedComponent = UIComponent.extend("namespace.NestedComponent");
				return this.nestedComponent;
			}.bind(this));
		},
		afterEach: function () {
			hasher.setHash("");
		}
	});

	QUnit.test("pass settings to component container", function(assert) {
		this.oContainerOptions = undefined;
		var oComponentContainerSettingsSpy = this.spy(ComponentContainer.prototype, "applySettings");
		var oComponent = new this.Component("rootComponent");
		var oRouter = oComponent.getRouter();
		assert.ok(oRouter);
		return new Promise(function(resolve) {
			oRouter.getRoute("home").attachMatched(resolve);
			oRouter.navTo("home");
		}).then(function() {
			sinon.assert.calledWithMatch(oComponentContainerSettingsSpy, sinon.match({
				component: sinon.match(function(oComponent) {
					return oComponent.getId() === "rootComponent---nestedComponent";
				}),
				height: "100%",
				width: "90%",
				lifecycle: "Application",
				option: true
			}));
			oComponent.destroy();
		});
	});

	QUnit.test("suspend a component target which doesn't have router", function(assert) {
		var oComponent = new this.Component("rootComponent");
		var oRouter = oComponent.getRouter();
		var oTarget = oRouter.getTarget("home");

		assert.ok(oTarget, "The target can be found");

		return new Promise(function(resolve) {
			oRouter.getRoute("home").attachMatched(resolve);
		}).then(function() {
			try {
				oTarget.suspend();
				oComponent.destroy();
			} catch (error) {
				assert.ok(false, "error is caught which shouldn't occur");
			}
		});
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

			this.oViews = new Views({async: true});
			this.oViews.setView("child", this.oChildView);

			// System under test + Arrange
			this.oTarget = new Target(
				{
					controlId: "myShell",
					controlAggregation: "content",
					viewName: "child",
					viewType: "XML",
					_async: true
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
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
			// Assert
			var oShell = this.oParentView.byId("myShell");
			assert.strictEqual(oShell.getContent().length, 1, "something was placed inside the shell");
			assert.strictEqual(oShell.getContent()[0], this.oChildView, "it is the child view");
		}.bind(this));
	});

	QUnit.test("Should wait for the root view to be loaded before target is displayed", function (assert) {
		assert.expect(3);

		var fnResolve,
			pLoaded = new Promise(function(resolve, reject) {
				fnResolve = resolve;
			}),
			oRootViewStub = createView(
				['<View xmlns="sap.ui.core.mvc" xmlns:m="sap.m">',
					'<m:Panel id="myShell">', // use sap.m.Panel as a lightweight substitute for sap.ui.ux3.Shell
					'</m:Panel>',
				'</View>'], "rootView", pLoaded),
			oRootView;

		// Arrange
		this.oTarget._oOptions.rootView = "rootView";

		// Act
		var oDisplayed = this.oTarget.display();

		oRootViewStub.loaded().then(function(oView) {
			oRootView = oView;

			oRootView.loaded().then(function() {
				var oShell = oRootView.byId("myShell");
				// Assert
				assert.equal(oShell.getContent().length, 0, "the target view isn't added as content yet");
			});
		});

		fnResolve();

		return oDisplayed.then(function() {
			var oShell = oRootView.byId("myShell");

			// Assert
			assert.strictEqual(oShell.getContent().length, 1, "something was placed inside the shell");
			assert.strictEqual(oShell.getContent()[0], this.oChildView, "it is the child view");
		}.bind(this));
	});

	QUnit.test("should return a rejected promise when the root view loading fails", function (assert) {
		// Arrange
		var pRefusedLoading = Promise.reject(new Error("The view can't be found"));

		this.oParentView.loaded = function() {
			return pRefusedLoading;
		};

		this.oTarget._oOptions.rootView = "parent";

		// Act
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
				assert.ok(false, "The promise shouldn't resolve");
			}, function(oError) {
				// Assert
				assert.ok(oError instanceof Error);
				assert.equal(oError.message, "The view can't be found", "The error message is correct");
			});
	});

	QUnit.test("Should display a child target", function (assert) {
		// Arrange
		var oRootShell = new ShellSubstitute(),
			oParentTarget = new Target({
				controlId : oRootShell.getId(),
				controlAggregation: "content",
				viewName: "parent",
				viewType: "XML",
				_async: true
			},
			this.oViews);

		this.oViews.setView("parent", this.oParentView);

		this.oTarget._oParent = oParentTarget;

		// Act
		var oDisplayed = this.oTarget.display();

		return oDisplayed.then(function() {
			// Assert
			var oShell = this.oParentView.byId("myShell");
			assert.strictEqual(oShell.getContent().length, 1, "something was placed inside the shell");
			assert.strictEqual(oShell.getContent()[0], this.oChildView, "it is the child view");

			// Cleanup
			oParentTarget.destroy();
		}.bind(this));
	});

	QUnit.module("display event", {
		beforeEach: function () {
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
				viewId: "baz",
				_async: true
			};

			this.oViews = new Views({async: true});
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
		var oDisplayed = this.oTarget.display(oData);
		return oDisplayed.then(function(oView) {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
			assert.strictEqual(oParameters.view, this.oView, "view got passed to the event");
			assert.strictEqual(oParameters.control, this.oShell, "control got passed to the event");
			assert.strictEqual(oParameters.config, this.oConfig, "config got passed to the event");
			assert.strictEqual(oParameters.data, oData, "data got passed to the event");
		}.bind(this));

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
				viewType: "XML",
				_async: true
			};

			this.oViews = new Views({async: true});
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
			oFireSpy;

		// System under test + Arrange
		this.oTarget = new Target(
			this.oConfig,
			this.oViews
		);

		oFireSpy = this.spy(this.oTarget, "fireTitleChanged");
		assert.notOk(this.oTarget._oTitleProvider, "TitleProvider should not be instantiated");

		this.oTarget.attachDisplay(function(oEvent) {
			sinon.assert.notCalled(oFireSpy);
			done();
		});

		this.oTarget.display();
	});

	QUnit.test("move TitleProvider instance between views or within the same view shouldn't call invalidate", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oView, "invalidate");
		var done = assert.async();
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
			done();
		};

		this.oTarget.attachDisplay(fnDisplayed);
		this.oTarget.display();
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all dependencies", function (assert) {
		// Arrange
		var oParentTarget = new Target({_async: true}),
			oViews = new Views({async: true});

		// System under test
		var oTarget = new Target(
			{
				_async: true,
				title: "myTitle"
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
		assert.ok(!oViews.bIsDestroyed, "Did not destroy the views instance");
		assert.strictEqual(oTarget._oOptions, null, "Did free the options reference");
		assert.ok(oTitleProvider.bIsDestroyed, "TitleProvider is destroyed");
		assert.strictEqual(oTarget._oTitleProvider, null, "Did free the TitleProvider");

		// Cleanup
		oParentTarget.destroy();
		oViews.destroy();
	});

});

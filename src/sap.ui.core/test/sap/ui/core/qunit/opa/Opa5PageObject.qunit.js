/*global QUnit, foo */
sap.ui.define([
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/base/Log",
	"./utils/view"
], function (Opa, Opa5, Log, viewUtils) {
	"use strict";

	// preset some globals to avoid issues with QUnit's 'noglobals' option
	["simple", "multiple", "foo", "duplicate", "myKeepThePage"].forEach(function(prop) {
		window[prop] = undefined;
	});

	QUnit.module("Page Objects", {
		afterEach : function () {
			Opa5.resetConfig();
		}
	});

	QUnit.test("Should create a page object with actions and assertions", function(assert) {
		var oPages = Opa5.createPageObjects({
			onMyFirstPage : {
				namespace : "simple",
				actions : {
					iCanDoMagic : function(){ },
					iCanDoOtherThings : function(){ }
				},

				assertions : {
					iCanSeeIt : function(){ },
					iCanHearIt : function(){ }
				}
			}
		});

		assertPageObjectIsReturned(assert, oPages);

		assertStandardActionsRegisteredFor(assert, "onMyFirstPage");
		assertStandardAssertionsRegisteredFor(assert, "onMyFirstPage");
	});



	QUnit.test("Should create multiple page object with actions or assertions", function(assert) {
		Opa5.createPageObjects({
			onMyFirstPage : {
				namespace : "multiple",
				actions : {
					iCanDoMagic : function(){ },
					iCanDoOtherThings : function(){ }
				}
			},
			onMySecondPage : {
				namespace : "multiple",
				assertions : {
					iCanSeeIt : function(){ },
					iCanHearIt : function(){ }
				}
			}
		});

		assertStandardActionsRegisteredFor(assert, "onMyFirstPage");
		assertStandardAssertionsRegisteredFor(assert, "onMySecondPage");
	});

	QUnit.test("Should be able to pass different namespaces and base classes to a page object", function(assert) {
		var fnOtherBase = Opa5.extend("sap.ui.test.opa.otherBase");

		var oPages = Opa5.createPageObjects({
			onMyFirstPage : {
				baseClass : fnOtherBase,

				actions : {
					iCanDoMagic : function(){ },
					iCanDoOtherThings : function(){ }
				}
			},
			onMySecondPage : {
				namespace : "foo.bar",
				assertions : {
					iCanSeeIt : function(){ },
					iCanHearIt : function(){ }
				}
			}
		});

		assertPageObjectBase(assert, oPages,fnOtherBase);
		assertPageObjectNamespaces(assert, oPages);
	});

	QUnit.test("Should prevent namespaces clashes by logging an error", function preventNamespaceClashTest (assert) {
		this.stub(Log,"error"); //prevent the error from appearing in the console log as it is wanted here

		Opa5.createPageObjects({
			onMyFirstPage : {
				namespace : "duplicate",
				actions : {
					iCanDoMagic : function(){ }
				}
			}
		});
		assertNamespaceClashErrorLogged(assert, false);

		Opa5.createPageObjects({
			onMyFirstPage : {
				namespace : "duplicate",
				actions : {
					iCanDoOtherThings : function(){ }
				}
			}
		});
		assertNamespaceClashErrorLogged(assert, true);
	});

	QUnit.test("Should keep the page if you extend the Opa config", function (assert) {

		function noop() {}

		Opa5.createPageObjects({
			onMyTestPage: {
				namespace: "myKeepThePage",
				actions: {
					iDoTheNeedful: noop
				}
			}
		});
		Opa5.extendConfig({
			actions: new Opa5()
		});

		assert.strictEqual(Opa.config.actions.onMyTestPage.iDoTheNeedful, noop, "kept the page");
	});

	QUnit.module("Page Object - ViewName", {
		beforeEach: function () {
			this.oView = viewUtils.createXmlView("foo", "myFooView");
			this.oView2 = viewUtils.createXmlView("bar", "myBarView");
			this.oView.placeAt("qunit-fixture");
			this.oView2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
			this.oView2.destroy();
		}
	});

	QUnit.test("Should search for controls when viewName is given", function (assert) {
		var fnDone = assert.async();
		assert.expect(4);
		var oView = this.oView;
		var oView2 = this.oView2;

		Opa5.createPageObjects({
			onMyPageWithViewName: {
				viewName: "foo",
				actions: {
					iWait: function () {
						this.waitFor({
							id: "foo",
							success: function (oButton) {
								assert.strictEqual(oButton, oView.byId("foo"), "Should define action viewName in page object");
							}
						});
					},
					iWaitWithOtherViewName: function () {
						this.waitFor({
							viewName: "bar",
							id: "foo",
							success: function (oButton) {
								assert.strictEqual(oButton, oView2.byId("foo"), "Should override viewName in waitFor");
							}
						});
					},
					iWaitWithoutViewName: function () {
						this.waitFor({
							id: oView.getId(),
							viewName: "",
							success: function (oViewFromOPA) {
								assert.strictEqual(oViewFromOPA, oView, "Should remove viewName in waitFor");
							}
						});
					}
				},
				assertions: {
					iWait: function () {
						this.waitFor({
							id: "bar",
							success: function (oButton) {
								assert.strictEqual(oButton, oView.byId("bar"), "Should define assertion viewName in page object");
							}
						});
					}
				}
			}
		});

		Opa.config.actions.onMyPageWithViewName.iWait();
		Opa.config.actions.onMyPageWithViewName.iWaitWithOtherViewName();
		Opa.config.actions.onMyPageWithViewName.iWaitWithoutViewName();
		Opa.config.assertions.onMyPageWithViewName.iWait();

		Opa.emptyQueue().done(fnDone);
	});

	QUnit.test("Should search for controls when viewId is given", function (assert) {
		var fnDone = assert.async();
		assert.expect(3);
		var oView = this.oView;
		var oView2 = this.oView2;

		Opa5.createPageObjects({
			onMyPageWithViewId: {
				viewId: "myFooView",
				actions: {
					iWait: function () {
						this.waitFor({
							id: "foo",
							success: function (oButton) {
								assert.strictEqual(oButton, oView.byId("foo"), "Should define action viewId in page object");
							}
						});
					},
					iWaitWithOtherViewId: function () {
						this.waitFor({
							viewId: "myBarView",
							id: "foo",
							success: function (oButton) {
								assert.strictEqual(oButton, oView2.byId("foo"), "Should override viewId in waitFor");
							}
						});
					}
				}
			},
			onMyPageWithViewIdAndName: {
				viewId: "myFooView",
				viewName: "foo",
				actions: {
					iWait: function () {
						this.waitFor({
							id: "foo",
							success: function (oButton) {
								assert.strictEqual(oButton, oView.byId("foo"), "Should define viewId and viewName in page object");
							}
						});
					}
				}
			}
		});

		Opa.config.actions.onMyPageWithViewId.iWait();
		Opa.config.actions.onMyPageWithViewId.iWaitWithOtherViewId();
		Opa.config.actions.onMyPageWithViewIdAndName.iWait();

		Opa.emptyQueue().done(fnDone);
	});

	function assertPageObjectIsReturned(assert, oPages){
		assert.ok(oPages,"Page Object is returned");
		assert.ok(oPages.onMyFirstPage.actions.iCanDoMagic, "Page Object has access to the actions it describes");
		assert.ok(oPages.onMyFirstPage.assertions.iCanSeeIt, "Page Object has access to the assertions it describes");
	}

	function assertStandardActionsRegisteredFor(assert, sPageName){
		assert.ok(Opa.config.actions[sPageName], "Page Object is added to the actions");
		assert.ok(Opa.config.actions[sPageName].iCanDoMagic, "Page Object actions are added");
		assert.ok(Opa.config.actions[sPageName].iCanDoOtherThings, "Page Object actions are added");
		assert.ok(!Opa.config.actions[sPageName].iCanSeeIt, "Page Object assertions are not added to the actions");

		assert.deepEqual(Opa.config.arrangements[sPageName], Opa.config.actions[sPageName], "Page Object actions can be uses as Opa arrangements and actions");
	}

	function assertStandardAssertionsRegisteredFor(assert, sPageName){
		assert.ok(Opa.config.assertions[sPageName], "Page Object is added to the assertions");
		assert.ok(Opa.config.assertions[sPageName].iCanSeeIt, "Page Object assertions are added");
		assert.ok(Opa.config.assertions[sPageName].iCanHearIt, "Page Object assertions are added");
		assert.ok(!Opa.config.assertions[sPageName].iCanDoMagic, "Page Object actions are not added to the assertions");
	}

	function assertPageObjectBase(assert, oPages,fnOtherBase){
		assert.ok(oPages.onMyFirstPage.actions instanceof fnOtherBase, "onMyFirstPage has other base class");
		assert.ok(oPages.onMySecondPage.assertions instanceof Opa5, "onMySecondPage has default base class");
	}

	function assertPageObjectNamespaces(assert, oPages){
		assert.ok(oPages.onMyFirstPage.actions instanceof sap.ui.test.opa.pageObject.onMyFirstPage.actions, "onMyFirstPage has default namespace");
		assert.ok(oPages.onMySecondPage.assertions instanceof foo.bar.onMySecondPage.assertions, "onMySecondPage has given namespace");
	}

	function assertNamespaceClashErrorLogged(assert, bIsCalled){
		assert.equal(Log.error.calledOnce,bIsCalled,"Error log is called");
		if (bIsCalled) {
			assert.equal(Log.error.args[0][0],"Opa5 Page Object namespace clash: You have loaded multiple page objects with the same name. To prevent overriding themself, specify the namespace parameter.","Should log namespace clash error message");
		}
	}

});

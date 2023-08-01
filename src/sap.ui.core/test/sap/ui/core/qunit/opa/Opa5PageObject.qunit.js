/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/PageObjectFactory",
	"sap/base/Log",
	"./utils/view",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (Opa, Opa5, PageObjectFactory, Log, viewUtils, nextUIUpdate) {
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
		var fnOtherBase = Opa5.extend("sap.ui.test.opa.otherBase"),
			oSpy = this.spy(PageObjectFactory, "_createPageObject");

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

		assert.ok(oPages.onMyFirstPage.actions instanceof fnOtherBase, "onMyFirstPage has other base class");
		assert.ok(oPages.onMySecondPage.assertions instanceof Opa5, "onMySecondPage has default base class");

		assert.strictEqual(oSpy.args[0][0].namespace, "sap.ui.test.opa.pageObject", "onMyFirstPage has default namespace");
		assert.strictEqual(oSpy.args[1][0].namespace, "foo.bar", "onMySecondPage has given namespace");

		oSpy.restore();
	});

	QUnit.test("Should create an object with missing actions or assertions", function(assert) {
		var fnOtherBase = Opa5.extend("sap.ui.test.opa.otherBase", {
			commonFoo: function () {}
		});

		var oPages = Opa5.createPageObjects({
			onThePageWithNoAssertions: {
				baseClass: fnOtherBase,
				actions: {
					iCanDoMagic: function () {}
				}
			},
			onThePageWithNoActions: {
				baseClass: fnOtherBase,
				actions: {},
				assertions: {
					iCanSeeIt: function () {}
				}
			}
		});

		assert.ok(oPages.onThePageWithNoAssertions.actions instanceof fnOtherBase, "onThePageWithNoAssertions actions have the required base class");
		assert.ok(oPages.onThePageWithNoAssertions.assertions instanceof fnOtherBase, "onThePageWithNoAssertions assertions have the required base class");
		assert.ok(oPages.onThePageWithNoAssertions.actions.iCanDoMagic && oPages.onThePageWithNoAssertions.actions.commonFoo, "onThePageWithNoAssertions has all actions");
		assert.strictEqual(getProtoKeyCount(oPages.onThePageWithNoAssertions.assertions), 0, "onThePageWithNoAssertions should not have own assertions");
		assert.ok(oPages.onThePageWithNoAssertions.assertions.commonFoo, "onThePageWithNoAssertions has baseClass assertions");

		assert.ok(oPages.onThePageWithNoActions.actions instanceof fnOtherBase, "onThePageWithNoActions actions have the required base class");
		assert.ok(oPages.onThePageWithNoActions.assertions instanceof fnOtherBase, "onThePageWithNoActions assertion have the required base class");
		assert.ok(oPages.onThePageWithNoActions.assertions.iCanSeeIt && oPages.onThePageWithNoActions.assertions.commonFoo, "onThePageWithNoActions has all assertions");
		assert.strictEqual(getProtoKeyCount(oPages.onThePageWithNoActions.actions), 0, "onThePageWithNoActions should not have own actions");
		assert.ok(oPages.onThePageWithNoActions.actions.commonFoo, "onThePageWithNoActions has baseClass actions");
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

		assert.ok(Log.error.notCalled, "Error log is not called");

		Opa5.createPageObjects({
			onMyFirstPage : {
				namespace : "duplicate",
				actions : {
					iCanDoOtherThings : function(){ }
				}
			}
		});

		// Only one error message is logged now, for the namespace + name of the page
		assert.strictEqual(Log.error.callCount, 1, "Error log is called");
		assert.ok(Log.error.getCall(0).args[0].match(/Opa5 Page Object namespace clash.*duplicate\.onMyFirstPage/), "Should log namespace clash");
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

	QUnit.test("Should be able to pass actions and assertion as functions of a class", function(assert) {
		var fnActions = function Actions() {
			Opa5.call(this, arguments);
		},
		fnAssertions = function Assertions() {
			Opa5.call(this, arguments);
		};
		Object.assign(fnActions.prototype, Opa5.prototype, {
			iCanDoMagic: function(){},
			iCanDoOtherThings: function(){}
		});
		Object.assign(fnAssertions.prototype, Opa5.prototype, {
			iCanSeeIt: function(){},
			iCanHearIt: function(){}
		});

		var oPage = Opa5.createPageObjects({
			onMyFirstPage : {
				actions : fnActions,
				assertions : fnAssertions
			}
		});

		assertPageObjectIsReturned(assert, oPage);
		assertStandardActionsRegisteredFor(assert, "onMyFirstPage");
		assertStandardAssertionsRegisteredFor(assert, "onMyFirstPage");
	});

	QUnit.test("should be able to pass actions and assertions on a function", function(assert) {
		var oPage = Opa5.createPageObjects({
			onMyFirstPage : {
				actions : jQuery.extend({
					iCanDoMagic : function(){ }
				}),
				assertions : jQuery.extend({
					iCanSeeIt : function(){ }
				})
			}
		});

		assertPageObjectIsReturned(assert, oPage);
		assert.ok(Opa.config.actions.onMyFirstPage.iCanDoMagic, "Should add action");
		assert.ok(Opa.config.assertions.onMyFirstPage.iCanSeeIt, "Should add assertion");
	});

	QUnit.module("Page Object - ViewName", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return Promise.all([
				viewUtils.createXmlView("foo", "myFooView"),
				viewUtils.createXmlView("bar", "myBarView")
			]).then(function (aViews) {
				this.oView = aViews[0].placeAt("qunit-fixture");
				this.oView2 = aViews[1].placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
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

	QUnit.module("Page Object - test libraries", {
		afterEach: function () {
			Opa5.resetConfig();
		}
	});

	QUnit.test("Should add only the requested test libraries", function (assert) {
		Opa5.extendConfig({
			testLibs: {
				fooLib: {},
				barLib: {}
			},
			testLibBase: {
				fooLib: { actions: { fooAction: function () {} } },
				barLib: { actions: { barAction: function () {} } },
				skippedLib: { actions: { noAction: function () {} } }
			}
		});

		Opa5.createPageObjects({
			onTheFooPage: {
				actions: { iCanAct: function () {} },
				assertions: { iCanAssert: function () {} }
			}
		});

		assert.ok(Opa.config.actions.onTheFooPage.fooLib.fooAction, "Should add methods of requested library foo");
		assert.ok(Opa.config.actions.onTheFooPage.barLib.barAction, "Should add methods of requested library bar");
		assert.ok(!Opa.config.actions.onTheFooPage.skippedLib, "Should skip methods of library that is not requested");
	});

	QUnit.test("Should add only test libraries that defined a base", function (assert) {
		Opa5.extendConfig({
			testLibs: {
				fooLib: {},
				barLib: {}
			},
			testLibBase: {
				fooLib: { actions: { fooAction: function () {} } }
			}
		});

		Opa5.createPageObjects({
			onTheFooPage2: {
				actions: { iCanAct: function () {} },
				assertions: { iCanAssert: function () {} }
			}
		});

		assert.ok(Opa.config.actions.onTheFooPage2.fooLib.fooAction, "Should add methods of requested library foo");
		assert.ok(!Opa.config.actions.onTheFooPage2.barLib, "Should skip requested library bar that has no methods defined");
	});

	QUnit.test("Should add only the defined operations for a test library", function (assert) {
		Opa5.extendConfig({
			testLibs: {
				fooLib: {},
				barLib: {}
			},
			testLibBase: {
				fooLib: { actions: { fooAction: function () {} } },
				barLib: { assertions: { barAssert: function () {} } }
			}
		});

		Opa5.createPageObjects({
			onTheFooPage3: {
				actions: { iCanAct: function () {} },
				assertions: { iCanAssert: function () {} }
			}
		});

		assert.ok(Opa.config.actions.onTheFooPage3.fooLib.fooAction, "Should add actions of library foo");
		assert.ok(!Object.keys(Opa.config.actions.onTheFooPage3.barLib).length, "Should not add actions when they are not defined");
		assert.ok(!Object.keys(Opa.config.assertions.onTheFooPage3.fooLib).length, "Should not add assertions when trey are not defined");
		assert.ok(Opa.config.assertions.onTheFooPage3.barLib.barAssert, "Should add assertions of library bar");
	});

	QUnit.test("Should add test library methods to returned page object and to OPA config", function (assert) {
		Opa5.extendConfig({
			testLibs: {
				fooLib: {}
			},
			testLibBase: {
				fooLib: {
					actions: { fooAction: function () {} },
					assertions: { barAssert: function () {} }
				}
			}
		});

		var mPageObjects = Opa5.createPageObjects({
			onTheFooPage4: {
				actions: { iCanAct: function () {} },
				assertions: { iCanAssert: function () {} }
			},
			onTheBarPage: {
				actions: { iCanActBar: function () {} }
			},
			onTheBazPage: {
				assertions: { iCanAssertBaz: function () {} }
			}
		});

		assert.ok(mPageObjects.onTheFooPage4.actions.iCanAct, "Should add own actions to page object");
		assert.ok(mPageObjects.onTheFooPage4.assertions.iCanAssert, "Should add own assertions to page object");
		assert.ok(mPageObjects.onTheFooPage4.actions.fooLib.fooAction, "Should add test library actions to page object");
		assert.ok(mPageObjects.onTheFooPage4.assertions.fooLib.barAssert, "Should add test library assertions to page object");

		assert.ok(Opa.config.actions.onTheFooPage4.iCanAct, "Should add page object actions to OPA actions");
		assert.ok(Opa.config.arrangements.onTheFooPage4.iCanAct, "Should add page object arrangements to OPA arrangements");
		assert.ok(Opa.config.assertions.onTheFooPage4.iCanAssert, "Should add page object assertions to OPA assertions");
		assert.ok(Opa.config.actions.onTheFooPage4.fooLib.fooAction, "Should add test library actions to OPA actions");
		assert.ok(Opa.config.arrangements.onTheFooPage4.fooLib.fooAction, "Should add test library arrangements to OPA arrangements");
		assert.ok(Opa.config.assertions.onTheFooPage4.fooLib.barAssert, "Should add test library assertions to OPA assertions");

		// page object without own assertions
		assert.ok(mPageObjects.onTheBarPage.actions.fooLib.fooAction, "Should add test library actions to page object");
		assert.strictEqual(getProtoKeyCount(mPageObjects.onTheBarPage.assertions), 1, "Should not have own assertions");
		assert.ok(mPageObjects.onTheBarPage.assertions.fooLib.barAssert, "Should have only test library assertions");

		assert.ok(Opa.config.actions.onTheBarPage.fooLib.fooAction, "Should add test library actions to OPA actions");
		assert.ok(Opa.config.arrangements.onTheBarPage.fooLib.fooAction, "Should add test library arrangements to OPA arrangements");
		assert.strictEqual(getProtoKeyCount(Opa.config.assertions.onTheBarPage), 1, "Should not have own assertions in config");
		assert.ok(Opa.config.assertions.onTheBarPage.fooLib.barAssert, "Should have only test library assertions in config");

		// page object without own actions
		assert.strictEqual(getProtoKeyCount(mPageObjects.onTheBazPage.actions), 1, "Should not have own actions");
		assert.ok(mPageObjects.onTheBazPage.actions.fooLib.fooAction, "Should have only test library actions");
		assert.ok(mPageObjects.onTheBazPage.assertions.fooLib.barAssert, "Should add test library assertions to page object");

		assert.strictEqual(getProtoKeyCount(Opa.config.actions.onTheBazPage), 1, "Should not have own assertions in config");
		assert.ok(Opa.config.actions.onTheBazPage.fooLib.fooAction, "Should have only test library assertions in config");
		assert.strictEqual(getProtoKeyCount(Opa.config.arrangements.onTheBazPage), 1, "Should not have own assertions in config");
		assert.ok(Opa.config.arrangements.onTheBazPage.fooLib.fooAction, "Should have only test library assertions in config");
		assert.ok(Opa.config.assertions.onTheBazPage.fooLib.barAssert, "Should add test library assertions to OPA assertions");
	});

	QUnit.test("Should use test library methods from inside page object", function (assert) {
		var fnActSpy = sinon.spy();
		var fnAssertSpy = sinon.spy();

		Opa5.extendConfig({
			testLibs: {
				fooLib: {}
			},
			testLibBase: {
				fooLib: {
					actions: { fooAction: fnActSpy },
					assertions: { barAssert: fnAssertSpy }
				}
			}
		});

		Opa5.createPageObjects({
			onTheFooPage5: {
				actions: {
					iCanAct: function () {
						return this.fooLib.fooAction();
					}
				},
				assertions: {
					iCanAssert: function () {
						return this.fooLib.barAssert();
					}
				}
			}
		});

		Opa.config.actions.onTheFooPage5.iCanAct();
		assert.ok(fnActSpy.calledOnce, "Should call testlib action");

		Opa.config.assertions.onTheFooPage5.iCanAssert();
		assert.ok(fnAssertSpy.calledOnce, "Should call testlib assertion");
	});

	QUnit.test("Should use waitFor defaults in test library methods", function (assert) {
		var fnOtherBase = Opa5.extend("sap.ui.test.opa.otherBase");
		var fnWaitForSpy = sinon.spy();
		fnOtherBase.prototype.waitFor = fnWaitForSpy;

		Opa5.extendConfig({
			testLibs: {
				fooLib: {}
			},
			testLibBase: {
				fooLib: {
					actions: {
						fooAction: function () {
							this.waitFor({foo: "value"});
						}
					},
					assertions: {
						barAssert: function () {
							this.waitFor({bar: "value"});
						}
					}
				}
			}
		});

		Opa5.createPageObjects({
			onTheFooPage6: {
				viewName: "myViewName",
				viewId: "myViewId",
				baseClass: fnOtherBase,
				actions: {
					iCanAct: function () {
						return this.fooLib.fooAction();
					}
				},
				assertions: {
					iCanAssert: function () {
						return this.fooLib.barAssert();
					}
				}
			}
		});

		Opa.config.actions.onTheFooPage6.iCanAct();
		var mWaitForArgs = fnWaitForSpy.getCall(0).args[0];
		assert.ok(fnWaitForSpy.calledOnce, "Should call baseClass waitFor in action");
		assert.strictEqual(mWaitForArgs.viewId, "myViewId", "Should set default viewId");
		assert.strictEqual(mWaitForArgs.viewName, "myViewName", "Should set default viewName");
		assert.strictEqual(mWaitForArgs.foo, "value", "Should keep other properties");

		Opa.config.assertions.onTheFooPage6.iCanAssert();
		mWaitForArgs = fnWaitForSpy.getCall(1).args[0];
		assert.ok(fnWaitForSpy.calledTwice, "Should call baseClass waitFor in assertion");
		assert.strictEqual(mWaitForArgs.viewId, "myViewId", "Should set default viewId");
		assert.strictEqual(mWaitForArgs.viewName, "myViewName", "Should set default viewName");
		assert.strictEqual(mWaitForArgs.bar, "value", "Should keep other properties");
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

		assert.ok(!(Opa.config.arrangements[sPageName] && Opa.config.arrangements[sPageName].iCanSeeIt), "Page Object assertions are not added to the arrangements");
		assert.ok(!(Opa.config.arrangements[sPageName] && Opa.config.arrangements[sPageName].iCanHearIt), "Page Object assertions are not added to the arrangements");
	}

	function getProtoKeyCount(mObject) {
		return Object.keys(Object.getPrototypeOf(mObject)).length - 2; // without counstructor and getMetadata
	}

});

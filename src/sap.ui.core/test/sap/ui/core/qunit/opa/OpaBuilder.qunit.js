/*global QUnit */
sap.ui.define(
	[
		"sap/ui/core/Lib",
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/actions/Press",
		"sap/ui/test/actions/EnterText",
		"sap/base/strings/formatMessage",
		"sap/ui/model/json/JSONModel",
		"./utils/sinon"
	],
	function(
		Library,
		Opa5,
		OpaBuilder,
		Press,
		EnterText,
		formatMessage,
		JSONModel,
		sinonUtils
	) {
		"use strict";

		var _mOpa5DefaultOptions = {
			autoWait: true,
			visible: true
		};

		function _generateOpaBuilderSpies(aMethodNames) {
			return aMethodNames.reduce(
				function(mSpies, sMethodName) {
					mSpies[sMethodName] = this.spy(OpaBuilder.prototype, sMethodName);
					return mSpies;
				}.bind(this),
				{}
			);
		}

		function _restoreSpies(mSpies) {
			Object.keys(mSpies).forEach(function(sKey) {
				mSpies[sKey].restore();
			});
		}

		function _subset(mAllOptions, aKeys) {
			return aKeys.reduce(function(mResult, sKey) {
				mResult[sKey] = mAllOptions[sKey];
				return mResult;
			}, {});
		}

		function _executeAndValidateBuilderMethod(assert, oOpaBuilder, sMethodName, vParameter, vTargetOption, bResultsInArray) {
			assert.strictEqual(oOpaBuilder[sMethodName](vParameter), oOpaBuilder, "builder instance returned");
			if (!vTargetOption) {
				vTargetOption = sMethodName;
			}
			if (typeof vTargetOption === "string") {
				if (bResultsInArray) {
					assert.deepEqual(
						oOpaBuilder.build()[vTargetOption],
						Array.isArray(vParameter) ? vParameter : [vParameter],
						"option '" + vTargetOption + "' has correct array values"
					);
				} else {
					assert.strictEqual(
						oOpaBuilder.build()[vTargetOption],
						vParameter,
						"option '" + vTargetOption + "' is '" + vParameter + "'"
					);
				}
			} else {
				assert.deepEqual(_subset(oOpaBuilder.build(), Object.keys(vTargetOption)), vTargetOption, "options are set properly");
			}
		}

		function _getLength(vElements) {
			if (!Array.isArray(vElements)) {
				return vElements === null || vElements === undefined ? 0 : 1;
			}
			return vElements.length;
		}

		function _createBuilder(vMatchers, vActions) {
			return new OpaBuilder().has(vMatchers).do(vActions);
		}

		QUnit.module("Static Methods");

		QUnit.test("Should get default options", function(assert) {
			assert.deepEqual(OpaBuilder.defaultOptions(), _mOpa5DefaultOptions);
		});

		QUnit.test("Should set default options", function(assert) {
			var mNewDefaultOptions = { visible: false },
				mSetDefaultOptions = OpaBuilder.defaultOptions({ visible: false });
			assert.deepEqual(mSetDefaultOptions, mNewDefaultOptions);
			assert.notStrictEqual(mSetDefaultOptions, mNewDefaultOptions, "should not return object reference");
			assert.deepEqual(OpaBuilder.defaultOptions(), mNewDefaultOptions);
		});

		QUnit.test("Should create a new OpaBuilder instance", function(assert) {
			var oOpaBuilder = OpaBuilder.create();
			assert.ok(oOpaBuilder instanceof OpaBuilder);
		});

		QUnit.test("Should create a new OpaBuilder instance with given options", function(assert) {
			var mSpies = _generateOpaBuilderSpies.call(this, ["hasId", "hasType", "isDialogElement", "has", "do", "options"]),
				oOpaInstance = new Opa5(),
				fnMyMatcher = OpaBuilder.Matchers.properties(),
				fnMyAction = OpaBuilder.Actions.press(),
				oMyOptions = { errorMessage: "my error" },
				oOpaBuilder = OpaBuilder.create(oOpaInstance, "my.Id", "my.Type", true, fnMyMatcher, fnMyAction, oMyOptions);
			assert.ok(oOpaBuilder instanceof OpaBuilder);
			assert.strictEqual(oOpaBuilder.getOpaInstance(), oOpaInstance);
			assert.ok(mSpies.hasId.calledWith("my.Id"));
			assert.ok(mSpies.hasType.calledWith("my.Type"));
			assert.ok(mSpies.isDialogElement.calledWith(true));
			assert.ok(mSpies.has.calledWith(fnMyMatcher));
			assert.ok(mSpies.do.calledWith(fnMyAction));
			assert.ok(mSpies.options.calledWith(oMyOptions));
			_restoreSpies(mSpies);
		});

		QUnit.module("Builder Methods", {
			beforeEach: function() {
				OpaBuilder.defaultOptions({});
			},
			afterEach: function() {
				OpaBuilder.defaultOptions(_mOpa5DefaultOptions);
			}
		});

		QUnit.test("Should build options", function(assert) {
			var oOpaBuilder = new OpaBuilder();
			assert.deepEqual(oOpaBuilder.build(), { "errorMessage": "Control#<undefined> not found" });
		});

		QUnit.test("Should set 'options' and return builder instance", function(assert) {
			var oOptions = { id: "test", errorMessage: "an error" };
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "options", oOptions, oOptions);
		});

		QUnit.test("Should set 'id' when using 'hasId'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "hasId", "my.Id", "id");
		});

		QUnit.test("Should set 'controlType' when using 'hasType'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "hasType", "my.Type", "controlType");
		});

		QUnit.test("Should set 'matchers' when using 'has'", function(assert) {
			_executeAndValidateBuilderMethod(
				assert,
				OpaBuilder.create(),
				"has",
				function() {
					return true;
				},
				"matchers",
				true
			);
		});

		QUnit.test("Should set 'check' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(
				assert,
				OpaBuilder.create(),
				"check",
				function() {
					return true;
				},
				"check"
			);
		});

		QUnit.test("Should set 'actions' when using 'do'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "do", function() {}, "actions", true);
		});

		QUnit.test("Should set 'viewName' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "viewName", "my.view.name");
		});

		QUnit.test("Should set 'viewId' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "viewId", "my.view.id");
		});

		QUnit.test("Should set 'viewNamespace' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "viewNamespace", "my.view.namespace");
		});

		QUnit.test("Should set 'fragmentId' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "fragmentId", "my.fragment.id");
		});

		QUnit.test("Should set 'timeout' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "timeout", 1);
		});

		QUnit.test("Should set 'debugTimeout' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "debugTimeout", 2);
		});

		QUnit.test("Should set 'pollingInterval' and return builder instance", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "pollingInterval", 3);
		});

		QUnit.test("Should set 'visible' when setting 'mustBeVisible'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "mustBeVisible", false, "visible");
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "mustBeVisible", true, "visible");
		});

		QUnit.test("Should set 'enabled' when setting 'mustBeEnabled'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "mustBeEnabled", false, "enabled");
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "mustBeEnabled", true, "enabled");
		});

		QUnit.test("Should set 'autoWait' when setting 'mustBeReady'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "mustBeReady", false, "autoWait");
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "mustBeReady", true, "autoWait");
		});

		QUnit.test("Should set 'searchOpenDialogs' when setting 'isDialogElement'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "isDialogElement", false, "searchOpenDialogs");
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "isDialogElement", true, "searchOpenDialogs");
		});

		QUnit.test("Should set 'success' and 'errorMessage' when setting 'description'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				sMyDescription = "my description";
			assert.strictEqual(oOpaBuilder.description(sMyDescription), oOpaBuilder, "builder instance returned");
			assert.strictEqual(oOpaBuilder.build().errorMessage, sMyDescription + " - FAILURE");
			assert.ok(typeof oOpaBuilder.build().success === "function");
		});

		QUnit.test("Should create properties matcher when using 'hasProperties'", function(assert) {
			var oSpy = this.spy(OpaBuilder.Matchers, "properties"),
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.hasProperties({ text: "test" }), oOpaBuilder, "builder instance returned");
			assert.ok(oSpy.calledWith({ text: "test" }));
			assert.ok(oSpy.returned(oOpaBuilder.build().matchers[0]));
			oSpy.restore();
		});

		QUnit.test("Should create aggregation matcher when using 'hasAggregation'", function(assert) {
			var oSpy = this.spy(OpaBuilder.Matchers, "aggregationMatcher"),
				fnMatcher = OpaBuilder.Matchers.TRUE,
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.hasAggregation("items", fnMatcher), oOpaBuilder, "builder instance returned");
			assert.ok(oSpy.calledWith("items", fnMatcher));
			assert.ok(oSpy.returned(oOpaBuilder.build().matchers[0]));
			oSpy.restore();
		});

		QUnit.test("Should create aggregation matcher that checks properties when using 'hasAggregationProperties'", function(assert) {
			var oSpy = this.spy(OpaBuilder.prototype, "hasAggregation"),
				oMatcherSpy = this.spy(OpaBuilder.Matchers, "properties"),
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.hasAggregationProperties("items", { text: "test" }), oOpaBuilder, "builder instance returned");
			assert.ok(oMatcherSpy.calledWith({ text: "test" }));
			assert.ok(oSpy.calledWith("items", oMatcherSpy.returnValues[0]));
			oSpy.restore();
			oMatcherSpy.restore();
		});

		QUnit.test("Should create aggregation length matcher when using 'aggregationLength'", function(assert) {
			var oSpy = this.spy(OpaBuilder.prototype, "has"),
				oMatcherSpy = this.spy(OpaBuilder.Matchers, "aggregationLength"),
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.hasAggregationLength("items", 42), oOpaBuilder, "builder instance returned");
			assert.ok(oMatcherSpy.calledWith("items", 42));
			assert.ok(oSpy.calledWith(oMatcherSpy.returnValues[0]));
			oSpy.restore();
			oMatcherSpy.restore();
		});

		QUnit.test("Should create child matcher when using 'hasChildren'", function(assert) {
			var oSpy = this.spy(OpaBuilder.Matchers, "childrenMatcher"),
				fnMatcher = OpaBuilder.Matchers.TRUE,
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.hasChildren(fnMatcher, true), oOpaBuilder, "builder instance returned");
			assert.ok(oSpy.calledWith(fnMatcher, true));
			assert.ok(oSpy.returned(oOpaBuilder.build().matchers[0]));
			oSpy.restore();
		});

		QUnit.test("Should create check function when using 'checkNumberOfMatches'", function(assert) {
			var oSpy = this.spy(OpaBuilder.prototype, "check"),
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.checkNumberOfMatches(2), oOpaBuilder, "builder instance returned");
			assert.ok(oSpy.calledOnce);
			oSpy.restore();
		});

		QUnit.test("Should properly 'checkNumberOfMatches'", function(assert) {
			var oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.checkNumberOfMatches(2), oOpaBuilder, "builder instance returned");
			assert.ok(oOpaBuilder.build().check([42, 33]));
			assert.ok(oOpaBuilder.build().check([null, 33]));
			assert.ok(!oOpaBuilder.build().check([42]));
			assert.ok(!oOpaBuilder.build().check());

			oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.checkNumberOfMatches(1), oOpaBuilder, "builder instance returned");
			assert.ok(oOpaBuilder.build().check([42]));
			assert.ok(oOpaBuilder.build().check(42));
			assert.ok(!oOpaBuilder.build().check(null));
			assert.ok(!oOpaBuilder.build().check());
		});

		QUnit.test("Should create 'press' action when using 'doPress'", function(assert) {
			var oSpy = this.spy(OpaBuilder.prototype, "do"),
				oActionSpy = this.spy(OpaBuilder.Actions, "press"),
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.doPress("myIdSuffix"), oOpaBuilder, "builder instance returned");
			assert.ok(oActionSpy.calledOnce);
			assert.ok(oActionSpy.calledWith("myIdSuffix"));
			assert.ok(oSpy.calledWith(oActionSpy.returnValues[0]));
			oSpy.restore();
			oActionSpy.restore();
		});

		QUnit.test("Should create 'enterText' action when using 'doEnterText'", function(assert) {
			var oSpy = this.spy(OpaBuilder.prototype, "do"),
				oActionSpy = this.spy(OpaBuilder.Actions, "enterText"),
				oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.doEnterText("Test", true, true, "myIdSuffix"), oOpaBuilder, "builder instance returned");
			assert.ok(oActionSpy.calledWith("Test", true, true, "myIdSuffix"));
			assert.ok(oSpy.calledWith(oActionSpy.returnValues[0]));
			oSpy.reset();
			oActionSpy.reset();

			assert.strictEqual(oOpaBuilder.doEnterText("Test", true, true, true,"myIdSuffix"), oOpaBuilder, "builder instance returned");
			assert.ok(oActionSpy.calledWith("Test", true, true, true, "myIdSuffix"));
			assert.ok(oSpy.calledWith(oActionSpy.returnValues[0]));
			oSpy.restore();
			oActionSpy.restore();
		});

		QUnit.test("Should set 'success' function when using 'success'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "success", function() {});
		});

		QUnit.test("Should create 'success' function when using 'success' with text parameter", function(assert) {
			var oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.success("my success"), oOpaBuilder, "builder instance returned");
			assert.ok(typeof oOpaBuilder.build().success === "function");
		});

		QUnit.test("Should set 'error' function when using 'error'", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "error", function() {});
		});

		QUnit.test("Should set 'errorMessage' function when using 'error' with text parameter", function(assert) {
			_executeAndValidateBuilderMethod(assert, OpaBuilder.create(), "error", "my error text", "errorMessage");
		});

		QUnit.test("Should add matchers on consecutive use of 'has' if not replaced", function(assert) {
			var oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.has(OpaBuilder.Matchers.TRUE), oOpaBuilder, "builder instance returned");
			assert.strictEqual(_getLength(oOpaBuilder.build().matchers), 1);
			assert.strictEqual(oOpaBuilder.hasProperties({ text: "test" }), oOpaBuilder, "builder instance returned");
			assert.strictEqual(_getLength(oOpaBuilder.build().matchers), 2, "added to previous matchers");
			assert.strictEqual(oOpaBuilder.has(OpaBuilder.Matchers.FALSE, true), oOpaBuilder, "builder instance returned");
			assert.strictEqual(_getLength(oOpaBuilder.build().matchers), 1, "previous matchers are replaced");
		});

		QUnit.test("Should add actions on consecutive use of 'do' if not replaced", function(assert) {
			var oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.do(OpaBuilder.Actions.press()), oOpaBuilder, "builder instance returned");
			assert.strictEqual(_getLength(oOpaBuilder.build().actions), 1);
			assert.strictEqual(oOpaBuilder.doEnterText("Test"), oOpaBuilder, "builder instance returned");
			assert.strictEqual(_getLength(oOpaBuilder.build().actions), 2, "added to previous actions");
			assert.strictEqual(oOpaBuilder.do(OpaBuilder.Actions.press(), true), oOpaBuilder, "builder instance returned");
			assert.strictEqual(_getLength(oOpaBuilder.build().actions), 1, "previous actions are replaced");
		});

		QUnit.test(
			"Should chain 'check' functions (with respect to previous result) on consecutive use of 'check' if not replaced",
			function(assert) {
				var oOpaBuilder = new OpaBuilder(),
					oFirstCheck = this.spy(function(oObject) {
						return oObject;
					}),
					oSecondCheck = this.spy(function(oObject) {
						return oObject;
					});
				assert.strictEqual(oOpaBuilder.check(oFirstCheck), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().check(false);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 0);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().check(true);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 0);
				oFirstCheck.reset();
				oSecondCheck.reset();
				assert.strictEqual(oOpaBuilder.check(oSecondCheck), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().check(false);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 0);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().check(true);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				assert.strictEqual(oOpaBuilder.check(oFirstCheck), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().check(false);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 0);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().check(true);
				assert.strictEqual(oFirstCheck.callCount, 2);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				assert.strictEqual(oOpaBuilder.check(oSecondCheck, true), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().check(false);
				assert.strictEqual(oFirstCheck.callCount, 0);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().check(true);
				assert.strictEqual(oFirstCheck.callCount, 0);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
			}
		);

		QUnit.test(
			"Should chain 'success' functions (independent of previous result) on consecutive use of 'success' if not replaced",
			function(assert) {
				var oOpaBuilder = new OpaBuilder(),
					oFirstCheck = this.spy(function(oObject) {
						return oObject;
					}),
					oSecondCheck = this.spy(function(oObject) {
						return oObject;
					});
				assert.strictEqual(oOpaBuilder.success(oFirstCheck), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().success(false);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 0);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().success(true);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 0);
				oFirstCheck.reset();
				oSecondCheck.reset();
				assert.strictEqual(oOpaBuilder.success(oSecondCheck), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().success(false);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().success(true);
				assert.strictEqual(oFirstCheck.callCount, 1);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				assert.strictEqual(oOpaBuilder.success(oFirstCheck), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().success(false);
				assert.strictEqual(oFirstCheck.callCount, 2);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().success(true);
				assert.strictEqual(oFirstCheck.callCount, 2);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				assert.strictEqual(oOpaBuilder.success(oSecondCheck, true), oOpaBuilder, "builder instance returned");
				oOpaBuilder.build().success(false);
				assert.strictEqual(oFirstCheck.callCount, 0);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
				oOpaBuilder.build().success(true);
				assert.strictEqual(oFirstCheck.callCount, 0);
				assert.strictEqual(oSecondCheck.callCount, 1);
				oFirstCheck.reset();
				oSecondCheck.reset();
			}
		);

		QUnit.test("Should execute functions conditionally when using 'doConditional'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				fnMatcher = function (oObject) {
					return oObject;
				},
				fnSuccessAction = function (oObject) {
					return oObject;
				},
				fnElseAction = function (oObject) {
					return oObject;
				},
				oActionSpy = this.spy(OpaBuilder.Actions, "conditional"),
				oDoSpy = this.spy(OpaBuilder.prototype, "do");
			assert.strictEqual(oOpaBuilder.doConditional(fnMatcher, fnSuccessAction, fnElseAction), oOpaBuilder, "builder instance returned");
			assert.strictEqual(oActionSpy.callCount, 1);
			assert.ok(oActionSpy.calledWith(fnMatcher, fnSuccessAction, fnElseAction));
			assert.ok(oDoSpy.calledWith(oActionSpy.returnValues[0]));
			oActionSpy.restore();
			oDoSpy.restore();
		});

		QUnit.test("Should execute functions on aggregation elements when using 'doOnAggregation'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				oMatcherSpy = this.spy(function(oObject) {
					return !!oObject;
				}),
				oActionSpy = this.spy(function(oObject) {
					return oObject;
				}),
				oDummyInput = {
					getItems: function() {
						return [42, "", 0];
					}
				};
			assert.strictEqual(oOpaBuilder.doOnAggregation("items", oMatcherSpy, oActionSpy), oOpaBuilder, "builder instance returned");
			oOpaBuilder.build().actions[0](oDummyInput);
			assert.strictEqual(oMatcherSpy.callCount, 3);
			assert.ok(oMatcherSpy.calledWith(42));
			assert.ok(oMatcherSpy.calledWith());
			assert.strictEqual(oMatcherSpy.callCount, 3);
			assert.strictEqual(oActionSpy.callCount, 1, "action executed once");
			assert.ok(oActionSpy.calledWith(42));
			oMatcherSpy.reset();
			oActionSpy.reset();
		});

		QUnit.test("Should execute functions on child elements when using 'doOnChildren'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				oDummyControl1 = { match: false},
				oDummyControl2 = { match: true},
				oDummyParent = { dummyParent: true },
				oAncestorSpy = this.spy(OpaBuilder.Matchers.TRUE),
				oAncestorStub = sinonUtils.createStub(OpaBuilder.Matchers, "ancestor", oAncestorSpy),
				oMatcherSpy = this.spy(function(oObject) {
					return oObject.match;
				}),
				oActionSpy = this.spy(function(oObject) {
					return oObject;
				}),
				oGetMatchingControlsSpy = this.spy(function (oOptions) {
					if ("children" in oOptions) {
						return oOptions.children;
					}
					return [oDummyControl1];
				}),
				oGetPluginSpy = this.spy(function () {
					return {
						getMatchingControls: oGetMatchingControlsSpy
					};
				}),
				oPluginStub = sinonUtils.createStub(Opa5, "getPlugin", oGetPluginSpy),
				oWaitForSpy = this.spy(),
				oWaitForStub = sinonUtils.createStub(Opa5.prototype, "waitFor", oWaitForSpy);

			assert.strictEqual(oOpaBuilder.doOnChildren(oMatcherSpy, oActionSpy, true), oOpaBuilder, "builder instance returned");
			oOpaBuilder.build().actions[0](oDummyParent);
			assert.strictEqual(oGetPluginSpy.callCount, 1);
			assert.strictEqual(oGetMatchingControlsSpy.callCount, 1);
			assert.strictEqual(oAncestorSpy.callCount, 1);
			assert.ok(oAncestorSpy.calledWith(oDummyParent, true), "ancestor matcher added");
			assert.strictEqual(oMatcherSpy.callCount, 1);
			assert.ok(oMatcherSpy.calledWith(oDummyControl1));
			assert.strictEqual(oActionSpy.callCount, 0);
			assert.strictEqual(oWaitForSpy.callCount, 0, "not using waitFor");
			oGetPluginSpy.reset();
			oGetMatchingControlsSpy.reset();
			oMatcherSpy.reset();
			oActionSpy.reset();
			oWaitForSpy.reset();
			oAncestorSpy.reset();

			// test with OpaBuilder parameter
			oOpaBuilder = new OpaBuilder();
			assert.strictEqual(oOpaBuilder.doOnChildren(_createBuilder(oMatcherSpy, oActionSpy).options({ children: [oDummyControl1, oDummyControl2] }), true), oOpaBuilder, "using OpaBuilder as parameter");
			oOpaBuilder.build().actions[0](oDummyParent);
			assert.strictEqual(oGetPluginSpy.callCount, 1);
			assert.strictEqual(oGetMatchingControlsSpy.callCount, 1);
			assert.strictEqual(oAncestorSpy.callCount, 1);
			assert.ok(oAncestorSpy.calledWith(oDummyParent, true), "ancestor matcher added");
			assert.strictEqual(oMatcherSpy.callCount, 2);
			assert.ok(oMatcherSpy.calledWith(oDummyControl1));
			assert.ok(oMatcherSpy.calledWith(oDummyControl2));
			assert.strictEqual(oActionSpy.callCount, 1);
			assert.ok(oActionSpy.calledWith(oDummyControl2));
			assert.strictEqual(oWaitForSpy.callCount, 0, "not using waitFor");
			oGetPluginSpy.reset();
			oGetMatchingControlsSpy.reset();
			oMatcherSpy.reset();
			oActionSpy.reset();
			oWaitForSpy.reset();
			oAncestorSpy.reset();

			oPluginStub.restore();
			oWaitForStub.restore();
			oAncestorStub.restore();
		});

		QUnit.test("Should call 'Opa5.waitFor' with the defined options when using 'execute'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				oWaitForSpy = this.spy(),
				oWaitForStub = sinonUtils.createStub(Opa5.prototype, "waitFor", oWaitForSpy),
				oOptions = oOpaBuilder
					.hasId("myId")
					.hasType("sap.m.Button")
					.doPress()
					.description("some error message")
					.build();

			oOpaBuilder.execute();
			assert.ok(oWaitForSpy.calledWith(oOptions));
			oWaitForStub.restore();
		});

		QUnit.test("Should create OpaBuilder.Matchers.conditional matcher when using 'hasConditional'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				fnCondition = function (oObject) {
					return oObject;
				},
				fnSuccessMatcher = function (oObject) {
					return oObject;
				},
				fnElseMatcher = function (oObject) {
					return oObject;
				},
				oMatcherSpy = this.spy(OpaBuilder.Matchers, "conditional"),
				oHasSpy = this.spy(OpaBuilder.prototype, "has");
			assert.strictEqual(oOpaBuilder.hasConditional(fnCondition, fnSuccessMatcher, fnElseMatcher), oOpaBuilder, "builder instance returned");
			assert.strictEqual(oMatcherSpy.callCount, 1);
			assert.ok(oMatcherSpy.calledWith(fnCondition, fnSuccessMatcher, fnElseMatcher));
			assert.ok(oHasSpy.calledWith(oMatcherSpy.returnValues[0]));
			oMatcherSpy.restore();
			oHasSpy.restore();
		});

		QUnit.test("Should create OpaBuilder.Matchers.some matcher when using 'hasSome'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				fnMatcher1 = function (oObject) {
					return oObject;
				},
				fnMatcher2 = function (oObject) {
					return oObject;
				},
				fnMatcher3 = function (oObject) {
					return oObject;
				},
				oMatcherSpy = this.spy(OpaBuilder.Matchers, "some"),
				oHasSpy = this.spy(OpaBuilder.prototype, "has");
			assert.strictEqual(oOpaBuilder.hasSome(fnMatcher1, fnMatcher2, fnMatcher3), oOpaBuilder, "builder instance returned");
			assert.strictEqual(oMatcherSpy.callCount, 1);
			assert.ok(oMatcherSpy.calledWith(fnMatcher1, fnMatcher2, fnMatcher3));
			assert.ok(oHasSpy.calledWith(oMatcherSpy.returnValues[0]));
			oMatcherSpy.restore();
			oHasSpy.restore();
		});

		QUnit.test("Should create OpaBuilder.Matchers.i18n matcher when using 'hasI18NText'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				sPropertyName = "Hello",
				sModelTokenPath = "World",
				aParameters = ["!"],
				oMatcherSpy = this.spy(OpaBuilder.Matchers, "i18n"),
				oHasSpy = this.spy(OpaBuilder.prototype, "has");
			assert.strictEqual(oOpaBuilder.hasI18NText(sPropertyName, sModelTokenPath, aParameters), oOpaBuilder, "builder instance returned");
			assert.strictEqual(oMatcherSpy.callCount, 1);
			assert.ok(oMatcherSpy.calledWith(sPropertyName, sModelTokenPath, aParameters));
			assert.ok(oHasSpy.calledWith(oMatcherSpy.returnValues[0]));
			oMatcherSpy.restore();
			oHasSpy.restore();
		});

		QUnit.test("Should set/get the Opa5 instance on 'setOpaInstance' and 'getOpaInstance'", function(assert) {
			var oOpaBuilder = new OpaBuilder(),
				oOpa5Instance = new Opa5();

			assert.ok(!!oOpaBuilder.getOpaInstance(), "getOpaInstance creates an instance lazily if none was set first");

			oOpaBuilder.setOpaInstance(oOpa5Instance);
			assert.strictEqual(oOpaBuilder.getOpaInstance(), oOpa5Instance, "the set Opa5 instance is returned");

			oOpaBuilder.setOpaInstance(null);
			assert.notStrictEqual(oOpaBuilder.getOpaInstance(), oOpa5Instance, "the previous set Opa5 instance was cleared");
			assert.notStrictEqual(oOpaBuilder.getOpaInstance(), null, "a new Opa5 instance was lazily created");
		});

		QUnit.module("Matchers");

		QUnit.test("'TRUE' should return a function that returns boolean true", function(assert) {
			assert.strictEqual(OpaBuilder.Matchers.TRUE(), true);
		});

		QUnit.test("'FALSE' should return a function that returns boolean false", function(assert) {
			assert.strictEqual(OpaBuilder.Matchers.FALSE(), false);
		});

		QUnit.test("'not' should return a function that negates result of provided matcher", function(assert) {
			assert.strictEqual(OpaBuilder.Matchers.not(OpaBuilder.Matchers.TRUE)({ dummyControl: true }), false);
			assert.strictEqual(OpaBuilder.Matchers.not(OpaBuilder.Matchers.FALSE)({ dummyControl: true }), true);
		});

		QUnit.test("'ancestor' should return a corresponding declarative definition of sap.ui.test.matchers.Ancestor", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.ancestor("my.ancestor"), { ancestor: [["my.ancestor", undefined]] });
			assert.deepEqual(OpaBuilder.Matchers.ancestor("my.ancestor", true), { ancestor: [["my.ancestor", true]] });
		});

		QUnit.test("'descendant' should return a corresponding declarative definition of sap.ui.test.matchers.Descendant", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.descendant("my.descendant"), { descendant: [["my.descendant", undefined]] });
			assert.deepEqual(OpaBuilder.Matchers.descendant("my.descendant", true), { descendant: [["my.descendant", true]] });
		});

		QUnit.test("'properties' should return a corresponding declarative definition of sap.ui.test.matchers.Properties", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.properties({ text: "test", number: 42 }), {
				properties: {
					text: "test",
					number: 42
				}
			});
		});

		QUnit.test("'i18n' should return a corresponding declarative definition of sap.ui.test.matchers.I18NText", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.i18n("text", "i18nTest>IAM_A_TOKEN", "first", "second"), {
				i18NText: {
					propertyName: "text",
					modelName: "i18nTest",
					key: "IAM_A_TOKEN",
					parameters: ["first", "second"]
				}
			});
		});

		QUnit.test("'labelFor' should return a corresponding declarative definition of sap.ui.test.matchers.LabelFor", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.labelFor("text", "i18nTest>IAM_A_TOKEN", "first", "second"), {
				labelFor: {
					propertyName: "text",
					modelName: "i18nTest",
					key: "IAM_A_TOKEN",
					parameters: ["first", "second"]
				}
			});
			assert.deepEqual(OpaBuilder.Matchers.labelFor("text", true, "i18nTest>IAM_A_TOKEN", "first", "second"), {
				labelFor: {
					propertyName: "text",
					text: "i18nTest>IAM_A_TOKEN"
				}
			});
		});

		QUnit.test("'children' return a matcher that returns an array of children filtered by given matchers", function(assert) {
			var fnChildren,
				oDummyControl1 = { match: false},
				oDummyControl2 = { match: true},
				oDummyParent = { dummyParent: true },
				oAncestorSpy = this.spy(OpaBuilder.Matchers.TRUE),
				oAncestorStub = sinonUtils.createStub(OpaBuilder.Matchers, "ancestor", oAncestorSpy),
				oMatcherSpy = this.spy(function(oObject) {
					return oObject.match;
				}),
				oActionSpy = this.spy(function(oObject) {
					return oObject;
				}),
				oGetMatchingControlsSpy = this.spy(function (oOptions) {
					if ("children" in oOptions) {
						return oOptions.children;
					}
					return [oDummyControl1];
				}),
				oGetPluginSpy = this.spy(function () {
					return {
						getMatchingControls: oGetMatchingControlsSpy
					};
				}),
				oPluginStub = sinonUtils.createStub(Opa5, "getPlugin", oGetPluginSpy);

			fnChildren = OpaBuilder.Matchers.children(oMatcherSpy, true);
			assert.deepEqual(fnChildren(oDummyParent), []);
			assert.strictEqual(oGetPluginSpy.callCount, 1);
			assert.strictEqual(oGetMatchingControlsSpy.callCount, 1);
			assert.strictEqual(oAncestorSpy.callCount, 1);
			assert.ok(oAncestorSpy.calledWith(oDummyParent, true), "ancestor matcher added");
			assert.strictEqual(oMatcherSpy.callCount, 1);
			assert.ok(oMatcherSpy.calledWith(oDummyControl1));
			assert.strictEqual(oActionSpy.callCount, 0, "actions are not executed - its a matcher!");
			oGetPluginSpy.reset();
			oGetMatchingControlsSpy.reset();
			oMatcherSpy.reset();
			oAncestorSpy.reset();

			// test with OpaBuilder parameter
			fnChildren = OpaBuilder.Matchers.children(_createBuilder(oMatcherSpy, oActionSpy).options({ children: [oDummyControl1, oDummyControl2] }), true);
			assert.deepEqual(fnChildren(oDummyParent), [oDummyControl2]);
			assert.strictEqual(oGetPluginSpy.callCount, 1);
			assert.strictEqual(oGetMatchingControlsSpy.callCount, 1);
			assert.strictEqual(oAncestorSpy.callCount, 1);
			assert.ok(oAncestorSpy.calledWith(oDummyParent, true), "ancestor matcher added");
			assert.strictEqual(oMatcherSpy.callCount, 2);
			assert.ok(oMatcherSpy.calledWith(oDummyControl1));
			assert.ok(oMatcherSpy.calledWith(oDummyControl2));
			assert.strictEqual(oActionSpy.callCount, 0, "actions are not executed - its a matcher!");
			oGetPluginSpy.reset();
			oGetMatchingControlsSpy.reset();
			oMatcherSpy.reset();
			oAncestorSpy.reset();

			oPluginStub.restore();
			oAncestorStub.restore();
		});

		QUnit.test("'childrenMatcher' return a matcher that returns whether 'children' has at least one match", function(assert) {
			var fnChildMatcher,
				oDummyControl1 = { match: false},
				oDummyControl2 = { match: true},
				oDummyParent = { dummyParent: true },
				oAncestorSpy = this.spy(OpaBuilder.Matchers.TRUE),
				oAncestorStub = sinonUtils.createStub(OpaBuilder.Matchers, "ancestor", oAncestorSpy),
				oMatcherSpy = this.spy(function(oObject) {
					return oObject.match;
				}),
				oActionSpy = this.spy(function(oObject) {
					return oObject;
				}),
				oGetMatchingControlsSpy = this.spy(function (oOptions) {
					if ("children" in oOptions) {
						return oOptions.children;
					}
					return [oDummyControl1];
				}),
				oGetPluginSpy = this.spy(function () {
					return {
						getMatchingControls: oGetMatchingControlsSpy
					};
				}),
				oPluginStub = sinonUtils.createStub(Opa5, "getPlugin", oGetPluginSpy);

			fnChildMatcher = OpaBuilder.Matchers.childrenMatcher(oMatcherSpy, true);
			assert.strictEqual(fnChildMatcher(oDummyParent), false);

			fnChildMatcher = OpaBuilder.Matchers.childrenMatcher(_createBuilder(oMatcherSpy, oActionSpy).options({ children: [oDummyControl1, oDummyControl2] }), true);
			assert.deepEqual(fnChildMatcher(oDummyParent), true);

			oPluginStub.restore();
			oAncestorStub.restore();
		});

		QUnit.test("'aggregation' should return a matcher that returns an array of aggregation items filtered by given matchers", function(assert) {
			var fnAggregationMatcher = OpaBuilder.Matchers.aggregation("items", function(vItem) {
				return vItem % 2 === 0;
			});
			assert.deepEqual(
				fnAggregationMatcher({
					getItems: function() {
						return ["test", 1];
					}
				}),
				[]
			);

			assert.deepEqual(
				fnAggregationMatcher({
					getItems: function() {
						return [2, "test", 1, 42];
					}
				}),
				[2, 42]
			);
		});

		QUnit.test("'aggregationMatcher' should return a matcher that apply given matcher to given aggregation items", function(assert) {
			var fnAggregationMatcher = OpaBuilder.Matchers.aggregationMatcher("items", function(vItem) {
				return vItem % 2 === 0;
			});
			assert.strictEqual(
				fnAggregationMatcher({
					getItems: function() {
						return ["test", 1];
					}
				}),
				false
			);

			assert.strictEqual(
				fnAggregationMatcher({
					getItems: function() {
						return ["test", 1, 42];
					}
				}),
				true
			);
		});

		QUnit.test("'aggregationLength' should return a corresponding declarative definition of sap.ui.test.matchers.AggregationLengthEquals", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.aggregationLength("items", 5), {
				aggregationLengthEquals: {
					name: "items",
					length: 5
				}
			});
		});

		QUnit.test(
			"'aggregationAtIndex' should return a matcher that returns aggregation item at given index or undefined if not applicable",
			function(assert) {
				var fnAggregationAtIndex = OpaBuilder.Matchers.aggregationAtIndex("items", 2);
				assert.strictEqual(
					fnAggregationAtIndex({
						getItems: function() {
							return ["test", 1];
						}
					}),
					undefined
				);

				assert.strictEqual(
					fnAggregationAtIndex({
						getItems: function() {
							return ["test", 1, 42];
						}
					}),
					42
				);
			}
		);

		QUnit.test("'bindingProperties' should have its model argument optional", function(assert) {
			var fnBindingProperties = OpaBuilder.Matchers.bindingProperties( {
					text: "fitting text",
					number: 42
				}),
				bCalledBindingContextWOModel = false,
				bCalleModelWOModel = false,
				oMockControl = {
					getBindingContext: function (sName) {
						bCalledBindingContextWOModel = sName === undefined;
						return undefined;
					},
					getModel: function (sName) {
						bCalleModelWOModel = sName === undefined;
						return undefined;
					}
				};
			assert.strictEqual(fnBindingProperties(oMockControl), false);
			assert.strictEqual(bCalledBindingContextWOModel, true);
			assert.strictEqual(bCalleModelWOModel, true);
		});

		QUnit.test("'bindingProperties' should return a matcher that checks whether bound item has given properties", function(assert) {
			var sModelName = "myModelName",
				fnBindingProperties = OpaBuilder.Matchers.bindingProperties(sModelName, { text: "fitting text", number: 42 }),
				oMockControl = {
					getBindingContext: function(sName) {
					   if (sName === sModelName) {
							return oContext;
					   }
					   return undefined;
					},
					getModel: function(sName) {
						if (sName === sModelName) {
							return oModel;
						}
						return undefined;
					}
				},
				oModel = new JSONModel({
					text: "not fitting text"
				}),
				oContext = oModel.createBindingContext("/");

			assert.strictEqual(fnBindingProperties(oMockControl), false);

			oModel.setData({
				text: "fitting text"
			});
			assert.strictEqual(fnBindingProperties(oMockControl), false);

			oModel.setData({
				text: "fitting text",
				number: 42
			});
			assert.strictEqual(fnBindingProperties(oMockControl), true);

			// check unbound properties (no context, only model available)
			oContext.destroy();
			oContext = undefined;

			oModel.setData({
				text: "fitting text"
			});
			assert.strictEqual(fnBindingProperties(oMockControl), false);

			oModel.setData({
				text: "fitting text",
				number: 42
			});
			assert.strictEqual(fnBindingProperties(oMockControl), true);

			// check without context & model => result should be always false
			oModel.destroy();
			oModel = undefined;

			assert.strictEqual(fnBindingProperties(oMockControl), false);
		});

		QUnit.test("'resourceBundle' should return a matcher that validates the given property against a token text of a library message bundle", function(assert) {
			var fnResourceBundle = OpaBuilder.Matchers.resourceBundle("text", "my.test.lib", "I_AM_A_TOKEN", "first", "second"),
				fnBundleStub = sinonUtils.createStub(Library, "getResourceBundleFor",function () {
					return {
						getText: function(sToken, aParams) {
							return formatMessage(mDummyContextData[sToken], aParams);
						}
					};
				}),
				oMockControl = {
					getText: function () {
						return "I_AM_A_TOKEN";
					}
				},
				mDummyContextData = {
					I_AM_A_TOKEN: "Just a text",
					I_AM_ANOTHER_TOKEN: "{0} and {1}"
				};
			assert.strictEqual(fnResourceBundle(oMockControl), false);

			oMockControl = {
				getText: function () {
					return "Just a text";
				}
			};
			assert.deepEqual(fnResourceBundle(oMockControl), oMockControl);

			fnResourceBundle = OpaBuilder.Matchers.resourceBundle("text", "my.test.lib", "I_AM_ANOTHER_TOKEN", "first", "second");
			assert.strictEqual(fnResourceBundle(oMockControl), false);

			oMockControl = {
				getText: function () {
					return "first and second";
				}
			};
			assert.deepEqual(fnResourceBundle(oMockControl), oMockControl);

			fnBundleStub.restore();
		});

		QUnit.test("'bindingPath' should return a corresponding declarative matcher of sap.ui.test.matchers.BindingPath", function(assert) {
			assert.deepEqual(OpaBuilder.Matchers.bindingPath("myModel>/just/a/test", "value"), {
				bindingPath: {
					modelName: "myModel",
					path: "/just/a/test",
					propertyPath: "value"
				}
			});
		});

		QUnit.test("'customData' should return a matcher that checks whether bound item has custom data with proper values", function(
			assert
		) {
			var fnCustomDataMatcher = OpaBuilder.Matchers.customData({ text: "fitting text", number: 42 }),
				oMockControl = {
					data: function(sKey) {
						return mDummyCustomData[sKey];
					}
				},
				mDummyCustomData = {
					text: "not fitting text"
				};
			assert.strictEqual(fnCustomDataMatcher(oMockControl), false);

			assert.strictEqual(fnCustomDataMatcher(), false, "should work with missing control");

			mDummyCustomData = {
				text: "fitting text"
			};
			assert.strictEqual(fnCustomDataMatcher(oMockControl), false);

			mDummyCustomData = {
				text: "fitting text",
				number: 42
			};
			assert.strictEqual(fnCustomDataMatcher(oMockControl), true);

			assert.strictEqual(OpaBuilder.Matchers.customData(null)({}), true, "returns true if no customData required");
		});

		QUnit.test("'focused' should return a matcher that checks for focused elements", function(assert) {
			var fnFocusedMatcher = OpaBuilder.Matchers.focused(),
				bHasFocusViaDom = false,
				bHasFocusViaSapMFocusClass = false,
				bHasChildWithFocus = false,
				oMockControl = {
					isA: function (sIgnoredType) {
						return true;
					},
					$: function() {
						return {
							is: function (sSelector) {
								assert.strictEqual(sSelector, ":focus", "should check for focus");
								return bHasFocusViaDom;
							},
							hasClass: function (sClass) {
								assert.strictEqual(sClass, "sapMFocus", "should check for sapMFocus class");
								return bHasFocusViaSapMFocusClass;
							},
							find: function (sSelector) {
								assert.strictEqual(sSelector, ":focus", "should check for focus on children");
								return bHasChildWithFocus ? { length: 1 } : { length: 0 };
							}
						};
					}
				};

			assert.strictEqual(fnFocusedMatcher(), false, "should work with missing control and return false");
			assert.strictEqual(fnFocusedMatcher( { isA: function () { return false; }}), false, "should work with non-element types and return false");
			assert.strictEqual(fnFocusedMatcher(oMockControl), false);

			bHasFocusViaDom = true;
			assert.strictEqual(fnFocusedMatcher(oMockControl), true, "should find DOM focus");
			bHasFocusViaDom = false;
			bHasFocusViaSapMFocusClass = true;
			assert.strictEqual(fnFocusedMatcher(oMockControl), true, "should find sapMFocus class");
			bHasFocusViaSapMFocusClass = false;
			bHasChildWithFocus = true;
			assert.strictEqual(fnFocusedMatcher(oMockControl), false);

			fnFocusedMatcher = OpaBuilder.Matchers.focused(true);
			assert.strictEqual(fnFocusedMatcher(oMockControl), true, "should find children");
			bHasChildWithFocus = false;
			assert.strictEqual(fnFocusedMatcher(oMockControl), false);
		});

		QUnit.test("'filter' should return a matcher that filters given items based on defined matcher", function(assert) {
			var fnFilterMatcher = OpaBuilder.Matchers.filter([
				function(vItem) {
					return vItem % 2 === 0;
				},
				function(vItem) {
					return vItem % 3 === 0;
				}
			]);
			assert.deepEqual(fnFilterMatcher([1, 2, 3, 6, "Test", 42]), [6, 42]);
			assert.deepEqual(fnFilterMatcher([1, 3, "Test"]), []);
			assert.deepEqual(fnFilterMatcher(null), []);
			assert.deepEqual(fnFilterMatcher(undefined), []);
		});

		QUnit.test("'match' should return a matcher that applies all given matchers in given order to one item", function(assert) {
			var fnMatcher = OpaBuilder.Matchers.match([
				function(vItem) {
					return vItem % 2 === 0;
				},
				function(vItem) {
					return vItem % 3 === 0;
				}
			]);
			assert.deepEqual(fnMatcher([2, 6, 42]), false);
			assert.deepEqual(fnMatcher(2), false);
			assert.deepEqual(fnMatcher("Test"), false);
			assert.deepEqual(fnMatcher(42), 42);
			assert.deepEqual(fnMatcher(null), false);
			assert.deepEqual(fnMatcher(undefined), false);
		});

		QUnit.test("'conditional' should return a conditional matcher that executes follow up matcher under a certain condition", function(assert) {
			var oSuccessMatcher = this.spy(function(oControl) {
					return oControl % 4 === 0;
				}),
				oElseMatcher = this.spy(function(oControl) {
					return oControl % 5 === 0;
				}),
				aConditions = [
					function(vItem) {
						return vItem % 2 === 0;
					},
					function(vItem) {
						return vItem % 3 === 0;
					}
				],
				fnMatcher = OpaBuilder.Matchers.conditional(aConditions, oSuccessMatcher, oElseMatcher);

			assert.strictEqual(fnMatcher(6), false);
			assert.strictEqual(oSuccessMatcher.callCount, 1);
			assert.strictEqual(oElseMatcher.callCount, 0);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			assert.strictEqual(fnMatcher(12), 12);
			assert.strictEqual(oSuccessMatcher.callCount, 1);
			assert.strictEqual(oElseMatcher.callCount, 0);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			assert.strictEqual(fnMatcher(4), false);
			assert.strictEqual(oSuccessMatcher.callCount, 0);
			assert.strictEqual(oElseMatcher.callCount, 1);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			assert.strictEqual(fnMatcher(5), 5);
			assert.strictEqual(oSuccessMatcher.callCount, 0);
			assert.strictEqual(oElseMatcher.callCount, 1);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			// check boolean parameter for conditional matchers
			fnMatcher = OpaBuilder.Matchers.conditional(true, oSuccessMatcher, oElseMatcher);
			assert.strictEqual(fnMatcher(5), false);
			assert.strictEqual(oSuccessMatcher.callCount, 1);
			assert.strictEqual(oElseMatcher.callCount, 0);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			assert.strictEqual(fnMatcher(4), 4);
			assert.strictEqual(oSuccessMatcher.callCount, 1);
			assert.strictEqual(oElseMatcher.callCount, 0);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			fnMatcher = OpaBuilder.Matchers.conditional(false, oSuccessMatcher, oElseMatcher);
			assert.strictEqual(fnMatcher(5), 5);
			assert.strictEqual(oSuccessMatcher.callCount, 0);
			assert.strictEqual(oElseMatcher.callCount, 1);
			oSuccessMatcher.reset();
			oElseMatcher.reset();

			assert.strictEqual(fnMatcher(4), false);
			assert.strictEqual(oSuccessMatcher.callCount, 0);
			assert.strictEqual(oElseMatcher.callCount, 1);
			oSuccessMatcher.reset();
			oElseMatcher.reset();
		});

		QUnit.test("'some' should return a matcher function that checks for at least one successful match from a group of matchers", function(assert) {
			var fnMatcherMod3 = this.spy(function(vItem) {
					return vItem % 3 === 0;
				}),
				fnMatcherMod4 = this.spy(function(oControl) {
					return oControl % 4 === 0;
				}),
				fnMatcherMod5 = this.spy(function(oControl) {
					return oControl % 5 === 0;
				}),
				fnMatcher = OpaBuilder.Matchers.some(fnMatcherMod3, fnMatcherMod4, fnMatcherMod5);

			assert.strictEqual(fnMatcher(1), false);
			assert.strictEqual(fnMatcher(2), false);
			assert.strictEqual(fnMatcher(3), 3);
			assert.strictEqual(fnMatcher(12), 12);
			assert.strictEqual(fnMatcher(null), false);
		});

		QUnit.module("Actions");

		QUnit.test("'press' should return an instance of sap.ui.test.actions.Press", function(assert) {
			var oPress = OpaBuilder.Actions.press("my.suffix");
			assert.ok(oPress instanceof Press);
			assert.strictEqual(oPress.getIdSuffix(), "my.suffix");
		});

		QUnit.test("'enterText' should return an instance of sap.ui.test.actions.EnterText", function(assert) {
			var oEnterText = OpaBuilder.Actions.enterText("my Text", true, true, "my.suffix");
			assert.ok(oEnterText instanceof EnterText);
			assert.strictEqual(oEnterText.getText(), "my Text");
			assert.strictEqual(oEnterText.getClearTextFirst(), true);
			assert.strictEqual(oEnterText.getKeepFocus(), true);
			assert.strictEqual(oEnterText.getPressEnterKey(), false);
			assert.strictEqual(oEnterText.getIdSuffix(), "my.suffix");

			oEnterText = OpaBuilder.Actions.enterText("my Text", true, true, true, "my.suffix");
			assert.ok(oEnterText instanceof EnterText);
			assert.strictEqual(oEnterText.getText(), "my Text");
			assert.strictEqual(oEnterText.getClearTextFirst(), true);
			assert.strictEqual(oEnterText.getKeepFocus(), true);
			assert.strictEqual(oEnterText.getPressEnterKey(), true);
			assert.strictEqual(oEnterText.getIdSuffix(), "my.suffix");
		});

		QUnit.test("'conditional' should return a conditional action function", function(assert) {
			var aConditions = [
					function(vItem) {
						return vItem % 2 === 0;
					},
					function(vItem) {
						return vItem % 3 === 0;
					}
				],
				oSuccessAction = this.spy(function(oObject) {
					return oObject;
				}),
				oFailureAction = this.spy(function(oObject) {
					return oObject;
				}),
				fnAction = OpaBuilder.Actions.conditional(aConditions, oSuccessAction, oFailureAction);

			fnAction(6);
			assert.strictEqual(oSuccessAction.callCount, 1);
			assert.strictEqual(oFailureAction.callCount, 0);
			oSuccessAction.reset();
			oFailureAction.reset();

			fnAction(2);
			assert.strictEqual(oSuccessAction.callCount, 0);
			assert.strictEqual(oFailureAction.callCount, 1);
			oSuccessAction.reset();
			oFailureAction.reset();

			fnAction(5);
			assert.strictEqual(oSuccessAction.callCount, 0);
			assert.strictEqual(oFailureAction.callCount, 1);
			oSuccessAction.reset();
			oFailureAction.reset();

			// check boolean parameter for conditional actions
			var fnAction = OpaBuilder.Actions.conditional(true, oSuccessAction, oFailureAction);
			fnAction(6);
			assert.strictEqual(oSuccessAction.callCount, 1);
			assert.strictEqual(oFailureAction.callCount, 0);
			oSuccessAction.reset();
			oFailureAction.reset();

			fnAction(2);
			assert.strictEqual(oSuccessAction.callCount, 1);
			assert.strictEqual(oFailureAction.callCount, 0);
			oSuccessAction.reset();
			oFailureAction.reset();

			var fnAction = OpaBuilder.Actions.conditional(false, oSuccessAction, oFailureAction);
			fnAction(6);
			assert.strictEqual(oSuccessAction.callCount, 0);
			assert.strictEqual(oFailureAction.callCount, 1);
			oSuccessAction.reset();
			oFailureAction.reset();

			fnAction(2);
			assert.strictEqual(oSuccessAction.callCount, 0);
			assert.strictEqual(oFailureAction.callCount, 1);
			oSuccessAction.reset();
			oFailureAction.reset();
		});

		QUnit.test("'executor' should return a function that executes given actions on given controls", function(assert) {
			var fnAction1 = this.spy(function(oObject) {
					return oObject;
				}),
				fnAction2 = this.spy(function(oObject) {
					return oObject;
				}),
				oDummyObject1 = { dummy: true },
				oDummyObject2 = { anotherDummy: true },
				oExecutor;

			oExecutor = OpaBuilder.Actions.executor(fnAction1);
			oExecutor(oDummyObject1);
			assert.strictEqual(fnAction1.callCount, 1);
			assert.ok(fnAction1.calledWith(oDummyObject1));
			fnAction1.reset();

			oExecutor([oDummyObject1, oDummyObject2]);
			assert.strictEqual(fnAction1.callCount, 2);
			assert.ok(fnAction1.calledWith(oDummyObject1));
			assert.ok(fnAction1.calledWith(oDummyObject2));
			fnAction1.reset();

			oExecutor = OpaBuilder.Actions.executor([fnAction1, fnAction2]);
			oExecutor(oDummyObject1);
			assert.strictEqual(fnAction1.callCount, 1);
			assert.strictEqual(fnAction2.callCount, 1);
			assert.ok(fnAction1.calledWith(oDummyObject1));
			assert.ok(fnAction2.calledWith(oDummyObject1));
			fnAction1.reset();
			fnAction2.reset();

			oExecutor([oDummyObject1, oDummyObject2]);
			assert.strictEqual(fnAction1.callCount, 2);
			assert.strictEqual(fnAction2.callCount, 2);
			assert.ok(fnAction1.calledWith(oDummyObject1));
			assert.ok(fnAction1.calledWith(oDummyObject2));
			assert.ok(fnAction2.calledWith(oDummyObject1));
			assert.ok(fnAction2.calledWith(oDummyObject2));
			fnAction1.reset();
			fnAction2.reset();
		});
	}
);

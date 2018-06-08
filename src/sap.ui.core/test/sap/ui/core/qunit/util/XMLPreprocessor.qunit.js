/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/base/BindingParser",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/CustomizingConfiguration",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/core/util/XMLPreprocessor",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.xml" // needed to have jQuery.sap.parseXML
], function (jQuery, Device, BindingParser, ManagedObject, SyncPromise, CustomizingConfiguration,
		XMLTemplateProcessor, XMLPreprocessor, BindingMode, Context, JSONModel/*, jQuerySapXml*/) {
	/*global QUnit, sinon, window */
	/*eslint consistent-this: 0, max-nested-callbacks: 0, no-loop-func: 0, no-warning-comments: 0*/
	"use strict";

	var sComponent = "sap.ui.core.util.XMLPreprocessor",
		iOldLogLevel = jQuery.sap.log.getLevel(sComponent);

	//---------------------------------------------------------------------------------------------
	// "public" methods to be used directly in test functions
	//---------------------------------------------------------------------------------------------

	/**
	 * Creates a new (JSON) model with the given data which is able to return a property binding's
	 * value as a promise.
	 *
	 * @param {object} oData
	 *   The model's data, JSON style
	 * @returns {sap.ui.model.json.JSONModel}
	 *   An "async" JSON model
	 */
	function asyncModel(oData) {
		var oModel = new JSONModel(oData);

		oModel.$$valueAsPromise = true;
		oModel.bindProperty = function () {
			var oBinding = JSONModel.prototype.bindProperty.apply(this, arguments);

			oBinding.checkUpdate = function (){
				var vValue = this._getValue();

				if (this.mParameters.$$valueAsPromise) {
					if (0 <= vValue && vValue < 10) { // eslint-disable-line yoda
						vValue = new Promise(function (resolve) {
							setTimeout(resolve.bind(null, vValue), vValue);
						});
					} else if (vValue instanceof Error) {
						vValue = Promise.reject(vValue);
					} else if (vValue !== "sync") {
						vValue = Promise.resolve(vValue);
					}
				} else {
					vValue = NaN; // not yet available
				}
				this.oValue = vValue;
				this._fireChange({reason : "change"});
			};

			return oBinding;
		};

		return oModel;
	}

	/**
	 * Creates an <mvc:View> tag with namespace definitions.
	 * @param {string} [sPrefix="template"]
	 *   the prefix for the template namespace
	 * @returns {string}
	 *   <mvc:View> tag
	 */
	function mvcView(sPrefix) {
		sPrefix = sPrefix || "template";
		return '<mvc:View xmlns="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:' + sPrefix
			+ '="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">';
	}

	/**
	 * Calls our XMLPreprocessor on the given view content, identifying the caller as "qux"
	 * and passing "this._sOwnerId" as component ID and "this.sViewName" as (view) name.
	 *
	 * @param {Element} oViewContent
	 *   the original view content as an XML document element
	 * @param {object} [mSettings]
	 *   a settings object for the preprocessor
	 * @param {boolean} [bAsync]
	 *   Whether the view should be async
	 * @returns {Element}
	 *   the processed view content as an XML document element
	 */
	function process(oViewContent, mSettings, bAsync) {
		var oViewInfo = {
				caller : "qux",
				componentId : "this._sOwnerId",
				name : "this.sViewName",
				sync : !bAsync,
				//TODO TDD is missing for support info calls!
				_supportInfo : function () {} // Note: FAKE support info handler
			};

		if (bAsync) {
			mSettings["X-async"] = true; // eXperimental async switch, to be removed soon
		}
		return XMLPreprocessor.process(oViewContent, oViewInfo, mSettings);
	}

	/**
	 * Expects a warning with the given message for the given log mock.
	 *
	 * @param {object} oLogMock
	 *   mock for <code>jQuery.sap.log</code>
	 * @param {string} sExpectedWarning
	 *   expected warning message
	 * @param {any} [vDetails]
	 *   expected warning details
	 * @returns {object}
	 *   the resulting Sinon expectation
	 */
	function warn(oLogMock, sExpectedWarning, vDetails) {
		return oLogMock.expects("warning")
			// do not construct arguments in vain!
			.exactly(jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING, sComponent) ? 1 : 0)
			.withExactArgs(_matchArg(sExpectedWarning), _matchArg(vDetails), sComponent);
	}

	/**
	 * Creates an DOM document from the given strings.
	 * @param {object} assert the assertions
	 * @param {string[]} aContent the content
	 * @returns {Element} the DOM document's root element
	 */
	function xml(assert, aContent) {
		var oDocument = jQuery.sap.parseXML(aContent.join(""));
		assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
		return oDocument.documentElement;
	}

	//---------------------------------------------------------------------------------------------
	// "internal" methods not to be used directly in test functions, use this.*() instead
	//---------------------------------------------------------------------------------------------

	/*
	 * Creates a Sinon matcher that compares after normalizing the contained XML.
	 *
	 * @param {string|object} vExpected
	 *   either an expected string or already a Sinon matcher
	 * @returns {object}
	 *   a Sinon matcher
	 */
	function _matchArg(vExpected) {
		if (typeof vExpected === "string") {
			return sinon.match(function (sActual) {
				return _normalizeXml(vExpected) === _normalizeXml(sActual);
			}, vExpected);
		}
		return vExpected;
	}

	/*
	 * Remove all namespaces and all spaces before tag ends (..."/>) from the given XML string.
	 *
	 * @param {string} sXml
	 *   XML string
	 * @returns {string}
	 *   Normalized XML string
	 */
	function _normalizeXml(sXml) {
		/*jslint regexp: true*/
		sXml = sXml
			// Note: IE > 8 does not add all namespaces at root level, but deeper inside the tree!
			// Note: Chrome adds all namespaces at root level, but before other attributes!
			.replace(/ xmlns.*?=\".*?\"/g, "")
			// Note: browsers differ in whitespace for empty HTML(!) tags
			.replace(/ \/>/g, '/>');
		if (Device.browser.msie || Device.browser.edge) {
			// Microsoft shuffles attribute order; sort multiple attributes alphabetically:
			// - no escaped quotes in attribute values!
			// - e.g. <In a="..." b="..."/> or <template:repeat a="..." t:b="...">
			sXml = sXml.replace(/<[\w:]+( [\w:]+="[^"]*"){2,}(?=\/?>)/g, function (sMatch) {
				var aParts = sMatch.split(" ");
				// aParts[0] e.g. "<In" or "<template:repeat"
				// sMatch does not contain "/>" or ">" at end!
				return aParts[0] + " " + aParts.slice(1).sort().join(" ");
			});
		}
		return sXml;
	}

	/*
	 * Call the given code under test, making sure that aggregations are bound and unbound in
	 * balance.
	 *
	 * @param {object} that the test context
	 * @param {object} assert the assertions
	 * @param {function} fnCodeUnderTest
	 *   code under test, may return a promise
	 * @returns {sap.ui.base.SyncPromise}
	 *   A sync promise for timing which resolves with the result of the code under test
	 */
	function _withBalancedBindAggregation(that, assert, fnCodeUnderTest) {
		var fnBindAggregation = ManagedObject.prototype.bindAggregation,
			oBindAggregationExpectation,
			fnUnbindAggregation = ManagedObject.prototype.unbindAggregation,
			oUnbindAggregationExpectation;

		oBindAggregationExpectation = that.mock(ManagedObject.prototype).expects("bindAggregation")
			.atLeast(0).withExactArgs("list", sinon.match({mode : BindingMode.OneTime}))
			.callsFake(fnBindAggregation);
		oUnbindAggregationExpectation = that.mock(ManagedObject.prototype)
			.expects("unbindAggregation").atLeast(0).withExactArgs("list", true)
			.callsFake(fnUnbindAggregation);

		return SyncPromise.resolve(fnCodeUnderTest()).then(function (oResult) {
			assert.strictEqual(oUnbindAggregationExpectation.callCount,
				oBindAggregationExpectation.callCount, "balance of bind and unbind");
			return oResult;
		});
	}
	//TODO test with exception during bindAggregation, e.g. via sorter

	/*
	 * Call the given code under test, making sure that properties are bound and unbound in
	 * balance.
	 *
	 * @param {object} that the test context
	 * @param {object} assert the assertions
	 * @param {function} fnCodeUnderTest
	 *   code under test, may return a promise
	 * @returns {sap.ui.base.SyncPromise}
	 *   A sync promise for timing which resolves with the result of the code under test
	 */
	function _withBalancedBindProperty(that, assert, fnCodeUnderTest) {
		var fnBindProperty = ManagedObject.prototype.bindProperty,
			oBindPropertyExpectation,
			fnUnbindProperty = ManagedObject.prototype.unbindProperty,
			oUnbindPropertyExpectation;

		function checkBindingMode(oBindingInfo) {
			var aParts = oBindingInfo.parts;

			if (oBindingInfo.mode !== BindingMode.OneTime) {
				return false;
			}
			if (aParts) {
				return aParts.every(function (oInfoPart) {
					return oInfoPart.mode === BindingMode.OneTime;
				});
			}
			return true;
		}

		oBindPropertyExpectation = that.mock(ManagedObject.prototype).expects("bindProperty")
			.atLeast(0).withExactArgs("any", sinon.match(checkBindingMode))
			.callsFake(fnBindProperty);
		oUnbindPropertyExpectation = that.mock(ManagedObject.prototype).expects("unbindProperty")
			.atLeast(0).withExactArgs("any", true).callsFake(fnUnbindProperty);

		return SyncPromise.resolve(fnCodeUnderTest()).then(function (oResult) {
			assert.strictEqual(oUnbindPropertyExpectation.callCount,
				oBindPropertyExpectation.callCount, "balance of bind and unbind");
			return oResult;
		});
	}

	//*********************************************************************************************
	//*********************************************************************************************
	QUnit.module("sap.ui.core.util.XMLPreprocessor", {
		afterEach : function () {
			sap.ui.core.CustomizingConfiguration = this.oCustomizingConfiguration;
			jQuery.sap.log.setLevel(iOldLogLevel, sComponent);
			delete window.foo;
		},

		beforeEach : function () {
			this.oCustomizingConfiguration = sap.ui.core.CustomizingConfiguration;
			// do not rely on ERROR vs. DEBUG due to minified sources
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG, sComponent);

			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			// do not flood the console ;-)
			this.oDebugExpectation = this.oLogMock.expects("debug").atLeast(0);
//TODO				.withExactArgs(sinon.match.string, sinon.match.any, sComponent);
//TODO			this.oDebugExpectation.callThrough();

			this.oXMLTemplateProcessorMock = this.mock(XMLTemplateProcessor);
			this.oXMLTemplateProcessorMock.expects("loadTemplate").never();
			this.oXMLTemplateProcessorMock.expects("loadTemplatePromise").never();
		},

		/**
		 * Checks that our XMLPreprocessor works as expected on the given view content. The view
		 * content is automatically searched for constant test conditions and appropriate warnings
		 * are expected; log output is stubbed in order to keep console clean. Makes sure there are
		 * no unexpected warnings or even errors.
		 *
		 * @param {object} assert the assertions
		 * @param {string[]} aViewContent
		 *   the original view content
		 * @param {object} [mSettings={}]
		 *   a settings object for the preprocessor
		 * @param {string[]|RegExp} [vExpected]
		 *   the expected content as string array, with root element omitted; if missing, the
		 *   expectation is derived from the original view content by smart filtering. Alternatively
		 *   a regular expression which is expected to match the serialized original view content.
		 * @param {boolean} [bAsync]
		 *   Whether the view should be async
		 * @returns {sap.ui.base.SyncPromise}
		 *   A sync promise for timing
		 */
		check : function (assert, aViewContent, mSettings, vExpected, bAsync) {
			var sActual,
				sExpected,
				oViewContent = xml(assert, aViewContent),
				i,
				that = this;

			// setup
			if (!vExpected) { // derive expectations by smart filtering
				vExpected = [];
				for (i = 1; i < aViewContent.length - 1; i += 1) {
					// Note: <In> should really have some attributes to make sure they are kept!
					if (aViewContent[i].startsWith("<In ")
							|| aViewContent[i].startsWith("<!--In:")) {
						vExpected.push(aViewContent[i]);
					}
				}
			}
			if (Array.isArray(vExpected)) {
				vExpected.unshift(aViewContent[0]); // 1st line is always in
				vExpected.push(aViewContent[aViewContent.length - 1]); // last line is always in
				if (vExpected.length === 2) {
					// expect just a single empty tag
					vExpected = ['<mvc:View xmlns:mvc="sap.ui.core.mvc"/>'];
				}
			}
			aViewContent.forEach(function (sLine) {
				if (/if test="(false|true|\{= false \})"/.test(sLine)) {
					warn(that.oLogMock, sinon.match(/\[[ \d]\d\] Constant test condition/), sLine);
				}
			});

			return _withBalancedBindAggregation(this, assert, function () {
				return _withBalancedBindProperty(that, assert, function () {
					// code under test
					return process(oViewContent, mSettings, bAsync);
				});
			}).then(function (oResult) {
				// assertions
				assert.strictEqual(oResult, oViewContent);
				sActual = _normalizeXml(jQuery.sap.serializeXML(oViewContent));
				if (Array.isArray(vExpected)) {
					sExpected = _normalizeXml(vExpected.join(""));
					assert.strictEqual(sActual, sExpected, "XML looks as expected: " + sExpected);
				} else {
					assert.ok(vExpected.test(sActual), "XML: " + sActual + " matches " + vExpected);
				}
			});
		},

		/**
		 * Checks that the XML preprocessor throws the expected error message when called on the
		 * given view content. Expects the error to be logged additionally.
		 *
		 * @param {object} assert the assertions
		 * @param {string[]} aViewContent
		 *   view content as separate lines
		 * @param {string} sExpectedMessage
		 *   no caller identification expected;
		 *   "{0}" is replaced with the indicated line of the view content (see vOffender)
		 * @param {object} [mSettings={}]
		 *   a settings object for the preprocessor
		 * @param {number|string} [vOffender=1]
		 *   (index of) offending statement
		 */
		checkError : function (assert, aViewContent, sExpectedMessage, mSettings, vOffender) {
			var oViewContent = xml(assert, aViewContent);

			if (vOffender === undefined || typeof vOffender === "number") {
				vOffender = aViewContent[vOffender || 1];
			}
			sExpectedMessage = sExpectedMessage.replace("{0}", vOffender);
			this.oLogMock.expects("error")
				.withExactArgs(_matchArg(sExpectedMessage), "qux", sComponent);

			try {
				process(oViewContent, mSettings);
				assert.ok(false);
			} catch (ex) {
				assert.strictEqual(
					_normalizeXml(ex.message),
					_normalizeXml("qux: " + sExpectedMessage),
					ex.stack
				);
			}
		},

		/**
		 * Checks that the XMLPreprocessor works as expected on the given view content and that the
		 * tracing works as expected. The view content is automatically searched for constant test
		 * conditions and appropriate warnings are expected; log output is stubbed in order to keep
		 * console clean.
		 *
		 * @param {object} assert the assertions
		 * @param {boolean} bDebug
		 *   whether debug output is accepted and expected (sets the log level accordingly)
		 * @param {object[]} aExpectedMessages
		 *   a array of expected debug messages with the message in <code>m</code> and optional
		 *   details in <code>d</code>. <code>d</code> may also contain a number which is
		 *   interpreted as index into <code>aViewContent</code>.
		 * @param {string[]} aViewContent
		 *   the original view content
		 * @param {object} [mSettings={}]
		 *   a settings object for the preprocessor
		 * @param {string[]|RegExp} [vExpected]
		 *   the expected content as string array, with root element omitted; if missing, the
		 *   expectation is derived from the original view content by smart filtering. Alternatively
		 *   a regular expression which is expected to match the serialized original view content.
		 * @param {boolean} [bAsync]
		 *   Whether the view should be async
		 * @returns {sap.ui.base.SyncPromise}
		 *   A sync promise for timing
		 */
		checkTracing : function (assert, bDebug, aExpectedMessages, aViewContent, mSettings,
				vExpected, bAsync) {
			var aMessagesInActualOrder = [],
				aMessagesInExpectedOrder = [],
				that = this;

			this.oDebugExpectation.never();
			if (!bDebug) {
				jQuery.sap.log.setLevel(jQuery.sap.log.Level.WARNING, sComponent);
			} else {
				aExpectedMessages.forEach(function (oExpectedMessage, i) {
					var vExpectedDetail = oExpectedMessage.d;
					if (typeof vExpectedDetail === "number") {
						vExpectedDetail = aViewContent[vExpectedDetail];
					}
					that.oLogMock.expects("debug")
						.withExactArgs(_matchArg(oExpectedMessage.m), _matchArg(vExpectedDetail),
							sComponent)
						.callsFake(function (sMessage, vDetail, sComponent) {
							var s = sMessage + " - " + vDetail;

							aMessagesInActualOrder.push(s);
							aMessagesInExpectedOrder[i] = s;
						});
				});
			}

			return this.check(assert, aViewContent, mSettings, vExpected, bAsync)
				.then(function () {
					assert.strictEqual(aMessagesInActualOrder.join("\n"),
						aMessagesInExpectedOrder.join("\n"), "order of log messages");
				});
		},

		/**
		 * Sets up a mock on <code>XMLTemplateProcessor</code> that allows to load the fragment
		 * with the given name, returning the given XML (async, if needed).
		 *
		 * @param {boolean} bAsync - Whether the async API is expected to be used
		 * @param {string} sName - The fragment's name
		 * @param {string} sXml - The fragment's XML
		 */
		expectLoad : function (bAsync, sName, sXml) {
			if (bAsync) {
				this.oXMLTemplateProcessorMock.expects("loadTemplatePromise")
					.withExactArgs(sName, "fragment")
					.returns(new Promise(function (resolve) {
						setTimeout(resolve.bind(null, sXml), 0); // simulate XHR
					}));
			} else {
				this.oXMLTemplateProcessorMock.expects("loadTemplate")
					.withExactArgs(sName, "fragment").returns(sXml);
			}
		},

		/**
		 * Checks that the XML preprocessor throws the expected error message when called on the
		 * given view content. Determines the offending content by <code>id="unexpected"</code>.
		 *
		 * @param {object} assert the assertions
		 * @param {string[]} aViewContent
		 *   view content as separate lines
		 * @param {string} sExpectedMessage
		 *   no caller identification expected;
		 *   "{0}" is replaced with the line of the view content which has id="unexpected"
		 */
		unexpected : function (assert, aViewContent, sExpectedMessage) {
			var iUnexpected;

			aViewContent.forEach(function (sViewContent, i) {
				if (/id="unexpected"/.test(sViewContent)) {
					iUnexpected = i;
				}
			});

			this.checkError(assert, aViewContent, sExpectedMessage, undefined, iUnexpected);
		}
	});

	//*********************************************************************************************
	[{
		aViewContent : [
			mvcView("t"),
			// namespace prefix other than "template"
			'<t:if test="false">',
			'<Out/>',
			'</t:if>',
			'</mvc:View>'
		]
	}, {
		aViewContent : [
			mvcView(),
			// Note: requires unescaping to support constant expressions!
			'<template:if test="{= false }">',
			'<Out/>',
			'<\/template:if>',
			'<\/mvc:View>'
		]
	}].forEach(function (oFixture) {
		[false, true].forEach(function (bWarn) {
			var aViewContent = oFixture.aViewContent;

			QUnit.test(aViewContent[1] + ", warn = " + bWarn, function (assert) {
				if (!bWarn) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR, sComponent);
				}

				this.check(assert, aViewContent);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='true'", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<In id="first"/>',
			'<In id="true"/>',
			'<In id="last"/>',
			'<!--In: check that comments are tolerated, even as last child -->',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		QUnit.test("Warnings w/o debug output log caller, warn = " + bWarn, function (assert) {
			// no debug output --> caller information should be logged once
			jQuery.sap.log.setLevel(bWarn
				? jQuery.sap.log.Level.WARNING
				: jQuery.sap.log.Level.ERROR,
				sComponent);
			warn(this.oLogMock, "Warning(s) during processing of qux", null)
				.exactly(bWarn ? 1 : 0);

			this.check(assert, [
				mvcView(),
				'<template:if test="true"/>', // 1st warning
				'<template:if test="true"/>', // 2nd warning
				'</mvc:View>'
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("XML with multiple template:if", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<In id="true"/>',
			'</template:if>',
			'<template:if test="false">',
			'<Out/>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with nested template:if (as last child)", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<In id="true"/>',
			'<template:if test="false">',
			'<Out/>',
			'</template:if>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with nested template:if (as inner child)", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<In id="true"/>',
			'<template:if test="false">',
			'<Out/>',
			'</template:if>',
			'<template:if test="false"/>', // this must also be processed, of course!
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	// Note: "X" is really nothing special
	["true", true, 1, "X"].forEach(function (oFlag) {
		QUnit.test("XML with template:if test='{/flag}', truthy, flag = " + oFlag,
			function (assert) {
				this.check(assert, [
					mvcView("t"),
					'<t:if test="{path: \'/flag\', type: \'sap.ui.model.type.Boolean\'}">',
					'<In id="flag"/>',
					'</t:if>',
					'</mvc:View>'
				], {
					models: new JSONModel({flag: oFlag})
				});
			}
		);
	});

	//*********************************************************************************************
	// Note: " " intentionally not included yet, should not matter for OData!
	["false", false, 0, null, undefined, NaN, ""].forEach(function (oFlag) {
		QUnit.test("XML with template:if test='{/flag}', falsy, flag = " + oFlag,
			function (assert) {
				this.check(assert, [
					mvcView(),
					'<template:if test="{/flag}">',
					'<Out/>',
					'</template:if>',
					'</mvc:View>'
				], {
					models: new JSONModel({flag: oFlag})
				});
			}
		);
	});

	//*********************************************************************************************
	// Note: relative paths now!
	["true", true, 1, "X"].forEach(function (oFlag) {
		QUnit.test("XML with template:if test='{flag}', truthy, flag = " + oFlag,
			function (assert) {
				var oModel = new JSONModel({flag: oFlag});

				this.check(assert, [
					mvcView(),
					'<template:if test="{flag}">',
					'<In id="flag"/>',
					'</template:if>',
					'</mvc:View>'
				], {
					models: oModel, bindingContexts: oModel.createBindingContext("/")
				});
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='{formatter:...}'", function (assert) {
		window.foo = {
			Helper: {
				not: function (oRawValue) {
					return !oRawValue;
				}
			}
		};
		this.check(assert, [
			mvcView(),
			'<template:if test="{formatter: \'foo.Helper.not\', path:\'/flag\'}">',
			'<In id="flag"/>',
			'</template:if>',
			'</mvc:View>'
		], {
			models: new JSONModel({flag: false})
		});
	});

	//*********************************************************************************************
	[{
		aViewContent : [
			mvcView(),
			'<template:if test="' + "{formatter: 'foo.Helper.fail', path:'/flag'}"
				+ '">',
			'<Out/>',
			'</template:if>',
			'</mvc:View>'
		],
		aDebugMessages : [
			{m : "[ 0] Start processing qux"},
			{m : "[ 1] test == undefined --> false", d : 1},
			{m : "[ 1] Finished", d : 3},
			{m : "[ 0] Finished processing qux"}
		]
	}, {
		aViewContent : [
			mvcView(),
			'<Fragment fragmentName="' + "{formatter: 'foo.Helper.fail', path:'/flag'}"
				+ '" type="XML"/>',
			'</mvc:View>'
		],
		bAsIs : true // view remains "as is"
	}, {
		aViewContent : [
			mvcView(),
			'<ExtensionPoint name="' + "{formatter: 'foo.Helper.fail', path:'/flag'}" + '"/>',
			'</mvc:View>'
		],
		bAsIs : true // view remains "as is"
	}].forEach(function (oFixture) {
		[false, true].forEach(function (bWarn) {
			var aViewContent = oFixture.aViewContent,
				vExpected = oFixture.bAsIs ? [aViewContent[1]] : undefined;

			QUnit.test(aViewContent[1] + ", exception in formatter, warn = " + bWarn,
				function (assert) {
					var oError = new Error("deliberate failure");

					this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
						.never();
					if (!bWarn) {
						jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR, sComponent);
					}
					warn(this.oLogMock,
							sinon.match(/\[ \d\] Error in formatter: Error: deliberate failure/),
							aViewContent[1])
						.exactly(bWarn ? 1 : 0); // do not construct arguments in vain!

					window.foo = {
						Helper : {
							fail : function (oRawValue) {
								throw oError;
							}
						}
					};

					if (bWarn && oFixture.aDebugMessages) {
						this.checkTracing(assert, true, oFixture.aDebugMessages, aViewContent, {
								models : new JSONModel({flag : true})
							}, vExpected);
					} else {
						this.check(assert, aViewContent, {
							models : new JSONModel({flag : true})
						}, vExpected);
					}
				}
			);
		});
	});

	//*********************************************************************************************
	[{
		aViewContent : [
			mvcView(),
			'<template:if test="{unrelated>/some/path}">',
			'<Out/>',
			'</template:if>',
			'</mvc:View>'
		]
	}, {
		aViewContent : [
			mvcView(),
			'<template:if test="' + "{path:'/some/path',formatter:'.someMethod'}" + '">',
			'<Out/>',
			'</template:if>',
			'</mvc:View>'
		],
		sMessage : '[ 1] Function name(s) .someMethod not found'
	}, {
		aViewContent : [
			mvcView(),
			'<template:if test="'
			+ "{path:'/some/path',formatter:'.someMethod'}{path:'/some/path',formatter:'foo.bar'}"
			+ '">',
			'<Out/>',
			'</template:if>',
			'</mvc:View>'
		],
		sMessage : '[ 1] Function name(s) .someMethod, foo.bar not found'
	}, {
		aViewContent : [
			mvcView(),
			"<template:repeat list=\"{path: '/', factory: '.someMethod'}\"/>",
			'</mvc:View>'
		],
		sMessage : '[ 0] Function name(s) .someMethod not found'
	}, {
		aViewContent : [
			mvcView(),
			'<Fragment fragmentName="{foo>/some/path}" type="XML"/>',
			'</mvc:View>'
		],
		vExpected : [ // Note: XML serializer outputs &gt; encoding...
			'<Fragment fragmentName="{foo&gt;/some/path}" type="XML"/>'
		]
	}, {
		aViewContent : [
			mvcView(),
			'<ExtensionPoint name="{foo>/some/path}"/>',
			'</mvc:View>'
		],
		vExpected : [ // Note: XML serializer outputs &gt; encoding...
			'<ExtensionPoint name="{foo&gt;/some/path}"/>'
		]
	}].forEach(function (oFixture) {
		[false, true].forEach(function (bWarn) {
			var aViewContent = oFixture.aViewContent,
				vExpected = oFixture.vExpected && oFixture.vExpected.slice();

			QUnit.test(aViewContent[1] + ", warn = " + bWarn, function (assert) {
				this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
					.never();
				if (!bWarn) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR, sComponent);
				}
				warn(this.oLogMock,
						oFixture.sMessage || sinon.match(/\[ \d\] Binding not ready/),
						aViewContent[1])
					.exactly(bWarn ? 1 : 0); // do not construct arguments in vain!

				this.check(assert, aViewContent, {
					models : new JSONModel()
				}, vExpected);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Do not process nested template:ifs if not necessary", function (assert) {
		window.foo = {
			Helper : {
				forbidden : function (oRawValue) {
					assert.ok(false, "formatter MUST not be called!");
				}
			}
		};
		this.check(assert, [
			mvcView(),
			'<template:if test="false">',
			'<template:if test="{formatter: \'foo.Helper.forbidden\', path:\'/flag\'}"/>',
			'</template:if>',
			'</mvc:View>'
		], {
			models : new JSONModel({flag : true})
		});
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='false' and template:then", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='true' and template:then", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<!-- some comment node -->',
			'<template:then>',
			'<In id="then"/>',
			'</template:then>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with nested template:if test='true' and template:then", function (assert) {
		this.check(assert, [
			mvcView(),
			// it is essential for the test that there is not tag between the if's
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:then>',
			'<In id="true"/>',
			'</template:then>',
			'</template:if>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='true' and template:then/else", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<template:then>',
			'<In id="then"/>',
			'</template:then>',
			'<!-- some comment node -->',
			'<template:else>',
			'<Out/>',
			'</template:else>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='false' and template:then/else", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'<template:else>',
			'<In id="else"/>',
			'</template:else>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("XML with nested template:if test='true' and template:then/else",
		function (assert) {
			this.check(assert, [
				mvcView(),
				'<template:if test="true">',
				'<In id="true"/>',
				'<template:if test="false">',
				'<template:then>',
				'<Out/>',
				'</template:then>',
				'<template:else>',
				'<In id="else"/>',
				'</template:else>',
				'</template:if>',
				'</template:if>',
				'</mvc:View>'
			]);
		}
	);

	//*********************************************************************************************
	[[
		mvcView(),
		'<template:foo id="unexpected"/>',
		'</mvc:View>'
	], [
		mvcView(),
		'<template:then id="unexpected"/>',
		'</mvc:View>'
	], [
		mvcView(),
		'<template:else id="unexpected"/>',
		'</mvc:View>'
	]].forEach(function (aViewContent, i) {
		QUnit.test("Unexpected tags (" + i + ")", function (assert) {
			this.unexpected(assert, aViewContent, "Unexpected tag {0}");
		});
	});

	//*********************************************************************************************
	[[
		mvcView(),
		'<template:if test="true">',
		'<template:then/>',
		'<Icon id="unexpected"/>',
		'</template:if>',
		'</mvc:View>'
	], [
		mvcView(),
		'<template:if test="true">',
		'<template:then/>',
		'<template:then id="unexpected"/>',
		'</template:if>',
		'</mvc:View>'
	], [
		mvcView(),
		'<template:if test="true">',
		'<template:then/>',
		'<Icon id="unexpected"/>',
		'<template:else/>',
		'</template:if>',
		'</mvc:View>'
	]].forEach(function (aViewContent, i) {
		QUnit.test("Expected <template:else>, but instead saw... (" + i + ")", function (assert) {
			this.unexpected(assert, aViewContent,
				"Expected <template:elseif> or <template:else>, but instead saw {0}");
		});
	});

	//*********************************************************************************************
	[[
		mvcView("t"),
		'<t:if test="true">',
		'<t:then/>',
		'<t:else/>',
		'<!-- some comment node -->',
		'<Icon id="unexpected"/>',
		'</t:if>',
		'</mvc:View>'
	], [
		mvcView("t"),
		'<t:if test="true">',
		'<t:then/>',
		'<t:else/>',
		'<t:else id="unexpected"/>',
		'</t:if>',
		'</mvc:View>'
	]].forEach(function (aViewContent, i) {
		QUnit.test("Expected </t:if>, but instead saw... (" + i + ")", function (assert) {
			this.unexpected(assert, aViewContent, "Expected </t:if>, but instead saw {0}");
		});
	});

	//*********************************************************************************************
	QUnit.test('<template:elseif>: if is true', function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<template:then>',
			'<In id="true"/>',
			'</template:then>',
			// condition is not evaluated, use some truthy value but do not expect a warning
			'<template:elseif test="truthy">',
			'<Out/>',
			'</template:elseif>',
			'<template:else>',
			'<Out/>',
			'</template:else>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test('<template:elseif>: all false, w/ else', function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'<template:elseif test="false">',
			'<Out/>',
			'</template:elseif>',
			'<template:else>',
			'<In id="true"/>',
			'</template:else>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test('<template:elseif>: all false, w/o else', function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'<template:elseif test="false">',
			'<Out/>',
			'</template:elseif>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test('<template:elseif>: elseif is true', function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'<template:elseif test="false">',
			'<Out/>',
			'</template:elseif>',
			'<template:elseif test="true">',
			'<In id="true"/>',
			'</template:elseif>',
			'<template:else>',
			'<Out/>',
			'</template:else>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("binding resolution", function (assert) {
		window.foo = {
			Helper : {
				help : function (vRawValue) {
					return vRawValue.String || "{" + vRawValue.Path + "}";
				},
				nil : function () {
					return null;
				}
			}
		};

		this.check(assert, [
			mvcView().replace(">", ' xmlns:html="http://www.w3.org/1999/xhtml">'),
			'<!-- some comment node -->', // to test skipping of none ELEMENT_NODES while visiting
			'<Label text="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label\'}"/>',
			'<Text maxLines="{formatter: \'foo.Helper.nil\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value\'}"'
				+ ' text="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value\'}"/>',
			'<Label text="A \\{ is a special character"/>', // escaping MUST NOT be changed!
			'<Text text="{unrelated>/some/path}"/>', // unrelated binding MUST NOT be changed!
			// avoid error "formatter function .someMethod not found!"
			'<Text text="' + "{path:'/some/path',formatter:'.someMethod'}" + '"/>',
			'<html:img src="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/TypeImageUrl\'}"/>',
			'</mvc:View>'
		], {
			models: new JSONModel({
				"com.sap.vocabularies.UI.v1.HeaderInfo" : {
					"TypeImageUrl" : {
						"String" : "/coco/apps/main/img/Icons/product_48.png"
					},
					"Title" : {
						"Label" : {
							"String" : "Customer"
						},
						"Value" : {
							"Path" : "CustomerName"
						}
					}
				}
			})
		}, [
			'<!-- some comment node -->',
			'<Label text="Customer"/>',
			'<Text text="{CustomerName}"/>', // "maxLines" has been removed
			'<Label text="A \\{ is a special character"/>',
			// Note: XML serializer outputs &gt; encoding...
			'<Text text="{unrelated&gt;/some/path}"/>',
			'<Text text="' + "{path:'/some/path',formatter:'.someMethod'}" + '"/>',
			// TODO is this the expected behaviour? And what about text nodes?
			'<html:img src="/coco/apps/main/img/Icons/product_48.png"/>'
		]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		var sTitle = "binding resolution: ignore [object Object], debug = " + bDebug;

		QUnit.test(sTitle, function (assert) {
			this.checkTracing(assert, bDebug, [
				{m : "[ 0] Start processing qux"},
				{m : "[ 0] text = [object Object]", d : 1},
				{m : "[ 0] Ignoring [object Array] value for attribute text", d : 3},
				{m : "[ 0] Ignoring [object Date] value for attribute text", d : 4},
				{m : "[ 0] Ignoring [object Object] value for attribute text", d : 5},
				{m : "[ 0] Finished processing qux"}
			], [
				mvcView().replace(">", ' xmlns:html="http://www.w3.org/1999/xhtml">'),
				// don't get fooled here
				'<Text text="{/string}"/>',
				'<Text text="[object Object]"/>',
				// do not replace by "[object Object]" etc.
				'<Text text="{/Array}"/>',
				'<Text text="{/Date}"/>',
				'<Text text="{/Object}"/>',
				'</mvc:View>'
			], {
				models: new JSONModel({
					"string" : "[object Object]",
					"Array" : [],
					"Date" : new Date(),
					"Object" : {}
				})
			}, [
				'<Text text="[object Object]"/>',
				'<Text text="[object Object]"/>',
				'<Text text="{/Array}"/>',
				'<Text text="{/Date}"/>',
				'<Text text="{/Object}"/>'
			]);
		});
	});
	/*
	 * @see http://www.ecma-international.org/ecma-262/5.1/#sec-8.6.2, [[Class]]
	 *
	 * "Arguments" : arguments, // [object Arguments]
	 * //[object Boolean]: http://eslint.org/docs/rules/no-new-wrappers
	 * "Error" : new Error(), // [object Error]
	 * "Function" : String, // [object Function]
	 * "JSON" : JSON, // [object JSON]
	 * "Math" : Math, // [object Math]
	 * //[object Null]: ManagedObject#validateProperty maps null to default value (undefined)
	 * //[object Number]: http://eslint.org/docs/rules/no-new-wrappers
	 * "RegExp" : /./ // [object RegExp]
	 * //[object String]: ManagedObject#getProperty unwraps String values
	 */

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		var sTitle = "binding resolution: interface to formatter, debug = " + bDebug;

		QUnit.test(sTitle, function (assert) {
			var oModel = new JSONModel({
					"somewhere" : {
						"com.sap.vocabularies.UI.v1.HeaderInfo" : {
							"Title" : {
								"Label" : {
									"String" : "Customer"
								},
								"Value" : {
									"Path" : "CustomerName"
								}
							}
						}
					}
				}),
				that = this;

			/*
			 * Check interface.
			 *
			 * @param {object} oInterface
			 * @param {string} sExpectedPath
			 */
			function checkInterface(oInterface, sExpectedPath) {
				assert.throws(function () {
					oInterface.getInterface();
				}, /Missing path/);
				assert.throws(function () {
					oInterface.getInterface(0);
				}, /Not the root formatter of a composite binding/);
				assert.strictEqual(oInterface.getInterface("String").getPath(),
					sExpectedPath + "/String");
				assert.strictEqual(oInterface.getInterface("/absolute/path").getPath(),
					"/absolute/path");
				assert.strictEqual(
					oInterface.getInterface("/absolute").getInterface("path").getPath(),
					"/absolute/path");

				assert.strictEqual(oInterface.getModel(), oModel);
				assert.strictEqual(oInterface.getPath(), sExpectedPath);
				//TODO getPath("foo/bar")? Note: getPath("/absolute/path") does not make sense!

				assert.strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
				assert.throws(function () {
					oInterface.getSetting("bindingContexts");
				}, /Illegal argument: bindingContexts/);
				assert.throws(function () {
					oInterface.getSetting("models");
				}, /Illegal argument: models/);
			}

			/*
			 * Dummy formatter function.
			 *
			 * @param {object} oInterface
			 * @param {any} vRawValue
			 * @returns {string}
			 */
			function help(oInterface, vRawValue) {
				var sExpectedPath = vRawValue.String
						? "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label"
						: "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value";

				checkInterface(oInterface, sExpectedPath);

				return vRawValue.String || "{" + vRawValue.Path + "}";
			}
			help.requiresIContext = true;

			/*
			 * Check interface to ith part.
			 *
			 * @param {object} oInterface
			 * @param {number} i
			 */
			function checkInterfaceForPart(oInterface, i) {
				var oCreateBindingContextExpectation,
					oInterface2Part,
					oModel = oInterface.getModel(i),
					fnCreateBindingContext = oModel.createBindingContext;

				// interface to ith part
				oInterface2Part = oInterface.getInterface(i);

				// Note: methods of oInterface2Part will ignore a further index like 42
				// just like they always did except for the root formatter of a
				// composite binding
				assert.strictEqual(oInterface2Part.getModel(), oModel);
				assert.strictEqual(oInterface2Part.getModel(42), oModel);
				assert.strictEqual(oInterface2Part.getPath(), oInterface.getPath(i));
				assert.strictEqual(oInterface2Part.getPath(42), oInterface.getPath(i));

				assert.throws(function () {
					oInterface2Part.getInterface();
				}, /Missing path/);
				assert.throws(function () {
					oInterface2Part.getInterface(0);
				}, /Not the root formatter of a composite binding/);
				assert.strictEqual(oInterface2Part.getInterface(undefined, "foo/bar").getPath(),
					oInterface.getPath(i) + "/foo/bar");
				assert.strictEqual(oInterface2Part.getInterface("foo/bar").getPath(),
					oInterface.getPath(i) + "/foo/bar");
				assert.strictEqual(
					oInterface2Part.getInterface("foo").getInterface("bar").getPath(),
					oInterface.getPath(i) + "/foo/bar");
				assert.strictEqual(
					oInterface2Part.getInterface(undefined, "/absolute/path").getPath(),
					"/absolute/path");
				assert.strictEqual(oInterface2Part.getInterface("/absolute/path").getPath(),
					"/absolute/path");

				assert.strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
				assert.throws(function () {
					oInterface.getSetting("bindingContexts");
				}, /Illegal argument: bindingContexts/);
				assert.throws(function () {
					oInterface.getSetting("models");
				}, /Illegal argument: models/);

				// drill-down into ith part relatively
				oInterface2Part = oInterface.getInterface(i, "String");

				assert.strictEqual(oInterface2Part.getModel(), oModel);
				assert.strictEqual(oInterface2Part.getPath(), oInterface.getPath(i) + "/String");
				assert.strictEqual(oInterface2Part.getSetting("bindTexts"), true, "settings");

				try {
					oCreateBindingContextExpectation = that.mock(oModel)
						.expects("createBindingContext").callsFake(fnCreateBindingContext);

					// "drill-down" into ith part with absolute path
					oInterface2Part = oInterface.getInterface(i, "/absolute/path");

					assert.strictEqual(oInterface2Part.getModel(), oModel);
					assert.strictEqual(oInterface2Part.getPath(), "/absolute/path");
					assert.strictEqual(oInterface2Part.getSetting("bindTexts"), true, "settings");
				} finally {
					oCreateBindingContextExpectation.restore();
				}

				try {
					// simulate a model which creates the context asynchronously
					oCreateBindingContextExpectation = that.mock(oModel)
						.expects("createBindingContext").twice();

					oInterface2Part = oInterface.getInterface(i, "String");

					assert.ok(false, "getInterface() MUST throw error for async contexts");
				} catch (e) {
					assert.strictEqual(e.message,
						"Model could not create binding context synchronously: " + oModel);
				} finally {
					oCreateBindingContextExpectation.restore();
				}
			}

			/*
			 * Dummy formatter function for a composite binding to test access to ith part.
			 *
			 * @param {object} oInterface
			 * @param {any} [vRawValue]
			 * @returns {string}
			 */
			function formatParts(oInterface, vRawValue) {
				var i, aResult;

				/*
				 * Formats the given raw value as either label or value.
				 * @param {object} o
				 * @returns {string}
				 */
				function formatLabelOrValue(o) {
					return o.String ? "[" + o.String + "]" : "{" + o.Path + "}";
				}

				try {
					// access both getModel and getPath to test robustness
					if (oInterface.getModel() || oInterface.getPath()) {
						checkInterface(oInterface,
							"/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label");

						return formatLabelOrValue(vRawValue);
					} else {
						// root formatter for a composite binding
						aResult = [];
						assert.throws(function () {
							oInterface.getInterface();
						}, /Invalid index of part: undefined/);
						assert.throws(function () {
							oInterface.getInterface(-1);
						}, /Invalid index of part: -1/);
						assert.strictEqual(oInterface.getModel(), undefined,
							"exactly as documented");
						assert.strictEqual(oInterface.getPath(), undefined,
							"exactly as documented");

						// "probe for the smallest non-negative integer"
						// access both getModel and getPath to test robustness
						for (i = 0; oInterface.getModel(i) || oInterface.getPath(i); i += 1) {
							checkInterfaceForPart(oInterface, i);

							aResult.push(formatLabelOrValue(
								oInterface.getModel(i).getProperty(oInterface.getPath(i))
							));
						}

						assert.throws(function () {
							oInterface.getInterface(i);
						}, new RegExp("Invalid index of part: " + i));
						assert.strictEqual(oInterface.getModel(i), undefined,
							"exactly as documented");
						assert.strictEqual(oInterface.getPath(i), undefined,
							"exactly as documented");
						return aResult.join(" ");
					}
				} catch (e) {
					assert.ok(false, e.stack || e);
				}
			}
			formatParts.requiresIContext = true;

			/*
			 * Dummy formatter function to check that only <code>requiresIContext = true</code>
			 * counts.
			 *
			 * @param {any} vRawValue
			 * @returns {string}
			 */
			function other(vRawValue) {
				assert.strictEqual(arguments.length, 1);
			}
			other.requiresIContext = "ignored";

			window.foo = {
				Helper : {
					formatParts : formatParts,
					help : help,
					other : other
				}
			};

			this.checkTracing(assert, bDebug, [
				{m : "[ 0] Start processing qux"},
				{m : "[ 0] undefined = /somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"},
				{m : "[ 0] Removed attribute text", d : 1},
				{m : "[ 0] text = Customer", d : 2},
				{m : "[ 0] text = Value: {CustomerName}", d : 3},
				{m : "[ 0] text = Customer: {CustomerName}", d : 4},
				{m : "[ 0] Binding not ready for attribute text", d : 5},
				{m : "[ 0] text = [Customer] {CustomerName}", d : 6},
				{m : "[ 0] text = [Customer]", d : 7},
				{m : "[ 0] Finished processing qux"}
			], [
				mvcView(),
				'<Text text="{formatter: \'foo.Helper.other\', path: \'Title/Label\'}"/>',
				'<Text text="{formatter: \'foo.Helper.help\', path: \'Title/Label\'}"/>',
				'<Text text="Value: {formatter: \'foo.Helper.help\', path: \'Title/Value\'}"/>',
				'<Text text="{formatter: \'foo.Helper.help\', path: \'Title/Label\'}'
					+ ': {formatter: \'foo.Helper.help\', path: \'Title/Value\'}"/>',
				'<Text text="{unrelated>/some/path}"/>',
				'<Text text="{parts: [{path: \'Title/Label\'}, {path: \'Title/Value\'}],'
					+ ' formatter: \'foo.Helper.formatParts\'}"/>',
				'<Text text="{formatter: \'foo.Helper.formatParts\', path: \'Title/Label\'}"/>',
				'</mvc:View>'
			], {
				models : oModel,
				bindingContexts : oModel.createBindingContext(
						"/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"),
				bindTexts : true
			}, [
				'<Text/>',
				'<Text text="Customer"/>',
				'<Text text="Value: {CustomerName}"/>',
				'<Text text="Customer: {CustomerName}"/>',
				// Note: XML serializer outputs &gt; encoding...
				'<Text text="{unrelated&gt;/some/path}"/>',
				'<Text text="[Customer] {CustomerName}"/>',
				'<Text text="[Customer]"/>'
			]);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		QUnit.test("binding resolution, exception in formatter, debug = " + bDebug,
			function (assert) {
				window.foo = {
						Helper : {
							fail : function (oRawValue) {
								throw new Error("deliberate failure");
							}
						}
					};

				this.checkTracing(assert, bDebug, [
					{m : "[ 0] Start processing qux"},
					{m : "[ 0] Error in formatter of attribute text Error: deliberate failure",
						d : 1},
					{m : "[ 0] Error in formatter of attribute text Error: deliberate failure",
						d : 2},
					{m : "[ 0] Finished processing qux"}
				], [
					mvcView(),
					'<In text="{formatter: \'foo.Helper.fail\','
						+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label\'}"/>',
					'<In text="{formatter: \'foo.Helper.fail\','
						+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value\'}"/>',
					'</mvc:View>'
				], {
					models : new JSONModel({
						"com.sap.vocabularies.UI.v1.HeaderInfo" : {
							"Title" : {
								"Label" : {
									"String" : "Customer"
								},
								"Value" : {
									"Path" : "CustomerName"
								}
							}
						}
					})
				});
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("template:with", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:with path="/some/random/path">',
			'<template:if test="{flag}">',
			'<In id="flag"/>',
			'</template:if>',
			'</template:with>',
			'</mvc:View>'
		], {
			models : new JSONModel({
				some : {
					random : {
						path : {
							flag : true
						}
					}
				}
			})
		});
	});

	//*********************************************************************************************
	QUnit.test("template:with calls createBindingContext()", function (assert) {
		var oDataModel = new JSONModel(),
			oMetaModel = new JSONModel({
				some : {
					random : {
						path : {
							flag : true
						}
					}
				}
			});

		this.mock(oDataModel).expects("createBindingContext")
			.withExactArgs("/some/#random/path")
			.returns(oMetaModel.createBindingContext("/some/random/path"));

		this.check(assert, [
			mvcView(),
			'<template:with path="/some/#random/path" var="path">',
			'<template:if test="{path>flag}">',
			'<In id="flag"/>',
			'</template:if>',
			'</template:with>',
			'</mvc:View>'
		], {
			models : oDataModel
		});
	});
	//TODO createBindingContext should also be used w/o var

	//*********************************************************************************************
	[false, true].forEach(function (bHasHelper) {
		QUnit.test("template:with and 'named context', has helper = " + bHasHelper,
			function (assert) {
				window.foo = {
					Helper : {
						help : function () {} // empty helper must not make any difference
					}
				};
				this.check(assert, [
					mvcView(),
					'<template:with path="/some" var="some">',
					'<template:with path="some>random/path" var="path"'
						+ (bHasHelper ? ' helper="foo.Helper.help"' : '') + '>',
					'<template:if test="{path>flag}">',
					'<In id="flag"/>',
					'</template:if>',
					'</template:with>',
					'</template:with>',
					'</mvc:View>'
				], {
					models : new JSONModel({
						some : {
							random : {
								path : {
									flag : true
								}
							}
						}
					})
				});
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("template:with and 'named context', missing variable name", function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:with path="/unused" var=""/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	//*********************************************************************************************
	QUnit.test("template:with and 'named context', missing model", function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:with path="some>random/path" var="path"/>', // "some" not defined here!
			'</mvc:View>'
		], "Missing model 'some' in {0}");
	});

	//*********************************************************************************************
	QUnit.test("template:with and 'named context', missing context", function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:with path="some/random/place" var="place"/>',
			'</mvc:View>'
		], "Cannot resolve path for {0}", {
			models : new JSONModel()
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWithVar) {
		QUnit.test("template:with and helper, with var = " + bWithVar, function (assert) {
			var oModel = new JSONModel({
					target : {
						flag : true
					}
				});

			window.foo = {
				Helper : {
					help : function (oContext) {
						assert.ok(oContext instanceof Context);
						assert.strictEqual(oContext.getModel(), oModel);
						assert.strictEqual(oContext.getPath(), "/some/random/path");
						return "/target";
					}
				}
			};
			this.check(assert, [
				mvcView(),
				'<template:with path="/some/random/path" helper="foo.Helper.help"'
					+ (bWithVar ? ' var="target"' : '') + '>',
				'<template:if test="{' + (bWithVar ? 'target>' : '') + 'flag}">',
				'<In id="flag"/>',
				'</template:if>',
				'</template:with>',
				'</mvc:View>'
			], {
				models : oModel
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWithVar) {
		QUnit.test("template:with and helper changing the model, with var = " + bWithVar,
			function (assert) {
				var oMetaModel = new JSONModel({
						target : {
							flag : true
						}
					}),
					oModel = new JSONModel();

				window.foo = {
					Helper : {
						help : function (oContext) {
							assert.ok(oContext instanceof Context);
							assert.strictEqual(oContext.getModel(), oModel);
							assert.strictEqual(oContext.getPath(), "/some/random/path");
							return oMetaModel.createBindingContext("/target");
						}
					}
				};
				this.check(assert, [
					mvcView(),
					'<template:with path="/some/random/path" helper="foo.Helper.help"'
						+ (bWithVar ? ' var="target"' : '') + '>',
					'<template:if test="{' + (bWithVar ? 'target>' : '') + 'flag}">',
					'<In id="flag"/>',
					'</template:if>',
					'</template:with>',
					'</mvc:View>'
				], {
					models : {
						meta : oMetaModel,
						"undefined" : oModel
					}
				});
			}
		);
	});

	//*********************************************************************************************
	[undefined, {}].forEach(function (fnHelper) {
		QUnit.test("template:with and helper = " + fnHelper, function (assert) {
			window.foo = fnHelper;
			this.checkError(assert, [
				mvcView(),
				'<template:with path="/unused" var="target" helper="foo"/>',
				'</mvc:View>'
			], "Cannot resolve helper for {0}", {
				models : new JSONModel()
			});
		});
	});

	//*********************************************************************************************
	QUnit.test('<template:with helper=".">', function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:with path="/unused" var="target" helper="."/>',
			'</mvc:View>'
		], "Cannot resolve helper for {0}", {
			models : new JSONModel()
		});
	});

	//*********************************************************************************************
	[true, ""].forEach(function (vResult) {
		QUnit.test("template:with and helper returning " + vResult, function (assert) {
			window.foo = function () {
				return vResult;
			};
			this.checkError(assert, [
				mvcView(),
				'<template:with path="/unused" var="target" helper="foo"/>',
				'</mvc:View>'
			], "Illegal helper result '" + vResult + "' in {0}", {
				models : new JSONModel()
			});
		});
	});

	//*********************************************************************************************
	QUnit.test('template:with repeated w/ same variable and value', function (assert) {
		var oModel = new JSONModel(),
			sTemplate1 = '<template:with path="bar>/my/path" var="bar"/>',
			sTemplate2 = '<template:with path="bar>bla" helper="foo"/>',
			sTemplate3 = '<template:with path="bar>/my/path"/>';

		window.foo = function () {
			return "/my/path";
		};

		warn(this.oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate1);
		warn(this.oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate2);
		warn(this.oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate3);

		this.check(assert, [
			mvcView(),
			sTemplate1,
			sTemplate2,
			sTemplate3,
			'</mvc:View>'
		], {
			models : {bar : oModel},
			bindingContexts : {
				bar : oModel.createBindingContext("/my/path")
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("template:repeat w/o named models", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:repeat list="{/items}">',
			'<In src="{src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : new JSONModel({
				items : [{
					src : "A"
				}, {
					src : "B"
				}, {
					src : "C"
				}]
			})
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat, startIndex & length", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:repeat list="' + "{path:'/items',startIndex:1,length:2}" + '">',
			'<In src="{src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : new JSONModel({
				items : [{
					src : "A"
				}, {
					src : "B"
				}, {
					src : "C"
				}, {
					src : "D"
				}]
			})
		}, [
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat with named models", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:repeat list="{modelName>/items}">',
			'<In src="{modelName>src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : {
				modelName : new JSONModel({
					items : [{
						src : "A"
					}, {
						src : "B"
					}, {
						src : "C"
					}]
				})
			}
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test('template:repeat w/o list', function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:repeat/>',
			'</mvc:View>'
		], "Missing binding for {0}");
	});

	//*********************************************************************************************
	QUnit.test('template:repeat list="no binding"', function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:repeat list="no binding"/>',
			'</mvc:View>'
		], "Missing binding for {0}");
	});

	//*********************************************************************************************
	QUnit.test('template:repeat list="{unknown>foo}"', function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:repeat list="{unknown>foo}"/>',
			'</mvc:View>'
		], "Missing model 'unknown' in {0}");
	});

	//*********************************************************************************************
	QUnit.test('template:repeat list="{/unsupported/path}"', function (assert) {
		//TODO is this the expected behavior? the loop has no iterations and that's it?
		// Note: the same happens with a relative path if there is no binding context for the model
		this.check(assert, [
			mvcView(),
			'<template:repeat list="{/unsupported/path}"/>',
			'</mvc:View>'
		], {
			models : new JSONModel()
		});
	});

	//*********************************************************************************************
	QUnit.test("template:repeat w/ complex binding and model", function (assert) {
		this.check(assert, [
			mvcView(),
			// Note: foo: 'bar' just serves as placeholder for any parameter (complex syntax)
			'<template:repeat list="{foo: \'bar\', path:\'modelName>/items\'}">',
			'<In src="{modelName>src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : {
				modelName : new JSONModel({
					items : [{
						src : "A"
					}, {
						src : "B"
					}, {
						src : "C"
					}]
				})
			}
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat nested", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:repeat list="{customer>/orders}">',
			'<In src="{customer>id}"/>',
			'<template:repeat list="{customer>items}">',
			'<In src="{customer>no}"/>',
			'</template:repeat>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : {
				customer : new JSONModel({
					orders : [{
						id : "A",
						items : [{
							no : "A1"
						}, {
							no : "A2"
						}]
					}, {
						id : "B",
						items : [{
							no : "B1"
						}, {
							no : "B2"
						}]
					}]
				})
			}
		}, [
			'<In src="A"/>',
			'<In src="A1"/>',
			'<In src="A2"/>',
			'<In src="B"/>',
			'<In src="B1"/>',
			'<In src="B2"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat with loop variable", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:repeat list="{modelName>/items}" var="item">',
			'<In src="{item>src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : {
				modelName : new JSONModel({
					items : [{
						src : "A"
					}, {
						src : "B"
					}, {
						src : "C"
					}]
				})
			}
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat with missing loop variable", function (assert) {
		this.checkError(assert, [
			mvcView(),
			'<template:repeat var="" list="{/unused}"/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	[false, true].forEach(function (bAsync) {
		[false, true].forEach(function (bDebug) {
			//**************************************************************************************
			QUnit.test("fragment support incl. template:require, async = " + bAsync
					+ ", debug = " + bDebug, function (assert) {
				var sModuleName = "sap.ui.core.sample.ViewTemplate.scenario.Helper",
					sInElement = '<In xmlns="sap.ui.core" xmlns:template='
						+ '"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"'
						+ ' template:require="' + sModuleName + '"/>';

				this.mock(jQuery.sap).expects("require").on(jQuery.sap).withExactArgs(sModuleName);
				this.expectLoad(bAsync, "myFragment", xml(assert, [sInElement]));
				this.expectLoad(bAsync, "yetAnotherFragment",
					xml(assert, ['<In xmlns="sap.ui.core"/>']));
				return this.checkTracing(assert, bDebug, [
						{m : "[ 0] Start processing qux"},
						{m : "[ 1] fragmentName = myFragment", d : 1},
						{m : "[ 1] Finished", d : "</Fragment>"},
						{m : "[ 1] fragmentName = yetAnotherFragment", d : 4},
						{m : "[ 1] Finished", d : "</Fragment>"},
						{m : "[ 0] Finished processing qux"}
					], [
						mvcView(),
						'<Fragment fragmentName="myFragment" type="XML">',
						'<template:error />', // this must not be processed!
						'</Fragment>',
						'<Fragment fragmentName="yetAnotherFragment" type="XML"/>',
						'</mvc:View>'
					], {}, [
						sInElement,
						'<In/>'
					], bAsync);
			});

			//**************************************************************************************
			QUnit.test("fragment with FragmentDefinition incl. template:require, async = " + bAsync
					+ ", debug = " + bDebug, function (assert) {
				var oExpectation = this.mock(jQuery.sap).expects("require"),
					aModuleNames = [
						"foo.Helper",
						"sap.ui.core.sample.ViewTemplate.scenario.Helper",
						"sap.ui.model.odata.AnnotationHelper"
					],
					aFragmentContent = [
						'<FragmentDefinition xmlns="sap.ui.core" xmlns:template='
							+ '"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"'
							+ ' template:require="' + aModuleNames.join(" ") + '">',
						'<In id="first"/>',
						'<Fragment fragmentName="innerFragment" type="XML"/>',
						'<In id="last"/>',
						'</FragmentDefinition>'
					];

				// Note: jQuery.sap.require() supports "varargs" style
				oExpectation.on(jQuery.sap).withExactArgs.apply(oExpectation, aModuleNames);

				this.expectLoad(bAsync, "myFragment", xml(assert, aFragmentContent));
				this.expectLoad(bAsync, "innerFragment",
					xml(assert, ['<In xmlns="sap.ui.core" id="inner"/>']));
				this.expectLoad(bAsync, "yetAnotherFragment",
					xml(assert, ['<In xmlns="sap.ui.core" id="yetAnother"/>']));
				return this.checkTracing(assert, bDebug, [
						{m : "[ 0] Start processing qux"},
						{m : "[ 1] fragmentName = myFragment", d : 1},
						{m : "[ 2] fragmentName = innerFragment", d : aFragmentContent[2]},
						{m : "[ 2] Finished", d : "</Fragment>"},
						{m : "[ 1] Finished", d : "</Fragment>"},
						{m : "[ 1] fragmentName = yetAnotherFragment", d : 2},
						{m : "[ 1] Finished", d : "</Fragment>"},
						{m : "[ 0] Finished processing qux"}
					], [
						mvcView(),
						'<Fragment fragmentName="myFragment" type="XML"/>',
						'<Fragment fragmentName="yetAnotherFragment" type="XML"/>',
						'</mvc:View>'
					], {}, [
						'<In id="first"/>',
						'<In id="inner"/>',
						'<In id="last"/>',
						'<In id="yetAnother"/>'
					], bAsync);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("dynamic fragment names", function (assert) {
		this.expectLoad(false, "dynamicFragmentName", xml(assert, ['<In xmlns="sap.ui.core"/>']));
		this.check(assert, [
				mvcView(),
				'<Fragment fragmentName="{= \'dynamicFragmentName\' }" type="XML"/>',
				'</mvc:View>'
			], {}, [
				'<In />'
			]);
	});

	//*********************************************************************************************
	QUnit.test("async dynamic fragment names", function (assert) {
		this.expectLoad(true, "world", xml(assert, ['<In xmlns="sap.ui.core"/>']));

		return this.checkTracing(assert, true, [
				{m : "[ 0] Start processing qux"},
				{m : "[ 1] fragmentName = world", d : 1},
				{m : "[ 1] Finished", d : "</Fragment>"},
				{m : "[ 0] Finished processing qux"}
			], [
				mvcView(),
				'<Fragment fragmentName="{async>/hello}" type="XML"/>',
				'</mvc:View>'
			], {
				models : {
					async : asyncModel({
						hello : "world"
					})
				}
			}, [
				'<In />'
			], true);
	});

	//*********************************************************************************************
	QUnit.test("fragment in repeat", function (assert) {
		// BEWARE: use fresh XML document for each call because liftChildNodes() makes it empty!
		// load template is called only once, because it is cached
		this.expectLoad(false, "myFragment",
			xml(assert, ['<In xmlns="sap.ui.core" src="{src}" />']));

		this.check(assert, [
			mvcView(),
			'<template:repeat list="{/items}">',
			'<Fragment fragmentName="myFragment" type="XML"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models : new JSONModel({
				items : [{
					src : "A"
				}, {
					src : "B"
				}, {
					src : "C"
				}]
			})
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("fragment with type != XML", function (assert) {
		this.check(assert, [
				mvcView(),
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>',
				'</mvc:View>'
			], {}, [
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>'
			]);
	});

	//*********************************************************************************************
	QUnit.test("error on fragment with simple cyclic reference", function (assert) {
		this.expectLoad(false, "cycle",
			xml(assert, ['<Fragment xmlns="sap.ui.core" fragmentName="cycle" type="XML"/>']));
		this.checkError(assert, [
				mvcView(),
				'<Fragment fragmentName="cycle" type="XML"/>',
				'</mvc:View>'
			], "Cyclic reference to fragment 'cycle' {0}");
	});

	//*********************************************************************************************
	QUnit.test("error on fragment with ping pong cyclic reference", function (assert) {
		var aFragmentContent = [
				'<FragmentDefinition xmlns="sap.ui.core" xmlns:template'
					+ '="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">',
				'<template:with path="/foo" var="bar">',
				'<template:with path="/bar" var="foo">',
				'<Fragment xmlns="sap.ui.core" fragmentName="B" type="XML"/>',
				'</template:with>',
				'</template:with>',
				'</FragmentDefinition>'
			];

		warn(this.oLogMock, "[ 6] Set unchanged path: /foo", aFragmentContent[1]);
		warn(this.oLogMock, "[ 7] Set unchanged path: /bar", aFragmentContent[2]);

		this.expectLoad(false, "A", xml(assert, aFragmentContent));
		this.expectLoad(false, "B",
			xml(assert, ['<Fragment xmlns="sap.ui.core" fragmentName="A" type="XML"/>']));

		this.checkError(assert, [
				mvcView(),
				'<Fragment fragmentName="A" type="XML"/>',
				'</mvc:View>'
			], "Cyclic reference to fragment 'B' {0}", {
				models : new JSONModel()
			}, aFragmentContent[3]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		QUnit.test("tracing, debug=" + bDebug, function (assert) {
			var oBarModel = new JSONModel({
					"com.sap.vocabularies.UI.v1.HeaderInfo" : {
						"Title" : {
							"Label" : {
								"String" : "Customer"
							},
							"Value" : {
								"Path" : "CustomerName"
							}
						}
					},
					"com.sap.vocabularies.UI.v1.Identification" : [{
						Value : { Path : "A"}
					}, {
						Value : { Path : "B"}
					}, {
						Value : { Path : "C"}
					}]
				}),
				oBazModel = new JSONModel({}),
				aViewContent = [
					mvcView("t"),
					'<t:with path="bar>Label" var="foo">',
					'<t:if test="false">',
					'<t:then>',
					'<Out />',
					'</t:then>',
					'<t:elseif test="{bar>Label}">',
					'<In />',
					'<Fragment fragmentName="myFragment" type="XML"/>',
					'</t:elseif>',
					'</t:if>',
					'</t:with>',
					'<t:repeat list="{bar>/com.sap.vocabularies.UI.v1.Identification}" var="foo">',
					'<In src="{foo>Value/Path}"/>',
					'</t:repeat>',
					'<t:if test="{bar>/com.sap.vocabularies.UI.v1.Identification}"/>',
					'<t:if test="{bar>/qux}"/>',
					'<ExtensionPoint name="staticName"/>',
					'<ExtensionPoint name="{:= \'dynamicName\' }"/>',
					'<ExtensionPoint name="{foo>/some/path}"/>',
					'</mvc:View>'
				];

			if (!bDebug) {
				warn(this.oLogMock, "Warning(s) during processing of qux", null);
			}
			warn(this.oLogMock, '[ 0] Binding not ready', aViewContent[19]);
			this.expectLoad(false, "myFragment", xml(assert, [
				'<FragmentDefinition xmlns="sap.ui.core">',
				'<In src="fragment"/>',
				'</FragmentDefinition>'
			]));
			// debug output for dynamic names must still appear!
			delete sap.ui.core.CustomizingConfiguration;

			this.checkTracing(assert, bDebug, [
				{m : "[ 0] Start processing qux"},
				{m : "[ 0] bar = /com.sap.vocabularies.UI.v1.HeaderInfo/Title"},
				{m : "[ 0] baz = /"},
				{m : "[ 1] foo = /com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label", d : 1},
				{m : "[ 2] test == \"false\" --> false", d : 2},
				{m : "[ 2] test == [object Object] --> true", d : 6},
				{m : "[ 3] fragmentName = myFragment", d : 8},
				{m : "[ 3] Finished", d : "</Fragment>"},
				{m : "[ 2] Finished", d : 10},
				{m : "[ 1] Finished", d : 11},
				{m : "[ 1] Starting", d : 12},
				{m : "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/0", d : 12},
				{m : "[ 1] src = A", d : 13},
				{m : "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/1", d : 12},
				{m : "[ 1] src = B", d : 13},
				{m : "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/2", d : 12},
				{m : "[ 1] src = C", d : 13},
				{m : "[ 1] Finished", d : 14},
				{m : "[ 1] test == [object Array] --> true", d : 15},
				{m : "[ 1] Finished", d : "</t:if>"},
				{m : "[ 1] test == undefined --> false", d : 16},
				{m : "[ 1] Finished", d : "</t:if>"},
				{m : "[ 0] name = dynamicName", d : 18},
				{m : "[ 0] Binding not ready for attribute name", d : 19},
				{m : "[ 0] Finished processing qux"}
			], aViewContent, {
				models : { bar : oBarModel, baz : oBazModel },
				bindingContexts : {
					bar : oBarModel.createBindingContext(
							"/com.sap.vocabularies.UI.v1.HeaderInfo/Title"),
					baz : oBazModel.createBindingContext("/")
				}
			}, [
				'<In />',
				'<In src="fragment"/>',
				'<In src="A"/>',
				'<In src="B"/>',
				'<In src="C"/>',
				'<ExtensionPoint name="staticName"/>',
				'<ExtensionPoint name="{:= \'dynamicName\' }"/>',
				// Note: XML serializer outputs &gt; encoding...
				'<ExtensionPoint name="{foo&gt;/some/path}"/>'
			]);
		});
	});

	//*********************************************************************************************
	[
		sap.ui.core.CustomizingConfiguration, // symbolic value, see below!
		undefined,
		{className : "sap.ui.core.Fragment", type : "JSON"},
		{className : "sap.ui.core.mvc.View", type : "XML"}
	].forEach(function (oViewExtension) {
		QUnit.test("<ExtensionPoint>: no (supported) configuration", function (assert) {
			if (oViewExtension === sap.ui.core.CustomizingConfiguration) {
				delete sap.ui.core.CustomizingConfiguration;
			} else {
				this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
					.withExactArgs("this.sViewName", "myExtensionPoint", "this._sOwnerId")
					.returns(oViewExtension);
			}

			this.check(assert, [
					mvcView(),
					'<ExtensionPoint name="myExtensionPoint">',
					'<template:if test="true">', // checks that content is processed
					'<In />',
					'</template:if>',
					'</ExtensionPoint>',
					'</mvc:View>'
				], {}, [
					'<ExtensionPoint name="myExtensionPoint">',
					'<In />',
					'</ExtensionPoint>'
				]);
		});
	});

	//*********************************************************************************************
	["outerExtensionPoint", "{:= 'outerExtensionPoint' }"].forEach(function (sName) {
		QUnit.test("<ExtensionPoint name='" + sName + "'>: XML fragment configured",
			function (assert) {
				var oCustomizingConfigurationMock = this.mock(sap.ui.core.CustomizingConfiguration),
					aOuterReplacement = [
						'<template:if test="true" xmlns="sap.ui.core" xmlns:template='
							+ '"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"'
							+ ' template:require="foo.Helper bar.Helper">',
						'<ExtensionPoint name="outerReplacement"/>',
						'</template:if>'
					];

				// <ExtensionPoint name="outerExtensionPoint">
				oCustomizingConfigurationMock.expects("getViewExtension")
					.withExactArgs("this.sViewName", "outerExtensionPoint", "this._sOwnerId")
					.returns({
						className : "sap.ui.core.Fragment",
						fragmentName : "acme.OuterReplacement",
						type : "XML"
					});
				this.expectLoad(false, "acme.OuterReplacement", xml(assert, aOuterReplacement));
				// Note: mock result of loadTemplate() is not analyzed by check() method, of course
				warn(this.oLogMock, '[ 2] Constant test condition', aOuterReplacement[0]);
				this.mock(jQuery.sap).expects("require").on(jQuery.sap)
					.withExactArgs("foo.Helper", "bar.Helper");

				// <ExtensionPoint name="outerReplacement">
				// --> nothing configured, just check that it is processed
				oCustomizingConfigurationMock.expects("getViewExtension")
					.withExactArgs("acme.OuterReplacement", "outerReplacement", "this._sOwnerId");

				// <Fragment fragmentName="myFragment" type="XML"/>
				this.expectLoad(false, "myFragment", xml(assert, [
					'<ExtensionPoint name="innerExtensionPoint" xmlns="sap.ui.core"/>'
				]));

				// <ExtensionPoint name="innerExtensionPoint"/>
				// --> fragment name is used here!
				oCustomizingConfigurationMock.expects("getViewExtension")
					.withExactArgs("myFragment", "innerExtensionPoint", "this._sOwnerId")
					.returns({
						className : "sap.ui.core.Fragment",
						fragmentName : "acme.InnerReplacement",
						type : "XML"
					});
				this.expectLoad(false, "acme.InnerReplacement", xml(assert, [
					'<ExtensionPoint name="innerReplacement" xmlns="sap.ui.core"/>'
				]));

				// <ExtensionPoint name="innerReplacement">
				// --> nothing configured, just check that it is processed
				oCustomizingConfigurationMock.expects("getViewExtension")
					.withExactArgs("acme.InnerReplacement", "innerReplacement", "this._sOwnerId");

				// <ExtensionPoint name="lastExtensionPoint">
				// --> nothing configured, just check that view name is used again
				oCustomizingConfigurationMock.expects("getViewExtension")
					.withExactArgs("this.sViewName", "lastExtensionPoint", "this._sOwnerId");

				this.check(assert, [
						mvcView(),
						'<ExtensionPoint name="' + sName + '">',
						'<template:error />', // this must not be processed!
						'</ExtensionPoint>',
						'<Fragment fragmentName="myFragment" type="XML"/>',
						'<ExtensionPoint name="lastExtensionPoint"/>',
						'</mvc:View>'
					], {}, [
						'<ExtensionPoint name="outerReplacement"/>',
						'<ExtensionPoint name="innerReplacement"/>',
						'<ExtensionPoint name="lastExtensionPoint"/>'
					]);
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("template:require - single module", function (assert) {
		var sModuleName = "sap.ui.core.sample.ViewTemplate.scenario.Helper",
			oRootElement = xml(assert, [
				mvcView().replace(">", ' template:require="' + sModuleName + '">'),
				'</mvc:View>'
			]);

		this.mock(jQuery.sap).expects("require").on(jQuery.sap).withExactArgs(sModuleName);

		process(oRootElement);
	});

	//*********************************************************************************************
	QUnit.test("template:require - multiple modules", function (assert) {
		var oExpectation = this.mock(jQuery.sap).expects("require"),
			aModuleNames = [
				"foo.Helper",
				"sap.ui.core.sample.ViewTemplate.scenario.Helper",
				"sap.ui.model.odata.AnnotationHelper"
			],
			oRootElement = xml(assert, [
				mvcView().replace(">", ' template:require="' + aModuleNames.join(" ") + '">'),
				'</mvc:View>'
			]);

		// Note: jQuery.sap.require() supports "varargs" style
		oExpectation.on(jQuery.sap).withExactArgs.apply(oExpectation, aModuleNames);

		process(oRootElement);
	});

	//*********************************************************************************************
	QUnit.test("template:alias", function (assert) {
		var fnComplexParser = BindingParser.complexParser,
			fnGetObject = jQuery.sap.getObject,
			jQuerySapMock = this.mock(jQuery.sap);

		window.foo = {
			Helper : {
				bar : function () {
					assert.ok(!this || !("bar" in this), "no jQuery.proxy(..., oScope) used");
					// return absolute path so this function serves as helper & formatter!
					return "/bar";
				},
				checkScope : function () {
					// Note: this makes sure that the current scope of aliases is passed as binding
					// parameter for v4.ODataMetaModel's computed annotations
					assert.deepEqual(this.getBindingInfo("any").parameters, {
						foo : "bar",
						scope : {
							"bar" : window.foo.Helper.bar,
							"foo" : window.foo.Helper.bar // see "redefine existing alias" below
						}
					}, "scope available in binding info");
				},
				foo : function () {
					assert.ok(!this || !("foo" in this), "no jQuery.proxy(..., oScope) used");
					return "/foo";
				}
			}
		};

		// make sure we do not create namespaces!
		jQuerySapMock.expects("getObject").atLeast(1).withExactArgs(sinon.match.string)
			.callsFake(fnGetObject);
		jQuerySapMock.expects("getObject").atLeast(1)
			.withExactArgs(sinon.match.string, /*iNoCreates*/undefined, sinon.match.object)
			.callsFake(fnGetObject);
		this.mock(BindingParser).expects("complexParser").atLeast(1)
			.withExactArgs(sinon.match.string, sinon.match.object, sinon.match.bool,
				/*bTolerateFunctionsNotFound*/true, /*bStaticContext*/true)
			.callsFake(fnComplexParser);

		// Note: <Label text="..."> remains unresolved, <Text text="..."> MUST be resolved
		this.check(assert, [
			mvcView(),
			"<Label text=\"{formatter: '.bar', path: '/'}\"/>",
			"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
			'<template:alias name=".bar" value="foo.Helper.bar">',
				"<Text text=\"{formatter: '.bar', path: '/'}\"/>",
				"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
				'<template:alias name=".foo" value="foo.Helper.foo">',
					"<Text text=\"{formatter: '.foo', path: '/'}\"/>",
					// redefine existing alias
					'<template:alias name=".foo" value="foo.Helper.bar">',
						"<Text text=\"{formatter: '.foo', path: '/'}\"/>",
						"<Text text=\"{formatter: 'foo.Helper.checkScope', path: '/',"
							+ " parameters: {foo: 'bar'}}\"/>",
					'</template:alias>',
					// old value must be used again
					"<Text text=\"{formatter: '.foo', path: '/'}\"/>",
				'</template:alias>',
				// <template:repeat> uses scope
				"<template:repeat list=\"{path: '/', factory: '.bar'}\"/>",
				// <template:with> uses scope
				'<template:with path="/" helper=".bar"/>',
			'</template:alias>',
			// aliases go out of scope
			"<Label text=\"{formatter: '.bar', path: '/'}\"/>",
			"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
			// relative aliases
			'<template:alias name=".H" value="foo.Helper">',
				"<Text text=\"{formatter: '.H.foo', path: '/'}\"/>",
				'<template:alias name=".bar" value=".H.bar">',
					"<Text text=\"{formatter: '.bar', path: '/'}\"/>",
				'</template:alias>',
			'</template:alias>',
			'</mvc:View>'
		], {
			models : new JSONModel({/*don't care*/})
		}, [
			"<Label text=\"{formatter: '.bar', path: '/'}\"/>",
			"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
				'<Text text="/bar"/>',
				"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
					'<Text text="/foo"/>',
						'<Text text="/bar"/>',
						'<Text/>', // checkScope() returns undefined
					'<Text text="/foo"/>',
			"<Label text=\"{formatter: '.bar', path: '/'}\"/>",
			"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
				'<Text text="/foo"/>',
					'<Text text="/bar"/>'
		]);
	});

	//*********************************************************************************************
	[
		'<template:alias/>',
		'<template:alias name="foo"/>',
		'<template:alias name="."/>',
		'<template:alias name=".foo.bar"/>'
	].forEach(function (sViewContent) {
		QUnit.test(sViewContent, function (assert) {
			this.checkError(assert, [
				mvcView(),
				sViewContent,
				'</mvc:View>'
			], "Missing proper relative name in {0}");
		});
	});

	//*********************************************************************************************
	[
		'',
		'value=""',
		'value="."',
		'value=".notFound"'
	].forEach(function (sValue) {
		QUnit.test('<template:alias name=".foo" ' + sValue + '>', function (assert) {
			this.checkError(assert, [
				mvcView(),
				'<template:alias name=".foo" ' + sValue + '/>',
				'</mvc:View>'
			], "Invalid value in {0}");
		});
	});

	//*********************************************************************************************
	QUnit.test("Test console log for two digit nesting level", function (assert) {
		this.check(assert, [
			mvcView(),
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<template:if test="true">',
			'<In id="true"/>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("Performance measurement points", function (assert) {
		var aContent = [
				mvcView(),
				'<Fragment fragmentName="myFragment" type="XML"/>',
				'<Text text="{CustomerName}"/>',
				'</mvc:View>'
			],
			oAverageSpy = this.spy(jQuery.sap.measure, "average"),
			oEndSpy = this.spy(jQuery.sap.measure, "end")
				.withArgs("sap.ui.core.util.XMLPreprocessor.process"),
			oCountSpy = oAverageSpy.withArgs("sap.ui.core.util.XMLPreprocessor.process", "",
				["sap.ui.core.util.XMLPreprocessor"]),
			oCountEndSpy = oEndSpy.withArgs("sap.ui.core.util.XMLPreprocessor.process"),
			oInsertSpy = oAverageSpy.withArgs("sap.ui.core.util.XMLPreprocessor/insertFragment",
				"", ["sap.ui.core.util.XMLPreprocessor"]),
			oInsertEndSpy = oEndSpy.withArgs("sap.ui.core.util.XMLPreprocessor/insertFragment"),
			oResolvedSpy = oAverageSpy.withArgs(
				"sap.ui.core.util.XMLPreprocessor/getResolvedBinding",
				"", ["sap.ui.core.util.XMLPreprocessor"]),
			oResolvedEndSpy = oEndSpy.withArgs(
				"sap.ui.core.util.XMLPreprocessor/getResolvedBinding");

		this.expectLoad(false, "myFragment", xml(assert, ['<In xmlns="sap.ui.core"/>']));

		process(xml(assert, aContent));
		assert.strictEqual(oCountSpy.callCount, 1, "process");
		assert.strictEqual(oInsertSpy.callCount, 1, "insertFragment");
		assert.strictEqual(oResolvedSpy.callCount, 6, "getResolvedBinding");
		assert.strictEqual(oCountEndSpy.callCount, 1, "process end");
		assert.strictEqual(oInsertEndSpy.callCount, 1, "insertFragment end");
		assert.strictEqual(oResolvedEndSpy.callCount, 6, "getResolvedBinding end");
	});

	//*********************************************************************************************
	QUnit.test("Performance measurement end point for incomplete bindings", function (assert) {
		var aContent = [
				mvcView(),
				'<Text text="{unrelated>/some/path}"/>',
				'</mvc:View>'
			],
			oAverageSpy = this.spy(jQuery.sap.measure, "average"),
			oEndSpy = this.spy(jQuery.sap.measure, "end")
				.withArgs("sap.ui.core.util.XMLPreprocessor.process"),
			oResolvedSpy = oAverageSpy.withArgs(
				"sap.ui.core.util.XMLPreprocessor/getResolvedBinding",
				"", ["sap.ui.core.util.XMLPreprocessor"]),
			oResolvedEndSpy = oEndSpy.withArgs(
				"sap.ui.core.util.XMLPreprocessor/getResolvedBinding");

		process(xml(assert, aContent));
		assert.strictEqual(oResolvedSpy.callCount, 4, "getResolvedBinding");
		assert.strictEqual(oResolvedEndSpy.callCount, 4, "getResolvedBinding end");
	});

	//*********************************************************************************************
	QUnit.test("plugIn returns old visitor", function (assert) {
		var fnElementVisitor = function element() {},
			fnNamespaceVisitor = function namespace() {};

		try {
			assert.strictEqual(XMLPreprocessor.plugIn(fnNamespaceVisitor, "foo"),
				XMLPreprocessor.visitNodeWrapper);
		} finally {
			assert.strictEqual(XMLPreprocessor.plugIn(null, "foo"), fnNamespaceVisitor);
		}

		try {
			assert.strictEqual(XMLPreprocessor.plugIn(fnElementVisitor, "foo", "Bar"),
				XMLPreprocessor.visitNodeWrapper);
		} finally {
			assert.strictEqual(XMLPreprocessor.plugIn(null, "foo", "Bar"), fnElementVisitor);
		}

		// namespace visitor is old visitor for all its local names!
		try {
			assert.strictEqual(XMLPreprocessor.plugIn(fnNamespaceVisitor, "foo"),
				XMLPreprocessor.visitNodeWrapper);
			assert.strictEqual(XMLPreprocessor.plugIn(fnElementVisitor, "foo", "Bar"),
				fnNamespaceVisitor);
		} finally {
			assert.strictEqual(XMLPreprocessor.plugIn(null, "foo", "Bar"), fnElementVisitor);
			assert.strictEqual(XMLPreprocessor.plugIn(null, "foo"), fnNamespaceVisitor);
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, debug tracing", function (assert) {
		var fnVisitor = function () {};

		this.oLogMock.expects("debug")
			.withExactArgs("Plug-in visitor for namespace 'foo', local name 'Bar'", fnVisitor,
				sComponent);

		XMLPreprocessor.plugIn(fnVisitor, "foo", "Bar");
	});

	//*********************************************************************************************
	[{
		aContent : [
			mvcView(),
			'<f:Bar xmlns:f="foo"'
				+ ' attribute="{path: \'/\', formatter: \'foo.Helper.forbidden\'}"/>',
			'<f:Baz xmlns:f="foo"/>', // must not trigger visitor!
			'</mvc:View>'
		],
		sLocalName : "Bar"
	}, {
		aContent : [
			mvcView(),
			'<f:Bar xmlns:f="foo"/>',
			'</mvc:View>'
		],
		sLocalName : undefined
	}].forEach(function (oFixture) {
		QUnit.test("plugIn, sLocalName: " + oFixture.sLocalName, function (assert) {
			var fnVisitor = this.spy(),
				oXml = xml(assert, oFixture.aContent); // <mvc:View>

			window.foo = {
				Helper: {
					forbidden : function (oRawValue) {
						assert.ok(false, "formatter MUST not be called!");
					}
				}
			};

			try {
				XMLPreprocessor.plugIn(fnVisitor, "foo", oFixture.sLocalName);
				// must not override other visitors
				XMLPreprocessor.plugIn(fnVisitor, "foo", "Invalid");

				process(oXml, {models : new JSONModel()});
			} finally {
				// remove old visitors
				// Q: should we delete from mVisitors? A: No, we cannot observe it anyway...
				XMLPreprocessor.plugIn(null, "foo", oFixture.sLocalName);
				XMLPreprocessor.plugIn(null, "foo", "Invalid");
			}

			assert.strictEqual(fnVisitor.callCount, 1);
			assert.ok(fnVisitor.alwaysCalledWithExactly(
				oXml.firstChild,
				{
					getContext : sinon.match.func,
					getResult : sinon.match.func,
					getSettings : sinon.match.func,
					getViewInfo : sinon.match.func,
					insertFragment : sinon.match.func,
					visitAttribute : sinon.match.func,
					visitAttributes : sinon.match.func,
					visitChildNodes : sinon.match.func,
					visitNode : sinon.match.func,
					"with" : sinon.match.func
				})); // does not work in IE: fnVisitor.printf("%C")
		});
	});

	//*********************************************************************************************
	[undefined, "0", true, {}, XMLPreprocessor.visitNodeWrapper].forEach(function (fnVisitor) {
		QUnit.test("plugIn, fnVisitor: " + fnVisitor, function (assert) {
			this.oLogMock.expects("debug").never();

			assert.throws(function () {
				XMLPreprocessor.plugIn(fnVisitor, "foo");
			}, new Error("Invalid visitor: " + fnVisitor));
		});
	});

	//*********************************************************************************************
	[
		undefined,
		"foo bar",
		"sap.ui.core",
		"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
	].forEach(function (sNamespace) {
		QUnit.test("plugIn, sNamespace: " + sNamespace, function (assert) {
			this.oLogMock.expects("debug").never();

			assert.throws(function () {
				XMLPreprocessor.plugIn(function () {}, sNamespace);
			}, new Error("Invalid namespace: " + sNamespace));
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		QUnit.test("plugIn, debug tracing for visitor calls: " + bDebug, function (assert) {
			var aExpectedMessages = [
					{m : "[ 0] Start processing qux"},
					{m : "[ 1] Calling visitor", d : 1},
					{m : "I am your visitor!"},
					{m : "[ 1] Finished", d : '</f:Bar>'}, // Note: logs the closing tag!
					{m : "[ 0] Finished processing qux"}
				],
				aViewContent = [
					mvcView(),
					'<f:Bar xmlns:f="foo"/>',
					'</mvc:View>'
				];

			try {
				XMLPreprocessor.plugIn(function () {
					if (bDebug) {
						jQuery.sap.log.debug("I am your visitor!", undefined, sComponent);
					}
				}, "foo", "Bar");

				this.checkTracing(assert, bDebug, aExpectedMessages, aViewContent, {},
					[aViewContent[1]]);
			} finally {
				this.oLogMock.expects("debug")
					.withExactArgs("Plug-in visitor for namespace 'foo', local name 'Bar'", null,
						sComponent);
				XMLPreprocessor.plugIn(null, "foo", "Bar");
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("plugIn, getResult", function (assert) {
		var aViewContent = [
				mvcView(),
				'<f:Bar xmlns:f="foo" test="{/answer}" value="\\{\\}"/>',
				'</mvc:View>'
			],
			that = this;

		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				assert.strictEqual(oInterface.getResult(oElement.getAttribute("test"), oElement),
					42, "returns {any} value");
				assert.strictEqual(oInterface.getResult(oElement.getAttribute("value"), oElement),
					"{}", "bMandatory must be hardcoded to true");
				assert.throws(function () {
					warn(that.oLogMock, "[ 1] Binding not ready", aViewContent[1]);
					oInterface.getResult("{missing>/}", oElement);
				}, new Error("Binding not ready: {missing>/}"));
				assert.strictEqual(oInterface.getResult(""), "");
				// Note: oInterface.getResult() throws
				//       TypeError: Cannot read property 'length' of undefined
				//           at Object.BindingParser.complexParser
			}, "foo", "Bar");

			process(xml(assert, aViewContent), {models: new JSONModel({answer: 42})});
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, getSettings, getViewInfo", function (assert) {
		var mSettings = {
				models: new JSONModel({answer: 42})
			},
			aViewContent = [
				mvcView(),
				'<f:Bar xmlns:f="foo" />',
				'</mvc:View>'
			],
			oViewInfo = {
				caller : "qux",
				componentId : "this._sOwnerId",
				name : "this.sViewName",
				nestedObject : {
					foo : "bar"
				}
			};

		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				var mMySettings = oInterface.getSettings(),
					oMyViewInfo = oInterface.getViewInfo();

				assert.deepEqual(mMySettings, mSettings);
				// Note: jQuery.extend() cannot clone objects constructed via new operator!
//				mMySettings.models.setProperty("/answer", -1);
//				assert.strictEqual(mSettings.models.getProperty("/answer"), 42, "deep copy");

				assert.deepEqual(oMyViewInfo, oViewInfo);
				//TODO If we cannot win for mSettings, is it worth trying for oViewInfo?
				oMyViewInfo.nestedObject.foo = "hacked";
				assert.strictEqual(oViewInfo.nestedObject.foo, "bar", "deep copy");
			}, "foo", "Bar");

			XMLPreprocessor.process(xml(assert, aViewContent), oViewInfo, mSettings);
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, visit*", function (assert) {
		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				var oChildNodes = oElement.childNodes;

				oInterface.visitAttributes(oChildNodes.item(0));
				oInterface.visitChildNodes(oChildNodes.item(1));
				oInterface.visitNode(oChildNodes.item(2));
				// this is initially returned as old visitor, see above
				XMLPreprocessor.visitNodeWrapper(oChildNodes.item(3), oInterface);
				// Note: there is also getAttributeNode()...
				oInterface.visitAttribute(oChildNodes.item(4),
					oChildNodes.item(4).getAttributeNodeNS("", "text"));
			}, "foo", "Bar");

			this.check(assert, [
				mvcView(),
				'<f:Bar xmlns:f="foo">',
				'<In id="visitAttributes: {/answer}">',
					'<Out id="no visitAttributes: {/answer}"/>',
				'</In>',
				'<Out id="no visitChildNodes: {/answer}">',
					'<In id="visitChildNodes: {/answer}"/>',
				'</Out>',
				'<In id="visitNode: {/answer}">',
					'<In id="visitNode: {/pi}"/>',
				'</In>',
				'<In id="visitNodeWrapper: {/answer}">',
					'<In id="visitNodeWrapper: {/pi}"/>',
				'</In>',
				'<In id="visitAttribute" src="{/answer}" text="{/answer}"/>',
				'</f:Bar>',
				'</mvc:View>'
			], {
				models: new JSONModel({answer : 42, pi : 3.14})
			}, [
				'<f:Bar xmlns:f="foo">',
				'<In id="visitAttributes: 42">',
					'<Out id="no visitAttributes: {/answer}"/>',
				'</In>',
				'<Out id="no visitChildNodes: {/answer}">',
					'<In id="visitChildNodes: 42"/>',
				'</Out>',
				'<In id="visitNode: 42">',
					'<In id="visitNode: 3.14"/>',
				'</In>',
				'<In id="visitNodeWrapper: 42">',
					'<In id="visitNodeWrapper: 3.14"/>',
				'</In>',
				'<In id="visitAttribute" src="{/answer}" text="42"/>',
				'</f:Bar>'
			]);
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, insertFragment", function (assert) {
		this.expectLoad(false, "fragmentName", xml(assert, ['<In xmlns="sap.ui.core"/>']));

		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				oInterface.insertFragment("fragmentName", oElement);
			}, "foo", "Bar");

			this.check(assert, [
				mvcView(),
				'<f:Bar xmlns:f="foo"/>',
				'</mvc:View>'
			], null, [
				'<In />'
			]);
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, call returns something", function (assert) {
		var aViewContent = [
				mvcView(),
				'<f:Bar xmlns:f="foo"/>',
				'</mvc:View>'
			];

		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				return null; // something other than undefined
			}, "foo", "Bar");

			this.checkError(assert, aViewContent, "Unexpected return value from visitor for {0}",
				null, 1);
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, getContext", function (assert) {
		var oModel = new JSONModel({
				hidden : {
					answer : 42
				}
			}),
			aViewContent = [
				mvcView(),
				'<f:Bar xmlns:f="foo" path="meta>answer"/>',
				'</mvc:View>'
			];

		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				var oContext = oInterface.getContext(oElement.getAttribute("path")),
					oDefaultContext = oInterface.getContext(/*default model, empty path*/);

				assert.strictEqual(oContext.getModel(), oModel);
				assert.strictEqual(oContext.getPath(), "/hidden/answer");

				assert.strictEqual(oDefaultContext.getModel(), oModel);
				assert.strictEqual(oDefaultContext.getPath(), "/hidden/answer");

				assert.throws(function () {
					oInterface.getContext("{meta>answer}");
				}, new Error("Must be a simple path, not a binding: {meta>answer}"));

				assert.throws(function () {
					oInterface.getContext("foo>");
				}, new Error("Unknown model 'foo': foo>"));

				assert.throws(function () {
					oInterface.getContext("other>");
				}, new Error("Cannot resolve path: other>"));
			}, "foo", "Bar");

			process(xml(assert, aViewContent), {
				bindingContexts : {
					"undefined" : oModel.createBindingContext("/hidden/answer"),
					meta : oModel.createBindingContext("/hidden")
				},
				models : {
					"undefined" : oModel,
					meta : oModel,
					other : oModel
				}
			});
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});

	//*********************************************************************************************
	QUnit.test("plugIn, with", function (assert) {
		var oModel = new JSONModel({
				hidden : {
					answer : 42
				}
			}),
			aViewContent = [
				mvcView(),
				'<f:Bar xmlns:f="foo" path="meta>answer"/>',
				'</mvc:View>'
			],
			that = this;

		try {
			XMLPreprocessor.plugIn(function (oElement, oInterface) {
				var oContext = oInterface.getContext(oElement.getAttribute("path")),
					oDerivedInterface = oInterface.with({a : oContext, b : oContext}),
					oEmptyInterface = oInterface.with(null, /*bReplace*/true),
					oNewInterface = oInterface.with({a : oContext, b : oContext}, /*bReplace*/true);

				assert.strictEqual(oDerivedInterface.getResult("{a>}"), 42, "a is known");
				assert.strictEqual(oDerivedInterface.getResult("{b>}"), 42, "b is known");
				assert.strictEqual(oDerivedInterface.getResult("{meta>answer}"), 42,
					"meta is inherited");

				assert.throws(function () { // no inheritance here!
					warn(that.oLogMock, "[ 1] Binding not ready");
					oEmptyInterface.getResult("{meta>}");
				}, new Error("Binding not ready: {meta>}"));

				assert.strictEqual(oNewInterface.getResult("{a>}"), 42, "a is known");
				assert.strictEqual(oNewInterface.getResult("{b>}"), 42, "b is known");
				assert.throws(function () { // no inheritance here!
					warn(that.oLogMock, "[ 1] Binding not ready");
					oNewInterface.getResult("{meta>}");
				}, new Error("Binding not ready: {meta>}"));

				assert.strictEqual(oInterface.with(), oInterface, "no map");
				assert.strictEqual(oInterface.with({}), oInterface, "empty map");
			}, "foo", "Bar");

			process(xml(assert, aViewContent), {
				bindingContexts : {
					meta : oModel.createBindingContext("/hidden")
				},
				models : {
					meta : oModel
				}
			});
		} finally {
			XMLPreprocessor.plugIn(null, "foo", "Bar");
		}
	});
	//TODO safety check for invalidated ICallback instances in each visit*() etc. call?
	//     !bReplace && !oWithControl.getParent()

	//*********************************************************************************************
	QUnit.test("async fragment in template:alias/if/repeat/with", function (assert) {
		// Note: <Label text="..."> remains unresolved, <Text text="..."> MUST be resolved
		var aFragmentContent = ["<Text text=\"{formatter: '.bar', path: 'here>flag'}\"/>"],
			sFragmentXml = xml(assert, aFragmentContent),
			aViewContent = [
				mvcView(),
				'<template:alias name=".bar" value="foo.Helper.bar">',
				'<template:with path="/some/random/path" var="here">',
				'<template:if test="true">',
				'<template:repeat list="{/items}">',
				'<Fragment fragmentName="{src}" type="XML"/>',
				'</template:repeat>',
				'</template:if>',
				'</template:with>', // context goes out of scope
				'</template:alias>', // alias goes out of scope
				'<Text text="{here>flag}"/>',
				"<Label text=\"{formatter: '.bar', path: '/'}\"/>",
				'</mvc:View>'
			];

		window.foo = {
			Helper : {
				bar : function (vValue) {
					return "*" + vValue + "*";
				}
			}
		};

		this.expectLoad(true, "myFragmentA", sFragmentXml);
		this.expectLoad(true, "myFragmentB", sFragmentXml);
		this.expectLoad(true, "myFragmentC", sFragmentXml);

		return this.checkTracing(assert, true, [
			{m : "[ 0] Start processing qux"},
			{m : "[ 1] here = /some/random/path", d : 2},
			{m : "[ 2] test == \"true\" --> true", d : 3},
			{m : "[ 3] Starting", d : 4},
			{m : "[ 3]  = /items/0", d : 4},
			{m : "[ 4] fragmentName = myFragmentA", d : 5},
			{m : "[ 4] text = *true*", d : aFragmentContent[0]},
			{m : "[ 4] Finished", d : "</Fragment>"},
			{m : "[ 3]  = /items/1", d : 4},
			{m : "[ 4] fragmentName = myFragmentB", d : 5},
			{m : "[ 4] text = *true*", d : aFragmentContent[0]},
			{m : "[ 4] Finished", d : "</Fragment>"},
			{m : "[ 3]  = /items/2", d : 4},
			{m : "[ 4] fragmentName = myFragmentC", d : 5},
			{m : "[ 4] text = *true*", d : aFragmentContent[0]},
			{m : "[ 4] Finished", d : "</Fragment>"},
			{m : "[ 3] Finished", d : "</template:repeat>"},
			{m : "[ 2] Finished", d : "</template:if>"},
			{m : "[ 1] Finished", d : "</template:with>"},
			{m : "[ 0] Binding not ready for attribute text", d : 10},
			{m : "[ 0] Binding not ready for attribute text", d : 11},
			{m : "[ 0] Finished processing qux"}
		], aViewContent, {
			models : new JSONModel({
				items : [{
					src : "myFragmentA"
				}, {
					src : "myFragmentB"
				}, {
					src : "myFragmentC"
				}],
				some : {
					random : {
						path : {
							flag : true
						}
					}
				}
			})
		}, [
			'<Text text="*true*"/>',
			'<Text text="*true*"/>',
			'<Text text="*true*"/>',
			// Note: XML serializer outputs &gt; encoding...
			aViewContent[10].replace(">", "&gt;"),
			aViewContent[11]
		], true);
	});

	//*********************************************************************************************
	QUnit.test("async binding resolution", function (assert) {
		var aViewContent = [
				mvcView(),
				'<In id="{async>/foo}" text="{async>/missing}" tooltip="{async>/bar}">',
				'<Text text="{async>/hello}"/>',
				'</In>',
				'<Text text="{async>/fail}"/>',
				"<Text text=\"{formatter: 'foo.Helper.star', path: 'async>/hello'}\"/>",
				"<Text text=\"{formatter: 'foo.Helper.star', path: 'async>/sync'}\"/>",
				"<Text text=\"{formatter: 'foo.Helper.join', parts: [{path: 'async>/hello'}, "
					+ "{formatter: 'foo.Helper.path', path: 'async>/sync'}, "
					+ "{formatter: 'foo.Helper.path', path: 'sync>/flag'}]}\"/>",
				// Note: this requires "textFragments" to be preserved
				'<Text text="{= \'hello, \''
					+ ' + ${formatter: \'foo.Helper.star\', path: \'async>/hello\'} }"/>',
				'</mvc:View>'
			];

		window.foo = {
			Helper : {
				// this: on top-level, the control; in a part, the binding
				join : function () {
					return Array.prototype.join.apply(arguments);
				},
				path : function (vValue) {
					return this.getPath() + "=" + vValue;
				},
				star : function (vValue) {
					return "*" + vValue + "*" + this.getMetadata().getName();
				}
			}
		};

		return this.checkTracing(assert, true, [
			{m : "[ 0] Start processing qux"},
			// Note: we have to wait for this value before we continue ("stop & go")
			{m : "[ 0] id = 5", d : 1},
			// Note: removal of attributes is reason to iterate over a shallow copy
			{m : "[ 0] Removed attribute text",
				d : '<In id="5" text="{async>/missing}" tooltip="{async>/bar}">'},
			// Note: this needs to come last, though bar is loaded faster than foo
			{m : "[ 0] tooltip = 0", d : '<In id="5" tooltip="{async>/bar}">'},
			// Note: this must come after all of the parent's attributes have been resolved (DFS)
			{m : "[ 0] text = world", d : 2},
			{m : "[ 0] Error in formatter of attribute text Error: Epic fail", d : 4},
			{m : "[ 0] text = *world*sap.ui.core.util._with", d : 5},
			{m : "[ 0] text = *sync*sap.ui.core.util._with", d : 6},
			{m : "[ 0] text = world,/sync=sync,/flag=true", d : 7},
			{m : "[ 0] text = hello, *world*sap.ui.model.json.JSONPropertyBinding", d : 8},
			{m : "[ 0] Finished processing qux"}
		], aViewContent, {
			models : {
				async : asyncModel({
					bar : 0,
					fail : new Error("Epic fail"),
					// Note: careful with setTimeout's delay, about 4ms seems to be "minimum"
					foo : 5,
					hello : "world",
					sync : "sync"
				}),
				sync : new JSONModel({flag : true})
			}
		}, [
			'<In id="5" tooltip="0">',
			'<Text text="world"/>',
			'</In>',
			// Note: XML serializer outputs &gt; encoding...
			'<Text text=\"{async&gt;/fail}\"/>',
			'<Text text="*world*sap.ui.core.util._with"/>',
			'<Text text="*sync*sap.ui.core.util._with"/>',
			'<Text text="world,/sync=sync,/flag=true"/>',
			'<Text text="hello, *world*sap.ui.model.json.JSONPropertyBinding"/>'
		], true);
	});

	//*********************************************************************************************
	QUnit.test("model which forbids $$valueAsPromise", function (assert) {
		var oModel = new JSONModel({
				foo : "bar"
			});

		oModel.bindProperty = function (sPath, oContext, mParameters) {
			if (mParameters && "$$valueAsPromise" in mParameters) {
				throw new Error("Illegal parameter '$$valueAsPromise'");
			}
			return JSONModel.prototype.bindProperty.apply(this, arguments);
		};

		return this.checkTracing(assert, true, [
			{m : "[ 0] Start processing qux"},
			{m : "[ 0] text = bar", d : 1},
			{m : "[ 0] Finished processing qux"}
		], [
			mvcView(),
			'<Text text="{/foo}"/>',
			'</mvc:View>'
		], {
			models : oModel
		}, [
			'<Text text="bar"/>'
		], true);
	});

	//*********************************************************************************************
	QUnit.test("<template:if> still works synchronously", function (assert) {
		return this.checkTracing(assert, true, [
			{m : "[ 0] Start processing qux"},
			{m : "[ 1] test == false --> false", d : 1},
			{m : "[ 1] Finished", d : 3},
			{m : "[ 0] Finished processing qux"}
		], [
			mvcView(),
			// Note: expression binding uses a formatter which is wrapped, but SyncPromise#unwrap
			// must be used!
			'<template:if test="{= %{/sync} !== \'sync\' }">',
			'<Out id="false"/>',
			'</template:if>',
			'</mvc:View>'
		], {
			models : asyncModel({sync : "sync"})
		}, undefined, true);
	});
});
//TODO we have completely missed support for unique IDs in fragments via the "id" property!
//TODO somehow trace ex.stack, but do not duplicate ex.message and take care of PhantomJS

/*!
 * ${copyright}
 */
(function () {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	window */
	"use strict";

	jQuery.sap.require("jquery.sap.xml");
	jQuery.sap.require("sap.ui.core.util.XMLPreprocessor");

	var sComponent = "sap.ui.core.util.XMLPreprocessor",
		iOldLogLevel = jQuery.sap.log.getLevel();

	/**
	 * Creates an <mvc:View> tag with namespace definitions.
	 * @param {string} [sPrefix="template"] the prefix for the template namespace
	 * @returns {string}
	 */
	function mvcView(sPrefix) {
		sPrefix = sPrefix || "template";
		return '<mvc:View xmlns="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:' + sPrefix
			+ '="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">';
	}

	/**
	 * Creates an DOM document from the given strings.
	 * @param {string[]} aContent the content
	 * @returns {Element} the DOM document's root element
	 */
	function xml(aContent) {
		var oDocument = jQuery.sap.parseXML(aContent.join(""));
		strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
		return oDocument.documentElement;
	}

	// remove all namespaces and all spaces before tag ends (..."/>)
	function normalizeXml(sXml) {
		/*jslint regexp: true*/
		sXml = sXml
			// Note: IE > 8 does not add all namespaces at root level, but deeper inside the tree!
			// Note: Chrome adds all namespaces at root level, but before other attributes!
			.replace(/ xmlns.*?=\".+?\"/g, "")
			// Note: browsers differ in whitespace for empty HTML(!) tags
			.replace(/ \/>/g, '/>');
		if (sap.ui.Device.browser.msie) {
			// IE shuffles attribute order
			// remove helper, type and var, then no tag should have more that one attribute
			sXml = sXml.replace(/ (helper|type|var)=".*?"/g, "")
		}
		return sXml;
	}

	/**
	 * Checks if document is equal to the concatenation of the given strings.
	 *
	 * @param {Element} oElement the actual XML document's root element
	 * @param {string[]|RegExp} vExpected
	 *   the expected XML as array of String (exact match) or a regular expression
	 */
	function checkXml(oElement, vExpected) {
		var sActual = normalizeXml(jQuery.sap.serializeXML(oElement)),
			sExpected;

		if (Array.isArray(vExpected)) {
			sExpected = vExpected.join("");
			strictEqual(sActual, normalizeXml(sExpected),
					"XML looks as expected: " + sExpected);
		} else {
			ok(vExpected.test(sActual), "XML: " + sActual + " matches " + vExpected);
		}
	}

	/**
	 * Call the given code under test, making sure that aggregations are bound and unbound in
	 * balance.
	 * @param {function} fnCodeUnderTest
	 */
	function withBalancedBindAggregation(fnCodeUnderTest) {
		var fnBindAggregation = sap.ui.base.ManagedObject.prototype.bindAggregation,
			oSandbox = sinon.sandbox.create(),
			fnUnbindAggregation;

		try {
			oSandbox.stub(sap.ui.base.ManagedObject.prototype, "bindAggregation",
				function (sName, oBindingInfo) {
					strictEqual(sName, "list");
					strictEqual(oBindingInfo.mode, sap.ui.model.BindingMode.OneTime);
					fnBindAggregation.apply(this, arguments);
				});
			fnUnbindAggregation
				= oSandbox.spy(sap.ui.base.ManagedObject.prototype, "unbindAggregation");

			fnCodeUnderTest();

			strictEqual(fnUnbindAggregation.callCount,
				sap.ui.base.ManagedObject.prototype.bindAggregation.callCount,
				"balance of bind and unbind");
			if (fnUnbindAggregation.callCount) {
				sinon.assert.alwaysCalledWith(fnUnbindAggregation, "list", true);
			}
		} finally {
			oSandbox.restore();
		}
	}
	//TODO test with exception during bindAggregation, e.g. via sorter

	/**
	 * Call the given code under test, making sure that properties are bound and unbound in
	 * balance.
	 * @param {function} fnCodeUnderTest
	 */
	function withBalancedBindProperty(fnCodeUnderTest) {
		var fnBindProperty = sap.ui.base.ManagedObject.prototype.bindProperty,
			oSandbox = sinon.sandbox.create();

		try {
			oSandbox.stub(sap.ui.base.ManagedObject.prototype, "bindProperty",
				function (sName, oBindingInfo) {
					strictEqual(sName, "any");
					strictEqual(oBindingInfo.mode, sap.ui.model.BindingMode.OneTime);
					(oBindingInfo.parts || []).forEach(function (oInfoPart) {
						strictEqual(oInfoPart.mode, sap.ui.model.BindingMode.OneTime);
					});
					fnBindProperty.apply(this, arguments);
				});
			oSandbox.spy(sap.ui.base.ManagedObject.prototype, "unbindProperty");

			fnCodeUnderTest();

			strictEqual(sap.ui.base.ManagedObject.prototype.unbindProperty.callCount,
				sap.ui.base.ManagedObject.prototype.bindProperty.callCount,
				"balance of bind and unbind");
			if (sap.ui.base.ManagedObject.prototype.unbindProperty.callCount) {
				sinon.assert.alwaysCalledWith(sap.ui.base.ManagedObject.prototype.unbindProperty,
					"any", true);
			}
		} finally {
			oSandbox.restore();
		}
	}

	/**
	 * Calls our XMLPreprocessor on the given view content, identifying the caller as "qux".
	 *
	 * @param {Element} oViewContent
	 *   the original view content as an XML document element
	 * @param {object} [mSettings]
	 *   a settings object for the preprocessor
	 */
	function process(oViewContent, mSettings) {
		return sap.ui.core.util.XMLPreprocessor.process(oViewContent, {caller : "qux"}, mSettings);
	}

	/**
	 * Creates a Sinon matcher that compares after normalizing the contained XML.
	 *
	 * @param {string|object} vExpected
	 *   either an expected string or already a Sinon matcher
	 * @returns {boolean}
	 */
	function matchArg(vExpected) {
		if (typeof vExpected === "string") {
			return sinon.match(function (sActual) {
				return normalizeXml(vExpected) === normalizeXml(sActual);
			}, vExpected);
		}
		return vExpected;
	}

	/**
	 * Expects a warning with the given message for the given log mock.
	 *
	 * @param {object} oLogMock
	 * @param {string} sExpectedWarning
	 * @param {any} [vDetails=null]
	 * @returns {object} the resulting Sinon.JS expectation
	 */
	function warn(oLogMock, sExpectedWarning, vDetails) {
		return oLogMock.expects("warning")
			.withExactArgs(matchArg(sExpectedWarning), vDetails || null,
				"sap.ui.core.util.XMLPreprocessor");
	}

	/**
	 * Checks that our XMLPreprocessor works as expected on the given view content. If called on a
	 * <code>this</code> (which MUST be a sandbox then), the view content is automatically searched
	 * for constant test conditions and appropriate warnings are expected; log output is stubbed
	 * in order to keep console clean.
	 *
	 * @param {string[]} aViewContent
	 *   the original view content
	 * @param {object} [mSettings={}]
	 *   a settings object for the preprocessor
	 * @param {string[]|RegExp} [vExpected]
	 *   the expected content as string array, with root element omitted; if missing, the
	 *   expectation is derived from the original view content by smart filtering. Alternatively
	 *   a regular expression which is expected to match the serialized original view content.
	 */
	function check(aViewContent, mSettings, vExpected) {
		var oLogMock,
			oViewContent = xml(aViewContent),
			i;

		// setup
		if (!vExpected) { // derive expectations by smart filtering
			vExpected = [];
			for (i = 1; i < aViewContent.length - 1; i += 1) {
				// Note: <In> should really have some attributes to make sure they are kept!
				if (aViewContent[i].indexOf("<In ") === 0) {
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
		// 'this' may be: null, window (IE9 w/o proper strict mode), oLogMock or the Sinon sandbox
		if (this) {
			if (this.expects) {
				oLogMock = this;
			} else if (this.mock) {
				oLogMock = this.mock(jQuery.sap.log);
			}
		}
		if (oLogMock) {
			aViewContent.forEach(function (sLine) {
				if (/if test="(false|true)"/.test(sLine)) {
					warn(oLogMock, 'qux: Constant test condition in ' + sLine);
				}
			});
		}

		withBalancedBindAggregation(function () {
			withBalancedBindProperty(function () {
				// code under test
				strictEqual(process(oViewContent, mSettings), oViewContent);
			});
		});

		// assertions
		checkXml(oViewContent, vExpected);
	}

	/**
	 * Checks that the XML preprocessor throws the expected error message when called on the given
	 * view content.
	 *
	 * @param {string[]} aViewContent
	 * @param {string} sExpectedMessage
	 *   no caller identification expected;
	 *   "{0}" is replaced with the indicated line of the view content (see iOffender)
	 * @param {object} [mSettings={}]
	 *   a settings object for the preprocessor
	 * @param {number} [iOffender=1]
	 *   index of offending statement
	 */
	function checkError(aViewContent, sExpectedMessage, mSettings, iOffender) {
		var oViewContent = xml(aViewContent),
			sOffender = aViewContent[iOffender || 1];

		try {
			process(oViewContent, mSettings);
			ok(false);
		} catch (ex) {
			strictEqual(
				normalizeXml(ex.message),
				normalizeXml("qux: " + sExpectedMessage.replace("{0}", sOffender))
			);
		}
	}

	/**
	 * Checks that the XMLPreprocessor works as expected on the given view content and that the
	 * tracing works as expected. The view content is automatically searched for constant test
	 * conditions and appropriate warnings are expected; log output is stubbed in order to keep
	 * console clean.
	 *
	 * BEWARE: Call via <code>checkTracing.call(this, ...)</code> so that <code>this</code> is a
	 * Sinon sandbox!
	 *
	 * @param {boolean} bDebug
	 *   whether debug output is accepted and expected (sets the log level accordingly)
	 * @param {object[]} aExpectedMessages
	 *   a array of expected debug messages with the message in <code>m</code>, optional details in
	 *   <code>d</code> and an optional count in <code>c</code> (default is 1). <code>m</code> may
	 *   also contain a Sinon matcher, <code>d</code> a number which is interpreted as index into
	 *   <code>aViewContent</code>.
	 * @param {string[]} aViewContent
	 *   the original view content
	 * @param {object} [mSettings={}]
	 *   a settings object for the preprocessor
	 * @param {string[]|RegExp} [vExpected]
	 *   the expected content as string array, with root element omitted; if missing, the
	 *   expectation is derived from the original view content by smart filtering. Alternatively
	 *   a regular expression which is expected to match the serialized original view content.
	 */
	function checkTracing(bDebug, aExpectedMessages, aViewContent, mSettings, vExpected) {
		var oLogMock = this.mock(jQuery.sap.log),
			sName;

		if (bDebug) {
			aExpectedMessages.forEach(function (oExpectedMessage) {
				var vExpectedDetail = oExpectedMessage.d;
				if (typeof vExpectedDetail === "number") {
					vExpectedDetail = matchArg(aViewContent[vExpectedDetail]);
				}
				oLogMock.expects("debug")
					.exactly(oExpectedMessage.c || 1)
					.withExactArgs(matchArg(oExpectedMessage.m), vExpectedDetail, sComponent);
			});
		} else {
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.WARNING);
			oLogMock.expects("debug").never();
		}

		check.call(oLogMock, aViewContent, mSettings, vExpected);
	}

	/**
	 * Checks that the XML preprocessor throws the expected error message when called on the given
	 * view content. Determines the offending content by <code>id="unexpected"</code>.
	 *
	 * @param {string[]} aViewContent
	 * @param {string} sExpectedMessage
	 *   no caller identification expected;
	 *   "{0}" is replaced with the line of the view content which has id="unexpected"
	 */
	function unexpected(aViewContent, sExpectedMessage) {
		var iUnexpected;

		aViewContent.forEach(function (sViewContent, i) {
			if (/id="unexpected"/.test(sViewContent)) {
				iUnexpected = i;
			}
		});

		checkError(aViewContent, sExpectedMessage, undefined, iUnexpected);
	}

	//*********************************************************************************************
	module("sap.ui.core.util.XMLPreprocessor", {
		beforeEach : function () {
			// do not rely on ERROR vs. DEBUG due to minified sources
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
		},
		afterEach : function () {
			jQuery.sap.log.setLevel(iOldLogLevel);
			delete window.foo;
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
		[false, true].forEach(function (bIsLoggable) {
			var aViewContent = oFixture.aViewContent;

			test(aViewContent[1] + ", warn = " + bIsLoggable, function () {
				var oLogMock = this.mock(jQuery.sap.log);

				if (!bIsLoggable) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}
				warn(oLogMock, 'qux: Constant test condition in ' + aViewContent[1])
					.exactly(bIsLoggable ? 1 : 0); // do not construct arguments in vain!

				check(aViewContent);
			});
		});
	});

	//*********************************************************************************************
	test("XML with template:if test='true'", function () {
		check.call(this, [
			mvcView(),
			'<template:if test="true">',
			'<In id="first"/>',
			'<In id="true"/>',
			'<In id="last"/>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	test("XML with multiple template:if", function () {
		check.call(this, [
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
	test("XML with nested template:if (as last child)", function () {
		check.call(this, [
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
	test("XML with nested template:if (as inner child)", function () {
		check.call(this, [
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
		test("XML with template:if test='{/flag}', truthy, flag = " + oFlag,
			function () {
				check([
					mvcView("t"),
					'<t:if test="{path: \'/flag\', type: \'sap.ui.model.type.Boolean\'}">',
					'<In id="flag"/>',
					'</t:if>',
					'</mvc:View>'
				], {
					models: new sap.ui.model.json.JSONModel({flag: oFlag})
				});
			});
	});

	//*********************************************************************************************
	// Note: " " intentionally not included yet, should not matter for OData!
	["false", false, 0, null, undefined, NaN, ""].forEach(function (oFlag) {
		test("XML with template:if test='{/flag}', falsy, flag = " + oFlag,
			function () {
				check([
					mvcView(),
					'<template:if test="{/flag}">',
					'<Out/>',
					'</template:if>',
					'</mvc:View>'
				], {
					models: new sap.ui.model.json.JSONModel({flag: oFlag})
				});
			});
	});

	//*********************************************************************************************
	// Note: relative paths now!
	["true", true, 1, "X"].forEach(function (oFlag) {
		test("XML with template:if test='{flag}', truthy, flag = " + oFlag, function () {
			var oModel = new sap.ui.model.json.JSONModel({flag: oFlag});

			check([
				mvcView(),
				'<template:if test="{flag}">',
				'<In id="flag"/>',
				'</template:if>',
				'</mvc:View>'
			], {
				models: oModel, bindingContexts: oModel.createBindingContext("/")
			});
		});
	});

	//*********************************************************************************************
	test("XML with template:if test='{formatter:...}'", function () {
		window.foo = {
			Helper: {
				not: function (oRawValue) {
					return !oRawValue;
				}
			}
		};
		check([
			mvcView(),
			'<template:if test="{formatter: \'foo.Helper.not\', path:\'/flag\'}">',
			'<In id="flag"/>',
			'</template:if>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({flag: false})
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
		]
	}, {
		aViewContent : [
			mvcView(),
			'<Fragment fragmentName="' + "{formatter: 'foo.Helper.fail', path:'/flag'}"
				+ '" type="XML"/>',
			'</mvc:View>'
		],
		bAsIs : true // view remains "as is"
	}].forEach(function (oFixture) {
		[false, true].forEach(function (bIsLoggable) {
			var aViewContent = oFixture.aViewContent,
				vExpected = oFixture.bAsIs ? [aViewContent[1]] : undefined;

			test(aViewContent[1] + ", exception in formatter, warn = " + bIsLoggable, function () {
				var oError = new Error("deliberate failure"),
					oLogMock = this.mock(jQuery.sap.log);

				this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
				if (!bIsLoggable) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}
				warn(oLogMock, 'qux: Error in formatter of ' + aViewContent[1], oError)
					.exactly(bIsLoggable ? 1 : 0); // do not construct arguments in vain!

				window.foo = {
					Helper: {
						fail: function (oRawValue) {
							throw oError;
						}
					}
				};

				check(aViewContent, {
					models: new sap.ui.model.json.JSONModel({flag: true})
				}, vExpected);
			});
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
		sMessage : 'qux: Function name(s) .someMethod not found in '
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
		sMessage : 'qux: Function name(s) .someMethod, foo.bar not found in '
	}, {
		aViewContent : [
			mvcView(),
			'<Fragment fragmentName="{foo>/some/path}" type="XML"/>',
			'</mvc:View>'
		],
		vExpected : [ // Note: XML serializer outputs &gt; encoding...
			'<Fragment fragmentName="{foo&gt;/some/path}" type="XML"/>'
		]
	}].forEach(function (oFixture) {
		[false, true].forEach(function (bIsLoggable) {
			var aViewContent = oFixture.aViewContent,
				vExpected = oFixture.vExpected && oFixture.vExpected.slice(),
				sMessage = (oFixture.sMessage || 'qux: Binding not ready in ') + aViewContent[1];

			test(aViewContent[1] + ", warn = " + bIsLoggable, function () {
				var oLogMock = this.mock(jQuery.sap.log);

				this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
				if (!bIsLoggable) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}
				warn(oLogMock, sMessage)
					.exactly(bIsLoggable ? 1 : 0); // do not construct arguments in vain!

				check(aViewContent, {}, vExpected);
			});
		});
	});

	//*********************************************************************************************
	test("Do not process nested template:ifs if not necessary", function () {
		window.foo = {
			Helper: {
				forbidden: function (oRawValue) {
					ok(false, "formatter MUST not be called!");
				}
			}
		};
		check.call(this, [
			mvcView(),
			'<template:if test="false">',
			'<template:if test="{formatter: \'foo.Helper.forbidden\', path:\'/flag\'}"/>',
			'</template:if>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({flag: true})
		});
	});

	//*********************************************************************************************
	test("XML with template:if test='false' and template:then", function () {
		check.call(this, [
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
	test("XML with template:if test='true' and template:then", function () {
		check.call(this, [
			mvcView(),
			'<template:if test="true">',
			'<!-- some text node -->',
			'<template:then>',
			'<In id="then"/>',
			'</template:then>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	test("XML with nested template:if test='true' and template:then", function () {
		check.call(this, [
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
	test("XML with template:if test='true' and template:then/else", function () {
		check.call(this, [
			mvcView(),
			'<template:if test="true">',
			'<template:then>',
			'<In id="then"/>',
			'</template:then>',
			'<!-- some text node -->',
			'<template:else>',
			'<Out/>',
			'</template:else>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	test("XML with template:if test='false' and template:then/else", function () {
		check.call(this, [
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
	test("XML with nested template:if test='true' and template:then/else",
		function () {
			check.call(this, [
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
		test("Unexpected tags (" + i + ")", function () {
			unexpected(aViewContent, "Unexpected tag {0}");
		});
	});

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
		test("Expected <template:else>, but instead saw... (" + i + ")", function () {
			unexpected(aViewContent,
				"Expected <template:elseif> or <template:else>, but instead saw {0}");
		});
	});

	[[
		mvcView("t"),
		'<t:if test="true">',
		'<t:then/>',
		'<t:else/>',
		'<!-- some text node -->',
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
		test("Expected </t:if>, but instead saw... (" + i + ")", function () {
			unexpected(aViewContent, "Expected </t:if>, but instead saw {0}");
		});
	});

	//*********************************************************************************************
	test('<template:elseif>: if is true', function () {
		check.call(this, [
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
	test('<template:elseif>: all false, w/ else', function () {
		check.call(this, [
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
	test('<template:elseif>: all false, w/o else', function () {
		check.call(this, [
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
	test('<template:elseif>: elseif is true', function () {
		check.call(this, [
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
	test("binding resolution", function () {
		var oLogMock = this.mock(jQuery.sap.log);

		oLogMock.expects("error").never();
		warn(oLogMock, 'qux: Binding not ready in <Text text="{unrelated>/some/path}"/>');

		window.foo = {
			Helper: {
				help: function (vRawValue) {
					return vRawValue.String || "{" + vRawValue.Path + "}";
				},
				nil: function () {
					return null;
				}
			}
		};

		check([
			mvcView().replace(">", ' xmlns:html="http://www.w3.org/1999/xhtml">'),
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
			models: new sap.ui.model.json.JSONModel({
				"com.sap.vocabularies.UI.v1.HeaderInfo": {
					"TypeImageUrl": {
						"String": "/coco/apps/main/img/Icons/product_48.png"
					},
					"Title": {
						"Label": {
							"String": "Customer"
						},
						"Value": {
							"Path": "CustomerName"
						}
					}
				}
			})
		}, [ // Note: XML serializer outputs &gt; encoding...
			'<Label text="Customer"/>',
			'<Text text="{CustomerName}"/>', // "maxLines" has been removed
			'<Label text="A \\{ is a special character"/>',
			'<Text text="{unrelated&gt;/some/path}"/>',
			'<Text text="' + "{path:'/some/path',formatter:'.someMethod'}" + '"/>',
			// TODO is this the expected behaviour? And what about text nodes?
			'<html:img src="/coco/apps/main/img/Icons/product_48.png"/>'
		]);
	});

	//*********************************************************************************************
	test("binding resolution: interface to formatter", function () {
		var oModel = new sap.ui.model.json.JSONModel({
				"somewhere": {
					"com.sap.vocabularies.UI.v1.HeaderInfo": {
						"Title": {
							"Label": {
								"String": "Customer"
							},
							"Value": {
								"Path": "CustomerName"
							}
						}
					}
				}
			});

		/*
		 * Dummy formatter function.
		 *
		 * @param {object} oInterface
		 * @param {any} vRawValue
		 */
		function help(oInterface, vRawValue) {
			var oContext,
				sExpectedPath = vRawValue.String
					? "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label"
					: "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value";

			strictEqual(oInterface.getModel(), oModel);
			strictEqual(oInterface.getPath(), sExpectedPath);
			strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
			throws(function () {
				oInterface.getSetting("bindingContexts");
			}, /Illegal argument: bindingContexts/);
			throws(function () {
				oInterface.getSetting("models");
			}, /Illegal argument: models/);

			return vRawValue.String || "{" + vRawValue.Path + "}";
		}
		help.requiresIContext = true;

		/*
		 * Dummy formatter function to check that only <code>requiresIContext = true</code> counts.
		 *
		 * @param {any} vRawValue
		 */
		function other(vRawValue) {
			strictEqual(arguments.length, 1);
		}
		other.requiresIContext = "ignored";

		window.foo = {
			Helper: {
				help: help,
				other: other
			}
		};

		checkTracing.call(this, true, [
			{m: "[ 0] Start processing qux"},
			{m: "[ 0] undefined = /somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"},
			{m: "[ 0] removed attribute text", d: 1},
			{m: "[ 0] text = Customer", d: 2},
			{m: "[ 0] text = Value: {CustomerName}", d: 3},
			{m: "[ 0] text = Customer: {CustomerName}", d: 4},
			{m: "[ 0] Finished processing qux"}
		], [
			mvcView(),
			'<Text text="{formatter: \'foo.Helper.other\', path: \'Title/Label\'}"/>',
			'<Text text="{formatter: \'foo.Helper.help\', path: \'Title/Label\'}"/>',
			'<Text text="Value: {formatter: \'foo.Helper.help\', path: \'Title/Value\'}"/>',
			'<Text text="{formatter: \'foo.Helper.help\', path: \'Title/Label\'}'
				+ ': {formatter: \'foo.Helper.help\', path: \'Title/Value\'}"/>',
			'</mvc:View>'
		], {
			models: oModel,
			bindingContexts: oModel.createBindingContext(
					"/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"),
			bindTexts: true
		}, [
			'<Text/>',
			'<Text text="Customer"/>',
			'<Text text="Value: {CustomerName}"/>',
			'<Text text="Customer: {CustomerName}"/>'
		]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("binding resolution, exception in formatter, debug = " + bIsLoggable, function () {
			var oError = new Error("deliberate failure");

			window.foo = {
					Helper: {
						fail: function (oRawValue) {
							throw oError;
						}
					}
				};

			checkTracing.call(this, bIsLoggable, [
				{m: "[ 0] Start processing qux"},
				{m: sinon.match(/qux: Error in formatter of <In text=".*"\/>/), d: oError, c: 2},
				{m: "[ 0] Finished processing qux"}
			], [
				mvcView(),
				'<In text="{formatter: \'foo.Helper.fail\','
					+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label\'}"/>',
				'<In text="{formatter: \'foo.Helper.fail\','
					+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value\'}"/>',
				'</mvc:View>'
			], {
				models: new sap.ui.model.json.JSONModel({
					"com.sap.vocabularies.UI.v1.HeaderInfo": {
						"Title": {
							"Label": {
								"String": "Customer"
							},
							"Value": {
								"Path": "CustomerName"
							}
						}
					}
				})
			});
		});
	});

	//*********************************************************************************************
	test("template:with", function () {
		check([
			mvcView(),
			'<template:with path="/some/random/path">',
			'<template:if test="{flag}">',
			'<In id="flag"/>',
			'</template:if>',
			'</template:with>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({
				some: {
					random: {
						path: {
							flag: true
						}
					}
				}
			})
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bHasHelper) {
		test("template:with and 'named context', has helper = " + bHasHelper, function () {
			window.foo = {
				Helper : {
					help : function () {} // empty helper must not make any difference
				}
			};
			check([
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
				models: new sap.ui.model.json.JSONModel({
					some: {
						random: {
							path: {
								flag: true
							}
						}
					}
				})
			});
		});
	});

	//*********************************************************************************************
	test("template:with and 'named context', missing variable name", function () {
		checkError([
			mvcView(),
			'<template:with path="/unused" var=""/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	//*********************************************************************************************
	test("template:with and 'named context', missing model", function () {
		checkError([
			mvcView(),
			'<template:with path="some>random/path" var="path"/>', // "some" not defined here!
			'</mvc:View>'
		], "Missing model 'some' in {0}");
	});

	//*********************************************************************************************
	test("template:with and 'named context', missing context", function () {
		checkError([
			mvcView(),
			'<template:with path="some/random/place" var="place"/>',
			'</mvc:View>'
		], "Cannot resolve path for {0}", {
			models: new sap.ui.model.json.JSONModel()
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWithVar) {
		test("template:with and helper, with var = " + bWithVar, function () {
			var oModel = new sap.ui.model.json.JSONModel({
					target: {
						flag: true
					}
				});

			window.foo = {
				Helper : {
					help : function (oContext) {
						ok(oContext instanceof sap.ui.model.Context);
						strictEqual(oContext.getModel(), oModel);
						strictEqual(oContext.getPath(), "/some/random/path");
						return "/target";
					}
				}
			};
			check([
				mvcView(),
				'<template:with path="/some/random/path" helper="foo.Helper.help"'
					+ (bWithVar ? ' var="target"' : '') + '>',
				'<template:if test="{' + (bWithVar ? 'target>' : '') + 'flag}">',
				'<In id="flag"/>',
				'</template:if>',
				'</template:with>',
				'</mvc:View>'
			], {
				models: oModel
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWithVar) {
		test("template:with and helper changing the model, with var = " + bWithVar, function () {
			var oMetaModel = new sap.ui.model.json.JSONModel({
					target: {
						flag: true
					}
				}),
				oModel = new sap.ui.model.json.JSONModel();

			window.foo = {
				Helper : {
					help : function (oContext) {
						ok(oContext instanceof sap.ui.model.Context);
						strictEqual(oContext.getModel(), oModel);
						strictEqual(oContext.getPath(), "/some/random/path");
						return oMetaModel.createBindingContext("/target");
					}
				}
			};
			check([
				mvcView(),
				'<template:with path="/some/random/path" helper="foo.Helper.help"'
					+ (bWithVar ? ' var="target"' : '') + '>',
				'<template:if test="{' + (bWithVar ? 'target>' : '') + 'flag}">',
				'<In id="flag"/>',
				'</template:if>',
				'</template:with>',
				'</mvc:View>'
			], {
				models: {
					meta: oMetaModel,
					"undefined": oModel
				}
			});
		});
	});

	//*********************************************************************************************
	[undefined, {}].forEach(function (fnHelper) {
		test("template:with and helper = " + fnHelper, function () {
			window.foo = fnHelper;
			checkError([
				mvcView(),
				'<template:with path="/unused" var="target" helper="foo"/>',
				'</mvc:View>'
			], "Cannot resolve helper for {0}", {
				models: new sap.ui.model.json.JSONModel()
			});
		});
	});

	//*********************************************************************************************
	[true, ""].forEach(function (vResult) {
		test("template:with and helper returning " + vResult, function () {
			window.foo = function () {
				return vResult;
			};
			checkError([
				mvcView(),
				'<template:with path="/unused" var="target" helper="foo"/>',
				'</mvc:View>'
			], "Illegal helper result '" + vResult + "' in {0}", {
				models: new sap.ui.model.json.JSONModel()
			});
		});
	});

	//*********************************************************************************************
	test('template:with repeated w/ same variable and value', function () {
		var oLogMock = this.mock(jQuery.sap.log),
			oModel = new sap.ui.model.json.JSONModel(),
			sTemplate1 = '<template:with path="bar>/my/path" var="bar"/>',
			sTemplate2 = '<template:with path="bar>bla" helper="foo"/>',
			sTemplate3 = '<template:with path="bar>/my/path"/>';

		window.foo = function () {
			return "/my/path";
		};

		warn(oLogMock, "qux: Set unchanged path '/my/path' in " + sTemplate1);
		warn(oLogMock, "qux: Set unchanged path '/my/path' in " + sTemplate2);
		warn(oLogMock, "qux: Set unchanged path '/my/path' in " + sTemplate3);

		check([
			mvcView(),
			sTemplate1,
			sTemplate2,
			sTemplate3,
			'</mvc:View>'
		], {
			models: {bar: oModel},
			bindingContexts: {
				bar: oModel.createBindingContext("/my/path")
			}
		});
	});

	//*********************************************************************************************
	test("template:repeat w/o named models", function () {
		check([
			mvcView(),
			'<template:repeat list="{/items}">',
			'<In src="{src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({
				items: [{
					src: "A"
				}, {
					src: "B"
				}, {
					src: "C"
				}]
			})
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat, startIndex & length", function () {
		check([
			mvcView(),
			'<template:repeat list="' + "{path:'/items',startIndex:1,length:2}" + '">',
			'<In src="{src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({
				items: [{
					src: "A"
				}, {
					src: "B"
				}, {
					src: "C"
				}, {
					src: "D"
				}]
			})
		}, [
			'<In src="B"/>',
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat with named models", function () {
		check([
			mvcView(),
			'<template:repeat list="{modelName>/items}">',
			'<In src="{modelName>src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: {
				modelName: new sap.ui.model.json.JSONModel({
					items: [{
						src: "A"
					}, {
						src: "B"
					}, {
						src: "C"
					}]
				})
			}
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test('template:repeat w/o list', function () {
		checkError([
			mvcView(),
			'<template:repeat/>',
			'</mvc:View>'
		], "Missing binding for {0}");
	});

	//*********************************************************************************************
	test('template:repeat list="no binding"', function () {
		checkError([
			mvcView(),
			'<template:repeat list="no binding"/>',
			'</mvc:View>'
		], "Missing binding for {0}");
	});

	//*********************************************************************************************
	test('template:repeat list="{unknown>foo}"', function () {
		checkError([
			mvcView(),
			'<template:repeat list="{unknown>foo}"/>',
			'</mvc:View>'
		], "Missing model 'unknown' in {0}");
	});

	//*********************************************************************************************
	test('template:repeat list="{/unsupported/path}"', function () {
		//TODO is this the expected behavior? the loop has no iterations and that's it?
		// Note: the same happens with a relative path if there is no binding context for the model
		check([
			mvcView(),
			'<template:repeat list="{/unsupported/path}"/>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel()
		});
	});

	//*********************************************************************************************
	test("template:repeat w/ complex binding and model", function () {
		check([
			mvcView(),
			// Note: foo: 'bar' just serves as placeholder for any parameter (complex syntax)
			'<template:repeat list="{foo: \'bar\', path:\'modelName>/items\'}">',
			'<In src="{modelName>src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: {
				modelName: new sap.ui.model.json.JSONModel({
					items: [{
						src: "A"
					}, {
						src: "B"
					}, {
						src: "C"
					}]
				})
			}
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat nested", function () {
		check([
			mvcView(),
			'<template:repeat list="{customer>/orders}">',
			'<In src="{customer>id}"/>',
			'<template:repeat list="{customer>items}">',
			'<In src="{customer>no}"/>',
			'</template:repeat>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: {
				customer: new sap.ui.model.json.JSONModel({
					orders: [{
						id: "A",
						items: [{
							no: "A1"
						}, {
							no: "A2"
						}]
					}, {
						id: "B",
						items: [{
							no: "B1"
						}, {
							no: "B2"
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
			'<In src="B2"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat with loop variable", function () {
		check([
			mvcView(),
			'<template:repeat list="{modelName>/items}" var="item">',
			'<In src="{item>src}"/>',
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: {
				modelName: new sap.ui.model.json.JSONModel({
					items: [{
						src: "A"
					}, {
						src: "B"
					}, {
						src: "C"
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
	test("template:repeat with missing loop variable", function () {
		checkError([
			mvcView(),
			'<template:repeat var="" list="{/unused}"/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	//*********************************************************************************************
	test("fragment support", function () {
		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function () {
			return xml(['<In xmlns="foo"/>']);
		});
		check([
				mvcView(),
				'<Fragment fragmentName="myFragment" type="XML"/>',
				'</mvc:View>'
			],
			{},
			[
				'<In />'
			]);
		sinon.assert.calledWithExactly(sap.ui.core.XMLTemplateProcessor.loadTemplate, "myFragment",
			"fragment");
	});

	//*********************************************************************************************
	test("dynamic fragment names", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor)
			.expects("loadTemplate")
			.once()
			.withExactArgs("dynamicFragmentName", "fragment")
			.returns(xml(['<In xmlns="foo"/>']));
		check([
				mvcView(),
				'<Fragment fragmentName="{= \'dynamicFragmentName\' }" type="XML"/>',
				'</mvc:View>'
			],
			{},
			[
				'<In />'
			]);
	});

	//*********************************************************************************************
	test("fragment with FragmentDefinition", function () {
		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function () {
			return xml(['<FragmentDefinition xmlns="sap.ui.core">',
						'<In id="first"/>',
						'<In id="last"/>',
						'</FragmentDefinition>']);
		});
		check([
				mvcView(),
				'<Fragment fragmentName="myFragment" type="XML"/>',
				'</mvc:View>'
			],
			{},
			[
				'<In id="first"/>',
				'<In id="last"/>'
			]);
		sinon.assert.calledWithExactly(sap.ui.core.XMLTemplateProcessor.loadTemplate, "myFragment",
			"fragment");
	});

	//*********************************************************************************************
	test("fragment in repeat", function () {
		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function () {
			return xml(['<In xmlns="foo" src="{src}" />']);
		});

		check([
			mvcView(),
			'<template:repeat list="{/items}">',
			'<Fragment fragmentName="A" type="XML"/>',,
			'</template:repeat>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({
				items: [{
					src: "A"
				}, {
					src: "B"
				}, {
					src: "C"
				}]
			})
		}, [
			'<In src="A"/>',
			'<In src="B"/>',
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	test("fragment with type != XML", function () {
		var oXMLTemplateProcessorMock = this.mock(sap.ui.core.XMLTemplateProcessor);

		check([
				mvcView(),
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>',
				'</mvc:View>'
			],
			{}, [
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>',
			]);
		oXMLTemplateProcessorMock.expects("loadTemplate").never();
	});

	//*********************************************************************************************
	test("error on fragment with simple cyclic reference", function () {
		this.mock(jQuery.sap.log).expects("error")
			.once()
			.withExactArgs("Cyclic reference to fragment 'cycle' ",
				matchArg('<Fragment xmlns="sap.ui.core" fragmentName="cycle" type="XML"/>'),
				"sap.ui.core.util.XMLPreprocessor");

		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function () {
			return xml(['<Fragment xmlns="sap.ui.core" fragmentName="cycle" type="XML"/>']);
		});
		check([
				mvcView(),
				'<Fragment fragmentName="cycle" type="XML"/>',
				'</mvc:View>'
			], {}, [
				'<Fragment fragmentName="cycle" type="XML"/>'
			]);
	});

	//*********************************************************************************************
	test("error on fragment with ping pong cyclic reference and <with> elements", function () {
		var aFragmentContent = [
				'<FragmentDefinition xmlns="sap.ui.core" xmlns:template'
					+ '="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">',
				'<template:with path="/foo" var="bar">',
				'<template:with path="/bar" var="foo">',
				'<Fragment xmlns="sap.ui.core" fragmentName="B" type="XML"/>',
				'</template:with>',
				'</template:with>',
				'</FragmentDefinition>'
			],
			oLogMock = this.mock(jQuery.sap.log);

		oLogMock.expects("error")
			.once()
			.withExactArgs("Cyclic reference to fragment 'B' ",
				matchArg('<Fragment xmlns="sap.ui.core" fragmentName="B" type="XML"/>'),
				"sap.ui.core.util.XMLPreprocessor");
		warn(oLogMock, "qux: Set unchanged path '/foo' in " + aFragmentContent[1]);
		warn(oLogMock, "qux: Set unchanged path '/bar' in " + aFragmentContent[2]);

		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function (sTemplateName) {
			if (sTemplateName === "A") {
				return xml(aFragmentContent);
			}
			return xml(['<Fragment xmlns="sap.ui.core" fragmentName="A" type="XML"/>']);
		});
		check([
				mvcView(),
				'<Fragment fragmentName="A" type="XML"/>',
				'</mvc:View>'
			], {
				models: new sap.ui.model.json.JSONModel()
			}, [
				'<Fragment fragmentName="B" type="XML"/>' // Note: this is where the error occurs
			]);
	});

	//*********************************************************************************************
	test("Legacy signature support", function () {
		var aViewContent = [
				mvcView(),
				'<template:if test="false">',
				'<Out/>',
				'<\/template:if>',
				'<\/mvc:View>'
			],
			fnProcess = sap.ui.core.util.XMLPreprocessor.process;

		this.stub(sap.ui.core.util.XMLPreprocessor, "process",
			function (oRootElement, oViewInfo, mSettings) {
				// simulate call with legacy signature
				return fnProcess.call(this, oRootElement, mSettings, oViewInfo.caller);
			}
		);

		check.call(this, aViewContent);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("tracing, debug=" + bIsLoggable, function () {
			var oBarModel = new sap.ui.model.json.JSONModel({
					"com.sap.vocabularies.UI.v1.HeaderInfo": {
						"Title": {
							"Label": {
								"String": "Customer"
							},
							"Value": {
								"Path": "CustomerName"
							}
						}
					},
					"com.sap.vocabularies.UI.v1.Identification": [{
						Value: { Path: "A"},
					}, {
						Value: { Path: "B"},
					}, {
						Value: { Path: "C"},
					}]
				}),
				oBazModel = new sap.ui.model.json.JSONModel({}),
				aDebugMessages,
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
					'</mvc:View>'
				];

			this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
				.returns(xml(['<FragmentDefinition xmlns="sap.ui.core">',
					'<In src="fragment"/>',
					'</FragmentDefinition>']));

			checkTracing.call(this, bIsLoggable, [
				{m: "[ 0] Start processing qux"},
				{m: "[ 0] bar = /com.sap.vocabularies.UI.v1.HeaderInfo/Title"},
				{m: "[ 0] baz = /"},
				{m: "[ 1] foo = /com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label", d: 1},
				{m: "[ 2] test == \"false\" --> false", d: 2},
				{m: "[ 2] test == [object Object] --> true", d: 6},
				{m: "[ 3] fragmentName = myFragment", d: 8},
				{m: "[ 3] Finished", d: "</Fragment>"},
				{m: "[ 2] Finished", d: 10},
				{m: "[ 1] Finished", d: 11},
				{m: "[ 1] Starting", d: 12},
				{m: "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/0", d: 12},
				{m: "[ 1] src = A", d: 13},
				{m: "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/1", d: 12},
				{m: "[ 1] src = B", d: 13},
				{m: "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/2", d: 12},
				{m: "[ 1] src = C", d: 13},
				{m: "[ 1] Finished", d: 14},
				{m: "[ 1] test == [object Array] --> true", d: 15},
				{m: "[ 1] Finished", d: "</t:if>"},
				{m: "[ 1] test == undefined --> false", d: 16},
				{m: "[ 1] Finished", d: "</t:if>"},
				{m: "[ 0] Finished processing qux"}
			], aViewContent, {
				models: { bar: oBarModel, baz: oBazModel },
				bindingContexts: {
					bar: oBarModel.createBindingContext(
							"/com.sap.vocabularies.UI.v1.HeaderInfo/Title"),
					baz: oBazModel.createBindingContext("/"),
				}
			}, [
				'<In />',
				'<In src="fragment"/>',
				'<In src="A"/>',
				'<In src="B"/>',
				'<In src="C"/>',
			]);
		});
	});
} ());

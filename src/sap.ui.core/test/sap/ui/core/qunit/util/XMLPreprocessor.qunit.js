/*!
 * ${copyright}
 */
(function () {
	/*global ok, QUnit, sinon, strictEqual, throws, window */
	/*eslint consistent-this: 0, no-loop-func: 0, no-warning-comments: 0*/
	"use strict";

	jQuery.sap.require("jquery.sap.xml");
	jQuery.sap.require("sap.ui.core.CustomizingConfiguration");
	jQuery.sap.require("sap.ui.core.util.XMLPreprocessor");

	var sComponent = "sap.ui.core.util.XMLPreprocessor",
		iOldLogLevel = jQuery.sap.log.getLevel();

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
		if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
			// Microsoft shuffles attribute order
			// remove helper, type and var, then no tag should have more that one attribute
			sXml = sXml.replace(/ (helper|type|var)=".*?"/g, "");
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
	 *   code under test
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
	 *   code under test
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
	 * Calls our XMLPreprocessor on the given view content, identifying the caller as "qux"
	 * and passing "this._sOwnerId" as component ID and "this.sViewName" as (view) name.
	 *
	 * @param {Element} oViewContent
	 *   the original view content as an XML document element
	 * @param {object} [mSettings]
	 *   a settings object for the preprocessor
	 * @returns {Element}
	 *   the processed view content as an XML document element
	 */
	function process(oViewContent, mSettings) {
		var oViewInfo = {
				caller : "qux",
				componentId : "this._sOwnerId",
				name : "this.sViewName"
			};
		return sap.ui.core.util.XMLPreprocessor.process(oViewContent, oViewInfo, mSettings);
	}

	/**
	 * Creates a Sinon matcher that compares after normalizing the contained XML.
	 *
	 * @param {string|object} vExpected
	 *   either an expected string or already a Sinon matcher
	 * @returns {object}
	 *   a Sinon matcher
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
	 *   mock for <code>jQuery.sap.log</code>
	 * @param {string} sExpectedWarning
	 *   expected warning message
	 * @param {any} [vDetails=null]
	 *   expected warning details
	 * @returns {object}
	 *   the resulting Sinon expectation
	 */
	function warn(oLogMock, sExpectedWarning, vDetails) {
		return oLogMock.expects("warning")
			// do not construct arguments in vain!
			.exactly(jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING) ? 1 : 0)
			.withExactArgs(matchArg(sExpectedWarning), matchArg(vDetails || null),
				"sap.ui.core.util.XMLPreprocessor");
	}

	/**
	 * Checks that our XMLPreprocessor works as expected on the given view content. If called on a
	 * <code>this</code> (which MUST be either a sandbox or a log mock), the view content is
	 * automatically searched for constant test conditions and appropriate warnings are expected;
	 * log output is stubbed in order to keep console clean. Makes sure there are no unexpected
	 * warnings or even errors.
	 *
	 * TODO replace "this" by additional first argument!
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
			if (oLogMock) {
				oLogMock.expects("error").never();
				oLogMock.expects("warning").never();
				aViewContent.forEach(function (sLine) {
					if (/if test="(false|true|\{= false \})"/.test(sLine)) {
						warn(oLogMock, sinon.match(/\[ \d\] Constant test condition/), sLine);
					}
				});
			}
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
	 * view content. Expects the error to be logged additionally.
	 *
	 * BEWARE: Call via <code>checkError.call(this, ...)</code> so that <code>this</code> is a
	 * Sinon sandbox! Or pass a log mock as this.
	 *
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
	function checkError(aViewContent, sExpectedMessage, mSettings, vOffender) {
		var oLogMock = this.expects ? this : this.mock(jQuery.sap.log),
			oViewContent = xml(aViewContent);

		if (vOffender === undefined || typeof vOffender === "number") {
			vOffender = aViewContent[vOffender || 1];
		}
		sExpectedMessage = sExpectedMessage.replace("{0}", vOffender);
		oLogMock.expects("error").withExactArgs(matchArg(sExpectedMessage), "qux",
			"sap.ui.core.util.XMLPreprocessor");

		try {
			process(oViewContent, mSettings);
			ok(false);
		} catch (ex) {
			strictEqual(
				normalizeXml(ex.message),
				normalizeXml("qux: " + sExpectedMessage),
				ex.stack
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
	 * Sinon sandbox! Or pass a log mock as this.
	 *
	 * @param {boolean} bDebug
	 *   whether debug output is accepted and expected (sets the log level accordingly)
	 * @param {object[]} aExpectedMessages
	 *   a array of expected debug messages with the message in <code>m</code> and optional details
	 *   in <code>d</code>. <code>m</code> may also contain a Sinon matcher, <code>d</code> a
	 *   number which is interpreted as index into <code>aViewContent</code>.
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
		var oLogMock = this.expects ? this : this.mock(jQuery.sap.log);

		oLogMock.expects("debug").never();
		oLogMock.expects("error").never();
		oLogMock.expects("warning").never();
		if (!bDebug) {
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.WARNING);
		} else {
			aExpectedMessages.forEach(function (oExpectedMessage) {
				var vExpectedDetail = oExpectedMessage.d;
				if (typeof vExpectedDetail === "number") {
					vExpectedDetail = matchArg(aViewContent[vExpectedDetail]);
				}
				oLogMock.expects("debug")
					.withExactArgs(matchArg(oExpectedMessage.m), vExpectedDetail, sComponent);
			});
		}

		check.call(oLogMock, aViewContent, mSettings, vExpected);
	}

	/**
	 * Checks that the XML preprocessor throws the expected error message when called on the given
	 * view content. Determines the offending content by <code>id="unexpected"</code>.
	 *
	 * BEWARE: Call via <code>unexpected(this, ...)</code> so that <code>this</code> is a
	 * Sinon sandbox! Or pass a log mock as this.
	 *
	 * @param {string[]} aViewContent
	 *   view content as separate lines
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

		checkError.call(this, aViewContent, sExpectedMessage, undefined, iUnexpected);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.core.util.XMLPreprocessor", {
		beforeEach : function () {
			this.oCustomizingConfiguration = sap.ui.core.CustomizingConfiguration;
			// do not rely on ERROR vs. DEBUG due to minified sources
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
		},
		afterEach : function () {
			sap.ui.core.CustomizingConfiguration = this.oCustomizingConfiguration;
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
		[false, true].forEach(function (bWarn) {
			var aViewContent = oFixture.aViewContent;

			QUnit.test(aViewContent[1] + ", warn = " + bWarn, function () {
				var oLogMock = this.mock(jQuery.sap.log);

				if (!bWarn) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}

				check.call(oLogMock, aViewContent);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("XML with template:if test='true'", function () {
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
	[false, true].forEach(function (bWarn) {
		QUnit.test("Warnings w/o debug output log caller, warn = " + bWarn, function () {
			var oLogMock = this.mock(jQuery.sap.log);

			// no debug output --> caller information should be logged once
			jQuery.sap.log.setLevel(bWarn
				? jQuery.sap.log.Level.WARNING
				: jQuery.sap.log.Level.ERROR);
			warn(oLogMock, "Warning(s) during processing of qux")
				.exactly(bWarn ? 1 : 0);

			check.call(oLogMock, [
				mvcView(),
				'<template:if test="true"/>', // 1st warning
				'<template:if test="true"/>', // 2nd warning
				'</mvc:View>'
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("XML with multiple template:if", function () {
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
	QUnit.test("XML with nested template:if (as last child)", function () {
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
	QUnit.test("XML with nested template:if (as inner child)", function () {
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
		QUnit.test("XML with template:if test='{/flag}', truthy, flag = " + oFlag, function () {
			check.call(this, [
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
		QUnit.test("XML with template:if test='{/flag}', falsy, flag = " + oFlag, function () {
			check.call(this, [
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
		QUnit.test("XML with template:if test='{flag}', truthy, flag = " + oFlag, function () {
			var oModel = new sap.ui.model.json.JSONModel({flag: oFlag});

			check.call(this, [
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
	QUnit.test("XML with template:if test='{formatter:...}'", function () {
		window.foo = {
			Helper: {
				not: function (oRawValue) {
					return !oRawValue;
				}
			}
		};
		check.call(this, [
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
		],
		aDebugMessages : [
			{m: "[ 0] Start processing qux"},
			{m: "[ 1] test == undefined --> false", d: 1},
			{m: "[ 1] Finished", d: 3},
			{m: "[ 0] Finished processing qux"}
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

			QUnit.test(aViewContent[1] + ", exception in formatter, warn = " + bWarn, function () {
				var oError = new Error("deliberate failure"),
					oLogMock = this.mock(jQuery.sap.log);

				this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
					.never();
				this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
				if (!bWarn) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}
				warn(oLogMock,
						sinon.match(/\[ \d\] Error in formatter: Error: deliberate failure/),
						aViewContent[1])
					.exactly(bWarn ? 1 : 0); // do not construct arguments in vain!

				window.foo = {
					Helper: {
						fail: function (oRawValue) {
							throw oError;
						}
					}
				};

				if (bWarn && oFixture.aDebugMessages) {
					checkTracing.call(oLogMock, true, oFixture.aDebugMessages, aViewContent, {
						models: new sap.ui.model.json.JSONModel({flag: true})
					}, vExpected);
				} else {
					check.call(oLogMock, aViewContent, {
						models: new sap.ui.model.json.JSONModel({flag: true})
					}, vExpected);
				}
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

			QUnit.test(aViewContent[1] + ", warn = " + bWarn, function () {
				var oLogMock = this.mock(jQuery.sap.log);

				this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
					.never();
				this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
				if (!bWarn) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}
				warn(oLogMock,
						oFixture.sMessage || sinon.match(/\[ \d\] Binding not ready/),
						aViewContent[1])
					.exactly(bWarn ? 1 : 0); // do not construct arguments in vain!

				check.call(oLogMock, aViewContent, {
					models: new sap.ui.model.json.JSONModel()
				}, vExpected);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Do not process nested template:ifs if not necessary", function () {
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
	QUnit.test("XML with template:if test='false' and template:then", function () {
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
	QUnit.test("XML with template:if test='true' and template:then", function () {
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
	QUnit.test("XML with nested template:if test='true' and template:then", function () {
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
	QUnit.test("XML with template:if test='true' and template:then/else", function () {
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
	QUnit.test("XML with template:if test='false' and template:then/else", function () {
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
	QUnit.test("XML with nested template:if test='true' and template:then/else",
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
		QUnit.test("Unexpected tags (" + i + ")", function () {
			unexpected.call(this, aViewContent, "Unexpected tag {0}");
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
		QUnit.test("Expected <template:else>, but instead saw... (" + i + ")", function () {
			unexpected.call(this, aViewContent,
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
		QUnit.test("Expected </t:if>, but instead saw... (" + i + ")", function () {
			unexpected.call(this, aViewContent, "Expected </t:if>, but instead saw {0}");
		});
	});

	//*********************************************************************************************
	QUnit.test('<template:elseif>: if is true', function () {
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
	QUnit.test('<template:elseif>: all false, w/ else', function () {
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
	QUnit.test('<template:elseif>: all false, w/o else', function () {
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
	QUnit.test('<template:elseif>: elseif is true', function () {
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
	QUnit.test("binding resolution", function () {
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

		check.call(this, [
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
			'<!-- some comment node -->',
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
	[false, true].forEach(function (bDebug) {
		QUnit.test("binding resolution: interface to formatter, debug = " + bDebug, function () {
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
			 * Check interface.
			 *
			 * @param {object} oInterface
			 * @param {string} sExpectedPath
			 */
			function checkInterface(oInterface, sExpectedPath) {
				throws(function () {
					oInterface.getInterface();
				}, /Missing path/);
				throws(function () {
					oInterface.getInterface(0);
				}, /Not the root formatter of a composite binding/);
				strictEqual(oInterface.getInterface("String").getPath(),
					sExpectedPath + "/String");
				strictEqual(oInterface.getInterface("/absolute/path").getPath(), "/absolute/path");
				strictEqual(oInterface.getInterface("/absolute").getInterface("path").getPath(),
					"/absolute/path");

				strictEqual(oInterface.getModel(), oModel);
				strictEqual(oInterface.getPath(), sExpectedPath);
				//TODO getPath("foo/bar")? Note: getPath("/absolute/path") does not make sense!

				strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
				throws(function () {
					oInterface.getSetting("bindingContexts");
				}, /Illegal argument: bindingContexts/);
				throws(function () {
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
				var fnCreateBindingContext,
					oInterface2Part,
					oModel = oInterface.getModel(i);

				// interface to ith part
				oInterface2Part = oInterface.getInterface(i);

				// Note: methods of oInterface2Part will ignore a further index like 42
				// just like they always did except for the root formatter of a
				// composite binding
				strictEqual(oInterface2Part.getModel(), oModel);
				strictEqual(oInterface2Part.getModel(42), oModel);
				strictEqual(oInterface2Part.getPath(), oInterface.getPath(i));
				strictEqual(oInterface2Part.getPath(42), oInterface.getPath(i));

				throws(function () {
					oInterface2Part.getInterface();
				}, /Missing path/);
				throws(function () {
					oInterface2Part.getInterface(0);
				}, /Not the root formatter of a composite binding/);
				strictEqual(oInterface2Part.getInterface(undefined, "foo/bar").getPath(),
					oInterface.getPath(i) + "/foo/bar");
				strictEqual(oInterface2Part.getInterface("foo/bar").getPath(),
					oInterface.getPath(i) + "/foo/bar");
				strictEqual(oInterface2Part.getInterface("foo").getInterface("bar").getPath(),
					oInterface.getPath(i) + "/foo/bar");
				strictEqual(oInterface2Part.getInterface(undefined, "/absolute/path").getPath(),
					"/absolute/path");
				strictEqual(oInterface2Part.getInterface("/absolute/path").getPath(),
					"/absolute/path");

				strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
				throws(function () {
					oInterface.getSetting("bindingContexts");
				}, /Illegal argument: bindingContexts/);
				throws(function () {
					oInterface.getSetting("models");
				}, /Illegal argument: models/);

				// drill-down into ith part relatively
				oInterface2Part = oInterface.getInterface(i, "String");

				strictEqual(oInterface2Part.getModel(), oModel);
				strictEqual(oInterface2Part.getPath(), oInterface.getPath(i) + "/String");
				strictEqual(oInterface2Part.getSetting("bindTexts"), true, "settings");

				try {
					fnCreateBindingContext
						= sinon.spy(oModel, "createBindingContext");

					// "drill-down" into ith part with absolute path
					oInterface2Part = oInterface.getInterface(i, "/absolute/path");

					strictEqual(oInterface2Part.getModel(), oModel);
					strictEqual(oInterface2Part.getPath(), "/absolute/path");
					strictEqual(oInterface2Part.getSetting("bindTexts"), true, "settings");
					strictEqual(fnCreateBindingContext.callCount, 1,
						fnCreateBindingContext.printf("%C"));
				} finally {
					fnCreateBindingContext.restore();
				}

				try {
					// simulate a model which creates the context asynchronously
					fnCreateBindingContext
						= sinon.stub(oModel, "createBindingContext");

					oInterface2Part = oInterface.getInterface(i, "String");

					ok(false, "getInterface() MUST throw error for async contexts");
				} catch (e) {
					strictEqual(e.message,
						"Model could not create binding context synchronously: " + oModel);
				} finally {
					fnCreateBindingContext.restore();
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
						throws(function () {
							oInterface.getInterface();
						}, /Invalid index of part: undefined/);
						throws(function () {
							oInterface.getInterface(-1);
						}, /Invalid index of part: -1/);
						strictEqual(oInterface.getModel(), undefined, "exactly as documented");
						strictEqual(oInterface.getPath(), undefined, "exactly as documented");

						// "probe for the smallest non-negative integer"
						// access both getModel and getPath to test robustness
						for (i = 0; oInterface.getModel(i) || oInterface.getPath(i); i += 1) {
							checkInterfaceForPart(oInterface, i);

							aResult.push(formatLabelOrValue(
								oInterface.getModel(i).getProperty(oInterface.getPath(i))
							));
						}

						throws(function () {
							oInterface.getInterface(i);
						}, new RegExp("Invalid index of part: " + i));
						strictEqual(oInterface.getModel(i), undefined, "exactly as documented");
						strictEqual(oInterface.getPath(i), undefined, "exactly as documented");
						return aResult.join(" ");
					}
				} catch (e) {
					ok(false, e.stack || e);
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
				strictEqual(arguments.length, 1);
			}
			other.requiresIContext = "ignored";

			window.foo = {
				Helper: {
					formatParts: formatParts,
					help: help,
					other: other
				}
			};

			checkTracing.call(this, bDebug, [
				{m: "[ 0] Start processing qux"},
				{m: "[ 0] undefined = /somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"},
				{m: "[ 0] Removed attribute text", d: 1},
				{m: "[ 0] text = Customer", d: 2},
				{m: "[ 0] text = Value: {CustomerName}", d: 3},
				{m: "[ 0] text = Customer: {CustomerName}", d: 4},
				{m: "[ 0] Binding not ready for attribute text", d: 5},
				{m: "[ 0] text = [Customer] {CustomerName}", d: 6},
				{m: "[ 0] text = [Customer]", d: 7},
				{m: "[ 0] Finished processing qux"}
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
				models: oModel,
				bindingContexts: oModel.createBindingContext(
						"/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"),
				bindTexts: true
			}, [
				'<Text/>',
				'<Text text="Customer"/>',
				'<Text text="Value: {CustomerName}"/>',
				'<Text text="Customer: {CustomerName}"/>',
				'<Text text="{unrelated&gt;/some/path}"/>',
				'<Text text="[Customer] {CustomerName}"/>',
				'<Text text="[Customer]"/>'
			]);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		QUnit.test("binding resolution, exception in formatter, debug = " + bDebug, function () {
			var oError = new Error("deliberate failure");

			window.foo = {
					Helper: {
						fail: function (oRawValue) {
							throw oError;
						}
					}
				};

			checkTracing.call(this, bDebug, [
				{m: "[ 0] Start processing qux"},
				{m: sinon.match(/\[ 0\] Error in formatter: Error: deliberate failure/), d: 1},
				{m: sinon.match(/\[ 0\] Error in formatter: Error: deliberate failure/), d: 2},
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
	QUnit.test("template:with", function () {
		check.call(this, [
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
		QUnit.test("template:with and 'named context', has helper = " + bHasHelper, function () {
			window.foo = {
				Helper : {
					help : function () {} // empty helper must not make any difference
				}
			};
			check.call(this, [
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
	QUnit.test("template:with and 'named context', missing variable name", function () {
		checkError.call(this, [
			mvcView(),
			'<template:with path="/unused" var=""/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	//*********************************************************************************************
	QUnit.test("template:with and 'named context', missing model", function () {
		checkError.call(this, [
			mvcView(),
			'<template:with path="some>random/path" var="path"/>', // "some" not defined here!
			'</mvc:View>'
		], "Missing model 'some' in {0}");
	});

	//*********************************************************************************************
	QUnit.test("template:with and 'named context', missing context", function () {
		checkError.call(this, [
			mvcView(),
			'<template:with path="some/random/place" var="place"/>',
			'</mvc:View>'
		], "Cannot resolve path for {0}", {
			models: new sap.ui.model.json.JSONModel()
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWithVar) {
		QUnit.test("template:with and helper, with var = " + bWithVar, function () {
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
			check.call(this, [
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
		QUnit.test("template:with and helper changing the model, with var = " + bWithVar, function () {
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
			check.call(this, [
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
		QUnit.test("template:with and helper = " + fnHelper, function () {
			window.foo = fnHelper;
			checkError.call(this, [
				mvcView(),
				'<template:with path="/unused" var="target" helper="foo"/>',
				'</mvc:View>'
			], "Cannot resolve helper for {0}", {
				models: new sap.ui.model.json.JSONModel()
			});
		});
	});

	//*********************************************************************************************
	QUnit.test('<template:with helper=".">', function () {
		checkError.call(this, [
			mvcView(),
			'<template:with path="/unused" var="target" helper="."/>',
			'</mvc:View>'
		], "Cannot resolve helper for {0}", {
			models: new sap.ui.model.json.JSONModel()
		});
	});

	//*********************************************************************************************
	[true, ""].forEach(function (vResult) {
		QUnit.test("template:with and helper returning " + vResult, function () {
			window.foo = function () {
				return vResult;
			};
			checkError.call(this, [
				mvcView(),
				'<template:with path="/unused" var="target" helper="foo"/>',
				'</mvc:View>'
			], "Illegal helper result '" + vResult + "' in {0}", {
				models: new sap.ui.model.json.JSONModel()
			});
		});
	});

	//*********************************************************************************************
	QUnit.test('template:with repeated w/ same variable and value', function () {
		var oLogMock = this.mock(jQuery.sap.log),
			oModel = new sap.ui.model.json.JSONModel(),
			sTemplate1 = '<template:with path="bar>/my/path" var="bar"/>',
			sTemplate2 = '<template:with path="bar>bla" helper="foo"/>',
			sTemplate3 = '<template:with path="bar>/my/path"/>';

		window.foo = function () {
			return "/my/path";
		};

		warn(oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate1);
		warn(oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate2);
		warn(oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate3);

		check.call(oLogMock, [
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
	QUnit.test("template:repeat w/o named models", function () {
		check.call(this, [
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
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat, startIndex & length", function () {
		check.call(this, [
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
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat with named models", function () {
		check.call(this, [
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
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test('template:repeat w/o list', function () {
		checkError.call(this, [
			mvcView(),
			'<template:repeat/>',
			'</mvc:View>'
		], "Missing binding for {0}");
	});

	//*********************************************************************************************
	QUnit.test('template:repeat list="no binding"', function () {
		checkError.call(this, [
			mvcView(),
			'<template:repeat list="no binding"/>',
			'</mvc:View>'
		], "Missing binding for {0}");
	});

	//*********************************************************************************************
	QUnit.test('template:repeat list="{unknown>foo}"', function () {
		checkError.call(this, [
			mvcView(),
			'<template:repeat list="{unknown>foo}"/>',
			'</mvc:View>'
		], "Missing model 'unknown' in {0}");
	});

	//*********************************************************************************************
	QUnit.test('template:repeat list="{/unsupported/path}"', function () {
		//TODO is this the expected behavior? the loop has no iterations and that's it?
		// Note: the same happens with a relative path if there is no binding context for the model
		check.call(this, [
			mvcView(),
			'<template:repeat list="{/unsupported/path}"/>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel()
		});
	});

	//*********************************************************************************************
	QUnit.test("template:repeat w/ complex binding and model", function () {
		check.call(this, [
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
			'<In src="C"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat nested", function () {
		check.call(this, [
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
			'<In src="B2"/>'
		]);
	});

	//*********************************************************************************************
	QUnit.test("template:repeat with loop variable", function () {
		check.call(this, [
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
	QUnit.test("template:repeat with missing loop variable", function () {
		checkError.call(this, [
			mvcView(),
			'<template:repeat var="" list="{/unused}"/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	//*********************************************************************************************
	QUnit.test("fragment support incl. template:require", function () {
		var sModuleName = "sap.ui.core.sample.ViewTemplate.scenario.Helper",
			sInElement = '<In xmlns="sap.ui.core"'
			+ ' xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"'
			+ ' template:require="' + sModuleName + '"/>';

		this.mock(jQuery.sap).expects("require").on(jQuery.sap).withExactArgs(sModuleName);
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml([sInElement]));
		check.call(this, [
				mvcView(),
				'<Fragment fragmentName="myFragment" type="XML">',
				'<template:error />', // this must not be processed!
				'</Fragment>',
				'</mvc:View>'
			], {}, [
				sInElement
			]);
	});

	//*********************************************************************************************
	QUnit.test("dynamic fragment names", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.withExactArgs("dynamicFragmentName", "fragment")
			.returns(xml(['<In xmlns="sap.ui.core"/>']));
		check.call(this, [
				mvcView(),
				'<Fragment fragmentName="{= \'dynamicFragmentName\' }" type="XML"/>',
				'</mvc:View>'
			], {}, [
				'<In />'
			]);
	});

	//*********************************************************************************************
	QUnit.test("fragment with FragmentDefinition incl. template:require", function () {
		var oExpectation = this.mock(jQuery.sap).expects("require"),
			aModuleNames = [
				"foo.Helper",
				"sap.ui.core.sample.ViewTemplate.scenario.Helper",
				"sap.ui.model.odata.AnnotationHelper"
			];

		// Note: jQuery.sap.require() supports "varargs" style
		oExpectation.on(jQuery.sap).withExactArgs.apply(oExpectation, aModuleNames);

		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml(['<FragmentDefinition xmlns="sap.ui.core" xmlns:template='
							+ '"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"'
							+ ' template:require="' + aModuleNames.join(" ") + '">',
						'<In id="first"/>',
						'<In id="last"/>',
						'</FragmentDefinition>']));
		check.call(this, [
				mvcView(),
				'<Fragment fragmentName="myFragment" type="XML"/>',
				'</mvc:View>'
			], {}, [
				'<In id="first"/>',
				'<In id="last"/>'
			]);
	});

	//*********************************************************************************************
	QUnit.test("fragment in repeat", function () {
		var oXMLTemplateProcessorMock = this.mock(sap.ui.core.XMLTemplateProcessor);

		// BEWARE: use fresh XML document for each call because liftChildNodes() makes it empty!
		// load template is called only once, because it is cached
		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml(['<In xmlns="sap.ui.core" src="{src}" />']));

		check.call(this, [
			mvcView(),
			'<template:repeat list="{/items}">',
			'<Fragment fragmentName="myFragment" type="XML"/>',
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
	QUnit.test("fragment with type != XML", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
		check.call(this, [
				mvcView(),
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>',
				'</mvc:View>'
			], {}, [
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>'
			]);
	});

	//*********************************************************************************************
	QUnit.test("error on fragment with simple cyclic reference", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.once() // no need to load the fragment in vain!
			.withExactArgs("cycle", "fragment")
			.returns(xml(['<Fragment xmlns="sap.ui.core" fragmentName="cycle" type="XML"/>']));

		checkError.call(this, [
				mvcView(),
				'<Fragment fragmentName="cycle" type="XML"/>',
				'</mvc:View>'
			], "Cyclic reference to fragment 'cycle' {0}");
	});

	//*********************************************************************************************
	QUnit.test("error on fragment with ping pong cyclic reference", function () {
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
			oLogMock = this.mock(jQuery.sap.log),
			oXMLTemplateProcessorMock = this.mock(sap.ui.core.XMLTemplateProcessor);

		warn(oLogMock, "[ 6] Set unchanged path: /foo", aFragmentContent[1]);
		warn(oLogMock, "[ 7] Set unchanged path: /bar", aFragmentContent[2]);

		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("A", "fragment")
			.returns(xml(aFragmentContent));
		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("B", "fragment")
			.returns(xml(['<Fragment xmlns="sap.ui.core" fragmentName="A" type="XML"/>']));

		checkError.call(oLogMock, [
				mvcView(),
				'<Fragment fragmentName="A" type="XML"/>',
				'</mvc:View>'
			], "Cyclic reference to fragment 'B' {0}", {
				models: new sap.ui.model.json.JSONModel()
			}, aFragmentContent[3]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDebug) {
		QUnit.test("tracing, debug=" + bDebug, function () {
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
						Value: { Path: "A"}
					}, {
						Value: { Path: "B"}
					}, {
						Value: { Path: "C"}
					}]
				}),
				oBazModel = new sap.ui.model.json.JSONModel({}),
				oLogMock = this.mock(jQuery.sap.log),
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
				warn(oLogMock, "Warning(s) during processing of qux");
			}
			warn(oLogMock, '[ 0] Binding not ready', aViewContent[19]);
			this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
				.returns(xml(['<FragmentDefinition xmlns="sap.ui.core">',
					'<In src="fragment"/>',
					'</FragmentDefinition>']));
			// debug output for dynamic names must still appear!
			delete sap.ui.core.CustomizingConfiguration;

			checkTracing.call(oLogMock, bDebug, [
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
				{m: "[ 0] name = dynamicName", d: 18},
				{m: "[ 0] Binding not ready for attribute name", d: 19},
				{m: "[ 0] Finished processing qux"}
			], aViewContent, {
				models: { bar: oBarModel, baz: oBazModel },
				bindingContexts: {
					bar: oBarModel.createBindingContext(
							"/com.sap.vocabularies.UI.v1.HeaderInfo/Title"),
					baz: oBazModel.createBindingContext("/")
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
	QUnit.test("<ExtensionPoint>: no (supported) configuration", function () {
		var oCustomizingConfigurationMock = this.mock(sap.ui.core.CustomizingConfiguration),
			oLogMock = this.mock(jQuery.sap.log);

		function checkNoReplacement() {
			check.call(oLogMock, [
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
		}

		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();

		[
			undefined,
			{className : "sap.ui.core.Fragment", type : "JSON"},
			{className : "sap.ui.core.mvc.View", type : "XML"}
		].forEach(function (oViewExtension) {
			oCustomizingConfigurationMock.expects("getViewExtension")
				.withExactArgs("this.sViewName", "myExtensionPoint", "this._sOwnerId")
				.returns(oViewExtension);
			checkNoReplacement();
		});

		delete sap.ui.core.CustomizingConfiguration;
		checkNoReplacement();
	});

	//*********************************************************************************************
	["outerExtensionPoint", "{:= 'outerExtensionPoint' }"].forEach(function (sName) {
		QUnit.test("<ExtensionPoint name='" + sName + "'>: XML fragment configured", function () {
			var oCustomizingConfigurationMock = this.mock(sap.ui.core.CustomizingConfiguration),
				oLogMock = this.mock(jQuery.sap.log),
				aOuterReplacement = [
					'<template:if test="true" xmlns="sap.ui.core" xmlns:template='
						+ '"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"'
						+ ' template:require="foo.Helper bar.Helper">',
					'<ExtensionPoint name="outerReplacement"/>',
					'</template:if>'
				],
				oXMLTemplateProcessorMock = this.mock(sap.ui.core.XMLTemplateProcessor);

			// <ExtensionPoint name="outerExtensionPoint">
			oCustomizingConfigurationMock.expects("getViewExtension")
				.withExactArgs("this.sViewName", "outerExtensionPoint", "this._sOwnerId")
				.returns({
					className : "sap.ui.core.Fragment",
					fragmentName : "acme.OuterReplacement",
					type : "XML"
				});
			oXMLTemplateProcessorMock.expects("loadTemplate")
				.withExactArgs("acme.OuterReplacement", "fragment")
				.returns(xml(aOuterReplacement));
			// Note: mock result of loadTemplate() is not analyzed by check() method, of course
			warn(oLogMock, '[ 2] Constant test condition', aOuterReplacement[0]);
			this.mock(jQuery.sap).expects("require").on(jQuery.sap)
				.withExactArgs("foo.Helper", "bar.Helper");

			// <ExtensionPoint name="outerReplacement">
			// --> nothing configured, just check that it is processed
			oCustomizingConfigurationMock.expects("getViewExtension")
				.withExactArgs("acme.OuterReplacement", "outerReplacement", "this._sOwnerId");

			// <Fragment fragmentName="myFragment" type="XML"/>
			oXMLTemplateProcessorMock.expects("loadTemplate")
				.withExactArgs("myFragment", "fragment")
				.returns(xml([
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
			oXMLTemplateProcessorMock.expects("loadTemplate")
				.withExactArgs("acme.InnerReplacement", "fragment")
				.returns(xml([
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

			check.call(oLogMock, [
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
		});
	});

	QUnit.test("template:require - single module", function (assert) {
		var sModuleName = "sap.ui.core.sample.ViewTemplate.scenario.Helper",
			oRootElement = xml([
				mvcView().replace(">", ' template:require="' + sModuleName + '">'),
				'</mvc:View>'
			]);

		this.mock(jQuery.sap).expects("require").on(jQuery.sap).withExactArgs(sModuleName);

		process(oRootElement);
	});

	QUnit.test("template:require - multiple modules", function (assert) {
		var oExpectation = this.mock(jQuery.sap).expects("require"),
			aModuleNames = [
				"foo.Helper",
				"sap.ui.core.sample.ViewTemplate.scenario.Helper",
				"sap.ui.model.odata.AnnotationHelper"
			],
			oRootElement = xml([
				mvcView().replace(">", ' template:require="' + aModuleNames.join(" ") + '">'),
				'</mvc:View>'
			]);

		// Note: jQuery.sap.require() supports "varargs" style
		oExpectation.on(jQuery.sap).withExactArgs.apply(oExpectation, aModuleNames);

		process(oRootElement);
	});

	//*********************************************************************************************
	QUnit.test("template:alias", function () {
		var fnComplexParser = sap.ui.base.BindingParser.complexParser,
			fnGetObject = jQuery.sap.getObject;

		window.foo = {
			Helper: {
				bar: function () {
					ok(!this || !("bar" in this), "no jQuery.proxy(..., oScope) used");
					// return absolute path so this function serves as helper & formatter!
					return "/bar";
				},
				foo: function () {
					ok(!this || !("foo" in this), "no jQuery.proxy(..., oScope) used");
					return "/foo";
				}
			}
		};

		this.stub(jQuery.sap, "getObject", function (sName, iNoCreates, oContext) {
			strictEqual(iNoCreates, undefined, sName); // make sure we do not create namespaces!
			return fnGetObject.apply(this, arguments);
		});
		this.stub(sap.ui.base.BindingParser, "complexParser",
			function (s, o, b1, bTolerateFunctionsNotFound, bStaticContext) {
				strictEqual(bTolerateFunctionsNotFound, true, JSON.stringify(arguments));
				strictEqual(bStaticContext, true, JSON.stringify(arguments));
				return fnComplexParser.apply(this, arguments);
			}
		);

		// Note: <Label text="..."> remains unresolved, <Text text="..."> MUST be resolved
		check.call(this, [
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
			models: new sap.ui.model.json.JSONModel({/*don't care*/})
		}, [ // Note: XML serializer outputs &gt; encoding...
			"<Label text=\"{formatter: '.bar', path: '/'}\"/>",
			"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
				'<Text text="/bar"/>',
				"<Label text=\"{formatter: '.foo', path: '/'}\"/>",
					'<Text text="/foo"/>',
						'<Text text="/bar"/>',
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
		QUnit.test(sViewContent, function () {
			checkError.call(this, [
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
		QUnit.test('<template:alias name=".foo" ' + sValue + '>', function () {
			checkError.call(this, [
				mvcView(),
				'<template:alias name=".foo" ' + sValue + '/>',
				'</mvc:View>'
			], "Invalid value in {0}");
		});
	});
}());
//TODO we have completely missed support for unique IDs in fragments via the "id" property!
//TODO somehow trace ex.stack, but do not duplicate ex.message and take care of PhantomJS

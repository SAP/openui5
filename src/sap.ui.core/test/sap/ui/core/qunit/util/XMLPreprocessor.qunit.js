/*!
 * ${copyright}
 */
(function () {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	window */
	"use strict";

	jQuery.sap.require("jquery.sap.xml");
	jQuery.sap.require("sap.ui.core.CustomizingConfiguration");
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
	 * Calls our XMLPreprocessor on the given view content, identifying the caller as "qux"
	 * and passing "this._sOwnerId" as component ID and "this.sViewName" as (view) name.
	 *
	 * @param {Element} oViewContent
	 *   the original view content as an XML document element
	 * @param {object} [mSettings]
	 *   a settings object for the preprocessor
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
			// do not construct arguments in vain!
			.exactly(jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING) ? 1 : 0)
			.withExactArgs(matchArg(sExpectedWarning), vDetails || null,
				"sap.ui.core.util.XMLPreprocessor");
	}

	/**
	 * Checks that our XMLPreprocessor works as expected on the given view content. If called on a
	 * <code>this</code> (which MUST be either a sandbox or a log mock), the view content is
	 * automatically searched for constant test conditions and appropriate warnings are expected;
	 * log output is stubbed in order to keep console clean. Makes sure there are no unexpected
	 * warnings or even errors.
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
						warn(oLogMock, 'qux: Constant test condition in ' + sLine);
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
	 * Sinon sandbox! Or pass a log mock as this.
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
		var oLogMock = this.expects ? this : this.mock(jQuery.sap.log),
			sName;

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
					.exactly(oExpectedMessage.c || 1)
					.withExactArgs(matchArg(oExpectedMessage.m), vExpectedDetail, sComponent);
			});
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
		[false, true].forEach(function (bIsLoggable) {
			var aViewContent = oFixture.aViewContent;

			test(aViewContent[1] + ", warn = " + bIsLoggable, function () {
				var oLogMock = this.mock(jQuery.sap.log);

				if (!bIsLoggable) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}

				check.call(oLogMock, aViewContent);
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
		test("XML with template:if test='{/flag}', truthy, flag = " + oFlag, function () {
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
		test("XML with template:if test='{/flag}', falsy, flag = " + oFlag, function () {
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
		test("XML with template:if test='{flag}', truthy, flag = " + oFlag, function () {
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
	test("XML with template:if test='{formatter:...}'", function () {
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
		[false, true].forEach(function (bIsLoggable) {
			var aViewContent = oFixture.aViewContent,
				vExpected = oFixture.bAsIs ? [aViewContent[1]] : undefined;

			test(aViewContent[1] + ", exception in formatter, warn = " + bIsLoggable, function () {
				var oError = new Error("deliberate failure"),
					oLogMock = this.mock(jQuery.sap.log);

				this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
					.never();
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

				check.call(oLogMock, aViewContent, {
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
		[false, true].forEach(function (bIsLoggable) {
			var aViewContent = oFixture.aViewContent,
				vExpected = oFixture.vExpected && oFixture.vExpected.slice(),
				sMessage = (oFixture.sMessage || 'qux: Binding not ready in ') + aViewContent[1];

			test(aViewContent[1] + ", warn = " + bIsLoggable, function () {
				var oLogMock = this.mock(jQuery.sap.log);

				this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension")
					.never();
				this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
				if (!bIsLoggable) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
				}
				warn(oLogMock, sMessage)
					.exactly(bIsLoggable ? 1 : 0); // do not construct arguments in vain!

				check.call(oLogMock, aViewContent, {}, vExpected);
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
			'<Label text="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label\'}"/>',
			'<Text text="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value\'}"/>',
			'<Text text="{formatter: \'foo.Helper.nil\','
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
			'<Text text="{CustomerName}"/>',
			'<Text/>',
			'<Label text="A \\{ is a special character"/>',
			'<Text text="{unrelated&gt;/some/path}"/>',
			'<Text text="' + "{path:'/some/path',formatter:'.someMethod'}" + '"/>',
			// TODO is this the expected behaviour? And what about text nodes?
			'<html:img src="/coco/apps/main/img/Icons/product_48.png"/>'
		]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("binding resolution: interface to formatter, debug = " + bIsLoggable, function () {
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
			 * @returns {string}
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
						return formatLabelOrValue(vRawValue);
					} else {
						// root formatter for a composite binding
						aResult = [];
						strictEqual(oInterface.getModel(), undefined, "exactly as documented");
						strictEqual(oInterface.getPath(), undefined, "exactly as documented");

						// "probe for the smallest non-negative integer"
						// access both getModel and getPath to test robustness
						for (i = 0; oInterface.getModel(i) || oInterface.getPath(i); i += 1) {
							//TODO do we need oInterface.getContext(i, sRelativePath) for
							// convenience, e.g. to allow delegation to AnnotationHelper#format?
							aResult.push(formatLabelOrValue(
								oInterface.getModel(i).getProperty(oInterface.getPath(i))
							));
						}

						strictEqual(oInterface.getModel(i), undefined, "exactly as documented");
						strictEqual(oInterface.getPath(i), undefined, "exactly as documented");
						return aResult.join(" ");
					}
				} catch (e) {
					ok(false, e);
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

			checkTracing.call(this, bIsLoggable, [
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
		test("template:with and 'named context', has helper = " + bHasHelper, function () {
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
	test("template:repeat w/o named models", function () {
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
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat, startIndex & length", function () {
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
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat with named models", function () {
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
		check.call(this, [
			mvcView(),
			'<template:repeat list="{/unsupported/path}"/>',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel()
		});
	});

	//*********************************************************************************************
	test("template:repeat w/ complex binding and model", function () {
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
			'<In src="C"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat nested", function () {
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
			'<In src="B2"/>',
		]);
	});

	//*********************************************************************************************
	test("template:repeat with loop variable", function () {
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
	test("template:repeat with missing loop variable", function () {
		checkError([
			mvcView(),
			'<template:repeat var="" list="{/unused}"/>',
			'</mvc:View>'
		], "Missing variable name for {0}");
	});

	//*********************************************************************************************
	test("fragment support", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml(['<In xmlns="sap.ui.core"/>']));
		check.call(this, [
				mvcView(),
				'<Fragment fragmentName="myFragment" type="XML">',
				'<template:error />', // this must not be processed!
				'</Fragment>',
				'</mvc:View>'
			], {}, [
				'<In />'
			]);
	});

	//*********************************************************************************************
	test("dynamic fragment names", function () {
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
	test("fragment with FragmentDefinition", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml(['<FragmentDefinition xmlns="sap.ui.core">',
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
	test("fragment in repeat", function () {
		var oXMLTemplateProcessorMock = this.mock(sap.ui.core.XMLTemplateProcessor);

		// BEWARE: use fresh XML document for each call because liftChildNodes() makes it empty!
		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml(['<In xmlns="sap.ui.core" src="{src}" />']));
		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("myFragment", "fragment")
			.returns(xml(['<In xmlns="sap.ui.core" src="{src}" />']));
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
	test("fragment with type != XML", function () {
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();
		check.call(this, [
				mvcView(),
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>',
				'</mvc:View>'
			], {}, [
				'<Fragment fragmentName="nonXMLFragment" type="JS"/>',
			]);
	});

	//*********************************************************************************************
	test("error on fragment with simple cyclic reference", function () {
		var oLogMock = this.mock(jQuery.sap.log);

		oLogMock.expects("error")
			.withExactArgs('Stopped due to cyclic reference in fragment: cycle',
				sinon.match(/Error: Stopped due to cyclic fragment reference/),
				"sap.ui.core.util.XMLPreprocessor");

		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
			.once() // no need to load the fragment in vain!
			.withExactArgs("cycle", "fragment")
			.returns(xml(['<Fragment xmlns="sap.ui.core" fragmentName="cycle" type="XML"/>']));
		check.call(oLogMock, [
				mvcView(),
				'<Fragment fragmentName="cycle" type="XML"/>',
				'</mvc:View>'
			], {}, /Error: Stopped due to cyclic fragment reference/);
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
			oLogMock = this.mock(jQuery.sap.log),
			oXMLTemplateProcessorMock = this.mock(sap.ui.core.XMLTemplateProcessor);

		oLogMock.expects("error")
			.withExactArgs('Stopped due to cyclic reference in fragment: B',
				sinon.match(/Error: Stopped due to cyclic fragment reference/),
				"sap.ui.core.util.XMLPreprocessor");
		warn(oLogMock, "qux: Set unchanged path '/foo' in " + aFragmentContent[1]);
		warn(oLogMock, "qux: Set unchanged path '/bar' in " + aFragmentContent[2]);

		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("A", "fragment")
			.returns(xml(aFragmentContent));
		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("B", "fragment")
			.returns(xml(['<Fragment xmlns="sap.ui.core" fragmentName="A" type="XML"/>']));
		oXMLTemplateProcessorMock.expects("loadTemplate")
			.withExactArgs("A", "fragment")
			.returns(xml(aFragmentContent));

		check.call(oLogMock, [
				mvcView(),
				'<Fragment fragmentName="A" type="XML"/>',
				'</mvc:View>'
			], {
				models: new sap.ui.model.json.JSONModel()
			}, /Error: Stopped due to cyclic fragment reference/);
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

			warn(oLogMock, 'qux: Binding not ready in ' + aViewContent[19]);
			this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate")
				.returns(xml(['<FragmentDefinition xmlns="sap.ui.core">',
					'<In src="fragment"/>',
					'</FragmentDefinition>']));
			// debug output for dynamic names must still appear!
			delete sap.ui.core.CustomizingConfiguration;

			checkTracing.call(oLogMock, bIsLoggable, [
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
					baz: oBazModel.createBindingContext("/"),
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
	test("<ExtensionPoint>: no (supported) configuration", function () {
		var oCustomizingConfigurationMock = this.mock(sap.ui.core.CustomizingConfiguration);

		function checkNoReplacement() {
			check.call(this, [
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
					'</ExtensionPoint>',
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
		test("<ExtensionPoint name='" + sName + "'>: XML fragment configured", function () {
			var oCustomizingConfigurationMock = this.mock(sap.ui.core.CustomizingConfiguration),
				oLogMock = this.mock(jQuery.sap.log),
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
				.returns(xml([
					'<template:if test="true" xmlns="sap.ui.core" xmlns:template='
						+'"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">',
					'<ExtensionPoint name="outerReplacement"/>',
					'</template:if>'
				]));
			// Note: mock result of loadTemplate() is not analyzed by check() method, of course
			warn(oLogMock, 'qux: Constant test condition in <template:if test="true">');

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

	//*********************************************************************************************
	test("Legacy signature support", function () {
		var aViewContent = [
				mvcView(),
				'<template:if test="false">', // warning 'qux: Constant test condition in ...'
				'<Out/>',
				'<\/template:if>',
				'<ExtensionPoint name="myExtensionPoint">',
				'<In />',
				'</ExtensionPoint>',
				'<\/mvc:View>'
			],
			fnProcess = sap.ui.core.util.XMLPreprocessor.process;

		this.stub(sap.ui.core.util.XMLPreprocessor, "process",
			function (oRootElement, oViewInfo, mSettings) {
				// simulate call with legacy signature
				return fnProcess.call(this, oRootElement, mSettings, oViewInfo.caller);
			}
		);
		// Note: w/o proper oViewInfo, extension point replacement is not supported
		this.mock(sap.ui.core.CustomizingConfiguration).expects("getViewExtension").never();
		this.mock(sap.ui.core.XMLTemplateProcessor).expects("loadTemplate").never();

		check.call(this, aViewContent, {}, [
			'<ExtensionPoint name="myExtensionPoint">',
			'<In />',
			'</ExtensionPoint>',
		]);
	});

	//TODO we have completely missed support for unique IDs in fragments via the "id" property!
} ());

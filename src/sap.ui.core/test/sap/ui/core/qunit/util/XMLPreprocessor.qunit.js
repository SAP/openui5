/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	window */
	"use strict";

	jQuery.sap.require("jquery.sap.xml");
	jQuery.sap.require("sap.ui.core.util.XMLPreprocessor");

	// default error handler
	function onRejected(oError) {
		start(); // MUST be called before an assertion which fails!
		ok(false, oError);
	}

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
		return sXml
			// Note: IE > 8 does not add all namespace at root level, but deeper inside the tree!
			// Note: Chrome adds all namespaces at root level, but before other attributes!
			.replace(/ xmlns.*?=\".+?\"/g,"")
			// Note: browsers differ in whitespace for empty HTML(!) tags
			.replace(/ \/>/g,'/>');
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

		if (jQuery.isArray(vExpected)) {
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
					jQuery.each(oBindingInfo.parts || [], function (i, oInfoPart) {
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
	 * Checks that our XMLPreprocessor works as expected on the given view content.
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
		var oViewContent = xml(aViewContent),
			i;

		// setup
		if (!vExpected) { // derive expectations by smart filtering
			vExpected = [];
			for (i = 1; i < aViewContent.length - 1; i += 1) {
				// Note: <In> should really have some attributes to make sure they are kept!
				if (aViewContent[i].indexOf("<In ") === 0
					|| aViewContent[i] === "<!-- prevent empty tag -->") {
					vExpected.push(aViewContent[i]);
				}
			}
		}
		if (jQuery.isArray(vExpected)) {
			vExpected.unshift(aViewContent[0]); // 1st line is always in
			vExpected.push(aViewContent[aViewContent.length - 1]); // last line is always in
		}

		withBalancedBindAggregation(function () {
			withBalancedBindProperty(function () {
				// code under test
				strictEqual(
					sap.ui.core.util.XMLPreprocessor.process(oViewContent, mSettings || {}, "qux"),
					oViewContent);
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
			sap.ui.core.util.XMLPreprocessor.process(oViewContent, mSettings || {}, "qux");
			ok(false);
		} catch (ex) {
			strictEqual(ex.message, "qux: " + sExpectedMessage.replace("{0}", sOffender));
		}
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

		jQuery.each(aViewContent, function (i, sViewContent) {
			if (/id="unexpected"/.test(sViewContent)) {
				iUnexpected = i;
			}
		});

		checkError(aViewContent, sExpectedMessage, undefined, iUnexpected);
	}

	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	//*********************************************************************************************
	module("sap.ui.core.util.XMLPreprocessor", {
		teardown: function () {
			try {
				delete window.foo;
			} catch (e) {
				// IE 8 doesn't like this: "Object doesn't support this action"
				window.foo = undefined;
			}
		}
	});

	//*********************************************************************************************
	test("XML with template:if test='false'", function () {
		check([
			mvcView("t"),
			'<t:if test="false">',
			'<Out/>',
			'</t:if>',
			'<!-- prevent empty tag -->',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	jQuery.each([false, true], function (i, bIsLoggable) {
		test("template:if test='false', warn = " + bIsLoggable, function () {
			var aViewContent = [
					mvcView(),
					'<template:if test="false">',
					'<Out/>',
					'<\/template:if>',
					'<!-- prevent empty tag -->',
					'<\/mvc:View>'
				],
				oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs(
					'qux: Constant test condition in ' + aViewContent[1],
					null, "sap.ui.core.util.XMLPreprocessor");

			check(aViewContent);
		});
	});

	//*********************************************************************************************
	test("XML with template:if test='true'", function () {
		check([
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
		check([
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
		check([
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
		check([
			mvcView(),
			'<template:if test="true">',
			'<In id="true"/>',
			'<template:if test="false">',
			'<Out/>',
			'</template:if>',
			'<template:if test="false">', // this must also be processed, of course!
			'</template:if>',
			'</template:if>',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	// Note: "X" is really nothing special
	jQuery.each(["true", true, 1, "X"], function (i, oFlag) {
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
	jQuery.each(["false", false, 0, null, undefined, NaN, ""], function (i, oFlag) {
		test("XML with template:if test='{/flag}', falsy, flag = " + oFlag,
			function () {
				check([
					mvcView(),
					'<template:if test="{/flag}">',
					'<Out/>',
					'</template:if>',
					'<!-- prevent empty tag -->',
					'</mvc:View>'
				], {
					models: new sap.ui.model.json.JSONModel({flag: oFlag})
				});
			});
	});

	//*********************************************************************************************
	// Note: relative paths now!
	jQuery.each(["true", true, 1, "X"], function (i, oFlag) {
		asyncTest("XML with template:if test='{flag}', truthy, flag = " + oFlag,
			function () {
				var oModel = new sap.ui.model.json.JSONModel({flag: oFlag});

				oModel.createBindingContext("/", /*oContext*/null, /*mParameters*/null,
					function (oContext) {
						start();

						check([
							mvcView(),
							'<template:if test="{flag}">',
							'<In id="flag"/>',
							'</template:if>',
							'</mvc:View>'
						], {
							models: oModel, bindingContexts: oContext
						});
					}
				);
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
	jQuery.each([false, true], function (i, bIsLoggable) {
		test("template:if test='{formatter:...}', exception in formatter, warn = " + bIsLoggable,
			function () {
				var aViewContent = [
						mvcView(),
						'<template:if test="' + "{formatter: 'foo.Helper.fail', path:'/flag'}" + '">',
						'<Out/>',
						'</template:if>',
						'<!-- prevent empty tag -->',
						'</mvc:View>'
					],
					oError = new Error("deliberate failure"),
					oLogMock = this.mock(jQuery.sap.log);

				oLogMock.expects("isLoggable").once()
					.withExactArgs(jQuery.sap.log.Level.WARNING)
					.returns(bIsLoggable);
				oLogMock.expects("warning")
					.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
					.withExactArgs(
						'qux: Error in formatter of ' + aViewContent[1],
						oError, "sap.ui.core.util.XMLPreprocessor");

				window.foo = {
					Helper: {
						fail: function (oRawValue) {
							throw oError;
						}
					}
				};

				check(aViewContent, {
					models: new sap.ui.model.json.JSONModel({flag: true})
				});
			}
		);
	});

	//*********************************************************************************************
	jQuery.each([false, true], function (i, bIsLoggable) {
		test("template:if test='{unrelated>/some/path}', warn = " + bIsLoggable, function () {
			var aViewContent = [
					mvcView(),
					'<template:if test="' + "{unrelated>/some/path}" + '">',
					'<Out/>',
					'</template:if>',
					'<!-- prevent empty tag -->',
					'</mvc:View>'
				],
				oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs(
					'qux: Binding not ready in ' + aViewContent[1],
					null, "sap.ui.core.util.XMLPreprocessor");

			check(aViewContent);
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
		check([
			mvcView(),
			'<template:if test="false">',
			'<template:if test="{formatter: \'foo.Helper.forbidden\', path:\'/flag\'}"/>',
			'</template:if>',
			'<!-- prevent empty tag -->',
			'</mvc:View>'
		], {
			models: new sap.ui.model.json.JSONModel({flag: true})
		});
	});

	//*********************************************************************************************
	test("XML with template:if test='false' and template:then", function () {
		check([
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'</template:if>',
			'<!-- prevent empty tag -->',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	test("XML with template:if test='true' and template:then", function () {
		check([
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
		check([
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
		check([
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
		check([
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
			check([
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
	jQuery.each([[
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
	]], function (i, aViewContent) {
		test("Unexpected tags (" + i + ")", function () {
			unexpected(aViewContent, "Unexpected tag {0}");
		});
	});

	jQuery.each([[
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
	]], function (i, aViewContent) {
		test("Expected <template:else>, but instead saw... (" + i + ")", function () {
			unexpected(aViewContent,
				"Expected <template:elseif> or <template:else>, but instead saw {0}");
		});
	});

	jQuery.each([[
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
	]], function (i, aViewContent) {
		test("Expected </t:if>, but instead saw... (" + i + ")", function () {
			unexpected(aViewContent, "Expected </t:if>, but instead saw {0}");
		});
	});

	//*********************************************************************************************
	test('<template:elseif>: if is true', function () {
		check([
			mvcView(),
			'<template:if test="true">',
			'<template:then>',
			'<In id="true"/>',
			'</template:then>',
			'<template:elseif test="true">',
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
		check([
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
		check([
			mvcView(),
			'<template:if test="false">',
			'<template:then>',
			'<Out/>',
			'</template:then>',
			'<template:elseif test="false">',
			'<Out/>',
			'</template:elseif>',
			'</template:if>',
			'<!-- prevent empty tag -->',
			'</mvc:View>'
		]);
	});

	//*********************************************************************************************
	test('<template:elseif>: elseif is true', function () {
		check([
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
				}
			}
		};

		check([
			mvcView().replace(">", ' xmlns:html="http://www.w3.org/1999/xhtml">'),
			'<Label text="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label\'}"/>',
			'<Text text="{formatter: \'foo.Helper.help\','
				+ ' path: \'/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value\'}"/>',
			'<Text text="{unrelated>/some/path}"/>', // unrelated binding MUST NOT be changed!
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
			'<Text text="{unrelated&gt;/some/path}"/>',
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
		this.stub(jQuery.sap.log, "isLoggable").returns(true);
		this.mock(jQuery.sap.log).expects("debug").never();

		check([
			mvcView(),
			'<template:with'
				+ ' path="/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo">',
			'<Text text="{formatter: \'foo.Helper.other\', path: \'Title/Label\'}"/>',
			'<Text text="{formatter: \'foo.Helper.help\', path: \'Title/Label\'}"/>',
			'<Text text="Value: {formatter: \'foo.Helper.help\', path: \'Title/Value\'}"/>',
			'<Text text="{formatter: \'foo.Helper.help\', path: \'Title/Label\'}'
				+ ': {formatter: \'foo.Helper.help\', path: \'Title/Value\'}"/>',
			'</template:with>',
			'</mvc:View>'
		], {
			models: oModel,
			bindTexts: true
		}, [
			'<Text text="undefined"/>',
			'<Text text="Customer"/>',
			'<Text text="Value: {CustomerName}"/>',
			'<Text text="Customer: {CustomerName}"/>'
		]);
	});

	//*********************************************************************************************
	jQuery.each([false, true], function (i, bIsLoggable) {
		test("binding resolution, exception in formatter, debug = " + bIsLoggable, function () {
			var oError = new Error("deliberate failure"),
				oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable")
				.twice() // Note: default is once()
				.withExactArgs(jQuery.sap.log.Level.DEBUG)
				.returns(bIsLoggable);
			oLogMock.expects("debug")
				.exactly(bIsLoggable ? 2 : 0) // do not construct arguments in vain!
				.withExactArgs(
					sinon.match(/qux: Error in formatter of <In text=".*"\/>/),
					oError, "sap.ui.core.util.XMLPreprocessor");
			window.foo = {
					Helper: {
						fail: function (oRawValue) {
							throw oError;
						}
					}
				};

			check([
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
	jQuery.each([false, true], function (i, bHasHelper) {
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
	jQuery.each([false, true], function (i, bWithVar) {
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
	jQuery.each([false, true], function (i, bWithVar) {
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
	jQuery.each([undefined, {}], function (i, fnHelper) {
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
	jQuery.each([true, ""], function (i, vResult) {
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
			'<!-- prevent empty tag -->',
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
			{},
			new RegExp('<Fragment (fragmentName="nonXMLFragment" type="JS"'
				+ '|type="JS" fragmentName="nonXMLFragment")\/>')
			);
		oXMLTemplateProcessorMock.expects("loadTemplate").never();
	});

	//*********************************************************************************************
	test("error on fragment with simple cyclic reference", function () {
		var oLogMock = this.mock(jQuery.sap.log);

		oLogMock.expects("error")
			.once()
			.withExactArgs('Stopped due to cyclic reference in fragment cycle',
				sinon.match(/Error: Stopped due to cyclic fragment reference/),
				"sap.ui.core.util.XMLPreprocessor");

		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function () {
			return xml(['<Fragment xmlns="sap.ui.core" fragmentName="cycle" type="XML"/>']);
		});
		check([
				mvcView(),
				'<Fragment fragmentName="cycle" type="XML"/>',
				'</mvc:View>'
			],
			{},
			/Error: Stopped due to cyclic fragment reference/
			);
	});

	//*********************************************************************************************
	test("error on fragment with ping pong cyclic reference", function () {
		this.stub(sap.ui.core.XMLTemplateProcessor, "loadTemplate", function (sTemplateName) {
			if (sTemplateName === "A") {
				return xml(['<Fragment xmlns="sap.ui.core" fragmentName="B" type="XML"/>']);
			}
			return xml(['<Fragment xmlns="sap.ui.core" fragmentName="A" type="XML"/>']);
		});
		check([
				mvcView(),
				'<Fragment fragmentName="A" type="XML"/>',
				'</mvc:View>'
			],
			{},
			/Error: Stopped due to cyclic fragment reference/
			);
	});
} ());


/* global QUnit, TestControlRenderer */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/RenderManager",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/ui/core/IconPool",
	"sap/ui/core/UIArea",
	"sap/ui/thirdparty/jquery",
	"sap/base/security/encodeXML",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/Log",
	"sap/ui/core/Configuration"
], function(
	Device,
	Control,
	Core,
	RenderManager,
	Element,
	HTML,
	IconPool,
	UIArea,
	jQuery,
	encodeXML,
	createAndAppendDiv,
	nextUIUpdate,
	Log,
	Configuration
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["area1", "area2", "area3", "area4", "area5", "area6", "area7", "area8"], createAndAppendDiv("testArea"));
	createAndAppendDiv("area9");


	var fnCheckRendererInterface = null;

	function jQueryById(id) {
		return new jQuery(document.getElementById(id));
	}

	//Declare a simple test controls

	var TestControl = Control.extend("TestControl", {
		renderer: {
			render: function(oRM, oControl) {
				oRM.write("<div");
				oRM.writeControlData(oControl);
				TestControlRenderer.doAdditionalThings(oRM, oControl);
				oRM.write(">[" + oControl.getId() + "]</div>");

				if (fnCheckRendererInterface) {
					fnCheckRendererInterface(oRM);
				}
			},
			doAdditionalThings: function(oRM, oControl) {}
		},

		onBeforeRendering: function() {
			if (this.doBeforeRendering) {
				this.doBeforeRendering();
			}
		},

		onAfterRendering: function() {
			if (this.doAfterRendering) {
				this.doAfterRendering();
			}
		}
	});

	var ACCTestControl = TestControl.extend("ACCTestControl", {
		metadata: {
			properties: {
				"editable": {
					type: "boolean",
					defaultValue: true
				},
				"enabled": {
					type: "boolean",
					defaultValue: true
				},
				"visible": {
					type: "boolean",
					defaultValue: true
				},
				"required": {
					type: "boolean",
					defaultValue: false
				},
				"selected": {
					type: "boolean",
					defaultValue: false
				},
				"checked": {
					type: "boolean",
					defaultValue: false
				},
				"other": {
					type: "string",
					defaultValue: "Value"
				}
			},
			associations: {
				"ariaDescribedBy": {
					type: "sap.ui.core.Element",
					multiple: true
				},
				"ariaLabelledBy": {
					type: "sap.ui.core.Element",
					multiple: true
				}
			}
		},

		renderer: "TestControlRenderer"
	});

	//Test helper functions

	function checkRendering(assert, aControls, sTargetId, bExpectExisting, fnActionCallBack, sOldParentId) {
		return new Promise(function(done) {
			var iBeforeCounter = 0;
			var iAfterCounter = 0;

			var fBefore = function() {
				iBeforeCounter++;
			};

			var fAfter = function() {
				iAfterCounter++;
			};

			for (var i = 0; i < aControls.length; i++) {
				aControls[i].doBeforeRendering = fBefore;
				aControls[i].doAfterRendering = fAfter;
			}

			checkControlsInDom(assert, aControls, sOldParentId ? sOldParentId : sTargetId, bExpectExisting);

			fnActionCallBack(jQueryById(sTargetId).get(0), aControls);

			assert.equal(iBeforeCounter, aControls.length, "onBeforeRendering should be called");

			checkControlsInDom(assert, aControls, sTargetId, true);

			if (Device.browser.safari) {
				//in safari async because onAfterRendering ist called with delay
				var delayedCall = function() {
					assert.equal(iAfterCounter, aControls.length, "onAfterRendering should be called");
					for (var i = 0; i < aControls.length; i++) {
						aControls[i].doBeforeRendering = null;
						aControls[i].doAfterRendering = null;
					}
					done();
				};
				setTimeout(delayedCall, 500);
			} else {
				assert.equal(iAfterCounter, aControls.length, "onAfterRendering should be called");
				for (var i = 0; i < aControls.length; i++) {
					aControls[i].doBeforeRendering = null;
					aControls[i].doAfterRendering = null;
				}
				done();
			}

		});

	}

	function getTestControlHtml(sId, sAdditionalHTML) {
		if (!sAdditionalHTML){
			sAdditionalHTML = "";
		}
		return "<div id=\"" + sId + "\" data-sap-ui=\"" + sId + "\" data-sap-ui-render=\"\"" + sAdditionalHTML + ">[" + sId + "]</div>";
	}

	function checkControlsInDom(assert, aControls, sTargetId, bExpectExisting) {
		for (var i = 0; i < aControls.length; i++) {
			var $ControlRef = aControls[i].$();
			if (bExpectExisting) {
				assert.equal($ControlRef.length, 1, "Control is rendered already");
				assert.equal($ControlRef.parent().attr("id"), sTargetId, "Control is child of Dom Ref with ID '" + sTargetId + "'");
			} else {
				assert.equal($ControlRef.length, 0, "Control is not rendered yet");
			}
		}
	}

	function checkChildOrder(assert, sParentId, aChildIds) {
		var $Children = jQueryById(sParentId).children();
		assert.equal(aChildIds.length, $Children.length, "Number of children of DOM node '" + sParentId + "'");
		for (var i = 0; i < aChildIds.length; i++) {
			assert.equal(aChildIds[i], jQuery($Children.get(i)).attr("id"), "DOM node '" + aChildIds[i] + "' is at position " + i);
		}
	}

	function checkRMWriter(assert, sExpectedResult, bExpectReturnsRM, iExpectedNumberOfControls, fnActionCallback, fnCheckCallBack) {
		var rm = new RenderManager();
		var oCheckFunctionResult = fnActionCallback(rm);
		assert.equal(rm.aBuffer.join(""), sExpectedResult, "Writer function produce expected output.");
		if (bExpectReturnsRM) {
			assert.ok(rm === oCheckFunctionResult, "Writer function returns RenderManager again for chaining.");
		} else {
			assert.ok(rm != oCheckFunctionResult, "Writer function does not return RenderManager for chaining.");
		}
		assert.equal(rm.aRenderedControls.length, iExpectedNumberOfControls, "Writer function rendered expected number of controls.");
		if (fnCheckCallBack){
			fnCheckCallBack(rm);
		}
	}


	QUnit.module("Core API");

	/**
	 * @deprecated As of 1.92
	 */
	QUnit.test("RenderManager.getConfiguration", function(assert) {
		var rm = new RenderManager();
		assert.strictEqual(rm.getConfiguration(), Configuration, "getConfiguration should return the same like Core.getConfiguration");
	});

	/**
	 * @deprecated Since version 0.15.0.
	 */
	QUnit.test("Core.getRenderManager", function(assert) {
		assert.notStrictEqual(Core.getRenderManager(), Core.getRenderManager(), "Core.getRenderManager should always returns a new RenderManager instance");
	});

	QUnit.test("Core.createRenderManager", function(assert) {
		assert.notStrictEqual(new RenderManager().getInterface(), new RenderManager().getInterface(), "Core.createRenderManager should always return a new RenderManager instance");
	});

	/**
	 * @deprecated As of 1.111
	 */
	QUnit.module("Interfaces");

	var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering"];

	var aStringRendererMethods = ["write", "writeEscaped", "writeAcceleratorKey", "writeControlData", "writeElementData",
		"writeAttribute", "writeAttributeEscaped", "addClass", "writeClasses", "addStyle", "writeStyles",
		"writeAccessibilityState", "writeIcon", "translate", "getConfiguration", "getHTML"];

	var aDomRendererMethods = ["openStart", "openEnd", "close", "voidStart", "voidEnd", "text", "attr", "class", "style",
		"accessibilityState", "icon", "unsafeHtml"];

	var aInterfaceMethods = aCommonMethods.concat(aStringRendererMethods, aDomRendererMethods);

	var aNonRendererFunctions = ["render", "flush", "destroy"];

	QUnit.test("Full Interface", function(assert) {
		var rm = new RenderManager().getInterface();
		var aAllFunctions = aInterfaceMethods.concat(aNonRendererFunctions);

		for (var i = 0; i < aInterfaceMethods.length; i++) {
			assert.ok(rm[aAllFunctions[i]] !== undefined, "expected interface method should actually exist: " + aInterfaceMethods[i]);
		}
		for (var s in rm) {
			assert.ok(aAllFunctions.indexOf(s) >= 0, "Full Interface provides function '" + s + "'.");
		}
	});

	QUnit.test("Renderer Interface", function(assert) {
		var rm = new RenderManager().getInterface();
		var oControl0 = new TestControl("TestContr0");
		fnCheckRendererInterface = function(rmIf) {
			for (var s in rmIf) {
				assert.ok(aInterfaceMethods.indexOf(s) >= 0, "Renderer Interface provides function '" + s + "'.");
			}
		};
		rm.renderControl(oControl0);
		fnCheckRendererInterface = null;
	});


	/**
	 * @deprecated As of 1.92 (String based rendering is replaced with the Semantic Rendering)
	 */
	QUnit.module("Writer API");

	//No checks due to deprecation for
	//translate, writeAcceleratorKey, writeAccessibilityState, getHTML

	QUnit.test("RenderManager.write", function(assert) {
		checkRMWriter(assert, "Hello, how are you?", true, 0, function(rm) {
			return rm.write("Hello", ",", " how are ", "you?");
		});
	});

	QUnit.test("RenderManager.writeEscaped", function(assert) {
		checkRMWriter(assert, "Hello&#x20;&amp;&lt;&quot;&#x27;&#x5c;", true, 0, function(rm) {
			return rm.writeEscaped("Hello &<\"\'\\");
		});
		// in design time tools and in general string and enum (string) properties could be null
		checkRMWriter(assert, "", true, 0, function(rm) {
			return rm.writeEscaped(null);
		});
	});

	QUnit.test("RenderManager.writeControlData", function(assert) {
		checkRMWriter(assert, " id=\"TestElem1\" data-sap-ui=\"TestElem1\" data-sap-ui-render=\"\"", true, 0, function(rm) {
			return rm.writeControlData(new Control("TestElem1"));
		});
	});

	QUnit.test("RenderManager.writeElementData", function(assert) {
		checkRMWriter(assert, " id=\"TestElem2\" data-sap-ui=\"TestElem2\"", true, 0, function(rm) {
			return rm.writeElementData(new Element("TestElem2"));
		});
	});

	QUnit.test("RenderManager.writeAttribute", function(assert) {
		checkRMWriter(assert, " attr=\"value\"", true, 0, function(rm) {
			return rm.writeAttribute("attr", "value");
		});
	});

	QUnit.test("RenderManager.writeAttributeEscaped", function(assert) {
		checkRMWriter(assert, " attr=\"value&#x20;&amp;&lt;&quot;&#x27;&#x5c;\"", true, 0, function(rm) {
			return rm.writeAttributeEscaped("attr", "value &<\"\'\\");
		});
	});

	QUnit.test("RenderManager.renderControl", function(assert) {
		var oControl1 = new TestControl("TestContr1");
		var oControl2 = new TestControl("TestContr2");
		checkRMWriter(assert, getTestControlHtml("TestContr1") + getTestControlHtml("TestContr2"), true, 2, function(rm) {
			rm.renderControl(oControl1);
			return rm.renderControl(oControl2);
		}, function(rm) {
			assert.ok(rm.aRenderedControls[0] === oControl1, "First control is in rendered controls list");
			assert.ok(rm.aRenderedControls[1] === oControl2, "Second control is in rendered controls list");
		});
	});

	QUnit.test("RenderManager.addStyle", function(assert) {
		checkRMWriter(assert, "", true, 0, function(rm) {
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aStyle, "Style infrastructure initially not available.");
			rm.addStyle("att1");
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aStyle, "Style infrastructure still not available after call without value.");
			rm.addStyle("att1", "val1");
			assert.ok(!!rm.aStyleStack[rm.aStyleStack.length - 1].aStyle, "Style infrastructure now initialized");
			return rm.addStyle("att2", "val2");
		});
	});

	QUnit.test("RenderManager.writeStyles", function(assert) {
		checkRMWriter(assert, " data-sap-ui-stylekey=\"0\"", true, 0, function(rm) {
			rm.addStyle("att1", "val1");
			rm.addStyle("att2", "val2");
			return rm.writeStyles();
		}, function(rm) {
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aStyle, "Style infrastructure is reset");
		});
	});

	QUnit.test("RenderManager.addClass", function(assert) {
		checkRMWriter(assert, "", true, 0, function(rm) {
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aClasses, "Class infrastructure initially not available.");
			rm.addClass();
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aClasses, "Class infrastructure still not available after call without value.");
			rm.addClass("Class1");
			assert.ok(!!rm.aStyleStack[rm.aStyleStack.length - 1].aClasses, "Class infrastructure now initialized");
			return rm.addClass("Class2");
		});
	});

	QUnit.test("RenderManager.writeClasses", function(assert) {
		checkRMWriter(assert, " class=\"Class1 Class2\"", true, 0, function(rm) {
			rm.addClass("Class1");
			rm.addClass("Class2");
			return rm.writeClasses();
		}, function(rm) {
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aClasses, "Class infrastructure is reset");
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aCustomStyleClasses, "CustomClass infrastructure is reset");
		});

		var oControl3 = new TestControl("TestContr3");
		oControl3.addStyleClass("Class3", true);
		oControl3.addStyleClass("Class2", true); //For duplicate check

		checkRMWriter(assert, getTestControlHtml("TestContr3", " class=\"Class1 Class2 Class3 Class2\""), true, 1, function(rm) {
			TestControlRenderer.doAdditionalThings = function(oRM, oControl) {
				rm.addClass("Class1");
				rm.addClass("Class2");
				rm.writeClasses();
			};
			rm.renderControl(oControl3);
			TestControlRenderer.doAdditionalThings = function(oRM, oControl) {};
			return rm.writeClasses();
		}, function(rm) {
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aClasses, "Class infrastructure is reset");
			assert.ok(!rm.aStyleStack[rm.aStyleStack.length - 1].aCustomStyleClasses, "CustomClass infrastructure is reset");
		});
	});

	QUnit.test("RenderManager.writeAccessibilityState", function(assert) {
		var oControl1 = new ACCTestControl("TestACCContr1");
		var oControl2 = new ACCTestControl("TestACCContr2", {
			"editable": false, //readonly
			"enabled": false, //disabled
			"visible": false, //hidden
			"required": true, //required
			"selected": true, //selected
			"checked": true, //checked
			"ariaDescribedBy": [oControl1, "test1"],
			"ariaLabelledBy": [oControl1, "test2"]
		});

		function checkACCOutput(sOutput, sValue) {
			assert.ok(sOutput.indexOf(sValue) >= 0, "Output contains " + sValue + " ('" + sOutput + "')");
		}

		//Check defaults
		var rm = new RenderManager();
		assert.ok(rm === rm.writeAccessibilityState(oControl1), "Writer function returns RenderManager again for chaining.");
		var sOutput = rm.aBuffer.join("");
		assert.ok(sOutput.length === 0, "No output for defaults: " + sOutput);

		//Check auto-generation
		rm = new RenderManager();
		rm.writeAccessibilityState(oControl2);
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-readonly=\"true\"");
		checkACCOutput(sOutput, "aria-disabled=\"true\"");
		checkACCOutput(sOutput, "aria-hidden=\"true\"");
		checkACCOutput(sOutput, "aria-required=\"true\"");
		checkACCOutput(sOutput, "aria-selected=\"true\"");
		checkACCOutput(sOutput, "aria-checked=\"true\"");
		// escape it because attributes' values are escaped since 1.19.0 & 1.18.5 & 1.16.10
		var sText = encodeXML("TestACCContr1 test1");
		checkACCOutput(sOutput, "aria-describedby=\"" + sText + "\"");
		sText = encodeXML("TestACCContr1 test2");
		checkACCOutput(sOutput, "aria-labelledby=\"" + sText + "\"");

		//Check reset
		rm = new RenderManager();
		rm.writeAccessibilityState(oControl2, {
			"readonly": null,
			"disabled": null,
			"hidden": null,
			"required": null,
			"selected": null,
			"checked": null,
			"describedby": null,
			"labelledby": null
		});
		sOutput = rm.aBuffer.join("");
		assert.ok(sOutput.length == 0, "No output for reset values: " + sOutput);

		//Check custom attributes only
		rm = new RenderManager();
		rm.writeAccessibilityState({
			"hello1": "hello2"
		});
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-hello1=\"hello2\"");

		//Check control and custom attributes
		rm = new RenderManager();
		rm.writeAccessibilityState(oControl2, {
			"hello1": "hello2"
		});
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-readonly=\"true\"");
		checkACCOutput(sOutput, "aria-disabled=\"true\"");
		checkACCOutput(sOutput, "aria-hidden=\"true\"");
		checkACCOutput(sOutput, "aria-required=\"true\"");
		checkACCOutput(sOutput, "aria-selected=\"true\"");
		checkACCOutput(sOutput, "aria-checked=\"true\"");
		// escape it because attributes' values are escaped since 1.19.0 & 1.18.5 & 1.16.10
		sText = encodeXML("TestACCContr1 test1");
		checkACCOutput(sOutput, "aria-describedby=\"" + sText + "\"");
		sText = encodeXML("TestACCContr1 test2");
		checkACCOutput(sOutput, "aria-labelledby=\"" + sText + "\"");
		checkACCOutput(sOutput, "aria-hello1=\"hello2\"");

		//Check append for describedby and labelledby
		rm = new RenderManager();
		rm.writeAccessibilityState(oControl2, {
			"readonly": {
				value: false,
				append: true
			},
			"describedby": {
				value: "hello1",
				append: true
			},
			"labelledby": {
				value: "hello2",
				append: true
			}
		});
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-readonly=\"false\"");
		// escape it because attributes' values are escaped since 1.19.0 & 1.18.5 & 1.16.10
		sText = encodeXML("TestACCContr1 test1 hello1");
		checkACCOutput(sOutput, "aria-describedby=\"" + sText + "\"");
		sText = encodeXML("TestACCContr1 test2 hello2");
		checkACCOutput(sOutput, "aria-labelledby=\"" + sText + "\"");
	});

	// DOM rendering methods

	QUnit.module("Writer API: Semantic Syntax (DOM) Rendering Methods");

	QUnit.test("RenderManager.openStart", function (assert) {
		checkRMWriter(assert, "<span", true, 0, function(rm) {
			return rm.openStart("span");
		});
	});

	QUnit.test("RenderManager.openEnd", function (assert) {
		checkRMWriter(assert, "<span>", true, 0, function(rm) {
			return rm.openStart("span").openEnd();
		});
	});

	QUnit.test("RenderManager.close", function (assert) {
		checkRMWriter(assert, "</span>", true, 0, function(rm) {
			return rm.close("span");
		});
	});

	QUnit.test("RenderManager.voidStart", function (assert) {
		checkRMWriter(assert, "<img", true, 0, function(rm) {
			return rm.voidStart("img");
		});
	});

	QUnit.test("RenderManager.voidEnd", function (assert) {
		checkRMWriter(assert, "<img>", true, 0, function(rm) {
			return rm.voidStart("img").voidEnd();
		});
	});

	QUnit.test("RenderManager.text", function (assert) {
		checkRMWriter(assert, "Hello,&#x20;how&#x20;are&#x20;you&#x3f;", true, 0, function(rm) {
			return rm.text("Hello, how are you?");
		});
	});

	QUnit.test("RenderManager.attr", function (assert) {
		checkRMWriter(assert, " attrName=\"attr&#x20;value&#x20;&amp;&lt;&quot;&#x27;&#x5c;\"", true, 0, function(rm) {
			return rm.attr("attrName", "attr value &<\"\'\\");
		});
	});

	QUnit.test("RenderManager.class", function (assert) {
		checkRMWriter(assert, "", true, 0, function(rm) {
			rm.class("sampleClassName");
			assert.equal(rm.aStyleStack[rm.aStyleStack.length - 1].aClasses[rm.aStyleStack[rm.aStyleStack.length - 1].aClasses.length - 1], "sampleClassName", "Class added to list of styles");
			return rm.class("");
		});
	});

	QUnit.test("RenderManager.style", function(assert) {
		checkRMWriter(assert, "", true, 0, function(rm) {
			rm.style("att1", "val1");
			assert.equal(rm.aStyleStack[rm.aStyleStack.length - 1].aStyle[rm.aStyleStack[rm.aStyleStack.length - 1].aStyle.length - 1], "att1: val1;", "Style added to list of styles");
			return rm.style("att2", "val2");
		});
	});

	QUnit.test("Semantic Syntax Combined", function(assert) {
		checkRMWriter(assert, "" +
		"<span id=\"sampleId\" class=\"sampleClassName\">some&#x20;text<img src=\"..&#x2f;img.jpg\">some&#x20;more&#x20;text</span>" +
		"", true, 0, function(rm) {

			rm.openStart("span");
			rm.class("sampleClassName");
			rm.attr("id", "sampleId");
			rm.openEnd();
			rm.text("some text");
			rm.voidStart("img");
			rm.attr("src", "../img.jpg");
			rm.voidEnd();
			rm.text("some more text");
			rm.close("span");
			return rm.text();
		});
	});

	QUnit.test("RenderManager.openStart with controlData", function(assert) {
		checkRMWriter(assert, "<div id=\"TestElem123\" data-sap-ui=\"TestElem123\" data-sap-ui-render=\"\"", true, 0, function(rm) {
			return rm.openStart("div", new Control("TestElem123"));
		});
	});

	QUnit.test("RenderManager.openStart with elementData", function(assert) {
		checkRMWriter(assert, "<div id=\"TestElem1234\" data-sap-ui=\"TestElem1234\"", true, 0, function(rm) {
			return rm.openStart("div", new Element("TestElem1234"));
		});
	});

	QUnit.test("RenderManager.accessibilityState", function(assert) {
		var oControl1 = new ACCTestControl("TestACCContr123");
		var oControl2 = new ACCTestControl("TestACCContr234", {
			"editable": false, //readonly
			"enabled": false, //disabled
			"visible": false, //hidden
			"required": true, //required
			"selected": true, //selected
			"checked": true, //checked
			"ariaDescribedBy": [oControl1, "test123"],
			"ariaLabelledBy": [oControl1, "test234"]
		});

		function checkACCOutput(sOutput, sValue) {
			assert.ok(sOutput.indexOf(sValue) >= 0, "Output contains " + sValue + " ('" + sOutput + "')");
		}

		//Check defaults
		var rm = new RenderManager();
		assert.ok(rm === rm.accessibilityState(oControl1), "Writer function returns RenderManager again for chaining.");
		var sOutput = rm.aBuffer.join("");
		assert.ok(sOutput.length === 0, "No output for defaults: " + sOutput);

		//Check auto-generation
		rm = new RenderManager();
		rm.accessibilityState(oControl2);
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-readonly=\"true\"");
		checkACCOutput(sOutput, "aria-disabled=\"true\"");
		checkACCOutput(sOutput, "aria-hidden=\"true\"");
		checkACCOutput(sOutput, "aria-required=\"true\"");
		checkACCOutput(sOutput, "aria-selected=\"true\"");
		checkACCOutput(sOutput, "aria-checked=\"true\"");
		// escape it because attributes' values are escaped since 1.19.0 & 1.18.5 & 1.16.10
		var sText = encodeXML("TestACCContr123 test123");
		checkACCOutput(sOutput, "aria-describedby=\"" + sText + "\"");
		sText = encodeXML("TestACCContr123 test234");
		checkACCOutput(sOutput, "aria-labelledby=\"" + sText + "\"");

		//Check reset
		rm = new RenderManager();
		rm.accessibilityState(oControl2, {
			"readonly": null,
			"disabled": null,
			"hidden": null,
			"required": null,
			"selected": null,
			"checked": null,
			"describedby": null,
			"labelledby": null
		});
		sOutput = rm.aBuffer.join("");
		assert.ok(sOutput.length == 0, "No output for reset values: " + sOutput);

		//Check custom attributes only
		rm = new RenderManager();
		rm.accessibilityState({
			"hello1": "hello2"
		});
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-hello1=\"hello2\"");

		//Check control and custom attributes
		rm = new RenderManager();
		rm.accessibilityState(oControl2, {
			"hello1": "hello2"
		});
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-readonly=\"true\"");
		checkACCOutput(sOutput, "aria-disabled=\"true\"");
		checkACCOutput(sOutput, "aria-hidden=\"true\"");
		checkACCOutput(sOutput, "aria-required=\"true\"");
		checkACCOutput(sOutput, "aria-selected=\"true\"");
		checkACCOutput(sOutput, "aria-checked=\"true\"");
		// escape it because attributes' values are escaped since 1.19.0 & 1.18.5 & 1.16.10
		sText = encodeXML("TestACCContr123 test123");
		checkACCOutput(sOutput, "aria-describedby=\"" + sText + "\"");
		sText = encodeXML("TestACCContr123 test234");
		checkACCOutput(sOutput, "aria-labelledby=\"" + sText + "\"");
		checkACCOutput(sOutput, "aria-hello1=\"hello2\"");

		//Check append for describedby and labelledby
		rm = new RenderManager();
		rm.accessibilityState(oControl2, {
			"readonly": {
				value: false,
				append: true
			},
			"describedby": {
				value: "hello1",
				append: true
			},
			"labelledby": {
				value: "hello2",
				append: true
			}
		});
		sOutput = rm.aBuffer.join("");
		checkACCOutput(sOutput, "aria-readonly=\"false\"");
		// escape it because attributes' values are escaped since 1.19.0 & 1.18.5 & 1.16.10
		sText = encodeXML("TestACCContr123 test123 hello1");
		checkACCOutput(sOutput, "aria-describedby=\"" + sText + "\"");
		sText = encodeXML("TestACCContr123 test234 hello2");
		checkACCOutput(sOutput, "aria-labelledby=\"" + sText + "\"");
	});

	QUnit.module("Writer API: Semantic Syntax (DOM) Assertions", {
		beforeEach: function() {
			this.oRM = new RenderManager().getInterface();
			this.oAssertionSpy = this.spy(console, "assert");
		},
		afterEach: function() {
			this.oRM.destroy();
		}
	});

	QUnit.test("RenderManager.openStart - empty tag", function (assert) {
		this.oRM.openStart();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - invalid tag", function (assert) {
		this.oRM.openStart("1");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - nested", function (assert) {
		this.oRM.openStart("div").openStart("div");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - invalid tag upper case", function (assert) {
		this.oRM.openStart("H1");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - voidStart", function (assert) {
		this.oRM.openStart("div").voidStart("img");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - empty tag", function (assert) {
		this.oRM.voidStart();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - invalid tag", function (assert) {
		this.oRM.voidStart("?");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - nested", function (assert) {
		this.oRM.voidStart("img").voidStart("input");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - invalid tag upper case", function (assert) {
		this.oRM.voidStart("INPUT");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - openStart", function (assert) {
		this.oRM.voidStart("img").openStart("div");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openEnd - without openStart", function (assert) {
		this.oRM.openEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openEnd - voidStart", function (assert) {
		this.oRM.voidStart("div").openEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openEnd - valid", function (assert) {
		this.oRM.openStart("div").openEnd();
		assert.equal(this.oAssertionSpy.callCount, 0);
	});

	QUnit.test("RenderManager.voidEnd - without voidStart", function (assert) {
		this.oRM.voidEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidEnd - openStart", function (assert) {
		this.oRM.openStart("div").voidEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidEnd - valid", function (assert) {
		this.oRM.voidStart("br").voidEnd();
		assert.equal(this.oAssertionSpy.callCount, 0);
	});

	QUnit.test("RenderManager.close - no tag name", function (assert) {
		this.oRM.openStart("div").openEnd().close();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.close - open tag", function (assert) {
		this.oRM.openStart("div").close("div");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.close - open void tag", function (assert) {
		this.oRM.voidStart("img").close("img");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.unsafeHTML", function (assert) {
		this.oRM.voidStart("img").unsafeHtml(" tabindex='0'");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.text", function (assert) {
		this.oRM.openStart("div").text("text");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.class('a b')", function (assert) {
		this.oRM.openStart("div").class("class1 class2");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing multiple classes should fail assertion");
	});

	QUnit.test("RenderManager.class('a', 'b')", function (assert) {
		this.oRM.openStart("div").class("class1", "class2");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing multiple classes with one call should fail assertion");
	});

	QUnit.test("RenderManager.attr('class', ...)", function (assert) {
		this.oRM.openStart("div").attr("class");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing class attribute alone should be fine");
	});

	QUnit.test("RenderManager.class(...).attr('class', ...)", function (assert) {
		this.oRM.openStart("div").class("class1").attr("class", "class2");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing class attribute after calling class() should fail assertion");
	});

	QUnit.test("RenderManager.attr('class', ...).class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class2").class("class1");
		assert.equal(this.oAssertionSpy.callCount, 1, "calling class() after writing class attribute should fail assertion");
	});

	QUnit.test("RenderManager.class(...).openEnd().openStart().attr('class',...)", function (assert) {
		this.oRM.openStart("div").class("class1").openEnd().openStart("div").attr("class", "class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing class attribute in new tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('class',...).openEnd().openStart().class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class1").openEnd().openStart("div").class("class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "adding a class in new tag should pass assertion");
	});

	QUnit.test("RenderManager.class(...).openEnd().voidStart().attr('class',...)", function (assert) {
		this.oRM.openStart("div").class("class1").openEnd().voidStart("div").attr("class", "class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing class attribute in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('class',...).openEnd().voidStart().class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class1").openEnd().voidStart("div").class("class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "adding a class in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.style (no style prop name)", function (assert) {
		this.oRM.openStart("div").style("", "100px");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.attr('style')", function (assert) {
		this.oRM.openStart("div").attr("style", "width: 100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing style attribute alone should be fine");
	});

	QUnit.test("RenderManager.style(...).attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").attr("style", "height: 100%");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing style attribute after style prop should fail assertion");
	});

	QUnit.test("RenderManager.attr('style',...).style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").style("width", "100%");
		assert.equal(this.oAssertionSpy.callCount, 1, "setting style property after style attribute should fail assertion");
	});

	QUnit.test("RenderManager.style(...).openEnd().openStart().attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").openEnd().openStart("div").attr("style", "height: 100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing style attribute in new tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('style',...).openEnd().openStart().style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").openEnd().openStart("div").style("width", "100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "setting style property in new tag should pass assertion");
	});

	QUnit.test("RenderManager.style(...).openEnd().voidStart().attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").openEnd().voidStart("input").attr("style", "height: 100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing style attribute in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('style',...).openEnd().voidStart().style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").openEnd().voidStart("input").style("width", "100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "setting style property in new void tag should pass assertion");
	});

	QUnit.test("Valid syntax No API assertion", function (assert) {
		this.oRM.
		openStart("div").attr("id", "x").style("width", "100%").class("x").openEnd().
			voidStart("img").attr("id", "y").style("width", "100px").class("y").class().class(false).class(null).voidEnd().
			openStart("so-me_Tag1").attr("some-3Attri_bute", "x").class(undefined).class("").openEnd().close("so-me_Tag1").
			voidStart("so-me_Void5Tag").voidEnd().
		close("div");

		// nested
		this.oRM.openStart("div");
			var oRM = new RenderManager().getInterface();
			oRM.voidStart("img").voidEnd();
			oRM.destroy();
		this.oRM.openEnd();

		assert.equal(this.oAssertionSpy.callCount, 0);
	});

	/**
	 * @deprecated As of 1.92
	 */
	QUnit.module("Non Renderer Functions - String based rendering", {
		before: function() {
			//Control initialization
			var aControls = [];
			for (var i = 0; i < 8; i++) {
				aControls.push(new TestControl("control" + i));
			}
			this.controls = aControls;
		},
		after: function() {
			this.controls.forEach(function(oControl) {
				oControl.destroy();
			});
		}
	});

	QUnit.test("RenderManager.destroy", function(assert) {
		var rm = new RenderManager();
		var oControl4 = new TestControl("TestContr4");
		rm.renderControl(oControl4);
		assert.ok(rm.aBuffer.length != 0, "HTML Buffer is filled after some writing");
		assert.ok(rm.aRenderedControls != 0, "Rendered Control Buffer is filled after some writing");
		rm.destroy();
		assert.ok(rm.aBuffer.length == 0, "HTML Buffer cleared after destroy");
		assert.ok(rm.aRenderedControls == 0, "Rendered Control Buffer cleared after destroy");
	});

	QUnit.test("RenderManager.render (Initial Rendering)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Initial Rendering
		pDone = checkRendering(assert, [aControls[0], aControls[1], aControls[2]], "area1", false, function(oTargetDomNode, aCtrls) {
			rm.render(aCtrls[0], oTargetDomNode);
			rm.render(aCtrls[1], oTargetDomNode);
			rm.render(aCtrls[2], oTargetDomNode);
		});

		checkChildOrder(assert, "area1", [aControls[0].getId(), aControls[1].getId(), aControls[2].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.render (Rerendering to same parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Rerendering to same parent DOM node
		pDone = checkRendering(assert, [aControls[1]], "area1", true, function(oTargetDomNode, aCtrls) {
			rm.render(aCtrls[0], oTargetDomNode);
		});

		checkChildOrder(assert, "area1", [aControls[0].getId(), aControls[1].getId(), aControls[2].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.render (Move to different parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Move to different parent DOM node
		pDone = checkRendering(assert, [aControls[1]], "area3", true, function(oTargetDomNode, aCtrls) {
			rm.render(aCtrls[0], oTargetDomNode);
		}, "area1");

		checkChildOrder(assert, "area1", [aControls[0].getId(), aControls[2].getId()]);
		checkChildOrder(assert, "area3", [aControls[1].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(Initial Rendering)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Initial Rendering
		pDone = checkRendering(assert, [aControls[3], aControls[4]], "area2", false, function(oTargetDomNode, aCtrls) {
			rm.renderControl(aCtrls[0]);
			rm.write("<div");
			rm.writeAttribute("id", "divider");
			rm.write(">|</div>");
			rm.renderControl(aCtrls[1]);
			rm.flush(oTargetDomNode);
		});

		checkChildOrder(assert, "area2", [aControls[3].getId(), "divider", aControls[4].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(Rerendering to same parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Rerendering to same parent DOM node
		pDone = checkRendering(assert, [aControls[3], aControls[4]], "area2", true, function(oTargetDomNode, aCtrls) {
			rm.renderControl(aCtrls[1]);
			rm.write("<div");
			rm.writeAttribute("id", "divider");
			rm.write(">|</div>");
			rm.renderControl(aCtrls[0]);
			rm.flush(oTargetDomNode);
		});

		checkChildOrder(assert, "area2", [aControls[4].getId(), "divider", aControls[3].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(Move to different parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Move to different parent DOM node
		pDone = checkRendering(assert, [aControls[3]], "area4", true, function(oTargetDomNode, aCtrls) {
			rm.renderControl(aCtrls[0]);
			rm.write("<div");
			rm.writeAttribute("id", "divider2");
			rm.write(">|</div>");
			rm.flush(oTargetDomNode);
		}, "area2");

		checkChildOrder(assert, "area2", [aControls[4].getId(), "divider"]);
		checkChildOrder(assert, "area4", [aControls[3].getId(), "divider2"]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(insert at certain position)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			done = assert.async();

		rm.renderControl(aControls[5]);
		rm.flush(document.getElementById("area2"), false, 1);
		rm.destroy();

		window.setTimeout(function() { // for delayed rendering in Safari
			checkChildOrder(assert, "area2", [aControls[4].getId(), aControls[5].getId(), "divider"]);
			done();
		}, Device.browser.safari ? 500 : 0);
	});

	QUnit.test("RenderManager.flush(insert at certain position < 0)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			done = assert.async();

		rm.renderControl(aControls[6]);
		rm.flush(document.getElementById("area2"), false, -1);
		rm.destroy();

		window.setTimeout(function() { // for delayed rendering in Safari
			checkChildOrder(assert, "area2", [aControls[6].getId(), aControls[4].getId(), aControls[5].getId(), "divider"]);
			done();
		}, Device.browser.safari ? 500 : 0);
	});

	QUnit.test("RenderManager.flush(insert at certain position > #items)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			done = assert.async();

		rm.renderControl(aControls[7]);
		rm.flush(document.getElementById("area2"), false, 42);
		rm.destroy();

		window.setTimeout(function() { // for delayed rendering in Safari
			checkChildOrder(assert, "area2", [aControls[6].getId(), aControls[4].getId(), aControls[5].getId(), "divider", aControls[7].getId()]);
			done();
		}, Device.browser.safari ? 500 : 0);
	});

	QUnit.test("RenderManager lock", async function(assert) {
		var oCtrl1 = new TestControl();
		var oCtrl2 = new TestControl();

		oCtrl1.placeAt("area5");
		oCtrl2.placeAt("area5");
		await nextUIUpdate();

		oCtrl1.doBeforeRendering = function() {
			UIArea.rerenderControl(oCtrl2);
		};

		oCtrl1.doAfterRendering = function() {
			UIArea.rerenderControl(oCtrl2);
		};

		var iCounter = 0;

		oCtrl2.doAfterRendering = function() {
			iCounter++;
		};

		oCtrl1.invalidate();
		await nextUIUpdate();

		assert.equal(iCounter, 0, "Number of rerenderings of Ctrl2");
	});

	var TestControlSemanticRendering = Control.extend("TestControlSemanticRendering", {
		renderer: {
			render: function(rm, oControl) {
				rm.openStart("div", oControl);
				rm.openEnd();
				rm.text("[" + oControl.getId() + "]");
				rm.close("div");
			}
		},
		onBeforeRendering: function() {
			if (this.doBeforeRendering) {
				this.doBeforeRendering();
			}
		},
		onAfterRendering: function() {
			if (this.doAfterRendering) {
				this.doAfterRendering();
			}
		}
	});


	QUnit.module("Non Renderer Functions - Semantic Rendering", {
		before: function() {
			var aSemanticRenderingControls = [];
			for (var i = 0; i < 8; i++) {
				aSemanticRenderingControls.push(new TestControlSemanticRendering("SRControl" + i));
			}
			this.controls = aSemanticRenderingControls;
		},
		after: function() {
			this.controls.forEach(function(oControl) {
				oControl.destroy();
			});
		}
	});


	QUnit.test("RenderManager.destroy", function(assert) {
		var rm = new RenderManager();
		var oControl5 = new TestControlSemanticRendering("TestContr5");
		rm.renderControl(oControl5);
		assert.ok(rm.aBuffer.length != 0, "HTML Buffer is filled after some writing");
		assert.ok(rm.aRenderedControls != 0, "Rendered Control Buffer is filled after some writing");
		rm.destroy();
		assert.ok(rm.aBuffer.length == 0, "HTML Buffer cleared after destroy");
		assert.ok(rm.aRenderedControls == 0, "Rendered Control Buffer cleared after destroy");
	});


	QUnit.test("RenderManager.render (Initial Rendering)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Initial Rendering
		pDone = checkRendering(assert, [aControls[0], aControls[1], aControls[2]], "area1", false, function(oTargetDomNode, aCtrls) {
			rm.render(aCtrls[0], oTargetDomNode);
			rm.render(aCtrls[1], oTargetDomNode);
			rm.render(aCtrls[2], oTargetDomNode);
		});

		checkChildOrder(assert, "area1", [aControls[0].getId(), aControls[1].getId(), aControls[2].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.render (Rerendering to same parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Rerendering to same parent DOM node
		pDone = checkRendering(assert, [aControls[1]], "area1", true, function(oTargetDomNode, aCtrls) {
			rm.render(aCtrls[0], oTargetDomNode);
		});

		checkChildOrder(assert, "area1", [aControls[0].getId(), aControls[1].getId(), aControls[2].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.render (Move to different parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Move to different parent DOM node
		pDone = checkRendering(assert, [aControls[1]], "area3", true, function(oTargetDomNode, aCtrls) {
			rm.render(aCtrls[0], oTargetDomNode);
		}, "area1");

		checkChildOrder(assert, "area1", [aControls[0].getId(), aControls[2].getId()]);
		checkChildOrder(assert, "area3", [aControls[1].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(Initial Rendering)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Initial Rendering
		pDone = checkRendering(assert, [aControls[3], aControls[4]], "area2", false, function(oTargetDomNode, aCtrls) {
			rm.renderControl(aCtrls[0]);
			rm.openStart("div");
			rm.attr("id", "divider");
			rm.openEnd();
			rm.text("|");
			rm.close("div");
			rm.renderControl(aCtrls[1]);
			rm.flush(oTargetDomNode);
		});

		checkChildOrder(assert, "area2", [aControls[3].getId(), "divider", aControls[4].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(Rerendering to same parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Rerendering to same parent DOM node
		pDone = checkRendering(assert, [aControls[3], aControls[4]], "area2", true, function(oTargetDomNode, aCtrls) {
			rm.renderControl(aCtrls[1]);
			rm.openStart("div");
			rm.attr("id", "divider");
			rm.openEnd();
			rm.text("|");
			rm.close("div");
			rm.renderControl(aCtrls[0]);
			rm.flush(oTargetDomNode);
		});

		checkChildOrder(assert, "area2", [aControls[4].getId(), "divider", aControls[3].getId()]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(Move to different parent DOM node)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			pDone;

		//Move to different parent DOM node
		pDone = checkRendering(assert, [aControls[3]], "area4", true, function(oTargetDomNode, aCtrls) {
			rm.renderControl(aCtrls[0]);
			rm.openStart("div");
			rm.attr("id", "divider2");
			rm.openEnd();
			rm.text("|");
			rm.close("div");
			rm.flush(oTargetDomNode);
		}, "area2");

		checkChildOrder(assert, "area2", [aControls[4].getId(), "divider"]);
		checkChildOrder(assert, "area4", [aControls[3].getId(), "divider2"]);
		return pDone;
	});

	QUnit.test("RenderManager.flush(insert at certain position)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			done = assert.async();

		rm.renderControl(aControls[5]);
		rm.flush(document.getElementById("area2"), false, 1);
		rm.destroy();

		window.setTimeout(function() { // for delayed rendering in Safari
			checkChildOrder(assert, "area2", [aControls[4].getId(), aControls[5].getId(), "divider"]);
			done();
		}, Device.browser.safari ? 500 : 0);
	});

	QUnit.test("RenderManager.flush(insert at certain position < 0)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			done = assert.async();

		rm.renderControl(aControls[6]);
		rm.flush(document.getElementById("area2"), false, -1);
		rm.destroy();

		window.setTimeout(function() { // for delayed rendering in Safari
			checkChildOrder(assert, "area2", [aControls[6].getId(), aControls[4].getId(), aControls[5].getId(), "divider"]);
			done();
		}, Device.browser.safari ? 500 : 0);
	});

	QUnit.test("RenderManager.flush(insert at certain position > #items)", function(assert) {
		var rm = new RenderManager().getInterface(),
			aControls = this.controls,
			done = assert.async();

		rm.renderControl(aControls[7]);
		rm.flush(document.getElementById("area2"), false, 42);
		rm.destroy();

		window.setTimeout(function() { // for delayed rendering in Safari
			checkChildOrder(assert, "area2", [aControls[6].getId(), aControls[4].getId(), aControls[5].getId(), "divider", aControls[7].getId()]);
			done();
		}, Device.browser.safari ? 500 : 0);
	});

	QUnit.test("RenderManager lock", async function(assert) {
		var oCtrl1 = new TestControlSemanticRendering();
		var oCtrl2 = new TestControlSemanticRendering();

		oCtrl1.placeAt("area5");
		oCtrl2.placeAt("area5");
		await nextUIUpdate();

		oCtrl1.doBeforeRendering = function() {
			UIArea.rerenderControl(oCtrl2);
		};

		oCtrl1.doAfterRendering = function() {
			UIArea.rerenderControl(oCtrl2);
		};

		var iCounter = 0;

		oCtrl2.doAfterRendering = function() {
			iCounter++;
		};

		oCtrl1.invalidate();
		await nextUIUpdate();

		assert.equal(iCounter, 0, "Number of rerenderings of Ctrl2");
	});

	QUnit.test("RenderManager.prototype.icon with Icon URL", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, ["classA", "classB"], {
			id: "icon1",
			propertyA: "valueA",
			propertyB: "valueB"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1");
		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.tagName.toLowerCase(), "span", "Icon URI should be rendered as a span");
		assert.equal(icon1.style["fontFamily"].replace(/"|'/g, ""), oIconInfo.fontFamily, "Icon's font family is rendered");
		assert.equal(icon1.getAttribute("data-sap-ui-icon-content"), oIconInfo.content, "Icon content is rendered as attribute");
		assert.ok(icon1.classList.contains("classA"), "icon has classA as a CSS class");
		assert.ok(icon1.classList.contains("classB"), "icon has classB as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIcon"), "icon has sapUiIcon as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIconMirrorInRTL"), "icon has sapUiIconMirrorInRTL as a CSS class");
		assert.equal(icon1.getAttribute("propertyA"), "valueA", "Attribute should be set");
		assert.equal(icon1.getAttribute("propertyB"), "valueB", "Attribute should be set");
		assert.equal(icon1.getAttribute("aria-hidden"), "true", "Attribute 'aria-hidden' should be set");
		assert.notEqual(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should be set");

		document.getElementById("area6").innerHTML = "";

		rm = new RenderManager().getInterface();
		oIconInfo = IconPool.getIconInfo("calendar");
		rm.icon(oIconInfo.uri, ["classA", "classB"], {
			id: "icon1",
			propertyA: "valueA",
			propertyB: "valueB"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		icon1 = document.getElementById("icon1");
		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.tagName.toLowerCase(), "span", "Icon URI should be rendered as a span");
		assert.equal(icon1.style["fontFamily"].replace(/"|'/g, ""), oIconInfo.fontFamily, "Icon's font family is rendered");
		assert.equal(icon1.getAttribute("data-sap-ui-icon-content"), oIconInfo.content, "Icon content is rendered as attribute");
		assert.ok(icon1.classList.contains("classA"), "icon has classA as a CSS class");
		assert.ok(icon1.classList.contains("classB"), "icon has classB as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIcon"), "icon has sapUiIcon as a CSS class");
		assert.ok(!icon1.classList.contains("sapUiIconMirrorInRTL"), "icon has sapUiIconMirrorInRTL as a CSS class");
		assert.equal(icon1.getAttribute("propertyA"), "valueA", "Attribute should be set");
		assert.equal(icon1.getAttribute("propertyB"), "valueB", "Attribute should be set");
		assert.notEqual(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should be set");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with Icon URL. aria-label and aria-labelledby are set to null", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, [], {
			id: "icon1",
			"aria-label": null,
			"aria-labelledby": null,
			"role": "button"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1"),
			invisibleText = document.getElementById("icon1-label");

		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should not be set");
		assert.equal(icon1.getAttribute("aria-labelledby"), undefined, "Attribute aria-labelledby should not be set");
		assert.notOk(icon1.hasAttribute("aria-hidden"), "'aria-hidden' should not be set when role isn't 'presentation'");
		assert.notOk(invisibleText, "No invisible text is rendered");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with Icon URL and aria-labelledby", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, [], {
			id: "icon1",
			"aria-labelledby": "foo",
			alt: "abc"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1"),
			invisibleText = document.getElementById("icon1-label"),
			sText = invisibleText.textContent;
		assert.ok(icon1, "icon should be rendered");

		assert.equal(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should not be set");
		assert.equal(icon1.getAttribute("aria-labelledby"), "foo icon1-label", "Attribute aria-labelledby should contain both the given id and the id of the invisible text");
		assert.equal(sText, "abc", "The content of invisible text should be set");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with font-family which has space inside", function(assert) {
		var fnOrigGetIconInfo = IconPool.getIconInfo,
			sFontFamily = "fontfamily which has space inside";

		this.stub(IconPool, "getIconInfo").callsFake(function (sIconName) {
			var oRes = fnOrigGetIconInfo(sIconName);
			oRes.fontFamily = sFontFamily;
			return oRes;
		});

		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, [], {
			id: "icon1"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1");

		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.tagName.toLowerCase(), "span", "Icon URI should be rendered as a span");
		assert.equal(icon1.style["fontFamily"], "\"" + sFontFamily + "\"", "Icon's font family is rendered");
		assert.equal(icon1.getAttribute("data-sap-ui-icon-content"), oIconInfo.content, "Icon content is rendered as attribute");
		assert.ok(icon1.classList.contains("sapUiIcon"), "icon has sapUiIcon as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIconMirrorInRTL"), "icon has sapUiIconMirrorInRTL as a CSS class");
		assert.notEqual(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should be set");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager writeIcon with Image URL", function(assert) {
		var rm = new RenderManager().getInterface(),
			sImgURL = sap.ui.require.toUrl("sap/ui/core/themes/base/img/Busy.gif");

		rm.icon(sImgURL, ["classA", "classB"], {
			id: "img1",
			propertyA: "valueA",
			propertyB: "valueB"
		});
		rm.flush(document.getElementById("area7"));
		rm.destroy();

		var img1 = document.getElementById("img1");
		assert.ok(img1, "icon should be rendered");
		assert.equal(img1.tagName.toLowerCase(), "img", "Image URI should be rendered as a img");
		assert.ok(img1.classList.contains("classA"), "img has classA as a CSS class");
		assert.ok(img1.classList.contains("classB"), "img has classB as a CSS class");
		assert.equal(img1.getAttribute("propertyA"), "valueA", "Attribute should be set");
		assert.equal(img1.getAttribute("propertyB"), "valueB", "Attribute should be set");
		assert.equal(img1.getAttribute("role"), "presentation", "Default attribute should be set");
		assert.equal(img1.getAttribute("alt"), "", "Default attribute should be set");

		document.getElementById("area7").innerHTML = "";

		rm = new RenderManager().getInterface();
		rm.icon(sImgURL, ["classA", "classB"], {
			id: "img1",
			role: "",
			alt: "test alt message"
		});
		rm.flush(document.getElementById("area7"));
		rm.destroy();

		img1 = document.getElementById("img1");
		assert.ok(img1, "icon should be rendered");
		assert.equal(img1.tagName.toLowerCase(), "img", "Image URI should be rendered as a img");
		assert.ok(img1.classList.contains("classA"), "img has classA as a CSS class");
		assert.ok(img1.classList.contains("classB"), "img has classB as a CSS class");
		assert.equal(img1.getAttribute("role"), "", "Attribute should be changed");
		assert.equal(img1.getAttribute("alt"), "test alt message", "Attribute should be changed");

		document.getElementById("area7").innerHTML = "";
	});

	QUnit.test("RenderManager should not break for controls with invalid renderer", async function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");

		// define a control without an invalid renderer
		var my = {};
		my.InvalidRendererControl = Control.extend("my.InvalidRendererControl", {
			renderer: {}
		});

		// create a new instance of the control
		var oControl = new my.InvalidRendererControl();
		var oMetadata = oControl.getMetadata();
		var oRenderer = oControl.getRenderer();

		// check for an invalid renderer (preconditions)
		assert.ok(!!oRenderer, "A renderer object should be provided");
		assert.ok(!oRenderer.render, "Invalid renderer should not provide a render function");

		// spy the Log.error function
		var oSpy = this.spy(Log, "error");

		// rendering should not lead to an error
		oControl.placeAt("area8");
		await nextUIUpdate();
		oControl.destroy();

		// check the error message
		assert.equal("The renderer for class " + oMetadata.getName() + " is not defined or does not define a render function! Rendering of " + oControl.getId() + " will be skipped!", oSpy.getCall(0).args[0], "Error should be reported in the console!");
	});



	QUnit.module("Events", {
		beforeEach: function() {
			this.oElement = document.createElement("div");
			this.oSpy = this.spy();
			this.oContext = {};
		},
		afterEach: function() {
			RenderManager.detachPreserveContent(this.oSpy);
		}
	});

	QUnit.test("preserveContent", function(assert) {
		RenderManager.attachPreserveContent(this.oSpy);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		assert.ok(this.oSpy.calledWith({
			domNode: this.oElement
		}));
		assert.ok(this.oSpy.calledOn(RenderManager));
		this.oSpy.resetHistory();

		RenderManager.detachPreserveContent(this.oSpy);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.notCalled);
	});

	QUnit.test("preserveContent with context", function(assert) {
		RenderManager.attachPreserveContent(this.oSpy, this.oContext);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		assert.ok(this.oSpy.calledWith({
			domNode: this.oElement
		}));
		assert.ok(this.oSpy.calledOn(this.oContext));
	});

	QUnit.test("preserveContent duplicate listener", function(assert) {
		RenderManager.attachPreserveContent(this.oSpy);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		this.oSpy.resetHistory();

		RenderManager.attachPreserveContent(this.oSpy, this.oContext);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		assert.ok(this.oSpy.calledOn(this.oContext));
	});

	/**
	 * @deprecated As of 1.92
	 */
	QUnit.module("Invisible - String based rendering");

	QUnit.test("Render visible control", async function(assert) {
		var oControl = new TestControl("testVisible");
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(oDomRef, "DOM reference exists");
		assert.ok(oDomRef instanceof HTMLElement, "DOM reference is an HTML element");

		assert.ok(!oInvisbleRef, "Invisible DOM reference doesn't exist");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render invisible control", async function(assert) {
		var oControl = new TestControl("testVisible", {visible: false});
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(!oDomRef, "DOM reference does not exist");

		assert.ok(oInvisbleRef, "Invisible DOM reference exists");
		assert.ok(oInvisbleRef instanceof HTMLElement, "Invisible DOM reference is an HTML element");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render control made visible in onBeforeRendering", async function(assert) {
		var oControl = new TestControl("testVisible", {visible: false});
		oControl.placeAt("testArea");
		await nextUIUpdate();

		oControl.doBeforeRendering = function() {
			this.setVisible(true);
		};
		oControl.invalidate();
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(oDomRef, "DOM reference exists");
		assert.ok(oDomRef instanceof HTMLElement, "DOM reference is an HTML element");

		assert.ok(!oInvisbleRef, "Invisible DOM reference doesn't exist");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render control made invisible in onBeforeRendering", async function(assert) {
		var oControl = new TestControl("testVisible", {visible: true});
		oControl.placeAt("testArea");
		await nextUIUpdate();

		oControl.doBeforeRendering = function() {
			this.setVisible(false);
		};
		oControl.invalidate();
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(!oDomRef, "DOM reference does not exist");

		assert.ok(oInvisbleRef, "Invisible DOM reference exists");
		assert.ok(oInvisbleRef instanceof HTMLElement, "Invisible DOM reference is an HTML element");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.module("Invisible - Semantic Rendering");

	QUnit.test("Render visible control", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible");
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(oDomRef, "DOM reference exists");
		assert.ok(oDomRef instanceof HTMLElement, "DOM reference is an HTML element");

		assert.ok(!oInvisbleRef, "Invisible DOM reference doesn't exist");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render invisible control", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible", {visible: false});
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(!oDomRef, "DOM reference does not exist");

		assert.ok(oInvisbleRef, "Invisible DOM reference exists");
		assert.ok(oInvisbleRef instanceof HTMLElement, "Invisible DOM reference is an HTML element");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render control made visible in onBeforeRendering", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible", {visible: false});
		oControl.doBeforeRendering = function() {
			this.setVisible(true);
		};
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(oDomRef, "DOM reference exists");
		assert.ok(oDomRef instanceof HTMLElement, "DOM reference is an HTML element");

		assert.ok(!oInvisbleRef, "Invisible DOM reference doesn't exist");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render control made invisible in onBeforeRendering", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible", {visible: true});
		oControl.doBeforeRendering = function() {
			this.setVisible(false);
		};
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(!oDomRef, "DOM reference does not exist");

		assert.ok(oInvisbleRef, "Invisible DOM reference exists");
		assert.ok(oInvisbleRef instanceof HTMLElement, "Invisible DOM reference is an HTML element");

		oControl.destroy();
		await nextUIUpdate();
	});

	/**
	 * Sample container which renders exactly one of its children and calls
	 * cleanupControlWithoutRendering for all others.
	 *
	 * Method 'setTheLuckyOneAndRender' synchronously renders the content aggregation.
	 * This mimics the behavior of controls that try to optimize rendering.
	 */
	var TestContainer = Control.extend("TestContainer", {
		metadata: {
			properties: {
				theLuckyOne: "int"
			},
			aggregations: {
				"content": {}
			},
			defaultAggregation: "content"
		},
		renderer: {
			apiVersion :1,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.openStart("div", oControl.getId() + "-content");
				oRm.openEnd();
				this.renderContent(oRm, oControl);
				oRm.close("div");
				oRm.close("div");
			},
			renderContent: function(oRm, oControl) {
				var theLuckyOne = oControl.getTheLuckyOne();
				Log.info("begin");
				oControl.getContent().forEach(function(oChild, idx) {
					if ( idx === theLuckyOne ) {
						Log.info("rendering ", idx);
						oRm.renderControl(oChild);
					} else {
						Log.info("cleaning up ", idx);
						oRm.cleanupControlWithoutRendering(oChild);
					}
				});
				Log.info("done");
			}
		},
		setTheLuckyOneAndRender: function(value) {
			this.setProperty("theLuckyOne", value, true);
			var oRM = new RenderManager().getInterface();
			this.getMetadata().getRenderer().renderContent(oRM, this);
			oRM.flush(this.getDomRef("content"));
			oRM.destroy();
		}
	});

	QUnit.module("cleanupControlWithoutRendering and DOM preservation", {
		beforeEach: function() {
			this.oView1 = new HTML({ content: "<span>view1</span>" });
			this.oView2 = new HTML({ content: "<span>view2</span>" });
			this.oContainer = new TestContainer({
				theLuckyOne: 0,
				content: [ this.oView1, this.oView2 ]
			});
		},
		afterEach: function() {
			this.oView1 = null;
			this.oView2 = null;
			this.oContainer = null;
		},

		executeTest: async function (assert, fnApplyLuckyOne) {
			var oView1 = this.oView1;
			var oView2 = this.oView2;
			var oContainer = this.oContainer;
			// initially show view 1. view 2 has not been rendered yet
			oContainer.placeAt("area9");
			await nextUIUpdate();
			assert.ok(oView1.getDomRef(), "view1 should have DOM");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.notOk(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should not be in preserve area");
			assert.notOk(oView2.getDomRef(), "view2 should not have DOM");
			assert.notOk(oView2.bOutput, "view2 should not be marked with bOutput");

			// show view 2. view 1 will be moved to preserve area
			await fnApplyLuckyOne(1);
			assert.ok(oView1.getDomRef(), "view1 still should have DOM");
			assert.ok(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should be in preserve area");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.ok(oView2.getDomRef(), "view2 also should have DOM");
			assert.ok(oView2.bOutput, "view2 should be marked with bOutput");
			assert.notOk(RenderManager.isPreservedContent(oView2.getDomRef()), "DOM of view2 should not be in preserve area");

			// show view 1 again (includes restore from preserve area
			await fnApplyLuckyOne(0);
			assert.ok(oView1.getDomRef(), "view1 still should have DOM");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.notOk(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should not be in preserve area");
			assert.ok(oView2.getDomRef(), "view2 still should have DOM");
			assert.ok(oView2.bOutput, "view2 should be marked with bOutput");
			assert.ok(RenderManager.isPreservedContent(oView2.getDomRef()), "DOM of view2 should be in preserve area");

			// show view 3 (which does not exists). view 1 & 2 are moved to the preserve area
			await fnApplyLuckyOne(2);
			assert.ok(oView1.getDomRef(), "view1 still should have DOM");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.ok(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should be in preserve area");
			assert.ok(oView2.getDomRef(), "view2 still should have DOM");
			assert.ok(oView2.bOutput, "view2 should be marked with bOutput");
			assert.ok(RenderManager.isPreservedContent(oView2.getDomRef()), "DOM of view2 should be in preserve area");

			// destroy, DOM should disappear (bOutput is no longer relevant)
			oContainer.destroy();
			assert.notOk(oView1.getDomRef(), "view1 no longer should have DOM");
			assert.notOk(oView2.getDomRef(), "view2 no longer should have DOM");
		}
	});

	QUnit.test("default rendering (string)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 1;
		await this.executeTest(assert, async function(value) {
			// use normal invalidation
			this.oContainer.setTheLuckyOne(value);
			// and force re-rendering
			await nextUIUpdate();
		}.bind(this));
	});

	QUnit.test("custom rendering (string)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 1;
		await this.executeTest(assert, function(value) {
			// use custom rendering (leaves the preservation to the flush call)
			this.oContainer.setTheLuckyOneAndRender(value);
		}.bind(this));
	});

	QUnit.test("default rendering (patcher)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 2;
		await this.executeTest(assert, async function(value) {
			// use normal invalidation
			this.oContainer.setTheLuckyOne(value);
			// and force re-rendering
			await nextUIUpdate();
		}.bind(this));
	});

	QUnit.test("custom rendering (patcher)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 2;
		await this.executeTest(assert, function(value) {
			// use custom rendering (leaves the preservation to the flush call)
			this.oContainer.setTheLuckyOneAndRender(value);
		}.bind(this));
	});

	QUnit.test("preservation of not-rendered, indirect descendants (grand children etc.)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 2;
		var oHtml1 = new HTML({content: "<div></div>"}),
			oHtml2 = new HTML({content: "<div></div>"}),
			oContainer = new TestContainer({
			theLuckyOne: 0,
			content: [
				oHtml1,
				new TestContainer({
					theLuckyOne: 0,
					content: [ oHtml2 ]
				})
			]
		});

		// act 1: initial rendering
		oContainer.placeAt("area9");
		await nextUIUpdate();

		// assert 1: HTML1 rendered, HTML2 not yet rendered
		assert.ok(oHtml1.getDomRef() && !RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM and is not preserved");
		assert.notOk(oHtml2.getDomRef(),
			"HTML2 has not been rendered yet");

		// act 2: switch rendered control
		oContainer.setTheLuckyOne(1);
		await nextUIUpdate();
		oHtml2.$().append("<span></span>");
		oHtml2.$().append("<span></span>");
		oHtml2.$().append("<span></span>");
		oHtml2.$().append("<span></span>");

		// assert 2: HTML1 not visible, but preserved, HTML2 rendered
		assert.ok(oHtml1.getDomRef() && RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM but has been preserved");
		assert.ok(oHtml2.getDomRef() && !RenderManager.isPreservedContent(oHtml2.getDomRef()),
			"HTML2 has DOM and is not preserved");
		assert.equal(oHtml2.$().children().length, 4,
			"HTML2 should have the expected children");

		// act 3: switch again
		oContainer.setTheLuckyOne(0);
		await nextUIUpdate();

		// assert 3: HTML1 rendered, HTML2 not rendered, but preserved
		assert.ok(oHtml1.getDomRef() && !RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM and is not preserved");
		assert.ok(oHtml2.getDomRef() && RenderManager.isPreservedContent(oHtml2.getDomRef()),
			"HTML2 has DOM, but has been preserved");
		assert.equal(oHtml2.$().children().length, 4,
			"Modifications to HTML2 still should be present");

		// act 4: switch again
		oContainer.setTheLuckyOne(1);
		await nextUIUpdate();

		// assert 3: HTML1 not rendered but preserved, HTML2 rendered incl. dynamic modifications
		assert.ok(oHtml1.getDomRef() && RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM and is preserved");
		assert.ok(oHtml2.getDomRef() && !RenderManager.isPreservedContent(oHtml2.getDomRef()),
			"HTML2 has DOM, and is not preserved");
		assert.equal(oHtml2.$().children().length, 4,
			"Modifications to HTML2 still are present");
	});
});

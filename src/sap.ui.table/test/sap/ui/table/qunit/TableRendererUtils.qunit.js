/*global QUnit */

sap.ui.require([], function() {
	"use strict";

	//************************************************************************
	// Helper Functions
	//************************************************************************

	jQuery.sap.require("sap.ui.table.TableRendererUtils");
	var TableRendererUtils = sap.ui.table.TableRendererUtils;
	var oOutput;

	function initOutput() {
		oOutput = {txt: "", classes: [], styles: [], attributes: []};
	}

	var oRm = {
		write: function() {
			for (var i = 0; i < arguments.length; i++) {
				oOutput.txt = oOutput.txt + arguments[i];
			}
		},
		addClass: function(sClass) {
			oOutput.classes.push(sClass);
		},
		writeClasses: function() {
			oOutput.writeClasses = true;
		},
		addStyle: function(sName, sValue) {
			oOutput.styles.push(sName + "=" + sValue);
		},
		writeStyles: function() {
			oOutput.writeStyles = true;
		},
		writeAttribute: function(sName, sValue) {
			oOutput.attributes.push(sName + "=" + sValue);
		},
		writeControlData: function(oControl) {
			oOutput.control = oControl;
		},
		writeElementData: function(oElement) {
			oOutput.element = oElement;
		}
	};

	var oTable = {
		getId: function() {
			return "TABLEID";
		},
		_getAccRenderExtension: function() {
			return {
				writeAriaAttributesFor: function(rm, oTable, sName, oConfig) {
					oOutput.aria = sName;
					oOutput.ariaConfig = oConfig;
				}
			};
		}
	};

	//************************************************************************
	// Test Code
	//************************************************************************

	QUnit.module("TableRendererUtils", {
		beforeEach: initOutput,
		afterEach: function() {
			oOutput = null;
		}
	});

	QUnit.test("addClass", function(assert) {
		TableRendererUtils.addClass(oRm);
		assert.equal(oOutput.classes.length, 0, "No class given, no class written");
		initOutput();
		TableRendererUtils.addClass(oRm, "HELLO");
		assert.equal(oOutput.classes.length, 1, "Class given, class written");
		assert.equal(oOutput.classes[0], "HELLO", "Class correct");
		initOutput();
		TableRendererUtils.addClass(oRm, "HELLO", false);
		assert.equal(oOutput.classes.length, 0, "Class given but negative check, no class written");
		initOutput();
		TableRendererUtils.addClass(oRm, "HELLO", true);
		assert.equal(oOutput.classes.length, 1, "Class given and positive check, class written");
		assert.equal(oOutput.classes[0], "HELLO", "Class correct");
	});

	QUnit.test("addClass (startElement Context)", function(assert) {
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addClass(oRm);
			}
		});
		assert.equal(oOutput.classes.length, 0, "No class given, no class written");
		assert.ok(!oOutput.writeClasses, "writeClasses not called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addClass(oRm, "HELLO");
			}
		});
		assert.equal(oOutput.classes.length, 1, "Class given, class written");
		assert.equal(oOutput.classes[0], "HELLO", "Class correct");
		assert.ok(oOutput.writeClasses, "writeClasses called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addClass(oRm, "HELLO", false);
			}
		});
		assert.equal(oOutput.classes.length, 0, "Class given but negative check, no class written");
		assert.ok(!oOutput.writeClasses, "writeClasses not called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addClass(oRm, "HELLO", true);
			}
		});
		assert.equal(oOutput.classes.length, 1, "Class given and positive check, class written");
		assert.equal(oOutput.classes[0], "HELLO", "Class correct");
		assert.ok(oOutput.writeClasses, "writeClasses called");
	});

	QUnit.test("addStyle", function(assert) {
		TableRendererUtils.addStyle(oRm);
		assert.equal(oOutput.styles.length, 0, "No style name given, no style written");
		initOutput();
		TableRendererUtils.addStyle(oRm, "display");
		assert.equal(oOutput.styles.length, 0, "No style value given, no style written");
		initOutput();
		TableRendererUtils.addStyle(oRm, "display", "none");
		assert.equal(oOutput.styles.length, 1, "Style given, style written");
		assert.equal(oOutput.styles[0], "display=none", "Style correct");
		initOutput();
		TableRendererUtils.addStyle(oRm, "display", "none", false);
		assert.equal(oOutput.styles.length, 0, "Style given but negative check, no style written");
		initOutput();
		TableRendererUtils.addStyle(oRm, "display", "none", true);
		assert.equal(oOutput.styles.length, 1, "Style given and positive check, style written");
		assert.equal(oOutput.styles[0], "display=none", "Style correct");
	});

	QUnit.test("addStyle (startElement Context)", function(assert) {
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addStyle(oRm);
			}
		});
		assert.equal(oOutput.styles.length, 0, "No style name given, no style written");
		assert.ok(!oOutput.writeStyles, "writeStyles not called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addStyle(oRm, "display");
			}
		});
		assert.equal(oOutput.styles.length, 0, "No style value given, no style written");
		assert.ok(!oOutput.writeStyles, "writeStyles not called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addStyle(oRm, "display", "none");
			}
		});
		assert.equal(oOutput.styles.length, 1, "Style given, style written");
		assert.equal(oOutput.styles[0], "display=none", "Style correct");
		assert.ok(oOutput.writeStyles, "writeStyles called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addStyle(oRm, "display", "none", false);
			}
		});
		assert.equal(oOutput.styles.length, 0, "Style given but negative check, no style written");
		assert.ok(!oOutput.writeStyles, "writeStyles not called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				TableRendererUtils.addStyle(oRm, "display", "none", true);
			}
		});
		assert.equal(oOutput.styles.length, 1, "Style given and positive check, style written");
		assert.equal(oOutput.styles[0], "display=none", "Style correct");
		assert.ok(oOutput.writeStyles, "writeStyles called");
	});

	QUnit.test("startElement - Tag", function(assert) {
		TableRendererUtils.startElement(oRm, oTable, {});
		assert.equal(oOutput.txt, "<div>", "Default start tag written");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {tag: "li"});
		assert.equal(oOutput.txt, "<li>", "Custom start tag written");
	});

	QUnit.test("startElement - id", function(assert) {
		var oElement = new sap.ui.core.Element("CUSTOMELEMENT");
		var oControl = new sap.ui.core.Control("CUSTOMCONTROL");
		TableRendererUtils.startElement(oRm, oTable, {id: "HELLO"});
		assert.equal(oOutput.attributes.length, 1, "ID written");
		assert.equal(oOutput.attributes[0], "id=TABLEID-HELLO", "ID correct");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {id: "HELLO", element: oElement});
		assert.equal(oOutput.attributes.length, 1, "ID written");
		assert.equal(oOutput.attributes[0], "id=CUSTOMELEMENT-HELLO", "ID correct");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {element: oElement});
		assert.equal(oOutput.attributes.length, 0, "ID not written as attribute");
		assert.ok(oOutput.element === oElement, "writeElementData called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {element: oControl});
		assert.equal(oOutput.attributes.length, 0, "ID not written as attribute");
		assert.ok(oOutput.control === oControl, "writeControlData called");
		oElement.destroy();
		oControl.destroy();
	});

	QUnit.test("startElement - classes", function(assert) {
		TableRendererUtils.startElement(oRm, oTable, {classname: "HELLO"});
		assert.equal(oOutput.classes.length, 1, "Class written");
		assert.equal(oOutput.classes[0], "HELLO", "Class correct");
		assert.ok(oOutput.writeClasses, "writeClasses called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {classname: ["HELLO", "HELLO2"]});
		assert.equal(oOutput.classes.length, 2, "Classes written");
		assert.equal(oOutput.classes[0], "HELLO", "Class correct");
		assert.equal(oOutput.classes[1], "HELLO2", "Class correct");
		assert.ok(oOutput.writeClasses, "writeClasses called");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {});
		assert.equal(oOutput.classes.length, 0, "No Class written");
		assert.ok(!oOutput.writeClasses, "writeClasses not called");
	});

	QUnit.test("startElement - tabindex", function(assert) {
		TableRendererUtils.startElement(oRm, oTable, {tabindex: "HELLO"});
		assert.equal(oOutput.attributes.length, 0, "Not a number");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {tabindex: 0});
		assert.equal(oOutput.attributes.length, 1, "Attribute written");
		assert.equal(oOutput.attributes[0], "tabindex=0", "Attribute correct");
	});

	QUnit.test("startElement - attributes", function(assert) {
		TableRendererUtils.startElement(oRm, oTable, {attributes: {a: "HELLO", b: "HELLO2"}});
		assert.equal(oOutput.attributes.length, 2, "Attributes written");
		assert.ok(oOutput.attributes[0] == "a=HELLO" || oOutput.attributes[0] == "b=HELLO2", "Attribute 1 correct");
		assert.ok(oOutput.attributes[1] == "a=HELLO" || oOutput.attributes[1] == "b=HELLO2", "Attribute 2 correct");
		assert.ok(oOutput.attributes[0] != oOutput.attributes[1], "Attributes different");
	});

	QUnit.test("startElement - aria", function(assert) {
		var oConfig = {};
		TableRendererUtils.startElement(oRm, oTable, {aria: "HELLO", ariaconfig: oConfig});
		assert.equal(oOutput.aria, "HELLO", "ARIA Key");
		assert.ok(oOutput.ariaConfig === oConfig, "ARIA Config");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {ariaconfig: oConfig});
		assert.ok(!oOutput.aria, "ARIA Key");
		assert.ok(!oOutput.ariaConfig, "ARIA Config");
		initOutput();
		TableRendererUtils.startElement(oRm, oTable, {aria: "HELLO"});
		assert.equal(oOutput.aria, "HELLO", "ARIA Key");
		assert.ok(!oOutput.ariaConfig, "ARIA Config");
	});

	QUnit.test("startElement - furtherSettings", function(assert) {
		assert.expect(1);
		TableRendererUtils.startElement(oRm, oTable, {
			furtherSettings: function() {
				assert.ok(true, "furtherSettings called");
			}
		});
	});

	QUnit.test("endElement - Tag", function(assert) {
		TableRendererUtils.endElement(oRm);
		assert.equal(oOutput.txt, "</div>", "Default end tag written");
		initOutput();
		TableRendererUtils.endElement(oRm, "li");
		assert.equal(oOutput.txt, "</li>", "Custom end tag written");
	});

	QUnit.test("renderElement - Tag", function(assert) {
		TableRendererUtils.renderElement(oRm, oTable);
		assert.equal(oOutput.txt, "<div></div>", "Default tags written");
		initOutput();
		TableRendererUtils.renderElement(oRm, oTable, {tag: "li"});
		assert.equal(oOutput.txt, "<li></li>", "Custom tags written");
	});
});
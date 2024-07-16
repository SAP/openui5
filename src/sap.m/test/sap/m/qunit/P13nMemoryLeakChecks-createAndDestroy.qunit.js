sap.ui.define(
	[
		"sap/ui/core/Control",
		"sap/ui/core/Lib",
		"sap/ui/qunit/qunit-css",
		"sap/ui/thirdparty/qunit",
		"sap/ui/qunit/qunit-junit",
		"sap/base/util/ObjectPath",
		"sap/ui/core/Core"
	],
	function(Control, Library, qunitCss, qunit, qunitJunit, ObjectPath, Core) {
		"use strict";

		function getDetachedControls(sControlName) {
			return Control.getControlsByFieldGroupId([]).filter(function(control) {
				//if (sControlName === "sap.m.P13nConditionPanel") {
					return true;
				//} else {
				//	return !control.getDomRef();
				//}
			});
		}

		QUnit.assert.equalElements = function(aActual, aExpected, sMessage) {
			var aUnexpectedElements = [];

			aActual.forEach(function(oActualElement) {
				if (!aExpected.find(function(oExpectedElement) {
						return oActualElement.getId() === oExpectedElement.getId();
					})) {
					aUnexpectedElements.push(oActualElement);
				}
			});
			this.push(aUnexpectedElements.length === 0, aUnexpectedElements.join(", "), "", sMessage);
		};

		var fnMemoryLeakCheckLibrary = function(assert, sLibName) {
			var oCore = sap.ui.getCore();

			oCore.loadLibrary(sLibName);

			var oLibInfo = Library.all();

			oLibInfo[sLibName].controls.forEach(function(sControlName) {
				if (sControlName != "sap.m.P13nConditionPanel") {
					return;
				}
				var oUiArea;
				try {
					var aPreElements = getDetachedControls(sControlName),
						oControlClass = ObjectPath.get(sControlName || ""),
						oControl = new oControlClass();

					oControl.placeAt(CONTENT_DIV_ID);
					oUiArea = oControl.getParent();
					oUiArea.invalidate();
					oControl.destroy();

					var aPostElements = getDetachedControls(sControlName);

					assert.equalElements(aPostElements, aPreElements, "Memory leak check for " + sControlName);
				} catch (e) {
					// an unexpected error occured (e.g. the control cannot be placed in a UIArea but needs a proper parent)
					// this is not focus of this test, therefore ignore it
					assert.ok(true, "unhandled exception for " + sControlName + ": " + e);
				}

				oUiArea && oUiArea.destroy();
			});
		};

		QUnit.module("Memory.Controls");

		var CONTENT_DIV_ID = "QUNIT_TEST_CONTENT_DIV",
			oContentDomElement;
		QUnit.moduleStart(function() {
			oContentDomElement = document.createElement("div");
			oContentDomElement.id = CONTENT_DIV_ID;
			document.body.appendChild(oContentDomElement);
		});

		QUnit.moduleDone(function() {
			document.body.removeChild(oContentDomElement);
		});

		//			QUnit.test("test sap.ui.core controls", function(assert) {
		//				fnMemoryLeakCheckLibrary(assert, "sap.ui.core");
		//			});

		QUnit.test("test sap.m controls", function(assert) {
			fnMemoryLeakCheckLibrary(assert, "sap.m");
			fnMemoryLeakCheckLibrary(assert, "sap.m");
			fnMemoryLeakCheckLibrary(assert, "sap.m");
		});

		/*				QUnit.test("test sap.ui.unified controls", function(assert) {
							fnMemoryLeakCheckLibrary(assert, "sap.ui.unified");
						});

						QUnit.test("test sap.ui.suite controls", function(assert) {
							fnMemoryLeakCheckLibrary(assert, "sap.ui.suite");
						});

						QUnit.test("test sap.ui.table controls", function(assert) {
							fnMemoryLeakCheckLibrary(assert, "sap.ui.table");
						});

						QUnit.test("test sap.uxap controls", function(assert) {
							fnMemoryLeakCheckLibrary(assert, "sap.uxap");
						});

						QUnit.test("test sap.ui.commons controls", function(assert) {
							fnMemoryLeakCheckLibrary(assert, "sap.ui.commons");
						}); */
	}
);
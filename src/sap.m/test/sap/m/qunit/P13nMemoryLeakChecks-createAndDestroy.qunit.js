// Note: the HTML page 'P13nMemoryLeakChecks-createAndDestroy.qunit.html' loads this module via data-sap-ui-on-init

		/* global QUnit */
		sap.ui.define(
			[
				"sap/ui/core/Control",
				"sap/ui/core/Lib",
				"sap/ui/core/Core"
			],
			function(Control, Library, Core) {
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

				async function fnMemoryLeakCheckLibrary(assert, sLibName) {
					const oLibInfo = await Library.load(sLibName);

					for (sControlName of oLibInfo.controls) {
						if (sControlName != "sap.m.P13nConditionPanel") {
							continue;
						}
						var oUiArea;
						try {
							const oControlClass = await new Promise((resolve, reject) => {
								sap.ui.require([sControlName.replace(/\./g, "/")], (fnClass) => resolve(fnClass), reject);
							});
							var aPreElements = getDetachedControls(sControlName),
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
					}
				}

				var CONTENT_DIV_ID = "QUNIT_TEST_CONTENT_DIV",
				oContentDomElement;

				QUnit.module("Memory.Controls", {
					before() {
						oContentDomElement = document.createElement("div");
						oContentDomElement.id = CONTENT_DIV_ID;
						document.body.appendChild(oContentDomElement);
					},
					after() {
						document.body.removeChild(oContentDomElement);
					}
				});

				//			QUnit.test("test sap.ui.core controls", function(assert) {
				//				fnMemoryLeakCheckLibrary(assert, "sap.ui.core");
				//			});

				QUnit.test("test sap.m controls", async function(assert) {
					await fnMemoryLeakCheckLibrary(assert, "sap.m");
					await fnMemoryLeakCheckLibrary(assert, "sap.m");
					await fnMemoryLeakCheckLibrary(assert, "sap.m");
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
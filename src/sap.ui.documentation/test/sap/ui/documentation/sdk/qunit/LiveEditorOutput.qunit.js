/*global QUnit*/
sap.ui.define(["sap/ui/thirdparty/URI"],
	function (URI) {
		"use strict";

		var sFrameURL = sap.ui.require.toUrl("sap/ui/documentation/sdk/util/liveEditorOutput.html"),
			sXmlSrc = '<mvc:View\n' +
				'        controllerName="HelloWorld.App"\n' +
				'        xmlns:mvc="sap.ui.core.mvc"\n' +
				'        xmlns="sap.m">\n' +
				'    <Page id="myPage" title="My App"/>\n' +
				'    <Button\n' +
				'            id="helloButton"\n' +
				'            visible="false"\n' +
				'            type="Emphasized"\n' +
				'            icon="sap-icon://sap-ui5"\n' +
				'            text="Say Hello"\n' +
				'            press="onShowHello"\n' +
				'            class="sapUiSmallMargin"/>\n' +
				'</mvc:View>',
			sControllerSrc = 'sap.ui.define([\n' +
				'            "sap/ui/core/mvc/Controller",\n' +
				'            "sap/m/MessageToast"\n' +
				'        ], function (Controller, MessageToast) {\n' +
				'            "use strict";\n' +
				'            return Controller.extend("HelloWorld.App", {\n' +
				'                onInit : function () {\n' +
				'                    this.getView().byId("helloButton").setVisible(true);\n' +
				'                }\n' +
				'            });\n' +
				'        });',
			// uses latest api to create the view asynchronously
			sIndexJs_v1 = `sap.ui.require(["sap/ui/core/mvc/XMLView"], function(XMLView) {
				XMLView.create({
					id: "myView1",
					viewName: "HelloWorld.App"
				}).then(function(myView) {
					myView.placeAt("content");
				});
			});`,
			// throws error in a seaprate task to test error handling
			sIndexJs_v4 = `sap.ui.require([], function() {
				setTimeout(function() {
					throw new Error("TestErrorMessage");
				}, 200);
			});`,
			// throws error in a micro task to test error handling
			sIndexJs_v5 = `sap.ui.require([], function() {
				Promise.resolve().then(function() {
					throw new Error("TestErrorMessage");
				});
			});`;

		/**
		 * Waits for a UI5 object with the given id to be created in the frame window
		 * @param {Window} oFrameWindow
		 * @param {string} sId
		 * @returns {Promise<any>}
		 */
		function waitForUI5Object(oFrameWindow, sId) {
			var iChecksCount = 0;
			return new Promise(function(resolve, reject) {

				function _checkObjectCreated() {
					if (oFrameWindow && oFrameWindow.sap && oFrameWindow.sap.ui && oFrameWindow.sap.ui.require) {
						oFrameWindow.sap.ui.require(["sap/ui/core/Element" ], function(Element) {
							var oObject = Element.getElementById(sId);
							if (oObject) {
								resolve(oObject);
								return;
							}
							if (iChecksCount++ > 300) {
								reject();
							}
							setTimeout(_checkObjectCreated, 10);
						});
					} else {
						if (iChecksCount++ > 300) {
							reject();
						}
						setTimeout(_checkObjectCreated, 10);
					}
				}
				_checkObjectCreated();
			});
		}


		function checkViewContentCreated(assert, oView) {
			assert.ok(oView.byId("myPage"), "the page is created");
			assert.ok(oView.byId("helloButton"), "the button is created");
		}


		/**
		 * Waits for condition
		 * @param {function} fnCondition
		 * @returns {Promise<any>}
		 */
		function waitForCondition(fnCondition) {
			var iChecksCount = 0;
			return new Promise(function(resolve, reject) {

				function _checkCondition() {
					var bResult = fnCondition();
					if (bResult) {
						resolve(bResult);
						return;
					}
					if (iChecksCount++ > 300) {
						reject();
					}
					setTimeout(_checkCondition, 10);
				}

				_checkCondition();
			});
		}

		QUnit.module("Samples", {

			beforeEach: function () {
				this.iframe = document.createElement('iframe');
				document.body.appendChild(this.iframe);
			},
			afterEach: function () {
				this.iframe.parentElement.removeChild(this.iframe);
				this.iframe = null;
			}
		});

		QUnit.test("loads view content when view created with XMLView.create", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe,

			oData = {
				src: {
					'HelloWorld/index.js': sIndexJs_v1,
					'HelloWorld/App.view.xml': sXmlSrc,
					'HelloWorld/App.controller.js': sControllerSrc
				},
				moduleNameToRequire: "HelloWorld/index"
			};

			assert.expect(3);

			oFrame.onload = function() {
				if (oFrame.contentWindow) {
					oFrame.contentWindow.postMessage(oData, "*");

					waitForUI5Object(oFrame.contentWindow, "myView1").then(function(oView) {
						assert.ok(oView, "the view is created");

						oView.loaded().then(function() {
							checkViewContentCreated(assert, oView);
							done();
						});
					});
				}
			};

			oFrame.src = sFrameURL;
		});

		QUnit.test("displays uncaught errors in output window", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe,
				oData = {
					src: {
						'HelloWorld/index.js': sIndexJs_v4
					},
					moduleNameToRequire: "HelloWorld/index"
				};

			assert.expect(1);

			oFrame.onload = function() {
				if (oFrame.contentWindow) {
					oFrame.contentWindow.postMessage(oData, "*");
				}
				function isErrorMessageVisible() {
					return oFrame.contentWindow.document.body.innerText.toLowerCase().indexOf("error") >= 0;
				}
				waitForCondition(isErrorMessageVisible).then(function(bResult) {
					assert.ok(bResult, "error message is displayed in DOM");
					done();
				});
			};

			oFrame.src = sFrameURL;
		});

		QUnit.test("displays unhandled rejection in output window", function(assert) {

			var done = assert.async(),
				oFrame = this.iframe,
				oData = {
					src: {
						'HelloWorld/index.js': sIndexJs_v5
					},
					moduleNameToRequire: "HelloWorld/index"
				};

			assert.expect(1);

			oFrame.onload = function() {
				if (oFrame.contentWindow) {
					oFrame.contentWindow.postMessage(oData, "*");
				}
				function isErrorMessageVisible() {
					return oFrame.contentWindow.document.body.innerText.toLowerCase().indexOf("error") >= 0;
				}
				waitForCondition(isErrorMessageVisible).then(function(bResult) {
					assert.ok(bResult, "error message is displayed in DOM");
					done();
				});
			};

			oFrame.src = sFrameURL;
		});
	});
/*global QUnit */
sap.ui.define([
	"sap/ui/events/F6Navigation",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(F6Navigation, XMLView, KeyCodes, QUnitUtils, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	// Test setup

	/* Custom WebComponent definition */
	var TestComponent = function() {
		var oComponentInstance = Reflect.construct(HTMLElement, [], TestComponent);

		if (!oComponentInstance.shadowRoot) {
			oComponentInstance.attachShadow({
				mode: 'open',
				delegatesFocus: true
			});
		}
		return oComponentInstance;
	};

	TestComponent.prototype = Object.create(HTMLElement.prototype);

	TestComponent.prototype.connectedCallback = function () {
		this.render();
	};

	TestComponent.prototype.attributeChangedCallback = function () {
		this.render();
	};

	TestComponent.prototype.render = function () {
		this.shadowRoot.innerHTML = '<slot name="FirstSlot" data-sap-ui-fastnavgroup="true"></slot>' +
		'<slot name="SecondSlot" data-sap-ui-fastnavgroup="true"></slot>';
	};

	window.customElements.define("test-component", TestComponent);

	/* Create DOM node for test */
	createAndAppendDiv("content");

	/* Helper functions and variables */
	var bForward, pView;
	var fnHandleF6GroupNavigation = F6Navigation.handleF6GroupNavigation;

	function triggerTestEvent(sTarget, bForward) {
		QUnitUtils.triggerKeydown(sTarget, KeyCodes.F6, !bForward);
	}

	function getActiveElement(oRoot) {
		if (oRoot.activeElement && oRoot.activeElement.shadowRoot) {
			return getActiveElement(oRoot.activeElement.shadowRoot);
		}

		return oRoot.activeElement;
	}

	function assertElementAttributes(oElement, oExpectedAttributes) {
		var aElementAttributes, aExpectedAttributes;
		var bAttributeMissing = false;
		var compareElementAttribute = function (oExpectedAttributeValue) {
			return aElementAttributes.indexOf(oExpectedAttributeValue) === -1;
		};
		for (var sAttributeKey in oExpectedAttributes) {
			if (oExpectedAttributes.hasOwnProperty(sAttributeKey)) {
				aElementAttributes = oElement.getAttribute(sAttributeKey) && oElement.getAttribute(sAttributeKey).trim().split(" ") || [];
				if (sAttributeKey === "id") {
					// In case of ID use either the own element ID if available or use the ID of the owning Web Component
					aElementAttributes.push(oElement.getRootNode().host && oElement.getRootNode().host.getAttribute(sAttributeKey));
				}
				aExpectedAttributes = oExpectedAttributes[sAttributeKey].trim().split(" ");
				bAttributeMissing = aExpectedAttributes.some(compareElementAttribute);
				if (bAttributeMissing) {
					break;
				}
			}
		}
		return !bAttributeMissing;
	}

	QUnit.module("Fast Navigation with Web Components", {
		before: function () {
			// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM) and the target of the event instead of the activeElement
			// to be more focus independent (-> More test stability)
			F6Navigation.handleF6GroupNavigation = function(oEvent, oSettings) {
				oSettings = oSettings ? oSettings : {};
				if (!oSettings.scope) {
					oSettings.scope = document.getElementById("content");
				}
				fnHandleF6GroupNavigation(oEvent, oSettings);
			};
			pView = XMLView.create({
				id: "xmlView",
				viewName: "sap.ui.fastnav.view.FastNavigation"
			}).then(async function(oView) {
				oView.placeAt("content");
				await nextUIUpdate();
				return oView;
			});
			return pView;
		},
		after: function () {
			F6Navigation.handleF6GroupNavigation = fnHandleF6GroupNavigation;
		}
	});

	function testFastNavigation(aExpectedElements, bForward) {
		QUnit.test("F6Navigation with Web Components (bForward: " + !!bForward + ")", function(assert) {
			var executeTest = function(oAcc, oExpectedElement) {
				var oActiveElement;
				return oAcc.then(function () {
					oActiveElement = oActiveElement || document.activeElement;
					// Need the activeElement on document level (not within shadowRoot)
					// in order to also trigger control events (sapskipforward/sapskipback)
					triggerTestEvent(document.activeElement, bForward);

					return Promise.resolve().then(function () {
						var sPreviousId = oActiveElement.getRootNode().host ? oActiveElement.getRootNode().host.id : oActiveElement.id;
						oActiveElement = getActiveElement(document);
						var sCurrentId = oActiveElement.getRootNode().host ? oActiveElement.getRootNode().host.id : oActiveElement.id;
						assert.ok(assertElementAttributes(oActiveElement, oExpectedElement), "F6Nav from '" + sPreviousId + "' to '" + sCurrentId + "'");
					});
				});
			};
			return pView.then(function (oView) {
				// Set the focus to the last element in the list
				var oFocusableElement = oView.byId(aExpectedElements[aExpectedElements.length - 1].id);

				if (oFocusableElement.isA("sap.ui.webc.common.WebComponent")) {
					// UI5 webcomponents have an internal promise that waits for the rendering before the focus can be set.
					// This promise obviously resolves asynchronously even though the DOM is already rendered.
					// In this case we have to wait for this Promise returned by the focus() call, before executing the assertions.
					oFocusableElement = oFocusableElement.getDomRef();
				}

				// if oFocusableElement is a UI5 Control, focus() returns undefined
				// if oFocusableElement is a WebComponent, focus() returns either:
				//    * a Promise if the DOM is not yet rendered
				//    * or undefined if the DOM is already available
				return aExpectedElements.reduce(executeTest, oFocusableElement.focus() || Promise.resolve());
			});
		});
	}

	do {
		// Define array with expected elements in the order
		// they will be focused on F6 forward navigation
		var aExpectedElements = [{
			"id": "xmlView--button1",
			"class": "ui5-button-root"
		},
		{
			"id": "xmlView--Panel1",
			"class": "ui5-panel-header"
		},
		{
			"id": "xmlView--ListItem1",
			"class": " ui5-li-root ui5-li--focusable ui5-custom-li-root "
		},
		{
			"id": "xmlView--Div1"
		},
		{
			"id": "xmlView--Div2"
		},
		{
			"id": "xmlView--Input1",
			"class": "ui5-input-inner"
		},
		{
			"id": "xmlView--Input3",
			"class": "ui5-input-inner"
		}];

		if (!bForward) {
			// In case of F6 back navigation sort the array
			// in opposite order
			aExpectedElements.reverse();
		}

		testFastNavigation(aExpectedElements, bForward);
		bForward = !bForward;
	} while (bForward);

	QUnit.start();
});

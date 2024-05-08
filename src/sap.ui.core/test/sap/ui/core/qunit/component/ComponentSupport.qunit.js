sap.ui.define([
	'sap/base/future',
	'sap/base/Log',
	'sap/base/strings/hyphenate',
	'sap/base/util/Deferred',
	'sap/base/util/ObjectPath',
	'sap/ui/core/UIComponent',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/ComponentSupport',
	"sap/ui/core/Element",
	'sap/ui/core/library'
], function(future, Log, hyphenate, Deferred, ObjectPath, UIComponent, ComponentContainer, ComponentSupport, Element, library) {

	"use strict";
	/*global QUnit, sinon*/

	var ComponentLifecycle = library.ComponentLifecycle;

	// helper functionality to create component container DIVs
	function createComponentDIV(sId, mAttributes) {
		var oDIV = document.createElement("div");
		if (mAttributes) {
			Object.keys(mAttributes).forEach(function(sKey) {
				oDIV.setAttribute(sKey, mAttributes[sKey]);
			});
		}
		oDIV.setAttribute("id", sId);
		return oDIV;
	}

	var oContentElement = createComponentDIV("content");
	document.body.appendChild(oContentElement);

	/**
	 * @deprecated As of 1.120, the support for events is deprecated as it relies on global names
	 */
	ObjectPath.set("myAppController.onComponentCreated", function() {});

	// settings
	var mSettings = {
		"div1": {
			id: "container1",
			name: "sap.ui.test.v2empty",
			settings: {
				id: "component1"
			},
			/**
			 * @deprecated As of 1.120, the support for events is deprecated as it relies on global names
			 */
			componentCreated: "myAppController.onComponentCreated"
		},
		"div2": {
			id: "container2",
			name: "sap.ui.test.v2empty",
			settings: {
				id: "component2"
			},
			/**
			 * @deprecated As of 1.120, the support for events is deprecated as it relies on global names
			 */
			componentCreated: "myAppController.onComponentCreated",
			async: false
		},
		"div3": {
			id: "container3",
			name: "sap.ui.test.v2empty",
			settings: {
				id: "component3"
			},
			/**
			 * @deprecated As of 1.120, the support for events is deprecated as it relies on global names
			 */
			componentCreated: "myAppController.onComponentCreated",
			manifest: "true"
		},
		/**
		 * @deprecated As of 1.120, manifest=false is no longer supported
		 */
		"div4": {
			id: "container4",
			name: "sap.ui.test.v2empty",
			settings: {
				id: "component4"
			},
			componentCreated: "myAppController.onComponentCreated",
			manifest: "false"
		}
	};

	const iExpectedComponents = Object.keys(mSettings).length;

	// convert the settings and create the component container div elements
	var mContainers = {};
	Object.keys(mSettings).forEach(function(sId) {
		// create the component configuration for the div element from the settings
		var mContainer = mContainers[sId] = {
			"data-sap-ui-component": ""
		};
		Object.keys(mSettings[sId]).forEach(function(sKey) {
			mContainer["data-" + hyphenate(sKey)] = sKey === "settings" ? JSON.stringify(mSettings[sId][sKey]) : mSettings[sId][sKey];
		});
		// create the div element for the component container
		oContentElement.appendChild(createComponentDIV(sId, mContainer));
	});


	QUnit.module("Component Support");

	QUnit.test("Finder, Parser and Default Settings", function(assert) {

		// check the finder
		var aElements = ComponentSupport._find();
		assert.equal(aElements.length, iExpectedComponents, `Found ${iExpectedComponents} declarative components!`);

		for (var i = 0, l = aElements.length; i < l; i++) {
			var oElement = aElements[i];
			var mExpectedSettings = mSettings[oElement.id];

			// check the parser
			var mComponentSettings = ComponentSupport._parse(oElement);
			/**
			 * @deprecated As of 1.120, the support for events is deprecated as it relies on global names
			 * Check event handler separately. Parser returns resolved function, whereas the expected settings
			 * contain a global name /(string) only
			 */
			if ( mExpectedSettings.componentCreated ) {
				assert.strictEqual(
					mComponentSettings.componentCreated,
					ObjectPath.get(mExpectedSettings.componentCreated),
					"Event handler parsed correctly for component " + oElement.id + "!");
				delete mComponentSettings.componentCreated;
				delete mExpectedSettings.componentCreated;
			}
			assert.deepEqual(mComponentSettings, mExpectedSettings, "Component settings parsed correctly for component " + oElement.id + "!");

			// check the default settings
			ComponentSupport._applyDefaultSettings(mComponentSettings);
			mExpectedSettings.async = true;
			mExpectedSettings.lifecycle = ComponentLifecycle.Container;
			mExpectedSettings.manifest = true;
			mExpectedSettings.autoPrefixId = true;
			assert.deepEqual(mComponentSettings, mExpectedSettings, "Component settings defaults applied properly for component " + oElement.id + "!");
		}

	});

	/**
	 * @deprecated As of 1.120
	 */
	QUnit.test("Parser with unknown setting (future:false)", function(assert) {

		future.active = false;

		this.spy(Log, "warning");

		var oElement = document.createElement("div");
		oElement.setAttribute("data-unknown", "foo");

		const expectedMessage =
			"Property or event \"unknown\" does not exist in sap.ui.core.ComponentContainer. It will be ignored";

		ComponentSupport._parse(oElement);
		assert.ok(
			Log.warning.calledWithMatch(expectedMessage),
			"should log a warning with the expected message");

		future.active = undefined; // restores configured default
	});

	QUnit.test("Parser with unknown setting (future:true)", function(assert) {
		future.active = true;

		var oElement = document.createElement("div");
		oElement.setAttribute("data-unknown", "foo");

		const expectedMessage =
			"Property or event \"unknown\" does not exist in sap.ui.core.ComponentContainer.";

		assert.throws(() => {
			ComponentSupport._parse(oElement);
		}, new Error(expectedMessage), "should throw an error with the expected message");

		future.active = undefined; // restores configured default
	});

	/**
	 * @deprecated As of 1.120, the support for events is deprecated as it relies on global names
	 */
	QUnit.test("Parser with invalid event callback", function(assert) {

		var oElement = document.createElement("div");
		oElement.setAttribute("data-component-created", "does.not.exist");
		assert.throws(function() {
			ComponentSupport._parse(oElement);
		}, new Error("Callback handler for event \"componentCreated\" not found"));

	});

	QUnit.test("ComponentContainer Factory", function(assert) {

		const aComponentElements = document.querySelectorAll("[data-sap-ui-component]");

		assert.equal(aComponentElements.length, iExpectedComponents, `There should be ${iExpectedComponents} declarative elements`);
		aComponentElements.forEach((oElement, idx) => {
			assert.ok(oElement.hasAttribute("data-sap-ui-component"), `Element ${idx + 1} should have the indicator attribute`);
		});

		const deferred = new Deferred();
		let iComponentCount = 0;
		this.stub(ComponentContainer.prototype, "applySettings").callsFake(function(mSettings) {
			// inject `componentCreated` event handler and wait for component creation
			mSettings.componentCreated = function() {
				iComponentCount++;
				// continue the test once all component instances have been created
				if (iComponentCount == iExpectedComponents) {
					deferred.resolve();
				}
			};
			return ComponentContainer.prototype.applySettings.wrappedMethod.apply(this, arguments);
		});

		// execute the ComponentSupport
		ComponentSupport.run();

		// Four ComponentContainers should have been created
		sinon.assert.callCount(ComponentContainer.prototype.applySettings, iExpectedComponents);

		aComponentElements.forEach((oElement, idx) => {
			assert.notOk(oElement.hasAttribute("data-sap-ui-component"), `Element ${idx + 1} should not have the indicator attribute anymore`);
			assert.ok(oElement.parentNode, `Element ${idx + 1} should still be part of the DOM`);
		});

		assert.equal(document.querySelectorAll("[data-sap-ui-component]").length, 0, "There should not be any declarative elements anymore");

		// Directly executing run again shouldn't try to create the same containers again
		ComponentSupport.run();

		// Still, only four ComponentContainers should have been created
		sinon.assert.callCount(ComponentContainer.prototype.applySettings, iExpectedComponents);

		return deferred.promise.then(function() {

			for (let i = 1; i <= iExpectedComponents; i++) {
				assert.ok(document.getElementById(`div${i}`), `Placeholder DIV for Component ${i} found!`);
				assert.ok(document.getElementById(`container${i}`), `ComponentContainer element for Component ${i} found!`);

				const oContainer = Element.getElementById(`container${i}`);
				assert.ok(oContainer instanceof ComponentContainer, `ComponentContainer for Component ${i} found!`);

				const oComponent = oContainer.getComponentInstance();
				assert.ok(oComponent instanceof UIComponent, `UIComponent instance for Component ${i} found!`);

				assert.equal(oComponent.getId(), `${oContainer.getId()}-component${i}`, `The id of Component ${i} is correct!`);
				assert.equal(oComponent.getMetadata().getName(), "sap.ui.test.v2empty.Component", `The name of the Component ${i} is correct!`);
			}

			// Executing run again afterwards also shouldn't try to create the same containers again
			ComponentSupport.run();

			// Still, only four ComponentContainers should have been created
			sinon.assert.callCount(ComponentContainer.prototype.applySettings, iExpectedComponents);

		});

	});

});
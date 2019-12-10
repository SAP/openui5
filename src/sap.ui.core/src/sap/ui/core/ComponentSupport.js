/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentSupport
sap.ui.define([
	'sap/ui/base/DataType',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/library',
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/base/strings/camelize"
],
	function(
		DataType,
		Component,
		ComponentContainer,
		library,
		Log,
		ObjectPath,
		camelize
	) {
	"use strict";

	var ComponentLifecycle = library.ComponentLifecycle;
	var ComponentContainerMetadata = ComponentContainer.getMetadata();


	/**
	 * The module <code>sap/ui/core/ComponentSupport</code> provides functionality
	 * which is used to find declared Components in the HTML page and to create
	 * the Component instances which will be put into a {@link sap.ui.core.ComponentContainer}.
	 *
	 * The {@link module:sap/ui/core/ComponentSupport.run} function is called automatically once the module has been required.
	 * This allows declarative support for components.
	 *
	 * <h3>Usage</h3>
	 * To enable the <code>sap/ui/core/ComponentSupport</code> include it as the <code>oninit</code> module in the bootstrap:
	 * <pre>
	 * &lt;script id="sap-ui-bootstrap"
	 *     src="/resources/sap-ui-core.js"
	 *     ...
	 *     data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
	 *     ...>
	 * &lt;/script>
	 * </pre>
	 *
	 * To load and render components inside the HTML page, a special data attribute has to be specified
	 * on the respective DOM elements: <code>data-sap-ui-component</code>.
	 * All DOM elements marked with this data attribute will be regarded as container elements for the created
	 * <code>ComponentContainer</code> instances.
	 *
	 * <pre>
	 * &lt;body id="content" class="sapUiBody sapUiSizeCompact" role="application">
	 *     ...
	 *     &lt;div data-sap-ui-component
	 *         data-id="container"
	 *         data-name="sap.ui.core.samples.formatting"
	 *         ...
	 *         data-handle-validation="true"
	 *         ...>
	 *     &lt;/div>
	 *     ...
	 * &lt;/body>
	 * </pre>
	 *
	 * <h3>Configuration</h3>
	 * All configuration settings for the <code>ComponentContainer</code> have to be defined as <code>data</code>
	 * attributes on the respective HTML tags.
	 * Each data attribute will be interpreted as a setting and parsed considering
	 * the data type of the matching property in the <code>ComponentContainer</code>.
	 *
	 * As HTML is case-insensitive, in order to define a property with upper-case characters, you have to "escape" them
	 * with a dash character, similar to CSS attributes.
	 * The following code gives an example:
	 *
	 * <pre>
	 * &lt;div data-sap-ui-component ... data-handle-validation="true" ...>&lt;/div>
	 * </pre>
	 *
	 * <b>Beware:</b>
	 *
	 * The <code>ComponentSupport</code> module enforces asynchronous loading of the
	 * respective component and its library dependencies.
	 * This is done by applying default settings for the following properties of the <code>ComponentContainer</code>:
	 *
	 * <ul>
	 *   <li><code>async</code> {boolean} (<b>forced to <code>true</code></b>)</li>
	 *   <li><code>manifest</code> {boolean|string} (<b>forced to <code>true</code> if no string is provided to ensure manifest first</b>)</li>
	 *   <li><code>lifecycle</code> {sap.ui.core.ComponentLifecycle} (defaults to <code>Container</code>)</li>
	 *   <li><code>autoPrefixId</code> {boolean} (defaults to <code>true</code>)</li>
	 * </ul>
	 *
	 * See {@link topic:82a0fcecc3cb427c91469bc537ebdddf Declarative API for Initial Components}.
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.58.0
	 * @version ${version}
	 * @namespace
	 * @alias module:sap/ui/core/ComponentSupport
	 */
	var ComponentSupport = function() {
	};


	/**
	 * Find all DOM elements with the attribute <code>data-sap-ui-component</code>
	 * and parse the attributes from these DOM elements for the settings of the
	 * <code>ComponentContainer</code> which will be placed into these DOM elements.
	 *
	 * This function is called automatically once the module has been required.
	 *
	 * @public
	 */
	ComponentSupport.run = function() {
		var aElements = ComponentSupport._find();
		for (var i = 0, l = aElements.length; i < l; i++) {
			var oElement = aElements[i];
			Log.debug("Parsing element " + oElement.outerHTML, "", "sap/ui/core/ComponentSupport");
			var mSettings = ComponentSupport._parse(oElement);
			ComponentSupport._applyDefaultSettings(mSettings);
			Log.debug("Creating ComponentContainer with the following settings", JSON.stringify(mSettings, 0, 2), "sap/ui/core/ComponentSupport");
			new ComponentContainer(mSettings).placeAt(oElement);
			// Remove marker so that the element won't be processed again in case "run" is called again
			oElement.removeAttribute("data-sap-ui-component");
		}
	};

	/**
	 * Find all DOM elements with the attribute <code>data-sap-ui-component</code>
	 * and parse the attributes from these DOM elements for the settings of the
	 * <code>ComponentContainer</code> which will be placed into these DOM elements.
	 *
	 * @returns {NodeList} array of <code>Node</code>s
	 * @private
	 */
	ComponentSupport._find = function() {
		return document.querySelectorAll("[data-sap-ui-component]");
	};

	/**
	 * Parses the attributes of the given DOM element and creates a settings
	 * map. Each attribute starting with <code>data-</code> will be interpret
	 * as setting and be parsed by considering the data type of the matching
	 * property in the <code>ComponentContainer</code>. As HTML is case-insensitive
	 * camel cased properties have to be written in dashed form, e.g.
	 * <code>componentCreated</code> as <code>data-component-created</code>.
	 *
	 * @param {Node} oElement the DOM element to be parsed
	 * @returns {object} settings map
	 * @private
	 */
	ComponentSupport._parse = function(oElement) {
		var mSettings = {};
		for (var i = 0, l = oElement.attributes.length; i < l; i++) {
			var oAttribute = oElement.attributes[i];
			// parse every data- property besides data-sap-ui-component
			var oParsedAttributeName = /^data-((?!sap-ui-component).+)/g.exec(oAttribute.name);
			if (oParsedAttributeName) {
				var sKey = camelize(oParsedAttributeName[1]);
				var oValue = oAttribute.value;
				// special handling for id property
				if (sKey !== "id") {
					var oProperty = ComponentContainerMetadata.getProperty(sKey);
					var oEvent = !oProperty && ComponentContainerMetadata.getEvent(sKey);
					if (!oProperty && !oEvent) {
						Log.warning("Property or event \"" + sKey + "\" will be ignored as it does not exist in sap.ui.core.ComponentContainer");
						continue;
					}
					if (oProperty) {
						var oType = DataType.getType(oProperty.type);
						if (!oType) {
							throw new Error("Property \"" + oProperty.name + "\" has no known type");
						}
						oValue = oType.parseValue(oValue);
					} else if (oEvent) {
						var fnCallback = ObjectPath.get(oValue);
						if (typeof fnCallback !== "function") {
							throw new Error("Callback handler for event \"" + oEvent.name + "\" not found");
						}
						oValue = fnCallback;
					}
				}
				mSettings[sKey] = oValue;
			}
		}
		return mSettings;
	};

	/**
	 * Applies the default settings for the <code>ComponentContainer</code>
	 * for some properties such as:
	 * <ul>
	 *   <li><code>async</code> {boolean} (<b>forced to <code>true</code></b>)</li>
	 *   <li><code>manifest</code> {boolean|string} (<b>forced to <code>true</code> if no string is provided to ensure manifest first</b>)</li>
	 *   <li><code>lifecycle</code> {sap.ui.core.ComponentLifecycle} (defaults to <code>Container</code>)</li>
	 *   <li><code>autoPrefixId</code> {boolean} (defaults to <code>true</code>)</li>
	 * </ul>
	 *
	 * @param {object} mSettings settings map to be adopted
	 * @private
	 */
	ComponentSupport._applyDefaultSettings = function(mSettings) {
		// force async loading behavior
		mSettings.async = true;

		// ignore boolean values for manifest property and force manifest first
		if (mSettings.manifest === undefined || mSettings.manifest === "true") {
			mSettings.manifest = true;
		} else if (mSettings.manifest === "false") {
			Log.error("Ignoring \"manifest=false\" for ComponentContainer of component \"" + mSettings.name + "\" as it is not supported by ComponentSupport. " +
				"Forcing \"manifest=true\"", "", "sap/ui/core/ComponentSupport");
			mSettings.manifest = true;
		}

		// different default value behavior for declarative components
		mSettings.lifecycle = mSettings.lifecycle === undefined ? ComponentLifecycle.Container : mSettings.lifecycle;
		mSettings.autoPrefixId = mSettings.autoPrefixId === undefined ? true : mSettings.autoPrefixId;
	};

	// Automatically run once
	ComponentSupport.run();

	return ComponentSupport;

});
/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentSupport
sap.ui.define(['jquery.sap.global', 'sap/ui/base/DataType', 'sap/ui/core/Component', 'sap/ui/core/ComponentContainer', 'sap/ui/core/library', 'jquery.sap.script', 'jquery.sap.strings'],
	function(jQuery, DataType, Component, ComponentContainer, library /*, jQuerySapScript, jQuerySapStrings */) {
	"use strict";

	var ComponentLifecycle = library.ComponentLifecycle;
	var ComponentContainerMetadata = ComponentContainer.getMetadata();


	/**
	 * The class <code>sap.ui.core.ComponentSupport</code> provides functionality
	 * which is used to find declared Components in the HTML page and to create
	 * the Component instances which will be put into a ComponentContainer.
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.58.0
	 * @version ${version}
	 * @alias sap.ui.core.ComponentSupport
	 */
	var ComponentSupport = function() {
	};


	/**
	 * Find all DOM elements with the attribute <code>data-sap-ui-component</div>
	 * and parse the attributes from these DOM elements for the settings of the
	 * <code>ComponentContainer</code> which will be placed into these DOM elements.
	 *
	 * @public
	 */
	ComponentSupport.run = function() {
		var aElements = ComponentSupport._find();
		for (var i = 0, l = aElements.length; i < l; i++) {
			jQuery.sap.log.debug("ComponentSupport found and parses element: " + aElements[i]);
			var mSettings = ComponentSupport._parse(aElements[i]);
			ComponentSupport._applyDefaultSettings(mSettings);
			jQuery.sap.log.debug("ComponentSupport creates ComponentContainer with the following settings:\n" + JSON.stringify(mSettings, 0, 2));
			new ComponentContainer(mSettings).placeAt(aElements[i]);
		}
	};

	/**
	 * Find all DOM elements with the attribute <code>data-sap-ui-component</div>
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
				var sKey = jQuery.sap.camelCase(oParsedAttributeName[1]);
				var oValue = oAttribute.value;
				// special handling for id property
				if (sKey !== "id") {
					var oProperty = ComponentContainerMetadata.getProperty(sKey);
					var oEvent = !oProperty && ComponentContainerMetadata.getEvent(sKey);
					if (!oProperty && !oEvent) {
						throw new Error("Property or event \"" + sKey + "\" does not exist in sap.ui.core.ComponentContainer");
					}
					if (oProperty) {
						var oType = DataType.getType(oProperty.type);
						if (!oType) {
							throw new Error("Property \"" + oProperty.name + "\" has no known type");
						}
						oValue = oType.parseValue(oValue);
					} else if (oEvent) {
						var fnCallback = jQuery.sap.getObject(oValue);
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
		if (mSettings.manifest === undefined || mSettings.manifest === "true" || mSettings.manifest === "false") {
			mSettings.manifest = true;
		}
		// different default value behavior for declarative components
		mSettings.lifecycle = mSettings.lifecycle === undefined ? ComponentLifecycle.Container : mSettings.lifecycle;
		mSettings.autoPrefixId = mSettings.autoPrefixId === undefined ? true : mSettings.autoPrefixId;
	};

	// get the URI parameters
	var oUriParams = jQuery.sap.getUriParameters();
	var sAutorun = oUriParams.get("sap-ui-xx-componentsupport-autorun");
	if (!sAutorun || sAutorun.toLowerCase() !== "false") {
		ComponentSupport.run();
	} else {
		jQuery.sap.log.info("ComponentSupport autorun has been interrupted by URL parameter.");
	}

	return ComponentSupport;

});

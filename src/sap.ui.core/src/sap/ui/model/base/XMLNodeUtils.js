/*
 * ! ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/DataType', 'sap/ui/base/ManagedObject'
], function(jQuery, DataType, ManagedObject) {
	"use strict";

	return {
		parseScalarType: function(sType, sValue, sName, oController) {
			// check for a binding expression (string)
			var oBindingInfo = ManagedObject.bindingParser(sValue, oController, true);
			if (oBindingInfo && typeof oBindingInfo === "object") {
				return oBindingInfo;
			}

			var vValue = sValue = oBindingInfo || sValue; // oBindingInfo could be an unescaped string
			var oType = DataType.getType(sType);
			if (oType) {
				if (oType instanceof DataType && !oType.isValid(vValue)) {//parse only invalid values
					vValue = oType.parseValue(sValue);
				}
				// else keep original sValue (e.g. for enums)
			} else {
				throw new Error("Property " + sName + " has unknown type " + sType);
			}

			// Note: to avoid double resolution of binding expressions, we have to escape string values once again
			return typeof vValue === "string" ? ManagedObject.bindingParser.escape(vValue) : vValue;
		},

		localName: function(xmlNode) { // localName for standard browsers, baseName for IE, nodeName in the absence of namespaces return
			return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
		},

		findControlClass: function(sNamespaceURI, sLocalName) {
			var sClassName;
			var mLibraries = sap.ui.getCore().getLoadedLibraries();
			jQuery.each(mLibraries, function(sLibName, oLibrary) {
				if (sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name) {
					sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
				}
			});
			// TODO guess library from sNamespaceURI and load corresponding lib!?
			sClassName = sClassName || sNamespaceURI + "." + sLocalName;

			// ensure that control and library are loaded
			jQuery.sap.require(sClassName); // make sure oClass.getMetadata() exists
			var oClassObject = jQuery.sap.getObject(sClassName);
			if (oClassObject) {
				return oClassObject;
			} else {
				jQuery.sap.log.error("Can't find object class '" + sClassName + "' for XML-view", "", "XMLTemplateProcessor.js");
			}
		}

	};
});

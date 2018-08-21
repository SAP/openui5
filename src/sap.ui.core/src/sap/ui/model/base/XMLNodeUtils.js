/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/base/DataType',
	'sap/ui/base/ManagedObject',
	'sap/base/util/ObjectPath',
	'sap/base/Log'
], function(jQuery, DataType, ManagedObject, ObjectPath, Log) {
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
			var fnClass = sap.ui.requireSync(sClassName.replace(/\./g, "/")); // make sure oClass.getMetadata() exists
			fnClass = fnClass || ObjectPath.get(sClassName);
			if (fnClass) {
				return fnClass;
			} else {
				Log.error("Can't find object class '" + sClassName + "' for XML-view", "", "XMLTemplateProcessor.js");
			}
		},
		getChildren: function(oNode) {
			var i, oNodeList = oNode.childNodes, n = oNodeList.length, aChildren = [];

			// cache live collection so that removing a template node does not hurt
			for (i = 0; i < n; i++) {
				// process only ELEMENT_NODEs
				if (oNodeList.item(i).nodeType === 1 /* Node.ELEMENT_NODE */) {
					aChildren.push(oNodeList.item(i));
				}
			}

			return aChildren;
		}

	};
});
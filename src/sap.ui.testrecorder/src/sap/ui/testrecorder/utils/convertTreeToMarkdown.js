/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	// Constants
	var PAGE_CONTENT_HEADER = "## Page content";
	var DEFAULT_INDENT = "  ";

	var DEFAULT_OPTIONS = {
		indent: DEFAULT_INDENT,
		verbose: false
	};

	/**
	 * Converts a control tree structure into a markdown-formatted string representation.
	 *
	 * The function takes a tree structure (single node or array of nodes) and formats it
	 * as an indented markdown hierarchy showing each control's metadata and relationships.
	 *
	 * <b>Note:</b> No module from <code>sap/ui/testrecorder</code> should be used for productive coding!
	 *
	 * @alias module:sap/ui/testrecorder/utils/convertTreeToMarkdown
	 * @param {sap.ui.testrecorder.ControlTreeNode|Array<sap.ui.testrecorder.ControlTreeNode>} vTree - Control tree (single node or array of root nodes)
	 * @param {Object} [oOptions] - Formatting options
	 * @param {string} [oOptions.indent="  "] - Indentation string for nested levels
	 * @param {boolean} [oOptions.verbose=false] - Whether to include verbose output (full control IDs and class names)
	 * @returns {string} Markdown-formatted string representation of the control tree
	 * @private
	 * @since 1.147
	 */
	function convertTreeToMarkdown(vTree, oOptions) {
		var aRoots = Array.isArray(vTree) ? vTree.slice() : [vTree];
		var oMergedOptions = Object.assign({}, DEFAULT_OPTIONS, oOptions);
		var aLines = [PAGE_CONTENT_HEADER];

		aRoots.forEach(function (oRoot) {
			traverseNode(oRoot, 0, aLines, oMergedOptions);
		});

		return aLines.join("\n");
	}

	/**
	 * Recursively traverses a node and its children, appending formatted lines to output.
	 * @param {sap.ui.testrecorder.ControlTreeNode} oNode - Node to traverse
	 * @param {number} iLevel - Current indentation level
	 * @param {Array<string>} aOut - Output array to append lines to
	 * @param {Object} oOptions - Formatting options
	 * @private
	 */
	function traverseNode(oNode, iLevel, aOut, oOptions) {
		if (!oNode) {
			return;
		}

		aOut.push(formatNodeLine(oNode, iLevel, oOptions));

		// Process children
		var aChildren = oNode.content || [];
		for (var iIndex = 0; iIndex < aChildren.length; iIndex++) {
			traverseNode(aChildren[iIndex], iLevel + 1, aOut, oOptions);
		}
	}

	/**
	 * Formats a single node line with indentation and attributes.
	 * @param {sap.ui.testrecorder.ControlTreeNode} oNode - Node to format
	 * @param {number} iLevel - Indentation level
	 * @param {Object} oOptions - Formatting options
	 * @returns {string} Formatted node line
	 * @private
	 */
	function formatNodeLine(oNode, iLevel, oOptions) {
		var aParts = [];

		// ID token (only when verbose)
		if (oOptions.verbose) {
			aParts.push("id=" + oNode.id);
		}

		// Include control class name: full when verbose, otherwise only last segment
		if (oNode.name) {
			var sDisplayName = oOptions.verbose ? oNode.name : getSimpleName(oNode.name);
			aParts.push(sDisplayName);
		}

		var oData = oNode.data || {};

		Object.keys(oData).forEach(function (sKey) {
			var vValue = oData[sKey];
			if (typeof vValue === "boolean") {
				if (vValue === true) {
					// For true booleans, emit bare attribute (e.g. focused, hidden, busy)
					aParts.push(sKey);
				}
			} else {
				var sFormatted = formatAttrValue(vValue);
				aParts.push(sKey + "=" + sFormatted);
			}
		});

		// nodeId (snapshot-relative identifier for API consumers)
		if (oNode.nodeId) {
			aParts.push("nodeId=" + formatAttrValue(oNode.nodeId));
		}

		return oOptions.indent.repeat(iLevel) + aParts.join(" ");
	}

	/**
	 * Formats an attribute value for markdown output.
	 * @param {*} vValue - Value to format
	 * @returns {string|boolean} Formatted value (boolean true returns true, others return strings)
	 * @private
	 */
	function formatAttrValue(vValue) {
		if (typeof vValue === "boolean") {
			// Boolean true -> print key alone; false -> key=false (handled by caller)
			return vValue === true ? true : "false";
		}
		if (typeof vValue === "number") {
			return String(vValue);
		}
		if (typeof vValue === "string") {
			return '"' + vValue.replace(/"/g, '\\"') + '"';
		}
		if (vValue === undefined || vValue === null) {
			return '""';
		}
		// Fallback for complex types
		try {
			return '"' + JSON.stringify(vValue).replace(/"/g, '\\"') + '"';
		} catch (e) {
			// Guard against circular references
			// (e.g. live UI5 instances stored in mProperties/mAssociations).
			return '"[object]"';
		}
	}

	/**
	 * Extracts the simple name from a qualified name by returning the last segment after the final dot.
	 * @param {string} sQualifiedName - Fully qualified name (e.g., "sap.m.Button")
	 * @returns {string} Simple name (e.g., "Button") or the original name if no dots are present
	 * @private
	 */
	function getSimpleName(sQualifiedName) {
		var aNameParts = String(sQualifiedName).split('.');
		return aNameParts[aNameParts.length - 1] || sQualifiedName;
	}

	return convertTreeToMarkdown;
});

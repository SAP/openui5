/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
], function (
	MapEditor
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>AnnotationsEditor</code>.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.annotationsEditor.AnnotationsEditor
	 * @author SAP SE
	 * @since 1.93
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.93
	 * @ui5-restricted sap.ui.fl
	 */
	var AnnotationsEditor = MapEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.annotationsEditor.AnnotationsEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: MapEditor.getMetadata().getRenderer().render
	});

	AnnotationsEditor.prototype.processInputValue = function(oValue) {
		return {
			value: oValue,
			type: "json"
		};
	};

	AnnotationsEditor.prototype._isValidItem = function() {
		// Temporary fix, can be properly validated once the json type is registered in the MapEditor
		return true;
	};

	return AnnotationsEditor;
});

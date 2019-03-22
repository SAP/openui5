/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/layout/library"
], function (ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new GridContainerSettings.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Holds a set of settings for <code>sap.f.GridContainer</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @constructor
	 * @experimental
	 * @since 1.65
	 * @alias sap.f.GridContainerSettings
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainerSettings = ManagedObject.extend("sap.f.GridContainerSettings", {
		// TODO Allow only rem and px, because of IE
		metadata: {
			library: "sap.f",
			properties: {

				columns: { type: "Number" },

				columnSize: { type: "sap.ui.core.CSSSize", defaultValue: "80px" },

				rowSize: { type: "sap.ui.core.CSSSize", defaultValue: "80px" },

				gap: { type: "sap.ui.core.CSSSize", defaultValue: "16px" }
			}
		}
	});

	return GridContainerSettings;
});
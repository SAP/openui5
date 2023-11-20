/*!
* ${copyright}
*/

sap.ui.define([
	"sap/m/ObjectStatus",
	"sap/m/ObjectStatusRenderer"
], function (
	MObjectStatus,
	MObjectStatusRenderer
) {
	"use strict";

	/**
	 * Constructor for a new ObjectStatus.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.m.ObjectStatus
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.110
	 * @alias sap.ui.integration.controls.ObjectStatus
	 */
	var ObjectStatus = MObjectStatus.extend("sap.ui.integration.controls.ObjectStatus", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				showStateIcon: { type: "boolean", defaultValue: false }
			}
		},
		renderer: MObjectStatusRenderer
	});

	ObjectStatus.prototype.onBeforeRendering = function () {
		if (this.getShowStateIcon()) {
			if (!this.getIcon()) {
				this.addStyleClass("sapMObjStatusShowIcon");
			} else {
				this.addStyleClass("sapMObjStatusShowCustomIcon");
			}
		}
	};

	return ObjectStatus;
});
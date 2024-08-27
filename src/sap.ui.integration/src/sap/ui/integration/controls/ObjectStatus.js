/*!
* ${copyright}
*/

sap.ui.define([
	"sap/m/library",
	'sap/ui/core/library',
	"sap/m/ObjectStatus",
	"sap/m/ObjectStatusRenderer"
], function (
	library,
	coreLibrary,
	MObjectStatus,
	MObjectStatusRenderer
) {
	"use strict";

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	// shortcuts for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

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

	ObjectStatus.prototype._isEmpty = function() {
		return this.getEmptyIndicatorMode() === EmptyIndicatorMode.Off &&
			this._hasNoValue();
	};

	ObjectStatus.prototype._shouldRenderEmptyIndicator = function() {
		return this.getEmptyIndicatorMode() === EmptyIndicatorMode.On &&
			this._hasNoValue();
	};

	ObjectStatus.prototype._hasNoValue = function() {
		return !this.getText() &&
			(!this.getShowStateIcon() || (this.getShowStateIcon() && this.getState() === ValueState.None && !this.getIcon()));
	};

	ObjectStatus.prototype.onBeforeRendering = function () {
		if (this.getShowStateIcon()) {
			if (!this.getIcon()) {
				this.addStyleClass("sapMObjStatusShowIcon");
			} else {
				this.addStyleClass("sapMObjStatusShowCustomIcon");
			}
		}

		this.addStyleClass("sapUiIntObjStatus");
	};

	return ObjectStatus;
});
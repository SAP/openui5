/*!
* ${copyright}
*/

sap.ui.define([
	"./library",
	"sap/m/GenericTile",
	"sap/m/ToDoCardRenderer",
	"sap/m/GenericTileRenderer"
], function (
	library,
	GenericTile,
	ToDoCardRenderer,
	GenericTileRenderer
	) {
		"use strict";

		var FrameType = library.FrameType,
			GenericTileMode = library.GenericTileMode,
			LoadState = library.LoadState;
	/**
	* Constructor for a new sap.m.ActionTile control.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] initial settings for the new control
	*
	* @class
	*Used to create a customizable tile for your todos and situations within the new My Home in SAP S/4HANA cloud
	* @extends sap.m.GenericTile
	*
	* @author SAP SE
	* @version ${version}
	* @since 1.107.0
	*
	* @private
	* @alias sap.m.ActionTile
	*/

	var ActionTile = GenericTile.extend("sap.m.ActionTile", /** @lends sap.m.ActionTile.prototype */{
		metadata: {
			library: "sap.m"
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				if (!oControl.getHeaderImage() || oControl.getState() === LoadState.Loading) {
					ToDoCardRenderer.render(oRm, oControl);
				} else {
					GenericTileRenderer.render(oRm, oControl);
				}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	ActionTile.prototype.init = function() {
		this.addStyleClass("sapMAT");
		this.setMode(GenericTileMode.ActionMode);
		this.setFrameType(FrameType.TwoByOne);
		GenericTile.prototype.init.apply(this, arguments);
	};

	ActionTile.prototype.onBeforeRendering = function() {
		if (this.getHeaderImage()) {
			this.addStyleClass("sapMATSituationCard");
		}
		if (this.getEnableNavigationButton()) {
			this.removeStyleClass("sapMATHideActionButton");
		} else {
			this.addStyleClass("sapMATHideActionButton");
		}
		GenericTile.prototype.onBeforeRendering.apply(this, arguments);
	};

	ActionTile.prototype.onAfterRendering = function() {
		if (this.getHeaderImage() && this.getDomRef()) {
			this._removeStyleClasses();
		}
		GenericTile.prototype.onAfterRendering.apply(this, arguments);
	};

	/**
	* Removes the style classes inherited from the parent control
	* @private
	*/
	ActionTile.prototype._removeStyleClasses = function() {
		this.getDomRef().classList.remove("sapMGT");
		this.getDomRef().classList.remove("TwoByOne");
		this.getDomRef().classList.remove("sapMGTActionMode");
	};

	/**
	 * Returns the size description of the tile that is announced by the screen reader
	 *
	 * @returns {string} Text for the size description
	 * @private
	 */
	ActionTile.prototype._getSizeDescription = function () {
		return this._oRb.getText("ACTION_TILE_SIZE");
	};

	return ActionTile;
});

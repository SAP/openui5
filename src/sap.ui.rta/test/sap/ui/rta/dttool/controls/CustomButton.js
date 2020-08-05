/*
 * ! ${copyright}
 */
// Provides control sap.ui.rta.dttool.controls.CustomButton.
/* globals sap */
sap.ui.define([
	"sap/m/Button",
	"sap/m/ButtonRenderer"
], function (
	Button,
	ButtonRenderer
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.dttool.controls.CustomButton control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple CustomButton.
	 * @extends sap.m.InputListItem
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.rta.dttool.controls.CustomButton
	 */
	var CustomButton = Button.extend('sap.ui.rta.dttool.controls.CustomButton', {
		metadata: {
			properties: {
				newProperty : {
					type : "any"
				}
			}
		},

		renderer : function () {
			ButtonRenderer.render.apply(this, arguments);
		}
	});

	return CustomButton;
});
/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeaderActionButton.
sap.ui.define(["sap/m/Button", "./library"], function (Button, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageHeaderActionButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * Button that can be used in the ObjectPageHeader action aggregation.
	 * @extends sap.m.Button
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @since 1.26
	 * @alias sap.uxap.ObjectPageHeaderActionButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageHeaderActionButton = Button.extend("sap.uxap.ObjectPageHeaderActionButton", /** @lends sap.uxap.ObjectPageHeaderActionButton.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Hide the button text when rendered into the headerTitle part of the ObjectPageLayout.
				 * This is useful if you want to display icons only in the headerTitle part but still want to display text + icon in the actionSheet that appears when not enough space is available on the screen for displaying all actions.
				 */
				hideText: {type: "boolean", defaultValue: true},

				/**
				 * Hide the button icon when rendered into the headerTitle part of the ObjectPageLayout.
				 * This is useful if you want to display texts only in the headerTitle part but still want to display text + icon in the actionSheet that appears when not enough space is available on the screen for displaying all actions.
				 */
				hideIcon: {type: "boolean", defaultValue: false}
			}
		}
	});

	ObjectPageHeaderActionButton.prototype.applySettings = function (mSettings, oScope) {

		if (Button.prototype.applySettings) {
			Button.prototype.applySettings.call(this, mSettings, oScope);
		}

		this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideText", this.getHideText());
		this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideIcon", this.getHideIcon());
	};

	ObjectPageHeaderActionButton.prototype.setHideText = function (bValue, bInvalidate) {

		this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideText", bValue);

		return this.setProperty("hideText", bValue, bInvalidate);
	};


	ObjectPageHeaderActionButton.prototype.setHideIcon = function (bValue, bInvalidate) {

		this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideIcon", bValue);

		return this.setProperty("hideIcon", bValue, bInvalidate);
	};

	return ObjectPageHeaderActionButton;

});

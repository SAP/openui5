/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeaderActionButton.
sap.ui.define(["sap/m/Button", "./library", "./ObjectPageHeaderActionButtonRenderer"], function(Button, library, ObjectPageHeaderActionButtonRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>ObjectPageHeaderActionButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A Button that is used in the <code>actions</code> aggregation of the {@link sap.uxap.ObjectPageHeader}.
	 *
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

			interfaces : [
			    "sap.m.IOverflowToolbarContent"
			],
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
				hideIcon: {type: "boolean", defaultValue: false},

				/**
				 * Determines the order in which the button overflows.
				 * @since 1.34.0
				 */
				importance: {
					type: "sap.uxap.Importance",
					group: "Behavior",
					defaultValue: library.Importance.High
				}

			},
			designtime: "sap/uxap/designtime/ObjectPageHeaderActionButton.designtime"
		}
	});

	ObjectPageHeaderActionButton.prototype.init = function () {
		this._bInternalVisible = this.getVisible();
	};

	ObjectPageHeaderActionButton.prototype.onAfterRendering = function () {
		if (!this._getInternalVisible()) {
			this.$().hide();
		}
	};

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

	ObjectPageHeaderActionButton.prototype._setInternalVisible = function (bValue, bInvalidate) {
		this.$().toggle(bValue);
		if (bValue != this._bInternalVisible) {
			this._bInternalVisible = bValue;
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	ObjectPageHeaderActionButton.prototype.setVisible = function (bVisible) {
		var vResult = Button.prototype.setVisible.apply(this, arguments);
		this.getParent() && this.getParent().invalidate();

		return vResult;
	};

	ObjectPageHeaderActionButton.prototype._getInternalVisible = function () {
		return this._bInternalVisible;
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 */
	ObjectPageHeaderActionButton.prototype.getOverflowToolbarConfig = function() {
		var oConfig = {
			canOverflow: true,
			propsUnrelatedToSize: ["importance"],
			getCustomImportance: function () {
				return this.getImportance();
			}.bind(this)
		};

		oConfig.onBeforeEnterOverflow = function(oActionButton) {
			oActionButton.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideText", false, true /* suppress invalidate */);
			oActionButton.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideIcon", false, true /* suppress invalidate */);
		};

		oConfig.onAfterExitOverflow = function(oActionButton) {
			oActionButton.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideText", oActionButton.getHideText(), true /* suppress invalidate */);
			oActionButton.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideIcon", oActionButton.getHideIcon(), true /* suppress invalidate */);
		};

		return oConfig;
	};

	return ObjectPageHeaderActionButton;

});

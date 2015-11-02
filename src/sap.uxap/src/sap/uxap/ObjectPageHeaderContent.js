/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeaderContent.
sap.ui.define(["sap/ui/core/Control", "./library", "sap/m/Button"],
	function (Control, library, Button) {
		"use strict";

		/**
		 * Constructor for a new ObjectPageHeaderContent.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * ObjectPageHeaderContent represents the dynamic part of an Object page header. May contain any control.
		 * Unlike the Object page header title, the Object page header content is part of the scrolling area of the Object page.
		 * This enables it to hold any amount of information and still be usable on a mobile device.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 *
		 * @constructor
		 * @public
		 * @since 1.30
		 * @alias sap.uxap.ObjectPageHeaderContent
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ObjectPageHeaderContent = Control.extend("sap.uxap.ObjectPageHeaderContent", /** @lends sap.uxap.ObjectPageHeaderContent.prototype */ {
			metadata: {

				library: "sap.uxap",
				properties: {

					/**
					 * Determines the design of the header - Light or Dark
					 */
					contentDesign: {
						type: "sap.uxap.ObjectPageHeaderDesign",
						group: "Misc",
						defaultValue: sap.uxap.ObjectPageHeaderDesign.Light
					}
				},
				aggregations: {

					/**
					 * The list of Objects of type sap.ui.core.Control.
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

					/**
					 *
					 * Internal aggregation for the "Edit Header" button.
					 */
					_editHeaderButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
				}
			}
		});


		ObjectPageHeaderContent.prototype.onBeforeRendering = function () {
			var oParent = this.getParent();

			if (oParent && (oParent instanceof library.ObjectPageLayout) && oParent.getShowEditHeaderButton()) {
				this._getInternalBtnAggregation("_editHeaderButton", "EDIT_HEADER", "-editHeaderBtn").attachPress(this._handleEditHeaderButtonPress, this);
			}
		};

		ObjectPageHeaderContent.prototype._handleEditHeaderButtonPress = function (oEvent) {
			this.getParent().fireEditHeaderButtonPress();
		};

		ObjectPageHeaderContent.prototype._getInternalBtnAggregation = function (sAggregationName, sBtnText, sBtnIdText) {
			if (!this.getAggregation(sAggregationName)) {
				var oBtn = new Button({
					text: library.i18nModel.getResourceBundle().getText(sBtnText),
					id: this.getId() + sBtnIdText
				});
				this.setAggregation(sAggregationName, oBtn);
			}
			return this.getAggregation(sAggregationName);
		};

		/**
		 * The layout data to apply to a header cluster
		 * called from the renderer
		 * @private
		 */
		ObjectPageHeaderContent.prototype._getLayoutDataForControl = function (oControl) {
			var oLayoutData = oControl.getLayoutData();

			if (!oLayoutData) {
				return;
			} else if (oLayoutData instanceof library.ObjectPageHeaderLayoutData) {
				return oLayoutData;
			} else if (oLayoutData.getMetadata().getName() == "sap.ui.core.VariantLayoutData") {
				// multiple LayoutData available - search here
				var aLayoutData = oLayoutData.getMultipleLayoutData();
				for (var i = 0; i < aLayoutData.length; i++) {
					var oLayoutData2 = aLayoutData[i];
					if (oLayoutData2 instanceof library.ObjectPageHeaderLayoutData) {
						return oLayoutData2;
					}
				}
			}
		};

		return ObjectPageHeaderContent;

	});

/*!
 * ${copyright}
 */
sap.ui.define(["sap/f/cards/BaseContent", "sap/m/HBox", "sap/m/VBox", "sap/m/Text", "sap/m/Title", "sap/f/Avatar", "sap/m/Link","sap/m/Label",  "sap/ui/layout/AlignedFlowLayout"],
	function (BaseContent, HBox, VBox, Text, Title, Avatar, Link , Label, AlignedFlowLayout) {
		"use strict";

		/**
		 * Constructor for a new <code>List</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 *
		 * <h3>Usage</h3>
		 *
		 * <h3>Responsive Behavior</h3>
		 *
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.60
		 * @see {@link TODO Card}
		 * @alias sap.f.cards.ObjectContent
		 */
		var ObjectContent = BaseContent.extend("sap.f.cards.ObjectContent", {
			renderer: {}
		});

		ObjectContent.prototype._getRootContainer = function () {
			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oAlignedFlowLayout = this.getAggregation("_content");
			if (!oAlignedFlowLayout) {
				oAlignedFlowLayout = new AlignedFlowLayout();
				this.setAggregation("_content", oAlignedFlowLayout);
			}

			return oAlignedFlowLayout;
		};

		ObjectContent.prototype.init = function () {
			BaseContent.prototype.init.apply(this, arguments);
			this._getRootContainer();
		};

		ObjectContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.groups) {
				this._addGroups();
			}

			return this;
		};

		ObjectContent.prototype._addGroups = function () {
			var oContainer = this._getRootContainer();
			var aGroups = this.getConfiguration().groups;

			aGroups.forEach(function (oGroup) {

				var oGroupContainer = new VBox();
				oGroupContainer.addStyleClass("sapFCardObjectGroup");
				var oTitle = new Title({ text: oGroup.title });
				oTitle.addStyleClass("sapFCardObjectItemTitle");
				oGroupContainer.addItem(oTitle);

				oGroup.items.forEach(function (oItem) {
					if (oItem.label) {
						//Checks if the label ends with ":" and if not we just add the ":"
						var sLabelText = oItem.label[oItem.label.length - 1] === ":" ? oItem.label : oItem.label += ":";
						var oItemLabel = new Label({text: sLabelText});
						oItemLabel.addStyleClass("sapFCardObjectItemLabel");
					}

					var oItemText;
					if (oItem.value) {
						oItemText = new Text({ text: oItem.value });
					} else if (oItem.link) {
						oItemText = new Link({ href: oItem.link, text: oItem.link });
					}

					oItemText.addStyleClass("sapFCardObjectItemText");
					if (oItem.icon) {
						var oHBox = new HBox({
							items: [
								new Avatar({
									customDisplaySize: "2.5rem",
									displaySize: "Custom",
									src: oItem.icon.src
								}).addStyleClass("sapFCardObjectItemAvatar sapFCardObjectItemLabel"),
								new VBox({
									items: [
										oItemLabel,
										oItemText
									]
								})
							]
						});
						oGroupContainer.addItem(oHBox);
					} else {
						oGroupContainer.addItem(oItemLabel);
						oGroupContainer.addItem(oItemText);
					}
				});

				oContainer.addContent(oGroupContainer);
			});
		};

		return ObjectContent;
	});
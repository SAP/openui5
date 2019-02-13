/*!
 * ${copyright}
 */
sap.ui.define(["sap/f/cards/BaseContent", "sap/m/HBox", "sap/m/VBox", "sap/m/Text", "sap/m/Title", "sap/f/Avatar", "sap/m/Link","sap/m/Label",  "sap/ui/layout/AlignedFlowLayout"],
	function (BaseContent, HBox, VBox, Text, Title, Avatar, Link , Label, AlignedFlowLayout) {
		"use strict";

		/**
		 * Constructor for a new <code>ObjectContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Displays the basic details for an object, for example, a person or a sales order.
		 *
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.64
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
			var aGroups = this.getConfiguration().groups || [];

			aGroups.forEach(function (oGroup) {

				var oGroupContainer = new VBox().addStyleClass("sapFCardObjectGroup");
				var oTitle = new Title({text: oGroup.title}).addStyleClass("sapFCardObjectItemTitle");

				oGroupContainer.addItem(oTitle);

				oGroup.items.forEach(function (oItem) {
					var oItemValue,
						sLabel = oItem.label,
						sValue = oItem.value,
						oItemLabel,
						sHref;

					if (sLabel) {
						// Checks if the label ends with ":" and if not we just add the ":"
						sLabel = sLabel[sLabel.length - 1] === ":" ? sLabel : sLabel += ":";
						oItemLabel = new Label({text: sLabel}).addStyleClass("sapFCardObjectItemLabel");
					}

					if (sValue) {
						switch (oItem.type) {
							case 'link':
								oItemValue = new Link({
									href: oItem.url || sValue,
									text: sValue,
									target: oItem.target || '_blank'
								});
								break;
							case 'email':
								sHref = "mailto:" + sValue;
								if (oItem.emailSubject) {
									sHref += '?subject=' + oItem.emailSubject;
								}
								oItemValue = new Link({href: sHref, text: sValue});
								break;
							case 'phone':
								oItemValue = new Link({href: "tel:" + sValue, text: sValue});
								break;
							default:
								oItemValue = new Text({text: sValue});
								break;
						}
					}

					if (oItemValue) {
						oItemValue.addStyleClass("sapFCardObjectItemText");
					}

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
										oItemValue
									]
								})
							]
						});
						oGroupContainer.addItem(oHBox);
					} else {
						oGroupContainer.addItem(oItemLabel);
						oGroupContainer.addItem(oItemValue);
					}
				});

				oContainer.addContent(oGroupContainer);
			});
		};

		return ObjectContent;
	});
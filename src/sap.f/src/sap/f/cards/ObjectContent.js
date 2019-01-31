/*!
 * ${copyright}
 */
sap.ui.define(["sap/f/cards/BaseContent", "sap/m/HBox", "sap/m/VBox", "sap/m/Text", "sap/m/Title", "sap/f/Avatar", "sap/m/Link"],
	function (BaseContent, HBox, VBox, Text, Title, Avatar, Link) {
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

			var oHBox = this.getAggregation("_content");
			if (!oHBox) {
				oHBox = new HBox({
					wrap: "Wrap"
				});
				this.setAggregation("_content", oHBox);
			}

			return oHBox;
		};

		ObjectContent.prototype.init = function () {
			BaseContent.prototype.init.apply(this, arguments);
			this._getRootContainer();
		};

		ObjectContent.prototype._updateModel = function () {
			this._addGroups();
			BaseContent.prototype._updateModel.apply(this, arguments);
		};

		ObjectContent.prototype._addGroups = function () {
			var oContainer = this._getRootContainer();
			var aGroups = this.getConfiguration().groups;

			aGroups.forEach(function (oGroup) {
				var oGroupContainer = new VBox();
				oGroupContainer.addStyleClass("sapFCardObjectGroup");
				oGroupContainer.addItem(new Title({ text: oGroup.title }));

				oGroup.items.forEach(function (oItem) {
					var oItemLabel = new Text({ text: oItem.label });
					oItemLabel.addStyleClass("sapFCardObjectItemLabel");
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
								}),
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

				oContainer.addItem(oGroupContainer);
			});
		};

		return ObjectContent;
	});
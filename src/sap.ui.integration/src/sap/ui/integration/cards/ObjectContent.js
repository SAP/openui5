/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/cards/BaseContent",
		"sap/m/HBox",
		"sap/m/VBox",
		"sap/m/Text",
		"sap/m/Title",
		"sap/f/Avatar",
		"sap/m/Link",
		"sap/m/Label",
		"sap/ui/core/ResizeHandler",
		"sap/ui/layout/AlignedFlowLayout",
		"sap/ui/dom/units/Rem",
		"sap/ui/integration/util/BindingHelper",
		"sap/f/cards/IconFormatter"
	], function (library, BaseContent, HBox, VBox, Text, Title, Avatar, Link , Label, ResizeHandler, AlignedFlowLayout, Rem, BindingHelper, IconFormatter) {
		"use strict";

		var AreaType = library.AreaType;

		/**
		 * Constructor for a new <code>ObjectContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Displays the basic details for an object, for example, a person or a sales order.
		 *
		 * @extends sap.ui.integration.cards.BaseContent
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.64
		 * @see {@link TODO Card}
		 * @alias sap.ui.integration.cards.ObjectContent
		 */
		var ObjectContent = BaseContent.extend("sap.ui.integration.cards.ObjectContent", {
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
			// registration ID used for deregistering the resize handler
			this._sResizeListenerId = ResizeHandler.register(oAlignedFlowLayout, this.onAlignedFlowLayoutResize.bind(this));

			return oAlignedFlowLayout;
		};

		ObjectContent.prototype.onAlignedFlowLayoutResize = function (oEvent) {
			if (oEvent && (oEvent.size.width === oEvent.oldSize.width) && !oEvent.control) {
				return;
			}

			var oControl = oEvent.control,
				sMinItemWidth = oControl.getMinItemWidth(),
				iNumberOfGroups = oControl.getContent().length,
				iMinItemWidth;

			// the CSS unit of the minItemWidth control property is in rem
			if (sMinItemWidth.lastIndexOf("rem") !== -1) {
				iMinItemWidth = Rem.toPx(sMinItemWidth);
				// the CSS unit of the minItemWidth control property is in px
			} else if (sMinItemWidth.lastIndexOf("px") !== -1) {
				iMinItemWidth = parseFloat(sMinItemWidth);
			}

			var iColumns = Math.floor(oEvent.size.width / iMinItemWidth);

			// This check is for catch the case when the width of the card is bigger and
			// can have more columns than groups
			if (iColumns > iNumberOfGroups) {
				iColumns = iNumberOfGroups;
			}

			//Optimization
			if (this._iColsOld === iColumns) {
				return;
			}

			this._iColsOld = iColumns;

			var lastColIndex = iColumns - 1,
				iRows = Math.ceil(iNumberOfGroups / iColumns);

			oControl.getContent().forEach(function (oItem, iIndex) {
				// Add spacing on every group
				oItem.addStyleClass("sapFCardObjectSpaceBetweenGroup");

				// remove the class only when the group in last on its row
				if (lastColIndex === iIndex && lastColIndex < iNumberOfGroups) {
					oItem.removeStyleClass("sapFCardObjectSpaceBetweenGroup");
					lastColIndex += iColumns;
				}

				// change bottom padding of the last item in each column
				if (iIndex + 1 > (iRows - 1) * iColumns) {
					oItem.addStyleClass("sapFCardObjectGroupLastInColumn");
				} else {
					oItem.removeStyleClass("sapFCardObjectGroupLastInColumn");
				}
			});
		};

		ObjectContent.prototype.exit = function() {
			BaseContent.prototype.exit.apply(this, arguments);

			if (this._sResizeListenerId) {
				ResizeHandler.deregister(this._sResizeListenerId);
				this._sResizeListenerId = "";
			}
		};

		ObjectContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.groups) {
				this._addGroups(oConfiguration);
			}

			return this;
		};

		ObjectContent.prototype._addGroups = function (oConfiguration) {
			var oContainer = this._getRootContainer();
			var aGroups = oConfiguration.groups || [];

			aGroups.forEach(function (oGroup) {

				var oGroupContainer = new VBox().addStyleClass("sapFCardObjectGroup");
				var oTitle = new Title({text: oGroup.title}).addStyleClass("sapFCardObjectItemTitle");

				oGroupContainer.addItem(oTitle);

				oGroup.items.forEach(function (oItem) {
					var oItemValue,
						vLabel = oItem.label,
						vValue = oItem.value,
						oItemLabel,
						vHref,
						aBindingParts = [];

					if (vLabel) {
						// Checks if the label ends with ":" and if not we just add the ":"
						vLabel = BindingHelper.formattedProperty(vLabel, function (sValue) {
							return sValue && sValue[sValue.length - 1] === ":" ? sValue : sValue += ":";
						});
						oItemLabel = new Label({text: vLabel}).addStyleClass("sapFCardObjectItemLabel");
					}

					if (vValue) {
						switch (oItem.type) {
							case 'link':
								oItemValue = new Link({
									href: oItem.url || vValue,
									text: vValue,
									target: oItem.target || '_blank'
								});
								break;
							case 'email':
								if (oItem.value) {
									aBindingParts.push(jQuery.extend({}, oItem.value));
								}
								if (oItem.emailSubject) {
									aBindingParts.push(jQuery.extend({}, oItem.emailSubject));
								}

								vHref = BindingHelper.formattedProperty(aBindingParts, function (sValue, sEmailSubject) {
										if (sEmailSubject) {
											return "mailto:" + sValue + "?subject=" + sEmailSubject;
										} else {
											return "mailto:" + sValue;
										}
									});

								oItemValue = new Link({href: vHref, text: vValue});
								break;
							case 'phone':
								vHref = BindingHelper.formattedProperty(vValue, function (sValue) {
									return "tel:" + sValue;
								});
								oItemValue = new Link({href: vHref, text: vValue});
								break;
							default:
								oItemValue = new Text({text:  vValue});
								break;
						}
					}

					if (oItemValue) {
						oItemValue.addStyleClass("sapFCardObjectItemText");
					}

					if (oItem.icon) {
						var vSrc = BindingHelper.formattedProperty(oItem.icon.src, function (sValue) {
							return IconFormatter.formatSrc(sValue, this._sAppId);
						}.bind(this));

						var oAvatar = new Avatar({
							customDisplaySize: "2.5rem",
							displaySize: "Custom",
							src: vSrc
						}).addStyleClass("sapFCardObjectItemAvatar sapFCardObjectItemLabel");

						var oVbox = new VBox({
							items: [
								oItemLabel,
								oItemValue
							]
						});
						var oHBox = new HBox({
							items: [
								oAvatar,
								oVbox
							]
						});

						oGroupContainer.addItem(oHBox);
					} else {
						oGroupContainer.addItem(oItemLabel);
						oGroupContainer.addItem(oItemValue);
					}
				}, this);
				oContainer.addContent(oGroupContainer);
			}, this);

			this._oActions.setAreaType(AreaType.Content);
			this._oActions.attach(oConfiguration, this);
		};

		return ObjectContent;
	});
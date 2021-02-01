/*!
* ${copyright}
*/
sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/cards/BaseContent",
	"sap/m/library",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Avatar",
	"sap/m/Link",
	"sap/m/Label",
	"sap/ui/core/ResizeHandler",
	"sap/ui/layout/AlignedFlowLayout",
	"sap/ui/dom/units/Rem",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/Utils"
], function (
	library,
	BaseContent,
	mLibrary,
	HBox,
	VBox,
	Text,
	Title,
	Avatar,
	Link ,
	Label,
	ResizeHandler,
	AlignedFlowLayout,
	Rem,
	BindingHelper,
	Utils
) {
	"use strict";

	var AreaType = library.AreaType;

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;

	// shortcut for sap.m.AvatarColor
	var AvatarColor = mLibrary.AvatarColor;

	var FlexRendertype = mLibrary.FlexRendertype;

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
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: {
			apiVersion: 2
		}
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

		oAlignedFlowLayout.addEventDelegate({
			"onAfterRendering": function() {
				this.getContent().forEach(function(oElement){
					if (!oElement.getVisible()) {
						document.getElementById("sap-ui-invisible-" + oElement.getId()).parentElement.classList.add("sapFCardInvisibleContent");
					}
				});
			}
		}, oAlignedFlowLayout);

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

		// This check is to catch the case when the width of the card is bigger and
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

			// remove the class only when the group is last on its row
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
			var vVisible;

			if (typeof oGroup.visible == "string") {
				vVisible = !Utils.hasFalsyValueAsString(oGroup.visible);
			} else {
				vVisible = oGroup.visible;
			}

			var oGroupContainer = new VBox({
				visible: vVisible,
				renderType: FlexRendertype.Bare
			}).addStyleClass("sapFCardObjectGroup");

			if (oGroup.title) {
				oGroupContainer.addItem(new Title({
					text: oGroup.title
				}).addStyleClass("sapFCardObjectItemTitle"));

				oGroupContainer.addStyleClass("sapFCardObjectGroupWithTitle");
			}

			oGroup.items.forEach(function (oItem) {

				var oItemValue,
					vLabel = oItem.label,
					vValue = oItem.value,
					vVisible,
					oItemLabel,
					vHref,
					aBindingParts = [];

				if (typeof oItem.visible == "string") {
					vVisible = !Utils.hasFalsyValueAsString(oItem.visible);
				} else {
					vVisible = oItem.visible;
				}

				if (vLabel) {
					// Checks if the label ends with ":" and if not we just add the ":"
					vLabel = BindingHelper.formattedProperty(vLabel, function (sValue) {
						return sValue && sValue[sValue.length - 1] === ":" ? sValue : sValue += ":";
					});
					oItemLabel = new Label({
						text: vLabel,
						visible: vVisible
					}).addStyleClass("sapFCardObjectItemLabel");
				}

				if (vValue) {
					switch (oItem.type) {
						case 'link':
							oItemValue = new Link({
								href: oItem.url || vValue,
								text: vValue,
								target: oItem.target || '_blank',
								visible: BindingHelper.reuse(vVisible)
							});
							break;
						case 'email':
							if (oItem.value) {
								aBindingParts.push(oItem.value);
							}
							if (oItem.emailSubject) {
								aBindingParts.push(oItem.emailSubject);
							}

							vHref = BindingHelper.formattedProperty(aBindingParts, function (sValue, sEmailSubject) {
									if (sEmailSubject) {
										return "mailto:" + sValue + "?subject=" + sEmailSubject;
									} else {
										return "mailto:" + sValue;
									}
								});

							oItemValue = new Link({
								href: vHref,
								text: vValue,
								visible: BindingHelper.reuse(vVisible)
							});
							break;
						case 'phone':
							vHref = BindingHelper.formattedProperty(vValue, function (sValue) {
								return "tel:" + sValue;
							});
							oItemValue = new Link({
								href: vHref,
								text: vValue,
								visible: BindingHelper.reuse(vVisible)
							});
							break;
						default:
							oItemValue = new Text({
								text:  vValue,
								visible: BindingHelper.reuse(vVisible)
							});
							break;
					}
				}

				if (oItemValue) {
					oItemValue.addStyleClass("sapFCardObjectItemText");
				}

				if (oItem.icon) {
					var vSrc = BindingHelper.formattedProperty(oItem.icon.src, function (sValue) {
						return this._oIconFormatter.formatSrc(sValue);
					}.bind(this));

					var oAvatar = new Avatar({
						displaySize: oItem.icon.size || AvatarSize.XS,
						src: vSrc,
						initials: oItem.icon.text,
						displayShape: oItem.icon.shape,
						tooltip: oItem.icon.alt,
						backgroundColor: oItem.icon.backgroundColor || (oItem.icon.text ? undefined : AvatarColor.Transparent)
					}).addStyleClass("sapFCardObjectItemAvatar sapFCardObjectItemLabel sapFCardIcon");

					var oVbox = new VBox({
						items: [
							oItemLabel,
							oItemValue
						]
					});
					var oHBox = new HBox({
						visible: vVisible,
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

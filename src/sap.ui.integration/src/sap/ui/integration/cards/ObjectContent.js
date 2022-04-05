/*!
* ${copyright}
*/
sap.ui.define([
	"./BaseContent",
	"./ObjectContentRenderer",
	"sap/ui/integration/library",
	"sap/m/library",
	"sap/m/FlexItemData",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Avatar",
	"sap/m/Link",
	"sap/m/Label",
	"sap/m/ObjectStatus",
	"sap/base/Log",
	"sap/ui/core/ResizeHandler",
	"sap/ui/layout/AlignedFlowLayout",
	"sap/ui/dom/units/Rem",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Utils",
	"sap/f/AvatarGroup",
	"sap/f/AvatarGroupItem",
	"sap/f/cards/NumericIndicators",
	"sap/f/cards/NumericSideIndicator",
	"sap/f/library",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton"
], function (
	BaseContent,
	ObjectContentRenderer,
	library,
	mLibrary,
	FlexItemData,
	HBox,
	VBox,
	Text,
	Title,
	Avatar,
	Link,
	Label,
	ObjectStatus,
	Log,
	ResizeHandler,
	AlignedFlowLayout,
	Rem,
	BindingHelper,
	BindingResolver,
	Utils,
	AvatarGroup,
	AvatarGroupItem,
	NumericIndicators,
	NumericSideIndicator,
	fLibrary,
	OverflowToolbar,
	OverflowToolbarButton
) {
	"use strict";

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;

	// shortcut for sap.m.AvatarColor
	var AvatarColor = mLibrary.AvatarColor;

	var ButtonType = mLibrary.ButtonType;

	var FlexRendertype = mLibrary.FlexRendertype;

	// shortcut for sap.ui.integration.CardActionArea
	var ActionArea = library.CardActionArea;

	var AvatarGroupType = fLibrary.AvatarGroupType;

	var ToolbarStyle = mLibrary.ToolbarStyle;

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
	 * @since 1.64
	 * @alias sap.ui.integration.cards.ObjectContent
	 */
	var ObjectContent = BaseContent.extend("sap.ui.integration.cards.ObjectContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: ObjectContentRenderer
	});

	ObjectContent.prototype.exit = function() {
		BaseContent.prototype.exit.apply(this, arguments);

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = "";
		}
	};

	ObjectContent.prototype.setConfiguration = function (oConfiguration) {
		BaseContent.prototype.setConfiguration.apply(this, arguments);
		oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return this;
		}

		if (oConfiguration.groups) {
			this._addGroups(oConfiguration);
		}

		return this;
	};

	ObjectContent.prototype._getRootContainer = function () {
		var oRootContainer = this.getAggregation("_content");

		if (!oRootContainer) {
			oRootContainer = new VBox({
				renderType: FlexRendertype.Bare
			});
			this.setAggregation("_content", oRootContainer);
			// registration ID used for deregistering the resize handler
			this._sResizeListenerId = ResizeHandler.register(oRootContainer, this._onResize.bind(this));
		}

		return oRootContainer;
	};

	ObjectContent.prototype._addGroups = function (oConfiguration) {
		var oContainer = this._getRootContainer(),
			oAFLayout,
			bNextAFLayout = true,
			aGroups = oConfiguration.groups || [];

		aGroups.forEach(function (oGroupConfiguration, i) {
			var oGroup = this._createGroup(oGroupConfiguration);

			if (oGroupConfiguration.alignment === "Stretch") {
				oGroup.setLayoutData(new FlexItemData({
					growFactor: 1
				}));

				if (i === aGroups.length - 1) {
					oGroup.addStyleClass("sapFCardObjectGroupLastInColumn");
				}

				oContainer.addItem(oGroup);
				bNextAFLayout = true;
			} else {
				if (bNextAFLayout) {
					oAFLayout = this._createAFLayout();
					oContainer.addItem(oAFLayout);
					bNextAFLayout = false;
				}
				oAFLayout.addContent(oGroup);
			}

		}, this);

		this._oActions.attach({
			area: ActionArea.Content,
			actions: oConfiguration.actions,
			control: this
		});
	};

	ObjectContent.prototype._createGroup = function (oGroupConfiguration) {
		var vVisible;

		if (typeof oGroupConfiguration.visible == "string") {
			vVisible = !Utils.hasFalsyValueAsString(oGroupConfiguration.visible);
		} else {
			vVisible = oGroupConfiguration.visible;
		}

		var oGroup = new VBox({
			visible: vVisible,
			renderType: FlexRendertype.Bare
		}).addStyleClass("sapFCardObjectGroup");

		if (oGroupConfiguration.title) {
			oGroup.addItem(new Title({
				text: oGroupConfiguration.title
			}).addStyleClass("sapFCardObjectItemTitle"));

			oGroup.addStyleClass("sapFCardObjectGroupWithTitle");
		}

		oGroupConfiguration.items.forEach(function (oItem) {
			this._createGroupItems(oItem).forEach(oGroup.addItem, oGroup);
		}, this);

		return oGroup;
	};

	ObjectContent.prototype._createGroupItems = function (oItem) {
		var vLabel = oItem.label,
			oLabel,
			vVisible,
			oControl;

		if (typeof oItem.visible == "string") {
			vVisible = !Utils.hasFalsyValueAsString(oItem.visible);
		} else {
			vVisible = oItem.visible;
		}

		if (vLabel) {
			// Checks if the label ends with ":" and if not we just add the ":"
			vLabel = BindingHelper.formattedProperty(vLabel, function (sValue) {
				return sValue && sValue[sValue.length - 1] === ":" ? sValue : sValue + ":";
			});
			oLabel = new Label({
				text: vLabel,
				visible: vVisible
			}).addStyleClass("sapFCardObjectItemLabel");
		}

		oControl = this._createItem(oItem, vVisible, oLabel);

		if (oControl) {
			oControl.addStyleClass("sapFCardObjectItemValue");
		}

		if (oItem.icon) {
			var oVbox = new VBox({
				renderType: FlexRendertype.Bare,
				items: [
					oLabel,
					oControl
				]
			});
			var oHBox = new HBox({
				visible: vVisible,
				renderType: FlexRendertype.Bare,
				items: [
					this._createGroupItemAvatar(oItem.icon),
					oVbox
				]
			}).addStyleClass("sapFCardObjectItemLabel");
			return [oHBox];
		} else {
			return [oLabel, oControl];
		}
	};

	ObjectContent.prototype._createGroupItemAvatar = function (oIconConfiguration) {
		var vSrc = BindingHelper.formattedProperty(oIconConfiguration.src, function (sValue) {
			return this._oIconFormatter.formatSrc(sValue);
		}.bind(this));

		var oAvatar = new Avatar({
			displaySize: oIconConfiguration.size || AvatarSize.XS,
			src: vSrc,
			initials: oIconConfiguration.text,
			displayShape: oIconConfiguration.shape,
			tooltip: oIconConfiguration.alt,
			backgroundColor: oIconConfiguration.backgroundColor || (oIconConfiguration.text ? undefined : AvatarColor.Transparent)
		}).addStyleClass("sapFCardObjectItemAvatar sapFCardIcon");

		return oAvatar;
	};

	ObjectContent.prototype._createItem = function (oItem, vVisible, oLabel) {
		var oControl,
			vValue = oItem.value,
			vHref;

		switch (oItem.type) {
			case "NumericData":
				oControl = this._createNumericDataItem(oItem, vVisible);
				break;
			case "Status":
				oControl = this._createStatusItem(oItem, vVisible);
				break;
			case "IconGroup":
				oControl = this._createIconGroupItem(oItem, vVisible);
				break;
			case "ButtonGroup":
				oControl = this._createButtonGroupItem(oItem, vVisible);
				break;

			// deprecated types
			case "link":
				Log.warning("Usage of Object Group Item property 'type' with value 'link' is deprecated. Use Card Actions for navigation instead.", null, "sap.ui.integration.widgets.Card");
				oControl = new Link({
					href: oItem.url || vValue,
					text: vValue,
					target: oItem.target || '_blank',
					visible: BindingHelper.reuse(vVisible)
				});
				break;
			case "email":
				Log.warning("Usage of Object Group Item property 'type' with value 'email' is deprecated. Use Card Actions for navigation instead.", null, "sap.ui.integration.widgets.Card");
				var aBindingParts = [];
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

				oControl = new Link({
					href: vHref,
					text: vValue,
					visible: BindingHelper.reuse(vVisible)
				});
				break;
			case "phone":
				Log.warning("Usage of Object Group Item property 'type' with value 'phone' is deprecated. Use Card Actions for navigation instead.", null, "sap.ui.integration.widgets.Card");
				vHref = BindingHelper.formattedProperty(vValue, function (sValue) {
					return "tel:" + sValue;
				});
				oControl = new Link({
					href: vHref,
					text: vValue,
					visible: BindingHelper.reuse(vVisible)
				});
				break;

			default:
				oControl = this._createTextItem(oItem, vVisible, oLabel);
		}

		return oControl;
	};

	ObjectContent.prototype._createNumericDataItem = function (oItem, vVisible) {
		var oVbox = new VBox({
			visible: BindingHelper.reuse(vVisible)
		});
		var oNumericIndicators = new NumericIndicators({
			number: oItem.mainIndicator.number,
			numberSize: oItem.mainIndicator.size,
			scale: oItem.mainIndicator.unit,
			trend: oItem.mainIndicator.trend,
			state: oItem.mainIndicator.state
		}).addStyleClass("sapUiIntOCNumericIndicators");

		oVbox.addItem(oNumericIndicators);

		if (oItem.sideIndicators) {
			oItem.sideIndicators.forEach(function (oIndicator) {
				oNumericIndicators.addSideIndicator(
					new NumericSideIndicator({
						title: oIndicator.title,
						number: oIndicator.number,
						unit: oIndicator.unit,
						state: oIndicator.state
					})
				);
			});
		}

		if (oItem.details) {
			oVbox.addItem(new Text({
				text: oItem.details,
				maxLines: 1
			}).addStyleClass("sapUiIntOCNumericIndicatorsDetails"));
		}

		return oVbox;
	};

	ObjectContent.prototype._createStatusItem = function (oItem, vVisible) {
		var oControl = new ObjectStatus({
			text: oItem.value,
			visible: BindingHelper.reuse(vVisible),
			state: oItem.state
		});

		return oControl;
	};

	ObjectContent.prototype._createTextItem = function (oItem, vVisible, oLabel) {
		var vValue = oItem.value,
			oControl;

		if (vValue && oItem.actions) {
			oControl = new Link({
				text: vValue,
				visible: BindingHelper.reuse(vVisible)
			});

			if (oLabel) {
				oControl.addAriaLabelledBy(oLabel);
			} else {
				Log.warning("Missing label for Object group item with actions.", null, "sap.ui.integration.widgets.Card");
			}

			this._oActions.attach({
				area: ActionArea.ContentItemDetail,
				actions: oItem.actions,
				control: this,
				actionControl: oControl,
				enabledPropertyName: "enabled"
			});
		} else if (vValue) {
			oControl = new Text({
				text: vValue,
				visible: BindingHelper.reuse(vVisible),
				maxLines: oItem.maxLines
			});
		}

		return oControl;
	};

	ObjectContent.prototype._createButtonGroupItem = function (oItem, vVisible) {
		var oTemplateConfig = oItem.template;
		if (!oTemplateConfig) {
			return null;
		}

		var oButtonGroup = new OverflowToolbar({
			visible: BindingHelper.reuse(vVisible),
			style: ToolbarStyle.Clear
		});

		oButtonGroup.addStyleClass("sapUiIntCardObjectButtonGroup");

		var oItemTemplate = new OverflowToolbarButton({
			icon: BindingHelper.formattedProperty(oTemplateConfig.icon, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue);
			}.bind(this)),
			text: oTemplateConfig.text || oTemplateConfig.tooltip,
			tooltip: oTemplateConfig.tooltip || oTemplateConfig.text,
			type: ButtonType.Transparent,
			visible: oTemplateConfig.visible
		});

		if (oTemplateConfig.actions) {
			oItemTemplate.attachPress(function (oEvent) {
				this._onButtonGroupPress(oEvent, oTemplateConfig.actions);
			}.bind(this));
		}

		oButtonGroup.bindAggregation("content", {
			path: oItem.path || "/",
			template: oItemTemplate,
			templateShareable: false // destroy the template when the AvatarGroup is destroyed
		});

		return oButtonGroup;
	};

	ObjectContent.prototype._onButtonGroupPress = function (oEvent, oActionTemplate) {
		var oItem = oEvent.getSource();
		var aResolvedActions = BindingResolver.resolveValue(oActionTemplate, oItem, oItem.getBindingContext().getPath());
		var oAction = aResolvedActions[0];
		this.getActions().fireAction(this, oAction.type, oAction.parameters);
	};

	ObjectContent.prototype._createIconGroupItem = function (oItem, vVisible) {
		var oTemplateConfig = oItem.template;
		if (!oTemplateConfig) {
			return null;
		}

		var oIconGroup = new AvatarGroup({
			avatarDisplaySize: oItem.size || AvatarSize.XS,
			groupType: AvatarGroupType.Individual,
			visible: BindingHelper.reuse(vVisible)
		});

		// Disable "show more" button
		oIconGroup._oShowMoreButton.setType(ButtonType.Transparent);
		oIconGroup._oShowMoreButton.setEnabled(false);

		if (oTemplateConfig.actions) {
			oIconGroup.attachPress(function (oEvent) {
				this._onIconGroupPress(oEvent, oTemplateConfig.actions);
			}.bind(this));
		} else {
			// make avatars non-interactive, disable press and hover cursor
			oIconGroup._setInteractive(false);
		}

		var oItemTemplate = new AvatarGroupItem({
			src: BindingHelper.formattedProperty(oTemplateConfig.icon.src, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue);
			}.bind(this)),
			initials: oTemplateConfig.icon.text,
			tooltip: oTemplateConfig.icon.alt
		});

		oIconGroup.bindAggregation("items", {
			path: oItem.path || "/",
			template: oItemTemplate,
			templateShareable: false // destroy the template when the AvatarGroup is destroyed
		});

		return oIconGroup;
	};

	ObjectContent.prototype._onIconGroupPress = function (oEvent, oActionTemplate) {
		if (oEvent.getParameter("overflowButtonPressed")) {
			// ignore presses on the "show more" button
		} else {
			var oItem = oEvent.getParameter("eventSource");
			var aResolvedActions = BindingResolver.resolveValue(oActionTemplate, oItem, oItem.getBindingContext().getPath());
			var oAction = aResolvedActions[0];
			this.getActions().fireAction(this, oAction.type, oAction.parameters);
		}
	};

	ObjectContent.prototype._createAFLayout = function () {
		var oAlignedFlowLayout = new AlignedFlowLayout();

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

	ObjectContent.prototype._onResize = function (oEvent) {
		if (oEvent.size.width === oEvent.oldSize.width) {
			return;
		}

		var aItems = this._getRootContainer().getItems();

		aItems.forEach(function (oItem, i) {
			if (oItem.isA("sap.ui.layout.AlignedFlowLayout")) {
				this._onAlignedFlowLayoutResize(oItem, oEvent, i === aItems.length - 1);
			}
		}.bind(this));
	};

	ObjectContent.prototype._onAlignedFlowLayoutResize = function (oAFLayout, oEvent, bLast) {
		var sMinItemWidth = oAFLayout.getMinItemWidth(),
			iMinItemWidth,
			iNumberOfGroups = oAFLayout.getContent().filter(function (oContent) {
				return oContent.getVisible();
			}).length;

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

		var lastColIndex = iColumns - 1,
			iRows = Math.ceil(iNumberOfGroups / iColumns);

		oAFLayout.getContent().forEach(function (oItem, iIndex) {
			// Add spacing on every group
			oItem.addStyleClass("sapFCardObjectSpaceBetweenGroup");

			// remove the class only when the group is last on its row
			if (lastColIndex === iIndex && lastColIndex < iNumberOfGroups) {
				oItem.removeStyleClass("sapFCardObjectSpaceBetweenGroup");
				lastColIndex += iColumns;
			}

			// change bottom padding of the last item in each column
			if (bLast && iIndex + 1 > (iRows - 1) * iColumns) {
				oItem.addStyleClass("sapFCardObjectGroupLastInColumn");
			} else {
				oItem.removeStyleClass("sapFCardObjectGroupLastInColumn");
			}
		});
	};

	return ObjectContent;
});

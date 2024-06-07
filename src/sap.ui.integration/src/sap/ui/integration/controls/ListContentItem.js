/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/library",
	"./ListContentItemRenderer",
	"./ActionsStrip",
	"sap/ui/integration/controls/ObjectStatus",
	"sap/m/library",
	"sap/m/Avatar",
	"sap/m/AvatarShape",
	"sap/m/AvatarSize",
	"sap/m/ListItemBase",
	"sap/ui/core/library",
	"sap/ui/integration/util/BindingResolver"
], function (
	Library,
	library,
	ListContentItemRenderer,
	ActionsStrip,
	ObjectStatus,
	mLibrary,
	Avatar,
	AvatarShape,
	AvatarSize,
	ListItemBase,
	coreLibrary,
	BindingResolver
) {
	"use strict";

	var AttributesLayoutType = library.AttributesLayoutType;
	var ValueState = coreLibrary.ValueState;
	var EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;
	var AvatarImageFitType = mLibrary.AvatarImageFitType;

	/**
	 * Constructor for a new ListContentItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.ListContentItem
	 */
	var ListContentItem = ListItemBase.extend("sap.ui.integration.controls.ListContentItem", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Defines the title of the list item.
				 */
				title: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Defines the additional information for the title.
				 */
				description: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Defines whether the description should be visible.
				 * @since 1.116
				 */
				descriptionVisible: { type: "boolean", defaultValue: true },

				/**
				 * Defines the list item icon.
				 */
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },

				/**
				 * Defines an alt text for the avatar or icon.
				 * @since 1.82
				 */
				iconAlt: { type: "string", defaultValue: "" },

				/**
				 * Defines the shape of the icon.
				 * @since 1.82
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Square },

				/**
				 * Defines the initials of the icon.
				 * @since 1.82
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines the size of the icon.
				 * @since 1.82
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.XS },

				/**
				 * Defines how the image fits in the icon area.
				 * @since 1.126
				 */
				iconFitType: { type: "sap.m.AvatarImageFitType", defaultValue: AvatarImageFitType.Cover },

				/**
				 * Defines the background color of the icon.
				 * @since 1.83
				 */
				iconBackgroundColor: { type: "sap.m.AvatarColor" },

				/**
				 * Defines whether the icon should be visible.
				 */
				iconVisible: { type: "boolean", defaultValue: true },

				/**
				 * Defines an additional information text.
				 */
				info: { type : "string", group: "Misc", defaultValue: null },

				/**
				 * Defines whether the info should be visible.
				 * @since 1.115
				 */
				infoVisible: {type: "boolean", defaultValue: true },

				/**
				 * Defines the value state of the information text.
				 */
				infoState: { type : "sap.ui.core.ValueState", group: "Misc", defaultValue: ValueState.None },

				/**
				 * Defines if info state icon should be shown.
				 */
				showInfoStateIcon: { type: "boolean", defaultValue: false },

				/**
				 * Defines the custom info status icon that should be shown.
				 */
				customInfoStatusIcon: { type : "string", group: "Misc", defaultValue: null },

				/**
				 * Defines the layout type of the attributes.
				 */
				attributesLayoutType: { type: "sap.ui.integration.AttributesLayoutType", defaultValue: AttributesLayoutType.TwoColumns }
			},
			aggregations: {
				microchart: { type: "sap.ui.integration.controls.Microchart", multiple: false },

				actionsStrip: { type: "sap.ui.integration.controls.ActionsStrip", multiple: false },

				attributes: { type: "sap.m.ObjectStatus", multiple: true },

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner object status control.
				 */
				_objectStatus: { type: "sap.m.ObjectStatus", multiple: false, visibility: "hidden" }
			}
		},
		renderer: ListContentItemRenderer
	});

	ListContentItem.getPlaceholderInfo = function (oResolvedConfigItem, oContent) {
		const aVisibleAttributes = oResolvedConfigItem?.attributes?.filter(function (oAttribute) {
			return oAttribute.hasOwnProperty("visible") ? oAttribute.visible : true;
		});

		const bVisibleIcon = oResolvedConfigItem?.icon?.hasOwnProperty("visible") ? oResolvedConfigItem?.icon.visible : !!oResolvedConfigItem?.icon;
		const bHasVisibleActionsStrip = oResolvedConfigItem?.actionsStrip ? ActionsStrip.hasVisibleTemplateItems(oResolvedConfigItem.actionsStrip, oContent) : false;

		return {
			hasIcon: bVisibleIcon,
			attributesLength: aVisibleAttributes ? aVisibleAttributes.length : 0,
			hasChart: !!oResolvedConfigItem?.chart,
			hasActionsStrip: bHasVisibleActionsStrip,
			hasDescription: !!oResolvedConfigItem?.description
		};
	};

	ListContentItem.getLinesCount = function (oConfiguration, oContent) {
		let iLines = 1; // at least 1 line for the mandatory title
		const oResolvedConfig = BindingResolver.resolveValue(oConfiguration, oContent);
		const oPlaceholderInfo = ListContentItem.getPlaceholderInfo(oResolvedConfig, oContent);

		const bDescriptionVisible = oResolvedConfig.description?.hasOwnProperty("visible") ? oResolvedConfig.description?.visible : true;
		if (oResolvedConfig.description && bDescriptionVisible) {
			iLines += 1;
		}

		const aVisibleAttributesLength = oPlaceholderInfo.attributesLength;
		if (oResolvedConfig.attributesLayoutType === AttributesLayoutType.OneColumn) {
			iLines += aVisibleAttributesLength;
		} else {
			iLines += Math.ceil(aVisibleAttributesLength / 2);
		}

		const bChartVisible = oResolvedConfig.chart?.hasOwnProperty("visible") ? oResolvedConfig.chart?.visible : true;
		if (oResolvedConfig.chart && bChartVisible) {
			iLines += 1;
		}

		return iLines;
	};

	/**
	 * Called on before rendering of the control.
	 * @private
	 */
	ListContentItem.prototype.onBeforeRendering = function () {
		ListItemBase.prototype.onBeforeRendering.apply(this, arguments);

		if (this.isPropertyInitial("iconSize")) {
			if (this.getLinesCount() === 1){
				this._getAvatar().setDisplaySize(AvatarSize.XS);
			} else {
				this._getAvatar().setDisplaySize(AvatarSize.S);
			}
		} else {
			this._getAvatar().setDisplaySize(this.getIconSize());
		}
	};

	ListContentItem.prototype.getLinesCount = function () {
		var iLines = 1; // at least 1 line for the mandatory title

		if (this.getDescription() && this.getDescriptionVisible()) {
			iLines += 1;
		}

		if (this.getAttributesLayoutType() === AttributesLayoutType.OneColumn) {
			iLines += this._getVisibleAttributes().length;
		} else {
			iLines += Math.ceil(this._getVisibleAttributes().length / 2);
		}

		if (this.getMicrochart() && this.getMicrochart().getVisible()) {
			iLines += 1;
		}

		return iLines;
	};

	/**
	 * ListItemBase hook
	 * @override
	 */
	ListContentItem.prototype.getContentAnnouncement = function () {
		var sInfoState = this.getInfoState(),
			sTitle = this.getTitle(),
			sDescription = this.getDescription(),
			aOutput = [],
			sInfo = this.getInfo(),
			oMBundle = Library.getResourceBundleFor("sap.m"),
			aAttributes = this._getVisibleAttributes(),
			oChart = this.getMicrochart()?.getChart();

		if (sTitle) {
			aOutput.push(sTitle);
		}

		if (sDescription) {
			aOutput.push(sDescription);
		}

		if (sInfo) {
			aOutput.push(sInfo);
		}

		if (sInfoState != ValueState.None && sInfoState !== this.getHighlight()) {
			aOutput.push(oMBundle.getText("LIST_ITEM_STATE_" + sInfoState.toUpperCase()));
		}

		if (aAttributes.length > 0 ) {
			aAttributes.forEach(function(oAttribute) {
				aOutput.push(oAttribute.getAccessibilityInfo().description);
			});
		}

		if (oChart) {
			aOutput.push(oChart.getTooltip_AsString());
		}

		return aOutput.join(" . ").trim();
	};

	ListContentItem.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");

		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}

		oAvatar
			.setSrc(this.getIcon())
			.setDisplayShape(this.getIconDisplayShape())
			.setTooltip(this.getIconAlt())
			.setInitials(this.getIconInitials())
			.setBackgroundColor(this.getIconBackgroundColor())
			.setVisible(this.getIconVisible())
			.setImageFitType(this.getIconFitType());

		return oAvatar;
	};

	ListContentItem.prototype._getObjectStatus = function () {
		var oObjectStatus = this.getAggregation("_objectStatus");

		if (!oObjectStatus) {
			oObjectStatus = new ObjectStatus();
			this.setAggregation("_objectStatus", oObjectStatus);
		}

		oObjectStatus
			.setText(this.getInfo())
			.setState(this.getInfoState())
			.setShowStateIcon(this.getShowInfoStateIcon())
			.setIcon(this.getCustomInfoStatusIcon())
			.setEmptyIndicatorMode(EmptyIndicatorMode.On);

		return oObjectStatus;
	};

	ListContentItem.prototype._getVisibleAttributes = function () {
		return this.getAttributes().filter(function (oAttribute) {
			return oAttribute.getVisible();
		});
	};

	return ListContentItem;
});
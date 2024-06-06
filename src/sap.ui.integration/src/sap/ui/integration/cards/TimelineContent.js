/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseListContent",
	"./TimelineContentRenderer",
	"sap/f/cards/loading/TimelinePlaceholder",
	"sap/ui/core/Lib",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver"
], function (
	BaseListContent,
	TimelineContentRenderer,
	TimelinePlaceholder,
	Library,
	library,
	BindingHelper,
	BindingResolver
) {
	"use strict";

	// shortcuts for sap.ui.integration.CardActionArea
	var ActionArea = library.CardActionArea;

	// lazy dependencies, loaded on the first attempt to create TimelineContent
	var Timeline, TimelineItem;

	/**
	 * Constructor for a new <code>TimelineContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays time-related content.
	 *
	 * @extends sap.ui.integration.cards.BaseListContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.61
	 * @see {@link TODO Card}
	 * @alias sap.ui.integration.cards.TimelineContent
	 *
	 *
	 */
	var TimelineContent = BaseListContent.extend("sap.ui.integration.cards.TimelineContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: TimelineContentRenderer
	});

	/**
	 * Called when control is destroyed.
	 */
	TimelineContent.prototype.exit = function () {
		BaseListContent.prototype.exit.apply(this, arguments);

		if (this._oTimeLineItemTemplate) {
			this._oTimeLineItemTemplate.destroy();
			this._oTimeLineItemTemplate = null;
		}
	};

	/**
	 * @override
	 */
	TimelineContent.prototype.createLoadingPlaceholder = function (oConfiguration) {
		var oCard = this.getCardInstance(),
			iContentMinItems = oCard.getContentMinItems(oConfiguration);

		return new TimelinePlaceholder({
			minItems: iContentMinItems !== null ? iContentMinItems : 2,
			item: oConfiguration.item,
			itemHeight: TimelineContentRenderer.getItemMinHeight(oConfiguration, this) + "rem"
		});
	};

	/**
	 * @override
	 */
	TimelineContent.prototype.loadDependencies = function (oCardManifest) {
		return new Promise(function (resolve, reject) {
			Library.load("sap.suite.ui.commons")
				.then(function () {
					sap.ui.require([
						"sap/suite/ui/commons/Timeline",
						"sap/suite/ui/commons/TimelineItem"
					], function (_Timeline, _TimelineItem) {
						Timeline = _Timeline;
						TimelineItem = _TimelineItem;
						resolve();
					}, function (sErr) {
						reject(sErr);
					});
				})
				.catch(function () {
					reject("Timeline content type is not available with this distribution.");
				});
		});
	};

	/**
	 * Lazily get a configured <code>sap.suite.common.Timeline</code>.
	 *
	 * @private
	 * @returns {sap.suite.common.Timeline} The Timeline control
	 */
	TimelineContent.prototype._getTimeline = function () {
		var oTimeline = this.getAggregation("_content");

		if (this._bIsBeingDestroyed) {
			return null;
		}

		if (!oTimeline) {
			oTimeline = new Timeline({
				id: this.getId() + "-Timeline",
				showHeaderBar: false,
				enableScroll: false,
				growingThreshold: 0,
				ariaLabelledBy: this.getHeaderTitleId()
			});
			this.setAggregation("_content", oTimeline);
		}

		return oTimeline;
	};

	/**
	 * @override
	 */
	TimelineContent.prototype.applyConfiguration = function () {
		BaseListContent.prototype.applyConfiguration.apply(this, arguments);

		var oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return;
		}

		if (oConfiguration.items) {
			this._setStaticItems(oConfiguration.items);
			return;
		}

		if (oConfiguration.item) {
			this._setItem(oConfiguration.item);
		}
	};

	/**
	 * @override
	 */
	TimelineContent.prototype.getItemsLength = function () {
		return this._getTimeline().getContent().length;
	};

	/**
	 * Handler for when data is changed.
	 */
	TimelineContent.prototype.onDataChanged = function () {
		BaseListContent.prototype.onDataChanged.apply(this, arguments);

		this._checkHiddenNavigationItems(this.getParsedConfiguration().item);
	};

	/**
	 * Binds/Sets properties to the inner item template based on the configuration object item template which is already parsed.
	 *
	 * @private
	 * @param {Object} mItem The item template of the configuration object
	 * @returns {this} <code>this</code> for chaining
	 */
	TimelineContent.prototype._setItem = function (mItem) {
		var mSettings = {
			userNameClickable: false,
			title: mItem.title && mItem.title.value,
			text: mItem.description && mItem.description.value,
			dateTime: mItem.dateTime && mItem.dateTime.value,
			userName: mItem.owner && mItem.owner.value,
			icon: mItem.icon && mItem.icon.src
		};

		// settings that need a formatter
		if (mItem.ownerImage && mItem.ownerImage.value) {
			mSettings.userPicture = BindingHelper.formattedProperty(mItem.ownerImage.value, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue);
			}.bind(this));
		}

		this._oTimeLineItemTemplate = new TimelineItem(mSettings);

		this._oActions.attach({
			area: ActionArea.ContentItem,
			actions: mItem.actions,
			control: this,
			actionControl: this._oTimeLineItemTemplate,
			eventName: "select"
		});

		var oBindingInfo = {
			template: this._oTimeLineItemTemplate
		};

		this._bindAggregationToControl("content", this._getTimeline(), oBindingInfo);

		return this;
	};

	/**
	 * Create static TimelineItem which will be mapped with the configuration that is passed.
	 *
	 * @private
	 * @param {Array} aItems The list of static items that will be used
	 */
	TimelineContent.prototype._setStaticItems = function (aItems) {
		var oTimeline = this._getTimeline(),
			oTimelineItem;

		aItems.forEach(function (oItem) {
			oTimelineItem = new TimelineItem({
				title: oItem.title,
				text: oItem.description,
				userPicture: oItem.ownerImage,
				dateTime: oItem.dateTime,
				userName: oItem.owner,
				icon: oItem.icon
			});

			oTimeline.addContent(oTimelineItem);
		});
	};

	/**
	 * @override
	 * @returns {sap.suite.ui.commons.Timeline} The inner timeline.
	 */
	TimelineContent.prototype.getInnerList = function () {
		return this._getTimeline();
	};

	/**
	* @override
	*/
	TimelineContent.prototype.getStaticConfiguration = function () {
		var aItems = this.getInnerList().getContent(),
		oConfiguration = this.getParsedConfiguration(),
		aResolvedItems = [];

		aItems.forEach(function (oItem) {
			var oResolvedItem = BindingResolver.resolveValue(oConfiguration.item, this, oItem.getBindingContext().getPath());

			if (oResolvedItem.icon && oResolvedItem.icon.src) {
				oResolvedItem.icon.src = this._oIconFormatter.formatSrc(oResolvedItem.icon.src);
			}

			if (oResolvedItem.ownerImage && oResolvedItem.ownerImage.value) {
				oResolvedItem.ownerImage.value = this._oIconFormatter.formatSrc(oResolvedItem.ownerImage.value);
			}

			aResolvedItems.push(oResolvedItem);
		}.bind(this));
		var oStaticConfiguration = {
			items: aResolvedItems
		};

		return oStaticConfiguration;
	};

	return TimelineContent;
});

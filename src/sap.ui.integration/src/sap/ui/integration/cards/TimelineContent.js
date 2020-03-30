/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/integration/cards/BaseListContent",
		"sap/suite/ui/commons/Timeline",
		"sap/suite/ui/commons/library",
		"sap/suite/ui/commons/TimelineItem",
		'sap/ui/base/ManagedObject',
		"sap/ui/integration/cards/BindingHelper",
		"sap/f/cards/IconFormatter"
	], function (
		BaseListContent,
		Timeline,
		suiteLibrary,
		TimelineItem,
		ManagedObject,
		BindingHelper,
		IconFormatter
	) {
		"use strict";

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
			renderer: {}
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
					enableScroll: false
				});
				this.setAggregation("_content", oTimeline);
			}

			return oTimeline;
		};

		/**
		 * Setter for configuring a <code>sap.ui.integration.cards.TimelineContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 * @returns {sap.ui.integration.cards.TimelineContent} Pointer to the control instance to allow method chaining.
		 */
		TimelineContent.prototype.setConfiguration = function (oConfiguration) {
			BaseListContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.items) {
				this._setStaticItems(oConfiguration.items);
				return this;
			}

			if (oConfiguration.item) {
				this._setItem(oConfiguration.item);
			}

			return this;
		};

		/**
		 * Handler for when data is changed.
		 */
		TimelineContent.prototype.onDataChanged = function () {
			this._checkHiddenNavigationItems(this.getConfiguration().item);
		};

		/**
		 * Binds/Sets properties to the inner item template based on the configuration object item template which is already parsed.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object
		 * @returns {sap.ui.integration.cards.TimelineContent} <code>this</code> for chaining
		 */
		TimelineContent.prototype._setItem = function (mItem) {
			var mSettings = {
				userNameClickable : false,
				title: mItem.title && mItem.title.value,
				text: mItem.description && mItem.description.value,
				dateTime: mItem.dateTime && mItem.dateTime.value,
				userName: mItem.owner && mItem.owner.value,
				icon: mItem.icon && mItem.icon.src
			};

			// settings that need a formatter
			if (mItem.ownerImage && mItem.ownerImage.value) {
				mSettings.userPicture = BindingHelper.formattedProperty(mItem.ownerImage.value, function (sValue) {
					return IconFormatter.formatSrc(sValue, this._sAppId);
				}.bind(this));
			}

			this._oTimeLineItemTemplate =  new TimelineItem(mSettings);
			this._oActions.attach(mItem, this);

			var oBindingInfo = {
				template: this._oTimeLineItemTemplate
			};

			this._filterHiddenNavigationItems(mItem, oBindingInfo);
			this._bindAggregation("content", this._getTimeline(), oBindingInfo);

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
		 * @overwrite
		 * @returns {sap.suite.ui.commons.Timeline} The inner timeline.
		 */
		TimelineContent.prototype.getInnerList = function () {
			return this._getTimeline();
		};

		return TimelineContent;
	});

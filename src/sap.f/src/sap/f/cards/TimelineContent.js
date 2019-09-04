/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/f/cards/BaseContent",
		"sap/suite/ui/commons/Timeline",
		"sap/suite/ui/commons/library",
		"sap/suite/ui/commons/TimelineItem",
		'sap/ui/base/ManagedObject',
		"sap/f/cards/BindingHelper",
		"sap/f/cards/IconFormatter"
	], function (
		BaseContent,
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
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.61
		 * @see {@link TODO Card}
		 * @alias sap.f.cards.TimelineContent
		 *
		 *
		 */
		var TimelineContent = BaseContent.extend("sap.f.cards.TimelineContent", {
			renderer: {}
		});

		/**
		 * Called when control is destroyed.
		 */
		TimelineContent.prototype.exit = function () {
			BaseContent.prototype.exit.apply(this, arguments);

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
		 * Setter for configuring a <code>sap.f.cards.TimelineContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 * @returns {sap.f.cards.TimelineContent} Pointer to the control instance to allow method chaining.
		 */
		TimelineContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

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
		 * Binds/Sets properties to the inner item template based on the configuration object item template.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object
		 * @returns <code>this</code> for chaining
		 */
		TimelineContent.prototype._setItem = function (mItem) {
			this._oTimeLineItemTemplate =  new TimelineItem({
				userNameClickable : false
			});

			/* eslint-disable no-unused-expressions */
			mItem.title && BindingHelper.bindProperty(this._oTimeLineItemTemplate, "title", mItem.title.value);
			mItem.description && BindingHelper.bindProperty(this._oTimeLineItemTemplate, "text", mItem.description.value);
			mItem.ownerImage && mItem.ownerImage.value && BindingHelper.bindProperty(this._oTimeLineItemTemplate, "userPicture", mItem.ownerImage.value, function (sValue) {
				return IconFormatter.formatSrc(sValue, this._sAppId);
			}.bind(this));
			mItem.dateTime && BindingHelper.bindProperty(this._oTimeLineItemTemplate, "dateTime", mItem.dateTime.value);
			mItem.owner && BindingHelper.bindProperty(this._oTimeLineItemTemplate, "userName", mItem.owner.value);
			mItem.icon && BindingHelper.bindProperty(this._oTimeLineItemTemplate, "icon", mItem.icon.src);
			/* eslint-enable no-unused-expressions */

			this._oActions.attach(mItem, this);

			var oBindingInfo = {
				template: this._oTimeLineItemTemplate
			};
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

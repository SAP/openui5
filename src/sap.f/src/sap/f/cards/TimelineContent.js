/*!
 * ${copyright}
 */
sap.ui.define(["sap/f/cards/BaseContent",
		"sap/suite/ui/commons/Timeline",
		"sap/suite/ui/commons/library",
		"sap/suite/ui/commons/TimelineItem",
		'sap/ui/base/ManagedObject'],
	function (BaseContent,
			  Timeline,
			  suiteLibrary,
			  TimelineItem,
			  ManagedObject) {
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
			mItem.title && this._bindItemProperty("title", mItem.title.value);
			mItem.description && this._bindItemProperty("text", mItem.description.value);
			mItem.ownerImage && this._bindItemProperty("userPicture", mItem.ownerImage.value);
			mItem.dateTime && this._bindItemProperty("dateTime", mItem.dateTime.value);
			mItem.owner && this._bindItemProperty("userName", mItem.owner.value);
			mItem.icon && this._bindItemProperty("icon", mItem.icon.src);
			/* eslint-enable no-unused-expressions */

			var oTimeline = this._getTimeline();
			oTimeline.bindAggregation("content", {
				path: this.getBindingContext().getPath(),
				template: this._oTimeLineItemTemplate
			});

			return this;
		};

		/**
		 * Tries to create a binding info object based on sPropertyValue.
		 * If succeeds the binding info will be used for property binding.
		 * Else sPropertyValue will be set directly on the item template.
		 *
		 * @private
		 * @param {string} sPropertyName The name of the property
		 * @param {string} sPropertyValue The value of the property
		 */
		TimelineContent.prototype._bindItemProperty = function (sPropertyName, sPropertyValue) {
			var oBindingInfo = ManagedObject.bindingParser(sPropertyValue);

			if (!sPropertyValue) {
				return;
			}

			if (oBindingInfo) {
				this._oTimeLineItemTemplate.bindProperty(sPropertyName, oBindingInfo);
			} else {
				this._oTimeLineItemTemplate.setProperty(sPropertyName, sPropertyValue);
			}
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

		return TimelineContent;
	});

/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/model/json/JSONModel','sap/f/cards/Data', "sap/base/Log", "sap/suite/ui/commons/Timeline", "sap/suite/ui/commons/library", "sap/suite/ui/commons/TimelineItem", 'sap/ui/base/ManagedObject'],
	function (Control, JSONModel,  Data, Log, Timeline, suiteLibrary, TimelineItem, ManagedObject) {
		"use strict";

		/**
		 * Constructor for a new <code>Timeline Content</code>.
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
		 * @extends sap.ui.core.Control
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

		var TimelineContent = Control.extend("sap.f.cards.TimelineContent", {
			metadata: {
				properties: {
					configuration: { type: "object" }
				},
				aggregations: {
					_content: { multiple: false, visibility: "hidden" }
				}
			},
			renderer: function (oRm, oCardContent) {
				oRm.write("<div");
				oRm.writeElementData(oCardContent);
				oRm.write(">");
				oRm.renderControl(oCardContent.getAggregation("_content"));
				oRm.write("</div>");
			}
		});

		/**
		 * Called when control is initialized.
		 */
		TimelineContent.prototype.init = function () {
			var oModel = new JSONModel();
			this.setModel(oModel);
		};

		/**
		 * Called when control is destroyed.
		 *
		 * @returns {sap.f.cards.TimelineContent} <code>this</code> for chaining
		 */
		TimelineContent.prototype.destroy = function () {
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

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

			var oModel = new JSONModel(),
				oTimeline = this.getAggregation("_content");
			this.setModel(oModel);

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
		TimelineContent.prototype.setConfiguration = function (oContent) {

			this.setProperty("configuration", oContent);

			if (!oContent) {
				return;
			}

			if (oContent.data) {
				this._setData(oContent.data);
			}

			if (oContent.item && oContent.data) {
				this._setTimelineItem(oContent.item, oContent.data);
			}
		};

		/**
		 * Binds/Sets properties to the inner item template based on the configuration object item template.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object
		 * @param {Object} oData the data to set
		 * @returns <code>this</code> for chaining
		 */
		TimelineContent.prototype._setTimelineItem = function (mItem, oData) {
				this._oTimeLineItemTemplate =  new TimelineItem({
					userNameClickable : false
				});
			/* eslint-disable no-unused-expressions */
			mItem.title && this._bindItemProperty("title", mItem.title.value);
			mItem.description && this._bindItemProperty("text", mItem.description.value);
			mItem.ownerImage && this._bindItemProperty("userPicture", mItem.ownerImage.value);
			mItem.dateTime && this._bindItemProperty("dateTime", mItem.dateTime.value);
			mItem.owner && this._bindItemProperty("userName", mItem.owner.value);
			mItem.icon && this._bindItemProperty("icon", mItem.icon.value);
			/* eslint-enable no-unused-expressions */

			this._getTimeline().bindAggregation("content", {
				path: oData.path,
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
		 * Requests data and bind it to the item template.
		 *
		 * @private
		 * @param {Object} oData The data part of the configuration object
		 * @returns <code>this</code> for chaining
		 */
		TimelineContent.prototype._setData = function (oData) {

			var oRequest = oData.request;

			if (oData.json && !oRequest) {
				this._updateModel(oData.json, oData.path);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oData.path);
				}.bind(this)).catch(function (oError) {
					Log.error("Card content data request failed");
				});
			}

			return this;
		};

		/**
		 * Updates the model and binds the data to the list.
		 *
		 * @private
		 * @param {Object} oData the data to set
		 * @param {string} sPath the binding path
		 */
		TimelineContent.prototype._updateModel = function (oData, sPath) {

			var oTimeline = this. _getTimeline();
			this.getModel().setData(oData);
			oTimeline.bindAggregation("content", {
				path: sPath,
				template: this._oTimeLineItemTemplate
			}.bind(this));
		};

		return TimelineContent;
	});

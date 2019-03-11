/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/f/cards/Data",
	"sap/base/Log"
], function (Control, JSONModel, Data, Log) {
	"use strict";

	/**
	 * Constructor for a new <code>BaseContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A base control for all card contents.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.63
	 * @alias sap.f.cards.BaseContent
	 */
	var BaseContent = Control.extend("sap.f.cards.BaseContent", {
		metadata: {
			properties: {

				/**
				 * The object configuration used to create a list content.
				 */
				configuration: { type: "object" }
			},
			aggregations: {

				/**
				 * Defines the content of the control.
				 */
				_content: {
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		constructor: function (vId, mSettings) {
			if (typeof vId !== "string") {
				mSettings = vId;
			}

			if (mSettings && mSettings.serviceManager) {
				this._oServiceManager = mSettings.serviceManager;
				delete mSettings.serviceManager;
			}

			Control.apply(this, arguments);
		},
		renderer: function (oRm, oCardContent) {

			// Add class the simple way. Add renderer hooks only if needed.
			var sClass = "sapFCard";
			var sLibrary = oCardContent.getMetadata().getLibraryName();
			var sName = oCardContent.getMetadata().getName();
			var sType = sName.slice(sLibrary.length + 1, sName.length);
			var sHeight = BaseContent.getMinHeight(sType, oCardContent.getConfiguration());
			sClass += sType;

			oRm.write("<div");
			oRm.writeElementData(oCardContent);
			oRm.addClass(sClass);
			oRm.addClass("sapFCardBaseContent");
			oRm.writeClasses();
			oRm.addStyle("min-height", sHeight);
			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(oCardContent.getAggregation("_content"));

			oRm.write("</div>");
		}
	});

	BaseContent.prototype.init = function () {
		var oModel = new JSONModel();
		this.setModel(oModel);
	};

	BaseContent.prototype.destroy = function () {
		this.setAggregation("_content", null);
		this.setModel(null);

		if (this._dataChangeHandler && this._oDataService) {
			this._oDataService.detachDataChanged(this._dataChangeHandler);
			this._dataChangeHandler = null;
			this._oDataService = null;
		}

		return Control.prototype.destroy.apply(this, arguments);
	};

	BaseContent.prototype.setConfiguration = function (oConfiguration) {

		this.setProperty("configuration", oConfiguration);

		if (!oConfiguration) {
			return this;
		}

		if (oConfiguration.data) {
			this._setData(oConfiguration.data);
		}

		if (oConfiguration.maxItems) {
			this.getModel().setSizeLimit(oConfiguration.maxItems);
		}

		return this;
	};

	/**
	 * Requests data and bind it to the item template.
	 *
	 * @private
	 * @param {Object} oData The data part of the configuration object
	 */
	BaseContent.prototype._setData = function (oData) {

		this.setBusy(true);

		var oRequest = oData.request;
		var oService = oData.service;

		this.bindElement({
			path: oData.path || "/"
		});

		if (oData.json && !oRequest) {
			this._updateModel(oData.json);
			this.setBusy(false);
		}

		if (oService) {
			this._oServiceManager.getService("sap.ui.integration.services.Data").then(function (oDataService) {
				if (oDataService) {
					this._dataChangeHandler = function (oEvent) {
						this._updateModel(oEvent.data);
					}.bind(this);

					oDataService.getData()
						.then(function (data) {
							this._updateModel(data);
						}.bind(this))
						.catch(function () {
							this._handleError("Card content data service failed to get data");
						})
						.finally(function () {
							this.setBusy(false);
						}.bind(this));

					oDataService.attachDataChanged(this._dataChangeHandler, oData.service.parameters);

					this._oDataService = oDataService;
				}
			}.bind(this)).catch(function () {
				this._handleError("Data service unavailable");
				this.setBusy(false);
			});
		} else if (oRequest) {
			Data.fetch(oRequest)
				.then(function (data) {
					this._updateModel(data, oData.path);
				}.bind(this))
				.catch(function (oError) {
					this._handleError("Card content data request failed");
				})
				.finally(function () {
					this.setBusy(false);
				}.bind(this));
		}
	};

	/**
	 * Updates the model and binds the data to the list.
	 *
	 * @private
	 * @param {Object} oData the data to set
	 */
	BaseContent.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);

		// Have to trigger _updated on the first onAfterRendering after _updateModel is called.
		setTimeout(function () {
			this.fireEvent("_updated");
		}.bind(this), 0);
	};

	BaseContent.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	BaseContent.getMinHeight = function (sType, oContent) {

		var MIN_HEIGHT = 5,
			iHeight;

		if (jQuery.isEmptyObject(oContent)) {
			return "0rem";
		}

		switch (sType) {
			case "ListContent":
				iHeight = BaseContent._getMinListHeight(oContent); break;
			case "TableContent":
				iHeight = BaseContent._getMinTableHeight(oContent); break;
			case "TimelineContent":
				iHeight = BaseContent._getMinTimelineHeight(oContent); break;
			case "AnalyticalContent":
				iHeight = 14; break;
			case "ObjectContent":
				iHeight = 0; break;
			default:
				iHeight = 0;
		}

		return  (iHeight !== 0 ? iHeight : MIN_HEIGHT) + "rem";
	};

	BaseContent._getMinListHeight = function (oContent) {
		var iCount = oContent.maxItems || 0,
			oTemplate = oContent.item,
			iItemHeight = 3;

		if (!oTemplate) {
			return 0;
		}

		if (oTemplate.icon || oTemplate.description) {
			iItemHeight = 4;
		}

		return iCount * iItemHeight;
	};

	BaseContent._getMinTableHeight = function (oContent) {
		var iCount = oContent.maxItems || 0,
			iRowHeight = 3,
			iTableHeaderHeight = 3;

		return iCount * iRowHeight + iTableHeaderHeight;
	};

	BaseContent._getMinTimelineHeight = function (oContent) {
		var iCount = oContent.maxItems || 0,
			iItemHeight = 6;

		return iCount * iItemHeight;
	};

	return BaseContent;
});

/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/base/ManagedObject', 'sap/ui/mdc/link/Panel', 'sap/ui/mdc/link/PanelItem', 'sap/ui/model/json/JSONModel', 'sap/ui/core/InvisibleText', 'sap/ui/base/ManagedObjectObserver', 'sap/ui/thirdparty/jquery', 'sap/base/Log', 'sap/ui/layout/library', 'sap/ui/layout/form/SimpleForm', 'sap/ui/core/Title'
], function(ManagedObject, Panel, PanelItem, JSONModel, InvisibleText, ManagedObjectObserver, jQuery, Log, layoutLibrary, SimpleForm, CoreTitle) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	/**
	 * Constructor for a new ContentHandler.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>ContentHandler</code> shows Fiori Launchpad actions and other additional information, for example, contact details. The <code>ContentHandler</code> is used by <code>Field</code>.
	 * @extends sap.ui.base.ManagedObject
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.ContentHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ContentHandler = ManagedObject.extend("sap.ui.mdc.link.ContentHandler", /** @lends sap.ui.mdc.link.ContentHandler.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				enablePersonalization: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Callback which allows to add new content or remove content of the <code>additionalContent</code> aggregation.
				 */
				modifyAdditionalContentCallback: {
					type: "function"
				}
			},
			aggregations: {
				/**
				 * Additional content
				 */
				additionalContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "additionalContent"
				},
				/**
				 * Handler which is responsible for links.
				 */
				linkHandler: {
					type: "sap.ui.mdc.link.ILinkHandler",
					multiple: false
				}
			},
			associations: {
				/**
				 * Mostly the source control is used in order to get the AppComponent which is required for link personalization.
				 */
				sourceControl: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * Is fired when the potential content is available or the content is not available any longer.
				 * The content is consisting of links determined by <code>linkHandler</code> and <code>additionalContent</code>.
				 * For example, the <code>FieldInfo</code> has to decide in the first step whether the <code>Field</code> is
				 * clickable or not i.e. has to be rendered as a link or as a text.
				 */
				existenceOfContentChanged: {}
			// refresh?
			}
		}
	});

	ContentHandler.prototype.init = function() {
		var oModel = new JSONModel({
			contentTitle: undefined,
			bHasPotentialContent: undefined,
			linkHandlerItems: []
		});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuimdcLink");

		this._oObserver = new ManagedObjectObserver(jQuery.proxy(this._observeChanges, this));
		this._oObserver.observe(this, {
			properties: [
				"modifyAdditionalContentCallback"
			],
			aggregations: [
				"linkHandler", "additionalContent"
			]
		});
	};

	ContentHandler.prototype.exit = function() {
		this._oObserver.disconnect();
		this._oObserver = undefined;
	};

	ContentHandler.prototype.setLinkHandler = function(oLinkHandler) {
		this.setAggregation("linkHandler", oLinkHandler);
		if (oLinkHandler && oLinkHandler.isA("sap.ui.mdc.link.FlpLinkHandler")) {
			this._oObserver.observe(oLinkHandler, {
				properties: [
					"semanticObjects"
				],
				aggregations: [
					"items"
				]
			});
		} else if (oLinkHandler && oLinkHandler.isA("sap.ui.mdc.link.LinkHandler")) {
			this._oObserver.observe(oLinkHandler, {
				aggregations: [
					"items"
				]
			});
		}
		return this;
	};

	// ----------------------- Implementation of 'IFieldInfo' interface --------------------------------------------

	/**
	 * In the first step we have just to decide whether the ContentHandler is clickable i.e. has to be rendered as a link.
	 * @returns {Promise} <code>true</code> if the ContentHandler is clickable
	 */
	ContentHandler.prototype.hasPotentialContent = function() {
		// Additional content should be shown always
		if (!!this.getModifyAdditionalContentCallback() || !!this.getAdditionalContent().length) {
			return Promise.resolve(true);
		}
		// If no additional content exists, we check whether any link items exist
		if (this.getLinkHandler()) {
			return this.getLinkHandler().hasPotentialLinks();
		}
		return Promise.resolve(false);
	};
	/**
	 * Returns as promise resolve a LinkItem as a direct link navigation if exist, else null.
	 * @returns {Promise} Resolve LinkItem of type sap.ui.mdc.link.LinkItem of direct link navigation, else null
	 */
	ContentHandler.prototype.getDirectLink = function() {
		// Additional content should be shown always, no direct navigation possible
		return this._determineAdditionalContent().then(function(aAdditionalContent) {
			// If additional content exists, return [] as the determination of LinkHandler items is not needed yet
			return aAdditionalContent.length ? [] : this._determineLinkHandlerItems();
		}.bind(this)).then(function(aLinkItems) {
			// If only one action exists (independent whether it is visible or not), direct navigation is
			// possible. Reason is that the visibility can be personalized. So e.g. if only one action is
			// visible and some actions are not visible the end user should be able to personalize the actions
			// again. This can the end user only do when the direct navigation is not executed.
			var aTriggerableItems = aLinkItems.filter(function(oItem) {
				return !!oItem.getHref();
			});
			if (aTriggerableItems.length !== 1) {
				return null;
			}
			return aTriggerableItems[0];
		});
	};

	// ----------------------- Implementation of 'ICreatePopover' interface --------------------------------------------

	ContentHandler.prototype.getContentTitle = function() {
		return new InvisibleText({
			text: this._getContentTitle()
		});
	};
	ContentHandler.prototype.getContent = function(fnGetAutoClosedControl) {
		return sap.ui.getCore().loadLibrary('sap.ui.fl', {
			async: true
		}).then(function() {
			return new Promise(function(resolve) {
				sap.ui.require([
					'sap/ui/fl/Utils',
					'sap/ui/fl/apply/api/FlexRuntimeInfoAPI'
				], function(Utils, FlexRuntimeInfoAPI) {

					return this._determineLinkHandlerItems(true).then(function(aLinkItems) {
						this._setConvertedLinkHandlerItems(aLinkItems, this._getView(Utils));

						aLinkItems.some(function(oLinkItem) {
							if (oLinkItem.getIsMain() === true) {
								this._setContentTitle(oLinkItem.getText());
								return true;
							}
						}.bind(this));

						return this._determineAdditionalContent();
					}.bind(this)).then(function(aAdditionalContent) {
						var aMLinkHandlerItems = this._getInternalModel().getProperty("/linkItems");
						var aMBaselineLinkHandlerItems = this._getInternalModel().getProperty("/baselineLinkItems");

						var oPanel = new Panel(this._createPanelId(Utils, FlexRuntimeInfoAPI), {
							enablePersonalization: this.getEnablePersonalization(), // brake the binding chain
							items: aMBaselineLinkHandlerItems.map(function(oMLinkItem) {
								return new PanelItem(oMLinkItem.key, {
									text: oMLinkItem.text,
									description: oMLinkItem.description,
									href: oMLinkItem.href,
									target: oMLinkItem.target,
									icon: oMLinkItem.icon,
									isMain: oMLinkItem.isMain,
									visible: true
								});
							}),
							additionalContent: !aAdditionalContent.length && !aMLinkHandlerItems.length ? ContentHandler._getNoContent() : aAdditionalContent,
							beforeSelectionDialogOpen: function() {
								if (fnGetAutoClosedControl && fnGetAutoClosedControl()) {
									fnGetAutoClosedControl().setModal(true);
								}
							},
							afterSelectionDialogClose: function() {
								if (fnGetAutoClosedControl && fnGetAutoClosedControl()) {
									fnGetAutoClosedControl().setModal(false);
								}
							},
							metadataHelperPath: "sap/ui/mdc/link/ContentHandler"
						});

						oPanel.setModel(new JSONModel({
							metadata: jQuery.extend(true, [], this._getInternalModel().getProperty("/linkItems")),
							baseline: jQuery.extend(true, [], this._getInternalModel().getProperty("/baselineLinkItems"))
						}), "$sapuimdcLink");
						return resolve(oPanel);
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};
	/**
	 * Retrieves the relevant metadata for the table and returns property info array
	 *
	 * @param {sap.ui.mdc.link.Panel} oPanel The instance Panel control
	 * @returns {object[]} Array of copied property info
	 */
	ContentHandler.retrieveAllMetadata = function(oPanel) {
		if (!oPanel.getModel || !oPanel.getModel("$sapuimdcLink")) {
			return [];
		}
		var oModel = oPanel.getModel("$sapuimdcLink");
		return oModel.getProperty("/metadata").map(function(oMLinkItem) {
			return {
				id: oMLinkItem.key,
				text: oMLinkItem.text,
				description: oMLinkItem.description,
				href: oMLinkItem.href,
				target: oMLinkItem.target,
				icon: oMLinkItem.icon,
				isMain: oMLinkItem.isMain,
				visible: oMLinkItem.visible
			};
		});
	};
	/**
	 * Retrieves the initial items belonging to the baseline which is used when reset is executed.
	 * @param {sap.ui.mdc.link.Panel} oPanel The instance Panel control
	 * @returns {object[]} Array of copied property info
	 */
	ContentHandler.retrieveBaseline = function(oPanel) {
		if (!oPanel.getModel || !oPanel.getModel("$sapuimdcLink")) {
			return [];
		}
		var oModel = oPanel.getModel("$sapuimdcLink");
		return oModel.getProperty("/baseline").map(function(oMLinkItem) {
			return {
				id: oMLinkItem.key,
				visible: true
			};
		});
	};
	// ----------------------- Private methods --------------------------------------------
	ContentHandler._getLinkItemByKey = function(sKey, aArray) {
		return aArray.filter(function(oMElement) {
			return oMElement.key === sKey;
		})[0];
	};
	ContentHandler.prototype._getView = function(Utils) {
		var oField;
		if (this.getParent() && this.getParent().getParent()){
			oField = this.getParent().getParent();
		}
		var oControl = sap.ui.getCore().byId(this.getSourceControl());
		if (!oControl) {
			Log.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
		}
		return Utils.getViewForControl(oControl) || Utils.getViewForControl(oField);
	};
	ContentHandler.prototype._createPanelId = function(Utils, FlexRuntimeInfoAPI) {
		var oField;
		if (this.getParent() && this.getParent().getParent()){
			oField = this.getParent().getParent();
		}
		var oControl = sap.ui.getCore().byId(this.getSourceControl());
		if (!oControl) {
			Log.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
		}
		if (!FlexRuntimeInfoAPI.isFlexSupported({element: this})) {
			Log.error("Invalid component. The mandatory 'sourceControl' association should be assigned to the app component due to personalization reasons.");
			return this.getId() + "-idInfoPanel";
		}
		var oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
		return oAppComponent.createId("idInfoPanel");
	};
	ContentHandler.prototype._setConvertedLinkHandlerItems = function(aLinkItems, oView) {
		var oModel = this._getInternalModel();
		var aMLinkItems = aLinkItems.map(function(oLinkItem) {
			if (!oLinkItem.getKey()) {
				Log.error("sap.ui.mdc.link.ContentHandler: undefined 'key' property of the LinkItem " + oLinkItem.getId() + ". The mandatory 'key' property should be defined due to personalization reasons.");
			}
			return {
				key: oLinkItem.getKey(),
				text: oLinkItem.getText(),
				description: oLinkItem.getDescription(),
				href: oLinkItem.getHref(),
				target: oLinkItem.getTarget(),
				icon: oLinkItem.getIcon(),
				isMain: oLinkItem.getIsMain(),
				isSuperior: oLinkItem.getInitiallyVisible(),
				visible: false
			};
		});
		oModel.setProperty("/linkItems/", aMLinkItems);

		// As default we do not show any items initially (the baseline is empty)
		// The item marked as main should always be shown (according to the UX)
		var aMBaselineLinkItems = aMLinkItems.filter(function(oMLinkItem) {
			return oMLinkItem.isMain === true || !oMLinkItem.key;
		});
		oModel.setProperty("/baselineLinkItems/", aMBaselineLinkItems);
	};
	ContentHandler.prototype._determineLinkHandlerItems = function(bOverride) {
		if (!this._oLinkHandlerItemsPromise || bOverride) {
			var oLinkHandler = this.getLinkHandler();
			this._oLinkHandlerItemsPromise = oLinkHandler ? oLinkHandler.determineItems() : Promise.resolve([]);
		}
		return this._oLinkHandlerItemsPromise;
	};
	ContentHandler._getNoContent = function() {
		var oSimpleForm = new SimpleForm({
			layout: SimpleFormLayout.ResponsiveGridLayout,
			content: [
				new CoreTitle({
					text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_MSG_NO_CONTENT")
				})
			]
		});
		oSimpleForm.addStyleClass("mdcbaseinfoPanelDefaultAdditionalContent");
		return oSimpleForm;
	};
	ContentHandler.prototype._determineAdditionalContent = function() {
		if (this.getModifyAdditionalContentCallback()) {
			return this.getModifyAdditionalContentCallback()(this).then(function() {
				return this.getAdditionalContent() ? this.getAdditionalContent().map(function(oAdditionalContent) {
					return oAdditionalContent.clone();
				}) : [];
			}.bind(this));
		}
		return Promise.resolve(this.getAdditionalContent() ? this.getAdditionalContent().map(function(oAdditionalContent) {
			return oAdditionalContent.clone();
		}) : []);
	};
	ContentHandler.prototype._getContentTitle = function() {
		return this._getInternalModel().getProperty("/contentTitle");
	};
	ContentHandler.prototype._setContentTitle = function(sTitle) {
		return this._getInternalModel().setProperty("/contentTitle", sTitle);
	};
	ContentHandler.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdcLink");
	};
	ContentHandler.prototype._observeChanges = function(oChanges) {
		if (oChanges.object.isA("sap.ui.mdc.link.ILinkHandler") || oChanges.object.isA("sap.ui.mdc.link.ContentHandler")) {
			this._determineContent();
		}
	};
	ContentHandler.prototype._determineContent = function() {
		this.hasPotentialContent().then(function(bHasPotentialContent) {
			if (this._getInternalModel().getProperty('/bHasPotentialContent') !== bHasPotentialContent) {
				this._getInternalModel().setProperty('/bHasPotentialContent', bHasPotentialContent);
				this.fireExistenceOfContentChanged();
			}
		}.bind(this));
	};

	return ContentHandler;
});

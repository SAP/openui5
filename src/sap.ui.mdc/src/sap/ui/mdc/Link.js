/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/FieldInfoBase",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/InvisibleText",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/link/Log",
	"sap/base/Log",
	"sap/ui/mdc/link/Panel",
	"sap/ui/mdc/link/PanelItem",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/ui/layout/library"
], function(FieldInfoBase,
	jQuery,
	InvisibleText,
	JSONModel,
	Log,
	SapBaseLog,
	Panel,
	PanelItem,
	SimpleForm,
	CoreTitle,
	layoutLibrary) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
	var ResponsiveGridLayout = layoutLibrary.form.SimpleFormLayout.ResponsiveGridLayout;

	/**
	 * Constructor for the new <code>Link</code>
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>Link</code> control can be used to handle navigation scenarios with one or more targets through direct navigation or by opening a {@link sap.ui.mdc.link.Panel}.<br>
	 * It can also be used to display additional content, such as {@link sap.ui.mdc.link.ContactDetails} on the {@link sap.ui.mdc.link.Panel}.
	 * <b>Note:</b> Navigation targets are determined by the implementation of a {@link sap.ui.mdc.LinkDelegate}.
	 *
	 * @extends sap.ui.mdc.field.FieldInfoBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.Link
	 * @since 1.74
	 *
	 * @experimental
	 * @private
	 */
	var Link = FieldInfoBase.extend("sap.ui.mdc.Link", /** @lends sap.ui.mdc.Link.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Enables/disables the personalization settings for users and key users.
				 */
				enablePersonalization: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Path to <code>LinkDelegate</code> module that provides the required APIs to create content for the <code>Link</code> control.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. Once the required module is associated, this property might not be needed any longer.
				 *
				 * @experimental
				 */
				delegate: {
					type: "object",
					defaultValue: { name: "sap/ui/mdc/LinkDelegate", payload: {} }
				}
			},
			associations: {
				/**
				 * Gets the app component required for link personalization. Also, the source control is used to get the binding context.
				 */
				sourceControl: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		}
	});

	Link.prototype.applySettings = function() {
		FieldInfoBase.prototype.applySettings.apply(this, arguments);
		this.initControlDelegate();
	};

	Link.prototype.init = function() {
		var oModel = new JSONModel({
			contentTitle: undefined,
			bHasPotentialContent: undefined,
			linkItems: []
		});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuimdcLink");
		this.attachEvent("modelContextChange", this._handleModelContextChange, this);
		this._bLinkItemsFetched = false;
		this._aLinkItems = [];

		FieldInfoBase.prototype.init.apply(this, arguments);
	};

	/**
	 * Returns an object containing <code>href</code> and <code>target</code> of <code>getDirectLink</code>.
	 * Returns <code>null</code> if there is no direct link.
	 * @returns {Promise} {Object | null}
	 */
	Link.prototype.getDirectLinkHrefAndTarget = function() {
		return this.getDirectLink().then(function(oLink) {
			return oLink ? {
				target: oLink.getTarget(),
				href: oLink.getHref()
			} : null;
		});
	};

	// ----------------------- Implementation of 'IFieldInfo' interface --------------------------------------------

	/**
	 * Checks if <code>FieldInfo</code> is clickable and therefore rendered as a <code>Link</code> control.
	 * @returns {Promise} <code>true</code> if <code>FieldInfo</code> is clickable
	 */
	Link.prototype.isTriggerable = function() {
		return this.awaitControlDelegate().then(function() {
			if (this._bIsBeingDestroyed) {
				return false;
			}
			var oPayload = Object.assign({}, this.getPayload());
			return this.getControlDelegate().fetchLinkType(oPayload).then(function(oLinkType) {
				if (oLinkType.type > 0) {
					return true;
				}
				return false;
			});
		}.bind(this));
	};
	/**
	 * Returns an <code>href</code> of direct link navigation, once the <code>Promise</code> has been resolved.
	 * @returns {Promise} <code>href</code> of direct link navigation, else <code>null</code>
	 */
	Link.prototype.getTriggerHref = function() {
		return this.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
			return oLinkItem ? oLinkItem.href : null;
		});
	};

	/**
	 * Retrieves the relevant metadata for the panel and returns a property info array.
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of a <code>Panel</code> control
	 * @returns {object[]} Array of copied property info
	 */
	Link.retrieveAllMetadata = function(oPanel) {
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
				visible: oMLinkItem.visible
			};
		});
	};

	/**
	 * Retrieves the items that are initially part of the baseline which is used when a reset is done.
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of a <code>Panel</code> control
	 * @returns {object[]} Array of copied property info
	 */
	Link.retrieveBaseline = function(oPanel) {
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

	/**
	 * Returns a <code>Promise</code> resolving a Boolean if the <code>Link</code> control has any content (<code>additionalContent</code> or <code>linkItems</code>).
	 * This is mainly used to check if the <code>Link</code> control is clickable.
	 * @returns {Promise} Resolves a Boolean value
	 */
	Link.prototype.hasPotentialContent = function() {
		// Additional content should be shown always
		return this.retrieveAdditionalContent().then(function(aAdditionalContent) {
			if (aAdditionalContent.length) {
				return Promise.resolve(true);
			}
			return Promise.resolve(this.hasPotentialLinks());
		}.bind(this));
	};

	/**
	 * Returns a <code>Promise</code> that resolves and returns <code>LinkItem</code> as a direct link navigation, else <code>null</code>.
	 * @returns {Promise} Resolves <code>LinkItem</code> of type {@link sap.ui.mdc.link.LinkItem} of direct link navigation, else <code>null</code>
	 */
	Link.prototype.getDirectLink = function() {
		return this.retrieveDirectLinkItem().then(function(oDirectLinkItem) {
			this.addDependent(oDirectLinkItem);
			return oDirectLinkItem;
		}.bind(this));
	};

	// ----------------------- Implementation of 'ICreatePopover' interface --------------------------------------------

	Link.prototype.getContentTitle = function() {
		return new InvisibleText({
			text: this._getContentTitle()
		});
	};

	/**
	 * Function that is called in the <code>createPopover</code> function of {@link sap.ui.mdc.field.FieldInfoBase}.
	 * @param {Function} fnGetAutoClosedControl Function returning the <code>Popover</code> control that is created in <code>createPopover</code>
	 * @returns {sap.ui.mdc.link.Panel} Popover panel which is to be displayed after clicking the link
	*/
	Link.prototype.getContent = function(fnGetAutoClosedControl) {
		var oLinkItemsPromise = this.retrieveLinkItems();
		var oAdditionalContentPromise = this.retrieveAdditionalContent();
		return Promise.all([oLinkItemsPromise, oAdditionalContentPromise]).then(function(values) {
			var aLinkItems = values[0];
			var aAdditionalContent = values[1];
			return new Promise(function(resolve) {
				sap.ui.require([
					'sap/ui/fl/Utils',
					'sap/ui/fl/apply/api/FlexRuntimeInfoAPI'
				], function(Utils, FlexRuntimeInfoAPI) {
					this._setConvertedLinkItems(aLinkItems);
					var aMLinkItems = this._getInternalModel().getProperty("/linkItems");
					var aMBaselineLinkItems = this._getInternalModel().getProperty("/baselineLinkItems");

					var oPanel = new Panel(this._createPanelId(Utils, FlexRuntimeInfoAPI), {
						enablePersonalization: this.getEnablePersonalization(), // brake the binding chain
						items: aMBaselineLinkItems.map(function(oMLinkItem) {
							return new PanelItem(oMLinkItem.key, {
								text: oMLinkItem.text,
								description: oMLinkItem.description,
								href: oMLinkItem.href,
								target: oMLinkItem.target,
								icon: oMLinkItem.icon,
								visible: true
							});
						}),
						additionalContent: !aAdditionalContent.length && !aMLinkItems.length ? Link._getNoContent() : aAdditionalContent,
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
						beforeNavigationCallback: this._beforeNavigationCallback.bind(this),
						metadataHelperPath: "sap/ui/mdc/Link"
					});

					oPanel.setModel(new JSONModel({
						metadata: jQuery.extend(true, [], this._getInternalModel().getProperty("/linkItems")),
						baseline: jQuery.extend(true, [], this._getInternalModel().getProperty("/baselineLinkItems"))
					}), "$sapuimdcLink");
					return resolve(oPanel);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Returns a <code>Promise</code> that resolves and returns a Boolean value if the <code>Link</code> control has any potential <code>LinkItem</code> objects.
	 * This is mainly used to check if the <code>Link</code> control  is clickable.
	 * @returns {Promise} Resolves a Boolean value
	 */
	Link.prototype.hasPotentialLinks = function() {
		return this._retrieveUnmodifiedLinkItems().then(function(aLinkItems) {
			return !!aLinkItems.length;
		});
	};

	/**
	 * Calls the <code>modifyLinkItems</code> function of <code>Delegate</code> before returning the <code>LinkItem</code> objects.
	 * @returns {Promise} Resolves an array of type {@link sap.ui.mdc.link.LinkItem}
	 */
	Link.prototype.retrieveLinkItems = function() {
		var oPayload = Object.assign({}, this.getPayload());
		var oBindingContext = this._getControlBindingContext();
		return this._retrieveUnmodifiedLinkItems().then(function(aUnmodifiedLinkItems) {
			return this.getControlDelegate().modifyLinkItems(oPayload, oBindingContext, aUnmodifiedLinkItems).then(function(aLinkItems) {
				return aLinkItems;
			});
		}.bind(this));
	};

	/**
	 * @returns {Promise} Resolves an array of type {@link sap.ui.mdc.link.LinkItem}
	 */
	Link.prototype._retrieveUnmodifiedLinkItems = function() {
		if (this._bLinkItemsFetched) {
			return Promise.resolve(this._aLinkItems);
		} else {
			this.oUseDelegateItemsPromise = this._useDelegateItems();
			return this.oUseDelegateItemsPromise.then(function() {
				return Promise.resolve(this._aLinkItems);
			}.bind(this));
		}
	};

	/**
	 * @returns {Promise} Resolves an array of type {@link sap.ui.base.Control}
	 */
	Link.prototype.retrieveAdditionalContent = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				var oPayload = Object.assign({}, this.getPayload());
				var oBindingContext = this._getControlBindingContext();
				return this.getControlDelegate().fetchAdditionalContent(oPayload, oBindingContext, this).then(function(aAdditionalContent) {
					return aAdditionalContent;
				});
			}.bind(this));
		}
		SapBaseLog.error("mdc.Link retrieveAdditionalContent: control delegate is not set - could not load AdditionalContent from delegate.");
		return Promise.resolve([]);
	};

	/**
	 * @returns {Promise} Returns <code>null</code> or a {@link sap.ui.mdc.link.LinkItem}, once resolved
	 */
	Link.prototype.retrieveDirectLinkItem = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				var oPayload = Object.assign({}, this.getPayload());
				return this.getControlDelegate().fetchLinkType(oPayload).then(function(oLinkType) {
					if (oLinkType.type !== 1 || oLinkType.directLink === undefined) {
						return null;
					}
					return oLinkType.directLink;
				});
			}.bind(this));
		}
		SapBaseLog.error("mdc.Link retrieveDirectLinkItem: control delegate is not set - could not load LinkItems from delegate.");
		return Promise.resolve(null);
	};

	/**
	 * @returns {String} ID of the SourceControl
	 */
	Link.prototype.getSourceControl = function() {
		return this.getAssociation("sourceControl");
	};

	/**
	 * Removes all link items.
	 */
	Link.prototype.removeAllLinkItems = function() {
		this._retrieveUnmodifiedLinkItems().then(function(aLinkItems) {
			aLinkItems.forEach(function(oLinkItem) {
				oLinkItem.destroy();
				oLinkItem = undefined;
			});
			this._setLinkItems([]);
			this._determineContent();
		}.bind(this));
	};

	/**
	 * @private
	 * @returns {String} Content title saved in the internal model
	 */
	Link.prototype._getContentTitle = function() {
		return this._getInternalModel().getProperty("/contentTitle");
	};

	/**
	 * Returns the binding context of the source control or of the link itself.
	 * @private
	 * @returns {Object} The binding context of the SourceControl / link
	 */
	Link.prototype._getControlBindingContext = function() {
		var oControl = sap.ui.getCore().byId(this.getSourceControl());
		return oControl && oControl.getBindingContext() || this.getBindingContext();
	};

	/**
	 * Returns the object of a given binding context.
	 * @private
	 * @param {Object} oBindingContext The given binding context
	 * @returns {Object | undefined} Object of the binding context
	 */
	Link.prototype._getContextObject = function(oBindingContext) {
		return oBindingContext ? oBindingContext.getObject(oBindingContext.getPath()) : undefined;
	};

	/**
	 * Generates a new <code>sap.bas.log</code> if the payload contains semantic objects (this log is required for <code>sap.ui.mdc.flp.FlpLinkDelegate</code>).
	 * @private
	 * @returns {sap.base.Log | undefined} A generated <code>InfoLog</code> for the control | undefined
	 */
	Link.prototype._getInfoLog = function() {
		if (this.getPayload() && this.getPayload().semanticObjects) {
			if (this._oInfoLog) {
				return this._oInfoLog;
			}
			if (SapBaseLog.getLevel() >= SapBaseLog.Level.INFO) {
				this._oInfoLog = new Log();
				this._oInfoLog.initialize(this.getPayload().semanticObjects, this._getContextObject(this._getControlBindingContext()));
				return this._oInfoLog;
			}
		}
		return undefined;
	};

	/**
	 * @private
	 * @returns {sap.ui.model.json.JSONModel} Internal model of the link
	 */
	Link.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdcLink");
	};

	/**
	 * @private
	 * @returns {String} Contains information of the InfoLog | "No logging data available"
	 */
	Link.prototype._getLogFormattedText = function() {
		return (this._oInfoLog && !this._oInfoLog.isEmpty()) ? "---------------------------------------------\nsap.ui.mdc.Link:\nBelow you can see detailed information regarding semantic attributes which have been calculated for one or more semantic objects defined in a Link control. Semantic attributes are used to create the URL parameters. Additionally you can see all links containing the URL parameters.\n" + this._oInfoLog.getFormattedText() : "No logging data available";
	};

	/**
	 * @private
	 * @returns {sap.ui.layout.form.SimpleForm} Form containing a title which notices the user that there is no content for this link
	 */
	Link._getNoContent = function() {
		var oSimpleForm = new SimpleForm({
			layout: ResponsiveGridLayout,
			content: [
				new CoreTitle({
					text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_MSG_NO_CONTENT")
				})
			]
		});
		oSimpleForm.addStyleClass("mdcbaseinfoPanelDefaultAdditionalContent");
		return oSimpleForm;
	};

	/**
	 * @private
	 * @param {sap.ui.fl.Utils} Utils flexibility utility class
	 * @returns {Object} View of the sourceControl / sourceControl of the parent
	 */
	Link.prototype._getView = function(Utils) {
		var oField;
		if (this.getParent()) {
			oField = this.getParent();
		}
		var oControl = sap.ui.getCore().byId(this.getSourceControl());
		if (!oControl) {
			//SapBaseLog.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
			this.setSourceControl(oField);
		}
		return Utils.getViewForControl(oControl) || Utils.getViewForControl(oField);
	};

	/**
	 * @private
	 * @param {String} sTitle The given title
	 * @return {undefined}
	 */
	Link.prototype._setContentTitle = function(sTitle) {
		return this._getInternalModel().setProperty("/contentTitle", sTitle);
	};

	/**
	 * @private
	 * @param {sap.ui.mdc.link.LinkItem[]} aLinkItems The given <code>LinkItem</code> objects
	 */
	Link.prototype._setConvertedLinkItems = function(aLinkItems) {
		var oModel = this._getInternalModel();
		var aMLinkItems = aLinkItems.map(function(oLinkItem) {
			if (!oLinkItem.getKey()) {
				SapBaseLog.error("sap.ui.mdc.Link: undefined 'key' property of the LinkItem " + oLinkItem.getId() + ". The mandatory 'key' property should be defined due to personalization reasons.");
			}
			return {
				key: oLinkItem.getKey(),
				text: oLinkItem.getText(),
				description: oLinkItem.getDescription(),
				href: oLinkItem.getHref(),
				target: oLinkItem.getTarget(),
				icon: oLinkItem.getIcon(),
				initiallyVisible: oLinkItem.getInitiallyVisible(),
				visible: false
			};
		});
		oModel.setProperty("/linkItems/", aMLinkItems);

		var aMBaselineLinkItems = aMLinkItems.filter(function(oMLinkItem) {
			return oMLinkItem.initiallyVisible;
		});
		oModel.setProperty("/baselineLinkItems/", aMBaselineLinkItems);
	};

	/**
	 * @private
	 * @param {sap.ui.mdc.link.LinkItem[]} aLinkItems The given <code>LinkItem</code> objects
	 */
	Link.prototype._setLinkItems = function(aLinkItems) {
		var aLinkItemsMissingParent = aLinkItems.filter(function(oLinkItem) {
			return oLinkItem.getParent() === null;
		});
		aLinkItemsMissingParent.forEach(function(oLinkItem) {
			this.addDependent(oLinkItem);
		}.bind(this));
		this._aLinkItems = aLinkItems;
	};

	/**
	 * Generates an ID for the panel of the <code>Link</code> control. The result depends on whether the <code>Link</code> control supports flexibility.
	 * @private
	 * @param {sap.ui.fl.Utils} Utils Flexibility utility class
	 * @param {sap.ui.fl.apply.api.FlexRuntimeInfoAPI} FlexRuntimeInfoAPI Flexibility runtime info API
	 * @returns {String} Generated ID of the panel
	 */
	Link.prototype._createPanelId = function(Utils, FlexRuntimeInfoAPI) {
		var oField;
		if (this.getParent()) {
			oField = this.getParent();
		}
		var oControl = sap.ui.getCore().byId(this.getSourceControl());
		if (!oControl) {
			//SapBaseLog.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
			this.setSourceControl(oField);
		}
		if (!FlexRuntimeInfoAPI.isFlexSupported({ element: this })) {
			SapBaseLog.error("Invalid component. The mandatory 'sourceControl' association should be assigned to the app component due to personalization reasons.");
			return this.getId() + "-idInfoPanel";
		}
		var oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
		return oAppComponent.createId("idInfoPanel");
	};

	/**
	 * Determines if the <code>Link</code> control has potential content to display and sets its internal model property <code>bHasPotentialContent</code>.
	 * @private
	 */
	Link.prototype._determineContent = function() {
		this.hasPotentialContent().then(function(bHasPotentialContent) {
			if (this._getInternalModel().getProperty('/bHasPotentialContent') !== bHasPotentialContent) {
				this._getInternalModel().setProperty('/bHasPotentialContent', bHasPotentialContent);
			}
		}.bind(this));
	};

	Link.prototype._handleModelContextChange = function(oEvent) {
		this.fireDataUpdate();
	};

	/**
	 * Determines the <code>LinkItem</code> objects depending on the given <code>LinkDelegate</code>.
	 * @private
	 * @returns {Promise} Resolves once the <code>LinkItem</code> objects have been retrieved by the delegate. This also sets this._aLinkItems.
	 */
	Link.prototype._useDelegateItems = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				// Assign new Object so payload.id won't get set for the whole Link class
				var oPayload = Object.assign({}, this.getPayload());
				var oBindingContext = this._getControlBindingContext();
				var oInfoLog = this._getInfoLog();
				return new Promise(function(resolve) {
					this.getControlDelegate().fetchLinkItems(oPayload, oBindingContext, oInfoLog).then(function(aLinkItems) {
						this._setLinkItems(aLinkItems === null ? [] : aLinkItems);
						this._bLinkItemsFetched = aLinkItems !== null;
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}
		SapBaseLog.error("mdc.Link _useDelegateItems: control delegate is not set - could not load LinkItems from delegate.");
		return Promise.resolve();
	};

	/**
	 * Proxy function for the <code>beforeNavigationCallback</code> of the panel.
	 * @private
	 * @param {Object} oEvent Object of the event that gets fired by the <code>onPress</code> event of the link on the panel / selection dialog
	 * @returns {Promise} Returns a Boolean value determining whether navigation takes place , once resolved
	 */
	Link.prototype._beforeNavigationCallback = function(oEvent) {
		var oPayload = Object.assign({}, this.getPayload());
		return this.getControlDelegate().beforeNavigationCallback(oPayload, oEvent);
	};

	return Link;
});

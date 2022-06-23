/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/FieldInfoBase",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/BindingMode",
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
	BindingMode,
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
	 * A <code>Link</code> control can be used to handle navigation scenarios with one or more targets through direct navigation or by opening a <code>Panel</code>.<br>
	 * It can also be used to display additional content, such as <code>ContactDetails</code> on the <code>Panel</code>.
	 * <b>Note:</b> Navigation targets are determined by the implementation of a {@link module:sap/ui/mdc/LinkDelegate LinkDelegate}.
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
	 * @experimental As of version 1.74
	 * @private
	 * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
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
			linkItems: []
		});

		oModel.setDefaultBindingMode(BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuimdcLink");
		this.attachEvent("modelContextChange", this.fireDataUpdate, this);
		this._oLinkType = null;
		this._bLinkItemsFetched = false;
		this._aLinkItems = [];

		FieldInfoBase.prototype.init.apply(this, arguments);
	};

	Link.prototype.exit = function() {
		this._aLinkItems = undefined;
		this._bLinkItemsFetched = undefined;
		this._oLinkType = undefined;
		this._oUseDelegateItemsPromise = undefined;

		this._aAdditionalContent = undefined;
		this._oUseDelegateAdditionalContentPromise = undefined;

		FieldInfoBase.prototype.exit.apply(this, arguments);
	};

	// ----------------------- Implementation of 'FieldInfoBase' interface --------------------------------------------

	/**
	 * Checks if <code>FieldInfo</code> is clickable and therefore rendered as a <code>Link</code> control.
	 * @returns {Promise} <code>true</code> if <code>FieldInfo</code> is clickable
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 */
	Link.prototype.isTriggerable = function() {
		return this.retrieveLinkType().then(function(oLinkTypeObject) {
			var oRuntimeLinkTypePromise = oLinkTypeObject.runtimeType;
			var oInitialLinkType = oLinkTypeObject.initialType ? oLinkTypeObject.initialType : oLinkTypeObject;

			if (oRuntimeLinkTypePromise && oRuntimeLinkTypePromise instanceof Promise) {
				oRuntimeLinkTypePromise.then(function(oRuntimeLinkType) {
					if (!this._oLinkType || oRuntimeLinkType.linkType !== this._oLinkType.linkType) {
						this._oLinkType = oRuntimeLinkType;
						this.fireDataUpdate();
					}
				}.bind(this));
			}
			return this._oLinkType ? this._oLinkType.type > 0 : oInitialLinkType.type > 0;
		}.bind(this));
	};

	/**
	 * Returns an <code>href</code> of direct link navigation, once the <code>Promise</code> has been resolved.
	 * @returns {Promise} <code>href</code> of direct link navigation, else <code>null</code>
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 */
	Link.prototype.getTriggerHref = function() {
		return this.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
			return oLinkItem ? oLinkItem.href : null;
		});
	};

	/**
	 * Returns an object containing <code>href</code> and <code>target</code> of the direct navigation.
	 * Returns <code>null</code> if there is no direct link.
	 * @returns {Promise} {Object | null}
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 */
	Link.prototype.getDirectLinkHrefAndTarget = function() {
		return this._retrieveDirectLinkItem().then(function(oDirectLinkItem) {
			this.addDependent(oDirectLinkItem);
			return oDirectLinkItem ? {
				target: oDirectLinkItem.getTarget(),
				href: oDirectLinkItem.getHref()
			} : null;
		}.bind(this));
	};

	/**
	 * @returns {Promise} Returns <code>null</code> or a {@link sap.ui.mdc.link.LinkItem}, once resolved
	 * @private
	 */
	Link.prototype._retrieveDirectLinkItem = function() {
		return this.retrieveLinkType().then(function(oLinkTypeObject) {
			if (this._linkTypeHasDirectLink(this._oLinkType)) {
				return this._oLinkType.directLink;
			}

			var oLinkType = oLinkTypeObject.initialType ? oLinkTypeObject.initialType : oLinkTypeObject;

			if (this._linkTypeHasDirectLink(oLinkType)) {
				return oLinkType.directLink;
			}
			return null;
		}.bind(this));
	};

	/**
	 * Checks if a given {@link sap.ui.mdc.LinkDelegate.LinkType} contains a directLink value.
	 * @param {sap.ui.mdc.LinkDelegate.LinkType} oLinkType the <code>LinkType</code> which should be checked
	 * @returns {boolean} bHasDirectLink
	 * @private
	 */
	Link.prototype._linkTypeHasDirectLink = function(oLinkType) {
		return oLinkType && oLinkType.type === 1 && oLinkType.directLink;
	};

	/**
	 * Function that is called in the <code>createPopover</code> function of {@link sap.ui.mdc.field.FieldInfoBase}.
	 * @param {Function} [fnGetAutoClosedControl] Function returning the <code>Popover</code> control that is created in <code>createPopover</code>
	 * @returns {sap.ui.mdc.link.Panel} Popover panel which is to be displayed after clicking the link
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
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

					var oPanelAdditionalContent = !aAdditionalContent.length && !aMLinkItems.length ? this._getNoContent() : aAdditionalContent;

					var sPanelId = this._createPanelId(Utils, FlexRuntimeInfoAPI);
					var oExistingPanel = sap.ui.getCore().byId(sPanelId);
					if (oExistingPanel) {
						SapBaseLog.warning("Duplicate ID '" + sPanelId + "'. The instance of sap.ui.mdc.link.Panel should be destroyed first in order to avoid duplicate creation of sap.ui.mdc.link.Panel with stable ID.");
						// close Popover if existing
						if (oExistingPanel.getParent() && oExistingPanel.getParent().close) {
							oExistingPanel.getParent().close();
						}
						oExistingPanel.destroy();
					}

					var oPanel = new Panel(sPanelId, {
						enablePersonalization: this.getEnablePersonalization(), // brake the binding chain
						items: aMBaselineLinkItems.map(function(oMLinkItem) {
							return new PanelItem(oMLinkItem.key, {
								text: oMLinkItem.text,
								description: oMLinkItem.description,
								href: oMLinkItem.href,
								internalHref: oMLinkItem.internalHref,
								target: oMLinkItem.target,
								icon: oMLinkItem.icon,
								visible: true
							});
						}),
						additionalContent: oPanelAdditionalContent,
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
					// reset _aAdditionalContent as the additionalContent gets forwarded to the Panel and will be destroyed when the Popover is closed
					this._setAdditionalContent(undefined);

					return resolve(oPanel);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	Link.prototype.checkDirectNavigation = function() {
		var oLinkItemsPromise = this.retrieveLinkItems();
		var oAdditionalContentPromise = this.retrieveAdditionalContent();
		return Promise.all([oLinkItemsPromise, oAdditionalContentPromise]).then(function(values) {
			var aLinkItems = values[0];
			var aAdditionalContent = values[1];

			this._setConvertedLinkItems(aLinkItems);
			var aMLinkItems = this._getInternalModel().getProperty("/linkItems");

			if (aMLinkItems.length === 1 && !aAdditionalContent.length) {
				Panel.navigate(aMLinkItems[0].href);
				return Promise.resolve(true);
			}
			return Promise.resolve(false);
		}.bind(this));
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
				internalHref: oLinkItem.getInternalHref(),
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
	 * @returns {sap.ui.layout.form.SimpleForm} Form containing a title which notices the user that there is no content for this link
	 */
	Link.prototype._getNoContent = function() {
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
	 * Generates an ID for the panel of the <code>Link</code> control. The result depends on whether the <code>Link</code> control supports flexibility.
	 * @private
	 * @param {sap.ui.fl.Utils} Utils Flexibility utility class
	 * @param {sap.ui.fl.apply.api.FlexRuntimeInfoAPI} FlexRuntimeInfoAPI Flexibility runtime info API
	 * @returns {string} Generated ID of the panel
	 */
	Link.prototype._createPanelId = function(Utils, FlexRuntimeInfoAPI) {
		var oField;
		if (this.getParent()) {
			oField = this.getParent();
		}
		var oControl = this._getSourceControl();
		if (!oControl) {
			//SapBaseLog.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
			this.setSourceControl(oField);
			oControl = oField;
		}
		if (!FlexRuntimeInfoAPI.isFlexSupported({ element: this }) || !FlexRuntimeInfoAPI.isFlexSupported({ element: oControl })) {
			SapBaseLog.error("Invalid component. The mandatory 'sourceControl' association should be assigned to the app component due to personalization reasons.");
			return this.getId() + "-idInfoPanel";
		}
		var oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
		return oAppComponent.createId("idInfoPanel");
	};

	// ------------------------------ sap/ui/mdc/link/Panel relevant methods ---------------------------------------

	/**
	 * Retrieves the relevant metadata for the panel and returns a property info array.
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of a <code>Panel</code> control
	 * @returns {object[]} Array of copied property info
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
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
				internalHref: oMLinkItem.internalHref,
				target: oMLinkItem.target,
				visible: oMLinkItem.visible
			};
		});
	};

	/**
	 * Retrieves the items that are initially part of the baseline which is used when a reset is done.
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of a <code>Panel</code> control
	 * @returns {object[]} Array of copied property info
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
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

	// ----------------------- sap/ui/mdc/flp/FlpLinkDelegate relevant methods -------------------------------------

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
	 * Returns the object of a given binding context.
	 * @private
	 * @param {Object} oBindingContext The given binding context
	 * @returns {Object | undefined} Object of the binding context
	 */
	Link.prototype._getContextObject = function(oBindingContext) {
		return oBindingContext ? oBindingContext.getObject(oBindingContext.getPath()) : undefined;
	};

	// ----------------------- sap/ui/mdc/LinkDelegate function calls ----------------------------------------------

	/**
	 * @returns {Promise<sap.ui.core.Control[]>} Resolves an array of type {@link sap.ui.core.Control}
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 */
	Link.prototype.retrieveAdditionalContent = function() {
		if (this._aAdditionalContent) {
			return Promise.resolve(this._aAdditionalContent);
		} else {
			this._oUseDelegateAdditionalContentPromise = this._useDelegateAdditionalContent();
			return this._oUseDelegateAdditionalContentPromise.then(function() {
				return Promise.resolve(this._aAdditionalContent);
			}.bind(this));
		}
	};

	/**
	 * Determines the <code>AdditionalContent</code> objects depending on the given <code>LinkDelegate</code>.
	 * @private
	 * @returns {Promise} Resolves once the <code>AdditionalContent</code> objects have been retrieved by the delegate. This also sets this._aAdditionalContent.
	 */
	Link.prototype._useDelegateAdditionalContent = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				var oPayload = Object.assign({}, this.getPayload());
				return new Promise(function(resolve) {
					this.getControlDelegate().fetchAdditionalContent(oPayload, this).then(function(aAdditionalContent) {
						this._setAdditionalContent(aAdditionalContent === null ? [] : aAdditionalContent);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}
		SapBaseLog.error("mdc.Link retrieveAdditionalContent: control delegate is not set - could not load AdditionalContent from delegate.");
		return Promise.resolve([]);
	};

	/**
	 * @private
	 * @param {sap.ui.core.Control[]} aAdditionalContent The given <code>AdditionalContent</code> objects
	 */
	 Link.prototype._setAdditionalContent = function(aAdditionalContent) {
		this._aAdditionalContent = aAdditionalContent;
	};

	/**
	 * @returns {Promise} Returns a {@link sap.ui.mdc.LinkDelegate.LinkType}, once resolved
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 */
	Link.prototype.retrieveLinkType = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				var oPayload = Object.assign({}, this.getPayload());
				return this.getControlDelegate().fetchLinkType(oPayload, this);
			}.bind(this));
		}
		SapBaseLog.error("mdc.Link retrieveLinkType: control delegate is not set - could not load LinkType from delegate.");
		return Promise.resolve(null);
	};

	/**
	 * Calls the <code>modifyLinkItems</code> function of <code>Delegate</code> before returning the <code>LinkItem</code> objects.
	 * @returns {Promise} Resolves an array of type {@link sap.ui.mdc.link.LinkItem}
	 * @protected
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
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
	 * @private
	 * @returns {Promise} Resolves an array of type {@link sap.ui.mdc.link.LinkItem}
	 */
	Link.prototype._retrieveUnmodifiedLinkItems = function() {
		if (this._bLinkItemsFetched) {
			return Promise.resolve(this._aLinkItems);
		} else {
			this._oUseDelegateItemsPromise = this._useDelegateItems();
			return this._oUseDelegateItemsPromise.then(function() {
				return Promise.resolve(this._aLinkItems);
			}.bind(this));
		}
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
	 * Proxy function for the <code>beforeNavigationCallback</code> of the panel.
	 * @private
	 * @param {Object} oEvent Object of the event that gets fired by the <code>onPress</code> event of the link on the panel / selection dialog
	 * @returns {Promise} Returns a Boolean value determining whether navigation takes place , once resolved
	 */
	Link.prototype._beforeNavigationCallback = function(oEvent) {
		if (this.awaitControlDelegate()) {
			var oPayload = Object.assign({}, this.getPayload());
			return this.getControlDelegate().beforeNavigationCallback(oPayload, oEvent);
		}
		SapBaseLog.error("mdc.Link _beforeNavigationCallback: control delegate is not set - could not load beforeNavigationCallback from delegate.");
		return Promise.resolve();
	};

	// ------------------------------------- General internal methods ----------------------------------------------

	/**
	 * Returns the binding context of the source control or of the link itself.
	 * @private
	 * @returns {Object} The binding context of the SourceControl / link
	 */
	Link.prototype._getControlBindingContext = function() {
		var oControl = this._getSourceControl();
		return oControl && oControl.getBindingContext() || this.getBindingContext();
	};

	/**
	 * @private
	 * @returns {sap.ui.model.json.JSONModel} Internal model of the link
	 */
	Link.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdcLink");
	};

	/**
	 * Returns the object which is defined in the association "sourceControl"
	 * @private
	 * @returns {sap.ui.core.Control} Associated sourceControl
	 */
	Link.prototype._getSourceControl = function() {
		return typeof this.getSourceControl() === "string" ? sap.ui.getCore().byId(this.getSourceControl()) : this.getSourceControl();
	};

	return Link;
});

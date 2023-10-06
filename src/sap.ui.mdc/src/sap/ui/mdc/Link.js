/*!
 * ${copyright}
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
	"sap/ui/layout/library",
	"sap/ui/mdc/enums/LinkType"
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
	layoutLibrary,
	LinkType) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
	const ResponsiveGridLayout = layoutLibrary.form.SimpleFormLayout.ResponsiveGridLayout;

	/**
	 * Object holding the information regarding direct link navigation when there is no other link item.
	 * @typedef {object} sap.ui.mdc.link.DirectLinkObject
	 * @property {string} target The target of the retrieved direct link
	 * @property {string} href The href of the retrieved direct link
	 * @public
	 */

	/**
	 * Object holding the information on which link should be displayed as default on the popover.
	 * @typedef {object} sap.ui.mdc.link.BaseLineObject
	 * @property {string} id ID of a base line {@link sap.ui.mdc.link.LinkItem}
	 * @property {boolean} visible Visibility of a base line {@link sap.ui.mdc.link.LinkItem}
	 * @public
	 */

	/**
	 * Object holding information regarding the behavior of the {@link sap.ui.mdc.Link}.
	 * @typedef {object} sap.ui.mdc.link.LinkType
	 * @property {sap.ui.mdc.enums.LinkType} type Text | DirectLink | Popup (default)
	 * @property {sap.ui.mdc.link.LinkItem} directLink Instance of {@link sap.ui.mdc.link.LinkItem} that is used for direct navigation
	 * @public
	 */

	/**
	 * Object holding an initial {@link sap.ui.mdc.link.LinkType} and an optional <code>Promise</code> resolving into another {@link sap.ui.mdc.link.LinkType} that is used during runtime.
	 * @typedef {object} sap.ui.mdc.link.LinkTypeWrapper
	 * @property {sap.ui.mdc.link.LinkType} initialType Initial {@link sap.ui.mdc.link.LinkType}
	 * @property {Promise<sap.ui.mdc.link.LinkType>} runtimeType Optional <code>Promise</code> that resolves into the {@link sap.ui.mdc.link.LinkType} that overwrites the initial {@link sap.ui.mdc.link.LinkType}.
	 * @public
	 */

	/**
	 * Constructor for the new <code>Link</code>
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>Link</code> element can be used inside a <code>fieldInfo</code> aggregation of {@link sap.ui.mdc.Field} to enable
	 * navigation scenarios with one or more targets through direct navigation or by opening a <code>Panel</code>.<br>
	 * It can also be used to display additional content, such as <code>ContactDetails</code> on the <code>Panel</code>.<br>
	 * <b>Note:</b> The navigation targets and the behavior of the control are determined by the implementation of a {@link module:sap/ui/mdc/LinkDelegate LinkDelegate}.
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
	 * @public
   	 * @experimental As of version 1.74.0
	 */
	const Link = FieldInfoBase.extend("sap.ui.mdc.Link", /** @lends sap.ui.mdc.Link.prototype */ {
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
		const oModel = new JSONModel({
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
		this._bLinkItemsFetched = undefined;
		this._oLinkType = undefined;
		this._oUseDelegateItemsPromise = undefined;
		this._oUseDelegateAdditionalContentPromise = undefined;

		if (this._aLinkItems) {
			this._aLinkItems.forEach(function(oLinkItem) {
				oLinkItem.destroy();
			});
			this._aLinkItems = undefined;
		}

		if (this._aAdditionalContent) {
			this._aAdditionalContent.forEach(function(oLinkItem) {
				oLinkItem.destroy();
			});
			this._aAdditionalContent = undefined;
		}

		FieldInfoBase.prototype.exit.apply(this, arguments);
	};

	// ----------------------- Implementation of 'FieldInfoBase' interface --------------------------------------------

	Link.prototype.isTriggerable = function() {
		return this.retrieveLinkType().then(function(oLinkTypeObject) {
			if (!oLinkTypeObject) {
				return false;
			}
			const oRuntimeLinkTypePromise = oLinkTypeObject.runtimeType;
			const oInitialLinkType = oLinkTypeObject.initialType ? oLinkTypeObject.initialType : oLinkTypeObject;

			if (oRuntimeLinkTypePromise && oRuntimeLinkTypePromise instanceof Promise) {
				oRuntimeLinkTypePromise.then(function(oRuntimeLinkType) {
					if (!this._oLinkType || oRuntimeLinkType.linkType !== this._oLinkType.linkType) {
						this._oLinkType = oRuntimeLinkType;
						this.fireDataUpdate();
					}
				}.bind(this));
			}
			return this._oLinkType ?
					(this._oLinkType.type === LinkType.DirectLink || this._oLinkType.type === LinkType.Popover) :
					(oInitialLinkType.type === LinkType.DirectLink || oInitialLinkType.type === LinkType.Popover);
		}.bind(this));
	};

	Link.prototype.getTriggerHref = function() {
		return this.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
			return oLinkItem ? oLinkItem.href : null;
		});
	};

	Link.prototype.getDirectLinkHrefAndTarget = function() {
		return this._retrieveDirectLinkItem().then(function(oDirectLinkItem) {
			if (this.isDestroyed()) {
				return null;
			}

			this.addDependent(oDirectLinkItem);
			return oDirectLinkItem ? {
				target: oDirectLinkItem.getTarget(),
				href: oDirectLinkItem.getHref()
			} : null;
		}.bind(this));
	};

	/**
	 * @returns {Promise<sap.ui.mdc.link.LinkItem|null>} <code>Promise</code> resolving into <code>null</code> or a {@link sap.ui.mdc.link.LinkItem}
	 * @private
	 */
	Link.prototype._retrieveDirectLinkItem = function() {
		return this.retrieveLinkType().then(function(oLinkTypeObject) {
			if (!oLinkTypeObject) {
				return null;
			}

			if (this._linkTypeHasDirectLink(this._oLinkType)) {
				return this._oLinkType.directLink;
			}

			const oLinkType = oLinkTypeObject.initialType ? oLinkTypeObject.initialType : oLinkTypeObject;

			if (this._linkTypeHasDirectLink(oLinkType)) {
				return oLinkType.directLink;
			}
			return null;
		}.bind(this));
	};

	/**
	 * Checks if a given {@link sap.ui.mdc.link.LinkType} contains a directLink value.
	 * @param {sap.ui.mdc.link.LinkType} oLinkType the <code>LinkType</code> which should be checked
	 * @returns {boolean} bHasDirectLink
	 * @private
	 */
	Link.prototype._linkTypeHasDirectLink = function(oLinkType) {
		return oLinkType && oLinkType.type === LinkType.DirectLink && oLinkType.directLink;
	};

	Link.prototype.getContent = function(fnGetAutoClosedControl) {
		const oLinkItemsPromise = this.retrieveLinkItems();
		const oAdditionalContentPromise = this.retrieveAdditionalContent();
		return Promise.all([oLinkItemsPromise, oAdditionalContentPromise]).then(function(values) {
			const aLinkItems = values[0];
			const aAdditionalContent = values[1];
			return new Promise(function(resolve) {
				sap.ui.require([
					'sap/ui/fl/Utils',
					'sap/ui/fl/apply/api/FlexRuntimeInfoAPI'
				], function(Utils, FlexRuntimeInfoAPI) {
					this._setConvertedLinkItems(aLinkItems);
					const aMLinkItems = this._getInternalModel().getProperty("/linkItems");
					const aMBaselineLinkItems = this._getInternalModel().getProperty("/baselineLinkItems");

					const oPanelAdditionalContent = !aAdditionalContent.length && !aMLinkItems.length ? this._getNoContent() : aAdditionalContent;

					const sPanelId = this._createPanelId(Utils, FlexRuntimeInfoAPI);
					const oExistingPanel = sap.ui.getCore().byId(sPanelId);
					if (oExistingPanel) {
						// close Popover if existing
						if (oExistingPanel.getParent() && oExistingPanel.getParent().close) {
							oExistingPanel.getParent().close();
						}
						oExistingPanel.destroy();
					}

					const oPanel = new Panel(sPanelId, {
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
		const oLinkItemsPromise = this.retrieveLinkItems();
		const oAdditionalContentPromise = this.retrieveAdditionalContent();
		return Promise.all([oLinkItemsPromise, oAdditionalContentPromise]).then(function(values) {
			const aLinkItems = values[0];
			const aAdditionalContent = values[1];

			this._setConvertedLinkItems(aLinkItems);
			const aMLinkItems = this._getInternalModel().getProperty("/linkItems");

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
		const oModel = this._getInternalModel();
		const aMLinkItems = aLinkItems.map(function(oLinkItem) {
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

		const aMBaselineLinkItems = aMLinkItems.filter(function(oMLinkItem) {
			return oMLinkItem.initiallyVisible;
		});
		oModel.setProperty("/baselineLinkItems/", aMBaselineLinkItems);
	};

	/**
	 * @private
	 * @returns {sap.ui.layout.form.SimpleForm} Form containing a title which notices the user that there is no content for this link
	 */
	Link.prototype._getNoContent = function() {
		const oSimpleForm = new SimpleForm({
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
		let oField;
		if (this.getParent()) {
			oField = this.getParent();
		}
		let oControl = this._getSourceControl();
		if (!oControl) {
			//SapBaseLog.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
			this.setSourceControl(oField);
			oControl = oField;
		}
		if (!FlexRuntimeInfoAPI.isFlexSupported({ element: this }) || !FlexRuntimeInfoAPI.isFlexSupported({ element: oControl })) {
			SapBaseLog.error("Invalid component. The mandatory 'sourceControl' association should be assigned to the app component due to personalization reasons.");
			return this.getId() + "-idInfoPanel";
		}
		const oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
		return oAppComponent.createId("idInfoPanel");
	};

	// ------------------------------ sap/ui/mdc/link/Panel relevant methods ---------------------------------------

	/**
	 * Retrieves the relevant metadata for the panel and returns a property info array.
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of a <code>Panel</code> control
	 * @returns {object[]} Array of copied property info
	 * @protected
	 */
	Link.retrieveAllMetadata = function(oPanel) {
		if (!oPanel.getModel || !oPanel.getModel("$sapuimdcLink")) {
			return [];
		}
		const oModel = oPanel.getModel("$sapuimdcLink");
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
	 * @returns {sap.ui.mdc.link.BaseLineObject[]} Array containing the <code>ID</code> and <code>visible</code> property of every {@link sap.ui.mdc.link.LinkItem}
	 * @protected
	 */
	Link.retrieveBaseline = function(oPanel) {
		if (!oPanel.getModel || !oPanel.getModel("$sapuimdcLink")) {
			return [];
		}
		const oModel = oPanel.getModel("$sapuimdcLink");
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
	 * @param {sap.ui.model.Context|null|undefined} oBindingContext The given binding context
	 * @returns {Object | undefined} Object of the binding context
	 */
	Link.prototype._getContextObject = function(oBindingContext) {
		return oBindingContext ? oBindingContext.getObject(oBindingContext.getPath()) : undefined;
	};

	// ----------------------- sap/ui/mdc/LinkDelegate function calls ----------------------------------------------

	/**
	 * Retrieves the <code>AdditionalContent</code> objects depending on the given <code>LinkDelegate</code>.
	 * Caches the returned objects for further usage.
	 * @returns {Promise<sap.ui.core.Control[]>} Resolves an array of type {@link sap.ui.core.Control}
	 * @public
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
	 * @returns {Promise<void>} Resolves once the <code>AdditionalContent</code> objects have been retrieved by the delegate. This also sets this._aAdditionalContent.
	 */
	Link.prototype._useDelegateAdditionalContent = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				return new Promise(function(resolve) {
					this.getControlDelegate().fetchAdditionalContent(this, this).then(function(aAdditionalContent) {
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
	 * Determines the <code>LinkType</code> object depending on the given <code>LinkDelegate</code>.
	 * @returns {Promise<undefined|sap.ui.mdc.link.LinkType>} Returns <code>undefined</code> or a {@link sap.ui.mdc.link.LinkType}, once resolved
	 * @public
	 */
	Link.prototype.retrieveLinkType = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				return this._bIsBeingDestroyed ? Promise.resolve() : this.getControlDelegate().fetchLinkType(this);
			}.bind(this));
		}
		SapBaseLog.error("mdc.Link retrieveLinkType: control delegate is not set - could not load LinkType from delegate.");
		return Promise.resolve(null);
	};

	/**
	 * Calls the <code>modifyLinkItems</code> function of <code>Delegate</code> before returning the <code>LinkItem</code> objects.
	 * @returns {Promise<sap.ui.mdc.link.LinkItem[]>} Resolves an array of type {@link sap.ui.mdc.link.LinkItem}
	 * @public
	 */
	Link.prototype.retrieveLinkItems = function() {
		const oBindingContext = this._getControlBindingContext();
		return this._retrieveUnmodifiedLinkItems().then(function(aUnmodifiedLinkItems) {
			return this.getControlDelegate().modifyLinkItems(this, oBindingContext, aUnmodifiedLinkItems).then(function(aLinkItems) {
				return aLinkItems;
			});
		}.bind(this));
	};

	/**
	 * @private
	 * @returns {Promise<sap.ui.mdc.link.LinkItem[]>} Resolves an array of type {@link sap.ui.mdc.link.LinkItem}
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
	 * @returns {Promise<void>} Resolves once the <code>LinkItem</code> objects have been retrieved by the delegate. This also sets this._aLinkItems.
	 */
	Link.prototype._useDelegateItems = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(function() {
				// Assign new Object so payload.id won't get set for the whole Link class
				const oBindingContext = this._getControlBindingContext();
				const oInfoLog = this._getInfoLog();
				return new Promise(function(resolve) {
					this.getControlDelegate().fetchLinkItems(this, oBindingContext, oInfoLog).then(function(aLinkItems) {
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
		const aLinkItemsMissingParent = aLinkItems.filter(function(oLinkItem) {
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
	 * @param {sap.ui.base.Event} oEvent Object of the event that gets fired by the <code>onPress</code> event of the link on the panel / selection dialog
	 * @returns {Promise<undefined|boolean>} Returns a Boolean value determining whether navigation takes place , once resolved
	 */
	Link.prototype._beforeNavigationCallback = function(oEvent) {
		if (this.awaitControlDelegate()) {
			return this.getControlDelegate().beforeNavigationCallback(this, oEvent);
		}
		SapBaseLog.error("mdc.Link _beforeNavigationCallback: control delegate is not set - could not load beforeNavigationCallback from delegate.");
		return Promise.resolve();
	};

	// ------------------------------------- General internal methods ----------------------------------------------

	/**
	 * Returns the binding context of the source control or of the link itself.
	 * @private
	 * @returns {sap.ui.model.Context|null|undefined} The binding context of the SourceControl / link
	 */
	Link.prototype._getControlBindingContext = function() {
		const oControl = this._getSourceControl();
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
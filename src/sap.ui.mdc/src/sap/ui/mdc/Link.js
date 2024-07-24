/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/field/FieldInfoBase",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/link/Log",
	"sap/base/Log",
	"sap/ui/mdc/link/Panel",
	"sap/ui/mdc/link/PanelItem",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Title",
	"sap/ui/layout/library",
	"sap/ui/mdc/enums/LinkType"
], (Element, Library, FieldInfoBase, jQuery, BindingMode, JSONModel, Log, SapBaseLog, Panel, PanelItem, SimpleForm, Title, layoutLibrary, LinkType) => {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
	const { ResponsiveGridLayout } = layoutLibrary.form.SimpleFormLayout;

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
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * The object has the following properties:
				 * <ul>
				 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module</li>
				 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
				 * </ul>
				 * <i>Sample delegate object:</i>
				 * <pre><code>{
				 * 	name: "sap/ui/mdc/BaseDelegate",
				 * 	payload: {}
				 * }</code></pre>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/LinkDelegate",
						payload: {}
					}
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

		const fnDestroy = (vElement) => {
			if (Array.isArray(vElement)) {
				vElement.forEach(fnDestroy);
			} else {
				vElement.destroy();
			}
		};

		if (this._aLinkItems) {
			this._aLinkItems.forEach(fnDestroy);
			this._aLinkItems = undefined;
		}

		if (this._aAdditionalContent) {
			this._aAdditionalContent.forEach(fnDestroy);
			this._aAdditionalContent = undefined;
		}

		FieldInfoBase.prototype.exit.apply(this, arguments);
	};

	// ----------------------- Implementation of 'FieldInfoBase' interface --------------------------------------------

	Link.prototype.isTriggerable = function() {
		return this.retrieveLinkType().then((oLinkTypeObject) => {
			if (!oLinkTypeObject) {
				return false;
			}
			const oRuntimeLinkTypePromise = oLinkTypeObject.runtimeType;
			const oInitialLinkType = oLinkTypeObject.initialType ? oLinkTypeObject.initialType : oLinkTypeObject;

			if (oRuntimeLinkTypePromise && oRuntimeLinkTypePromise instanceof Promise) {
				oRuntimeLinkTypePromise.then((oRuntimeLinkType) => {
					if (!this._oLinkType || oRuntimeLinkType.type !== this._oLinkType.type) {
						this._oLinkType = oRuntimeLinkType;
						this.fireDataUpdate();
					}
				});
			}
			return this._oLinkType ?
				(this._oLinkType.type === LinkType.DirectLink || this._oLinkType.type === LinkType.Popover) :
				(oInitialLinkType.type === LinkType.DirectLink || oInitialLinkType.type === LinkType.Popover);
		});
	};

	Link.prototype.getTriggerHref = function() {
		return this.getDirectLinkHrefAndTarget().then((oLinkItem) => {
			return oLinkItem ? oLinkItem.href : null;
		});
	};

	Link.prototype.getDirectLinkHrefAndTarget = function() {
		return this._retrieveDirectLinkItem().then((oDirectLinkItem) => {
			if (this.isDestroyed()) {
				return null;
			}

			this.addDependent(oDirectLinkItem);
			return oDirectLinkItem ? {
				target: oDirectLinkItem.getTarget(),
				href: oDirectLinkItem.getHref()
			} : null;
		});
	};

	/**
	 * @returns {Promise<sap.ui.mdc.link.LinkItem|null>} <code>Promise</code> resolving into <code>null</code> or a {@link sap.ui.mdc.link.LinkItem}
	 * @private
	 */
	Link.prototype._retrieveDirectLinkItem = function() {
		return this.retrieveLinkType().then((oLinkTypeObject) => {
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
		});
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

	Link.prototype.getContent = async function(fnGetAutoClosedControl) {
		const oLinkItemsPromise = this.retrieveLinkItems();
		const oAdditionalContentPromise = this.retrieveAdditionalContent();
		const [aLinkItems, aAdditionalContent] = await Promise.all([oLinkItemsPromise, oAdditionalContentPromise]);

		this._setConvertedLinkItems(aLinkItems);
		const aMLinkItems = this._getInternalModel().getProperty("/linkItems");
		const oPanelAdditionalContent = !aAdditionalContent.length && !aMLinkItems.length ? this._getNoContent() : aAdditionalContent;

		return this._getContent(aLinkItems, oPanelAdditionalContent, fnGetAutoClosedControl, Panel);
	};

	/**
	 * Internal function to calculate the content of the <code>Popover</code>
	 * @param {sap.ui.mdc.link.LinkItem[]} aLinkItems The <code>LinkItem</code> instances that are displayed on the <code>Popover</code>.
	 * @param {sap.ui.core.Control[]} aAdditionalContent The <code>AdditionalContent</code> that is displayed on the <code>Popover</code>.
	 * @param {Function} fnGetAutoClosedControl Function returning the <code>Popover</code> instance
	 * @param {sap.ui.mdc.link.Panel | sap.ui.comp.navpopover.Panel} PanelClass Class of the <code>Panel</code> that is to be created
	 * @private
	 * @ui5-restricted sap.ui.comp
	 * @returns {Promise<sap.ui.mdc.link.Panel>} Content that is displayed on the <code>Popover</code>
	 */
	Link.prototype._getContent = async function(aLinkItems, aAdditionalContent, fnGetAutoClosedControl, PanelClass) {
		const sPanelId = await this.retrievePanelId();
		const aMBaselineLinkItems = this._getInternalModel().getProperty("/baselineLinkItems");

		const oExistingPanel = Element.getElementById(sPanelId);
		if (oExistingPanel) {
			// close Popover if existing
			if (oExistingPanel.getParent() && oExistingPanel.getParent().close) {
				oExistingPanel.getParent().close();
			}
			oExistingPanel.destroy();
		}

		const oPanel = new PanelClass(sPanelId, {
			enablePersonalization: this.getEnablePersonalization(), // brake the binding chain
			items: aMBaselineLinkItems.map((oMLinkItem) => {
				const oPanelItem = new PanelItem(oMLinkItem.key, {
					text: oMLinkItem.text,
					description: oMLinkItem.description,
					href: oMLinkItem.href,
					internalHref: oMLinkItem.internalHref,
					target: oMLinkItem.target,
					icon: oMLinkItem.icon,
					visible: true
				});

				oPanelItem.setText(oMLinkItem.text);
				return oPanelItem;
			}),
			additionalContent: aAdditionalContent,
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

		return oPanel;
	};


	Link.prototype.checkDirectNavigation = async function(oEvent) {
		const oLinkItemsPromise = this.retrieveLinkItems();
		const oAdditionalContentPromise = this.retrieveAdditionalContent();
		const [aLinkItems, aAdditionalContent] = await Promise.all([oLinkItemsPromise, oAdditionalContentPromise]);
		this._setConvertedLinkItems(aLinkItems);
		const aMLinkItems = this._getInternalModel().getProperty("/linkItems");

		const bDirectNavigation = (aMLinkItems.length === 1 && !aAdditionalContent.length);
		if (bDirectNavigation) {
			const bNavigate = await this._beforeNavigationCallback(oEvent);
			if (bNavigate) {
				Panel.navigate(aMLinkItems[0].href);
			}
		}

		return bDirectNavigation;
	};

	/**
	 * @private
	 * @param {sap.ui.mdc.link.LinkItem[]} aLinkItems The given <code>LinkItem</code> objects
	 */
	Link.prototype._setConvertedLinkItems = function(aLinkItems) {
		const oModel = this._getInternalModel();
		const aMLinkItems = aLinkItems.map((oLinkItem) => {
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

		const aMBaselineLinkItems = aMLinkItems.filter((oMLinkItem) => {
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
				new Title({
					text: Library.getResourceBundleFor("sap.ui.mdc").getText("info.POPOVER_MSG_NO_CONTENT")
				})
			]
		});
		oSimpleForm.addStyleClass("mdcbaseinfoPanelDefaultAdditionalContent");
		return oSimpleForm;
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
		return oModel.getProperty("/metadata").map((oMLinkItem) => {
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
		return oModel.getProperty("/baseline").map((oMLinkItem) => {
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
	 * @private
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of the <code>Panel</code>
	 * @returns {Promise<string>} Generated title for the popover
	 */
	Link.prototype.retrievePopoverTitle = async function(oPanel) {
		const oControlDelegate = await this.awaitControlDelegate();
		return oControlDelegate.fetchPopoverTitle(this, oPanel);
	};

	/**
	 * Generates an ID for the panel of the <code>Link</code> control. The result depends on whether the <code>Link</code> control supports flexibility.
	 * @private
	 * @returns {Promise<string>} Generated ID of the panel
	 */
	Link.prototype.retrievePanelId = async function() {
		if (this.awaitControlDelegate()) {
			await this.awaitControlDelegate();
			return this.getControlDelegate().getPanelId(this);
		}
		SapBaseLog.error("mdc.Link retrieveAdditionalContent: control delegate is not set - could not load AdditionalContent from delegate.");
		return Promise.resolve("idInfoPanel");
	};

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
			return this._oUseDelegateAdditionalContentPromise.then(() => {
				return Promise.resolve(this._aAdditionalContent);
			});
		}
	};

	/**
	 * Determines the <code>AdditionalContent</code> objects depending on the given <code>LinkDelegate</code>.
	 * @private
	 * @returns {Promise<void>} Resolves once the <code>AdditionalContent</code> objects have been retrieved by the delegate. This also sets this._aAdditionalContent.
	 */
	Link.prototype._useDelegateAdditionalContent = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(() => {
				return new Promise((resolve) => {
					this.getControlDelegate().fetchAdditionalContent(this, this).then((aAdditionalContent) => {
						this._setAdditionalContent(aAdditionalContent === null ? [] : aAdditionalContent);
						resolve();
					});
				});
			});
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
			return this.awaitControlDelegate().then(() => {
				return this._bIsBeingDestroyed ? Promise.resolve() : this.getControlDelegate().fetchLinkType(this);
			});
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
		return this._retrieveUnmodifiedLinkItems().then((aUnmodifiedLinkItems) => {
			return this.getControlDelegate().modifyLinkItems(this, oBindingContext, aUnmodifiedLinkItems).then((aLinkItems) => {
				return aLinkItems;
			});
		});
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
			return this._oUseDelegateItemsPromise.then(() => {
				return Promise.resolve(this._aLinkItems);
			});
		}
	};

	/**
	 * Determines the <code>LinkItem</code> objects depending on the given <code>LinkDelegate</code>.
	 * @private
	 * @returns {Promise<void>} Resolves once the <code>LinkItem</code> objects have been retrieved by the delegate. This also sets this._aLinkItems.
	 */
	Link.prototype._useDelegateItems = function() {
		if (this.awaitControlDelegate()) {
			return this.awaitControlDelegate().then(() => {
				// Assign new Object so payload.id won't get set for the whole Link class
				const oBindingContext = this._getControlBindingContext();
				const oInfoLog = this._getInfoLog();
				return new Promise((resolve) => {
					this.getControlDelegate().fetchLinkItems(this, oBindingContext, oInfoLog).then((aLinkItems) => {
						this._setLinkItems(aLinkItems === null ? [] : aLinkItems);
						this._bLinkItemsFetched = aLinkItems !== null;
						resolve();
					});
				});
			});
		}
		SapBaseLog.error("mdc.Link _useDelegateItems: control delegate is not set - could not load LinkItems from delegate.");
		return Promise.resolve();
	};

	/**
	 * @private
	 * @param {sap.ui.mdc.link.LinkItem[]} aLinkItems The given <code>LinkItem</code> objects
	 */
	Link.prototype._setLinkItems = function(aLinkItems) {
		const aLinkItemsMissingParent = aLinkItems.filter((oLinkItem) => {
			return oLinkItem.getParent() === null;
		});
		aLinkItemsMissingParent.forEach((oLinkItem) => {
			this.addDependent(oLinkItem);
		});

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
		const vSourceControlAssociation = this.getAssociation("sourceControl");
		const oSourceControl = vSourceControlAssociation && typeof vSourceControlAssociation === "string" ? Element.getElementById(vSourceControlAssociation) : vSourceControlAssociation;
		return oSourceControl ?? this.getSourceControl();
	};

	return Link;
});
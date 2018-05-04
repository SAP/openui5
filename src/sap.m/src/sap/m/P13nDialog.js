/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nDialog.
sap.ui.define([
    'jquery.sap.global', './Dialog', './library', 'sap/ui/core/EnabledPropagator', 'sap/m/DialogRenderer', 'sap/ui/core/library', 'sap/ui/Device'
], function(jQuery, Dialog, library, EnabledPropagator, DialogRenderer, coreLibrary, Device) {
    "use strict";

    // shortcut for sap.m.OverflowToolbarPriority
    var OverflowToolbarPriority = library.OverflowToolbarPriority;

    // shortcut for sap.m.ListType
    var ListType = library.ListType;

    // shortcut for sap.m.P13nPanelType
    var P13nPanelType = library.P13nPanelType;

    // shortcut for sap.m.ListMode
    var ListMode = library.ListMode;

    // shortcut for sap.ui.core.MessageType
    var MessageType = coreLibrary.MessageType;

    // shortcut for sap.m.ButtonType
    var ButtonType = library.ButtonType;

    /**
     * Constructor for a new P13nDialog.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] initial settings for the new control
     * @class The P13nDialog control provides a dialog that contains one or more panels. On each of the panels, one or more changes with regards to a
     *        table can be processed. For example, a panel to set a column to invisible, change the order of the columns or a panel to sort or filter
     *        tables.
     * @extends sap.m.Dialog
     * @author SAP SE
     * @version ${version}
     * @constructor
     * @public
     * @since 1.26.0
     * @alias sap.m.P13nDialog
     * @see {@link topic:a3c3c5eb54bc4cc38e6cfbd8e90c6a01 Personalization Dialog}
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var P13nDialog = Dialog.extend("sap.m.P13nDialog", /** @lends sap.m.P13nDialog.prototype */
        {
            metadata: {

                library: "sap.m",
                properties: {
                    /**
                     * This property determines which panel is initially shown when dialog is opened. If not defined then the first visible
                     * panel of <code>panels</code> aggregation is taken. Setting value after the dialog is opened has no effect anymore.
                     * Due to extensibility reason the type should be <code>string</code>. So it is feasible to add a custom panel without
                     * expanding the type.
                     */
                    initialVisiblePanelType: {
                        type: "string",
                        group: "Misc",
                        defaultValue: null
                    },

                    /**
                     * This property determines whether the 'Restore' button is shown inside the dialog. If this property is set to true, clicking the
                     * 'Reset' button will trigger the <code>reset</code> event sending a notification that model data must be reset.
                     */
                    showReset: {
                        type: "boolean",
                        group: "Appearance",
                        defaultValue: false
                    },

                    /**
                     * This property determines whether the 'Restore' button is enabled and is taken into account only if <code>showReset</code> is set
                     * to <code>true</code>.
                     *
                     * @since 1.36.0
                     */
                    showResetEnabled: {
                        type: "boolean",
                        group: "Appearance",
                        defaultValue: false
                    },

                    /**
                     * Calls the validation listener once all panel-relevant validation checks have been done. This callback function is called in order
                     * to perform cross-model validation checks.
                     */
                    validationExecutor: {
                        type: "object",
                        group: "Misc",
                        defaultValue: null
                    }
                },
                aggregations: {

                    /**
                     * The dialog panels displayed in the dialog.
                     */
                    panels: {
                        type: "sap.m.P13nPanel",
                        multiple: true,
                        singularName: "panel",
                        bindable: "bindable"
                    }
                },
                events: {

                    /**
                     * Event fired if the 'ok' button in <code>P13nDialog</code> is clicked.
                     */
                    ok: {},
                    /**
                     * Event fired if the 'cancel' button in <code>P13nDialog</code> is clicked.
                     */
                    cancel: {},
                    /**
                     * Event fired if the 'reset' button in <code>P13nDialog</code> is clicked.
                     */
                    reset: {}
                }
            },
            renderer: function(oRm, oControl) {
                DialogRenderer.render.apply(this, arguments);

                var sId = oControl._getVisiblePanelID();
                var oPanel = oControl.getVisiblePanel();
                if (sId && oPanel) {
                    oRm.write("<div");
                    oRm.writeAttribute("id", sId);
                    oRm.write(">");
                    oRm.renderControl(oPanel);
                    oRm.write("</div>");
                }
            }
        });

    EnabledPropagator.apply(P13nDialog.prototype, [
        true
    ]);

    P13nDialog.prototype.init = function(oEvent) {
        this.addStyleClass("sapMP13nDialog");
        Dialog.prototype.init.apply(this, arguments);
        this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
        this._mValidationListener = {};
        this._mVisibleNavigationItems = {};
        this._createDialog();
    };

    P13nDialog.prototype.setShowReset = function(bShow) {
        this.setProperty("showReset", bShow);
        if (this.getButtons() && this.getButtons()[2]) {
            this.getButtons()[2].setVisible(bShow);
        }
        return this;
    };

    P13nDialog.prototype.setShowResetEnabled = function(bEnabled) {
        this.setProperty("showResetEnabled", bEnabled, true);
        if (this.getButtons() && this.getButtons()[2]) {
            this.getButtons()[2].setEnabled(bEnabled);
        }
        return this;
    };

    P13nDialog.prototype.addPanel = function(oPanel) {
        this.addAggregation("panels", oPanel);

        this._mVisibleNavigationItems[oPanel.getType()] = oPanel.getVisible();

        // We have to ensure that the model of panel is loaded, also if the panel has not been rendered. This is due to the validation
        // reasons. For example, the last visible panel is 'filter'. When the dialog is opned again the filter panel is shown. But the
        // validation on columns and group panel should be executed independent.
        oPanel.beforeNavigationTo();

        oPanel.setValidationExecutor(jQuery.proxy(this._callValidationExecutor, this));
        oPanel.setValidationListener(jQuery.proxy(this._registerValidationListener, this));
        oPanel.setChangeNotifier(jQuery.proxy(this._callChangeNotifier, this));

        this._updateDialog();

        return this;
    };

    P13nDialog.prototype.insertPanel = function(oPanel, iIndex) {
        this.insertAggregation("panels", oPanel, iIndex);

        this._mVisibleNavigationItems[oPanel.getType()] = oPanel.getVisible();

        // We have to ensure that the model of panel is loaded, also if the panel has not been rendered. This is due to the validation
        // reasons. For example, the last visible panel is 'filter'. When the dialog is opned again the filter panel is shown. But the
        // validation on columns and group panel should be executed independent.
        oPanel.beforeNavigationTo();

        oPanel.setValidationExecutor(jQuery.proxy(this._callValidationExecutor, this));
        oPanel.setValidationListener(jQuery.proxy(this._registerValidationListener, this));
        oPanel.setChangeNotifier(jQuery.proxy(this._callChangeNotifier, this));

        this._updateDialog();

        return this;
    };

    P13nDialog.prototype.removePanel = function(oPanel) {
        oPanel = this.removeAggregation("panels", oPanel);

        delete this._mVisibleNavigationItems[oPanel.getType()];

        oPanel.setValidationExecutor();
        oPanel.setValidationListener();
        oPanel.setChangeNotifier();

        var oNavigationControl = this._getNavigationControl();
        if (oNavigationControl) {
            Device.system.phone ? oNavigationControl.removeItem(oPanel && this._getNavigationItemByPanel(oPanel)) : oNavigationControl.removeItem(oPanel && this._getNavigationItemByPanel(oPanel));
        }

        this._updateDialog();

        return oPanel;
    };

    P13nDialog.prototype.removeAllPanels = function() {
        var aPanels = this.removeAllAggregation("panels");

        this._mVisibleNavigationItems = {};

        var oNavigationControl = this._getNavigationControl();
        if (oNavigationControl) {
            Device.system.phone ? oNavigationControl.removeAllItems() : oNavigationControl.removeAllItems();
        }

        return aPanels;
    };

    P13nDialog.prototype.destroyPanels = function() {
        this.destroyAggregation("panels");

        this._mVisibleNavigationItems = {};

        var oNavigationControl = this._getNavigationControl();
        if (oNavigationControl) {
            Device.system.phone ? oNavigationControl.destroyItems() : oNavigationControl.destroyItems();
        }

        return this;
    };

    /**
     * Create dialog depending on the device.
     *
     * @private
     */
    P13nDialog.prototype._createDialog = function() {
        if (Device.system.phone) {
            var that = this;
            this.setStretch(true);
            this.setVerticalScrolling(false);
            this.setHorizontalScrolling(false);
            this.setCustomHeader(new sap.m.Bar({
                contentLeft: new sap.m.Button({
                    visible: false,
                    type: ButtonType.Back,
                    press: function(oEvent) {
                        that._backToList();
                    }
                }),
                contentMiddle: new sap.m.Title({
                    text: this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS"),
                    level: "H1"
                })
            }));
            this.addButton(this._createOKButton());
            this.addButton(this._createCancelButton());
            this.addButton(this._createResetButton());
        } else {
            this.setHorizontalScrolling(false);
            // according to consistency we adjust the content width of P13nDialog to the content width of value help dialog
            this.setContentWidth("65rem");
            this.setContentHeight("40rem");
            this.setDraggable(true);
            this.setResizable(true);
            this.setTitle(this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS"));
            this.addButton(this._createOKButton());
            this.addButton(this._createCancelButton());
            this.addButton(this._createResetButton());
        }
    };

    // /**
    //  * Creates and returns navigation control depending on device.
    //  *
    //  * @returns {sap.m.List | sap.m.SegmentedButton | null}
    //  * @private
    //  */
    // P13nDialog.prototype._getNavigationControl = function() {
    // 	if (this.getPanels().length < 2) {
    // 		return null;
    // 	}
    //
    // 	var that = this;
    // 	if (Device.system.phone) {
    // 		if (!this.getContent().length) {
    // 			this.addContent(new sap.m.List({
    // 				mode: ListMode.None,
    // 				itemPress: function(oEvent) {
    // 					if (oEvent) {
    // 						that._switchPanel(oEvent.getParameter("listItem"));
    // 					}
    // 				}
    // 			}));
    // 			// Add ListItem of first panel first
    // 			this.getContent()[0].addItem(this._getNavigationItemByPanel(this.getPanels()[0]));
    // 		}
    // 		return this.getContent()[0];
    // 	} else {
    // 		if (!this.getSubHeader() || !this.getSubHeader().getContentLeft().length) {
    // 			this.setSubHeader(new sap.m.Bar({
    // 				contentLeft: [
    // 					new sap.m.SegmentedButton({
    // 						select: function(oEvent) {
    // 							that._switchPanel(oEvent.getParameter("button"));
    // 						},
    // 						width: '100%'
    // 					})
    // 				]
    // 			}));
    // 			// Add button of first panel first
    // 			this.getSubHeader().getContentLeft()[0].addButton(this._getNavigationItemByPanel(this.getPanels()[0]));
    // 		}
    // 		return this.getSubHeader().getContentLeft()[0];
    // 	}
    // };

    /**
     * Show validation dialog
     *
     * @private
     */
    P13nDialog.prototype._showValidationDialog = function(fCallbackIgnore, aFailedPanelTypes, aValidationResult) {
        var aWarningMessages = [];
        var aErrorMessages = [];
        this._prepareMessages(aFailedPanelTypes, aValidationResult, aWarningMessages, aErrorMessages);

        jQuery.sap.require("sap.m.MessageBox");
        var sMessageText = "";
        if (aErrorMessages.length) {
            aErrorMessages.forEach(function(oMessage, iIndex, aMessages) {
                sMessageText = (aMessages.length > 1 ? "• " : "") + oMessage.messageText + "\n" + sMessageText;
            });
            sap.m.MessageBox.show(sMessageText, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_TITLE_ERROR"),
                actions: [
                    sap.m.MessageBox.Action.CLOSE
                ],
                styleClass: !!this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : ""
            });
        } else if (aWarningMessages.length) {
            aWarningMessages.forEach(function(oMessage, iIndex, aMessages) {
                sMessageText = (aMessages.length > 1 ? "• " : "") + oMessage.messageText + "\n" + sMessageText;
            });
            sMessageText = sMessageText + sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_MESSAGE_QUESTION");

            sap.m.MessageBox.show(sMessageText, {
                icon: sap.m.MessageBox.Icon.WARNING,
                title: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_TITLE"),
                actions: [
                    sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_FIX"), sap.m.MessageBox.Action.IGNORE
                ],
                onClose: function(oAction) {
                    // Fix: Stay on the current panel. There is incorrect entry and user decided to correct this.
                    // Ignore: Go to the chosen panel. Though the current panel has incorrect entry the user decided to
                    // leave the current panel. Delete incorrect condition set.
                    if (oAction === sap.m.MessageBox.Action.IGNORE) {
                        fCallbackIgnore();
                    }
                },
                styleClass: !!this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : ""
            });
        }
    };

    /**
     * When more messages have the same 'messageText', the last one will be take over.
     *
     * @private
     */
    P13nDialog.prototype._prepareMessages = function(aFailedPanelTypes, aValidationResult, aWarningMessages, aErrorMessages) {
        if (!aFailedPanelTypes.length && !aValidationResult.length) {
            return;
        }

        // Transfer messages coming from panels into messages coming from controller
        aFailedPanelTypes.forEach(function(sPanelType) {
            switch (sPanelType) {
                case P13nPanelType.filter:
                    aValidationResult.push({
                        messageType: MessageType.Warning,
                        messageText: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_MESSAGE")
                    });
                    break;
                case P13nPanelType.columns:
                    aValidationResult.push({
                        messageType: MessageType.Warning,
                        messageText: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VISIBLE_ITEMS_THRESHOLD_MESSAGE")
                    });
                    break;
                case P13nPanelType.dimeasure:
                    aValidationResult.push({
                        messageType: MessageType.Error,
                        messageText: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_CHARTTYPE")
                    });
                    break;
                default:
                    jQuery.sap.log.error("Panel type '" + sPanelType + "' is not supported jet.");
            }
        });

        // Reduce messages removing duplicated
        var aUniqueMessages = aValidationResult.filter(function(oMessage, iIndex, aMessages) {
            for (var i = ++iIndex; i < aMessages.length; i++) {
                if (oMessage.messageText === aMessages[i].messageText) {
                    return false;
                }
            }
            return true;
        });

        // Divide messages into warning and error messages
        aUniqueMessages.forEach(function(oMessage) {
            if (oMessage.messageType === MessageType.Warning) {
                aWarningMessages.push(oMessage);
            } else if (oMessage.messageType === MessageType.Error) {
                aErrorMessages.push(oMessage);
            }
        });
    };

    /**
     * Map an item of type <code>sap.m.P13nPanel</code> to an item of type <code>sap.m.IconTabBarFilter</code>
     *
     * @param {sap.m.P13nPanel} oPanel
     * @returns {sap.m.Button | sap.m.StandardListItem | null}
     * @private
     * @name P13nDialog#_mapPanelToNavigationItem
     * @function
     */
    P13nDialog.prototype._mapPanelToNavigationItem = function(oPanel) {
        if (!oPanel) {
            return null;
        }
        return Device.system.phone ? new sap.m.StandardListItem({
            type: ListType.Navigation,
            title: oPanel.getBindingPath("title") ? jQuery.extend(true, {}, oPanel.getBindingInfo("title")) : oPanel.getTitle()
        }) : new sap.m.SegmentedButtonItem({
            text: oPanel.getBindingPath("title") ? jQuery.extend(true, {}, oPanel.getBindingInfo("title")) : oPanel.getTitle()
        });
    };

    /**
     * Switch panel.
     *
     * @private
     */
    P13nDialog.prototype._switchPanel = function(oNavigationItem) {
        var oPanel = this._getPanelByNavigationItem(oNavigationItem);
        this.setVerticalScrolling(oPanel.getVerticalScrolling());
        if (Device.system.phone) {
            var oNavigationControl = this._getNavigationControl();
            if (oNavigationControl) {
                oNavigationControl.setVisible(false);
                oPanel.beforeNavigationTo();
                oPanel.setVisible(true);
                this.getCustomHeader().getContentMiddle()[0].setText(oPanel.getTitle());
                this.getCustomHeader().getContentLeft()[0].setVisible(true);
            }
        } else {
            this.getPanels().forEach(function(oPanel_) {
                if (oPanel_ === oPanel) {
                    oPanel_.beforeNavigationTo();
                    oPanel_.setVisible(true);
                } else {
                    oPanel_.setVisible(false);
                }
            }, this);
        }
        this.invalidate();
        this.rerender();
    };

    /**
     * Switch back to the list.
     *
     * @private
     */
    P13nDialog.prototype._backToList = function() {
        var oNavigationControl = this._getNavigationControl();
        if (oNavigationControl) {
            oNavigationControl.setVisible(true);
            var oPanel = this.getVisiblePanel();
            oPanel.setVisible(false);
            this._updateDialogTitle();
            this.getCustomHeader().getContentLeft()[0].setVisible(false);
        }
    };

    /**
     * Returns visible panel.
     *
     * @returns {sap.m.P13nPanel | null} panel
     * @public
     */
    P13nDialog.prototype.getVisiblePanel = function() {
        var oPanel = null;
        this.getPanels().some(function(oPanel_) {
            if (oPanel_.getVisible()) {
                oPanel = oPanel_;
                return true;
            }
        });
        return oPanel;
    };

    /**
     * Returns panel.
     *
     * @private
     */
    P13nDialog.prototype._getPanelByNavigationItem = function(oNavigationItem) {
        for (var i = 0, aPanels = this.getPanels(), iPanelsLength = aPanels.length; i < iPanelsLength; i++) {
            if (aPanels[i].data("sapMP13nDialogNavigationItem") === oNavigationItem) {
                return aPanels[i];
            }
        }
        return null;
    };

    /**
     * Returns NavigationItem.
     *
     * @private
     */
    P13nDialog.prototype._getNavigationItemByPanel = function(oPanel) {
        if (!oPanel) {
            return null;
        }
        return oPanel.data("sapMP13nDialogNavigationItem");
    };

    P13nDialog.prototype.onAfterRendering = function() {
        Dialog.prototype.onAfterRendering.apply(this, arguments);
        var oContent = jQuery(this.getFocusDomRef()).find(".sapMDialogScrollCont");
        var sId = this._getVisiblePanelID();
        if (sId && oContent) {
            // move panel div into dialog content div.
            var oPanel = jQuery.find("#" + sId);
            jQuery(oPanel).appendTo(jQuery(oContent));
        }
    };

    /**
     * Determine panel id.
     *
     * @private
     */
    P13nDialog.prototype._getVisiblePanelID = function() {
        var oPanel = this.getVisiblePanel();
        if (oPanel) {
            return this.getId() + "-panel_" + oPanel.getId();
        }
        return null;
    };

    /**
     * Sets title of dialog in regard to oPanel.
     *
     * @private
     */
    P13nDialog.prototype._updateDialogTitle = function() {
        var oPanelVisible = this.getVisiblePanel();
        var sTitle = this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS");

        // Only if one visible panel (i.e. NavigationControl) exists we set specific title
        if (!this._isNavigationControlExpected() && oPanelVisible) {
            switch (oPanelVisible.getType()) {
                case P13nPanelType.filter:
                    sTitle = this._oResourceBundle.getText("P13NDIALOG_TITLE_FILTER");
                    break;
                case P13nPanelType.sort:
                    sTitle = this._oResourceBundle.getText("P13NDIALOG_TITLE_SORT");
                    break;
                case P13nPanelType.group:
                    sTitle = this._oResourceBundle.getText("P13NDIALOG_TITLE_GROUP");
                    break;
                case P13nPanelType.columns:
                    sTitle = this._oResourceBundle.getText("P13NDIALOG_TITLE_COLUMNS");
                    break;
                case P13nPanelType.dimeasure:
                    sTitle = this._oResourceBundle.getText("P13NDIALOG_TITLE_DIMEASURE");
                    break;
                default:
                    sTitle = oPanelVisible.getTitleLarge() || this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS");
            }
        }

        if (Device.system.phone) {
            this.getCustomHeader().getContentMiddle()[0].setText(sTitle);
        } else {
            this.setTitle(sTitle);
        }
    };

    /**
     * Registers a listener in order to be notified about the validation result.
     *
     * @param {sap.m.P13nPanel} oPanel - listener panel
     * @param {object} fCallback - callback method
     * @private
     */
    P13nDialog.prototype._registerValidationListener = function(oPanel, fCallback) {
        if (this.getPanels().indexOf(oPanel) && fCallback && this._mValidationListener[oPanel.getType()] === undefined) {
            this._mValidationListener[oPanel.getType()] = fCallback;
        }
    };

    /**
     * Calls the controller validation. Notifies the validation result to all registered panel listeners.
     *
     * @private
     */
    P13nDialog.prototype._callValidationExecutor = function() {
        var fValidate = this.getValidationExecutor();
        if (fValidate && !jQuery.isEmptyObject(this._mValidationListener)) {
            var that = this;
            fValidate(this._getPayloadOfPanels()).then(function(aValidationResult) {
                var oResult = that._distributeValidationResult(aValidationResult);
                // Publish the result to registered listeners
                for ( var sType in that._mValidationListener) {
                    var fCallback = that._mValidationListener[sType];
                    fCallback(oResult[sType] || []);
                }
            });
        }
    };

    /**
     * @private
     */
    P13nDialog.prototype._callChangeNotifier = function(oPanel) {
        if (this.getShowReset()) {
            this.setShowResetEnabled(true);
        }
    };

    /**
     * In case that validation has detected an issue belonging to some panels this issue is duplicated for them.
     *
     * @param {object} aResult
     */
    P13nDialog.prototype._distributeValidationResult = function(aResult) {
        var oDuplicateResult = {};
        aResult.forEach(function(oResult) {
            oResult.panelTypes.forEach(function(sType) {
                if (oDuplicateResult[sType] === undefined) {
                    oDuplicateResult[sType] = [];
                }
                oDuplicateResult[sType].push({
                    columnKey: oResult.columnKey,
                    messageType: oResult.messageType,
                    messageText: oResult.messageText
                });
            });
        });
        return oDuplicateResult;
    };

    /**
     * Creates and returns OK Button
     *
     * @returns {sap.m.Button}
     * @private
     */
    P13nDialog.prototype._createOKButton = function() {
        var that = this;
        return new sap.m.Button({
            text: this._oResourceBundle.getText("P13NDIALOG_OK"),
            layoutData: new sap.m.OverflowToolbarLayoutData({
                priority: OverflowToolbarPriority.NeverOverflow
            }),
            press: function() {
                that.setBusy(true);
                var oPayload = that._getPayloadOfPanels();
                var fFireOK = function() {
                    that.setBusy(false);
                    that.fireOk({
                        payload: oPayload
                    });
                };
                var aFailedPanelTypes = [];
                var fCallbackIgnore = function() {
                    that.getPanels().forEach(function(oPanel) {
                        if (aFailedPanelTypes.indexOf(oPanel.getType()) > -1) {
                            oPanel.onAfterNavigationFrom();
                        }
                    });
                    fFireOK();
                };
                // Execute validation of panels
                that.getPanels().forEach(function(oPanel) {
                    if (!oPanel.onBeforeNavigationFrom()) {
                        aFailedPanelTypes.push(oPanel.getType());
                    }
                });
                var aValidationResult = [];
                // Execute validation of controller
                var fValidate = that.getValidationExecutor();
                if (fValidate) {
                    fValidate(oPayload).then(function(aValidationResult) {
                        // In case of invalid panels show the dialog
                        if (aFailedPanelTypes.length || aValidationResult.length) {
                            that.setBusy(false);
                            that._showValidationDialog(fCallbackIgnore, aFailedPanelTypes, aValidationResult);
                        } else {
                            fFireOK();
                        }
                    });
                } else {
                    // In case of invalid panels show the dialog
                    if (aFailedPanelTypes.length || aValidationResult.length) {
                        that.setBusy(false);
                        that._showValidationDialog(fCallbackIgnore, aFailedPanelTypes, aValidationResult);
                    } else {
                        fFireOK();
                    }
                }
            }
        });
    };

    /**
     * Creates and returns CANCEL Button
     *
     * @returns {sap.m.Button}
     * @private
     */
    P13nDialog.prototype._createCancelButton = function() {
        var that = this;
        return new sap.m.Button({
            text: this._oResourceBundle.getText("P13NDIALOG_CANCEL"),
            layoutData: new sap.m.OverflowToolbarLayoutData({
                priority: OverflowToolbarPriority.NeverOverflow
            }),
            press: function() {
                that.fireCancel();
            }
        });
    };

    /**
     * Creates and returns RESET Button
     *
     * @returns {sap.m.Button}
     * @private
     */
    P13nDialog.prototype._createResetButton = function() {
        var that = this;
        return new sap.m.Button({
            text: this._oResourceBundle.getText("P13NDIALOG_RESET"),
            layoutData: new sap.m.OverflowToolbarLayoutData({
                priority: OverflowToolbarPriority.NeverOverflow
            }),
            visible: this.getShowReset(),
            enabled: this.getShowResetEnabled(),
            press: function() {
                that.setShowResetEnabled(false);
                var oPayload = {};
                that.getPanels().forEach(function(oPanel) {
                    oPayload[oPanel.getType()] = oPanel.getResetPayload();
                });
                that.fireReset({
                    payload: oPayload
                });
            }
        });
    };

    P13nDialog.prototype._getPayloadOfPanels = function() {
        var oPayload = {};
        this.getPanels().forEach(function(oPanel) {
            oPayload[oPanel.getType()] = oPanel.getOkPayload();
        });
        return oPayload;
    };

    P13nDialog.prototype._updateDialog = function() {
        var oNavigationControl = this._getNavigationControl();
        oNavigationControl.destroyItems();

        var sInitialVisiblePanelType = this._determineInitialVisiblePanelType();

        this.getPanels().forEach(function(oPanel) {
            // Create navigation item based on panel
            var oNavigationItem = this._mapPanelToNavigationItem(oPanel);
            oPanel.data("sapMP13nDialogNavigationItem", oNavigationItem);
            oNavigationControl.addItem(oNavigationItem);

            // Update 'visible' property for current panel regarding the 'initialVisiblePanelType' property and number of content objects.
            // Note: if panel with 'visible=false' is passed via API then it has higher priority then 'initialVisiblePanelType' property or number of content objects
            var bVisible = Device.system.phone ? this._mVisibleNavigationItems[oPanel.getType()] && this._getCountOfVisibleNavigationItems() === 1 : this._mVisibleNavigationItems[oPanel.getType()] && sInitialVisiblePanelType === oPanel.getType();
            oPanel.setVisible(bVisible);

            if (bVisible) {
                if (!Device.system.phone) {
                    this.setVerticalScrolling(oPanel.getVerticalScrolling());
                }
            }

            // Update NavigationControl
            oNavigationItem.setVisible(this._mVisibleNavigationItems[oPanel.getType()]);
            if (bVisible && oNavigationControl.setSelectedItem) {
                oNavigationControl.setSelectedItem(oNavigationItem);
            }
        }.bind(this));

        // Update dialog's title
        this._updateDialogTitle();

        this._setVisibleOfNavigationControl(this._isNavigationControlExpected());
    };
    P13nDialog.prototype._determineInitialVisiblePanelType = function() {
        // If provided 'initialVisiblePanelType' is not contained in 'panels' aggregation then ignore 'initialVisiblePanelType'
        if (this.getInitialVisiblePanelType() && this._mVisibleNavigationItems[this.getInitialVisiblePanelType()]) {
            return this.getInitialVisiblePanelType();
        }
        // Set 'initialVisiblePanelType' to the first visible navigation item if not defined
        var sType;
        this.getPanels().some(function(oPanel) {
            if (this._mVisibleNavigationItems[oPanel.getType()]) {
                sType = oPanel.getType();
                return true;
            }
        }.bind(this));
        return sType;
    };
    P13nDialog.prototype._isNavigationControlExpected = function() {
        return this._getCountOfVisibleNavigationItems() > 1;
    };
    P13nDialog.prototype._getCountOfVisibleNavigationItems = function() {
        var iCountVisibleNavigationItems = 0;
        for ( var sType in this._mVisibleNavigationItems) {
            iCountVisibleNavigationItems = this._mVisibleNavigationItems[sType] ? iCountVisibleNavigationItems + 1 : iCountVisibleNavigationItems;
        }
        return iCountVisibleNavigationItems;
    };
    P13nDialog.prototype._isNavigationControlExists = function() {
        return Device.system.phone ? this.getContent().length > 0 : (!!this.getSubHeader() && this.getSubHeader().getContentLeft().length > 0);
    };
    P13nDialog.prototype._getNavigationControl = function() {
        if (!this._isNavigationControlExists()) {
            this._createNavigationControl();
        }
        return Device.system.phone ? this.getContent()[0] : this.getSubHeader().getContentLeft()[0];
    };
    P13nDialog.prototype._setVisibleOfNavigationControl = function(bVisible) {
        if (!this._isNavigationControlExists()) {
            return;
        }
        return Device.system.phone ? this.getContent()[0].setVisible(bVisible) : this.getSubHeader().setVisible(bVisible);
    };
    /**
     * Creates and returns navigation control depending on device.
     *
     * @returns {sap.m.List | sap.m.SegmentedButton} navigation control
     * @private
     */
    P13nDialog.prototype._createNavigationControl = function() {
        if (Device.system.phone) {
            this.addContent(new sap.m.List({
                mode: ListMode.None,
                itemPress: function(oEvent) {
                    this._switchPanel(oEvent.getParameter("listItem"));
                }.bind(this)
            }));
        } else {
            this.setSubHeader(new sap.m.Bar({
                contentLeft: new sap.m.SegmentedButton({
                    width: '100%',
                    selectionChange: function(oEvent) {
                        this._switchPanel(oEvent.getParameter("item"));
                    }.bind(this)
                })
            }));
        }
        return this._getNavigationControl();
    };

    P13nDialog.prototype.exit = function() {
        Dialog.prototype.exit.apply(this, arguments);

        this._mValidationListener = {};
        this._mVisibleNavigationItems = {};
    };

    return P13nDialog;
});

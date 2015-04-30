/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewCard
sap.ui.define([
			'jquery.sap.global', 'sap/m/library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
		function(jQuery, library, Control, IconPool) {
			"use strict";

			/**
			 * Constructor for a new QuickViewCard.
			 *
			 * @param {string} [sId] id for the new control, generated automatically if no id is given
			 * @param {object} [mSettings] initial settings for the new control
			 * @class QuickViewCard consists of  a page header, an object icon or image,
			 * an object name with short description, and an object information divided in groups.
			 * The control uses the sap.m.SimpleForm control to display information.
			 * @extends sap.ui.core.Control
			 * @author SAP SE
			 * @constructor
			 * @public
			 * @alias sap.m.QuickViewCard
			 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
			 */
			var QuickViewCard = Control.extend("sap.m.QuickViewCard",
					{
						metadata: {

							library: "sap.m",
							properties: {

								/**
								 * Card id
								 */
								cardId: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * The text displayed in the header of the control
								 */
								header: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * The text displayed in the header of the content section of the control
								 */
								title: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * The URL which opens when the title or the thumbnail is clicked
								 */
								titleUrl: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * The application provides target and param configuration  for cross-application navigation from the 'card header'.
								 */
								crossAppNavCallback : {
									type: "object",
									group: "Misc"
								},

								/**
								 * The text displayed under the header of the content section
								 */
								description: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * The URL of the icon displayed under the header of the page
								 */
								icon: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								}
							},
							defaultAggregation: "groups",
							aggregations: {

								/**
								 * QuickViewGroup consists of a title (optional) and an entity of group elements.
								 */
								groups: {
									type: "sap.m.QuickViewGroup",
									multiple: true,
									singularName: "group",
									bindable: "bindable"
								}
							}
						}
					});


			QuickViewCard.prototype.init =  function() {
				this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

				try {
					jQuery.sap.require("sap.ushell.services.CrossApplicationNavigation");
				} catch(e) {
					//move the require in onInit method to avoid the OpenAJAX check error
				}

				//see API docu for sap.ushell.services.CrossApplicationNavigation
				var fGetService =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
				if (fGetService) {
					this.oCrossAppNavigator = fGetService("CrossApplicationNavigation");
				}

			};

			QuickViewCard.prototype._createCard = function () {
				var oForm = this._createForm(),
					that = this,
					oHeaderContent = this._getCardHeaderContent(),
					aContent = [];

				aContent.push(oHeaderContent, oForm);

				var oCard = new sap.m.Page(this.getCardId(), {
					content : aContent,
					customHeader : new sap.m.Bar()
				});

				var oCustomHeader = oCard.getCustomHeader();

				oCustomHeader.addContentMiddle(
					new sap.m.Title({
						text : this.getHeader()
					})
				);

				if (this._hasBackButton) {
					oCustomHeader.addContentLeft(
						new sap.m.Button({
							type : sap.m.ButtonType.Back,
							tooltip : this._oResourceBundle.getText("PAGE_NAVBUTTON_TEXT"),
							press : function() {
								if (that._oNavContainer) {
									that._oNavContainer.back();
								}
							}
						})
					);
				}

				if (sap.ui.Device.system.phone) {
					oCustomHeader.addContentRight(
						new sap.m.Button({
							icon : "sap-icon://decline",
							press : function() {
								if (that._oPopover) {
									that._oPopover.close();
								}
							}
						})
					);
				}

				return oCard;
			};

			QuickViewCard.prototype._createCardContent = function () {

				var mCardContent = {};

				mCardContent.form = this._createForm();
				mCardContent.header = this._getCardHeaderContent();

				return mCardContent;
			};

			QuickViewCard.prototype._createForm = function () {
				var aGroups = this.getAggregation("groups"),
				    oForm = new sap.ui.layout.form.SimpleForm({
						maxContainerCols: 1,
						editable: false,
						layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
					});

				if (aGroups) {
					for (var j = 0; j < aGroups.length; j++) {
						this._renderGroup(aGroups[j], oForm);
					}
				}

				return oForm;
			};

			QuickViewCard.prototype._getCardHeaderContent = function() {
				var oIcon,
					oVLayout = new sap.ui.layout.VerticalLayout(),
					oHLayout = new sap.ui.layout.HorizontalLayout();

				if (this.getIcon()) {
					if (this.getIcon().indexOf("sap-icon") == 0) {
						oIcon = new sap.ui.core.Icon({
							src: this.getIcon()
						});
					} else {
						oIcon = new sap.m.Image({
							src: this.getIcon()
						}).addStyleClass("sapUiIcon");
					}

					oIcon.addStyleClass("sapMQuickViewThumbnail");

					if (this.getTitleUrl()) {
						oIcon.attachPress(this._crossApplicationNavigation(this));
					}

					oHLayout.addContent(oIcon);
				}

				var oTitle;

				if (this.getTitleUrl()) {
					oTitle = new sap.m.Link({
						text	: this.getTitle(),
						href	: this.getTitleUrl(),
						target	: "_blank"
					});
				} else if (this.getCrossAppNavCallback()) {
					oTitle = new sap.m.Link({
						text	: this.getTitle()
					});
					oTitle.attachPress(this._crossApplicationNavigation(this));
				} else {
					oTitle = new sap.m.Title({
						text	: this.getTitle(),
						level	: sap.ui.core.TitleLevel.H1
					});
				}

				var oDescription = new sap.m.Text({
					text	: this.getDescription()
				});

				oVLayout.addContent(oTitle);
				oVLayout.addContent(oDescription);
				oHLayout.addContent(oVLayout);

				return oHLayout;
			};

			QuickViewCard.prototype._renderGroup = function(oGroup, oForm) {
				var aElements = oGroup.getAggregation("elements");

				var oCurrentGroupElement,
					oCurrentGroupElementValue,
					oLabel;

				if (oGroup.getHeading()) {
					oForm.addContent( new sap.ui.core.Title({
						text : oGroup.getHeading(),
						level : sap.ui.core.TitleLevel.H2
					}));
				}

				if (!aElements) {
					return;
				}

				for (var k = 0; k < aElements.length; k++) {
					oCurrentGroupElement = aElements[k];

					oLabel = new sap.m.Label({
						text: oCurrentGroupElement.getLabel()
					});

					oCurrentGroupElementValue = oCurrentGroupElement._getGroupElementValue();

					if (oCurrentGroupElementValue instanceof sap.m.Link) {
						oCurrentGroupElementValue.addAriaLabelledBy(oCurrentGroupElementValue);
					}

					oForm.addContent(oLabel);

					if (oCurrentGroupElement.getType() == sap.m.QuickViewGroupElementType.cardLink) {
						oCurrentGroupElementValue.attachPress(this._attachPressLink(this));
					}

					if (oCurrentGroupElement.getType() == sap.m.QuickViewGroupElementType.mobile) {
						var oSmsLink = new sap.ui.core.Icon({
							src: IconPool.getIconURI("post"),
							decorative : false,
							customData: [new sap.ui.core.CustomData({
								key: "phoneNumber",
								value: oCurrentGroupElement.getValue()
							})],
							press: this._mobilePress
						});
						var oBox = new sap.m.HBox({
							items: [oCurrentGroupElementValue, oSmsLink]
						});
						oForm.addContent(oBox);
					} else {
						oForm.addContent(oCurrentGroupElementValue);
					}
				}
			};

			QuickViewCard.prototype._crossApplicationNavigation = function (that) {
				return function () {
					if (that.getCrossAppNavCallback() && that.oCrossAppNavigator) {
						var href = this.oCrossAppNavigator.hrefForExternal(
							{   target : { semanticObject : that.getCrossAppNavCallback().target.semanticObject,
								action : that.getCrossAppNavCallback().target.action },
								params : that.getCrossAppNavCallback().params
							}
						);

						sap.m.URLHelper.redirect(href);
					} else if (that.getTitleUrl()) {
						var oWindow = window.open(that.getTitleUrl(), "_blank");
						oWindow.focus();
					}
				};
			};

			QuickViewCard.prototype.exit = function() {
				this._oResourceBundle = null;
			};

			QuickViewCard.prototype._attachPressLink = function (that) {
				return function (e) {
					e.preventDefault();
					var sCardId = this.getCustomData()[0].getValue();
					if (that._oNavContainer && sCardId) {
						that._oNavContainer.to(sCardId);
					}
				};
			};

			QuickViewCard.prototype._mobilePress = function () {
				var sms = "sms://" + jQuery.sap.encodeURL(this.getCustomData()[0].getValue());
				window.location.replace(sms);
			};

			return QuickViewCard;

		}, /* bExport= */true);

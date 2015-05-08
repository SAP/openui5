/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewCard
sap.ui.define([
			'jquery.sap.global', './library', 'sap/ui/core/Control',
				'sap/ui/core/IconPool', 'sap/ui/layout/form/SimpleForm',
				'sap/ui/layout/VerticalLayout', 'sap/ui/layout/HorizontalLayout',
				'./Page', './Button', './ButtonType', './Bar',
				'./Title', './Image', './Link', './Text',
				'./QuickViewGroupElementType',
				'./Label', './HBox', 'sap/ui/core/Icon', 'sap/ui/core/Title', 'sap/ui/core/TitleLevel',
				'sap/ui/core/CustomData', 'sap/ui/layout/form/SimpleFormLayout'],
		function(jQuery, library, Control,
					IconPool, SimpleForm,
					VerticalLayout, HorizontalLayout,
					Page, Button, ButtonType, Bar,
					Title, Image, Link, Text,
					QuickViewGroupElementType,
					Label, HBox, Icon, CoreTitle, CoreTitleLevel,
					CustomData, SimpleFormLayout) {
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

				var oCard = new Page(this.getCardId(), {
					content : aContent,
					customHeader : new Bar()
				});

				var oCustomHeader = oCard.getCustomHeader();

				oCustomHeader.addContentMiddle(
					new Title({
						text : this.getHeader()
					})
				);

				if (this._hasBackButton) {
					oCustomHeader.addContentLeft(
						new Button({
							type : ButtonType.Back,
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
						new Button({
							icon : "sap-icon://decline",
							press : function() {
								if (that._oPopover) {
									that._oPopover.close();
								}
							}
						})
					);
				}

				oCard.addStyleClass('sapMQuickViewCard');

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
				    oForm = new SimpleForm({
						maxContainerCols: 1,
						editable: false,
						layout: SimpleFormLayout.ResponsiveGridLayout
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
					oVLayout = new VerticalLayout(),
					oHLayout = new HorizontalLayout();

				if (this.getIcon()) {
					if (this.getIcon().indexOf("sap-icon") == 0) {
						oIcon = new Icon({
							src: this.getIcon()
						});
					} else {
						oIcon = new Image({
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
					oTitle = new Link({
						text	: this.getTitle(),
						href	: this.getTitleUrl(),
						target	: "_blank"
					});
				} else if (this.getCrossAppNavCallback()) {
					oTitle = new Link({
						text	: this.getTitle()
					});
					oTitle.attachPress(this._crossApplicationNavigation(this));
				} else {
					oTitle = new Title({
						text	: this.getTitle(),
						level	: CoreTitleLevel.H1
					});
				}

				var oDescription = new Text({
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
					oForm.addContent(new CoreTitle({
						text : oGroup.getHeading(),
						level : CoreTitleLevel.H2
					}));
				}

				if (!aElements) {
					return;
				}

				for (var k = 0; k < aElements.length; k++) {
					oCurrentGroupElement = aElements[k];

					oLabel = new Label({
						text: oCurrentGroupElement.getLabel()
					});

					oCurrentGroupElementValue = oCurrentGroupElement._getGroupElementValue();

					if (oCurrentGroupElementValue instanceof Link) {
						oCurrentGroupElementValue.addAriaLabelledBy(oCurrentGroupElementValue);
					}

					oForm.addContent(oLabel);

					if (oCurrentGroupElement.getType() == QuickViewGroupElementType.cardLink) {
						oCurrentGroupElementValue.attachPress(this._attachPressLink(this));
					}

					if (oCurrentGroupElement.getType() == QuickViewGroupElementType.mobile) {
						var oSmsLink = new Icon({
							src: IconPool.getIconURI("post"),
							decorative : false,
							customData: [new CustomData({
								key: "phoneNumber",
								value: oCurrentGroupElement.getValue()
							})],
							press: this._mobilePress
						});
						var oBox = new HBox({
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
							{
								target : {
									semanticObject : that.getCrossAppNavCallback().target.semanticObject,
									action : that.getCrossAppNavCallback().target.action
								},
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

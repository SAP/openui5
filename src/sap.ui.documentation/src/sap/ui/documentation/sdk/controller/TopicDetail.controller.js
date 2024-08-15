/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/core/ResizeHandler",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/XML2JSONUtils",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/documentation/sdk/util/Resources",
		"sap/ui/documentation/sdk/controller/util/ResponsiveImageMap",
		"sap/ui/documentation/sdk/controller/util/SidyBySideImageMap",
		"sap/m/LightBox",
		"sap/m/LightBoxItem",
		"./util/DataTableHelper",
		"./util/DataTable",
		"sap/m/Button",
		"sap/m/MessageToast",
		"sap/ui/dom/includeStylesheet",
		"sap/ui/dom/includeScript",
		"sap/ui/util/openWindow",
		"sap/ui/documentation/sdk/controller/util/Highlighter"
	],
	function (
		jQuery,
		ResizeHandler,
		BaseController,
		JSONModel,
		XML2JSONUtils,
		Device,
		ToggleFullScreenHandler,
		ResourcesUtil,
		ResponsiveImageMap,
		SidyBySideImageMap,
		LightBox,
		LightBoxItem,
		DataTableHelper,
		DataTable,
		Button,
		MessageToast,
		includeStylesheet,
		includeScript,
		openWindow,
		Highlighter
	) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.TopicDetail", {
			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				var dataTablesConfigURL,
					oConfig;

				this.oPage = this.byId("topicDetailPage");
				this.oPage.addStyleClass('docuPage');
				this.oHtml = this.byId("staticContent");
				this.aWaitingDatatables = [];
				this.aResponsiveImageMaps = [];
				this.oLayout = this.byId("staticContentLayout");

				this.oHtml.attachEvent("afterRendering", this._onHtmlRendered.bind(this));

				this._oConfig = oConfig = this.getConfig();
				this.oMatchedTopicDataTablesConfig = {};

				if ( !window.hljs ) {
					//solarized-light
					includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/highlight.js/styles.css");
					includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/highlight.js/highlight.js" });
				}

				includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/DataTables/DataTables-2.0.1/css/dataTables.jqueryui.css");
				includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/DataTables/DataTables-2.0.1/css/dataTables.jqueryui.css");
				includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/DataTables/Buttons-3.0.0/css/buttons.jqueryui.css");
				includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/DataTables/Buttons-3.0.0/css/buttons.dataTables.css");

				// order is important
				includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/DataTables/DataTables-2.0.1/js/dataTables.js" })
					.then(function () {
						return includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/DataTables/DataTables-2.0.1/js/dataTables.jqueryui.js" });
					}).then(function () {
						return includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/DataTables/Buttons-3.0.0/js/dataTables.buttons.js" });
					})
					.then(function () {
						return includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/DataTables/Buttons-3.0.0/js/buttons.jqueryui.js" });
					})
					.then(function () {
						return includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/DataTables/Buttons-3.0.0/js/buttons.html5.js" });
					})
					.then(function () {
						return includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/DataTables/Buttons-3.0.0/js/buttons.colVis.js" });
					})
					.then(function () {
						dataTablesConfigURL = ResourcesUtil.getResourceOriginPath(oConfig.docuPath + 'dataTablesConfig.json');
						return jQuery.ajax({ url: dataTablesConfigURL });
					})
					.then(function (dataTablesConfig) {
						this.oDataTablesConfig = dataTablesConfig;

						this.bDataTablesPluginLoaded = true;
						this._getDataTableHelper().addMiddlewares();

						// to prevent dom from not being rendered while loading plugin, after fetch is successful
						// check if we have rendered tables to be transformed to datatable
						if (this.aWaitingDatatables.length > 0) {
							this.aWaitingDatatables.forEach(function (oTable) {
								this._enableDataTable(oTable);
							}, this);
							this.aWaitingDatatables = [];
						}
					}.bind(this));

				this.getRouter().getRoute("topicId").attachPatternMatched(this._onTopicMatched, this);
				this.getRouter().getRoute("subTopicId").attachPatternMatched(this._onTopicMatched, this);

				this.jsonDefModel = new JSONModel();
				this.getView().setModel(this.jsonDefModel);
			},

			onBeforeRendering: function() {
				var oViewDom = this.getView().getDomRef();

				if (oViewDom && this.fnOnPageClickListener)  {
					oViewDom.removeEventListener('click', this.fnOnPageClickListener);
				}

				ResizeHandler.deregister(this._onResize.bind(this));
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onAfterRendering: function() {
				var oViewDom = this.getView().getDomRef();
				this.fnOnPageClickListener = this._onPageClick.bind(this);

				if (oViewDom)  {
					oViewDom.addEventListener('click', this.fnOnPageClickListener);
				}

				ResizeHandler.register(this.getView().getDomRef(), this._onResize.bind(this));
				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			_getCopyButtons: function(oElement) {
				var oMsg = "Copied to clipboard.";
				this.aButtonElements = oElement.querySelectorAll(".copyButton");

				this.aButtonElements.forEach(function(oButtonElement) {
					var oButton = new Button({
						icon: "sap-icon://copy"
					});
					oButton.placeAt(oButtonElement);
					oButtonElement.addEventListener('click', function() {
						var oTextArea = document.createElement("textarea");
						oTextArea.value = oButtonElement.parentNode.innerText;
						document.body.appendChild(oTextArea);
						oTextArea.select();
						document.execCommand('copy');
						document.body.removeChild(oTextArea);
						MessageToast.show(oMsg);
					});

				});
			},

			onExit: function() {
				this.aResponsiveImageMaps.forEach(function(oResponsiveImgMap) {
					oResponsiveImgMap.removeEventListeners();
				});

				ResizeHandler.deregister(this._onResize.bind(this));
				Device.orientation.detachHandler(this._onOrientationChange, this);

				if (this.highlighter) {
					this.highlighter.destroy();
				}
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			_onResize: function () {
				this.aResponsiveImageMaps.forEach(function (oImageMap) {
					oImageMap.resize();
				});
			},

			_onPageClick: function (oEvent) {
				var oTarget = oEvent.target,
					oClassList = oTarget.classList,
					bCollapsible = oClassList.contains('collapsible-icon'),
					bThumbnail = oClassList.contains('lightbox-img'),
					oSection;

				if (bThumbnail) {
					this._onThumbnailClicked(oTarget);
				}

				if (bCollapsible) {
					// collapsible sections
					oSection = oTarget.parentNode;
					oSection.classList.toggle("expanded");
				}
			},

			_onThumbnailClicked: function (oTarget) {
				var oLightBox = this._getLightBox(),
					oLightBoxItem = oLightBox.getImageContent()[0],
					sSourceUrl = oTarget.getAttribute('src'),
					sTitle = oTarget.getAttribute('title'),
					sAlt = oTarget.getAttribute('alt');

				oLightBoxItem.setImageSrc(sSourceUrl);
				oLightBoxItem.setTitle(sTitle);
				oLightBoxItem.setAlt(sAlt);

				oLightBox.open();
			},

			_getLightBox: function () {
				if (!this._oLightBox) {
					this._oLightBox = new LightBox({
						imageContent: new LightBoxItem()
					});
				}

				return this._oLightBox;
			},

			_getDataTableHelper: function () {
				return DataTableHelper.getInstance();
			},

			_onHtmlResourceLoaded: function (htmlContent) {
				var jsonObj;

				if (!htmlContent) {
					setTimeout(function () {
						this.onRouteNotFound();
					}.bind(this), 0);
					return;
				}

				jsonObj = XML2JSONUtils.XML2JSON(htmlContent, this._oConfig);
				jsonObj.bIsPhone = Device.system.phone;
				jsonObj.topicURL = this.sTopicURL;
				if (jsonObj.shortdesc) {
					jsonObj.shortdesc = jsonObj.shortdesc.trim().replace(/(\r\n|\n|\r)/gm, ' ');
				}

				this.jsonDefModel.setData(jsonObj);

				this.oHtml.setContent(jsonObj.html);
				this.oLayout.invalidate();

				this._scrollContentToTop();


				this.searchResultsButtonVisibilitySwitch(this.byId("topicDetailBackToSearch"));

				this.appendPageTitle(this.getModel().getProperty("/topictitle1"));
			},

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} event pattern match event in route 'topicId'
			 * @private
			 */
			_onTopicMatched: function (event) {
				//TODO: global jquery call found
				var sId = decodeURIComponent(event.getParameter("arguments").id),
					aUrlParts = sId.split("#"),
					sTopicId = aUrlParts[0],
					sSubTopicId = aUrlParts[1],
					oOptions = event.getParameter("arguments")["?options"];

				this.sTopicId = sTopicId.replace(".html", "");
				this.sSubTopicId = sSubTopicId;
				this.sTopicURL = ResourcesUtil.getResourceOriginPath(this._oConfig.docuPath + sTopicId + (sTopicId.match(/\.html/) ? "" : ".html"));
				this.sSubTopicId = event.getParameter("arguments").subId || sSubTopicId;

				this.sQueryFromUrl = oOptions && oOptions.q ? decodeURIComponent(oOptions.q) : "";

				jQuery.ajax(this.sTopicURL)
					.done(this._onHtmlResourceLoaded.bind(this))
					.fail(this.onRouteNotFound.bind(this));
			},

			_onHtmlRendered: function () {
				this._getDataTableHelper().destroyDatatables();

				var oSection,
					aImagemaps = this.oPage.$().find('#d4h5-main-container :not(.imagemap_sidebyside)>.imagemap'),
					aSideBySideImagemaps = this.oPage.$().find('#d4h5-main-container .imagemap_sidebyside'),
					aDataTables = this.oPage.$().find('#d4h5-main-container table.datatable'),
					aImgs = this.oPage.$().find('#d4h5-main-container img'),
					oDomRef = this.oLayout.getDomRef();

				this._fixExternalLinks(oDomRef);
				this._getCopyButtons(oDomRef);

				this._computeColumnGroupValues(oDomRef);

				if (this.sSubTopicId) {
					oSection = document.getElementById(this.sSubTopicId);
					if (oSection) {
						oSection.scrollIntoView(true);
					}
				}

				this.aResponsiveImageMaps.forEach(function(oResponsiveImgMap) {
					oResponsiveImgMap.removeEventListeners();
				});

				this.aResponsiveImageMaps = [];

				if (aDataTables.length) {
					aDataTables.each(function (index, table) {
						if (this.bDataTablesPluginLoaded) {
							this._enableDataTable(table);
						} else {
							this.aWaitingDatatables.push(table);
						}
					}.bind(this));
				}

				aImagemaps.each(function (index, imageMap) {
					this._enableImageMap(imageMap);
				}.bind(this));

				aSideBySideImagemaps.each(function (index, imageMap) {
					this._enableImageMap(imageMap, true);
				}.bind(this));

				aImgs.each(function (index, image) {
					var sSrc = image.getAttribute("src");
					image.setAttribute("src", ResourcesUtil.getResourceOriginPath(sSrc));
				});

				if (window.hljs) {
					document.querySelectorAll('pre:not([class*="lines"])').forEach(function(block) {
						window.hljs.highlightElement(block);
					});
				}

				var oSearchDataModel = this.getOwnerComponent().getModel("searchData");
				var sQuery = oSearchDataModel.getProperty("/topicQuery");

				 if (sQuery) {
					this._updateHighlighting(sQuery);
				}

				if (this.sQueryFromUrl) {
					this._updateHighlighting(this.sQueryFromUrl);
				}
			},

			_updateHighlighting: function (sQuery) {
				var oDomRef = this.getView().getDomRef();
				if (this.highlighter) {
					this.highlighter.highlight(sQuery);
				} else if (sQuery) {
					this.highlighter = new Highlighter(oDomRef, {
						useExternalStyles: false,
						shouldBeObserved: true,
						isCaseSensitive: false
					});
					this.highlighter.highlight(sQuery);
				}
			},

			_enableImageMap: function (imageMap, bIsSideBySide) {
				var oImage = imageMap.querySelector('img'),
					newImage,
					aSrcResult,
					rex = /<img[^>]+src="([^">]+)/g,
					that = this;

				if (oImage.complete) {
					this._addResponsiveImageMap(imageMap, bIsSideBySide);
				} else {
					// Image still not loaded
					// If the src is already set, then the event is firing in the cached case,
					// before you even get the event handler bound.
					// Having two images, loading from one src force the second image to wait for
					// the first to load and takes it's resources without event making new request.
					newImage = new Image();

					newImage.onload = function () {
						that._addResponsiveImageMap(imageMap, bIsSideBySide);
					};

					aSrcResult = rex.exec(oImage.outerHTML);
					if (aSrcResult) {
						newImage.src = aSrcResult && aSrcResult[1];
					}
				}
			},

			_enableDataTable: function (oTable) {
				var sTableId = oTable.id,
					oConfig = Object.assign(this._getDataTableConfig(sTableId), { responsive: true, layout: {
						topStart: {
							buttons: ['colvis', 'pageLength']
						}}}),
					oDataTable;

				if (oConfig) {
					oDataTable = jQuery('#' + sTableId).DataTable(oConfig);
					this._getDataTableHelper().addDatatable(oDataTable);
				}

			},

			_getDataTableConfig: function (sTableId) {
				var oTopicTablesConfig = this.oDataTablesConfig[this.sSubTopicId] || this.oDataTablesConfig[this.sTopicId] || {};

				return oTopicTablesConfig[sTableId];
			},

			_addResponsiveImageMap: function (data, bIsSideBySide) {
				var fnClass = bIsSideBySide ? SidyBySideImageMap : ResponsiveImageMap;

				this.aResponsiveImageMaps.push(new fnClass(data));
			},

			/**
			 *  Iterates over all links marked as external and adds a icon and disclaimer proxy
			 *
			 * @param {Element} oElement the DOM ref to the container
			 * @private
			 */
			_fixExternalLinks: function (oElement) {
				var aLinks = oElement.querySelectorAll("a.external-link"),
					i,
					oLink,
					sHref,
					sDisclaimerPath = "http://help.sap.com/disclaimer?site=";

				for (i = 0; i < aLinks.length; i++) {
					oLink = aLinks[i];
					sHref = oLink.getAttribute("href");

					oLink.setAttribute("href", sDisclaimerPath + sHref);
					this._addIconToExternalUrl(oLink, sHref);
				}
			},

			/**
			 *  The XML dita format provides a colwidth attributes to be used inside  colgroup element for configuring
			 *  the tables proportions. This function iterates over all table colgroup elements and converts
			 *  their children's width ratio to percent values
			 *
			 *  1. First loop - calculates the sum of all colgroup children
			 *  2. Second loop - transforms the origin values to percent
			 *
			 * @param {Element} oElement the DOM ref to the container
			 * @private
			 */
			_computeColumnGroupValues: function (oElement) {
				var fSum,
					iWidth,
					aSizes,
					fPercent,
					aColGroupChildren,
					oColGroups = oElement.querySelectorAll("colgroup");

				oColGroups = [].slice.call(oColGroups); // convert to array

				oColGroups.forEach(function (oColGroup) {
					fSum = 0;
					aSizes = [];

					aColGroupChildren = [].slice.call(oColGroup.children); // convert to array

					aColGroupChildren.forEach(function (oColNode, iColIndex) {
						iWidth = parseInt(oColNode.getAttribute('width'));

						aSizes[iColIndex] = iWidth;
						fSum += iWidth;
					});

					aColGroupChildren.forEach(function (oColNode, iColIndex) {
						fPercent = (aSizes[iColIndex] / fSum) * 100;
						oColNode.setAttribute('width', fPercent + "%");
					});
				});

			},

			/**
			 *  Create and append an icon to the external link
			 * 1) The link is a non SAP and the icon image is link-external.png
			 * 2) The link is a SAP and the icon image is link-sap.png
			 *
			 * @param {Element} aDomRef the DOM ref to the external link
			 * @param {string} sHref the url string
			 * @private
			 */
			_addIconToExternalUrl: function (aDomRef, sHref) {
				var bSAPHosted = this._isSAPHostedUrl(sHref),
					sTitle = 'Information published on ' + (bSAPHosted ? '' : 'non ') + 'SAP site',
					newImage = new Image(),
					sIconName = bSAPHosted ? 'link-sap' : 'link-external';

				newImage.onload = function () {
					aDomRef.appendChild(newImage);
				};

				newImage.src = './resources/sap/ui/documentation/sdk/images/' + sIconName + '.png';
				newImage.setAttribute("title", sTitle);
				newImage.className = "sapUISDKExternalLink";
			},

			_isSAPHostedUrl: function(sHref) {
				return /^https?:\/\/([\w.]*\.)?(?:sap|hana\.ondemand|sapfioritrial)\.com/.test(sHref);
			},

			_scrollContentToTop: function () {
				if (this.oPage && this.oPage.$().length > 0) {
					this.oPage.getScrollDelegate().scrollTo(0, 1);
				}
			},

			_formatHTML: function(html) {
				return '<div>' + html + '</div>';
			},

			backToSearch: function (text) {
				this.onNavBack();
			},

			onToggleFullScreen: function(oEvent) {
				ToggleFullScreenHandler.updateMode(oEvent, this.getView(), this);
			},

			onEditGitHubPress: function(oEvent) {
				openWindow(this.jsonDefModel.getProperty("/mdEditLink"));
			}
		});
	}
);

/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/ResizeHandler",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/XML2JSONUtils",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/documentation/sdk/util/Resources",
		"sap/ui/documentation/sdk/controller/util/ResponsiveImageMap",
		"sap/ui/core/HTML",
		"sap/base/Log",
		"sap/m/LightBox",
		"sap/m/LightBoxItem"
	], function (jQuery, ResizeHandler, BaseController, JSONModel, XML2JSONUtils, Device, ToggleFullScreenHandler, ResourcesUtil, ResponsiveImageMap, HTML, Log, LightBox, LightBoxItem) {
		"use strict";

		var GIT_HUB_DOCS_URL = "https://sap.github.io/openui5-docs/#/",
			REGEX = {
				SPECIAL_CHARS: /[\\\/:*\?"<>|]/g,
				SPACES: /\s+/g
			};

		return BaseController.extend("sap.ui.documentation.sdk.controller.TopicDetail", {


			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.oPage = this.byId("topicDetailPage");
				this.oPage.addStyleClass('docuPage');
				this.oHtml = this.byId("staticContent");
				this.aResponsiveImageMaps = [];
				this.oLayout = this.byId("staticContentLayout");

				this.oHtml.attachEvent("afterRendering", this._onHtmlRendered.bind(this));

				if ( !window.prettyPrint ) {
					//TODO: global jquery call found
					jQuery.sap.require("sap.ui.documentation.sdk.thirdparty.google-code-prettify.prettify");
				}

				this.getRouter().getRoute("topicId").attachPatternMatched(this._onTopicMatched, this);
				this.getRouter().getRoute("subTopicId").attachPatternMatched(this._onTopicMatched, this);
				this._oConfig = this.getConfig();

				this.jsonDefModel = new JSONModel();
				this.getView().setModel(this.jsonDefModel);
			},

			onBeforeRendering: function() {
				var oViewDom = this.getView().getDomRef();
				if (oViewDom)  {
					oViewDom.removeEventListener('click', this._onPageClick.bind(this));
				}

				ResizeHandler.deregister(this._onResize.bind(this));
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onAfterRendering: function() {
				var oViewDom = this.getView().getDomRef();
				if (oViewDom)  {
					oViewDom.addEventListener('click', this._onPageClick.bind(this));
				}

				ResizeHandler.register(this.getView().getDomRef(), this._onResize.bind(this));
				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			onExit: function() {
				ResizeHandler.deregister(this._onResize.bind(this));
				Device.orientation.detachHandler(this._onOrientationChange, this);
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

			_onHtmlResourceLoaded: function (htmlContent) {
				var jsonObj;

				if (!htmlContent) {
					setTimeout(function () {
						this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
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

				setTimeout(window.prettyPrint, 0);

				this.searchResultsButtonVisibilitySwitch(this.byId("topicDetailBackToSearch"));
			},

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} event pattern match event in route 'topicId'
			 * @private
			 */
			_onTopicMatched: function (event) {
				//TODO: global jquery call found
				var sId = event.getParameter("arguments").id,
					aUrlParts = sId.split("#"),
					sTopicId = aUrlParts[0],
					sSubTopicId = aUrlParts[1];

				this.sTopicURL = ResourcesUtil.getResourceOriginPath(this._oConfig.docuPath + sTopicId + (sTopicId.match(/\.html/) ? "" : ".html"));
				this.sSubTopicId = event.getParameter("arguments").subId || sSubTopicId;

				jQuery.ajax(this.sTopicURL)
					.success(this._onHtmlResourceLoaded.bind(this))
					.fail(Log.err);
			},

			_onHtmlRendered: function () {
				var newImage,
					oSection,
					aImagemaps = this.oPage.$().find('#d4h5-main-container .imagemap'),
					aSrcResult,
					rex = /<img[^>]+src="([^">]+)/g,
					oDomRef = this.oLayout.getDomRef();

				this._fixExternalLinks(oDomRef);

				this._computeColumnGroupValues(oDomRef);

				if (this.sSubTopicId) {
					oSection = document.getElementById(this.sSubTopicId);
					if (oSection) {
						oSection.scrollIntoView(true);
					}
				}

				this.aResponsiveImageMaps = [];

				aImagemaps.each(function (index, image) {
					if (image.complete) {
						this._addResponsiveImageMap(image);
					} else {
						// Image still not loaded
						// If the src is already set, then the event is firing in the cached case,
						// before you even get the event handler bound.
						// Having two images, loading from one src force the second image to wait for
						// the first to load and takes it's resources without event making new request.
						newImage = new Image();

						newImage.onload = function () {
							this._addResponsiveImageMap(image);
						}.bind(this);

						aSrcResult = rex.exec(image.innerHTML);
						if (aSrcResult) {
							newImage.src = aSrcResult && aSrcResult[1];
						}
					}
				}.bind(this));

			},

			_addResponsiveImageMap: function (data) {
				this.aResponsiveImageMaps.push(new ResponsiveImageMap(
					data.querySelector('map'),
					data.querySelector('img')
				));
			},

			/**
			 *  Iterates over all links marked as external and adds a icon and disclaimer proxy
			 *
			 * @param oElement, the dom ref to the container
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
			 * @param oElement, the dom ref to the container
			 * @private
			 */
			_computeColumnGroupValues: function (oElement) {
				var fSum,
					iWidth,
					aSizes,
					fPercent,
					aColGroupChildren,
					oColGroups = oElement.querySelectorAll("colgroup");

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
			 * @param aDomRef, the dom ref to the external link
			 * @param sHref, the url string
			 * @private
			 */
			_addIconToExternalUrl: function (aDomRef, sHref) {
				// Check if the external domain is SAP hosted
				var bSAPHosted = /^https?:\/\/(?:www.)?[\w.]*(?:sap|hana\.ondemand|sapfioritrial)\.com/.test(sHref),
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
				var sUrl = this.jsonDefModel.getProperty("/topicURL"),
					sTitle = this.jsonDefModel.getProperty("/topictitle1"),
					sGitHubUrl = this._formatToGitHubUrl(sUrl, sTitle);
				window.open(sGitHubUrl, "_blank");
			},

			/**
			 * Transforms a URL from the SAPUI5 documentation into the corresponding URL in the GitHub repo,
			 * following the rules:
			 * The GitHub URL starts with <code>GIT_HUB_DOCS_URL</code>
			 * and the filename is calculated from the topic title in the following way:
			 * 1) Special symbols are removed \ / : * ? “ < > |
			 * 2) All empty spaces are replaced with “_” and one additional “_” is added at the end
			 * 3) The first seven symbols from the ID used in the Demo Kit URLs are added at the end
			 * 4) The file type is added at the end “.md”
			 *
			 * @param sUrl, the url of the file in the internal repo
			 * @param sTitle, the title of the file
			 * @returns {string}, the url of the file in the GitHub repo
			 * @private
			 */
			_formatToGitHubUrl: function(sUrl, sTitle) {
				var sGitHubFileName = sTitle.trim()
					.replace(REGEX.SPECIAL_CHARS, "") // remove special chars
					.replace(REGEX.SPACES, "_"); // replace remaining spaces with delimiter char
				sGitHubFileName += "_"; // end the text with a single delimiter char
				sGitHubFileName += sUrl.split("/").pop().substring(0, 7); // concat the first 7 symbols of the original filename
				sGitHubFileName += ".md";
				return GIT_HUB_DOCS_URL + sGitHubFileName;
			}

		});

	}
);

/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/thirdparty/jquery"],
	function (jQuery) {
		"use strict";

		function buildDocuJSON(xml, oConfig) {
			var xmlDom = xml2dom(xml, oConfig);
			var aSingles = ["topictitle1", "shortdesc"];
			var aPreservedSingles = oConfig.preservedContent && oConfig.preservedContent.length
				&& oConfig.preservedContent.map(function (e) { return e.className; });

			var getPreservedTags = function (className) {
				var preservedTags;

				oConfig.preservedContent.forEach(function (item) {
					if (item.className === className) {
						preservedTags = item.preservedTags;
					}
				});

				return preservedTags;
			};

			var getNodeText = function (className, nodeHTML) {
				var bIsNodePreserved = aPreservedSingles && aPreservedSingles.indexOf(className) > -1;

				if (bIsNodePreserved) {
					return jQuery("<div></div>").html(removeHTMLTags(nodeHTML, getPreservedTags(className))).html();
				}

				return jQuery("<div></div>").html(removeHTMLTags(nodeHTML)).text();
			};

			var processSingleNode = function (className, xmlDOMObj) {
				var oXMLDOM = xmlDOMObj || xmlDom;
				var oNodes = oXMLDOM.getElementsByClassName(className);

				if (oNodes.length === 0) {
					return '';
				}

				var nodeHTML = oNodes[0].innerHTML,
					nodeText = getNodeText(className, nodeHTML);

				return oNodes && oNodes.length > 0 && ("innerHTML" in oNodes[0]) && nodeText || '';
			};

			var fixImgLocation = function (element) {
				var images = element.querySelectorAll("img");

				for (var i = 0; i < images.length; i++) {
					if (images[i].classList.contains('link-external')) {
						images[i].setAttribute("src", "./resources/sap/ui/documentation/sdk/images/link-external.png");
						continue;
					}
					images[i].setAttribute("src", oConfig.docuPath + images[i].getAttribute("src"));
				}

				return element.innerHTML;
			};

			var processSections = function () {
				/* "Invalid DOM Elements" (ones that should not be added to the body) are:
					- all scripts
					- element with class topictitle1 (this is used as title)
					- element with class shortdesc (this is used as subtitle, if we have nested topics only the first shortdesc element should be removed)
				 */
				var wrapperContainer = xmlDom,
					invalidChildren = wrapperContainer.querySelectorAll("script, .topictitle1"),
					invalidChildrenFirstOnly = [".shortdesc"],
					invalidChild,
					invalidChildParent, i;

				// Convert NodeList to Array to use functions like .push(), etc.
				invalidChildren = Array.prototype.slice.call(invalidChildren);

				invalidChildrenFirstOnly.forEach(function (selector) {
					invalidChild = wrapperContainer.querySelector(selector);
					if (invalidChild && invalidChildren.indexOf(invalidChild) === -1) { //make sure invalidChild is not already a part of the invalidChildren
						invalidChildren.push(invalidChild);
					}
				});

				for (var i = 0; i < invalidChildren.length; i++) {
					invalidChildParent = invalidChildren[i].parentElement;
					if (invalidChildParent) {
						invalidChildParent.removeChild(invalidChildren[i]);
					}
				}

				fixImgLocation(wrapperContainer);

				json['html'] = wrapperContainer.innerHTML;
			};

			var json = {}, mdEditLink;
			aSingles.forEach(function (singleNode, idx) {
				json[singleNode] = processSingleNode(singleNode);
			});

			mdEditLink = xmlDom.querySelector(".mdeditlink");

			if (mdEditLink) {
				json.mdEditLink = mdEditLink.getAttribute("href");
			}

			processSections();

			return json;

		}

		function xml2dom(xml, oConfig) {
			var dom = jQuery.parseHTML(xml);
			var mainDivName = oConfig.topicHtmlMainDivId;
			for (var i = 0; i < dom.length; i++) {
				if (dom[i].getAttribute && dom[i].getAttribute("id") === mainDivName) {
					var newHTML = '<div id ="' + mainDivName + '">' + dom[i].innerHTML + '</div>';
					dom[i].innerHTML = newHTML;
					return dom[i];
				}
			}
		}

		/**
		 * Removes HTML tags from a string, except for those specified in the preservedTags array.
		 * @param {string} txt - The input string.
		 * @param {string[]} [preservedTags] - An optional array of HTML tags to preserve.
		 * @return {string} The input string with HTML tags removed.
		 */
		function removeHTMLTags(txt, preservedTags) {
			if (preservedTags === undefined || preservedTags.length === 0) {
				return removeAllHTMLTags(txt);
			}

			return txt.replace(/<\/?([^>]+)>/g, function (match, tag) {
				if (preservedTags.indexOf(tag.split(" ")[0]) === -1) {
					return '';
				}
				return match;
			}).replace(/\s{2,}/g, ' ');
		}

		/**
		 * Removes all HTML tags from a string.
		 * @param {string} txt - The input string.
		 * @return {string} The input string with all HTML tags removed.
		 */
		function removeAllHTMLTags(txt) {
			return txt.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ');
		}

		return {
			DomXml2JSON: buildDocuJSON,
			XML2DOM: xml2dom,
			XML2JSON: buildDocuJSON,
			removeHTMLTags: removeHTMLTags
		};

	});
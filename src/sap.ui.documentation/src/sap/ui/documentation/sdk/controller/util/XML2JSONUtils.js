/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		function buildDocuJSON(xml, oConfig) {
			var xmlDom = xml2dom(xml, oConfig);
			var aSingles = ["topictitle1", "shortdesc"];

			var processSingleNode = function(className, xmlDOMObj) {
				var oXMLDOM = xmlDOMObj || xmlDom;
				var oNodes = oXMLDOM.getElementsByClassName(className);
				if (oNodes.length === 0) {
					return '';
				}
				var nodeText = jQuery("<div/>").html(removeHTMLTags(oNodes[0].innerHTML)).text();
				return oNodes && oNodes.length > 0 && ("innerHTML" in oNodes[0]) && nodeText || '';
			};

			var removeHTMLTags = function(txt) {
				return txt.replace(/<[^>]*>/g, " ")
						.replace(/\s{2,}/g, ' ');
			};

			/**
			 * Adjusts link href values
			 * @param element The DOM element which may contain cross reference links
			 */
			var fixLinks = function(element) {
				var links = element.querySelectorAll("a.xref, a.link, area"),
					i,
					link,
					href,
					startsWithHash,
					startsWithHTTP;

				for (i = 0; i < links.length; i++) {
					link = links[i];
					href = link.getAttribute("href");
					startsWithHash = href.indexOf("#") == 0;
					startsWithHTTP = href.indexOf("http") == 0;

					// absolute links should open in a new window
					if (startsWithHTTP) {
						link.setAttribute('target', '_blank');
					}
					// absolute links and links starting with # are ok and should not be modified
					if (startsWithHTTP || startsWithHash) {
						continue;
					}

					// API reference are recognized by "/docs/api/" string
					if (href.indexOf("/docs/api/") > -1) {
						href = href.substr(0, href.lastIndexOf(".html"));
						href = href.substr(href.lastIndexOf('/') + 1);
						href = "#/api/" + href;
					} else if (href.indexOf("explored.html") > -1) { // explored app links have explored.html in them
						href = href.split("../").join("");
						href = oConfig.exploredURI + href;
					} else { // we assume all other links are links to other documentation pages
						href = href.substr(0, href.lastIndexOf(".html"));
						href = "#/topic/" + href;
					}

					link.setAttribute("href", href);
				}
			};

			var fixImgLocation = function(element) {
				var images = element.querySelectorAll("img");

				for (var i = 0; i < images.length; i++) {
					images[i].setAttribute("src", oConfig.docuPath + images[i].getAttribute("src"));
				}

				return element.innerHTML;
			};

			var processSections = function() {
				/* "Invalid DOM Elements" (ones that should not be added to the body) are:
					- all scripts
					- element with class topictitle1 (this is used as title)
					- element with class shortdesc (this is used as subtitle)
					- element with id local-navigation (this is the left-side navigation which we already have)
					- element with tag header
					- element with id footer-container
					- element with id nav.mobile-nav
					- element with id breadcrumb-container
					- element with id content-toolbar (it contains info about the previous page)
					- element with class related-links (it contains the related links info and should have a custom position)
				 */
				var wrapperContainer = xmlDom,
					invalidChildren = wrapperContainer.querySelectorAll("script, .topictitle1, .shortdesc, #local-navigation, header, #footer-container, nav.mobile-nav, #breadcrumb-container, #content-toolbar"),
					invalidChildParent, i;

				for (var i = 0; i < invalidChildren.length; i++) {
					invalidChildParent = invalidChildren[i].parentElement;
					invalidChildParent.removeChild(invalidChildren[i]);
				}

				fixLinks(wrapperContainer);
				fixImgLocation(wrapperContainer);

				json['html'] =  wrapperContainer.innerHTML;
			};

			var json = {};
			aSingles.forEach(function(singleNode, idx){
				json[singleNode] = processSingleNode(singleNode);
			});

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

		return {
			DomXml2JSON : buildDocuJSON,
			XML2DOM: xml2dom,
			XML2JSON: buildDocuJSON
		};

	});
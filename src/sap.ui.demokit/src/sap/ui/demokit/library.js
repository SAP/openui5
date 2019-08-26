/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.demokit.
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/Global',
	'sap/ui/core/Core',
	'./js/highlight-query-terms',
	'sap/ui/core/library', // library dependency
	'sap/ui/commons/library' // library dependency
], function(jQuery, Global) {

	"use strict";


	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.demokit",
		version: "${version}",
		dependencies : ["sap.ui.core","sap.ui.commons"],
		types: [
			"sap.ui.demokit.UI5EntityCueCardStyle"
		],
		interfaces: [],
		controls: [
			"sap.ui.demokit.CodeSampleContainer",
			"sap.ui.demokit.CodeViewer",
			"sap.ui.demokit.FileUploadIntrospector",
			"sap.ui.demokit.HexagonButton",
			"sap.ui.demokit.HexagonButtonGroup",
			"sap.ui.demokit.IndexLayout",
			"sap.ui.demokit.SimpleTree",
			"sap.ui.demokit.TagCloud",
			"sap.ui.demokit.UI5EntityCueCard"
		],
		elements: [
			"sap.ui.demokit.SimpleTreeNode",
			"sap.ui.demokit.Tag",
			"sap.ui.demokit.UIAreaSubstitute"
		]
	});

	/* eslint-disable no-undef */
	/**
	 * SAPUI5 library with non-public controls, used in the UI5 demokit (SDK)
	 *
	 * @namespace
	 * @alias sap.ui.demokit
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sdk
	 */
	var thisLibrary = sap.ui.demokit;
	/* eslint-enable no-undef */

	/**
	 * Different styles for an entity cue card.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sdk
	 */
	thisLibrary.UI5EntityCueCardStyle = {

		/**
		 * default style (no special styling).
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Demokit style
		 * @public
		 */
		Demokit : "Demokit"

	};

	sap.ui.lazyRequire("sap.ui.demokit.UI5EntityCueCard", "attachToContextMenu detachFromContextMenu");
	sap.ui.lazyRequire("sap.ui.demokit.DemokitApp", "new getInstance");
	sap.ui.lazyRequire("sap.ui.demokit.IndexPage");

	sap.ui.getCore().attachInit( function () {

		if ( jQuery("body").hasClass("sapUiDemokitBody") ) {

			var CodeSampleContainer = sap.ui.requireSync('sap/ui/demokit/CodeSampleContainer');
			var HexagonButton = sap.ui.requireSync('sap/ui/demokit/HexagonButton');
			var UI5EntityCueCard = sap.ui.requireSync('sap/ui/demokit/UI5EntityCueCard');

			// replace h1 headers with our title
			jQuery("h1").each(function() {
				var $ = jQuery(this),
				sTitle = $.text(),
				sColor = "Gray",//$.attr('color'),
				sIcon  = $.attr('icon'),
				sIconPos = $.attr('iconPos') || 'left:40px;top:20px;',
				$title = jQuery("<div class='sapUiDemokitTitle'><span>" + sTitle + "</span></div>");

				// first attach new content to DOM
				$.replaceWith($title);
				// only then enrich it with a HexButton (otherwise placeAt() will not find the UIArea)
				if ( sColor || sIcon) {
					$title.prepend("<div id='sap-demokit-icon'></div>");
					new HexagonButton({color:sColor, imagePosition:'position: relative;' + sIconPos, icon:sIcon}).placeAt("sap-demokit-icon");
				}

			});

			var $h2 = jQuery("h2");
			var $settings = jQuery('h2[id="settings"]');
			var sControls = jQuery("html").attr('data-sap-ui-dk-controls');
			if ( $settings.size() === 0 && $h2.size() >= 2 && sControls) {
				jQuery($h2[1]).before(jQuery("<h2 id='settings'>Settings (Overview)</h2><div cue-card='" + sControls.split(',')[0] + "'></div>"));
				$h2 = jQuery("h2");
			}
			var $tln = jQuery("ul.sapDkTLN");
			if ( $h2.size() > 0 && $tln.size() == 0 ) {
				$h2.first().before($tln = jQuery("<ul class='sapDkTLN'></ul>"));
			}

			$h2.each(function(idx) {
				var $ = jQuery(this);
				// Skip hidden sections. Can be used to suppress sections (e.g. settings) in a page
				if ( $.css('display') === 'none' ) {
					return;
				}
				if ( !$.attr('id') ) {
					$.attr('id', '__' + idx);
				}
				var a = jQuery("<a></a>").attr("href", "#" + $.attr('id')).text($.text()).addClass('sapDkLnk');
				var li = jQuery("<li></li>").append(a);
				$tln.append(li);
			});

			// create CodeSampleContainers
			jQuery("[code-sample]").each(function() {
				var $ = jQuery(this),
				sUiAreaId = $.attr('code-sample'),
				sScriptId = $.attr('script') || $.children('script').attr('id') || sUiAreaId + "-script";
				$.addClass("sapUiDemokitSampleCont");
				new CodeSampleContainer("code-sample-" + sUiAreaId, { scriptElementId : sScriptId, uiAreaId : sUiAreaId}).placeAt(this);
			});

			// create CueCards
			jQuery("[cue-card]").each(function() {
				var $ = jQuery(this),
					sEntityName = $.attr('cue-card');

				new UI5EntityCueCard({
					entityName : sEntityName,
					collapsible : false,
					expanded : true,
					style: 'Demokit',
					navigable: true,
					navigate: function(oEvent) {
						top.sap.ui.demokit.DemokitApp.getInstance().navigateToType(oEvent.getParameter("entityName"));
						oEvent.preventDefault();
					},
					title: 'Settings (Overview)'
				}).placeAt(this);
			});

		}

	});

	thisLibrary._getAppInfo = function(fnCallback) {
		var sUrl = sap.ui.resource("", "sap-ui-version.json");

		jQuery.ajax({
			url: sUrl,
			dataType: "json",
			error: function(xhr, status, e) {
				jQuery.sap.log.error("failed to load library list from '" + sUrl + "': " + status + ", " + e);
				fnCallback(null);
			},
			success : function(oAppInfo, sStatus, oXHR) {
				if (!oAppInfo) {
					jQuery.sap.log.error("failed to load library list from '" + sUrl + "': " + sStatus + ", Data: " + oAppInfo);
					fnCallback(null);
					return;
				}

				fnCallback(oAppInfo);
			}
		});
	};

	thisLibrary._loadAllLibInfo = function(sAppRoot, sInfoType /*"_getDocuIndex", "_getThirdPartyInfo", "_getLibraryInfo", "_getReleaseNotes", "_getLibraryInfoAndReleaseNotes"*/, sReqVersion, fnCallback) {

		// parameter fallback for compatibility: if the version is a function
		// then it is the old signature: (sAppRoot, sInfoType, fnCallback)
		if (typeof sReqVersion === "function") {
			fnCallback = sReqVersion;
			sReqVersion = undefined;
		}

		jQuery.sap.require("sap.ui.core.util.LibraryInfo");
		var LibraryInfo = sap.ui.require("sap/ui/core/util/LibraryInfo");
		var libInfo = new LibraryInfo();

		// special case: fetching library info and release notes in one cycle
		// this will use the _getLibraryInfo functionality and
		var bFetchReleaseNotes = sInfoType == "_getLibraryInfoAndReleaseNotes";
		if (bFetchReleaseNotes) {
			sInfoType = "_getLibraryInfo";
		}

		thisLibrary._getAppInfo(function(oAppInfo) {
			if (!(oAppInfo && oAppInfo.libraries)) {
				fnCallback(null, null);
				return;
			}

			var count = 0,
				aLibraries = oAppInfo.libraries,
				len = aLibraries.length,
				oLibInfos = {},
				oLibVersions = {},
				aLibs = [],
				libName,
				libVersion;
			for (var i = 0; i < len; i++) {
				libName = aLibraries[i].name;
				libVersion = aLibraries[i].version;
				aLibs.push(libName);
				oLibVersions[libName] = libVersion;

				/*eslint-disable no-loop-func */
				libInfo[sInfoType](libName, function(oExtensionData){
					var fnDone = function() {
						count++;
						if (count == len) {
							fnCallback(aLibs, oLibInfos, oAppInfo);
						}
					};
					oLibInfos[oExtensionData.library] = oExtensionData;
					// fallback to version coming from version info file
					// (in case of ABAP we always should refer to the libVersion if available!)
					if (!oLibInfos[oExtensionData.library].version) {
						oLibInfos[oExtensionData.library].version = oLibVersions[oExtensionData.library];
					}
					// fetch the release notes if defined - in case of no version
					// is specified we fallback to the current library version
					if (bFetchReleaseNotes) {
						if (!sReqVersion) {
							sReqVersion = oLibVersions[oExtensionData.library];
						}
						libInfo._getReleaseNotes(oExtensionData.library, sReqVersion, function(oReleaseNotes) {
							oLibInfos[oExtensionData.library].relnotes = oReleaseNotes;
							fnDone();
						});
					} else {
						fnDone();
					}
				});
				/*eslint-enable no-loop-func */
			}
		});
	};

	return thisLibrary;

});

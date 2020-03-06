/* global hasher */
/*!
 * ${copyright}
 */
// Provides a customized router class for the 'documentation' app.
sap.ui.define([
	'sap/m/routing/Router',
	'sap/ui/core/routing/History',
	'sap/ui/thirdparty/hasher',
	"sap/ui/documentation/sdk/controller/util/ControlsInfo"
], function(Router, History, Hasher, ControlsInfo) {
	"use strict";

	// We need to set the global hasher instance to not encode URL's. This is specific for the SDK
	// and it enables the application to handle module URL's which need to be encoded.
	Hasher.raw = true;

	var DocumentationRouter = Router.extend("sap.ui.documentation.sdk.util.DocumentationRouter", {

		constructor : function() {
			Router.prototype.constructor.apply(this, arguments);

			// Configure URL separator
			this._URLSeparator = window['sap-ui-documentation-static'] ? "%23" : "#";

			this.getRoute("entitySamplesLegacyRoute").attachPatternMatched(this._onOldEntityRouteMatched, this);
			this.getRoute("entityAboutLegacyRoute").attachPatternMatched(this._onOldEntityRouteMatched, this);
			this.getRoute("entityPropertiesLegacyRoute").attachPatternMatched({entityType: "controlProperties"}, this._forwardToAPIRef, this);
			this.getRoute("entityAggregationsLegacyRoute").attachPatternMatched({entityType: "aggregations"}, this._forwardToAPIRef, this);
			this.getRoute("entityAssociationsLegacyRoute").attachPatternMatched({entityType: "associations"}, this._forwardToAPIRef, this);
			this.getRoute("entityEventsLegacyRoute").attachPatternMatched({entityType: "events"}, this._forwardToAPIRef, this);
			this.getRoute("entityMethodsLegacyRoute").attachPatternMatched({entityType: "methods"}, this._forwardToAPIRef, this);

			this.getRoute("topicIdLegacyRoute").attachPatternMatched(this._onOldTopicRouteMatched, this);
			this.getRoute("apiIdLegacyRoute").attachPatternMatched(this._onOldApiRouteMatched, this);

			this.getRoute("sampleLegacyRoute").attachPatternMatched({routeName: "sample"}, this._onOldSampleRouteMatched, this);
			this.getRoute("codeLegacyRoute").attachPatternMatched({routeName: "code"}, this._onOldSampleRouteMatched, this);
			this.getRoute("codeFileLegacyRoute").attachPatternMatched({routeName: "codeFile"}, this._onOldSampleRouteMatched, this);

			this.getRoute("ReleaseNotesLegacyRoute").attachPatternMatched(function () {
				this.navTo("releaseNotes");
			}, this);
		},

		_onOldEntityRouteMatched: function(oEvent) {
			this.navTo("entity", {
				id: oEvent.getParameter("arguments").id
			}, true);
		},

		_forwardToAPIRef: function(oEvent, oData) {
			oData || (oData = {});
			oData['id'] = oEvent.getParameter("arguments").id;
			this.navTo("apiId", oData);
		},

		_onOldSampleRouteMatched: function (oEvent, oEventData) {
			var oArguments = oEvent.getParameter("arguments"),
				sSampleId = oArguments.id;

			ControlsInfo.loadData().then(function (oData) {
				var oSample = oData.samples[sSampleId],
					oNavigationObject;

				if (!oSample) {
					this.myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
				}

				oNavigationObject = {
					entityId: oSample.contexts ? Object.keys(oSample.contexts)[0] : oSample.entityId,
					sampleId: sSampleId
				};

				if (oEventData.routeName === "codeFile") {
					oNavigationObject['fileName'] = decodeURIComponent(oArguments.fileName);
				}

				// Nav to new route
				this.navTo(oEventData.routeName, oNavigationObject, true);
			}.bind(this));
		},

		/**
		 * Handling old Demo Kit topic routes which should be navigated to new routes
		 * @param {object} oEvent event object
		 * @private
		 */
		_onOldTopicRouteMatched: function(oEvent) {
			this.navTo("topicId", {id: oEvent.getParameter("arguments").id.replace(/.html$/, "")}, true);
		},

		/**
		 * Handling old Demo Kit API routes which should be navigated to new routes
		 * @param {object} oEvent event object
		 * @private
		 */
		_onOldApiRouteMatched: function(oEvent) {
			var sEntityType,
				sEntityId,
				aSplit,
				sId = oEvent.getParameter("arguments").id;

			if (sId) {
				aSplit = sId.split("#");
				if (aSplit.length === 2) {
					sId = aSplit[0];
					sEntityType = aSplit[1];

					aSplit = sEntityType.split(":");
					if (aSplit.length === 2) {
						sEntityType = aSplit[0];
						sEntityId = aSplit[1];
					}
				}

				sId = sId.replace(/.html$/, "");

				if (sEntityType === 'event') { // legacy keyword is singular
					sEntityType = "events";
				}
			}

			this.navTo("apiId", {id: sId, entityType: sEntityType, entityId: sEntityId}, true);
		},

		/**
		 * mobile nav back handling
		 */
		myNavBack: function (sRoute, oData) {
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				var bReplace = true; // otherwise we go backwards with a forward history
				this.navTo(sRoute, oData, bReplace);
			}
		},

		/**
		 * a nav to method that does not write hashes but load the views properly
		 */
		myNavToWithoutHash: function (viewName, viewType, master, data) {
			var oComponent = this._getOwnerComponent(),
				oRootView = oComponent.byId(oComponent.getManifestEntry("/sap.ui5/rootView").id);

			oRootView.loaded().then(function (oRootView) {
				var	oApp = oRootView.byId("splitApp"),
					oView = this.getView(viewName, viewType);

				oApp.addPage(oView, master);
				oApp.toDetail(oView.getId(), "show", data);
			}.bind(this));
		},

		/**
		 * Getter for the owner component
		 *
		 * <b>Note:</b> In the router we have no getter to retrieve the owner component. This should be improved in the
		 * future.
		 * @returns {sap.ui.core.UIComponent} Owner component of the router instance
		 * @private
		 */
		_getOwnerComponent: function () {
			return this._oOwner; // Accessing owner component from reference on the instance object.
		},

		/**
		 * Destroys the current sample component
		 * @private
		 */
		_destroySampleComponent: function () {
			var oComponent = this._getOwnerComponent()._oCurrentOpenedSample;
			if (oComponent) {
				oComponent.destroy();
				oComponent = null;
			}
		}

	});

	/*
	 * ===============================================================================================================
	 *
	 * Handling for documentation links based on deployment type. Demo Kit should handle all 3 types of URL's listed
	 * below:
	 *
	 * 1) Java server and local Grunt serve:
	 *
	 * /api/module:sap/base/Log#methods/sap/base/Log.warning
	 * \__/\__________________/ \_____/ \__________________/
	 *  |            |             |              |
	 * Section    Symbol      Member type       Member
	 *
	 * 2) Static deployment:
	 *
	 * #/api/module:sap/base/Log%23methods/sap/base/Log.warning
	 *  \__/\__________________/   \_____/ \__________________/
	 *   |            |               |              |
	 * Section      Symbol       Member type       Member
	 *
	 * 3) Legacy URL's:
	 *
	 * #/api/module%3Asap%2Fbase%2FLog/methods/sap%2Fbase%2FLog.warning
	 *  \__/\________________________/ \_____/\_______________________/
	 *   |               |                |              |
	 * Section         Symbol        Member type       Member
	 *
	 * ===============================================================================================================
	 */

	/**
	 * Handling of documentation link clicks - some times only scrolling is needed without navigation
	 */
	DocumentationRouter.prototype.linkClickHandler = function (oEvent) {
		var oElement = oEvent.target,
			$Element = jQuery(oElement),
			oAnchorElement,
			bCtrlHold = oEvent.ctrlKey || oEvent.metaKey,
			sTarget;

		if (!oElement) {
			return;
		}

		if (
			$Element.hasClass("scrollToMethod") ||
			$Element.hasClass("scrollToEvent") ||
			$Element.hasClass("scrollToAnnotation")
		) {
			if (oEvent.preventDefault) {
				oEvent.preventDefault();
			}
			return; // This is handled in the SubApiDetail controller
		}

		if (bCtrlHold) {
			// if ctrl or command is pressed we want
			// the default browser behavior (open in new tab)
			return;
		}

		oAnchorElement = getClosestParentLink(oElement);
		sTarget = getHref(oAnchorElement);

		// If we have no target by here we give up
		if (!sTarget ||
			/^blob:/.test(sTarget) ||
			/^https?:\/\//.test(sTarget) ||
			/^test-resources\//.test(sTarget) ||
			/^resources\//.test(sTarget)
		) {
			return;
		}

		// Stop the event propagation
		if (oEvent.preventDefault) {
			oEvent.preventDefault();
		}

		if (sTarget === "#") {
			sTarget = ""; // translate to base route
		}

		if (window['sap-ui-documentation-static'] && this.shouldConvertHash(sTarget)) {
			sTarget = sTarget.replace("#", "%23");
		}

		this.parse(sTarget);

		// Add new URL history and update URL
		if (window['sap-ui-documentation-static']) {
			window.history.pushState({},undefined,"#/" + sTarget);
		} else {
			window.history.pushState({},undefined, sTarget);
		}

	};

	DocumentationRouter.prototype.mouseDownClickHandler = function (oEvent) {
		var iPressedButton = oEvent.buttons,
			oTarget = oEvent.target,
			oAnchorElement = getClosestParentLink(oTarget),
			bCtrlHold = oEvent.ctrlKey || oEvent.metaKey,
			sTargetHref;

		if (oAnchorElement) {
			sTargetHref = getHref(oAnchorElement);
		}

		// Do not change href if its already changed
		if (!sTargetHref || /^https?:\/\//.test(sTargetHref)) {
			return;
		}

		// When context menu of the Browser is opened or when the aux button is clicked,
		// or if the ctrl is hold and left mouse button is clicked
		// we change the href of the anchor element
		if (iPressedButton === 2 || iPressedButton === 4 || (bCtrlHold && iPressedButton === 1)) {
			sTargetHref = this.convertToStaticFormat(sTargetHref);
			oAnchorElement.setAttribute("href", sTargetHref);
		}
	};

	DocumentationRouter.prototype.popstateHandler = function () {
		var bStatic = !!window['sap-ui-documentation-static'],
			sRoute =  bStatic ?
				location.hash.replace(/^[#/]/, "")
				: this._processPath(location.pathname);

		// trigger the UI update logic for the new path
		this.parse(sRoute);
	};

	DocumentationRouter.prototype.attachGlobalLinkHandler = function () {
		if (!this._bGlobalHandlerAttached) {
			document.body.addEventListener("click", this.linkClickHandler.bind(this), true);
			window['sap-ui-documentation-static'] && document.body.addEventListener("mousedown", this.mouseDownClickHandler.bind(this), true);
			this._bGlobalHandlerAttached = true;
		}
	};

	DocumentationRouter.prototype.attachPopstateHandler = function () {
		if (!this._bPopstateHandlerAttached) {
			window.addEventListener('popstate', this.popstateHandler.bind(this));
			this._bPopstateHandlerAttached = true;
		}
	};

	/**
	 * API Reference special route decoder method
	 *
	 * Patterns:
	 * /api/module:sap/base/Log#methods/sap/base/Log.warning
	 * /api/module:sap/base/Log#methods/attachModelContextChange
	 * /api/module:sap/base/Log#methods/sap.ui.base.ManagedObject.create
	 * /api/module:sap/base/Log#methods/Summary
	 * /api/module:sap/base/Log#events/Summary
	 * /api/module:sap/base/Log#events/modelContextChange
	 * /api/module:sap/base/Log#overview
	 * /api/module:sap/base/Log#constructor
	 * /api/module:sap/base/Log#controlProperties
	 * /api/module:sap/base/Log#aggregations
	 * /api/module:sap/base/Log#associations
	 * /api/module:sap/base/Log#specialsettings
	 * /api/module:sap/methods/Debug#methods/sap/methods/Debug.breakpoint
	 * /api/module:sap/methods/Debug#methods/setText
	 * /api/module:sap/events/KeyPress#methods/sap/events/KeyPress.extend
	 *
	 * @param {object} oEvent the event object
	 * @returns {object} Demo Kit custom object
	 * @private
	 */
	DocumentationRouter.prototype._decodeSpecialRouteArguments = function (oEvent) {
		var oArguments = oEvent.getParameters().arguments,
			aEntity = [],
			sMemberType,
			aMember = [],
			aTemp;

		// Case where we have only ID
		if (oArguments.p1 === undefined) {

			// Check if we need to split the ID value
			if (oArguments.id.indexOf(this._URLSeparator) > -1) {
				aTemp = oArguments.id.split(this._URLSeparator);

				// Assign new member values
				oArguments.id = aTemp[0];
				oArguments.p1 = aTemp[1];
			}

			return {
				id: decodeURIComponent(oArguments.id),
				entityId: undefined,
				entityType: oArguments.p1
			};
		}

		// Module links
		if (/^module:\S+$/.test(oArguments.id)) {

			// Convert to array
			Object.keys(oArguments).forEach(function (sKey) {
				var sArgument = oArguments[sKey],
					aTemp;

				if (!sArgument) {
					return;
				}

				if (!sMemberType && sArgument.indexOf(this._URLSeparator) !== -1) {
					aTemp = sArgument.split(this._URLSeparator);
					aEntity.push(aTemp[0]);
					sMemberType = aTemp[1];
					return;
				}

				if (!sMemberType) {
					aEntity.push(sArgument);
				} else {
					aMember.push(sArgument);
				}
			}.bind(this));

			return {
				id: aEntity.join("/"),
				entityId: aMember.length ? aMember.join("/") : undefined,
				entityType: sMemberType
			};

		}

		// Check if we need to split the ID value
		if (oArguments.id.indexOf(this._URLSeparator) !== -1) {
			aTemp = oArguments.id.split(this._URLSeparator);

			// Shift p1 -> p2
			oArguments.p2 = oArguments.p1;

			// Assign new member values
			oArguments.id = aTemp[0];
			oArguments.p1 = aTemp[1];
		}

		// Standard symbol link
		return {
			id: decodeURIComponent(oArguments.id),
			entityType: oArguments.p1,
			entityId: oArguments.p2 ? decodeURIComponent(oArguments.p2) : undefined
		};

	};

	/**
	 * @override
	 */
	DocumentationRouter.prototype.navTo = function (sName, oParameters, bReplace) {
		var sPath;
		var sReplaceMethod = bReplace ? "replaceState" : "pushState";

		this._destroySampleComponent(); // BCP: 1880458601

		// Encoding needed for native routing to work
		if (sName === "apiId") {
			if (oParameters.id) {
				oParameters.id = encodeURIComponent(oParameters.id);
			}
			if (oParameters.entityId) {
				oParameters.entityId = encodeURIComponent(oParameters.entityId);
			}
		}

		sPath = this.getURL(sName, oParameters); // Calculate URL Path

		if (sName === "apiId") {
			sPath = sPath.replace(/#$/, ""); // Remove trailing hash
			sPath = decodeURIComponent(sPath); // no encoding of paths in the APIRef section
		}

		// Parse new path
		this.parse(sPath);

		// Modify URL
		if (window['sap-ui-documentation-static']) {
			window.history[sReplaceMethod]({}, undefined, "#/" + sPath.replace("#", this._URLSeparator));
		} else {
			window.history[sReplaceMethod]({}, undefined, sPath);
		}

		return this;
	};

	if (!window['sap-ui-documentation-static']) {

		DocumentationRouter.prototype._processPath = function (sPath) {
			var oBase = document.querySelector("base[href]"),
				sBase = oBase ? oBase.getAttribute("href") : "",
				sBaseWithoutSlash = sBase.slice(0, sBase.length - 1),
				sHash = location.hash,
				aTemp;

			if (sPath.startsWith(sBase)) {
				sPath = sPath.replace(sBase, "");
			} else if (sPath.startsWith(sBaseWithoutSlash)) {
				sPath = sPath.replace(sBaseWithoutSlash, "");
			}

			if (sHash) {

				// Detect legacy module path - in this case we need to decode the hash
				if (!sPath && sHash.indexOf("module%3A") !== -1) {

					// Transform from: #/api/module%3Asap%2Fbase%2FLog/methods/sap%2Fbase%2FLog.debug
					// to: api/module:sap/base/Log#methods/sap/base/Log.debug
					aTemp = sHash.split("/");
					sHash = "#" +
							aTemp[1] +
							"/" +
							decodeURIComponent(aTemp[2]) +
							(aTemp[3] ? "#" + aTemp[3] : "") +
							(!aTemp[3] ? "/" : "") +
							(aTemp[4] ? "/" + decodeURIComponent(aTemp[4]) : "");
				}

				sPath += (sPath ? "#" : "") + sHash.slice(1);
			}

			return sPath;
		};

		/**
		 * @override
		 */
		DocumentationRouter.prototype.initialize = function () {
			var sPath = this._processPath(location.pathname);

			// stop the hash change listener
			this.stop();

			// do initial routing (if there is a path) - updates the UI according to the config
			this.parse(sPath);

			// attach listener for route changes via the browser back/forward buttons
			this.attachPopstateHandler();

			// Attach link handler
			this.attachGlobalLinkHandler();

			return this;
		};

		DocumentationRouter.prototype.navToChangeUrlOnly = function (oParameters, bHistory) {
			var sPath;

			// Encoding needed for native routing to work
			if (oParameters.id) {
				oParameters.id = encodeURIComponent(oParameters.id);
			}
			if (oParameters.entityId) {
				oParameters.entityId = encodeURIComponent(oParameters.entityId);
			}

			// Calculate URL Path
			sPath = this.getURL("apiId", oParameters);
			sPath = decodeURIComponent(sPath);

			// pushState used to navigate away from legacy URL
			if (bHistory) {
				window.history.pushState({}, undefined, sPath);
			} else {
				window.history.replaceState({}, undefined, sPath);
			}

			return this;
		};

	} else {

		/**
		 * @override
		 */
		DocumentationRouter.prototype.initialize = function () {
			Router.prototype.initialize.apply(this, arguments);

			// attach listener for route changes via the browser back/forward buttons
			this.attachPopstateHandler();

			// Attach link handler
			this.attachGlobalLinkHandler();

			return this;
		};

		DocumentationRouter.prototype.navToChangeUrlOnly = function (oParameters, bHistory) {
			var sPath;

			// Encoding needed for native routing to work
			if (oParameters.id) {
				oParameters.id = encodeURIComponent(oParameters.id);
			}
			if (oParameters.entityId) {
				oParameters.entityId = encodeURIComponent(oParameters.entityId);
			}

			// Calculate URL Path
			sPath = this.getURL("apiId", oParameters);

			sPath = decodeURIComponent(sPath);
			sPath = sPath.replace("#", this._URLSeparator);

			this.stop();
			hasher.stop();

			if (bHistory) {
				hasher.setHash(sPath);
			} else {
				hasher.replaceHash(sPath);
			}

			hasher.init();
			this.initialize(true);
		};

	}

	DocumentationRouter.prototype.shouldConvertHash = function(sTarget) {
		return this.getRoute("apiId").match(sTarget) || this.getRoute("apiSpecialRoute").match(sTarget);
	};

	DocumentationRouter.prototype.convertToStaticFormat = function(sHref) {
		var oLocation = window.location,
			sNewHref = sHref;

		if (this.shouldConvertHash(sHref)) {
			sNewHref = sHref.replace("#", "%23");
		}

		sNewHref = oLocation.origin + oLocation.pathname + "#/" + sNewHref;

		return sNewHref;
	};

	// util
	function getClosestParentLink(oAnchorElement, iMaxDrillUp) {
		var bIsAnchor = isAnchorElement(oAnchorElement), iDrillUp = 0;
		iMaxDrillUp || (iMaxDrillUp = 3);

		while (!bIsAnchor && iDrillUp++ < iMaxDrillUp) {
			oAnchorElement = oAnchorElement.parentElement;
			bIsAnchor = isAnchorElement(oAnchorElement);
		}

		return oAnchorElement;
	}

	function isAnchorElement(oAnchorElement) {
		if (oAnchorElement && oAnchorElement.nodeName === "A" && oAnchorElement.getAttribute("target") !== "_blank") {
			return true;
		}

		return false;
	}

	function getHref(oAnchorElement) {
		return oAnchorElement.getAttribute("href");
	}

	return DocumentationRouter;

});
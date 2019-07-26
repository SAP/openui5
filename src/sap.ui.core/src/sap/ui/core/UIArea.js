/*!
 * ${copyright}
 */

// Provides class sap.ui.core.UIArea
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'./Element',
	'./RenderManager',
	'sap/ui/performance/trace/Interaction',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/util/ActivityDetection",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/performance/Measurement",
	'sap/ui/events/jquery/EventExtension',
	"sap/ui/events/ControlEvents",
	"sap/ui/events/F6Navigation",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/control" // jQuery Plugin "control"
],
	function(
		ManagedObject,
		Element,
		RenderManager,
		Interaction,
		containsOrEquals,
		ActivityDetection,
		KeyCodes,
		Log,
		assert,
		Measurement,
		EventExtension,
		ControlEvents,
		F6Navigation,
		jQuery
	) {
	"use strict";


	EventExtension.apply();

	// Activate F6Navigation
	jQuery(document).on("keydown", function(oEvent) {
		F6Navigation.handleF6GroupNavigation(oEvent, null);
	});

	/**
	 * A private logger instance used for 'debugRendering' logging.
	 *
	 * It can be activated by setting the URL parameter sap-ui-xx-debugRerendering to true.
	 * If activated, stack traces of invalidate() calls will be recorded and if new
	 * invalidations occur during rendering, they will be logged to the console together
	 * with the causing stack traces.
	 *
	 * @private
	 * @todo Add more log output where helpful
	 */
	var oRenderLog = Log.getLogger("sap.ui.Rendering",
			(
				// Note that the sap-ui-config option still is expected in camel case.
				// Lower case is only accepted here because of the config normalization which will be removed in future
				(window["sap-ui-config"] && (window["sap-ui-config"]["xx-debugRendering"] || window["sap-ui-config"]["xx-debugrendering"]) )
				|| /sap-ui-xx-debug(R|-r)endering=(true|x|X)/.test(document.location.search)
			) ? Log.Level.DEBUG : Math.min(Log.Level.INFO, Log.getLevel())
		),
		fnDbgWrap = function(oControl) {
			return oControl;
		},
		fnDbgReport = function() {},
		fnDbgAnalyzeDelta = function() {};

	if ( oRenderLog.isLoggable() ) {

		// TODO this supportability feature could be moved out of the standard runtime code and only be loaded on demand

		/**
		 * Records the stack trace that triggered the first invalidation of the given control
		 *
		 * @private
		 */
		fnDbgWrap = function(oControl) {
			var location;
			try {
				throw new Error();
			} catch (e) {
				location = e.stack || e.stacktrace || (e.sourceURL ? e.sourceURL + ":" + e.line : null);
				location = location ? location.split(/\n\s*/g).slice(2) : undefined;
			}
			return {
				obj : oControl,
				location : location
			};
		};

		/**
		 * Creates a condensed view of the controls for which a rendering task is pending.
		 * Checking the output of this method should help to understand infinite or unexpected rendering loops.
		 * @private
		 */
		fnDbgReport = function(that, mControls) {
			var oCore = sap.ui.getCore(),
				mReport = {},
				n, oControl;

			for (n in mControls) {
				// resolve oControl anew as it might have changed
				oControl = oCore.byId(n);
				/*eslint-disable no-nested-ternary */
				mReport[n] = {
					type: oControl ? oControl.getMetadata().getName() : (mControls[n].obj === that ? "UIArea" : "(no such control)"),
					location: mControls[n].location,
					reason : mControls[n].reason
				};
				/*eslint-enable no-nested-ternary */
			}

			oRenderLog.debug("  UIArea '" + that.getId() + "', pending updates: " + JSON.stringify(mReport, null, "\t"));
		};

		/**
		 * Creates a condensed view of the controls that have been invalidated but not handled during rendering
		 * Checking the output of this method should help to understand infinite or unexpected rendering loops.
		 * @private
		 */
		fnDbgAnalyzeDelta = function(mBefore, mAfter) {
			var n;

			for (n in mAfter) {
				if ( mBefore[n] != null ) {
					if ( mBefore[n].obj !== mAfter[n].obj ) {
						mAfter[n].reason = "replaced during rendering";
					} else {
						mAfter[n].reason = "invalidated again during rendering";
					}
				} else {
					mAfter[n].reason = "invalidated during rendering";
				}
			}

		};

	}

	/**
	 * @class An area in a page that hosts a tree of UI elements.
	 *
	 * <code>UIArea</code>s are fully managed by the UI5 {@link sap.ui.core.Core Core}. They cannot be created
	 * by the application but are implicitly created by the Core when controls are placed via
	 * {@link sap.ui.core.Control#placeAt Control#placeAt} at a new DOM element for which no <code>UIArea</code>
	 * exists yet.
	 *
	 * <code>UIArea</code>s are essential for the rendering of controls. Controls get rendered only when they are
	 * directly or indirectly contained in the <code>content</code> aggregation of a <code>UIArea</code>.
	 * <code>Control#placeAt</code> ensures that there is a <code>UIArea</code> with the given ID and adds
	 * the control to the <code>content</code> aggregation of this <code>UIArea</code>. Whenever controls become
	 * invalidated, the corresponding <code>UIArea</code> remembers this and takes care of the re-rendering of
	 * the control.
	 *
	 * Additionally, <code>UIArea</code>s play an important role in the event handling of controls. They register for
	 * a standard set of browser events. For each incoming event, they identify the control to which the target of
	 * the event belongs to and dispatch the event to that control. This dispatching reduces the number of event
	 * handlers in a page.
	 *
	 * <code>UIArea</code>s also act as a data binding root for their contained controls. Whenever a model is attached
	 * to or detached from the Core, this change is propagated to all <code>UIAreas</code> which in turn propagate
	 * it further down to their aggregated children, etc.
	 *
	 * The special aggregation named <code>dependents</code> also participates in the databinding, but its content
	 * is not rendered by the <code>UIArea</code>. It can be used for popups or similar controls that are not contained
	 * in the normal control tree, but nevertheless should receive model or binding context updates.
	 *
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @param {sap.ui.core.Core} oCore internal API of the <core>Core</code> that manages this UIArea
	 * @param {object} [oRootNode] reference to the DOM element that should be 'hosting' the UI Area.
	 * @public
	 * @alias sap.ui.core.UIArea
	 * @hideconstructor
	 */
	var UIArea = ManagedObject.extend("sap.ui.core.UIArea", {

		constructor: function(oCore, oRootNode) {
			if (arguments.length === 0) {
				return;
			}

			// Note: UIArea has a modifiable Id. This doesn't perfectly match the default behavior of ManagedObject
			// But UIArea overrides getId().
			ManagedObject.apply(this);

			//TODO we could get rid of oCore here, if we wanted to...
			this.oCore = oCore;
			this.bLocked = false;
			this.bInitial = true;
			this.aContentToRemove = [];

			this.bNeedsRerendering = false;
			if (oRootNode != null) {
				this.setRootNode(oRootNode);
				// Figure out whether UI Area is pre-rendered (server-side JS rendering)!
				this.bNeedsRerendering = this.bNeedsRerendering && !((oRootNode.id + "-Init" ? window.document.getElementById(oRootNode.id + "-Init") : null));
			}
			this.mInvalidatedControls = {};

			if (!this.bNeedsRerendering) {
				this.bRenderSelf = false;
			} else {
				// Core needs to be notified about an invalid UIArea
				this.oCore.addInvalidatedUIArea(this);
			}

		},
		metadata: {
			// ---- object ----
			publicMethods : ["setRootNode", "getRootNode", "setRootControl", "getRootControl", "lock","unlock", "isLocked"],
			aggregations : {
				/**
				 * Content that is displayed in the UIArea.
				 */
				content : {name : "content", type : "sap.ui.core.Control", multiple : true, singularName : "content"},

				/**
				 * Dependent objects whose lifecycle is bound to the UIArea but which are not automatically rendered by the UIArea.
				 */
				dependents : {name : "dependents", type : "sap.ui.core.Control", multiple : true}
			}
		}
	});

	/**
	 * Returns whether rerendering is currently suppressed on this UIArea
	 * @return boolean
	 * @protected
	 */
	UIArea.prototype.isInvalidateSuppressed = function() {
		return this.iSuppressInvalidate > 0;
	};

	/**
	 * Returns this <code>UIArea</code>'s id (as determined from provided RootNode).
	 * @return {string|null} id of this UIArea
	 * @public
	 */
	UIArea.prototype.getId = function() {
		return this.oRootNode ? this.oRootNode.id : null;
	};

	/**
	 * Returns this UI area. Needed to stop recursive calls from an element to its parent.
	 *
	 * @return {sap.ui.core.UIArea} this
	 * @protected
	 */
	UIArea.prototype.getUIArea = function() {
		return this;
	};

	/**
	 * Allows setting the root node hosting this instance of <code>UIArea</code>.
	 *
	 * The node must have an ID that will be used as ID for this instance of <code>UIArea</code>.
	 *
	 * @param {object}
	 *            oRootNode the hosting DOM node for this instance of <code>UIArea</code>.
	 * @public
	 */
	UIArea.prototype.setRootNode = function(oRootNode) {
		if (this.oRootNode === oRootNode) {
			return;
		}

		// oRootNode must either be empty or must be a DOMElement and must not be root node of some other UIArea
		assert(!oRootNode || (oRootNode.nodeType === 1 && !jQuery(oRootNode).attr("data-sap-ui-area")), "UIArea root node must be a DOMElement");

		//TODO IS there something missing
		if (this.oRootNode) {
			this._ondetach();
		}

		this.oRootNode = oRootNode;
		if ( this.getContent().length > 0 ) {
		  this.invalidate();
		}

		if (this.oRootNode) {
			// prepare eventing
			this._onattach();
		}
	};

	/**
	 * Returns the Root Node hosting this instance of <code>UIArea</code>.
	 *
	 * @return {Element} the Root Node hosting this instance of <code>UIArea</code>.
	 * @public
	 */
	UIArea.prototype.getRootNode = function() {
		return this.oRootNode;
	};

	/**
	 * Sets the root control to be displayed in this UIArea.
	 *
	 * First, all old content controls (if any) will be detached from this UIArea (e.g. their parent
	 * relationship to this UIArea will be cut off). Then the parent relationship for the new
	 * content control (if not empty) will be set to this UIArea and finally, the UIArea will
	 * be marked for re-rendering.
	 *
	 * The real re-rendering happens whenever the re-rendering is called. Either implicitly
	 * at the end of any control event or by calling sap.ui.getCore().applyChanges().
	 *
	 * @param {sap.ui.base.Interface | sap.ui.core.Control}
	 *            oRootControl the Control that should be the Root for this <code>UIArea</code>.
	 * @public
	 * @deprecated As of version 1.1, use {@link #removeAllContent} and {@link #addContent} instead
	 */
	UIArea.prototype.setRootControl = function(oRootControl) {
		this.removeAllContent();
		this.addContent(oRootControl);
	};

	/**
	 * Returns the content control of this <code>UIArea</code> at the specified index.
	 * If no index is given the first content control is returned.
	 *
	 * @param {int} idx index of the control in the content of this <code>UIArea</code>
	 * @return {sap.ui.core.Control} the content control of this <code>UIArea</code> at the specified index.
	 * @public
	 * @deprecated As of version 1.1, use function {@link #getContent} instead
	 */
	UIArea.prototype.getRootControl = function(idx) {
		var aContent = this.getContent();
		if (aContent.length > 0) {
			if (idx >= 0 && idx < aContent.length) {
				return aContent[idx];
			}
			return aContent[0];
		}
		return null;
	};

	UIArea.prototype._addRemovedContent = function(oDomRef) {
		if (this.oRootNode && oDomRef) {
			this.aContentToRemove.push(oDomRef);
		}
	};

	/*
	 * See generated JSDoc
	 */
	UIArea.prototype.addContent = function(oContent, _bSuppressInvalidate) {
		this.addAggregation("content", oContent, _bSuppressInvalidate);
		// TODO this remains here just to make the UX3 Shell work which doesn't invalidate properly
		if ( _bSuppressInvalidate !== true ) {
			this.invalidate();
		}
		return this;
	};

	/*
	 * See generated JSDoc
	 */
	UIArea.prototype.removeContent = function(vContent, /* internal only */ _bSuppressInvalidate) {
		var oContent = this.removeAggregation("content", vContent, _bSuppressInvalidate);
		if ( !_bSuppressInvalidate ) {
			var oDomRef;
			if (oContent && oContent.getDomRef) {
				oDomRef = oContent.getDomRef();
			}
			this._addRemovedContent(oDomRef);
			//this.invalidate();
		}
		return oContent;
	};

	/*
	 * See generated JSDoc
	 */
	UIArea.prototype.removeAllContent = function() {
		var aContent = this.removeAllAggregation("content");
		for (var idx = 0; idx < aContent.length; idx++) {
			var oDomRef;
			var oContent = aContent[idx];
			if (oContent && oContent.getDomRef) {
				oDomRef = oContent.getDomRef();
			}
			this._addRemovedContent(oDomRef);
		}
		//this.invalidate();
		return aContent;
	};

	/*
	 * See generated JSDoc
	 */
	UIArea.prototype.destroyContent = function() {
		var aContent = this.getContent();
		for (var idx = 0; idx < aContent.length; idx++) {
			var oDomRef;
			var oContent = aContent[idx];
			if (oContent && oContent.getDomRef) {
				oDomRef = oContent.getDomRef();
			}
			this._addRemovedContent(oDomRef);
		}
		this.destroyAggregation("content");
		//this.invalidate();
		return this;
	};

	/**
	 * Locks this instance of UIArea.
	 *
	 * Rerendering and eventing will not be active as long as no
	 * {@link #unlock} is called.
	 *
	 * @public
	 */
	UIArea.prototype.lock = function() {
		this.bLocked = true;
	};

	/**
	 * Un-Locks this instance of UIArea.
	 *
	 * Rerendering and eventing will now be enabled again.
	 *
	 * @public
	 */
	UIArea.prototype.unlock = function() {
		if ( this.bLocked && this.bNeedsRerendering ) {
			// While being locked, we might have ignored a call to rerender()
			// Therefore notify the Core (again)
			this.oCore.addInvalidatedUIArea(this);
		}
		this.bLocked = false;
	};

	/**
	 * Returns the locked state of the <code>sap.ui.core.UIArea</code>
	 * @return {boolean} locked state
	 * @public
	 */
	UIArea.prototype.isLocked = function () {
		return this.bLocked;
	};

	/**
	 * Provide getBindingContext, as UIArea can be parent of an element.
	 * @return {null} Always returns null.
	 *
	 * @protected
	 */
	UIArea.prototype.getBindingContext = function(){
		return null;
	};

	/**
	 * Returns the Core's event provider as new eventing parent to enable control event bubbling to the core
	 * to ensure compatibility with the core validation events.
	 *
	 * @return {sap.ui.base.EventProvider} the parent event provider
	 * @protected
	 */
	UIArea.prototype.getEventingParent = function() {
		return this.oCore._getEventProvider();
	};

	// ###########################################################################
	// Convenience for methods
	// e.g. Process Events for inner Controls
	// or figure out whether control is part of this area.
	// ###########################################################################

	/**
	 * Checks whether the control is still valid (is in the DOM)
	 *
	 * @return {boolean} True if the control is still in the active DOM
	 * @protected
	 */
	UIArea.prototype.isActive = function() {
		return ((this.getId() ? window.document.getElementById(this.getId()) : null)) != null;
	};

	/**
	 * Triggers asynchronous re-rendering of the <code>UIArea</code>'s content.
	 *
	 * Serves as an end-point for the bubbling of invalidation requests along the
	 * element/control aggregation hierarchy.
	 *
	 * @protected
	 */
	UIArea.prototype.invalidate = function() {
		this.addInvalidatedControl(this);
	};

	/**
	 * Notifies the <code>UIArea</code> about an invalidated descendant control.
	 *
	 * During re-rendering, the <code>UIArea</code> internally decides whether to re-render just the modified
	 * controls or the complete content. It also informs the <code>Core</code> when it becomes invalid
	 * for the first time.
	 *
	 * @param {object} oControl Descendant control that got invalidated
	 * @private
	 */
	UIArea.prototype.addInvalidatedControl = function(oControl){
		// if UIArea is already marked for a full rendering, there is no need to record invalidated controls
		if ( this.bRenderSelf ) {
			return;
		}

		// inform the Core, if we are getting invalid now
		if ( !this.bNeedsRerendering ) {
			this.oCore.addInvalidatedUIArea(this);
		}

		var sId = oControl.getId();
		//check whether the control is already invalidated
		if ( oControl === this ) {
			this.bRenderSelf = true; //everything in this UIArea
			this.bNeedsRerendering = true;
			this.mInvalidatedControls = {};
			this.mInvalidatedControls[sId] = fnDbgWrap(this);
			return;
		}
		if (this.mInvalidatedControls[sId]) {
			return;
		}
		if (!this.bRenderSelf) {
			//add it to the list of controls
			this.mInvalidatedControls[sId] = fnDbgWrap(oControl);

			this.bNeedsRerendering = true;
		}
	};

	/**
	 * Synchronously renders any pending UI updates.
	 *
	 * Either renders the whole <code>UIArea</code> or a set of descendant controls that have been invalidated.
	 *
	 * @param {boolean} force Whether a re-rendering of the <code>UIArea</code> should be enforced
	 * @return {boolean} Whether a redraw was necessary or not
	 * @private
	 */
	UIArea.prototype.rerender = function(force){
		var that = this;

		function clearRenderingInfo() {
			that.bRenderSelf = false;
			that.aContentToRemove = [];
			that.mInvalidatedControls = {};
			that.bNeedsRerendering = false;
		}

		// at least IE9 can fail with a runtime error when accessing activeElement from within an iframe
		function activeElement() {
			try {
				return document.activeElement;
			} catch (err) {
				// return undefined; -- also satisfies eslint check for empty block
			}
		}

		if (force) {
			this.bNeedsRerendering = true;
		}
		if ( this.bLocked || !this.bNeedsRerendering ) {
			return false;
		}

		// Keep a reference to the collected rendering info and attach a new, empty info to this instance.
		// Any concurrent modification will be collected as new info and trigger a new automated rendering
		var bRenderSelf = this.bRenderSelf,
			aContentToRemove = this.aContentToRemove,
			mInvalidatedControls = this.mInvalidatedControls,
			bUpdated = false;

		clearRenderingInfo();

		// pause performance measurement for all UI Areas
		Measurement.pause("renderPendingUIUpdates");
		// start performance measurement
		Measurement.start(this.getId() + "---rerender","Rerendering of " + this.getMetadata().getName());

		fnDbgReport(this, mInvalidatedControls);

		if (bRenderSelf) { // full UIArea rendering

			if (this.oRootNode) {

				oRenderLog.debug("Full Rendering of UIArea '" + this.getId() + "'");

				// save old content
				RenderManager.preserveContent(this.oRootNode, /* bPreserveRoot */ false, /* bPreserveNodesWithId */ this.bInitial);
				this.bInitial = false;

				var cleanUpDom = function(aCtnt, bCtrls){
					var len = aCtnt.length;
					var oDomRef;
					for (var i = 0; i < len; i++) {
						oDomRef = bCtrls ? aCtnt[i].getDomRef() : aCtnt[i];
						if ( oDomRef && !RenderManager.isPreservedContent(oDomRef) && that.oRootNode === oDomRef.parentNode) {
							jQuery(oDomRef).remove();
						}
					}
					return len;
				};

				var oFocusRef_Initial = activeElement();
				var oStoredFocusInfo = this.oCore.oFocusHandler.getControlFocusInfo();

				//First remove the old Dom nodes and then render the controls again
				cleanUpDom(aContentToRemove);

				var aContent = this.getContent();
				var len = cleanUpDom(aContent, true);

				var oFocusRef_AfterCleanup = activeElement();

				for (var i = 0; i < len; i++) {
					if (aContent[i] && aContent[i].getParent() === this) {
						this.oCore.oRenderManager.render(aContent[i], this.oRootNode, true);
					}
				}
				bUpdated = true;

				/* Try restoring focus when focus ref is changed due to cleanup operations and not changed anymore by the rendering logic */
				if (oFocusRef_Initial && oFocusRef_Initial != oFocusRef_AfterCleanup && oFocusRef_AfterCleanup === activeElement()) {
					try {
						this.oCore.oFocusHandler.restoreFocus(oStoredFocusInfo);
					} catch (e) {
						Log.warning("Problems while restoring the focus after full UIArea rendering: " + e, null, this);
					}
				}

			} else {

				// cannot re-render now; wait!
				oRenderLog.debug("Full Rendering of UIArea '" + this.getId() + "' postponed, no root node");

			}

		} else { // only partial update (invalidated controls)

			var isRenderedTogetherWithAncestor = function(oCandidate) {

				for (;;) {

					// Controls that implement marker interface sap.ui.core.PopupInterface are by contract not rendered by their parent.
					// Therefore the search for to-be-rendered ancestors must be stopped when such a control is reached.
					if ( oCandidate.getMetadata && oCandidate.getMetadata().isInstanceOf("sap.ui.core.PopupInterface") ) {
						break;
					}

					oCandidate = oCandidate.getParent();

					// If the candidate is null/undefined or the UIArea itself
					// they do-while loop will be interrupted
					if ( !oCandidate || oCandidate === that ) {
						return false;
					}

					// If the candidate is listed in the invalidated controls map
					// it will be re-rendered together with the UIArea. Inline
					// templates are a special case because they share their ID
					// with the UIArea and therefore the detection will ignore
					// the inline templates since they should be re-rendered with
					// their UIArea.
					if ( mInvalidatedControls.hasOwnProperty(oCandidate.getId()) ) {
						return true;
					}

				}

			};

			for (var n in mInvalidatedControls) {
				var oControl = this.oCore.byId(n);
				// CSN 0000834961 2011: control may have been destroyed since invalidation happened -> check whether it still exists
				if ( oControl && !isRenderedTogetherWithAncestor(oControl) ) {
					oControl.rerender();
					bUpdated = true;
				}
			}

		}

		// enrich the bookkeeping
		fnDbgAnalyzeDelta(mInvalidatedControls, this.mInvalidatedControls);

		// uncomment the following line for old behavior:
		// clearRenderingInfo();

		// end performance measurement
		Measurement.end(this.getId() + "---rerender");
		// resume performance measurement for all UI Areas
		Measurement.resume("renderPendingUIUpdates");

		return bUpdated;

	};

	/**
	 * Receives a notification from the RenderManager immediately after a control has been rendered.
	 *
	 * Only at that moment, registered invalidations are obsolete. If they happen (again) after
	 * that point in time, the previous rendering cannot reflect the changes that led to the
	 * invalidation and therefore a new rendering is required.
	 *
	 * Therefore, pending invalidations can only be cleared at this point in time.
	 * @private
	 */
	UIArea.prototype._onControlRendered = function(oControl) {
		var sId = oControl.getId();
		if ( this.mInvalidatedControls[sId] ) {
			delete this.mInvalidatedControls[sId];
		}
	};

	/**
	 * Rerenders the given control
	 * @see sap.ui.core.Control.rerender()
	 * @param oControl
	 * @private
	 */
	UIArea.rerenderControl = function(oControl){
		var oDomRef = null;
		if (oControl) {
			oDomRef = oControl.getDomRef();
			if (!oDomRef || RenderManager.isPreservedContent(oDomRef) ) {
				// In case no old DOM node was found or only preserved DOM, search for an 'invisible' placeholder
				oDomRef = (RenderManager.RenderPrefixes.Invisible + oControl.getId() ? window.document.getElementById(RenderManager.RenderPrefixes.Invisible + oControl.getId()) : null);
			}
		}

		var oParentDomRef = oDomRef && oDomRef.parentNode; // remember parent here as preserveContent() might move the node!
		if (oParentDomRef) {
			var uiArea = oControl.getUIArea();
			var rm = uiArea ? uiArea.oCore.oRenderManager : sap.ui.getCore().createRenderManager();
			oRenderLog.debug("Rerender Control '" + oControl.getId() + "'" + (uiArea ? "" : " (using a temp. RenderManager)"));
			RenderManager.preserveContent(oDomRef, /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false, oControl /* oControlBeforeRerender */);
			rm.render(oControl, oParentDomRef);
		} else {
			var uiArea = oControl.getUIArea();
			uiArea && uiArea._onControlRendered(oControl);
			oRenderLog.warning("Couldn't rerender '" + oControl.getId() + "', as its DOM location couldn't be determined");
		}
	};

	var rEvents = /^(mousedown|mouseup|click|keydown|keyup|keypress|touchstart|touchend|tap)$/;
	var aPreprocessors = [], aPostprocessors = [];
	var mVerboseEvents = {mousemove: 1, mouseover: 1, mouseout: 1, scroll: 1, dragover: 1, dragenter: 1, dragleave: 1};

	/**
	 * Adds an event handler that will be executed before the event is dispatched.
	 * @param {Function} fnPreprocessor The event handler to add
	 * @private
	 */
	UIArea.addEventPreprocessor = function(fnPreprocessor) {
		aPreprocessors.push(fnPreprocessor);
	};

	/**
	 * Gets the event handlers that will be executed before the event is dispatched.
	 * @return {Function[]} The event preprocessors
	 * @private
	 */
	UIArea.getEventPreprocessors = function() {
		return aPreprocessors;
	};

	/**
	 * Adds an event handler that will be executed after the event is dispatched.
	 * @param {Function} fnPostprocessor The event handler to add
	 * @private
	 */
	UIArea.addEventPostprocessor = function(fnPostprocessor) {
		aPostprocessors.push(fnPostprocessor);
	};

	/**
	 * Gets the event handlers that will be executed after the event is dispatched.
	 * @return {Function[]} The event postprocessors
	 * @private
	 */
	UIArea.getEventPostprocessors = function() {
		return aPostprocessors;
	};

	/**
	 * Enabled or disables logging of certain event types.
	 *
	 * The event handling code of class UIArea logs all processed browser events with log level DEBUG.
	 * Only some events that occur too frequently are suppressed by default: <code>mousemove</code>,
	 * <code>mouseover</code>, <code>mouseout</code>, <code>scroll</code>, <code>dragover</code>,
	 * <code>dragenter</code> and <code>dragleave</code>.
	 *
	 * With this method, logging can be disabled for further event types or it can be enabled for
	 * some or all of the event types listed above. The parameter <code>mEventTypes</code> is a map
	 * of boolean values keyed by event type names. When the value for an event type coerces to true,
	 * events of that type won't be logged.
	 *
	 * @example
	 * sap.ui.require(['sap/ui/core/UIArea'], function(UIArea) {
	 *   UIArea.configureEventLogging({
	 *     mouseout: false,  // no longer suppress logging of mouseout events
	 *     focusin: 1        // suppress logging of focusin events
	 *   });
	 * });
	 *
	 * @param {object} [mEventTypes] Map of logging flags keyed by event types
	 * @returns {object} A copy of the resulting event logging configuration (not normalized)
	 * @public
	 * @since 1.62
	 */
	UIArea.configureEventLogging = function(mEventTypes) {
		Object.assign(mVerboseEvents, mEventTypes);
		return Object.assign({}, mVerboseEvents); // return a copy
	};

	/**
	 * Handles all incoming DOM events centrally and dispatches the event to the
	 * registered event handlers.
	 * @param {jQuery.Event} oEvent the jQuery event object
	 * @private
	 */
	UIArea.prototype._handleEvent = function(/**event*/oEvent) {
		// execute the registered event handlers
		var oTargetElement,
			oElement,
			bInteractionRelevant;

		// TODO: this should be the 'lowest' SAPUI5 Control of this very
		// UIArea instance's scope -> nesting scenario
		oTargetElement = oElement = jQuery(oEvent.target).control(0);

		ActivityDetection.refresh();

		if (oTargetElement == null) {
			return;
		}

		// the mouse event which is fired by mobile browser with a certain delay after touch event should be suppressed
		// in event delegation.
		if (oEvent.isMarked("delayedMouseEvent")) {
			return;
		}


		var sHandledUIAreaId = oEvent.getMark("handledByUIArea"),
			sId = this.getId();

		//if event is already handled by inner UIArea (as we use the bubbling phase now), returns.
		//if capturing phase would be used, here means event is already handled by outer UIArea.
		if (sHandledUIAreaId && sHandledUIAreaId !== sId) {
			oEvent.setMark("firstUIArea", false);
			return;
		}

		oEvent.setMarked("firstUIArea");

		// store the element on the event (aligned with jQuery syntax)
		oEvent.srcControl = oTargetElement;

		// in case of CRTL+SHIFT+ALT the contextmenu event should not be dispatched
		// to allow to display the browsers context menu
		if (oEvent.type === "contextmenu" && oEvent.shiftKey && oEvent.altKey && !!(oEvent.metaKey || oEvent.ctrlKey)) {
			Log.info("Suppressed forwarding the contextmenu event as control event because CTRL+SHIFT+ALT is pressed!");
			return;
		}

		aPreprocessors.forEach(function(fnPreprocessor){
			fnPreprocessor(oEvent);
		});

		// forward the control event:
		// if the control propagation has been stopped or the default should be
		// prevented then do not forward the control event.
		this.oCore._handleControlEvent(oEvent, sId);

		// if the UIArea or the Core is locked then we do not dispatch
		// any event to the control => but they will still be dispatched
		// as control event afterwards!
		if (this.bLocked || this.oCore.isLocked()) {
			return;
		}

		// notify interaction tracing for relevant event - it is important to have evaluated all the previous switches
		// in case the method would return before dispatching the event, we should not notify an event start
		if (Interaction.getActive()) {
			bInteractionRelevant = oEvent.type.match(rEvents);
			if (bInteractionRelevant) {
				Interaction.notifyEventStart(oEvent);
			}
		}

		// retrieve the pseudo event types
		var aEventTypes = [];
		if (oEvent.getPseudoTypes) {
			aEventTypes = oEvent.getPseudoTypes();
		}
		aEventTypes.push(oEvent.type);

		//enable check for fieldgroup change
		var bGroupChanged = false;

		// dispatch the event to the controls (callback methods: onXXX)
		while (oElement instanceof Element && oElement.isActive() && !oEvent.isPropagationStopped()) {

			// for each event type call the callback method
			// if the execution should be stopped immediately
			// then no further callback method will be executed
			for (var i = 0, is = aEventTypes.length; i < is; i++) {
				var sType = aEventTypes[i];
				oEvent.type = sType;
				// ensure currenTarget is the DomRef of the handling Control
				oEvent.currentTarget = oElement.getDomRef();
				oElement._handleEvent(oEvent);
				if (oEvent.isImmediatePropagationStopped()) {
					break;
				}
			}
			if (!bGroupChanged && !oEvent.isMarked("enterKeyConsumedAsContent")) {
				bGroupChanged = this._handleGroupChange(oEvent,oElement);
			}

			// if the propagation is stopped do not bubble up further
			if (oEvent.isPropagationStopped()) {
				break;
			}

			// Secret property on the element to allow to cancel bubbling of all events.
			// This is a very special case, so there is no API method for this in the control.
			if (oElement.bStopEventBubbling) {
				break;
			}

			// This is the (not that common) situation that the element was deleted in its own event handler.
			// i.e. the Element became 'inactive' (see Element#isActive())
			var oDomRef = oElement.getDomRef();
			if (!oDomRef) {
				break;
			}

			// bubble up to the parent
			oDomRef = oDomRef.parentNode;
			oElement = null;

			// Only process the touchend event which is emulated from mouseout event when the current domRef
			// doesn't equal or contain the relatedTarget
			if (oEvent.isMarked("fromMouseout") && containsOrEquals(oDomRef, oEvent.relatedTarget)) {
				break;
			}

			// ensure we do not bubble the control tree higher than our rootNode
			while (oDomRef && oDomRef !== this.getRootNode()) {
				if (oDomRef.id) {
					oElement = jQuery(oDomRef).control(0);
					if (oElement) {
						break;
					}
				}
				oDomRef = oDomRef.parentNode;
			}
		}

		aPostprocessors.forEach(function(fnPostprocessor){
			fnPostprocessor(oEvent);
		});

		if (bInteractionRelevant) {
			Interaction.notifyEventEnd(oEvent);
		}

		// reset previously changed currentTarget
		oEvent.currentTarget = this.getRootNode();

		// mark on the event that it's already handled by this UIArea
		oEvent.setMark("handledByUIArea", sId);

		// TODO: rethink about logging levels!

		// logging: propagation stopped
		if (oEvent.isPropagationStopped()) {
			Log.debug("'" + oEvent.type + "' propagation has been stopped");
		}

		// logging: prevent the logging of some events that are verbose and for others do some logging into the console
		var sEventName = oEvent.type;
		if (!mVerboseEvents[sEventName]) {
			if (oTargetElement) {
				Log.debug("Event fired: '" + sEventName + "' on " + oTargetElement, "", "sap.ui.core.UIArea");
			} else {
				Log.debug("Event fired: '" + sEventName + "'", "", "sap.ui.core.UIArea");
			}
		}

	};

	/*
	* The onattach function is called when the Element is attached to the DOM
	* @private
	*/
	UIArea.prototype._onattach = function() {

	// TODO optimizations for 'matching event list' could be done here.
	//	// create the events string (space separated list of event names):
	//	// the first time a control is attached - it will determine the required
	//	// events and store this information in the controls metadata which is
	//	// shared across the control instances.
	//	if (!this.getMetadata().sEvents) {
	//
	//		// shorten the access to the array of events and pseudo events
	//		var aEv = jQuery.sap.ControlEvents;
	//		var oPsEv = jQuery.sap.PseudoEvents;
	//
	//		// create the data structures for the event handler registration
	//		this.sEvents = "";
	//		var aEvents = [];
	//
	//		// check for pseudo events and register them for their relevant types
	//		for (var evt in oPsEv) {
	//				for (j = 0, js = oPsEv[evt].aTypes.length; j < js; j++) {
	//					var type = oPsEv[evt].aTypes[j];
	//					if (aEvents.indexOf(type) === -1) {
	//						aEvents.push(type);
	//					}
	//				}
	//		}
	//
	//		// check for events and register them
	//		for (var i = 0, is = aEv.length; i < is; i++) {
	//			var type = aEv[i];
	//				if (aEvents.indexOf(type) === -1) {
	//					aEvents.push(type);
	//				}
	//		}
	//
	//		// keep the list of events for the jQuery bind/unbind method
	//		this.sEvents = aEvents.join(" ");
	//
	//		// cache the event handlers registry map
	//		this.getMetadata().sEvents = this.sEvents;
	//
	//	} else {
	//		// use the cached map of event handlers
	//		this.sEvents = this.getMetadata().sEvents;
	//	}

		// check for existing root node
		var oDomRef = this.getRootNode();
		if (oDomRef == null) {
			return;
		}

		// mark the DOM as UIArea and bind the required events
		jQuery(oDomRef).attr("data-sap-ui-area", oDomRef.id).bind(ControlEvents.events.join(" "), this._handleEvent.bind(this));

	};

	/**
	* The ondetach function is called when the Element is detached out of the DOM
	* @private
	*/
	UIArea.prototype._ondetach = function() {

		// check for existing root node
		var oDomRef = this.getRootNode();
		if (oDomRef == null) {
			return;
		}

		// remove UIArea marker and unregister all event handlers of the control
		jQuery(oDomRef).removeAttr("data-sap-ui-area").unbind();

		// TODO: when optimizing the events => take care to unbind only the
		//       required. additionally consider not to remove other event handlers.
	//	var ojQRef = jQuery(oDomRef);
	//	if (this.sEvents) {
	//		ojQRef.unbind(this.sEvents, this._handleEvent);
	//	}
	//
	//	var oFH = this.oCore.oFocusHandler;
	//	ojQRef.unbind("focus",oFH.onfocusin);
	//	ojQRef.unbind("blur", oFH.onfocusout);

	};

	/**
	 * UIAreas can't be cloned and throw an error when trying to do so.
	 */
	UIArea.prototype.clone = function() {
		throw new Error("UIArea can't be cloned");
	};

	/**
	 * Handles field group change or validation based on the given browser event.
	 *
	 * Triggers the <code>changeGroup</code> event (with reason: validate) for current field group control.
	 *
	 * @param {jQuery.Event} oEvent Browser event
	 * @param {sap.ui.core.Element} oElement UI5 <code>Element</code> where the event occurred
	 *
	 * @return {boolean} true if the field group control was set or validated.
	 *
	 * @private
	 */
	UIArea.prototype._handleGroupChange = function(oEvent, oElement) {
		var oKey = UIArea._oFieldGroupValidationKey;
		if (oEvent.type === "focusin") {
			// delay the check for a field group change to allow focus forwarding and resetting focus after selection
			if (UIArea._iFieldGroupDelayTimer) {
				clearTimeout(UIArea._iFieldGroupDelayTimer);
				UIArea._iFieldGroupDelayTimer = null;
			}
			UIArea._iFieldGroupDelayTimer = setTimeout(this.setFieldGroupControl.bind(this, oElement), 0);
			return true; //no further checks because setFieldGroupControl already looked for a group id and fired the enter and leave events that bubble
		} else if (this.getFieldGroupControl() &&
				oEvent.type === "keyup" &&
				oEvent.keyCode === oKey.keyCode &&
				oEvent.shiftKey === oKey.shiftKey &&
				oEvent.altKey === oKey.altKey &&
				oEvent.ctrlKey === oKey.ctrlKey) {
			// check for field group change (validate) only after events where processed by elements
			if (UIArea._iFieldGroupTriggerDelay) {
				clearTimeout(UIArea._iFieldGroupTriggerDelay);
			}
			var oCurrentControl = this.getFieldGroupControl(),
				aCurrentGroupIds = (oCurrentControl ? oCurrentControl._getFieldGroupIds() : []);
			if (aCurrentGroupIds.length > 0) {
				oCurrentControl.triggerValidateFieldGroup(aCurrentGroupIds);
			}
			return true; //no further checks because setFieldGroupControl already looked for a group id and fired the enter and leave events that bubble
		}
		return false;
	};

	/**
	 * Sets the field group control and triggers the validateFieldGroup event for
	 * the current field group control.
	 * There is only one field group control for all UI areas.
	 *
	 * @param {sap.ui.core.Element} oElement the new field group control
	 *
	 * @return {sap.ui.core.UIArea} the UI area that the active field group control belongs to.
	 *
	 * @private
	 */
	UIArea.prototype.setFieldGroupControl = function(oElement) {

		var oControl = oElement;
		while ( oControl  && !(oControl instanceof Element && oControl.isA("sap.ui.core.Control")) ) {
			oControl = oControl.getParent();
		}

		var oCurrentControl = this.getFieldGroupControl();
		if ( oControl != oCurrentControl ) {
			var aCurrentGroupIds = (oCurrentControl ? oCurrentControl._getFieldGroupIds() : []),
				aNewGroupIds = (oControl ? oControl._getFieldGroupIds() : []),
				aTargetFieldGroupIds = aCurrentGroupIds.filter(function(sCurrentGroupId) {
					return aNewGroupIds.indexOf(sCurrentGroupId) < 0;
				});
			if (aTargetFieldGroupIds.length > 0) {
				oCurrentControl.triggerValidateFieldGroup(aTargetFieldGroupIds);
			}
			UIArea._oFieldGroupControl = oControl;
		}
		return this;
	};

	/**
	 * Returns the current valid field group control.
	 * There is only one field group control for all UI areas.
	 *
	 * @return {sap.ui.core.Control} the current valid field group control or null.
	 *
	 * @private
	 */
	UIArea.prototype.getFieldGroupControl = function() {
		if (UIArea._oFieldGroupControl && !UIArea._oFieldGroupControl.bIsDestroyed) {
			return UIArea._oFieldGroupControl;
		}
		return null;
	};

	// field group static members

	/*
	 * Group control for all UI areas to handle change of field groups
	 * @private
	 */
	UIArea._oFieldGroupControl = null;

	/*
	 * delay timer for triggering field group changes if focus is forwarded or temporarily dispatched by selection
	 * @private
	 */
	UIArea._iFieldGroupDelayTimer = null;

	/*
	 * Keycode and modifier combination that is used to fire a change group event (reason: validate)
	 * @private
	 */
	UIArea._oFieldGroupValidationKey = {
		keyCode : KeyCodes.ENTER,
		shiftKey : false,
		altKey: false,
		ctrlKey: false
	};

	// share the render log with Core
	UIArea._oRenderLog = oRenderLog;

	return UIArea;

});
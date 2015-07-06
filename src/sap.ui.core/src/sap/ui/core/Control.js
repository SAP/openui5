/*!
 * ${copyright}
 */

// Provides base class sap.ui.core.Control for all controls
sap.ui.define(['jquery.sap.global', './CustomStyleClassSupport', './Element', './UIArea', /* cyclic: './RenderManager', */ './ResizeHandler'],
	function(jQuery, CustomStyleClassSupport, Element, UIArea, ResizeHandler) {
	"use strict";

	/**
	 * Creates and initializes a new control with the given <code>sId</code> and settings.
	 *
	 * The set of allowed entries in the <code>mSettings</code> object depends on the concrete
	 * subclass and is described there. See {@link sap.ui.core.Element} for a general description of this
	 * argument.
	 *
	 * The settings supported by Control are:
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>{@link #getBusy busy} : boolean (default: false)</li>
	 * <li>{@link #getBusyIndicatorDelay busyIndicatorDelay} : int (default: 1000)</li>
	 * </ul>
	 * </li>
	 * </ul>
	 *
	 * @param {string} [sId] optional id for the new control; generated automatically if no non-empty id is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new control
	 * @public
	 *
	 * @class Base Class for Controls.
	 * @extends sap.ui.core.Element
	 * @abstract
	 * @author Martin Schaus, Daniel Brinkmann
	 * @version ${version}
	 * @alias sap.ui.core.Control
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Control = Element.extend("sap.ui.core.Control", /* @lends sap.ui.core.Control */ {

		metadata : {
			stereotype : "control",
			"abstract" : true,
			publicMethods: ["placeAt", "attachBrowserEvent", "detachBrowserEvent", "getControlsByFieldGroup"],
			library: "sap.ui.core",
			properties : {

				/**
				 * Whether the control is currently in busy state.
				 */
				"busy" : {type: "boolean", defaultValue: false},

				/**
				 * The delay in milliseconds, after which the busy indicator will show up for this control.
				 */
				"busyIndicatorDelay" : {type: "int", defaultValue: 1000},

				/**
				 * Whether the control should be visible on the screen. If set to false, a placeholder is rendered instead of the real control
				 */
				"visible" : { type: "boolean", group : "Appearance", defaultValue: true },

				/**
				 * The id of a logical field group that this control belongs to. All fields in a logicalfield group should share the same fieldGroupId.
				 * Once a logical field group is left, the validateFieldGroup event is fired.
				 *
				 * @see {sap.ui.core.Control.attachValidateFieldGroup}
				 * @since 1.31
				 */
				"fieldGroupId" : { type: "string", defaultValue: "" }

			},
			events : {
				/**
				 * Event is fired if a logical field group defined by a fieldGroupId of a control was left or the user explicitly pressed a validation key combination.
				 * Use this event to validate data of the controls belonging to a field group.
				 * @see {sap.ui.core.Control.setFieldGroupId}
				 */
				validateFieldGroup : {
					enableEventBubbling:true,
					parameters : {

						/**
						 * Field group id of the logical field group to validate
						 */
						fieldGroupId : {type : "string"}
					}
				}
			}
		},

		constructor : function(sId, mSettings) {

			// TODO initialization should happen in init
			// but many of the existing controls don't call super.init()
			// As a workaround I moved the initialization of bAllowTextSelection here
			// so that it doesn't overwrite settings in init() (e.g. ListBox)
			this.bAllowTextSelection = true;

			Element.apply(this,arguments);
			this.bOutput = this.getDomRef() != null; // whether this control has already produced output

			if (this._sapUiCoreLocalBusy_initBusyIndicator) {
				this._sapUiCoreLocalBusy_initBusyIndicator();
			}
		},

		renderer : null // Control has no renderer

	});


	/**
	 * Overrides {@link sap.ui.core.Element#clone Element.clone} to clone additional
	 * internal state.
	 *
	 * The additionally cloned information contains:
	 * <ul>
	 * <li>browser event handlers attached with {@link #attachBrowserEvent}
	 * <li>text selection behavior
	 * <li>style classes added with {@link #addStyleClass}
	 * </ul>
	 *
	 * @param {string} [sIdSuffix] a suffix to be appended to the cloned element id
	 * @param {string[]} [aLocalIds] an array of local IDs within the cloned hierarchy (internally used)
	 * @return {sap.ui.core.Element} reference to the newly created clone
	 * @protected
	 */
	Control.prototype.clone = function() {
		var oClone = Element.prototype.clone.apply(this, arguments);

		if ( this.aBindParameters ) {
			for (var i = 0, l = this.aBindParameters.length; i < l; i++) {
				var aParams = this.aBindParameters[i];
				oClone.attachBrowserEvent(aParams.sEventType, aParams.fnHandler, aParams.oListener !== this ? aParams.oListener : undefined);
			}
		}
		oClone.bAllowTextSelection = this.bAllowTextSelection;
		return oClone;
	};

	// must appear after clone() method and metamodel definition
	CustomStyleClassSupport.apply(Control.prototype);


	/**
	 * Checks whether the control is still active (part of the active DOM)
	 *
	 * @return {boolean} whether the control is still in the active DOM
	 * @private
	 */
	Control.prototype.isActive = function() {
		return jQuery.sap.domById(this.sId) != null;
	};

	/**
	 * Triggers rerendering of this element and its children.
	 *
	 * As <code>sap.ui.core.Element</code> "bubbles up" the invalidate, changes to children
	 * potentially result in rerendering of the whole sub tree.
	 *
	 * @param {object} oOrigin
	 * @protected
	 */
	Control.prototype.invalidate = function(oOrigin) {
		var oUIArea;
		if ( this.bOutput && (oUIArea = this.getUIArea()) ) {
			// if this control has been rendered before (bOutput)
			// and if it is contained in an UIArea (!!oUIArea)
			// then control re-rendering can be used (see UIArea.rerender() for details)
			//
			// The check for bOutput is necessary as the control
			// re-rendering needs to identify the previous rendering results.
			// Otherwise it wouldn't be able to replace them.
			//
			// Note about destroy(): when this control is currently in the process of being
			// destroyed, registering it for an autonomous re-rendering doesn't make sense.
			// In most cases, invalidation of the parent also doesn't make sense,
			// but there might be composite controls that rely on being invalidated when
			// a child is destroyed, so we keep the invalidation propagation untouched.
			if ( !this._bIsBeingDestroyed ) {
				oUIArea.addInvalidatedControl(this);
			}
		} else {
			// else we bubble up the hierarchy
			var oParent = this.getParent();
			if (oParent && (
					this.bOutput /* && !this.getUIArea() */ ||
					/* !this.bOutput && */ !(this.getVisible && this.getVisible() === false))) {

				// Note: the two comments in the condition above show additional conditions
				//       that help to understand the logic. As they are always fulfilled,
				//       they have been omitted for better performance.
				//
				// If this control has a parent but either
				//  - has produced output before ('this.bOutput') but is not part of an UIArea (!this.getUIArea())
				//  - or if it didn't produce output (!this.bOutput') before and is/became visible
				// then invalidate the parent to request re-rendering
				//
				// The first commented condition is always true, otherwise the initial if condition
				// in this method would have been met. The second one must be true as well because of the
				// short evaluation logic of JavaScript. When bOutput is true the second half of the Or won't be processed.

				oParent.invalidate(this);
			}
		}
	};

	/**
	 * Tries to replace its DOM reference by re-rendering.
	 * @protected
	 */
	Control.prototype.rerender = function() {
		UIArea.rerenderControl(this);
	};

	/**
	 * Defines whether the user can select text inside this control.
	 * Defaults to <code>true</code> as long as this method has not been called.
	 *
	 * <b>Note:</b>This only works in IE and Safari; for Firefox the element's style must
	 * be set to:
	 * <pre>
	 *   -moz-user-select: none;
	 * </pre>
	 * in order to prevent text selection.
	 *
	 * @param {boolean} bAllow whether to allow text selection or not
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.allowTextSelection = function(bAllow) {
		this.bAllowTextSelection = bAllow;
		return this;
	};

	/**
	 * The string given as "sStyleClass" will be added to the "class" attribute of this control's root HTML element.
	 *
	 * This method is intended to be used to mark controls as being of a special type for which
	 * special styling can be provided using CSS selectors that reference this style class name.
	 *
	 * <pre>
	 * Example:
	 *    myButton.addStyleClass("myRedTextButton"); // add a CSS class to one button instance
	 *
	 * ...and in CSS:
	 *    .myRedTextButton {
	 *       color: red;
	 *    }
	 * </pre>
	 *
	 * This will add the CSS class "myRedTextButton" to the Button HTML and the CSS code above will then
	 * make the text in this particular button red.
	 *
	 * Only characters allowed inside HTML attributes are allowed.
	 * Quotes are not allowed and this method will ignore any strings containing quotes.
	 * Strings containing spaces are interpreted as ONE custom style class (even though CSS selectors interpret them
	 * as different classes) and can only removed later by calling removeStyleClass() with exactly the
	 * same (space-containing) string as parameter.
	 * Multiple calls with the same sStyleClass will have no different effect than calling once.
	 * If sStyleClass is null, the call is ignored.
	 *
	 * @name sap.ui.core.Control.prototype.addStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the CSS class name to be added
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	/**
	 * Removes the given string from the list of custom style classes that have been set previously.
	 * Regular style classes like "sapUiBtn" cannot be removed.
	 *
	 * @name sap.ui.core.Control.prototype.removeStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the style to be removed
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	/**
	 * The string given as "sStyleClass" will be be either added to or removed from the "class" attribute of this control's root HTML element,
	 * depending on the value of "bAdd": if bAdd is true, sStyleClass will be added.
	 * If bAdd is not given, sStyleClass will be removed if it is currently present and will be added if not present.
	 * If sStyleClass is null, the call is ignored.
	 *
	 * See addStyleClass and removeStyleClass for further documentation.
	 *
	 * @name sap.ui.core.Control.prototype.toggleStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the CSS class name to be added or removed
	 * @param {boolean} bAdd whether sStyleClass should be added (or removed); when this parameter is not given, sStyleClass will be toggled (removed, if present, and added if not present)
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	/**
	 * Returns true if the given style class string is valid and if this control has this style class set
	 * via a previous call to addStyleClass().
	 *
	 * @name sap.ui.core.Control.prototype.hasStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the style to check for
	 * @type boolean
	 * @return whether the given style has been set before
	 * @public
	 */


	/**
	 * Allows binding handlers for any native browser event to the root HTML element of this Control. This internally handles
	 * DOM element replacements caused by re-rendering.
	 *
	 * IMPORTANT:
	 * This should be only used as FALLBACK when the Control events do not cover a specific use-case! Always try using
	 * SAPUI5 control events, as e.g. accessibility-related functionality is then provided automatically.
	 * E.g. when working with a sap.ui.commons.Button, always use the Button's "press" event, not the native "click" event, because
	 * "press" is also guaranteed to be fired when certain keyboard activity is supposed to trigger the Button.
	 *
	 * In the event handler, "this" refers to the Control - not to the root DOM element like in jQuery. While the DOM element can
	 * be used and modified, the general caveats for working with SAPUI5 control DOM elements apply. In particular the DOM element
	 * may be destroyed and replaced by a new one at any time, so modifications that are required to have permanent effect may not
	 * be done. E.g. use Control.addStyleClass() instead if the modification is of visual nature.
	 *
	 * Use detachBrowserEvent() to remove the event handler(s) again.
	 *
	 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
	 * @param {function} [fnHandler] A function to execute each time the event is triggered.
	 * @param {object} [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.attachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (fnHandler && typeof (fnHandler) === "function") {   // also do nothing if the second parameter is not a function
				// store the parameters for bind()
				if (!this.aBindParameters) {
					this.aBindParameters = [];
				}
				oListener = oListener || this;

				// FWE jQuery.proxy can't be used as it breaks our contract when used with same function but different listeners
				var fnProxy = function() {
					fnHandler.apply(oListener, arguments);
				};

				this.aBindParameters.push({
					sEventType: sEventType,
					fnHandler: fnHandler,
					oListener: oListener,
					fnProxy : fnProxy
				});

				if (!this._sapui_bInAfterRenderingPhase) {
					// if control is rendered, directly call bind()
					this.$().bind(sEventType, fnProxy);
				}
			}
		}

		return this;
	};


	/**
	 * Removes event handlers which have been previously attached using {@link #attachBrowserEvent}.
	 *
	 * Note: listeners are only removed, if the same combination of event type, callback function
	 * and context object is given as in the call to <code>attachBrowserEvent</code>.
	 *
	 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
	 * @param {function} [fnHandler] The function that is to be no longer executed.
	 * @param {object} [oListener] The context object that was given in the call to attachBrowserEvent.
	 * @public
	 */
	Control.prototype.detachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (fnHandler && typeof (fnHandler) === "function") {   // also do nothing if the second parameter is not a function
				var $ = this.$(),i,oParamSet;
				oListener = oListener || this;

				// remove the bind parameters from the stored array
				if (this.aBindParameters) {
					for (i = this.aBindParameters.length - 1; i >= 0; i--) {
						oParamSet = this.aBindParameters[i];
						if ( oParamSet.sEventType === sEventType  && oParamSet.fnHandler === fnHandler  &&  oParamSet.oListener === oListener ) {
							this.aBindParameters.splice(i, 1);
							// if control is rendered, directly call unbind()
							$.unbind(sEventType, oParamSet.fnProxy);
						}
					}
				}

			}
		}

		return this;
	};



	/**
	 * Returns a renderer for this control instance.
	 *
	 * It is retrieved using the RenderManager as done during rendering.
	 *
	 * @return {object} a Renderer suitable for this Control instance.
	 * @protected
	 */
	Control.prototype.getRenderer = function () {
		//TODO introduce caching?
		return sap.ui.core.RenderManager.getRenderer(this);
	};

	/**
	 * Puts <code>this</code> control into the specified container (<code>oRef</code>) at the given
	 * position (<code>oPosition</code>).
	 *
	 * First it is checked whether <code>oRef</code> is a container element / control (has a
	 * multiple aggregation with type <code>sap.ui.core.Control</code> and name 'content') or is an Id String
	 * of such an container.
	 * If this is not the case <code>oRef</code> can either be a Dom Reference or Id String of the UIArea
	 * (if it does not yet exist implicitly a new UIArea is created),
	 *
	 * The <code>oPosition</code> can be one of the following:
	 *
	 * <ul>
	 *  <li>"first": The control is added as the first element to the container.</li>
	 *  <li>"last": The control is added as the last element to the container (default).</li>
	 *  <li>"only": All existing children of the container are removed (not destroyed!) and the control is added as new child.</li>
	 *  <li><i>index</i>: The control is added at the specified <i>index</i> to the container.</li>
	 * </ul>
	 *
	 * @param {string|Element|sap.ui.core.Control} oRef container into which the control should be put
	 * @param {string|int} oPosition Describes the position where the control should be put into the container
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.placeAt = function(oRef, oPosition) {
		var oCore = sap.ui.getCore();
		if (oCore.isInitialized()) {
			// core already initialized, do it now

			// 1st try to resolve the oRef as a Container control
			var oContainer = oRef;
			if (typeof oContainer === "string") {
				oContainer = oCore.byId(oRef);
			}
			// if no container control is found use the corresponding UIArea
			var bIsUIArea = false;
			if (!(oContainer instanceof Element)) {
				oContainer = oCore.createUIArea(oRef);
				bIsUIArea = true;
			}

			if (!oContainer) {
				return this;
			}

			if (!bIsUIArea) {
				var oContentAggInfo = oContainer.getMetadata().getAggregation("content");
				var bContainerSupportsPlaceAt = true;
				if (oContentAggInfo) {
					if (!oContentAggInfo.multiple || oContentAggInfo.type != "sap.ui.core.Control") {
						bContainerSupportsPlaceAt = false;
					}
				} else {
					//Temporary workaround for sap.ui.commons.AbsoluteLayout to enable placeAt even when no content aggregation is available. TODO: Find a proper solution
					if (!oContainer.addContent || !oContainer.insertContent || !oContainer.removeAllContent) {
						bContainerSupportsPlaceAt = false;
					}
				}
				if (!bContainerSupportsPlaceAt) {
					jQuery.sap.log.warning("placeAt cannot be processed because container " + oContainer + " does not have an aggregation 'content'.");
					return this;
				}
			}

			if (typeof oPosition === "number") {
				oContainer.insertContent(this, oPosition);
			} else {
				oPosition = oPosition || "last"; //"last" is default
				switch (oPosition) {
					case "last":
						oContainer.addContent(this);
						break;
					case "first":
						oContainer.insertContent(this, 0);
						break;
					case "only":
						oContainer.removeAllContent();
						oContainer.addContent(this);
						break;
					default:
						jQuery.sap.log.warning("Position " + oPosition + " is not supported for function placeAt.");
				}
			}
		} else {
			// core not yet initialized, defer execution
			var that = this;
			oCore.attachInitEvent(function () {
				that.placeAt(oRef, oPosition);
			});
		}
		return this;
	};

	/*
	 * Event handling
	 */

	/**
	 * Cancels user text selection if text selection is disabled for this control.
	 * See the {@link #allowTextSelection} method.
	 * @private
	 */
	Control.prototype.onselectstart = function (oBrowserEvent) {
		if (!this.bAllowTextSelection) {
			oBrowserEvent.preventDefault();
			oBrowserEvent.stopPropagation();
		}
	};

	/*
	 * Rendering
	 */

	/**
	 * Function is called before the rendering of the control is started.
	 *
	 * Applications must not call this hook method directly, it is called by the framework.
	 *
	 * Subclasses of Control should override this hook to implement any necessary actions before the rendering.
	 *
	 * @function
	 * @name sap.ui.core.Control.prototype.onBeforeRendering
	 * @protected
	 */
	//sap.ui.core.Control.prototype.onBeforeRendering = function() {};

	/**
	 * Function is called when the rendering of the control is completed.
	 *
	 * Applications must not call this hook method directly, it is called by the framework.
	 *
	 * Subclasses of Control should override this hook to implement any necessary actions after the rendering.
	 *
	 * @function
	 * @name sap.ui.core.Control.prototype.onAfterRendering
	 * @protected
	 */
	//sap.ui.core.Control.prototype.onAfterRendering = function() {};

	/**
	 * Returns the DOMNode Id to be used for the "labelFor" attribute of the label.
	 *
	 * By default, this is the Id of the control itself.
	 *
	 * @return {string} Id to be used for the <code>labelFor</code>
	 * @public
	 */
	Control.prototype.getIdForLabel = function () {
		return this.getId();
	};

	Control.prototype.destroy = function(bSuppressInvalidate) {
		// avoid rerendering
		this._bIsBeingDestroyed = true;
		//Cleanup Busy Indicator
		this._cleanupBusyIndicator();

		ResizeHandler.deregisterAllForControl(this.getId());

		Element.prototype.destroy.call(this, bSuppressInvalidate);
	};

	(function() {
		var sPreventedEvents = "focusin focusout keydown keypress keyup mousedown touchstart mouseup touchend click",
			oBusyIndicatorDelegate = {
				onAfterRendering: function() {
					if (this.getBusy() && this.$() && !this._busyIndicatorDelayedCallId) {
						// Also use the BusyIndicatorDelay when a control is initialized with "busy = true"
						// If the delayed call was already initialized skip any further call if the control was re-rendered while
						// the delay is on its way.
						this._busyIndicatorDelayedCallId = jQuery.sap.delayedCall(this.getBusyIndicatorDelay(), this, fnAppendBusyIndicator);
					}
				}
			},
			fnAppendBusyIndicator = function() {
				var $this = this.$(this._sBusySection),
					aForbiddenTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"];


				//If there is a pending delayed call to append the busy indicator, we can clear it now
				if (this._busyIndicatorDelayedCallId) {
					jQuery.sap.clearDelayedCall(this._busyIndicatorDelayedCallId);
					delete this._busyIndicatorDelayedCallId;
				}

				//Check if DOM Element where the busy indicator is supposed to be placed can handle content
				var sTag = $this.get(0) && $this.get(0).tagName;
				if (sTag && jQuery.inArray(sTag.toLowerCase(), aForbiddenTags) >= 0) {
					jQuery.sap.log.warning("Busy Indicator cannot be placed in elements with tag " + sTag);
					return;
				}

				//check if the control has static position, if this is the case we need to change it,
				//because we relay on relative/absolute/fixed positioning
				if ($this.css('position') == 'static') {
					this._busyStoredPosition = 'static';
					$this.css('position', 'relative');
				}

				//Append busy indicator to control DOM
				var $BusyIndicator = jQuery('<div class="sapUiLocalBusyIndicator" aria-role="progressbar" aria-valuemin="0" aria-valuemax="100">' +
					'<div class="sapUiLocalBusyIndicatorAnimation">' +
						'<div class="sapUiLocalBusyIndicatorBox"></div>' +
						'<div class="sapUiLocalBusyIndicatorBox"></div>' +
						'<div class="sapUiLocalBusyIndicatorBox"></div>' +
					'</div>' +
				'</div>');
				var sBusyIndicatorId = this.getId() + "-busyIndicator";
				$BusyIndicator.attr("id", sBusyIndicatorId);
				$this.append($BusyIndicator);
				$this.addClass('sapUiLocalBusy');
				//Set the actual DOM Element to 'aria-busy'
				$this.attr('aria-busy', true);
				if (this._busyDelayedCallId) {
					jQuery.sap.clearDelayedCall(this._busyDelayedCallId);
				}
				this._busyDelayedCallId = jQuery.sap.delayedCall(1200, this, fnAnimate);
				fnHandleInteraction.apply(this, [true]);
			},
			fnHandleInteraction = function(bBusy) {
				var $this = this.$(this._sBusySection);

				if (bBusy) {
					// all focusable elements must be processed for the "tabindex=-1"
					// attribute. The dropdownBox for example has got two focusable elements
					// (arrow and intput field) and both shouldn't be focusable. Otherwise
					// the input field will still be focused on keypress (tab) because the
					// browser focuses the element
					var $TabRefs = $this.find(":sapTabbable"),
						that = this;
					this._busyTabIndices = [];

					// if only the control itself without any tabrefs was found
					// block the events as well
					this._busyTabIndices.push({
						ref : $this,
						tabindex : $this.attr('tabindex')
					});
					$this.attr('tabindex', -1);
					$this.bind(sPreventedEvents, fnPreserveEvents);

					$TabRefs.each(function(iIndex, oObject) {
						var $Ref = jQuery(oObject),
							iTabIndex = $Ref.attr('tabindex');

						if (iTabIndex < 0) {
							return true;
						}

						that._busyTabIndices.push({
							ref: $Ref,
							tabindex: iTabIndex
						});

						$Ref.attr('tabindex', -1);
						$Ref.bind(sPreventedEvents, fnPreserveEvents);
					});
				} else {
					if (this._busyTabIndices) {
						jQuery.each(this._busyTabIndices, function(iIndex, oObject) {
							if (oObject.tabindex) {
								// if there was no tabindex before it was added by the BusyIndicator
								// the previous value is "undefined". And this value can't be set
								// so the attribute remains at the DOM-ref. So if there was no tabindex
								// attribute before the whole attribute should be removed again.
								oObject.ref.attr('tabindex', oObject.tabindex);
							} else {
								oObject.ref.removeAttr('tabindex');
							}

							oObject.ref.unbind(sPreventedEvents, fnPreserveEvents);
						});
					}
					this._busyTabIndices = [];
				}
			},
			fnPreserveEvents = function(oEvent) {
				jQuery.sap.log.debug("Local Busy Indicator Event Suppressed: " + oEvent.type);
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			},
			fnAnimate = function() {
				var $bubbles = this.$(this._sBusySection).children('.sapUiLocalBusyIndicator').children('.sapUiLocalBusyIndicatorAnimation');
				var that = this;
				that._busyAnimationTimer1 = setTimeout(function() {
					$bubbles.children(":eq(0)").addClass('active');
					$bubbles.children(":not(:eq(0))").removeClass('active');
					that._busyAnimationTimer2 = setTimeout(function() {
						$bubbles.children(":eq(1)").addClass('active');
						$bubbles.children(":not(:eq(1))").removeClass('active');
						that._busyAnimationTimer3 = setTimeout(function() {
							$bubbles.children(":eq(2)").addClass('active');
							$bubbles.children(":not(:eq(2))").removeClass('active');
							that._busyAnimationTimer4 = setTimeout(function() {
								$bubbles.children().removeClass('active');
							}, 150);
						}, 150);
					}, 150);
				}, 150);
				this._busyDelayedCallId = jQuery.sap.delayedCall(1200, this, fnAnimate);
			};

		/**
		 * Set the controls busy state.
		 *
		 * @param {boolean} bBusy The new busy state to be set
		 * @return {sap.ui.core.Control} <code>this</code> to allow method chaining
		 * @public
		 */
		Control.prototype.setBusy = function (bBusy, sBusySection /* this is an internal parameter to apply partial local busy indicator for a specific section of the control */) {
			this._sBusySection = sBusySection;
			var $this = this.$(this._sBusySection);

			//If the new state is already set, we don't need to do anything
			if (bBusy == this.getProperty("busy")) {
				return this;
			}

			//No rerendering
			this.setProperty("busy", bBusy, true);

			if (bBusy) {
				this.addDelegate(oBusyIndicatorDelegate, false, this);
			} else {
				this.removeDelegate(oBusyIndicatorDelegate);
				//If there is a pending delayed call we clear it
				if (this._busyIndicatorDelayedCallId) {
					jQuery.sap.clearDelayedCall(this._busyIndicatorDelayedCallId);
					delete this._busyIndicatorDelayedCallId;
				}
			}

			//If no domref exists stop here.
			if (!this.getDomRef()) {
				return this;
			}

			if (bBusy) {
				if (this.getBusyIndicatorDelay() <= 0) {
					fnAppendBusyIndicator.apply(this);
				} else {
					this._busyIndicatorDelayedCallId = jQuery.sap.delayedCall(this.getBusyIndicatorDelay(), this, fnAppendBusyIndicator);
				}
			} else {
				//Remove the busy indicator from the DOM
				this.$("busyIndicator").remove();
				this.$().removeClass('sapUiLocalBusy');
				//Unset the actual DOM Element´s 'aria-busy'
				this.$().removeAttr('aria-busy');

				//Reset the position style to its original state
				if (this._busyStoredPosition) {
					$this.css('position', this._busyStoredPosition);
					delete this._busyStoredPosition;
				}
				fnHandleInteraction.apply(this, [false]);
				if (this._busyDelayedCallId) {
					jQuery.sap.clearDelayedCall(this._busyDelayedCallId);
					delete this._busyDelayedCallId;
				}
			}
			return this;
		};

		/**
		 * Check if the control is currently in busy state
		 *
		 * @public
		 * @deprecated Use getBusy instead
		 * @return boolean
		 */
		Control.prototype.isBusy = function() {
			return this.getProperty("busy");
		};

		/**
		 * Define the delay, after which the busy indicator will show up
		 *
		 * @public
		 * @param {int} iDelay The delay in ms
		 * @return {sap.ui.core.Control} <code>this</code> to allow method chaining
		 */
		Control.prototype.setBusyIndicatorDelay = function(iDelay) {
			this.setProperty("busyIndicatorDelay", iDelay, true);
			return this;
		};

		/**
		 * Cleanup all timers which might have been created by the busy indicator
		 *
		 * @private
		 */
		Control.prototype._cleanupBusyIndicator = function() {
			if (this._busyIndicatorDelayedCallId) {
				jQuery.sap.clearDelayedCall(this._busyIndicatorDelayedCallId);
				delete this._busyIndicatorDelayedCallId;
			}
			if (this._busyDelayedCallId) {
				jQuery.sap.clearDelayedCall(this._busyDelayedCallId);
				delete this._busyDelayedCallId;
			}
			if (this._busyAnimationTimer1) {
				clearTimeout(this._busyAnimationTimer1);
				delete this._busyAnimationTimer1;
			}
			if (this._busyAnimationTimer2) {
				clearTimeout(this._busyAnimationTimer2);
				delete this._busyAnimationTimer2;
			}
			if (this._busyAnimationTimer3) {
				clearTimeout(this._busyAnimationTimer3);
				delete this._busyAnimationTimer3;
			}
			if (this._busyAnimationTimer4) {
				clearTimeout(this._busyAnimationTimer4);
				delete this._busyAnimationTimer4;
			}
		};

		/**
		 * Returns a list of all control with a field group id or the controls with the given field group id.
		 *
		 * @param {string} sFieldGroupId optional id of the field group
		 * @return {array} The list of controls with a field group id
		 * @public
		 */
		Control.prototype.getControlsByFieldGroupId = function(sFieldGroupId) {
			return this.findAggregatedObjects(true, function(oObject) {
				return oObject instanceof sap.ui.core.Control && 
						oObject.getFieldGroupId &&
						((typeof sFieldGroupId !== "string" && oObject.getFieldGroupId()) || (oObject.getFieldGroupId() === sFieldGroupId));
			});
		};

		/**
		 * Triggers the validateFieldGroup event for this control.
		 * Called by sap.ui.core.UIArea if a field group should be validated after is loses the focus or a validation key combibation was pressed.
		 * The validation key is defined in the UI area <code>UIArea._oFieldGroupValidationKey</code>
		 *
		 * @see {sap.ui.core.Control.attachValidateFieldGroup}
		 *
		 * @protected
		 */
		Control.prototype.triggerValidateFieldGroup = function() {
			this.fireValidateFieldGroup({
				fieldGroupId : this.getFieldGroupId()
			});
		};

	})();


	return Control;

});

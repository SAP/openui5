/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/ui/integration/designtime/baseEditor/util/createPromise"
], function (
	Control,
	findClosestInstance,
	createPromise
) {
	"use strict";

	var CREATED_BY_CONFIG = "config";
	var CREATED_BY_TAGS = "tags";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var PropertyEditors = Control.extend("sap.ui.integration.designtime.baseEditor.PropertyEditors", {
		metadata: {
			properties: {
				tags: {
					type: "any"
				},
				config: {
					type: "array"
				}
			},
			aggregations: {
				propertyEditors: {
					type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor",
					visibility: "hidden"
				}
			},
			associations: {
				editor: {
					type: "sap.ui.integration.designtime.baseEditor.BaseEditor",
					multiple: false
				}
			},
			events: {
				/**
				 * Fires when new Editor changes.
				 */
				editorChange: {
					parameters: {
						previousEditor: {
							type: "sap.ui.integration.designtime.baseEditor.BaseEditor"
						},
						editor: {
							type: "sap.ui.integration.designtime.baseEditor.BaseEditor"
						}
					}
				},

				/**
				 * Fires when internal propertyEditors aggregation changes, e.g. called after initial initialisation or
				 * after changing tag or config properties.
				 */
				propertyEditorsChange: {
					parameters: {
						previousPropertyEditor: {
							type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"
						},
						propertyEditor: {
							type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"
						}
					}
				},

				/**
				 * Fires when config changes.
				 */
				configChange: {
					parameters: {
						previousConfig: {
							type: "array"
						},
						config: {
							type: "array"
						}
					}
				},

				/**
				 * Fires when tags changes.
				 */
				tagsChange: {
					parameters: {
						previousTags: {
							type: "string"
						},
						tags: {
							type: "string"
						}
					}
				}
			}
		},

		_bEditorAutoDetect: false,
		_sCreatedBy: null, // possible values: null | propertyName | config

		constructor: function() {
			Control.prototype.constructor.apply(this, arguments);

			if (!this.getEditor()) {
				// FIXME: if set later manually => this detection should be disabled
				// if editor is not set explicitly via constructor, we're going to try to find it
				this._bEditorAutoDetect = true;
			}

			this._propagationListener = this._propagationListener.bind(this);

			this.attachEditorChange(function () {
				if (this._sCreatedBy) {
					this._removePropertyEditors();
				}
				this._initPropertyEditors();
			});

			this.attachConfigChange(function () {
				if (this._sCreatedBy) {
					this._removePropertyEditors();
				}
				this._initPropertyEditors();
			});

			this.attachTagsChange(function () {
				if (this._sCreatedBy === CREATED_BY_TAGS) {
					this._removePropertyEditors();
				}
				if (this._sCreatedBy !== CREATED_BY_CONFIG) {
					this._initPropertyEditors();
				}
			});

			// init
			this._initPropertyEditors();
		},

		renderer: function (oRm, oControl) {
			var aPropertyEditors = oControl.getAggregation("propertyEditors");
			oRm.openStart("div", oControl);
			oRm.openEnd();
			if (Array.isArray(aPropertyEditors)) {
				aPropertyEditors.forEach(function (oPropertyEditor) {
					oRm.renderControl(oPropertyEditor);
				});
			}
			oRm.close("div");
		}
	});

	PropertyEditors.prototype.getEditor = function () {
		return sap.ui.getCore().byId(this.getAssociation('editor'));
	};

	PropertyEditors.prototype.setConfig = function (mConfig) {
		var mPreviousConfig = this.getConfig();
		if (
			mPreviousConfig !== mConfig
			&& (
				!Array.isArray(mPreviousConfig)
				|| !Array.isArray(mConfig)
				|| JSON.stringify(mPreviousConfig) !== JSON.stringify(mConfig)
			)
		) {
			this.setProperty("config", mConfig);
			this.fireConfigChange({
				previousConfig: mPreviousConfig,
				config: mConfig
			});
		}
	};

	PropertyEditors.prototype.setTags = function (vTags) {
		var sPreviousTags = this.getTags();
		var vResult = vTags;

		if (typeof vTags === "string") {
			vResult = vTags.split(",").sort().join(",");
		}

		if (sPreviousTags !== vResult) {
			this.setProperty("tags", vResult);
			this.fireTagsChange({
				previousTags: sPreviousTags,
				tags: vResult
			});
		}
	};

	PropertyEditors.prototype.setEditor = function (vEditor) {
		var oPreviousEditor = this.getEditor();
		var oEditor = typeof vEditor === "string" ? sap.ui.getCore().byId(vEditor) : vEditor;
		if (oPreviousEditor !== oEditor) {
			this.setAssociation("editor", vEditor);
			var oEditor = this.getEditor();
			this.fireEditorChange({
				previousEditor: oPreviousEditor,
				editor: oEditor
			});
		}
	};

	PropertyEditors.prototype.destroy = function () {
		this._removePropertyEditors();
		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditors.prototype._removePropertyEditors = function () {
		var aPropertyEditors = this.removeAllAggregation("propertyEditors");

		if (aPropertyEditors.length) {
			aPropertyEditors.forEach(function (oPropertyEditor) {
				switch (this._sCreatedBy) {
					case CREATED_BY_CONFIG:
						oPropertyEditor.destroy();
						break;
					case CREATED_BY_TAGS:
						// Need to manually as there is a bug in removeAllAggregation()
						// when aggregation marked as "multiple: false"
						oPropertyEditor.setParent(null);
						break;
				}
			}, this);

			this._sCreatedBy = null;
			this.firePropertyEditorsChange({
				propertyEditor: null
			});
		}
	};

	PropertyEditors.prototype._initPropertyEditors = function () {
		if (
			this.getEditor()
			&& (
				this.getConfig()
				|| (
					!this.getBindingInfo("config") // If there is a binding on config property the value might not arrived yet
					&& this.getTags()
				)
			)
		) {
			var oEditor = this.getEditor();
			// Cancel previous async process if any
			if (this._fnCancelInit) {
				this._fnCancelInit();
				delete this._fnCancelInit;
			}

			var mPromise = createPromise(function (fnResolve, fnReject) {
				var oPromise;
				var sCreatedBy;

				if (this.getConfig()) {
					oPromise = Promise.all(
						this.getConfig().map(function (mItemConfig) {
							return oEditor.createPropertyEditor(mItemConfig);
						})
					);
					sCreatedBy = CREATED_BY_CONFIG;
				} else {
					var aTags = this.getTags().split(",");
					oPromise = oEditor.getPropertyEditors(aTags);
					sCreatedBy = CREATED_BY_TAGS;
				}

				oPromise
					.then(function (aPropertyEditors) {
						this._sCreatedBy = sCreatedBy;
						delete this._fnCancelInit;
						fnResolve(aPropertyEditors);
					}.bind(this))
					.catch(fnReject);
			}.bind(this));

			this._fnCancelInit = mPromise.cancel;

			mPromise.promise.then(function (aPropertyEditors) {
				aPropertyEditors.forEach(function (oPropertyEditor) {
					this.addAggregation("propertyEditors", oPropertyEditor);
				}, this);
				this.firePropertyEditorsChange({
					propertyEditors: aPropertyEditors
				});
			}.bind(this));
		}
	};

	PropertyEditors.prototype._propagationListener = function () {
		var oEditor = findClosestInstance(this.getParent(), "sap.ui.integration.designtime.baseEditor.BaseEditor");
		if (oEditor) {
			this.setEditor(oEditor);
			this.removePropagationListener(this._propagationListener);
		}
	};

	PropertyEditors.prototype.setParent = function (oParent) {
		Control.prototype.setParent.apply(this, arguments);

		if (this._bEditorAutoDetect) {
			var oEditor = findClosestInstance(oParent, "sap.ui.integration.designtime.baseEditor.BaseEditor");

			if (oEditor) {
				this.setEditor(oEditor);
			} else {
				this.addPropagationListener(this._propagationListener);
			}
		}
	};

	return PropertyEditors;
});
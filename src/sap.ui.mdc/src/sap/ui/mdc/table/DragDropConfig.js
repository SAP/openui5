/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/dnd/DragDropBase",
		"sap/ui/core/dnd/DragInfo",
		"sap/ui/core/dnd/DropInfo",
		"sap/ui/base/ManagedObjectObserver"
	],
	(DragDropBase, DragInfo, DropInfo, ManagedObjectObserver) => {
		"use strict";

		/**
		 * Constructor for a new DragDropConfig.
		 *
		 * @param {string} [sId] ID for the new DragDropConfig, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new DragDropConfig
		 *
		 * @class
		 * Provides the configuration for the drag-and-drop operations of the rows of the table.
		 *
		 * @extends sap.ui.core.dnd.DragDropBase
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 * @since 1.119
		 * @alias sap.ui.mdc.table.DragDropConfig
		 */
		const DragDropConfig = DragDropBase.extend("sap.ui.mdc.table.DragDropConfig", /** @lends sap.ui.mdc.table.DragDropConfig.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				properties: {

					/**
					 * Determines whether the rows of the table are draggable.
					 *
					 * <b>Note:</b> Setting this property to <code>true</code> may expose the rows of the table in other <code>DropInfo</code> event parameters.
					 * In this case, only the binding context of the row is allowed to be used. Internal controls and their types are subject to change without notice.
					 */
					draggable: { type: "boolean", defaultValue: false },

					/**
					 * Determines whether the rows of the table are droppable.
					 */
					droppable: { type: "boolean", defaultValue: false },

					/**
					 * Defines the visual drop effect.
					 */
					dropEffect: { type: "sap.ui.core.dnd.DropEffect", defaultValue: "Move" },

					/**
					 * Defines the position for the drop action, visualized by a rectangle.
					 */
					dropPosition: { type: "sap.ui.core.dnd.DropPosition", defaultValue: "On" }

				},
				events: {
					/**
					 * This event is fired when the user starts dragging a table row, if the <code>draggable</code> property is set to <code>true<code>.
					 */
					dragStart: {
						allowPreventDefault: true,
						parameters: {
							/**
							 * The binding context of the dragged row
							 */
							bindingContext: { type: "sap.ui.model.Context" },

							/**
							 * The underlying browser event
							 */
							browserEvent: { type: "DragEvent"}
						}
					},

					/**
					 * This event is fired when the row drag operation is ended, if the <code>draggable</code> property is set to <code>true<code>.
					 */
					dragEnd: {
						parameters: {
							/**
							 * The binding context of the dragged row
							 */
							bindingContext: { type: "sap.ui.model.Context" },

							/**
							 * The underlying browser event
							 */
							browserEvent: { type: "DragEvent"}
						}
					},

					/**
					 * @typedef {sap.ui.model.Context|sap.ui.core.Element} sap.ui.mdc.table.DragDropConfig.DragSource
					 * @public
					 */

					/**
					 * This event is fired when a dragged element enters a table row, if the <code>droppable</code> property is set to <code>true<code>.
					 *
					 * @name sap.ui.mdc.table.DragDropConfig#dragEnter
					 * @event
					 * @param {sap.ui.base.Event} oControlEvent
					 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
					 * @param {object} oControlEvent.getParameters
					 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext The binding context of the row on which the dragged element will be dropped
					 * @param {sap.ui.mdc.table.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource The binding context of the dragged row or the dragged control itself
					 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the row being dropped
					 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
					 * @public
					 */
					dragEnter: {
						allowPreventDefault: true
					},

					/**
					 * This event is fired when an element is being dragged over a table row, if the <code>droppable</code> property is set to <code>true<code>.
					 *
					 * @name sap.ui.mdc.table.DragDropConfig#dragOver
					 * @event
					 * @param {sap.ui.base.Event} oControlEvent
					 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
					 * @param {object} oControlEvent.getParameters
					 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext The binding context of the row on which the dragged element will be dropped
					 * @param {sap.ui.mdc.table.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource The binding context of the dragged row or the dragged control itself
					 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the row being dropped
					 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
					 * @public
					 */
					dragOver: {
						allowPreventDefault: true
					},

					/**
					 * This event is fired when an element is dropped on a table row, if the <code>droppable</code> property is set to <code>true<code>.
					 *
					 * @name sap.ui.mdc.table.DragDropConfig#drop
					 * @event
					 * @param {sap.ui.base.Event} oControlEvent
					 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
					 * @param {object} oControlEvent.getParameters
					 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext The binding context of the row on which the dragged element is dropped
					 * @param {sap.ui.mdc.table.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource The binding context of the dragged row or the dragged control itself
					 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the dropped row
					 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
					 * @public
					 */
					drop: {}
				}
			}
		});

		DragDropConfig.prototype.init = function() {
			this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		};

		DragDropConfig.prototype.exit = function() {
			this._oObserver.destroy();
			this._oObserver = null;
		};

		DragDropConfig.prototype.setDraggable = function(bDraggable) {
			this.setProperty("draggable", bDraggable, true);
			this.getDraggable() ? this._addDragInfoToTable() : this._removeDragInfoFromTable();
			return this;
		};

		DragDropConfig.prototype.setDroppable = function(bDroppable) {
			this.setProperty("droppable", bDroppable, true);
			this.getDroppable() ? this._addDropInfoToTable() : this._removeDropInfoFromTable();
			return this;
		};

		DragDropConfig.prototype.setEnabled = function(bEnabled) {
			this.setProperty("enabled", bEnabled, true);
			this._oDragInfo?.setEnabled(bEnabled);
			this._oDropInfo?.setEnabled(bEnabled);
			return this;
		};

		DragDropConfig.prototype.setGroupName = function(sGroupName) {
			this.setProperty("groupName", sGroupName, true);
			this._oDragInfo?.setGroupName(sGroupName);
			this._oDropInfo?.setGroupName(sGroupName);
			return this;
		};

		DragDropConfig.prototype.setDropEffect = function(sDropEffect) {
			this.setProperty("dropEffect", sDropEffect, true);
			this._oDropInfo?.setDropEffect(sDropEffect);
			return this;
		};

		DragDropConfig.prototype.setDropPosition = function(sDropPosition) {
			this.setProperty("dropPosition", sDropPosition, true);
			this._oDropInfo?.setDropPosition(sDropPosition);
			return this;
		};

		DragDropConfig.prototype.setParent = function() {
			const oOldParent = this.getParent();
			oOldParent && this._disconnectFromParent(oOldParent);

			DragDropBase.prototype.setParent.apply(this, arguments);

			const oNewParent = this.getParent();
			oNewParent && this._connectToParent(oNewParent);
		};

		DragDropConfig.prototype._connectToParent = function(oMDCTable) {
			this._oObserver.observe(oMDCTable, { aggregations: ["_content"] });

			const oTable = oMDCTable.getAggregation("_content");
			oTable && this._connectToTable(oTable);
		};

		DragDropConfig.prototype._disconnectFromParent = function(oMDCTable) {
			this._oObserver?.unobserve(oMDCTable, { aggregations: ["_content"] });
			this._disconnectFromTable();
		};

		DragDropConfig.prototype._observeChanges = function(mChange) {
			if (mChange.mutation == "insert") {
				this._connectToTable(mChange.child);
			} else {
				this._disconnectFromTable();
			}
		};

		DragDropConfig.prototype._connectToTable = function(oTable) {
			this._oTable = oTable;
			this._addDragInfoToTable();
			this._addDropInfoToTable();
		};

		DragDropConfig.prototype._disconnectFromTable = function() {
			this._removeDragInfoFromTable();
			this._removeDropInfoFromTable();
			this._oTable = null;
		};

		DragDropConfig.prototype._addDragInfoToTable = function() {
			if (this._oTable && !this._oDragInfo && this.getDraggable()) {
				this._oDragInfo = new DragInfo({
					enabled: this.getEnabled(),
					groupName: this.getGroupName(),
					sourceAggregation: this._oTable.isA("sap.m.Table") ? "items" : "rows",
					dragStart: [this._onDragInfoEvent, this],
					dragEnd: [this._onDragInfoEvent, this]
				});
				this._oTable.addDragDropConfig(this._oDragInfo);
			}
		};

		DragDropConfig.prototype._removeDragInfoFromTable = function() {
			if (this._oTable && this._oDragInfo) {
				this._oTable.removeDragDropConfig(this._oDragInfo);
				this._oDragInfo.destroy();
				this._oDragInfo = null;
			}
		};

		DragDropConfig.prototype._addDropInfoToTable = function() {
			if (this._oTable && !this._oDropInfo && this.getDroppable()) {
				this._oDropInfo = new DropInfo({
					enabled: this.getEnabled(),
					groupName: this.getGroupName(),
					dropEffect: this.getDropEffect(),
					dropPosition: this.getDropPosition(),
					targetAggregation: this._oTable.isA("sap.m.Table") ? "items" : "rows",
					dragEnter: [this._onDropInfoEvent, this],
					dragOver: [this._onDropInfoEvent, this],
					drop: [this._onDropInfoEvent, this]
				});
				this._oTable.addDragDropConfig(this._oDropInfo);
			}
		};

		DragDropConfig.prototype._removeDropInfoFromTable = function() {
			if (this._oTable && this._oDropInfo) {
				this._oTable.removeDragDropConfig(this._oDropInfo);
				this._oDropInfo.destroy();
				this._oDropInfo = null;
			}
		};

		/**
		 * Returns the binding context of inner table rows.
		 *
		 * @param {sap.m.ListItemBase|sap.ui.table.Row} oControl The row instance
		 * @returns {sap.ui.model.Context|undefined} The binding context or undefined if the binding context does not exist
		 * @private
		 */
		function getBindingContext(oControl) {
			const sAggregation = oControl.isA("sap.m.ListItemBase") ? "items" : "rows";
			const oBindingInfo = oControl.getParent().getBindingInfo(sAggregation) || {};
			return oControl.getBindingContext(oBindingInfo.model);
		}

		/**
		 * Returns the drag source from the DragSession object.
		 *
		 * The source is a binding contexts if the dragged element is a table row from any table dropped in mdc/Table rows.
		 * Otherwise, for example if a Button control is dropped into the mdc/Table rows, it is a control instance.
		 *
		 * @param {sap.ui.core.dnd.DragSession} oDragSession The DragSession object
		 * @returns {sap.ui.model.Context|sap.ui.core.Element} The drag source
		 * @private
		 */
		function getDragSource(oDragSession) {
			let oDragSource;
			const oDragControl = oDragSession.getDragControl();
			if (oDragControl?.isA("sap.m.ListItemBase")) {
				oDragSource = getBindingContext(oDragControl);
			} else if (oDragControl?.isA("sap.ui.table.Row")) {
				oDragSource = oDragSession.getComplexData("sap.ui.table-" + oDragControl.getParent().getId()).draggedRowContext;
			}
			return oDragSource || oDragControl;
		}

		DragDropConfig.prototype._onDragInfoEvent = function(oEvent) {
			const oDragSession = oEvent.getParameter("dragSession");
			const bAllowPreventDefault = (oEvent.getId() == "dragStart");
			const mEventParameters = {
				bindingContext: getDragSource(oDragSession),
				browserEvent: oEvent.getParameter("browserEvent")
			};

			const bEventResult = this.fireEvent(oEvent.getId(), mEventParameters, bAllowPreventDefault);
			if (bAllowPreventDefault && !bEventResult) {
				oEvent.preventDefault();
			}
		};

		DragDropConfig.prototype._onDropInfoEvent = function(oEvent) {
			const oDragSession = oEvent.getParameter("dragSession");
			const oDropControl = oDragSession.getDropControl();
			const sDropPosition = oEvent.getParameter("dropPosition");
			const bAllowPreventDefault = oEvent.getId().startsWith("drag");
			const mEventParameters = {
				bindingContext: getBindingContext(oDropControl),
				dragSource: getDragSource(oDragSession),
				browserEvent: oEvent.getParameter("browserEvent")
			};

			if (sDropPosition) {
				mEventParameters.dropPosition = sDropPosition;
			}

			const bEventResult = this.fireEvent(oEvent.getId(), mEventParameters, bAllowPreventDefault);
			if (bAllowPreventDefault && !bEventResult) {
				oEvent.preventDefault();
			}
		};

		return DragDropConfig;

	});
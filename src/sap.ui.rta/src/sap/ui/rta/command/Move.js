/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand'], function(jQuery, FlexCommand) {
	"use strict";

	/**
	 * Move Element from one place to another
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Move
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Move = FlexCommand.extend("sap.ui.rta.command.Move", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				movedElements : {
					type : "any[]"
				},
				target : {
					type : "any"
				},
				source : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * @param  {boolean} bIsUndo If is true, then it switches source and target
	 * @override
	 */
	Move.prototype._getChangeSpecificData = function(bIsUndo) {
		var mSource = bIsUndo ? this.getTarget() : this.getSource();
		var mTarget = bIsUndo ? this.getSource() : this.getTarget();

		// replace elements by their id, unify format and help with serialization
		if (mSource.parent) {
			mSource.id = mSource.parent.getId();
			delete mSource.parent;
		}
		if (mTarget.parent) {
			mTarget.id = mTarget.parent.getId();
			delete mTarget.parent;
		}
		var mSpecificInfo = {
			changeType : this.getChangeType(),
			source : mSource,
			target : mTarget,
			movedElements : []
		};

		this.getMovedElements().forEach(function(mMovedElement) {
			mSpecificInfo.movedElements.push({
				id : mMovedElement.id || (mMovedElement.element && mMovedElement.element.getId()),
				sourceIndex : bIsUndo ? mMovedElement.targetIndex : mMovedElement.sourceIndex,
				targetIndex : bIsUndo ? mMovedElement.sourceIndex : mMovedElement.targetIndex
			});
		});
		return mSpecificInfo;
	};

	Move.prototype.prepare = function(sLayer, bDeveloperMode) {
		var bSuccessful = FlexCommand.prototype.prepare.apply(this, arguments);

		if (bSuccessful) {
			this._oPreparedUndoChange = this._createChangeFromData(this._getChangeSpecificData(true), sLayer, bDeveloperMode);
		}
		return bSuccessful;
	};

	Move.prototype.undo = function() {
		return this._applyChange(this._oPreparedUndoChange, true);
	};

	return Move;

}, /* bExport= */true);

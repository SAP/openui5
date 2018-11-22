/*!
 * ${copyright}
 */

// Provides utilities for sap.m.SinglePlanningCalendarGrid.
sap.ui.define([], function() {
	'use strict';

	// Appointments Node
	function AppointmentNode(oData) {
		this.data = oData;
		this.level = 0;
		this.width = 1;
		this.prev = null;
		this.next = null;
	}

	AppointmentNode.prototype.hasNext = function () {
		return this.next !== null;
	};

	AppointmentNode.prototype.hasPrev = function () {
		return this.prev !== null;
	};

	AppointmentNode.prototype.getData = function () {
		return this.data;
	};

	// Appointments List
	function AppointmentsList() {
		this.head = null;
		this.tail = null;
		this.size = 0;
		this.iterator = new AppointmentsIterator(this);
	}

	AppointmentsList.prototype.getHeadNode = function () {
		return this.head;
	};

	AppointmentsList.prototype.getTailNode = function () {
		return this.tail;
	};

	AppointmentsList.prototype.getSize = function () {
		return this.size;
	};

	AppointmentsList.prototype.isEmpty = function () {
		return this.getSize() === 0;
	};

	AppointmentsList.prototype.createNewNode = function (oData) {
		return new AppointmentNode(oData);
	};

	AppointmentsList.prototype.getIterator = function () {
		return this.iterator;
	};

	AppointmentsList.prototype.indexOf = function (oNode, fnComparator) {
		this.iterator.reset();
		var oCurrentNode,
			iIndex = 0;

		while (this.iterator.hasNext()) {
			oCurrentNode = this.iterator.next();

			if (fnComparator(oCurrentNode)) {
				return iIndex;
			}

			iIndex++;
		}

		return -1;
	};

	AppointmentsList.prototype.add = function (oData) {
		var oNewNode = oData;

		if (!(oData instanceof AppointmentNode)) {
			oNewNode = this.createNewNode(oData);
		}

		if (this.isEmpty()) {
			this.head = this.tail = oNewNode;
		} else {
			this.tail.next = oNewNode;
			oNewNode.prev = this.tail;
			this.tail = oNewNode;
		}

		this.size++;

		return true;
	};

	AppointmentsList.prototype.insertFirst = function (oData) {
		if (this.isEmpty()) {
			this.add(oData);
		} else {
			var oNewNode = oData;

			if (!(oData instanceof AppointmentNode)) {
				oNewNode = this.createNewNode(oData);
			}

			oNewNode.next = this.head;
			this.head.prev = oNewNode;
			this.head = oNewNode;

			this.size++;

			return true;
		}
	};

	AppointmentsList.prototype.insertAt = function (iIndex, oData) {
		var oCurrentNode = this.getHeadNode(),
			position = 0,
			oNewNode = oData;

		if (!(oData instanceof AppointmentNode)) {
			oNewNode = this.createNewNode(oData);
		}

		if (iIndex < 0) {
			return false;
		}

		if (iIndex === 0) {
			return this.insertFirst(oData);
		}

		if (iIndex > this.getSize() - 1) {
			return this.add(oData);
		}

		while (position < iIndex) {
			oCurrentNode = oCurrentNode.next;
			position++;
		}

		oCurrentNode.prev.next = oNewNode;
		oNewNode.prev = oCurrentNode.prev;
		oCurrentNode.prev = oNewNode;
		oNewNode.next = oCurrentNode;

		this.size++;

		return true;
	};

	AppointmentsList.prototype.insertAfterLevel = function (iLevel, oNode) {
		var iIndex = this.indexOf(oNode, function (oCurrentNode) {
				var bLastInLevel = oCurrentNode.level === iLevel;

				if (oCurrentNode.next && oCurrentNode.next.level === iLevel) {
					bLastInLevel = false;
				}

				return bLastInLevel;
			}),
			iSize = this.getSize();

		if (iIndex + 1 === iSize || iIndex === -1) {
			return this.add(oNode);
		} else {
			return this.insertAt(iIndex + 1, oNode);
		}
	};

	// AppointmentsList Iterator
	function AppointmentsIterator (oList) {
		this.list = oList;
		this.stopIterationFlag = false;

		this.currentNode = null;
	}

	AppointmentsIterator.prototype.next = function () {
		var oCurrentNode = this.currentNode;

		if (this.currentNode !== null) {
			this.currentNode = this.currentNode.next;
		}

		return oCurrentNode;
	};

	AppointmentsIterator.prototype.hasNext = function () {
		return this.currentNode !== null;
	};

	AppointmentsIterator.prototype.reset = function () {
		this.currentNode = this.list.getHeadNode();

		return this;
	};

	AppointmentsIterator.prototype.forEach = function (fnCallback, oThis) {
		var oCurrentNode;

		oThis = oThis || this;
		this.reset();

		while (this.hasNext() && !this.stopIterationFlag) {
			oCurrentNode = this.next();
			fnCallback.call(oThis, oCurrentNode);
		}

		this.stopIterationFlag = false;
	};

	AppointmentsIterator.prototype.interrupt = function () {
		this.stopIterationFlag = true;

		return this;
	};

	return {
		iterator: AppointmentsIterator,
		node: AppointmentNode,
		list: AppointmentsList
	};
});
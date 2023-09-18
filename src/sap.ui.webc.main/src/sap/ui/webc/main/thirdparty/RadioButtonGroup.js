sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  class RadioButtonGroup {
    static hasGroup(groupName) {
      return this.groups.has(groupName);
    }
    static getGroup(groupName) {
      return this.groups.get(groupName);
    }
    static getCheckedRadioFromGroup(groupName) {
      return this.checkedRadios.get(groupName);
    }
    static removeGroup(groupName) {
      this.checkedRadios.delete(groupName);
      return this.groups.delete(groupName);
    }
    static addToGroup(radioBtn, groupName) {
      if (this.hasGroup(groupName)) {
        this.enforceSingleSelection(radioBtn, groupName);
        if (this.getGroup(groupName)) {
          this.getGroup(groupName).push(radioBtn);
        }
      } else {
        this.createGroup(radioBtn, groupName);
      }
      this.updateTabOrder(groupName);
    }
    static removeFromGroup(radioBtn, groupName) {
      const group = this.getGroup(groupName);
      if (!group) {
        return;
      }
      const checkedRadio = this.getCheckedRadioFromGroup(groupName);
      // Remove the radio button from the given group
      group.forEach((_radioBtn, idx, arr) => {
        if (radioBtn._id === _radioBtn._id) {
          return arr.splice(idx, 1);
        }
      });
      if (checkedRadio === radioBtn) {
        this.checkedRadios.set(groupName, null);
      }
      // Remove the group if it is empty
      if (!group.length) {
        this.removeGroup(groupName);
      }
      this.updateTabOrder(groupName);
    }
    static createGroup(radioBtn, groupName) {
      if (radioBtn.checked) {
        this.checkedRadios.set(groupName, radioBtn);
      }
      this.groups.set(groupName, [radioBtn]);
    }
    static selectNextItem(item, groupName) {
      const group = this.getGroup(groupName);
      if (!group) {
        return;
      }
      const groupLength = group.length,
        currentItemPosition = group.indexOf(item);
      if (groupLength <= 1) {
        return;
      }
      const nextItemToSelect = this._nextSelectable(currentItemPosition, group);
      if (!nextItemToSelect) {
        return;
      }
      this.updateSelectionInGroup(nextItemToSelect, groupName);
    }
    static updateFormValidity(groupName) {
      const group = this.getGroup(groupName);
      if (!group) {
        return;
      }
      group.forEach(r => r._resetFormValidity());
      const groupRequiresValue = group.some(r => r.required) && group.every(r => !r.checked);
      if (groupRequiresValue) {
        group[0]._invalidateForm();
      }
    }
    static updateTabOrder(groupName) {
      const group = this.getGroup(groupName);
      if (!group) {
        return;
      }
      const hasCheckedRadio = group.some(radioBtn => radioBtn.checked);
      group.filter(radioBtn => !radioBtn.disabled).forEach((radioBtn, idx) => {
        if (hasCheckedRadio) {
          radioBtn._tabIndex = radioBtn.checked ? "0" : "-1";
        } else {
          radioBtn._tabIndex = idx === 0 ? "0" : "-1";
        }
      });
    }
    static selectPreviousItem(item, groupName) {
      const group = this.getGroup(groupName);
      if (!group) {
        return;
      }
      const groupLength = group.length,
        currentItemPosition = group.indexOf(item);
      if (groupLength <= 1) {
        return;
      }
      const previousItemToSelect = this._previousSelectable(currentItemPosition, group);
      if (!previousItemToSelect) {
        return;
      }
      this.updateSelectionInGroup(previousItemToSelect, groupName);
    }
    static selectItem(item, groupName) {
      this.updateSelectionInGroup(item, groupName);
      this.updateTabOrder(groupName);
    }
    static updateSelectionInGroup(radioBtnToSelect, groupName) {
      const checkedRadio = this.getCheckedRadioFromGroup(groupName);
      if (checkedRadio) {
        this._deselectRadio(checkedRadio);
      }
      this._selectRadio(radioBtnToSelect);
      this.checkedRadios.set(groupName, radioBtnToSelect);
    }
    static _deselectRadio(radioBtn) {
      if (radioBtn) {
        radioBtn.checked = false;
      }
    }
    static _selectRadio(radioBtn) {
      if (radioBtn) {
        radioBtn.focus();
        radioBtn.checked = true;
        radioBtn._checked = true;
        radioBtn.fireEvent("change");
      }
    }
    static _nextSelectable(pos, group) {
      if (!group) {
        return null;
      }
      const groupLength = group.length;
      let nextRadioToSelect = null;
      if (pos === groupLength - 1) {
        if (group[0].disabled || group[0].readonly) {
          return this._nextSelectable(1, group);
        }
        nextRadioToSelect = group[0];
      } else if (group[pos + 1].disabled || group[pos + 1].readonly) {
        return this._nextSelectable(pos + 1, group);
      } else {
        nextRadioToSelect = group[pos + 1];
      }
      return nextRadioToSelect;
    }
    static _previousSelectable(pos, group) {
      const groupLength = group.length;
      let previousRadioToSelect = null;
      if (pos === 0) {
        if (group[groupLength - 1].disabled || group[groupLength - 1].readonly) {
          return this._previousSelectable(groupLength - 1, group);
        }
        previousRadioToSelect = group[groupLength - 1];
      } else if (group[pos - 1].disabled || group[pos - 1].readonly) {
        return this._previousSelectable(pos - 1, group);
      } else {
        previousRadioToSelect = group[pos - 1];
      }
      return previousRadioToSelect;
    }
    static enforceSingleSelection(radioBtn, groupName) {
      const checkedRadio = this.getCheckedRadioFromGroup(groupName);
      if (radioBtn.checked) {
        if (!checkedRadio) {
          this.checkedRadios.set(groupName, radioBtn);
        } else if (radioBtn !== checkedRadio) {
          this._deselectRadio(checkedRadio);
          this.checkedRadios.set(groupName, radioBtn);
        }
      } else if (radioBtn === checkedRadio) {
        this.checkedRadios.set(groupName, null);
      }
      this.updateTabOrder(groupName);
      this.updateFormValidity(groupName);
    }
    static get groups() {
      if (!this._groups) {
        this._groups = new Map();
      }
      return this._groups;
    }
    static get checkedRadios() {
      if (!this._checkedRadios) {
        this._checkedRadios = new Map();
      }
      return this._checkedRadios;
    }
  }
  var _default = RadioButtonGroup;
  _exports.default = _default;
});
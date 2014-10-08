jQuery.sap.declare("sap.m.sample.TableMergeCells.Formatter");

sap.m.sample.TableMergeCells.Formatter = {

	weightState :  function (fValue) {
		try {
			fValue = parseFloat(fValue);
			if (fValue < 0) {
				return "None";
			} else if (fValue < 1000) {
				return "Success";
			} else if (fValue < 2000) {
				return "Warning";
			} else {
				return "Error";
			}
		} catch (err) {
			return "None";
		}
	}
};
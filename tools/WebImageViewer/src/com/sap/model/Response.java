package com.sap.model;

import java.io.Serializable;

public class Response implements Serializable {
	
	private static final long serialVersionUID = -6474445277889682423L;
	
	private int status = 200;
	
	private String message;
	
	/**Store data**/
	private Object data;
	
	/**Whether the operate is succeed**/
	private boolean isSuccess;

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

	public boolean isSuccess() {
		return isSuccess;
	}

	public void setSuccess(boolean isSuccess) {
		this.isSuccess = isSuccess;
	}
	
	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("Response [data=");
		builder.append(data);
		builder.append(", isSuccess=");
		builder.append(isSuccess);
		builder.append("]");
		return builder.toString();
	}
}

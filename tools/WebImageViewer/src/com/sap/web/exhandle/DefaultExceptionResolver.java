package com.sap.web.exhandle;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.TypeMismatchException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.servlet.mvc.multiaction.NoSuchRequestHandlingMethodException;

import com.sap.model.Response;
import com.sap.utils.SpringContextUtils;

public class DefaultExceptionResolver implements IRestExceptionResolver, InitializingBean {

	private Map<String, String> exceptionMappingDefinitions = Collections.emptyMap();

	private Map<String, Map<String, String>> exceptionMappings = Collections.emptyMap();
	
	private final static String STATUS = "status";
	
	private final static String MSG = "msg";

	@Override
	public void afterPropertiesSet() throws Exception {
		// populate with some defaults:
		Map<String, String> definitions = createDefaultExceptionMappingDefinitions();

		// add in user-specified mappings (will override defaults as necessary):
		if (this.exceptionMappingDefinitions != null && !this.exceptionMappingDefinitions.isEmpty()) {
			definitions.putAll(this.exceptionMappingDefinitions);
		}
		this.exceptionMappings = toExceptionMap(definitions);
	}

	private Map<String, Map<String, String>> toExceptionMap(Map<String, String> definitions) {
		Map<String, Map<String, String>> m = new HashMap<String, Map<String, String>>();
		for (String key : definitions.keySet()) {
			String value = definitions.get(key);
			m.put(key, getInfoMap(value));
		}
		return m;
	}

	private Map<String, String> getInfoMap(String exceptionConfig) {
		String[] values = StringUtils.commaDelimitedListToStringArray(exceptionConfig);
		if (values == null || values.length == 0) {
			throw new IllegalStateException(
					"Invalid config mapping. Exception names must map to a string configuration.");
		}
		boolean statusSet = false;
		boolean msgSet = false;
		Map<String, String> m = new HashMap<String, String>();
		for (String value : values) {
			if (!statusSet) {
				int val = getInt(STATUS, value);
				if (val > 0) {
					m.put(STATUS, val+"");
					statusSet = true;
					continue;
				}
			}
			if (!msgSet) {
				m.put(MSG, value);
				msgSet = true;
				continue;
			}
		}
		return m;
	}

	protected final Map<String, String> createDefaultExceptionMappingDefinitions() {

		Map<String, String> m = new LinkedHashMap<String, String>();

		// 400
		applyDef(m, HttpMessageNotReadableException.class, HttpStatus.BAD_REQUEST);
		applyDef(m, MissingServletRequestParameterException.class, HttpStatus.BAD_REQUEST);
		applyDef(m, TypeMismatchException.class, HttpStatus.BAD_REQUEST);

		// 404
		applyDef(m, NoSuchRequestHandlingMethodException.class, HttpStatus.NOT_FOUND);

		// 405
		applyDef(m, HttpRequestMethodNotSupportedException.class, HttpStatus.METHOD_NOT_ALLOWED);

		// 406
		applyDef(m, HttpMediaTypeNotAcceptableException.class, HttpStatus.NOT_ACCEPTABLE);

		// 415
		applyDef(m, HttpMediaTypeNotSupportedException.class, HttpStatus.UNSUPPORTED_MEDIA_TYPE);

		return m;
	}

	@Override
	public Response resolve(ServletWebRequest request, Object controller, Exception e) {
		Map<String, String> info = getConfigExceptionInfo(e);
		Response response = new Response();
		response.setStatus(Integer.valueOf(info.get(STATUS)));
		String exceptionMessageKey = e.getMessage();
		String exceptionMessage = SpringContextUtils.getApplicationContext().getMessage(exceptionMessageKey, null, e.getMessage(), Locale.US);
		String message = (info.get(MSG) == null || "".equals(info.get(MSG))) ? exceptionMessage : info.get(MSG);
		response.setMessage(message);
		response.setSuccess(false);
		return response;
	}

	private void applyDef(Map<String, String> m, Class<?> clazz, HttpStatus status) {
		applyDef(m, clazz.getName(), status);
	}

	private void applyDef(Map<String, String> m, String key, HttpStatus status) {
		m.put(key, status.value() + "");
	}

	private Map<String, String> getConfigExceptionInfo(Exception ex) {
		Map<String, Map<String, String>> mappings = this.exceptionMappings;
		if (CollectionUtils.isEmpty(mappings)) {
			return null;
		}
		Map<String, String> m = null;
		int deepest = Integer.MAX_VALUE;
		for (Map.Entry<String, Map<String, String>> entry : mappings.entrySet()) {
			String key = entry.getKey();
			int depth = getDepth(key, ex);
			if (depth >= 0 && depth < deepest) {
				deepest = depth;
				m = entry.getValue();
			}
		}
		return m;
	}

	/**
	 * Return the depth to the superclass matching.
	 * <p>
	 * 0 means ex matches exactly. Returns -1 if there's no match. Otherwise, returns depth. Lowest depth wins.
	 */
	protected int getDepth(String exceptionMapping, Exception ex) {
		return getDepth(exceptionMapping, ex.getClass(), 0);
	}

	private int getDepth(String exceptionMapping, Class<?> exceptionClass, int depth) {
		if (exceptionClass.getName().contains(exceptionMapping)) {
			// Found it!
			return depth;
		}
		// If we've gone as far as we can go and haven't found it...
		if (exceptionClass.equals(Throwable.class)) {
			return -1;
		}
		return getDepth(exceptionMapping, exceptionClass.getSuperclass(), depth + 1);
	}

	private int getRequiredInt(String key, String value) {
		try {
			int anInt = Integer.valueOf(value);
			return Math.max(-1, anInt);
		} catch (NumberFormatException e) {
			String msg = "Configuration element '" + key + "' requires an integer value.  The value " + "specified: "
					+ value;
			throw new IllegalArgumentException(msg, e);
		}
	}

	private int getInt(String key, String value) {
		try {
			return getRequiredInt(key, value);
		} catch (IllegalArgumentException iae) {
			return 0;
		}
	}

	public Map<String, String> getExceptionMappingDefinitions() {
		return exceptionMappingDefinitions;
	}

	public void setExceptionMappingDefinitions(Map<String, String> exceptionMappingDefinitions) {
		this.exceptionMappingDefinitions = exceptionMappingDefinitions;
	}
}

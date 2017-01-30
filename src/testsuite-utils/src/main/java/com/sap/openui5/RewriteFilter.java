package com.sap.openui5;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.apache.commons.io.IOUtils;


/**
 * The class <b><code>RewriteFilter</code></b> is used to
 * rewrite the placeholders defined as <code>${...}</code>
 * in the content of supported mime types with their proper
 * values. Those values can be passed as filter init parameters
 * to the RewriteFilter. Defaults will be taken from a properties
 * file.
 *
 * @author Peter Muessig
 */
public class RewriteFilter implements Filter {


  /** the filter configuration */
  private FilterConfig config;

  /** the map of properties to rewrite */
  private Map<String, String> properties;


  /* (non-Javadoc)
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  @Override
  public void init(FilterConfig config) throws ServletException {
    this.config = config;

    // create the properties map
    this.properties = new HashMap<String, String>();

    // read the rewrite properties from the RewriteFilter.properties
    InputStream is = null;
    try {
      is = this.getClass().getResource("RewriteFilter.properties").openStream();
      Properties properties = new Properties();
      properties.load(is);
      for (java.util.Map.Entry<Object, Object> entry : properties.entrySet()) {
        this.properties.put((String) entry.getKey(), (String) entry.getValue());
      }
    } catch (IOException ex) {
      this.config.getServletContext().log("The version information properties have not been found!");
    } finally {
      IOUtils.closeQuietly(is);
    }

    // init parameters of the RewriteFilter will overwrite the rewrite properties
    Enumeration<?> en = this.config.getInitParameterNames();
    while (en.hasMoreElements()) {
      String initParamName = (String) en.nextElement();
      this.properties.put(initParamName, this.config.getInitParameter(initParamName));
    }

  } // method: init


  /* (non-Javadoc)
   * @see javax.servlet.Filter#destroy()
   */
  @Override
  public void destroy() {
    this.config = null;
  } // method: destroy


  /* (non-Javadoc)
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    if (this.properties.size() > 0) {
      ResponseWrapper wrapper = new ResponseWrapper((HttpServletResponse) response, ((HttpServletRequest) request).getPathInfo(), this.properties);
      chain.doFilter(request, wrapper);
      wrapper.pipe((HttpServletResponse) response);
    } else {
      chain.doFilter(request, response);
    }
  } // method: doFilter


  /**
   * The class <b><code>ResponseWrapper</code></b> is used to intercept the response.
   */
  static class ResponseWrapper extends HttpServletResponseWrapper {


    /** content types which could be rewritten */
    private final static List<String> REWRITE_CONTENT_TYPES = Arrays.asList(new String[] {
      "application/javascript", "application/json", "application/xml", "text/plain", "text/css", "text/html"
    });

    /** headers which are blocked for the response */
    private final static List<String> BLOCKED_HEADERS = Arrays.asList(new String[] {
      "content-length", "transfer-encoding"
    });


    /** the path of the requested resource */
    private String requestPath;

    /** the map of properties to rewrite */
    private Map<String, String> properties;


    /** the stream */
    private ResponseWrapperOutputStream stream = new ResponseWrapperOutputStream();

    /** set of cookies */
    private Set<Cookie> cookies = new HashSet<Cookie>();

    /** set of headers (case insensitive) */
    private Map<String, List<Object>> headers = new TreeMap<String, List<Object>>(String.CASE_INSENSITIVE_ORDER);

    /** the status code */
    private int statusCode;

    /** the content type */
    private String contentType;

    /** reference to the <code>PrintWriter</code> */
    private PrintWriter writer;


    /**
     * constructs the class <code>CacheResponseWrapper</code>
     * @param response reference to the <code>HttpServletResponse</code>
     * @param requestPath the path of the requested resource
     * @param properties the map of properties to rewrite
     */
    ResponseWrapper(HttpServletResponse response, String requestPath, Map<String, String> properties) {
      super(response);
      this.requestPath = requestPath;
      this.properties = properties;
    } // constructor


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#addCookie(javax.servlet.http.Cookie)
     */
    @Override
    public void addCookie(Cookie cookie) {
      super.addCookie(cookie);
      this.cookies.add(cookie);
    } // method: addCookie


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#getContentType()
     */
    @Override
    public String getContentType() {
      return this.contentType;
    } // method: getContentType


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#setContentType(java.lang.String)
     */
    @Override
    public void setContentType(String type) {
      super.setContentType(type);
      this.contentType = type;
    } // method: setContentType


    /**
     * returns the status code for the request
     * @return status code
     */
    public int getStatus() {
      return this.statusCode;
    } // method: getStatus


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#setStatus(int, java.lang.String)
     */
    @Override
    public void setStatus(int sc, String sm) {
      if (this.statusCode != 0)
        return; // once we set the status it is not allowed to be changed anymore except on error!
      super.setStatus(sc, sm);
      this.statusCode = sc;
    } // method: setStatus


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#setStatus(int)
     */
    @Override
    public void setStatus(int sc) {
      if (this.statusCode != 0)
        return; // once we set the status it is not allowed to be changed anymore except on error!
      super.setStatus(sc);
      this.statusCode = sc;
    } // method: setStatus


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#sendError(int)
     */
    @Override
    public void sendError(int sc) throws IOException {
      super.sendError(sc);
      this.statusCode = sc;
    } // method: sendError


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#sendError(int, java.lang.String)
     */
    @Override
    public void sendError(int sc, String msg) throws IOException {
      super.sendError(sc, msg);
      this.statusCode = sc;
    } // method: sendError

    /**
     * adds a header value to the <code>List</code> of values or creates a new
     * one if it doesn't exist yet and put it into the headers <code>Map</code>.
     * @param name header name
     * @param value header value
     * @param overwrite flag whether to overwrite the header values or not
     */
    private void addHeaderValue(String name, Object value, boolean overwrite) {
      List<Object> headerValues = this.headers.get(name);
      if (overwrite || headerValues == null) {
        headerValues = new ArrayList<Object>();
        this.headers.put(name, headerValues);
      }
      if (!headerValues.contains(value)) {
        headerValues.add(value);
      }
    } // method: addHeaderValue

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#addDateHeader(java.lang.String, long)
     */
    @Override
    public void addDateHeader(String name, long date) {
      this.addHeaderValue(name, date, false);
    } // method: addDateHeader


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#addHeader(java.lang.String, java.lang.String)
     */
    @Override
    public void addHeader(String name, String value) {
      this.addHeaderValue(name, value, false);
    } // method:


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#addIntHeader(java.lang.String, int)
     */
    @Override
    public void addIntHeader(String name, int value) {
      this.addHeaderValue(name, value, false);
    } // method:


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#setDateHeader(java.lang.String, long)
     */
    @Override
    public void setDateHeader(String name, long date) {
      this.addHeaderValue(name, date, true);
    } // method: setDateHeader


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#setHeader(java.lang.String, java.lang.String)
     */
    @Override
    public void setHeader(String name, String value) {
      this.addHeaderValue(name, value, true);
    } // method: setHeader


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#setIntHeader(java.lang.String, int)
     */
    @Override
    public void setIntHeader(String name, int value) {
      this.addHeaderValue(name, value, true);
    } // method: setIntHeader


    /**
     * returns the last modified timestamp
     * @return last modified timestamp
     */
    public long getLastModified() {
      if (this.headers.containsKey("Last-Modified")) {
        return (Long) this.headers.get("Last-Modified").get(0);
      } else {
        return 0;
      }
    } // method: getContentType


    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServletResponseWrapper#containsHeader(java.lang.String)
     */
    @Override
    public boolean containsHeader(String name) {
      return this.headers.containsKey(name);
    } // method: containsHeader


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#getOutputStream()
     */
    @Override
    public ServletOutputStream getOutputStream() throws IOException {
      if (this.writer != null) {
        throw new IllegalStateException("Once you used the PrintWriter you cannot use the OutputStream anymore!");
      }
      return this.stream;
    } // method: getOutputStream


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#getWriter()
     */
    @Override
    public PrintWriter getWriter() throws IOException {
      if (this.writer == null) {
        if (this.stream.getBytes().length > 0) {
          throw new IllegalStateException("Once you used the OutputStream you cannot use the PrintWriter anymore!");
        }
        this.writer = new PrintWriter(stream); // NOSONAR
      }
      return this.writer;
    } // method: getWriter


    /**
     * flushes the potential buffer of the writer
     */
    private void flushWriter() {
      if (this.writer != null) {
        this.writer.flush();
      }
    } // method: flushWriter


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#flushBuffer()
     */
    @Override
    public void flushBuffer() throws IOException {
      this.flushWriter();
      this.stream.flush();
    } // method: flushBuffer


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#reset()
     */
    @Override
    public void reset() {
      this.flushWriter();
      this.stream.reset();
    } // method: reset


    /* (non-Javadoc)
     * @see javax.servlet.ServletResponseWrapper#resetBuffer()
     */
    @Override
    public void resetBuffer() {
      this.flushWriter();
      this.stream.reset();
    } // method: resetBuffer



    /**
     * pipes the cached response into a real response
     * @param response real response
     * @throws IOException
     */
    public void pipe(HttpServletResponse response) throws IOException {

      // apply the cookies
      for (Cookie cookie : this.cookies) {
        response.addCookie(cookie);
      }

      // apply the headers (except of BLOCKED_HEADERS)
      for (Entry<String, List<Object>> header : this.headers.entrySet()) {
        String name = header.getKey();
        if (!BLOCKED_HEADERS.contains(name.toLowerCase())) {
          List<Object> values = header.getValue();
          if ("Content-Type".equalsIgnoreCase(name)) {
            this.setContentType((String) values.get(0));
          } else {
            for (Object value : values) {
              if (value instanceof Long) {
                response.addDateHeader(name, (Long) value);
              } else if (value instanceof Integer) {
                response.addIntHeader(name, (Integer) value);
              } else {
                response.addHeader(name, value.toString());
              }
            }
          }
        }
      }

      //System.out.println(this.requestPath + ": " + this.getCharacterEncoding() + " - " + this.getContentType());
      String characterEncoding = requestPath != null && requestPath.endsWith(".properties") ? "ISO-8859-1" : "UTF-8";

      // set the char encoding and the content type
      response.setCharacterEncoding(characterEncoding);
      response.setContentType(this.getContentType());

      // if we have a valid status code we apply it
      if (this.statusCode > 0) {
        response.setStatus(this.statusCode);
      }

      // flush the buffers into the stream
      this.flushWriter();

      // finally let's serve the content (but do not rewrite unknown content types
      // and responses with a content encoding as they require a proper handler)
      if (REWRITE_CONTENT_TYPES.contains(this.getContentType()) &&
          !this.headers.containsKey("content-encoding")) {

        // add indicator that response has been rewritten
        response.addHeader("x-sap-RewriteFilter", "rewritten");

        // rewrite the content / replace placeholders with property values
        String content = new String(this.stream.getBytes(), characterEncoding);
        for (Map.Entry<String, String> property : this.properties.entrySet()) {
          content = content.replaceAll(Pattern.quote("${" + property.getKey() + "}"), Matcher.quoteReplacement(property.getValue()));
        }

        // write the content
        PrintWriter responseWriter = response.getWriter();
        responseWriter.write(content);
        responseWriter.flush();
        responseWriter.close();

      } else {
        response.getOutputStream().write(this.stream.getBytes());
        response.getOutputStream().close();
      }

    }


  } // inner class: ResponseWrapper


  /**
   * The class <b><code>ResponseWrapperOutputStream</code></b> is used to cache
   * the stream.
   */
  static class ResponseWrapperOutputStream extends ServletOutputStream {


    /** the stream */
    private ByteArrayOutputStream baos = new ByteArrayOutputStream();


    /**
     * returns the bytes
     * @return the bytes
     */
    public byte[] getBytes() {
      return this.baos.toByteArray();
    } // method: getBytes


    /**
     * resets the bytes
     */
    public void reset() {
      this.baos.reset();
    } // method: reset


    /* (non-Javadoc)
     * @see java.io.OutputStream#write(int)
     */
    public void write(int b) throws IOException {
      this.baos.write(b);
    } // method: write


    /* (non-Javadoc)
     * @see java.io.OutputStream#close()
     */
    @Override
    public void close() throws IOException {
      this.baos.close();
    } // method: close


    /* (non-Javadoc)
     * @see java.io.OutputStream#flush()
     */
    @Override
    public void flush() throws IOException {
      this.baos.flush();
    } // method: flush


    /* (non-Javadoc)
     * @see java.io.OutputStream#write(byte[], int, int)
     */
    @Override
    public void write(byte[] b, int off, int len) throws IOException {
      this.baos.write(b, off, len);
    } // method: write


    /* (non-Javadoc)
     * @see java.io.OutputStream#write(byte[])
     */
    @Override
    public void write(byte[] b) throws IOException {
      this.baos.write(b);
    } // method: write


  } // inner class: ResponseWrapperOutputStream


} // class: RewriteFilter

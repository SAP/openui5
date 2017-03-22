package com.sap.openui5;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * The class <code>CacheControlFilter</code> is used to simply append the
 * Cache-Control header to the response to prevent the caching.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 *
 * @author Peter Muessig
 */
public class CacheControlFilter implements Filter {


  /* (non-Javadoc)
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
  } // method: init


  /* (non-Javadoc)
   * @see javax.servlet.Filter#destroy()
   */
  @Override
  public void destroy() {
  } // method: destroy


  /* (non-Javadoc)
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

    // make sure that the request/response are http request/response
    if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
      HttpServletResponse httpResponse = (HttpServletResponse) response;
      httpResponse.setHeader("Cache-Control", "no-cache, no-store");
    }

    // proceed in the filter chain
    chain.doFilter(request, response);

  } // method: doFilter


} // class: CacheControlFilter
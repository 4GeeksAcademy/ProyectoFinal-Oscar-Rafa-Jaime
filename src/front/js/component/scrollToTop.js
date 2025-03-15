// src/front/js/component/scrollToTop.js
import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ children }) => {
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return children;
};

ScrollToTop.propTypes = {
  children: PropTypes.any
};

export default ScrollToTop;

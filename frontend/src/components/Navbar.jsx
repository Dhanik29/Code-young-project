import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// This top-level Navbar has been disabled because HomePage.jsx now renders
// its own in-page navbar (Home / Our Mentors / Why Codeyoung / FAQ) with
// same-page anchor scrolling. Returning null keeps this component's export
// intact (so App.jsx or wherever it's imported doesn't break) while
// rendering nothing.
export const Navbar = () => {
  return null;
};
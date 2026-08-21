"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { BottomTabBar } from "./BottomTabBar";
import { MobileMenu } from "./MobileMenu";

export const AppChrome = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Navbar onMenuClick={() => setMenuOpen(true)} />
      <BottomTabBar onMoreClick={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

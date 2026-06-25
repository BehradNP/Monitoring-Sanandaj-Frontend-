"use client";

import React from "react";
import { FiUser } from "react-icons/fi";

export default function Header() {
  return (
    <header className="w-full px-8 pt-6">
      <div className="flex items-center justify-between">
        {}
        <div />

        {/*User*/}
        <div
          className="flex items-center gap-3"
          dir="ltr"
        >
          {/*Icon*/}
          <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <FiUser className="text-blue-600" size={18} />
          </div>

          {/*Name*/}
          <div className="text-[15px] font-semibold text-slate-900">
            محمد محمدی
          </div>
        </div>
      </div>
    </header>
  );
}

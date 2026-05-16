"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const filters = [
  "Tonight",
  "This week",
  "Free",
  "21+",
  "LGBTQ+",
  "Sport",
  "Workshop",
  "Music",
];

export function FilterBar() {
  const [active, setActive] = useState("This week");

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {filters.map((filter) => {
          const isActive = active === filter;
          return (
            <motion.button
              key={filter}
              onClick={() => setActive(filter)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";

type Props = {};

const BasicLoader = (props: Props) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-theme-sidebar-accent"></div>
    </div>
  );
};

export default BasicLoader;

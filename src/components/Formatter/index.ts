import dynamic from "next/dynamic";

export const component = {
  Code: dynamic(() => import("./Code")),
};

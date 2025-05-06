import react, { PropsWithChildren } from "react";
import "../styles.css";

const RootLayout: react.FC<react.PropsWithChildren<{}>> = async ({
  children,
}) => {
  return <>{children}</>;
};
export default RootLayout;

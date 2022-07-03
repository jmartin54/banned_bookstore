import React, { useCallback, useEffect, useState } from "react";

export default function useWallet() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [utilityPartial, setUtilityPartial] = useState<
    React.ReactNode | undefined
  >();

  const handleClick = useCallback(() => {
    setWallet("0x000000000000000000");
    console.log("0x000000000000000000");
  }, []);

  useEffect(() => {
    console.log("[wallet]");
    if (wallet == null) {
      setUtilityPartial(
        <button onClick={handleClick}>Sign in with Metamask</button>
      );
    } else {
      setUtilityPartial(<div>logged in as {wallet}</div>);
    }
  }, [wallet]);

  console.log("return");
  return { wallet, utilityPartial };
}

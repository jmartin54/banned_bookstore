import { useEffect, useState } from "react";
import useWallet from "./Wallet";

export default function useListingFactory() {
  const { utilityPartial: walletPartial } = useWallet();
  const [utilityPartial, setUtilityPartial] = useState<
    React.ReactNode | undefined
  >();
  const [listingFactory, setListingFactory] = useState("loading");

  useEffect(() => {
    setTimeout(() => setListingFactory("loaded"), 1500);
    setTimeout(() => setListingFactory("error"), 3000);
  }, []);

  useEffect(() => {
    setUtilityPartial(<h1>{listingFactory}</h1>);
    if (listingFactory === "error") setUtilityPartial(walletPartial);
  }, [setUtilityPartial, listingFactory, walletPartial]);

  return { listingFactory, utilityPartial };
}

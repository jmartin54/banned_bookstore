import { useEffect, useState } from "react";

export default function useListing() {
  const [listing, setListing] = useState("loading");

  useEffect(() => {
    setTimeout(() => setListing("loaded"), 1500);
    setTimeout(() => setListing("error"), 5000);
  }, []);

  return { listing };
}

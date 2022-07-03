import useListingFactory from "../contracts/ListingFactory";

export default function ListingCreate() {
  const { listingFactory, utilityPartial } = useListingFactory();
  return (
    <div>
      <h1>Create Book Listing</h1>
      <p>{listingFactory}</p>
      {utilityPartial}
    </div>
  );
}

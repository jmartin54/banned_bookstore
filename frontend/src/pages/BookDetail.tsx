import { useParams } from "react-router-dom";

export default function BookDetail() {
  let params = useParams();
  return <h1> Showing book {params.address} </h1>;
}

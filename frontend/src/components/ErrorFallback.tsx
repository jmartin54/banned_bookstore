import { FallbackProps } from "react-error-boundary";

export default function ErrorFallback({ error }: FallbackProps) {
  return (
    <>
      <h1>500 Internal Error</h1>
      <p>{error.message}</p>
    </>
  );
}

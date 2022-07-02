import { Book } from "../models/Book";

type BookPreviewProps = {
  book: Book;
};

export default function ({ book }: BookPreviewProps) {
  return (
    <div>
      <h1>{book.author}</h1>
      <p>{book.description}</p>
    </div>
  );
}

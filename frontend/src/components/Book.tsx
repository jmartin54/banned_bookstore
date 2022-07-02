import { Book } from "../models/Book";

type BookProps = {
  book: Book;
};
export default function Book({ book }: BookProps) {
  return <div>{book.author}</div>;
}

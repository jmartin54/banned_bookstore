import logo from "../logo.svg";
import "./Header.css";

export default function Header() {
  return (
    <header className="App-header">
      <a className="App-link" href="/" rel="noopener noreferrer">
        <img src={logo} className="App-logo" alt="logo" />
      </a>
      <div className="spacer"></div>
      <div className="links">
        <a className="App-link" href="/listing" rel="noopener noreferrer">
          List a book
        </a>
        <a className="App-link" href="/donate/" rel="noopener noreferrer">
          Donate
        </a>
        <a className="App-link" href="/emailList/" rel="noopener noreferrer">
          Email list
        </a>
      </div>
    </header>
  );
}

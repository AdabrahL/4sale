import { useState, useEffect, useRef } from "react";
import "./TextType.css";

export default function TextType({
  text = ["Text typing effect", "for your websites", "Happy coding!"],
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "|",
  className = "",
  element: Element = "h1",
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!text || text.length === 0) return;

    const currentWord = text[wordIndex % text.length];
    let timeout;

    if (!isDeleting) {
      // Typing
      timeout = setTimeout(() => {
        if (!mountedRef.current) return;
        const next = currentWord.slice(0, displayed.length + 1);
        setDisplayed(next);
        if (next === currentWord) {
          // Pause, then start deleting
          setTimeout(() => {
            if (!mountedRef.current) return;
            setIsDeleting(true);
          }, pauseDuration);
        }
      }, typingSpeed);
    } else {
      // Deleting
      timeout = setTimeout(() => {
        if (!mountedRef.current) return;
        const next = currentWord.slice(0, displayed.length - 1);
        setDisplayed(next);
        if (next === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % text.length);
        }
      }, Math.max(40, Math.floor(typingSpeed / 2)));
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed, isDeleting, wordIndex, text, typingSpeed, pauseDuration]);

  return (
    <Element className={`${className} text-type`}>
      {displayed}
      {showCursor && (
        <span aria-hidden="true" className="text-type__cursor">
          {cursorCharacter}
        </span>
      )}
    </Element>
  );
}
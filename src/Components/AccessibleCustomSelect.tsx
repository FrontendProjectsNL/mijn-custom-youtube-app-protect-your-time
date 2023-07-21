import { useRef, useEffect, useState } from "react";
import './AccessibleCustomSelect.css'

interface Option {
  value: string;
  label: string;
  namespace?: string;
}

interface Props {
  value: string;
  options: Option[];
  namespace?: string;
  label: string;
  onChange?: (value: string) => void; // Add "?" to make it optional
}

const isSafari = () => {
  const chromeInAgent = navigator.userAgent.indexOf("Chrome") > -1;
  const safariInAgent = navigator.userAgent.indexOf("Safari") > -1;
  return safariInAgent && !chromeInAgent;
};

/* ------------------------------ */

const registerOpenDropdownHandlers = ({
  optionsLength,
  activeIndex,
  setActiveIndex,
  select,
  namespace,
}) => {
  const keyDownCallback = (e) => {
    e.preventDefault();
    console.log(e);
    switch (e.key) {
      case "Up":
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(activeIndex <= 0 ? optionsLength - 1 : activeIndex - 1);
        return;
      case "Down":
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(activeIndex + 1 === optionsLength ? 0 : activeIndex + 1);
        return;
      case "Enter":
      case " ": // Space
        e.preventDefault();
        if (activeIndex !== -1) {
          select(options[activeIndex].value);
        } else {
          select(false);
        }
        return;
      case "Esc":
      case "Escape":
        e.preventDefault();
        select(false);
        return;
      case "PageUp":
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        return;
      case "PageDown":
      case "End":
        e.preventDefault();
        setActiveIndex(optionsLength - 1);
        return;
    }
  };

  const onClick = (e) => {
    if (
      !e.composedPath().find(
        (e) =>
          e.dataset && e.dataset.namespace === namespace + "-dropdown-root"
      )
    ) {
      // Did not found in path, closing
      e.preventDefault();
      select(false);
    }
  };

  document.addEventListener("keydown", keyDownCallback);
  document.addEventListener("click", onClick);
  return () => {
    document.removeEventListener("keydown", keyDownCallback);
    document.removeEventListener("click", onClick);
  };
};
/* ------------------------ */

const registerClosedDropdownHandlers = ({ setIsDropdownOpen }) => {
  const keyDownCallback = (e) => {
    switch (e.key) {
      case "Up":
      case "ArrowUp":
      case "Down":
      case "ArrowDown":
        e.preventDefault();
        setIsDropdownOpen(true);
        break;
      case "Enter":
      case " ": // Space
        e.preventDefault();
        setIsDropdownOpen(true);
        break;
      case "Esc":
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        break;
    }
  };

  document.addEventListener("keydown", keyDownCallback);
  return () => {
    document.removeEventListener("keydown", keyDownCallback);
  };
};
/* -------------------- */

const useAccessibleDropdown = ({
  options,
  value,
  onChange,
  namespace,
}:Props): {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  select: (value: string) => void;
  setIsFocus: (v: boolean) => void;
  listRef: React.RefObject<HTMLUListElement>;
} => {
  const [isDropdownOpen, setIsDropdownOpenInternal] = useState(false);
  const listRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocus, setIsFocus] = useState(false);
  const [isOptionSelected, setIsOptionSelected] = useState(false)
  const select = (value: string) => {
    if (value) {
      onChange && onChange(value);
      setIsOptionSelected(true); // Update the state variable
    } else {
      setIsOptionSelected(false); // Update the state variable
    }
    setIsDropdownOpen(false);
  };

  const setIsDropdownOpen = (v: boolean) => {
    if (v) {
      const selected = options.findIndex(o => o.value === value);
      setActiveIndex(selected < 0 ? 0 : selected);
      if (listRef.current && isSafari()) {
        requestAnimationFrame(() => {
          listRef.current.focus();
        });
      }
    } else {
      if (listRef.current && isSafari()) {
        requestAnimationFrame(() => {
          listRef.current.previousSibling.focus();
        });
      }
    }
    setIsDropdownOpenInternal(v);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      return registerOpenDropdownHandlers({
        activeIndex,
        setActiveIndex,
        optionsLength: options.length,
        select,
        namespace
      });
    } else if (!isDropdownOpen && isFocus) {
      return registerClosedDropdownHandlers({
        setIsDropdownOpen,
        isDropdownOpen
      });
    }
  }, [isDropdownOpen, isFocus, activeIndex, namespace]);

  return {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocus,
    listRef,
  };
};

/* ------------------- */

export const Select = ({
  options,
  value,
  namespace = 'default_select_namespace',
  onChange,
  label
}: Props) => {
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocus,
    listRef
  } = useAccessibleDropdown({ options, value, onChange, namespace });
  const chosen = options.find(o => o.value === value);

  return (
    <>

      <label className="select-label" id={`${namespace}_label`}>{label}</label>
      <div className="select-container" data-namespace={`${namespace}-dropdown-root`}>
        <button
          className="select-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          role="combobox"

          aria-autocomplete="none"
          aria-label="Choose your favourite Ninjago character"

          aria-haspopup="listbox"
          aria-controls={`${namespace}_dropdown`}
          aria-expanded={isDropdownOpen}
          aria-activedescendant={`${namespace}_element_${value}`}
        >
          Selected: {chosen.label}
          <span className="chevron">▾</span>
        </button>
        <ul
          className="select-dropdown"
          ref={listRef}
          role="listbox"
          id={`${namespace}_dropdown`}
          tabIndex={-1}
        >
          {options.map(({ label, value: optionValue, tag }, index) => (
            <li
              key={optionValue}
              id={`${namespace}_element_${optionValue}`}
              aria-selected={index === activeIndex}
              role="option"
              onMouseOver={() => setActiveIndex(index)}
            >
              <label>
                <input
                  type="radio"
                  name={`${namespace}_radio`}
                  value={optionValue}
                  className={chosen.value === optionValue ? 'checked' : ''}
                  checked={chosen.value === optionValue}
                  onChange={() => select(optionValue)}
                />
                <span>
                  {label}
                </span>
                <div>
                  {tag && (
                    <span className="tag">
                      <span className="visuallyHidden">; Labeled:</span>
                      {tag}
                    </span>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

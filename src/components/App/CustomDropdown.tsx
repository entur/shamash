import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomDropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  selected: string;
  onChange: (value: string) => void;
  label: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, selected, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        className={styles.button}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        {label}
        <svg width="14" height="8"><path fill="#666" d="M 5 1.5 L 14 1.5 L 9.5 7 z"></path></svg>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={styles.option + (option.value === selected ? ' ' + styles.selected : '')}
              role="option"
              aria-selected={option.value === selected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.value === selected && <span className={styles.check}>✓</span>}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;

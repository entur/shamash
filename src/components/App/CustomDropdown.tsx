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

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selected,
  onChange,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        className={styles.button}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        {label}
        <svg width="14" height="8" aria-hidden="true" focusable="false">
          <path fill="#666" d="M 5 1.5 L 14 1.5 L 9.5 7 z"></path>
        </svg>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              className={`${styles.option}${
                option.value === selected ? ` ${styles.selected}` : ''
              }`}
              aria-current={option.value === selected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.value === selected && (
                <span className={styles.check}>✓</span>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

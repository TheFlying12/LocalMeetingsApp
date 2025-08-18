import { useState, useRef, useEffect } from 'react';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
];

export default function StateDropdown({ value, onChange, placeholder = "Select state" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredStates = US_STATES.filter(
    s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = US_STATES.find(s => s.code === value);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (state) => {
    onChange(state.code);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (['Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((p) => (p + 1) % filteredStates.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((p) => (p - 1 + filteredStates.length) % filteredStates.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredStates[highlightedIndex]) handleSelect(filteredStates[highlightedIndex]);
    }
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (selected?.name || '')}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="State"
          className="w-full min-w-60 rounded-md border border-gray-300 px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-smooth"
          autoComplete="off"
        />
        {/* Clear / Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" />
          </svg>
        </div>
        {selected && !isOpen && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-7 my-1 inline-flex items-center rounded-md px-1.5 text-gray-500 hover:bg-gray-100 transition-smooth"
            aria-label="Clear selected state"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full min-w-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-md"
          style={{ maxHeight: `${5 * 44}px` }}
        >
          {filteredStates.length > 0 ? (
            filteredStates.map((s, idx) => (
              <div
                role="option"
                aria-selected={value === s.code}
                key={s.code}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(s)}
                className={`cursor-pointer px-4 py-3 transition-smooth ${
                  idx === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                } flex items-center justify-between`}
              >
                <span>{s.name}</span>
                <span className="text-gray-500 text-sm">{s.code}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">No states found</div>
          )}
        </div>
      )}
    </div>
  );
}

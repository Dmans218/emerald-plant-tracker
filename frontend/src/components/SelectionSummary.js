import React from 'react';
import PropTypes from 'prop-types';

/**
 * SelectionSummary component for bulk selection feedback.
 * Cannabis aesthetic: dark background, green accents, rounded corners.
 *
 * Props:
 * - selectedCount: number of selected records
 * - dateRange: string (e.g., 'Jul 1–Jul 10')
 * - tent: string (e.g., 'Tent A')
 */
const SelectionSummary = ({ selectedCount, dateRange, tent }) => (
  <div
    className="selection-summary bg-gray-800 border border-green-500 rounded-lg p-3 flex items-center gap-2"
    style={{ minWidth: 220 }}
  >
    <span
      className="inline-block px-3 py-1 rounded-full bg-green-600 text-white font-semibold text-sm shadow"
      style={{ letterSpacing: '0.02em' }}
    >
      {selectedCount} records selected
    </span>
    <span className="text-gray-300 ml-2 text-xs">
      from <span className="font-bold text-green-400">{tent}</span> ({dateRange})
    </span>
  </div>
);

SelectionSummary.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  dateRange: PropTypes.string.isRequired,
  tent: PropTypes.string.isRequired,
};

export default SelectionSummary;

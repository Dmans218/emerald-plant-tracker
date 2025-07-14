import React from 'react';
import PropTypes from 'prop-types';

/**
 * BulkSelectionTools component for bulk selection actions.
 * Cannabis aesthetic: green accents, dark background, rounded corners.
 *
 * Props:
 * - onSelectAll: function
 * - onSelectByStage: function
 * - onSelectRange: function
 */
const BulkSelectionTools = ({ onSelectAll, onSelectByStage, onSelectRange }) => (
  <div className="bulk-tools flex gap-2 mb-4">
    <button
      type="button"
      className="border border-green-500 text-green-500 rounded px-3 py-1 bg-gray-900 hover:bg-green-900 transition"
      onClick={onSelectAll}
    >
      Select All
    </button>
    <button
      type="button"
      className="border border-green-500 text-green-500 rounded px-3 py-1 bg-gray-900 hover:bg-green-900 transition"
      onClick={onSelectByStage}
    >
      Select by Stage
    </button>
    <button
      type="button"
      className="border border-green-500 text-green-500 rounded px-3 py-1 bg-gray-900 hover:bg-green-900 transition"
      onClick={onSelectRange}
    >
      Select Range
    </button>
  </div>
);

BulkSelectionTools.propTypes = {
  onSelectAll: PropTypes.func.isRequired,
  onSelectByStage: PropTypes.func.isRequired,
  onSelectRange: PropTypes.func.isRequired,
};

export default BulkSelectionTools;

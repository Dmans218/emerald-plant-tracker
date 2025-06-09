// Shared utility for plant stage colors
export const getStageColor = (stage) => {
  const stageColors = {
    'Seedling': {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#6ee7b7',
      border: 'rgba(16, 185, 129, 0.4)'
    },
    'Vegetative': {
      bg: 'rgba(52, 211, 153, 0.15)',
      color: '#34d399',
      border: 'rgba(52, 211, 153, 0.4)'
    },
    'Flowering': {
      bg: 'rgba(244, 114, 182, 0.15)',
      color: '#f472b6',
      border: 'rgba(244, 114, 182, 0.4)'
    },
    'Harvest': {
      bg: 'rgba(251, 191, 36, 0.15)',
      color: '#fbbf24',
      border: 'rgba(251, 191, 36, 0.4)'
    },
    'Drying': {
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.4)'
    },
    'Curing': {
      bg: 'rgba(161, 98, 7, 0.15)',
      color: '#a16207',
      border: 'rgba(161, 98, 7, 0.4)'
    },
    'Cured': {
      bg: 'rgba(167, 139, 250, 0.15)',
      color: '#a78bfa',
      border: 'rgba(167, 139, 250, 0.4)'
    }
  };
  
  return stageColors[stage] || {
    bg: 'rgba(100, 116, 139, 0.15)',
    color: '#64748b',
    border: 'rgba(100, 116, 139, 0.4)'
  };
};

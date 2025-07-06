import { format } from 'date-fns';
import {
    Archive,
    ArrowUpDown,
    Calendar,
    Clock,
    Download,
    Droplets,
    Eye,
    Filter,
    MapPin,
    Search,
    Sun,
    Thermometer,
    Trash2,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { plantsApi } from '../utils/api';

const ArchivedTents = () => {
  const [archivedGrows, setArchivedGrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('harvest_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedGrow, setSelectedGrow] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchArchivedGrows();
  }, []);

  const fetchArchivedGrows = async () => {
    try {
      setLoading(true);
      const response = await plantsApi.getArchivedGrows();
      setArchivedGrows(response.data);
    } catch {
      toast.error('Failed to fetch archived grows');
    } finally {
      setLoading(false);
    }
  };

  const handleExportGrow = async (grow) => {
    try {
      toast.loading('Preparing export...');
      await plantsApi.exportArchivedGrow(grow.id);
      toast.dismiss();
      toast.success('Export downloaded successfully');
    } catch {
      toast.dismiss();
      toast.error('Failed to export grow data');
    }
  };

  const handleExportTent = async (tentName) => {
    try {
      toast.loading('Preparing tent export...');
      const response = await plantsApi.exportArchivedTent(tentName);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tentName}_complete_grow_data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Tent data exported successfully');
    } catch {
      toast.dismiss();
      toast.error('Failed to export tent data');
    }
  };

  const handleClearTentData = async (tentName) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete ALL environment data for tent "${tentName}".\n\n` +
      `This action:\n` +
      `• Clears all temperature, humidity, pH, and other environment logs\n` +
      `• Cannot be undone\n` +
      `• Should only be done when starting a completely new grow cycle\n\n` +
      `Are you absolutely sure you want to continue?`
    );

    if (!confirmed) return;

    try {
      toast.loading('Clearing tent environment data...');
      await plantsApi.clearTentEnvironmentData(tentName, true);
      toast.dismiss();
      toast.success(`Environment data cleared for tent ${tentName}`);
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to clear tent data');
    }
  };

  const handleViewDetails = async (grow) => {
    try {
      const response = await plantsApi.getArchivedGrow(grow.id);
      setSelectedGrow(response.data);
      setShowDetailModal(true);
    } catch {
      toast.error('Failed to load grow details');
    }
  };

  // Filter and sort archived grows
  const filteredAndSortedGrows = archivedGrows
    .filter(grow => {
      const matchesSearch = grow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           grow.strain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           grow.tent_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterBy === 'all' || grow.archive_reason === filterBy;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'harvest_date' || sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getArchiveReasonColor = (reason) => {
    switch (reason) {
      case 'completed': return '#10b981';
      case 'died': return '#ef4444';
      case 'removed': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getArchiveReasonText = (reason) => {
    switch (reason) {
      case 'completed': return 'Completed Harvest';
      case 'died': return 'Plant Died';
      case 'removed': return 'Removed Early';
      default: return 'Other';
    }
  };

  const calculateGrowDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Unknown';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8' }}>Loading archived grows...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              <Archive className="w-8 h-8" style={{ display: 'inline-block', marginRight: '0.75rem', verticalAlign: 'middle' }} />
              Archived Grows
            </h1>
            <p className="dashboard-subtitle">
              View and export data from completed grows
            </p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'fadeInUp 0.8s ease-out 0.2s both',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search className="w-5 h-5" style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Search by plant name, strain, or tent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Filters and Sort */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{
                padding: '0.5rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Archives</option>
              <option value="completed">Completed</option>
              <option value="died">Died</option>
              <option value="removed">Removed</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              style={{
                padding: '0.5rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '0.875rem'
              }}
            >
              <option value="harvest_date-desc">Newest First</option>
              <option value="harvest_date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="final_yield-desc">Highest Yield</option>
              <option value="final_yield-asc">Lowest Yield</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tent Export Section */}
      {(() => {
        const uniqueTents = [...new Set(archivedGrows.map(grow => grow.grow_tent).filter(Boolean))];

        return (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            padding: '1.5rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'fadeInUp 0.8s ease-out 0.3s both'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#f8fafc',
              fontSize: '1.125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Download className="w-5 h-5 text-emerald-400" />
              Export Complete Tent Data
            </h3>
            {uniqueTents.length > 0 ? (
              <>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  Export all plant activity and environment data for each tent
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  {uniqueTents.map(tentName => {
                    const tentGrowCount = archivedGrows.filter(grow => grow.grow_tent === tentName).length;
                    return (
                      <button
                        key={tentName}
                        onClick={() => handleExportTent(tentName)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                      >                      <Download className="w-4 h-4" />
                      {tentName} ({tentGrowCount} grows)
                    </button>
                  );
                })}
              </div>

              {/* Tent Management Section */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(100, 116, 139, 0.2)'
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  Tent Management
                </h4>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}>
                  Clear environment data from tents to start fresh grow cycles
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  {uniqueTents.map(tentName => (
                    <button
                      key={`clear-${tentName}`}
                      onClick={() => handleClearTentData(tentName)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear {tentName} Data
                    </button>
                  ))}
                </div>
              </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  No tent data available for export
                </p>
                <p style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}>
                  Archive plants assigned to grow tents to enable tent-based exports
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
        Showing {filteredAndSortedGrows.length} of {archivedGrows.length} archived grows
      </div>

      {/* Archived Grows Grid */}
      {filteredAndSortedGrows.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          <Archive className="w-12 h-12 mx-auto mb-4" style={{ color: '#64748b' }} />
          <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            No archived grows found
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            {searchTerm || filterBy !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Archive some plants to see them here'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          {filteredAndSortedGrows.map((grow) => (
            <ArchivedGrowCard
              key={grow.id}
              grow={grow}
              onExport={handleExportGrow}
              onViewDetails={handleViewDetails}
              calculateGrowDuration={calculateGrowDuration}
              getArchiveReasonColor={getArchiveReasonColor}
              getArchiveReasonText={getArchiveReasonText}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedGrow && (
        <GrowDetailModal
          grow={selectedGrow}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedGrow(null);
          }}
          onExport={handleExportGrow}
          calculateGrowDuration={calculateGrowDuration}
          getArchiveReasonColor={getArchiveReasonColor}
          getArchiveReasonText={getArchiveReasonText}
        />
      )}
    </div>
  );
};

// Archived Grow Card Component
const ArchivedGrowCard = ({
  grow,
  onExport,
  onViewDetails,
  calculateGrowDuration,
  getArchiveReasonColor,
  getArchiveReasonText
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.25)';
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#f1f5f9',
            marginBottom: '0.25rem'
          }}>
            {grow.name}
          </h3>
          {grow.strain && (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
              {grow.strain}
            </p>
          )}
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          background: `${getArchiveReasonColor(grow.archive_reason)}20`,
          border: `1px solid ${getArchiveReasonColor(grow.archive_reason)}40`,
          color: getArchiveReasonColor(grow.archive_reason),
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {getArchiveReasonText(grow.archive_reason)}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Harvest Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar className="w-4 h-4" style={{ color: '#94a3b8' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>HARVESTED</div>
            <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: '500' }}>
              {grow.harvest_date ? format(new Date(grow.harvest_date), 'MMM dd, yyyy') : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock className="w-4 h-4" style={{ color: '#94a3b8' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DURATION</div>
            <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: '500' }}>
              {calculateGrowDuration(grow.created_at, grow.harvest_date)}
            </div>
          </div>
        </div>

        {/* Yield */}
        {grow.final_yield && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>YIELD</div>
              <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                {grow.final_yield}g
              </div>
            </div>
          </div>
        )}

        {/* Tent */}
        {grow.tent_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>TENT</div>
              <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: '500' }}>
                {grow.tent_name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Environment Summary */}
      {(grow.avg_temperature || grow.avg_humidity || grow.avg_light_intensity) && (
        <div style={{
          padding: '1rem',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem' }}>
            ENVIRONMENT AVERAGES
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {grow.avg_temperature && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Thermometer className="w-3 h-3" style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>
                  {grow.avg_temperature.toFixed(1)}°C
                </span>
              </div>
            )}
            {grow.avg_humidity && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Droplets className="w-3 h-3" style={{ color: '#3b82f6' }} />
                <span style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>
                  {grow.avg_humidity.toFixed(1)}%
                </span>
              </div>
            )}
            {grow.avg_light_intensity && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sun className="w-3 h-3" style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>
                  {grow.avg_light_intensity.toFixed(0)} PPFD
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          data-testid="archivedtent-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(grow);
          }}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.1)';
          }}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport(grow);
          }}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  );
};

// Grow Detail Modal Component
const GrowDetailModal = ({
  grow,
  onClose,
  onExport,
  calculateGrowDuration,
  getArchiveReasonColor,
  getArchiveReasonText
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                {grow.name}
              </h2>
              {grow.strain && (
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>
                  Strain: {grow.strain}
                </p>
              )}
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: `${getArchiveReasonColor(grow.archive_reason)}20`,
              border: `1px solid ${getArchiveReasonColor(grow.archive_reason)}40`,
              color: getArchiveReasonColor(grow.archive_reason),
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {getArchiveReasonText(grow.archive_reason)}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DURATION</div>
              <div style={{ fontSize: '1rem', color: '#f1f5f9', fontWeight: '600' }}>
                {calculateGrowDuration(grow.created_at, grow.harvest_date)}
              </div>
            </div>

            {grow.final_yield && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>YIELD</div>
                <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: '600' }}>
                  {grow.final_yield}g
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>HARVESTED</div>
              <div style={{ fontSize: '1rem', color: '#f1f5f9', fontWeight: '600' }}>
                {grow.harvest_date ? format(new Date(grow.harvest_date), 'MMM dd') : 'Unknown'}
              </div>
            </div>

            {grow.environmentLogCount && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DATA POINTS</div>
                <div style={{ fontSize: '1rem', color: '#f1f5f9', fontWeight: '600' }}>
                  {grow.environmentLogCount}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Environment Data Summary */}
        {(grow.avg_temperature || grow.avg_humidity || grow.avg_light_intensity) && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
              Environment Summary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {grow.avg_temperature && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Thermometer className="w-4 h-4" style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>Temperature</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', color: '#ef4444', fontWeight: '700' }}>
                    {grow.avg_temperature.toFixed(1)}°C
                  </div>
                  {grow.min_temperature && grow.max_temperature && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Range: {grow.min_temperature.toFixed(1)}° - {grow.max_temperature.toFixed(1)}°
                    </div>
                  )}
                </div>
              )}

              {grow.avg_humidity && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Droplets className="w-4 h-4" style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>Humidity</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', color: '#3b82f6', fontWeight: '700' }}>
                    {grow.avg_humidity.toFixed(1)}%
                  </div>
                  {grow.min_humidity && grow.max_humidity && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Range: {grow.min_humidity.toFixed(1)}% - {grow.max_humidity.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              {grow.avg_light_intensity && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Sun className="w-4 h-4" style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>Light</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: '700' }}>
                    {grow.avg_light_intensity.toFixed(0)} PPFD
                  </div>
                  {grow.min_light_intensity && grow.max_light_intensity && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Range: {grow.min_light_intensity.toFixed(0)} - {grow.max_light_intensity.toFixed(0)} PPFD
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Details */}
        {(grow.tent_name || grow.notes) && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
              Additional Details
            </h3>

            {grow.tent_name && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Grow Tent
                </div>
                <div style={{ fontSize: '1rem', color: '#f1f5f9' }}>
                  {grow.tent_name}
                </div>
              </div>
            )}

            {grow.notes && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Notes
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#f1f5f9',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '6px',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}>
                  {grow.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(100, 116, 139, 0.2)',
              color: '#cbd5e1',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Close
          </button>
          <button
            onClick={() => onExport(grow)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download className="w-4 h-4" />
            Export Full Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivedTents;

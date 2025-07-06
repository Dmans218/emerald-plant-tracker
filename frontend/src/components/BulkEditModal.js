import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Target, Calendar, TrendingUp, Zap, Play, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const BulkEditModal = ({ isOpen, onClose, selectedTent, onSuccess }) => {
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      stage: '',
      tent: selectedTent || '',
      dateFrom: '',
      dateTo: '',
      onlyEmpty: true,
      temperatureMin: '',
      temperatureMax: ''
    }
  });

  const [stats, setStats] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'smart'

  // Fetch bulk statistics when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBulkStats();
      setValue('tent', selectedTent || '');
    }
  }, [isOpen, selectedTent, setValue]);

  const fetchBulkStats = async () => {
    try {
      const response = await fetch(`/api/environment/bulk-stats${selectedTent ? `?grow_tent=${selectedTent}` : ''}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching bulk stats:', error);
      toast.error('Failed to load bulk statistics');
    }
  };

  const handlePreview = async (data) => {
    setIsLoading(true);
    try {
      const conditions = {
        tent: data.tent || null,
        dateFrom: data.dateFrom || null,
        dateTo: data.dateTo || null,
        onlyEmpty: data.onlyEmpty,
        temperatureMin: data.temperatureMin ? parseFloat(data.temperatureMin) : undefined,
        temperatureMax: data.temperatureMax ? parseFloat(data.temperatureMax) : undefined
      };

      const response = await fetch('/api/environment/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: data.stage,
          conditions,
          dryRun: true
        })
      });

      if (!response.ok) throw new Error('Preview failed');

      const result = await response.json();
      setPreviewResult(result);
      toast.success(`Preview: ${result.wouldUpdate} records would be updated to "${data.stage}"`);
    } catch (error) {
      console.error('Error previewing bulk update:', error);
      toast.error('Failed to preview bulk update');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async (data) => {
    if (!previewResult || previewResult.wouldUpdate === 0) {
      toast.error('Please run a preview first to see what will be updated');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to update ${previewResult.wouldUpdate} records to "${data.stage}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const conditions = {
        tent: data.tent || null,
        dateFrom: data.dateFrom || null,
        dateTo: data.dateTo || null,
        onlyEmpty: data.onlyEmpty,
        temperatureMin: data.temperatureMin ? parseFloat(data.temperatureMin) : undefined,
        temperatureMax: data.temperatureMax ? parseFloat(data.temperatureMax) : undefined
      };

      const response = await fetch('/api/environment/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: data.stage,
          conditions,
          dryRun: false
        })
      });

      if (!response.ok) throw new Error('Bulk update failed');

      const result = await response.json();
      toast.success(`✅ Successfully updated ${result.updated} records to "${data.stage}"`);

      // Refresh stats and reset form
      await fetchBulkStats();
      setPreviewResult(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error performing bulk update:', error);
      toast.error('Failed to perform bulk update');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartAssignment = async () => {
    const confirmed = window.confirm(
      'This will automatically assign growth stages based on chronological patterns.\n\n' +
      'Are you sure you want to proceed with smart assignment?'
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/environment/smart-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grow_tent: selectedTent || null,
          dryRun: false
        })
      });

      if (!response.ok) throw new Error('Smart assignment failed');

      const result = await response.json();
      toast.success('🧠 Smart stage assignment completed successfully!');

      // Refresh stats
      await fetchBulkStats();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error performing smart assignment:', error);
      toast.error('Failed to perform smart assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPreviewResult(null);
    setActiveTab('manual');
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div className="card" style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '2rem',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
              🎯 Bulk Edit Environment Stages
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Update growth stages for multiple environment records efficiently
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            data-testid="bulkedit-close-btn"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Statistics Summary */}
        {stats && (
          <div style={{
            background: 'var(--surface-elevated)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
              📊 Current Data Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {stats.stats.total_logs}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Records</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.stats.logs_with_stage}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>With Stages</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {stats.stats.logs_without_stage}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Need Stages</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                  {stats.stats.tent_count}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Grow Tents</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'manual' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'manual' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Target className="w-4 h-4" />
            Manual Selection
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'smart' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'smart' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <TrendingUp className="w-4 h-4" />
            Smart Assignment
          </button>
        </div>

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmit(handlePreview)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Target Growth Stage *
                </label>
                <select
                  {...register('stage', { required: 'Growth stage is required' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Select Stage to Apply</option>
                  <option value="Seedling">Seedling</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Pre-Flower">Pre-Flower</option>
                  <option value="Flower">Flower</option>
                  <option value="Late Flower">Late Flower</option>
                  <option value="Harvest">Harvest</option>
                  <option value="Drying">Drying</option>
                  <option value="Curing">Curing</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Date From
                </label>
                <input
                  type="date"
                  {...register('dateFrom')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Date To
                </label>
                <input
                  type="date"
                  {...register('dateTo')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Min Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('temperatureMin')}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  placeholder="e.g., 70"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Max Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('temperatureMax')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                  placeholder="e.g., 85"
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  {...register('onlyEmpty')}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  Only update records without existing stages
                </span>
              </label>
            </div>

            {/* Preview Result */}
            {previewResult && (
              <div style={{
                background: previewResult.wouldUpdate > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${previewResult.wouldUpdate > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
                  Preview Result
                </h4>
                <p style={{ color: 'var(--text-primary)', margin: 0 }}>
                  {previewResult.wouldUpdate > 0
                    ? `✅ ${previewResult.wouldUpdate} records would be updated to "${previewResult.stage}"`
                    : '⚠️ No records match the specified conditions'
                  }
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? <div className="loading" style={{ width: '16px', height: '16px' }} /> : <Eye className="w-4 h-4" />}
                Preview Changes
              </button>

              {previewResult && previewResult.wouldUpdate > 0 && (
                <button
                  type="button"
                  onClick={() => handleBulkUpdate(watch())}
                  disabled={isLoading}
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
                  {isLoading ? <div className="loading" style={{ width: '16px', height: '16px' }} /> : <Play className="w-4 h-4" />}
                  Apply Changes
                </button>
              )}
            </div>
          </form>
        )}

        {/* Smart Assignment Tab */}
        {activeTab === 'smart' && (
          <div>
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                🧠 Smart Chronological Assignment
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                This will automatically assign growth stages based on chronological patterns and typical cannabis grow cycles:
              </p>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', margin: 0, lineHeight: '1.6' }}>
                <li><strong>Short periods (≤30 days):</strong> All records assigned to Vegetative</li>
                <li><strong>Medium periods (30-90 days):</strong> 40% Vegetative, 60% Flower</li>
                <li><strong>Long periods (>90 days):</strong> 30% Vegetative, 55% Flower, 15% Late Flower</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSmartAssignment}
                disabled={isLoading}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                {isLoading ? <div className="loading" style={{ width: '20px', height: '20px' }} /> : <Zap className="w-5 h-5" />}
                Run Smart Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEditModal;

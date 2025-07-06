import { AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import '../styles/analytics.css';

/**
 * AnalyticsDashboard Page Component
 * Main page for plant-specific analytics dashboard
 */
const AnalyticsDashboardPage = () => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch plant data
  useEffect(() => {
    const fetchPlantData = async () => {
      if (!plantId) {
        setError('No plant ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/plants/${plantId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Plant not found');
          }
          throw new Error(`Failed to fetch plant data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch plant data');
        }

        setPlantData(data.data);
      } catch (err) {
        console.error('Error fetching plant data:', err);
        setError(err.message);

        if (err.message.includes('not found')) {
          toast.error('Plant not found. Redirecting to plants page...');
          setTimeout(() => navigate('/plants'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [plantId, navigate]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-button"></div>
        </div>
        <div className="page-content">
          <div className="loading-dashboard">
            <Loader className="loading-spinner" size={48} />
            <p>Loading plant analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <Link to="/plants" className="back-link">
            <ArrowLeft size={20} />
            Back to Plants
          </Link>
        </div>
        <div className="page-content">
          <div className="page-error">
            <AlertCircle className="error-icon" size={48} />
            <h2>Unable to Load Analytics</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Retry
              </button>
              <Link to="/plants" className="btn btn-secondary">
                Back to Plants
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plantData) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <Link to="/plants" className="back-link">
            <ArrowLeft size={20} />
            Back to Plants
          </Link>
        </div>
        <div className="page-content">
          <div className="page-error">
            <AlertCircle className="error-icon" size={48} />
            <h2>Plant Data Not Available</h2>
            <p>Unable to load plant information for analytics.</p>
            <Link to="/plants" className="btn btn-primary">
              Back to Plants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Page Header with Navigation */}
      <div className="page-header">
        <div className="header-navigation">
          <Link to="/plants" className="back-link">
            <ArrowLeft size={20} />
            Back to Plants
          </Link>

          <div className="breadcrumb">
            <Link to="/plants" className="breadcrumb-item">Plants</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to={`/plants/${plantId}`} className="breadcrumb-item">
              {plantData.strain || `Plant ${plantId}`}
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Analytics</span>
          </div>
        </div>

        <div className="header-actions">
          <Link
            to={`/plants/${plantId}`}
            className="btn btn-secondary"
          >
            View Plant Details
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard Content */}
      <div className="page-content">
        <AnalyticsDashboard
          plantId={parseInt(plantId)}
          plantData={plantData}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;

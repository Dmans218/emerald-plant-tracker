import { AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PlantAnalyticsDeepDive from '../components/analytics/PlantAnalyticsDeepDive';

/**
 * PlantAnalyticsPage Component
 * Main page for plant-specific analytics dashboard
 */
const PlantAnalyticsPage = () => {
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
      } catch (error) {
        console.error('Error fetching plant data:', error);
        setError(error.message);
        toast.error('Failed to load plant data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [plantId]);

  // Handle navigation back
  const handleBack = () => {
    if (plantData) {
      navigate(`/plants/${plantId}`);
    } else {
      navigate('/plants');
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <div className="header-navigation">
            <button
              className="back-link"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plant
            </button>
          </div>
          <div className="header-title">
            <h1>Plant Analytics</h1>
            <span className="header-subtitle">Loading plant data...</span>
          </div>
        </div>

        <div className="loading-state">
          <Loader className="loading-icon animate-spin" />
          <p>Loading plant analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <div className="header-navigation">
            <button
              className="back-link"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plants
            </button>
          </div>
          <div className="header-title">
            <h1>Plant Analytics</h1>
            <span className="header-subtitle">Error loading data</span>
          </div>
        </div>

        <div className="error-state">
          <AlertCircle className="error-icon" />
          <h3>Unable to Load Plant Data</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBack}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-navigation">
          <Link
            to={`/plants/${plantId}`}
            className="back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {plantData?.name || 'Plant'}
          </Link>
        </div>
        <div className="header-title">
          <h1>Plant Analytics</h1>
          <span className="header-subtitle">
            Advanced cultivation insights for {plantData?.name || `Plant ${plantId}`}
          </span>
        </div>
      </div>

      <div className="page-content">
        <PlantAnalyticsDeepDive
          plantId={parseInt(plantId)}
          plantData={plantData}
        />
      </div>
    </div>
  );
};

export default PlantAnalyticsPage;

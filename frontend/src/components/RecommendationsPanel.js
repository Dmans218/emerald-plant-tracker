import React, { useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Droplets,
  Sun,
  Beaker,
  Wind,
  Leaf,
} from "lucide-react";

const RecommendationsPanel = ({ recommendations = [], loading = false }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "#ef4444";
      case "high":
        return "#f59e0b";
      case "medium":
        return "#3b82f6";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <Info className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "environment":
        return <Thermometer className="w-4 h-4" />;
      case "humidity":
        return <Droplets className="w-4 h-4" />;
      case "lighting":
        return <Sun className="w-4 h-4" />;
      case "nutrients":
        return <Beaker className="w-4 h-4" />;
      case "airflow":
        return <Wind className="w-4 h-4" />;
      case "growth":
        return <Leaf className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: "12px",
              padding: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lightbulb className="w-5 h-5" style={{ color: "#10b981" }} />
          </div>
          <div>
            <h3
              style={{
                color: "var(--text-primary)",
                fontSize: "1.125rem",
                fontWeight: "600",
                margin: 0,
              }}
            >
              🌿 Cultivation Insights
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                margin: 0,
                marginTop: "0.25rem",
              }}
            >
              AI-powered recommendations for optimal growth
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "rgba(100, 116, 139, 0.1)",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                className="loading"
                style={{ width: "24px", height: "24px" }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: "rgba(100, 116, 139, 0.2)",
                    height: "16px",
                    borderRadius: "4px",
                    marginBottom: "0.5rem",
                    width: "70%",
                  }}
                />
                <div
                  style={{
                    background: "rgba(100, 116, 139, 0.1)",
                    height: "12px",
                    borderRadius: "4px",
                    width: "90%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: "12px",
              padding: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lightbulb className="w-5 h-5" style={{ color: "#10b981" }} />
          </div>
          <div>
            <h3
              style={{
                color: "var(--text-primary)",
                fontSize: "1.125rem",
                fontWeight: "600",
                margin: 0,
              }}
            >
              🌿 Cultivation Insights
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                margin: 0,
                marginTop: "0.25rem",
              }}
            >
              AI-powered recommendations for optimal growth
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(100, 116, 139, 0.05)",
            borderRadius: "12px",
            border: "1px dashed rgba(100, 116, 139, 0.2)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <CheckCircle className="w-6 h-6" style={{ color: "#10b981" }} />
          </div>
          <h4
            style={{
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontWeight: "600",
              margin: "0 0 0.5rem",
            }}
          >
            All systems optimal
          </h4>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            Your cultivation environment is performing well. Keep up the great
            work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(16, 185, 129, 0.2)",
            borderRadius: "12px",
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lightbulb className="w-5 h-5" style={{ color: "#10b981" }} />
        </div>
        <div>
          <h3
            style={{
              color: "var(--text-primary)",
              fontSize: "1.125rem",
              fontWeight: "600",
              margin: 0,
            }}
          >
            🌿 Cultivation Insights
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
              marginTop: "0.25rem",
            }}
          >
            {recommendations.length} recommendation
            {recommendations.length !== 1 ? "s" : ""} for optimal growth
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {recommendations.map((recommendation, index) => {
          const isExpanded = expandedItems.has(index);
          const priorityColor = getPriorityColor(recommendation.priority);

          return (
            <div
              key={index}
              style={{
                background: "rgba(30, 41, 59, 0.3)",
                borderRadius: "12px",
                border: `1px solid ${priorityColor}30`,
                padding: "1rem",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => toggleExpanded(index)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${priorityColor}60`;
                e.currentTarget.style.background = "rgba(30, 41, 59, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${priorityColor}30`;
                e.currentTarget.style.background = "rgba(30, 41, 59, 0.3)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    background: `${priorityColor}20`,
                    borderRadius: "8px",
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {recommendation.category
                    ? getCategoryIcon(recommendation.category)
                    : getPriorityIcon(recommendation.priority)}
                  <span style={{ color: priorityColor }}>
                    {recommendation.category
                      ? getCategoryIcon(recommendation.category)
                      : getPriorityIcon(recommendation.priority)}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: priorityColor,
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {recommendation.priority || "info"}
                    </span>
                    {recommendation.category && (
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.75rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {recommendation.category}
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      margin: "0 0 0.5rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {recommendation.title || recommendation.message}
                  </h4>

                  {!isExpanded && recommendation.summary && (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        margin: "0 0 0.5rem",
                        lineHeight: "1.5",
                      }}
                    >
                      {recommendation.summary}
                    </p>
                  )}

                  {isExpanded && (
                    <div style={{ marginTop: "0.75rem" }}>
                      {recommendation.description && (
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.875rem",
                            margin: "0 0 1rem",
                            lineHeight: "1.5",
                          }}
                        >
                          {recommendation.description}
                        </p>
                      )}

                      {recommendation.actions &&
                        recommendation.actions.length > 0 && (
                          <div>
                            <h5
                              style={{
                                color: "var(--text-primary)",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                margin: "0 0 0.5rem",
                              }}
                            >
                              Recommended Actions:
                            </h5>
                            <ul
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.875rem",
                                margin: 0,
                                paddingLeft: "1.25rem",
                                lineHeight: "1.5",
                              }}
                            >
                              {recommendation.actions.map(
                                (action, actionIndex) => (
                                  <li
                                    key={actionIndex}
                                    style={{ marginBottom: "0.25rem" }}
                                  >
                                    {action}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.25rem",
                    flexShrink: 0,
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp
                      className="w-4 h-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-4 h-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPanel;

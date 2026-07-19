/**
 * Program Navigation Component
 * Secondary navigation bar for program pages that shows:
 * - Accepted Papers (enabled, shows all papers from JSON)
 * - Other program sections (disabled)
 */

import React, { useState, useEffect } from "react";
import { fetchAllPapers } from "../utils/paperData";
import type { Paper } from "../types/paper";

interface ProgramNavItem {
  label: string;
  link?: string;
  enabled: boolean;
  children?: Paper[];
}

interface ProgramNavigationProps {
  activeSection?: string;
}

const ProgramNavigation: React.FC<ProgramNavigationProps> = ({
  activeSection = "papers",
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPapersDropdown, setShowPapersDropdown] = useState(false);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const allPapers = await fetchAllPapers();
        setPapers(allPapers);
      } catch (error) {
        console.error("Failed to load papers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, []);

  const navItems: ProgramNavItem[] = [
    {
      label: "Schedule",
      enabled: false,
    },
    {
      label: "All Events",
      enabled: false,
    },
    {
      label: "Accepted Papers",
      link: "/program/papers",
      enabled: true,
      children: papers,
    },
    {
      label: "Posters",
      enabled: false,
    },
    {
      label: "VIS Full Papers",
      enabled: false,
    },
  ];

  return (
    <nav
      className="program-navigation"
      style={{
        backgroundColor: "#f8f9fa",
        borderBottom: "2px solid #dee2e6",
        padding: "0.75rem 0",
        marginBottom: "1.5rem",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {navItems.map((item, index) => (
            <li
              key={index}
              style={{
                position: "relative",
              }}
            >
              {item.enabled ? (
                <>
                  <a
                    href={item.link || "#"}
                    style={{
                      textDecoration: "none",
                      color:
                        activeSection ===
                        item.label.toLowerCase().replace(" ", "-")
                          ? "#0056b3"
                          : "#007bff",
                      fontWeight:
                        activeSection ===
                        item.label.toLowerCase().replace(" ", "-")
                          ? "bold"
                          : "normal",
                      padding: "0.5rem 1rem",
                      display: "block",
                      borderRadius: "0.25rem",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                      if (item.children && item.children.length > 0) {
                        setShowPapersDropdown(true);
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {item.label}
                  </a>

                  {/* Dropdown for papers */}
                  {item.children &&
                    item.children.length > 0 &&
                    showPapersDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          backgroundColor: "white",
                          border: "1px solid #dee2e6",
                          borderRadius: "0.25rem",
                          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                          maxHeight: "400px",
                          overflowY: "auto",
                          minWidth: "300px",
                          zIndex: 1000,
                          marginTop: "0.25rem",
                        }}
                        onMouseEnter={() => setShowPapersDropdown(true)}
                        onMouseLeave={() => setShowPapersDropdown(false)}
                      >
                        {loading ? (
                          <div style={{ padding: "1rem", textAlign: "center" }}>
                            Loading papers...
                          </div>
                        ) : (
                          <ul
                            style={{
                              listStyle: "none",
                              margin: 0,
                              padding: "0.5rem 0",
                            }}
                          >
                            {item.children.slice(0, 50).map((paper) => (
                              <li key={paper.id}>
                                <a
                                  href={`/program/paper/${paper.id}`}
                                  style={{
                                    display: "block",
                                    padding: "0.5rem 1rem",
                                    textDecoration: "none",
                                    color: "#333",
                                    fontSize: "0.875rem",
                                    transition: "background-color 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f8f9fa";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }}
                                >
                                  {paper.title}
                                </a>
                              </li>
                            ))}
                            {item.children.length > 50 && (
                              <li
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.875rem",
                                  color: "#6c757d",
                                }}
                              >
                                ... and {item.children.length - 50} more papers
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                </>
              ) : (
                <span
                  style={{
                    color: "#6c757d",
                    padding: "0.5rem 1rem",
                    display: "block",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ProgramNavigation;

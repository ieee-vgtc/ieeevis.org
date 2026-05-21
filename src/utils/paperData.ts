/**
 * Utility functions for fetching and processing paper data
 */

import { features } from "../config/features";
import type { Paper } from "../types/paper";

/**
 * Fetch all papers from the data source
 */
export async function fetchAllPapers(): Promise<Paper[]> {
  try {
    const response = await fetch(features.weekOfVis.dataSource);
    if (!response.ok) {
      throw new Error(`Failed to fetch papers: ${response.statusText}`);
    }
    const data = await response.json();

    // The JSON is an array of papers directly
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching papers:", error);
    return [];
  }
}

/**
 * Get a specific paper by ID
 */
export async function getPaperById(id: string): Promise<Paper | null> {
  const papers = await fetchAllPapers();
  return papers.find((paper) => paper.id === id) || null;
}

/**
 * Get papers by event prefix (paper type)
 */
export async function getPapersByType(eventPrefix: string): Promise<Paper[]> {
  const papers = await fetchAllPapers();
  return papers.filter((paper) => paper.event_prefix === eventPrefix);
}

/**
 * Get award-winning papers
 */
export async function getAwardPapers(): Promise<Paper[]> {
  const papers = await fetchAllPapers();
  return papers.filter((paper) => paper.award !== null);
}

/**
 * Search papers by keyword
 */
export async function searchPapers(query: string): Promise<Paper[]> {
  const papers = await fetchAllPapers();
  const lowerQuery = query.toLowerCase();

  return papers.filter((paper) => {
    return (
      paper.title.toLowerCase().includes(lowerQuery) ||
      paper.abstract.toLowerCase().includes(lowerQuery) ||
      paper.keywords.some((k) => k.toLowerCase().includes(lowerQuery)) ||
      paper.authors.some((a) => a.name.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get a random paper (useful for "Paper of the Week")
 */
export async function getRandomPaper(): Promise<Paper | null> {
  const papers = await fetchAllPapers();
  if (papers.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * papers.length);
  return papers[randomIndex];
}

/**
 * Get papers for static path generation in Astro
 */
export async function getPaperPaths() {
  const papers = await fetchAllPapers();
  return papers.map((paper) => ({
    params: { id: paper.id },
    props: { paper },
  }));
}

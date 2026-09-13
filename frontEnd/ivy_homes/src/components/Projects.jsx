import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAllPages } from '../api';

export default function Projects() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!token) {
      setProjects([]);
      setVisibleCount(12);
      setError('');
      return;
    }

    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError('');

        const data = await fetchAllPages('/v1/projects');

        const uniqueProjects = Array.from(
          new Map(
            data.map(project => [
              project.project_id,
              project
            ])
          ).values()
        );

        if (!cancelled) {
          setProjects(uniqueProjects);
          setVisibleCount(12);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load projects:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const name = String(
        project.apartment_name || ''
      ).toLowerCase();

      const locality = String(
        project.locality || ''
      ).toLowerCase();

      const status = String(
        project.project_status || ''
      ).toLowerCase();

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(search) ||
        locality.includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const visibleProjects =
    filteredProjects.slice(0, visibleCount);

  const hasMore =
    visibleCount < filteredProjects.length;

  if (!token) {
    return (
      <div
        className="no-results"
        style={{
          textAlign: 'center',
          padding: '4rem'
        }}
      >
        Please <a href="/login">login</a> to browse projects.
      </div>
    );
  }

  return (
    <div
      className="search-manager"
      style={{ padding: '2rem 0' }}
    >
      <div className="search-header">
        <h2>Builder Projects</h2>

        <p>
          {loading
            ? 'Loading projects...'
            : `Showing ${visibleProjects.length} of ${filteredProjects.length} results`}
        </p>
      </div>

      <div
        className="search-controls"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}
      >
        <input
          type="text"
          placeholder="Search project or locality..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setVisibleCount(12);
          }}
          className="filter-input"
        />

        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            setVisibleCount(12);
          }}
          className="filter-select"
        >
          <option value="All">Any Status</option>
          <option value="under construction">
            Under Construction
          </option>
          <option value="ready to move">
            Ready to Move
          </option>
          <option value="new launch">
            New Launch
          </option>
        </select>
      </div>

      {loading && projects.length === 0 && (
        <div className="no-results">
          Loading projects...
        </div>
      )}

      {error && (
        <div className="no-results">
          Failed to load projects: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="property-grid">
            {visibleProjects.length > 0 ? (
              visibleProjects.map(project => (
                <div
                  key={project.project_id}
                  className="property-card"
                >
                  <h3>
                    {project.apartment_name || 'Unnamed Project'}
                  </h3>

                  <p className="property-locality">
                    {project.locality || 'Unknown locality'}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid var(--border-color, #333)',
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Developer
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {project.developer_name || 'Unspecified'}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Status
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {project.project_status || 'Unspecified'}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Price From (API value)
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {project.price_min ?? 'N/A'}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Price To (API value)
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {project.price_max ?? 'N/A'}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Area
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {project.min_area_sqft} - {project.max_area_sqft} sqft
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Units
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {project.total_units || 'Unspecified'}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-color, #333)',
                      fontSize: '0.85rem',
                      opacity: 0.7
                    }}
                  >
                    Project ID: {project.project_id}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No projects match your search criteria.
              </div>
            )}
          </div>

          {hasMore && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <button
                onClick={() =>
                  setVisibleCount(count => count + 12)
                }
                className="accent-btn"
              >
                Load More
              </button>
            </div>
          )}

          {!hasMore && filteredProjects.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                opacity: 0.7
              }}
            >
              All projects loaded.
            </div>
          )}
        </>
      )}
    </div>
  );
}
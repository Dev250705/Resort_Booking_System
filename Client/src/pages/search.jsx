import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./search.css";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);

  // The local text typed into the input box
  const [query, setQuery] = useState(searchParams.get("query") || searchParams.get("location") || "");
  
  // The debounced/actual applied search filtering
  const [appliedQuery, setAppliedQuery] = useState(query);

  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${window.location.hostname}:5000/api/resorts`);
        const data = await response.json();
        setResorts(data);
      } catch (err) {
        console.error("Failed to fetch resorts for search:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResorts();
  }, []);

  // Sync when URL params change externally
  useEffect(() => {
    const urlQuery = searchParams.get("query") || searchParams.get("location") || "";
    setQuery(urlQuery);
    setAppliedQuery(urlQuery);
  }, [searchParams]);

  // Handle typing hit Enter
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedQuery(query);
    setSearchParams({ query }); // Update URL so it's refreshable
  };

  // Filter based on appliedQuery
  const filteredResorts = resorts.filter((resort) => {
    if (!appliedQuery) return true;
    const lowerQ = appliedQuery.toLowerCase();
    return (
      resort.name?.toLowerCase().includes(lowerQ) ||
      resort.location?.city?.toLowerCase().includes(lowerQ) ||
      resort.location?.state?.toLowerCase().includes(lowerQ) ||
      resort.description?.toLowerCase().includes(lowerQ)
    );
  });

  return (
    <>
      <Navbar />
      <main className="search-page">
        <section className="search-header">
          <h1>Find Your Perfect Resort</h1>
          <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search by resort name, city, or state..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <span className="search-input-icon" onClick={handleSearchSubmit}>
              🔍
            </span>
          </form>
        </section>

        <section className="search-results">
          {loading ? (
            <div className="search-loading">Loading amazing locations...</div>
          ) : appliedQuery && filteredResorts.length > 0 ? (
            <div className="search-count">
              Showing {filteredResorts.length} result{filteredResorts.length !== 1 ? 's' : ''} for "{appliedQuery}"
            </div>
          ) : appliedQuery && filteredResorts.length === 0 ? (
            <div className="search-no-results">
              <h2>Not Available</h2>
              <p>We couldn't find any resorts matching "{appliedQuery}". Try checking for typos or searching by another city!</p>
              <button className="search-btn" onClick={() => { setQuery(''); setAppliedQuery(''); setSearchParams({}); }}>
                Clear Search
              </button>
            </div>
          ) : (
             <div className="search-count">
              Showing all {filteredResorts.length} resorts
            </div>
          )}

          {filteredResorts.length > 0 && (
            <div className="search-grid">
              {filteredResorts.map((resort) => {
                const prices = resort.roomTypes?.map(r => r.basePrice) || [];
                const startingPrice = prices.length > 0 ? Math.min(...prices) : null;
                const rawImageUrl = resort.images?.[0];
                const imageUrl = rawImageUrl 
                  ? (rawImageUrl.startsWith('/uploads') ? `http://${window.location.hostname}:5000${rawImageUrl}` : rawImageUrl)
                  : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";

                return (
                  <div className="search-card" key={resort._id}>
                    <div 
                      className="search-card-img"
                      onClick={() => navigate(`/resort/${resort._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={imageUrl} 
                        alt={resort.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      {startingPrice && <div className="search-card-price">From ₹{startingPrice}</div>}
                    </div>
                    <div className="search-card-content">
                      <h3>{resort.name}</h3>
                      <div className="search-stars">
                        {'★'.repeat(Math.max(1, Math.round(resort.rating || 5)))}
                        <span style={{ color: '#eee' }}>
                          {'★'.repeat(5 - Math.max(1, Math.round(resort.rating || 5)))}
                        </span>
                      </div>
                      <div className="search-location">
                        📍 {resort.location?.city}, {resort.location?.state}
                      </div>
                      <div className="search-card-footer">
                        <span>🚪 {resort.roomTypes?.length || 0} Room Types</span>
                        <button className="search-btn" onClick={() => navigate(`/resort/${resort._id}`)}>
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

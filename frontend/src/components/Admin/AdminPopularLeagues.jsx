import React, { useState, useEffect, useCallback } from 'react';
import { useGetPopularLeaguesQuery, useUpdatePopularLeaguesMutation } from '../../services/footballApi';
import { useSearchLeaguesByNameQuery } from '../../services/adminApi';
import debounce from 'lodash.debounce';
import '../../styles/Admin/AdminPopularLeagues.scss';
const AdminPopularLeagues = () => {
    const { data: popularLeaguesData, isLoading: isLoadingPopular, refetch: refetchPopularLeagues } = useGetPopularLeaguesQuery();
    const [updatePopularLeagues, { isLoading: isUpdating, error: updateError, isSuccess: updateSuccess }] = useUpdatePopularLeaguesMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [displayedSearchTerm, setDisplayedSearchTerm] = useState('');
    const { data: searchResults, isLoading: isLoadingSearch, error: searchError, isFetching: isFetchingSearch } = useSearchLeaguesByNameQuery(searchTerm, {
        skip: !searchTerm || searchTerm.length < 3,
    });

    const [selectedLeagueIds, setSelectedLeagueIds] = useState([]);
    const [managedLeagues, setManagedLeagues] = useState([]);

    useEffect(() => {
        if (popularLeaguesData?.competitions) {
            const currentPopularIds = popularLeaguesData.competitions.map(c => c.league.id);
            setSelectedLeagueIds(currentPopularIds);
            setManagedLeagues(popularLeaguesData.competitions.map(c => ({ ...c.league, country_name: c.country.name })));
        }
    }, [popularLeaguesData]);

    const debouncedSearch = useCallback(debounce((value) => {
        setSearchTerm(value);
    }, 500), []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setDisplayedSearchTerm(value);
        if (value.length === 0 || value.length >= 3) {
            debouncedSearch(value);
        }
    };

    const handleAddLeague = (league) => {
        if (!selectedLeagueIds.includes(league.id)) {
            setSelectedLeagueIds(prev => [...prev, league.id]);
            setManagedLeagues(prev => [...prev, { id: league.id, name: league.name, logo: league.logo, country_name: league.country_name }]);
        }
        setSearchTerm('');
        setDisplayedSearchTerm('');
    };

    const handleRemoveLeague = (leagueId) => {
        setSelectedLeagueIds(prev => prev.filter(id => id !== leagueId));
        setManagedLeagues(prev => prev.filter(league => league.id !== leagueId));
    };

    const handleSubmit = async () => {
        try {
            await updatePopularLeagues(selectedLeagueIds).unwrap();
            refetchPopularLeagues();
        } catch (err) {
            console.error('Failed to update popular leagues:', err);
        }
    };

    if (isLoadingPopular) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading popular leagues...</p>
        </div>
    );

    return (
        <div className="admin-section admin-popular-leagues">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h2>Popular Leagues Management</h2>
                    <p className="subtitle">Configure which leagues appear in the popular leagues section</p>
                </div>

                <div className="admin-card-content">
                    <div className="search-section">
                        <div className="search-container">
                            <i className="search-icon">🔍</i>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search for leagues (min 3 characters)..."
                                value={displayedSearchTerm}
                                onChange={handleSearchChange}
                            />
                            {(isLoadingSearch || isFetchingSearch) && <span className="search-spinner"></span>}
                        </div>

                        {searchError && <div className="error-message">Error searching: {searchError.data?.message || searchError.message}</div>}

                        {searchResults && searchTerm.length >= 3 && (
                            <div className="search-results">
                                {searchResults.length === 0 && <p className="no-results">No leagues found for "{searchTerm}"</p>}
                                {searchResults.map(league => (
                                    <div key={league.id} className="search-result-item">
                                        <div className="league-info">
                                            {league.logo && <img src={league.logo} alt={league.name} className="league-logo" />}
                                            <div className="league-details">
                                                <span className="league-name">{league.name}</span>
                                                <span className="league-country">{league.country_name}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddLeague(league)}
                                            disabled={selectedLeagueIds.includes(league.id)}
                                            className={`action-button ${selectedLeagueIds.includes(league.id) ? 'disabled' : 'add'}`}
                                        >
                                            {selectedLeagueIds.includes(league.id) ? 'Added' : 'Add'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="popular-leagues-section">
                        <h3>Current Popular Leagues</h3>
                        {managedLeagues.length === 0 ? (
                            <div className="empty-state">
                                <i className="empty-icon">📋</i>
                                <p>No leagues selected as popular yet</p>
                                <p className="empty-hint">Search and add leagues above to make them popular</p>
                            </div>
                        ) : (
                            <div className="leagues-grid">
                                {managedLeagues.map(league => (
                                    <div key={league.id} className="league-card">
                                        <div className="league-card-content">
                                            {league.logo && <img src={league.logo} alt={league.name} className="league-logo" />}
                                            <div className="league-details">
                                                <span className="league-name">{league.name}</span>
                                                <span className="league-country">{league.country_name}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveLeague(league.id)}
                                            className="remove-button"
                                            title="Remove from popular leagues"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-card-footer">
                    <button
                        onClick={handleSubmit}
                        disabled={isUpdating || isLoadingPopular}
                        className={`primary-button ${isUpdating ? 'loading' : ''}`}
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>

                    {updateError && <div className="error-message">Error: {updateError.data?.message || updateError.message}</div>}
                    {updateSuccess && <div className="success-message">Popular leagues updated successfully!</div>}
                </div>
            </div>
        </div>
    );
};

export default AdminPopularLeagues;
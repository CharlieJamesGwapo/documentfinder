import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';

const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoriteIds = useCallback(async () => {
    try {
      const { data } = await api.get('/favorites/ids');
      setFavoriteIds(new Set(data));
    } catch (error) {
      console.error('Fetch favorites error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await api.get('/favorites');
      setFavorites(data.map((f) => f.Document).filter(Boolean));
    } catch (error) {
      console.error('Fetch full favorites error:', error);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteIds();
    fetchFavorites();
  }, [fetchFavoriteIds, fetchFavorites]);

  const toggleFavorite = useCallback(async (documentId) => {
    try {
      const { data } = await api.post(`/favorites/${documentId}`);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(documentId);
        else next.delete(documentId);
        return next;
      });
      fetchFavorites();
      return data.favorited;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return null;
    }
  }, [fetchFavorites]);

  const isFavorite = useCallback((documentId) => favoriteIds.has(documentId), [favoriteIds]);

  return { favoriteIds, favorites, loading, toggleFavorite, isFavorite, refresh: fetchFavoriteIds };
};

export default useFavorites;

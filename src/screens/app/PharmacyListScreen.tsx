import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { usePharmacies } from '@hooks/usePharmacies';
import { useUserLocation } from '@hooks/useUserLocation';
import { PharmacyCard } from '@components/PharmacyCard';
import { PharmacySearch } from '@components/PharmacySearch';
import { LoadingState } from '@components/LoadingState';
import { EmptyState } from '@components/EmptyState';
import { favoritesService } from '@services/FavoritesService';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { COLORS } from '@constants/app';

export const PharmacyListScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { location, isLoading: loadingLocation } = useUserLocation();
  const { nearby, isLoading, error, searchPharmacies, getPharmaciesNearby } = usePharmacies(location);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [onlyOnDuty, setOnlyOnDuty] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState(nearby);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // Filter pharmacies based on search and filters
  useEffect(() => {
    let filtered = nearby;

    if (searchQuery.length > 0) {
      filtered = filtered.filter((p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.comuna.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (onlyOnDuty) {
      filtered = filtered.filter((p) => p.isOnDutyToday);
    }

    filtered = filtered.filter((p) => (p.distanceKm || 0) <= selectedRadius);

    setFilteredPharmacies(filtered);
  }, [nearby, searchQuery, selectedRadius, onlyOnDuty]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const favs = await favoritesService.getFavorites(user.uid);
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleFavoritePress = async (pharmacyId: string) => {
    if (!user) return;

    try {
      if (favorites.includes(pharmacyId)) {
        await favoritesService.removeFavorite(user.uid, pharmacyId);
        setFavorites(favorites.filter((id) => id !== pharmacyId));
      } else {
        await favoritesService.addFavorite(user.uid, pharmacyId);
        setFavorites([...favorites, pharmacyId]);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  const handlePharmacyPress = (pharmacyId: string) => {
    navigation.navigate('PharmacyDetail', { pharmacyId });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (location) {
        await getPharmaciesNearby(location, selectedRadius);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loadingLocation) {
    return <LoadingState message="Obteniendo tu ubicación..." />;
  }

  if (error && nearby.length === 0) {
    return (
      <EmptyState
        icon="⚠️"
        title="Error al cargar"
        message={error}
        actionText="Reintentar"
        onAction={handleRefresh}
      />
    );
  }

  return (
    <View style={styles.container}>
      <PharmacySearch
        onSearch={setSearchQuery}
        onRadiusChange={setSelectedRadius}
        onOnDutyToggle={setOnlyOnDuty}
        selectedRadius={selectedRadius}
        onlyOnDuty={onlyOnDuty}
        isLoading={isLoading}
      />

      {filteredPharmacies.length === 0 ? (
        <EmptyState
          icon="🏥"
          title="Sin resultados"
          message="No encontramos farmacias que coincidan con tu búsqueda"
          actionText="Limpiar filtros"
          onAction={() => {
            setSearchQuery('');
            setOnlyOnDuty(false);
            setSelectedRadius(5);
          }}
        />
      ) : (
        <FlatList
          data={filteredPharmacies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PharmacyCard
              pharmacy={item}
              onPress={() => handlePharmacyPress(item.id)}
              onFavoritePress={() => handleFavoritePress(item.id)}
              isFavorite={favorites.includes(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  listContent: {
    paddingVertical: 8,
  },
});

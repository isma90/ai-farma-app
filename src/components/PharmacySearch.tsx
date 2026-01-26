import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, PHARMACY_SEARCH_RADIUS_OPTIONS } from '@constants/app';

interface PharmacySearchProps {
  onSearch: (query: string) => void;
  onRadiusChange: (radius: number) => void;
  onOnDutyToggle: (onlyOnDuty: boolean) => void;
  selectedRadius: number;
  onlyOnDuty: boolean;
  isLoading?: boolean;
}

export const PharmacySearch = ({
  onSearch,
  onRadiusChange,
  onOnDutyToggle,
  selectedRadius,
  onlyOnDuty,
  isLoading = false,
}: PharmacySearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    onSearch(text);
  }, [onSearch]);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={COLORS.LIGHT_GRAY}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar farmacia..."
          placeholderTextColor={COLORS.LIGHT_GRAY}
          value={searchQuery}
          onChangeText={handleSearch}
          editable={!isLoading}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearch('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={COLORS.LIGHT_GRAY}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Toggle */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <MaterialCommunityIcons
          name="tune"
          size={20}
          color={showFilters ? COLORS.PRIMARY : COLORS.LIGHT_GRAY}
        />
        <Text style={[
          styles.filterToggleText,
          { color: showFilters ? COLORS.PRIMARY : COLORS.LIGHT_GRAY }
        ]}>
          Filtros
        </Text>
      </TouchableOpacity>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Radius Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Radio de búsqueda</Text>
            <View style={styles.radiusOptions}>
              {PHARMACY_SEARCH_RADIUS_OPTIONS.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    selectedRadius === radius && styles.radiusButtonActive,
                  ]}
                  onPress={() => onRadiusChange(radius)}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      selectedRadius === radius && styles.radiusButtonTextActive,
                    ]}
                  >
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* On-Duty Filter */}
          <View style={styles.filterGroup}>
            <TouchableOpacity
              style={styles.onDutyToggle}
              onPress={() => onOnDutyToggle(!onlyOnDuty)}
            >
              <View
                style={[
                  styles.checkbox,
                  onlyOnDuty && styles.checkboxChecked,
                ]}
              >
                {onlyOnDuty && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color={COLORS.WHITE}
                  />
                )}
              </View>
              <Text style={styles.onDutyLabel}>Solo farmacias de turno</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterToggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_GRAY,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MEDIUM_GRAY,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radiusButton: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  radiusButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  radiusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.MEDIUM_GRAY,
  },
  radiusButtonTextActive: {
    color: COLORS.WHITE,
  },
  onDutyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  onDutyLabel: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    fontWeight: '500',
  },
});

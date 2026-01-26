import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IPharmacy } from '@types/index';
import { formatDistance, formatETA, calculateETA } from '@utils/distanceUtils';
import { COLORS } from '@constants/app';

interface PharmacyCardProps {
  pharmacy: IPharmacy;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  showDistance?: boolean;
}

export const PharmacyCard = ({
  pharmacy,
  onPress,
  onFavoritePress,
  isFavorite = false,
  showDistance = true,
}: PharmacyCardProps) => {
  const eta = pharmacy.distanceKm
    ? calculateETA(pharmacy.distanceKm)
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {pharmacy.nombre}
          </Text>
          {pharmacy.isOnDutyToday && (
            <View style={styles.onDutyBadge}>
              <Text style={styles.onDutyText}>De turno</Text>
            </View>
          )}
        </View>

        <Text style={styles.address} numberOfLines={1}>
          📍 {pharmacy.direccion}
        </Text>

        <Text style={styles.commune}>
          {pharmacy.comuna}, {pharmacy.region}
        </Text>

        {showDistance && pharmacy.distanceKm !== undefined && (
          <View style={styles.distanceRow}>
            <Text style={styles.distance}>
              {formatDistance(pharmacy.distanceKm)}
            </Text>
            <Text style={styles.eta}>
              ~{formatETA(eta)}
            </Text>
          </View>
        )}

        {pharmacy.telefono && (
          <Text style={styles.phone}>
            📞 {pharmacy.telefono}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onFavoritePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? COLORS.ERROR : COLORS.LIGHT_GRAY}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
    flex: 1,
  },
  onDutyBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  onDutyText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  address: {
    fontSize: 13,
    color: COLORS.MEDIUM_GRAY,
    marginBottom: 4,
  },
  commune: {
    fontSize: 12,
    color: COLORS.LIGHT_GRAY,
    marginBottom: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginRight: 12,
  },
  eta: {
    fontSize: 12,
    color: COLORS.MEDIUM_GRAY,
  },
  phone: {
    fontSize: 12,
    color: COLORS.LIGHT_GRAY,
  },
  favoriteButton: {
    padding: 8,
  },
});

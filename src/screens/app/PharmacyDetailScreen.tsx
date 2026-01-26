import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pharmacyService } from '@services/PharmacyService';
import { favoritesService } from '@services/FavoritesService';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { LoadingState } from '@components/LoadingState';
import { EmptyState } from '@components/EmptyState';
import { IPharmacy } from '@types/index';
import { formatDistance, calculateETA, formatETA } from '@utils/distanceUtils';
import { COLORS } from '@constants/app';

interface PharmacyDetailScreenProps {
  route: any;
  navigation: any;
}

export const PharmacyDetailScreen = ({ route, navigation }: PharmacyDetailScreenProps) => {
  const { pharmacyId } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  const { location } = useSelector((state: RootState) => state.auth);

  const [pharmacy, setPharmacy] = useState<IPharmacy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadPharmacy();
  }, [pharmacyId]);

  useEffect(() => {
    if (user && pharmacy) {
      checkFavorite();
    }
  }, [user, pharmacy]);

  const loadPharmacy = async () => {
    try {
      setIsLoading(true);
      const pharma = await pharmacyService.getPharmacyById(pharmacyId);
      if (pharma) {
        setPharmacy(pharma);
      }
    } catch (error) {
      console.error('Failed to load pharmacy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !pharmacy) return;
    try {
      const fav = await favoritesService.isFavorite(user.uid, pharmacy.id);
      setIsFavorite(fav);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const handleFavoritePress = async () => {
    if (!user || !pharmacy) return;
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(user.uid, pharmacy.id);
      } else {
        await favoritesService.addFavorite(user.uid, pharmacy.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  const handleCall = () => {
    if (!pharmacy?.telefono) return;
    const phoneNumber = `tel:${pharmacy.telefono.replace(/\s/g, '')}`;
    Linking.openURL(phoneNumber).catch(() => {
      console.error('Failed to open phone dialer');
    });
  };

  const handleOpenMap = () => {
    if (!pharmacy) return;

    const url =
      Platform.OS === 'ios'
        ? `maps://maps.apple.com/?q=${pharmacy.nombre}&address=${pharmacy.direccion}`
        : `geo:${pharmacy.latitud},${pharmacy.longitud}?q=${pharmacy.nombre}`;

    Linking.openURL(url).catch(() => {
      console.error('Failed to open maps');
    });
  };

  const handleShare = async () => {
    if (!pharmacy) return;

    try {
      await Share.share({
        message: `${pharmacy.nombre}\n${pharmacy.direccion}\n${pharmacy.comuna}, ${pharmacy.region}\n📞 ${pharmacy.telefono}`,
        title: pharmacy.nombre,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando detalles..." />;
  }

  if (!pharmacy) {
    return (
      <EmptyState
        icon="❌"
        title="No encontrada"
        message="La farmacia no pudo ser cargada"
        actionText="Volver"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const eta = pharmacy.distanceKm ? calculateETA(pharmacy.distanceKm) : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{pharmacy.nombre}</Text>
          {pharmacy.isOnDutyToday && (
            <View style={styles.onDutyBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.WHITE} />
              <Text style={styles.onDutyText}>De turno hoy</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? COLORS.ERROR : COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación</Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.PRIMARY} />
          <View style={styles.infoContent}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{pharmacy.direccion}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map" size={20} color={COLORS.PRIMARY} />
          <View style={styles.infoContent}>
            <Text style={styles.label}>Comuna</Text>
            <Text style={styles.value}>
              {pharmacy.comuna}, {pharmacy.region}
            </Text>
          </View>
        </View>

        {pharmacy.distanceKm !== undefined && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="navigation" size={20} color={COLORS.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Distancia y tiempo</Text>
              <Text style={styles.value}>
                {formatDistance(pharmacy.distanceKm)} • ~{formatETA(eta)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Contact Info */}
      {pharmacy.telefono && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{pharmacy.telefono}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
          >
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.WHITE} />
            <Text style={styles.callButtonText}>Llamar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hours */}
      {pharmacy.horario && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock" size={20} color={COLORS.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.value}>{pharmacy.horario}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Services */}
      {pharmacy.servicios && pharmacy.servicios.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>

          <View style={styles.servicesList}>
            {pharmacy.servicios.map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.mapButton]}
          onPress={handleOpenMap}
        >
          <MaterialCommunityIcons name="directions" size={24} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>Ir al mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
    marginBottom: 8,
  },
  onDutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  onDutyText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.LIGHT_GRAY,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: COLORS.SUCCESS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  callButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: COLORS.MEDIUM_GRAY,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  shareButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

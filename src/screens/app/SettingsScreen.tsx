import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { setTheme, setLocale } from '@redux/slices/appSlice';
import { clearUser } from '@redux/slices/authSlice';
import { authService } from '@services/AuthService';

export const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { theme, locale } = useSelector((state: RootState) => state.app);
  const { user } = useSelector((state: RootState) => state.auth);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await authService.deleteAccount(user.uid);
      dispatch(clearUser());
    } catch (error) {
      console.error('Delete account failed:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Usuario</Text>
          <Text style={styles.value}>{user?.displayName || 'Usuario Anónimo'}</Text>
        </View>
        {user?.email && (
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.label}>Tema</Text>
            <TouchableOpacity
              style={[styles.themeButton, theme === 'light' && styles.themeButtonActive]}
              onPress={() => dispatch(setTheme('light'))}
            >
              <Text>☀️ Claro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, theme === 'dark' && styles.themeButtonActive]}
              onPress={() => dispatch(setTheme('dark'))}
            >
              <Text>🌙 Oscuro</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.label}>Idioma</Text>
            <TouchableOpacity
              style={[styles.langButton, locale === 'es' && styles.langButtonActive]}
              onPress={() => dispatch(setLocale('es'))}
            >
              <Text>ES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langButton, locale === 'en' && styles.langButtonActive]}
              onPress={() => dispatch(setLocale('en'))}
            >
              <Text>EN</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.label}>Notificaciones</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <Text style={styles.dangerButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  themeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  themeButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  langButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
  },
  langButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  version: {
    color: '#999',
    fontSize: 12,
  },
});

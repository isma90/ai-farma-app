import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { setAnonymousUser } from '@redux/slices/authSlice';
import { authService } from '@services/AuthService';

export const WelcomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();

  const handleAnonymousSignIn = async () => {
    try {
      const user = await authService.signInAnonymously();
      dispatch(setAnonymousUser(user));
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Farma</Text>
      <Text style={styles.subtitle}>Tu asistente farmacéutico inteligente</Text>

      <TouchableOpacity style={styles.button} onPress={handleAnonymousSignIn}>
        <Text style={styles.buttonText}>Continuar sin registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.secondaryButtonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

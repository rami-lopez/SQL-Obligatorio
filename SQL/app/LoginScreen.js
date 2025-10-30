import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoverMode, setRecoverMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email === 'lucia@ejemplo.com' && password === '12345') {
        Alert.alert('Bienvenida', 'Inicio de sesión exitoso');
      } else {
        Alert.alert('Error', 'Correo o contraseña incorrectos');
      }
    }, 1500);
  };

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo para recuperar la contraseña');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Recuperación enviada', `Se envió un correo a ${email}`);
      setRecoverMode(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>S</Text>
          </View>
          <Text style={styles.title}>{recoverMode ? 'Recuperar contraseña' : 'Iniciar sesión'}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor="#9aa0a6"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, styles.textInput]}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel="Correo electrónico"
          />
        </View>

        {!recoverMode && (
          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9aa0a6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, styles.textInput]}
              textContentType="password"
              accessibilityLabel="Contraseña"
            />
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
        ) : (
          <>
            <TouchableOpacity
              onPress={recoverMode ? handlePasswordReset : handleLogin}
              style={[styles.button, styles.primaryButton]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={recoverMode ? 'Enviar correo' : 'Ingresar'}
            >
              <Text style={styles.buttonText}>{recoverMode ? 'Enviar correo' : 'Ingresar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRecoverMode(!recoverMode)} style={styles.centerLink}>
              <Text style={styles.link}>
                {recoverMode ? '← Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.footer}>© 2025 TuApp - Todos los derechos reservados</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#eef2f3',
  },
  card: {
    borderRadius: 16,
    padding: 22,
    elevation: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    marginHorizontal: 10,
    // make the card narrower on wide screens
    maxWidth: 480,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoLetter: {
    color: '#1a73e8',
    fontSize: 22,
    fontWeight: '800',
  },
  input: {
    marginBottom: 15,
  },
  field: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#5f6b72',
    marginBottom: 6,
    fontWeight: '600',
  },
  button: {
    borderRadius: 10,
    marginTop: 5,
    paddingVertical: 5,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  textInput: {
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  centerLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
    fontSize: 12,
  },
});

